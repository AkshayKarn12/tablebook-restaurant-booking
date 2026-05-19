// ============================================================
// models/Menu.model.js — Menu items for restaurants
// ============================================================
const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: "" },
  price: { type: Number, required: true, min: 0 },
  image: { type: String, default: "" },
  category: { type: String, required: true },
  isVeg: { type: Boolean, default: true },
  isAvailable: { type: Boolean, default: true },
  isPopular: { type: Boolean, default: false },
  calories: { type: Number },
  allergens: [String],
});

const menuSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    items: [menuItemSchema],
    categories: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Menu", menuSchema);
