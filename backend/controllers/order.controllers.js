import DeliveryAssignment from "../models/deliveryAssignment.model.js";
import Order from "../models/order.model.js";
import Shop from "../models/shop.model.js";
import User from "../models/user.model.js";
import { sendDeliveryOtpMail } from "../utils/mailer.js";
import RazorPay from "razorpay";
import dotenv from "dotenv";

dotenv.config();

export const placeOrder = async (req, res) => {
  try {
    const { cartItems, paymentMethod, deliveryAddress, totalAmount } = req.body;

    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: "cart is empty" });
    }

    if (!deliveryAddress?.text || !deliveryAddress?.latitude || !deliveryAddress?.longitude) {
      return res.status(400).json({ message: "send complete deliveryAddress" });
    }

    const groupItemsByShop = {};

    cartItems.forEach(item => {
      const shopId = typeof item.shop === "object" ? item.shop._id : item.shop;

      if (!groupItemsByShop[shopId]) {
        groupItemsByShop[shopId] = [];
      }
      groupItemsByShop[shopId].push(item);
    });

    const shopOrders = await Promise.all(
      Object.keys(groupItemsByShop).map(async (shopId) => {
        const shop = await Shop.findById(shopId).populate("owner");
        if (!shop) throw new Error("shop not found");

        const items = groupItemsByShop[shopId];
        const subtotal = items.reduce(
          (sum, i) => sum + Number(i.price) * Number(i.quantity),
          0
        );

        return {
          shop: shop._id,
          owner: shop.owner._id,
          subtotal,
          shopOrderItems: items.map(i => ({
            item: i._id,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
            image: i.image
          }))
        };
      })
    );

    if (paymentMethod === "cod") {
      const order = await Order.create({
        user: req.userId,
        paymentMethod,
        deliveryAddress,
        totalAmount,
        shopOrders
      });
      return res.status(201).json(order);
    } else {
      const razorpay = new RazorPay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
      });

      const options = {
        amount: Number(totalAmount) * 100,
        currency: "INR",
        receipt: `receipt_${Date.now()}`
      };

      const razorOrder = await razorpay.orders.create(options);

      const order = await Order.create({
        user: req.userId,
        paymentMethod,
        deliveryAddress,
        totalAmount,
        shopOrders,
        razorpayOrderId: razorOrder.id
      });

      return res.status(201).json({
        orderId: order._id,
        razorOrder
      });
    }

  } catch (error) {
    console.error("PLACE ORDER ERROR:", error);
    return res.status(500).json({ message: `place order error ${error.message}` });
  }
};


/* ================= VERIFY PAYMENT ================= */
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_payment_id, orderId } = req.body;

    const razorpay = new RazorPay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });

    const payment = await razorpay.payments.fetch(razorpay_payment_id);
    if (!payment || payment.status !== "captured") {
      return res.status(400).json({ message: "payment not captured" });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(400).json({ message: "order not found" });

    order.payment = true;
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();

    return res.status(200).json(order);
  } catch (error) {
    return res.status(500).json({ message: `verify payment error ${error.message}` });
  }
};

