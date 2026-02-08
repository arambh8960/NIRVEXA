import uploadOnCloudinary from "../utils/cloudinary.js";
import Shop from "../models/shop.model.js";

/* ================= CREATE / EDIT SHOP ================= */
export const createEditShop = async (req, res) => {
  try {
    const { name, address, city, state } = req.body;

    // 🔒 only owner allowed
    if (req.user.role !== "owner") {
      return res.status(403).json({ message: "Only owner can create shop" });
    }

    let image;

    if (req.file) {
      image = await uploadOnCloudinary(req.file.path);
    }

    let shop = await Shop.findOne({ owner: req.userId });

    if (!shop) {
      // ➕ CREATE
      shop = await Shop.create({
        name,
        address,
        city,
        state,
        image,
        owner: req.userId
      });
    } else {
      // ✏️ EDIT
      shop.name = name ?? shop.name;
      shop.address = address ?? shop.address;
      shop.city = city ?? shop.city;
      shop.state = state ?? shop.state;

      if (image) {
        shop.image = image; // ✅ only update if new image
      }

      await shop.save();
    }

    await shop.populate("owner");
    await shop.populate({
      path: "items",
      options: { sort: { updatedAt: -1 } }
    });

    return res.status(200).json(shop);
  } catch (error) {
    return res.status(500).json({
      message: `create/edit shop error ${error.message}`
    });
  }
};


export const getMyShop = async (req, res) => {
  try {
    const shop = await Shop.findOne({ owner: req.userId })
      .populate("owner")
      .populate({
        path: "items",
        options: { sort: { updatedAt: -1 } }
      });

    // ❗ frontend expects null if no shop
    if (!shop) {
      return res.status(200).json(null);
    }

    return res.status(200).json(shop);
  } catch (error) {
    return res.status(500).json({
      message: `get my shop error ${error.message}`
    });
  }
};


export const getShopByCity = async (req, res) => {
  try {
    const { city } = req.params;

    if (!city) {
      return res.status(400).json({ message: "City is required" });
    }

    const shops = await Shop.find({
      city: { $regex: new RegExp(city, "i") }
    }).populate("items");

    // ❗ Mongo returns array always
    return res.status(200).json(shops);
  } catch (error) {
    return res.status(500).json({
      message: `get shop by city error ${error.message}`
    });
  }
};
