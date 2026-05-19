// ============================================================
// controllers/admin.controller.js — Admin panel operations
// ============================================================
const asyncHandler = require("express-async-handler");
const User = require("../models/User.model");
const Restaurant = require("../models/Restaurant.model");
const Booking = require("../models/Booking.model");

// ─── @GET /api/admin/stats ───────────────────────────────────
// @desc    Get platform-wide statistics
// @access  Private/Admin
const getAdminStats = asyncHandler(async (req, res) => {
  const [
    totalUsers, totalRestaurants, totalBookings,
    pendingApprovals, activeUsers, monthlyBookings,
  ] = await Promise.all([
    User.countDocuments(),
    Restaurant.countDocuments({ isActive: true }),
    Booking.countDocuments(),
    Restaurant.countDocuments({ isApproved: false, isActive: true }),
    User.countDocuments({ isActive: true }),
    Booking.countDocuments({
      createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
    }),
  ]);

  // Booking trend (last 7 days)
  const last7Days = await Booking.aggregate([
    {
      $match: {
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.json({
    success: true,
    stats: {
      totalUsers,
      totalRestaurants,
      totalBookings,
      pendingApprovals,
      activeUsers,
      monthlyBookings,
    },
    last7Days,
  });
});

// ─── @GET /api/admin/users ───────────────────────────────────
// @desc    Get all users
// @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, role, search } = req.query;
  const query = {};
  if (role) query.role = role;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await User.countDocuments(query);

  const users = await User.find(query)
    .select("-password")
    .sort("-createdAt")
    .skip(skip)
    .limit(parseInt(limit));

  res.json({ success: true, users, total, pages: Math.ceil(total / parseInt(limit)) });
});

// ─── @PUT /api/admin/users/:id ───────────────────────────────
// @desc    Update user (role, active status)
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  const { role, isActive } = req.body;
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role, isActive },
    { new: true }
  ).select("-password");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.json({ success: true, user });
});

// ─── @DELETE /api/admin/users/:id ────────────────────────────
// @desc    Delete user
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  await user.deleteOne();
  res.json({ success: true, message: "User deleted" });
});

// ─── @GET /api/admin/restaurants ─────────────────────────────
// @desc    Get all restaurants (including unapproved)
// @access  Private/Admin
const getAllRestaurants = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, isApproved, search } = req.query;
  const query = {};
  if (isApproved !== undefined) query.isApproved = isApproved === "true";
  if (search) query.name = { $regex: search, $options: "i" };

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Restaurant.countDocuments(query);

  const restaurants = await Restaurant.find(query)
    .populate("owner", "name email")
    .sort("-createdAt")
    .skip(skip)
    .limit(parseInt(limit));

  res.json({ success: true, restaurants, total, pages: Math.ceil(total / parseInt(limit)) });
});

// ─── @PUT /api/admin/restaurants/:id/approve ─────────────────
// @desc    Approve or reject a restaurant
// @access  Private/Admin
const approveRestaurant = asyncHandler(async (req, res) => {
  const { isApproved, isFeatured } = req.body;

  const restaurant = await Restaurant.findByIdAndUpdate(
    req.params.id,
    { isApproved, isFeatured },
    { new: true }
  );

  if (!restaurant) {
    res.status(404);
    throw new Error("Restaurant not found");
  }

  res.json({ success: true, restaurant });
});

// ─── @DELETE /api/admin/restaurants/:id ──────────────────────
// @desc    Permanently delete restaurant
// @access  Private/Admin
const deleteRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id);
  if (!restaurant) {
    res.status(404);
    throw new Error("Restaurant not found");
  }
  await restaurant.deleteOne();
  res.json({ success: true, message: "Restaurant deleted" });
});

module.exports = {
  getAdminStats,
  getAllUsers,
  updateUser,
  deleteUser,
  getAllRestaurants,
  approveRestaurant,
  deleteRestaurant,
};