/* ================= GET MY ORDERS ================= */
export const getMyOrders = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    /* ===== CUSTOMER ===== */
    if (user.role === "user") {
      const orders = await Order.find({ user: req.userId })
        .sort({ createdAt: -1 })
        .populate("shopOrders.shop", "name")
        .populate("shopOrders.owner", "fullName mobile")
        .populate("shopOrders.shopOrderItems.item", "name image price");

      return res.status(200).json(orders);
    }

    /* ===== OWNER ===== */
    if (user.role === "owner") {
      const orders = await Order.find({ "shopOrders.owner": req.userId })
        .sort({ createdAt: -1 })
        .populate("user", "fullName mobile")
        .populate("shopOrders.shop", "name")
        .populate("shopOrders.shopOrderItems.item", "name image price")
        .populate("shopOrders.assignedDeliveryBoy", "fullName mobile");

      const filtered = orders.map(order => ({
        _id: order._id,
        paymentMethod: order.paymentMethod,
        user: order.user,
        shopOrders: order.shopOrders.filter(
          so => so.owner.toString() === req.userId.toString()
        ),
        deliveryAddress: order.deliveryAddress,
        payment: order.payment,
        createdAt: order.createdAt
      }));

      return res.status(200).json(filtered);
    }

    return res.status(403).json({ message: "Unauthorized role" });
  } catch (error) {
    return res.status(500).json({ message: `get orders error ${error.message}` });
  }
};
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, shopId } = req.params
    const { status } = req.body

    const order = await Order.findById(orderId)
      .populate("user", "socketId")
      .populate("shopOrders.shop", "name")
      .populate("shopOrders.assignedDeliveryBoy", "fullName email mobile")

    if (!order) {
      return res.status(400).json({ message: "order not found" })
    }

    // ✅ ObjectId safe comparison
    const shopOrder = order.shopOrders.find(
      so => so.shop._id.toString() === shopId.toString()
    )

    if (!shopOrder) {
      return res.status(400).json({ message: "shop order not found" })
    }

    shopOrder.status = status
    let deliveryBoysPayload = []

    /* ================= ASSIGN DELIVERY BOY ================= */
    if (status === "out of delivery" && !shopOrder.assignment) {
      const { longitude, latitude } = order.deliveryAddress

      const nearByDeliveryBoys = await User.find({
        role: "deliveryBoy",
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [Number(longitude), Number(latitude)]
            },
            $maxDistance: 5000
          }
        }
      })

      const nearByIds = nearByDeliveryBoys.map(b => b._id)

      const busyIds = await DeliveryAssignment.find({
        assignedTo: { $in: nearByIds },
        status: { $nin: ["brodcasted", "completed"] }
      }).distinct("assignedTo")

      const busySet = new Set(busyIds.map(id => id.toString()))

      const availableBoys = nearByDeliveryBoys.filter(
        b => !busySet.has(b._id.toString())
      )

      if (availableBoys.length === 0) {
        await order.save()
        return res.json({
          message: "order status updated but no delivery boys available"
        })
      }

      const candidates = availableBoys.map(b => b._id)

      const assignment = await DeliveryAssignment.create({
        order: order._id,
        shop: shopOrder.shop,
        shopOrderId: shopOrder._id,
        brodcastedTo: candidates,
        status: "brodcasted"
      })

      // ✅ IMPORTANT FIX
      shopOrder.assignment = assignment._id
      shopOrder.assignedDeliveryBoy = null

      deliveryBoysPayload = availableBoys.map(b => ({
        id: b._id,
        fullName: b.fullName,
        latitude: b.location.coordinates?.[1],
        longitude: b.location.coordinates?.[0],
        mobile: b.mobile
      }))

      const io = req.app.get("io")
      if (io) {
        availableBoys.forEach(boy => {
          if (boy.socketId) {
            io.to(boy.socketId).emit("newAssignment", {
              assignmentId: assignment._id,
              orderId: order._id,
              shopName: shopOrder.shop.name,
              deliveryAddress: order.deliveryAddress,
              items: shopOrder.shopOrderItems,
              subtotal: shopOrder.subtotal
            })
          }
        })
      }
    }

    await order.save()

    /* ================= USER SOCKET UPDATE ================= */
    const io = req.app.get("io")
    if (io && order.user?.socketId) {
      io.to(order.user.socketId).emit("update-status", {
        orderId: order._id,
        shopId: shopOrder.shop._id,
        status: shopOrder.status
      })
    }

    return res.status(200).json({
      shopOrder,
      assignedDeliveryBoy: shopOrder.assignedDeliveryBoy,
      availableBoys: deliveryBoysPayload,
      assignment: shopOrder.assignment
    })

  } catch (error) {
    return res.status(500).json({
      message: `order status error ${error.message}`
    })
  }
}

