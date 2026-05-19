// ============================================================
// controllers/menu.controller.js — Restaurant menu management
// ============================================================
const asyncHandler = require("express-async-handler");
const Menu = require("../models/Menu.model");
const Restaurant = require("../models/Restaurant.model");

// ─── @GET /api/menu/:restaurantId ────────────────────────────
const getMenu = asyncHandler(async (req, res) => {
  const menu = await Menu.findOne({ restaurant: req.params.restaurantId });
  res.json({ success: true, menu: menu || { items: [], categories: [] } });
});

// ─── @POST /api/menu/:restaurantId ───────────────────────────
const addMenuItem = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.restaurantId);
  if (!restaurant || restaurant.owner.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized");
  }

  const { name, description, price, category, isVeg, calories, allergens } = req.body;
  const image = req.file ? req.file.path : "";

  let menu = await Menu.findOne({ restaurant: req.params.restaurantId });

  if (!menu) {
    menu = new Menu({ restaurant: req.params.restaurantId, items: [], categories: [] });
  }

  const newItem = { name, description, price, category, isVeg, image, calories, allergens };
  menu.items.push(newItem);

  if (!menu.categories.includes(category)) {
    menu.categories.push(category);
  }

  await menu.save();
  res.status(201).json({ success: true, menu });
});

// ─── @DELETE /api/menu/:restaurantId/items/:itemId ───────────
const deleteMenuItem = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.restaurantId);
  if (!restaurant || restaurant.owner.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized");
  }

  const menu = await Menu.findOne({ restaurant: req.params.restaurantId });
  if (!menu) {
    res.status(404);
    throw new Error("Menu not found");
  }

  menu.items = menu.items.filter((i) => i._id.toString() !== req.params.itemId);
  await menu.save();

  res.json({ success: true, menu });
});

module.exports = { getMenu, addMenuItem, deleteMenuItem };
