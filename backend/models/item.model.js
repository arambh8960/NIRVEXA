import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  image: {
    type: String,
    required: true
  },

  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shop",
    required: true
  },

  category: {
    type: String,
    enum: [
      "cement",
      "tmt",
      "bricks",
      "sand",
      "aggregates",
      "tiles",
      "paint",
      "plumbing",
      "electrical",
      "wood",
      "hardware",
      "roofing",
      "other"
    ],
    required: true
  },

  price: {
    type: Number,
    min: 0,
    required: true
  },

  unitType: {
    type: String,
    required: true
  }

}, { timestamps: true });

const Item = mongoose.model("Item", itemSchema);
export default Item;