export const getDeliveryBoyAssignment = async (req, res) => {
  try {
    const deliveryBoyId = req.userId

    const assignments = await DeliveryAssignment.find({
      brodcastedTo: deliveryBoyId,
      status: "brodcasted"
    })
      .populate("order")
      .populate("shop")

    const formatted = assignments.map(a => {
      const shopOrder = a.order.shopOrders.find(
        so => so._id.toString() === a.shopOrderId.toString()
      )

      return {
        assignmentId: a._id,
        orderId: a.order._id,
        shopName: a.shop.name,
        deliveryAddress: a.order.deliveryAddress,
        items: shopOrder?.shopOrderItems || [],
        subtotal: shopOrder?.subtotal || 0
      }
    })

    return res.status(200).json(formatted)
  } catch (error) {
    return res.status(500).json({
      message: `get assignment error ${error.message}`
    })
  }
}


export const acceptOrder = async (req, res) => {
  try {
    const { assignmentId } = req.params

    const assignment = await DeliveryAssignment.findById(assignmentId)
    if (!assignment) {
      return res.status(400).json({ message: "assignment not found" })
    }

    if (assignment.status !== "brodcasted") {
      return res.status(400).json({ message: "assignment expired" })
    }

    // ✅ already busy check
    const alreadyAssigned = await DeliveryAssignment.findOne({
      assignedTo: req.userId,
      status: { $in: ["assigned"] }
    })

    if (alreadyAssigned) {
      return res.status(400).json({
        message: "You already have an active delivery"
      })
    }

    // ✅ assign delivery boy
    assignment.assignedTo = req.userId
    assignment.status = "assigned"
    assignment.acceptedAt = new Date()
    await assignment.save()

    // ✅ update order
    const order = await Order.findById(assignment.order)
    if (!order) {
      return res.status(400).json({ message: "order not found" })
    }

    const shopOrder = order.shopOrders.id(assignment.shopOrderId)
    if (!shopOrder) {
      return res.status(400).json({ message: "shopOrder not found" })
    }

    shopOrder.assignedDeliveryBoy = req.userId
    await order.save()

    return res.status(200).json({ message: "order accepted successfully" })
  } catch (error) {
    return res.status(500).json({
      message: `accept order error ${error.message}`
    })
  }
}

export const getCurrentOrder = async (req, res) => {
  try {
    const assignment = await DeliveryAssignment.findOne({
      assignedTo: req.userId,
      status: "assigned"
    })
      .populate("shop", "name")
      .populate("assignedTo", "fullName email mobile location")
      .populate({
        path: "order",
        populate: {
          path: "user",
          select: "fullName email mobile location"
        }
      })

    if (!assignment || !assignment.order) {
      return res.status(400).json({ message: "active order not found" })
    }

    const shopOrder = assignment.order.shopOrders.find(
      so => so._id.toString() === assignment.shopOrderId.toString()
    )

    if (!shopOrder) {
      return res.status(400).json({ message: "shopOrder not found" })
    }

    const deliveryBoyLocation = {
      lat: assignment.assignedTo.location?.coordinates?.[1] || null,
      lon: assignment.assignedTo.location?.coordinates?.[0] || null
    }

    const customerLocation = {
      lat: assignment.order.deliveryAddress?.latitude || null,
      lon: assignment.order.deliveryAddress?.longitude || null
    }

    return res.status(200).json({
      _id: assignment.order._id,
      user: assignment.order.user,
      shopOrder,
      deliveryAddress: assignment.order.deliveryAddress,
      deliveryBoyLocation,
      customerLocation
    })
  } catch (error) {
    return res.status(500).json({
      message: `get current order error ${error.message}`
    })
  }
}


export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params

    const order = await Order.findById(orderId)
      .populate("user")
      .populate("shopOrders.shop")
      .populate("shopOrders.assignedDeliveryBoy")
      .populate("shopOrders.shopOrderItems.item")

    if (!order) {
      return res.status(400).json({ message: "order not found" })
    }

    return res.status(200).json(order)
  } catch (error) {
    return res.status(500).json({
      message: `get order by id error ${error.message}`
    })
  }
}


