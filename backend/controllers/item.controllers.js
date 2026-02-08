import uploadOnCloudinary from "../utils/cloudinary.js";
import Shop from "../models/shop.model.js";
import Item from "../models/item.model.js";

/* ================= ADD ITEM ================= */
export const addItem = async (req, res) => {
  try {
    const { name, price, category, unitType } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Image file is required" });
    }

    const shop = await Shop.findOne({ owner: req.userId });
    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }

    const image = await uploadOnCloudinary(req.file.path);
    if (!image) {
      return res.status(500).json({ message: "Image upload failed" });
    }

    const item = await Item.create({
      name,
      price,
      category,
      unitType,
      image,
      shop: shop._id
    });

    shop.items.push(item._id);
    await shop.save();

    await shop.populate({
      path: "items",
      options: { sort: { updatedAt: -1 } }
    });

    return res.status(201).json(shop);
  } catch (error) {
    return res.status(500).json({
      message: `add item error ${error.message}`
    });
  }
};

export const editItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { name, price, category, unitType } = req.body;

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    const shop = await Shop.findOne({
      _id: item.shop,
      owner: req.userId
    });

    if (!shop) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (req.file) {
      item.image = await uploadOnCloudinary(req.file.path);
    }

    item.name = name ?? item.name;
    item.price = price ?? item.price;
    item.category = category ?? item.category;
    item.unitType = unitType ?? item.unitType;

    await item.save();

    await shop.populate({
      path: "items",
      options: { sort: { updatedAt: -1 } }
    });

    return res.status(200).json(shop);
  } catch (error) {
    return res.status(500).json({
      message: `edit item error ${error.message}`
    });
  }
};

export const getItemById = async (req, res) => {
  try {
    const { itemId } = req.params;

    const item = await Item.findById(itemId).populate("shop");
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    return res.status(200).json(item);
  } catch (error) {
    return res.status(500).json({
      message: `get item error ${error.message}`
    });
  }
};

export const deleteItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    const shop = await Shop.findOne({
      _id: item.shop,
      owner: req.userId
    });

    if (!shop) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Item.findByIdAndDelete(itemId);

    shop.items = shop.items.filter(
      id => id.toString() !== itemId
    );
    await shop.save();

    await shop.populate({
      path: "items",
      options: { sort: { updatedAt: -1 } }
    });

    return res.status(200).json(shop);
  } catch (error) {
    return res.status(500).json({
      message: `delete item error ${error.message}`
    });
  }
};

export const getItemByCity = async (req, res) => {
  try {
    const { city } = req.params;
    if (!city) {
      return res.status(400).json({ message: "City is required" });
    }

    const items = await Item.find()
      .populate({
        path: "shop",
        match: { city: new RegExp(city, "i") },
        select: "name city image"
      });

    const filtered = items.filter(i => i.shop);

    return res.status(200).json(filtered);
  } catch (error) {
    return res.status(500).json({
      message: `get items by city error ${error.message}`
    });
  }
};

export const getItemsByShop = async (req, res) => {
  try {
    const { shopId } = req.params;

    const shop = await Shop.findById(shopId).populate("items");
    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }

    return res.status(200).json({
      shop,
      items: shop.items
    });
  } catch (error) {
    return res.status(500).json({
      message: `get items by shop error ${error.message}`
    });
  }
};

export const searchItems = async (req, res) => {
  try {
    const { query, city } = req.query;
    if (!query || !city) {
      return res.status(400).json({ message: "Query and city required" });
    }

    const items = await Item.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } }
      ]
    }).populate({
      path: "shop",
      match: { city: new RegExp(`^${city}$`, "i") },
      select: "name image"
    });

    const filtered = items.filter(i => i.shop);

    return res.status(200).json(filtered);
  } catch (error) {
    return res.status(500).json({
      message: `search item error ${error.message}`
    });
  }
};
