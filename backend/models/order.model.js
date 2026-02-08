import mongoose from "mongoose";

/* ================= SHOP ORDER ITEM ================= */
const shopOrderItemSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },
    name: String,
    price: Number,
    quantity: Number,
  },
  { timestamps: true }
);

/* ================= SHOP ORDER ================= */
const shopOrderSchema = new mongoose.Schema(
  {
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },

    // ✅ FIX: Owner is also User
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    subtotal: Number,

    shopOrderItems: [shopOrderItemSchema],

    status: {
      type: String,
      enum: ["pending", "preparing", "out of delivery", "delivered","cancelled"],
      default: "pending",
    },

    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeliveryAssignment",
      default: null,
    },

    // ✅ FIX: Delivery boy is also User
    assignedDeliveryBoy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    deliveryOtp: {
      type: String,
      default: null,
    },

    otpExpires: {
      type: Date,
      default: null,
    },

    deliveredAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

/* ================= MAIN ORDER ================= */
const orderSchema = new mongoose.Schema(
  {
    // ✅ FIX: Customer is also User
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    paymentMethod: {
      type: String,
      enum: ["cod", "online"],
      required: true,
    },

    deliveryAddress: {
      text: String,
      latitude: Number,
      longitude: Number,
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    shopOrders: [shopOrderSchema],

    payment: {
      type: Boolean,
      default: false,
    },

    razorpayOrderId: {
      type: String,
      default: "",
    },

    razorpayPaymentId: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