export const sendDeliveryOtp = async (req, res) => {
  try {
    const { orderId, shopOrderId } = req.body

    const order = await Order.findById(orderId).populate("user")
    if (!order) {
      return res.status(400).json({ message: "order not found" })
    }

    const shopOrder = order.shopOrders.id(shopOrderId)
    if (!shopOrder) {
      return res.status(400).json({ message: "shopOrder not found" })
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString()
    shopOrder.deliveryOtp = otp
    shopOrder.otpExpires = Date.now() + 5 * 60 * 1000

    await order.save()
    await sendDeliveryOtpMail(order.user, otp)

    return res.status(200).json({ message: "OTP sent successfully" })
  } catch (error) {
    return res.status(500).json({
      message: `send otp error ${error.message}`
    })
  }
}


export const verifyDeliveryOtp = async (req, res) => {
  try {
    const { orderId, shopOrderId, otp } = req.body

    const order = await Order.findById(orderId)
    if (!order) {
      return res.status(400).json({ message: "order not found" })
    }

    const shopOrder = order.shopOrders.id(shopOrderId)
    if (
      !shopOrder ||
      shopOrder.deliveryOtp !== otp ||
      shopOrder.otpExpires < Date.now()
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP" })
    }

    shopOrder.status = "delivered"
    shopOrder.deliveredAt = new Date()
    shopOrder.deliveryOtp = null
    shopOrder.otpExpires = null

    await order.save()

    await DeliveryAssignment.deleteOne({
      shopOrderId: shopOrder._id,
      order: order._id
    })

    return res.status(200).json({
      message: "Order delivered successfully"
    })
  } catch (error) {
    return res.status(500).json({
      message: `verify otp error ${error.message}`
    })
  }
}

/* ================= CANCEL ORDER ================= */
export const cancelOrder = async (req, res) => {
  try {
    const { orderId, shopId } = req.body;

    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const shopOrder = order.shopOrders.find(
      so => so.shop.toString() === shopId
    );

    if (!shopOrder) {
      return res.status(404).json({ message: "Shop order not found" });
    }

    // Allow Customer OR Shop Owner to cancel
    const isCustomer = order.user.toString() === req.userId.toString();
    const isOwner = shopOrder.owner && shopOrder.owner.toString() === req.userId.toString();

    if (!isCustomer && !isOwner) {
      return res.status(403).json({ message: "You are not authorized to cancel this order" });
    }

    if (["shipped", "out of delivery", "delivered", "cancelled"].includes(shopOrder.status)) {
      return res.status(400).json({ message: "Order cannot be cancelled at this stage" });
    }

    shopOrder.status = "cancelled";
    await order.save();

    return res.status(200).json({ message: "Order cancelled successfully" });
  } catch (error) {
    return res.status(500).json({ message: `Cancel order error ${error.message}` });
  }
};

export const getTodayDeliveries = async (req, res) => {
  try {
    const deliveryBoyId = req.userId
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)

    const orders = await Order.find({
      "shopOrders.assignedDeliveryBoy": deliveryBoyId,
      "shopOrders.status": "delivered",
      "shopOrders.deliveredAt": { $gte: startOfDay }
    })

    const stats = {}

    orders.forEach(order => {
      order.shopOrders.forEach(so => {
        if (
          so.assignedDeliveryBoy?.toString() === deliveryBoyId.toString() &&
          so.deliveredAt
        ) {
          const hour = new Date(so.deliveredAt).getHours()
          stats[hour] = (stats[hour] || 0) + 1
        }
      })
    })

    const result = Object.keys(stats)
      .map(h => ({ hour: Number(h), count: stats[h] }))
      .sort((a, b) => a.hour - b.hour)

    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({
      message: `today deliveries error ${error.message}`
    })
  }
}
