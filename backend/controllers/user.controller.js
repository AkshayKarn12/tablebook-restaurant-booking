// ============================================================
// controllers/user.controller.js — User profile, favorites
// ============================================================
const asyncHandler = require("express-async-handler");
const User = require("../models/User.model");
const Restaurant = require("../models/Restaurant.model");

// ─── @GET /api/users/profile ─────────────────────────────────
// @desc    Get user profile
// @access  Private
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate(
    "favorites",
    "name coverImage averageRating cuisine address priceRange"
  );
  res.json({ success: true, user });
});

// ─── @PUT /api/users/profile ─────────────────────────────────
// @desc    Update user profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;

  const updates = {};
  if (name) updates.name = name;
  if (phone !== undefined) updates.phone = phone;

  // Handle avatar upload
  if (req.file) updates.avatar = req.file.path;

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  res.json({ success: true, user });
});

// ─── @POST /api/users/favorites/:restaurantId ────────────────
// @desc    Add/remove restaurant from favorites (toggle)
// @access  Private
const toggleFavorite = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params;
  const user = await User.findById(req.user._id);

  const isFav = user.favorites.includes(restaurantId);

  if (isFav) {
    user.favorites = user.favorites.filter(
      (id) => id.toString() !== restaurantId
    );
  } else {
    user.favorites.push(restaurantId);
  }

  await user.save();

  res.json({
    success: true,
    isFavorite: !isFav,
    message: isFav ? "Removed from favorites" : "Added to favorites",
  });
});

// ─── @GET /api/users/favorites ───────────────────────────────
// @desc    Get user's favorite restaurants
// @access  Private
const getFavorites = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate(
    "favorites",
    "name coverImage averageRating cuisine address priceRange totalReviews"
  );

  res.json({ success: true, favorites: user.favorites });
});

module.exports = { getProfile, updateProfile, toggleFavorite, getFavorites };
