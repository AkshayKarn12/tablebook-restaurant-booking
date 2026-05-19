// ============================================================
// controllers/booking.controller.js — Booking logic + Socket.IO
// ============================================================
const asyncHandler = require("express-async-handler");
const Booking = require("../models/Booking.model");
const Restaurant = require("../models/Restaurant.model");

// ─── @POST /api/bookings ─────────────────────────────────────
// @desc    Create new booking
// @access  Private/User
const createBooking = asyncHandler(async (req, res) => {
  const {
    restaurantId,
    tableNumber,
    date,
    timeSlot,
    guests,
    specialRequests,
    guestName,
    guestEmail,
    guestPhone,
  } = req.body;

  // Check restaurant exists
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) {
    res.status(404);
    throw new Error("Restaurant not found");
  }

  // Check the table isn't already booked for this slot
  const conflictingBooking = await Booking.findOne({
    restaurant: restaurantId,
    tableNumber,
    date: new Date(date),
    timeSlot,
    status: { $in: ["pending", "confirmed"] },
  });

  if (conflictingBooking) {
    res.status(400);
    throw new Error("This table is already booked for the selected time slot");
  }

  // Check table capacity
  const table = restaurant.tables.find((t) => t.tableNumber === tableNumber);
  if (!table) {
    res.status(400);
    throw new Error("Invalid table number");
  }
  if (table.capacity < guests) {
    res.status(400);
    throw new Error(`Table ${tableNumber} can only accommodate ${table.capacity} guests`);
  }

  // Create booking
  const booking = await Booking.create({
    user: req.user._id,
    restaurant: restaurantId,
    tableNumber,
    date: new Date(date),
    timeSlot,
    guests,
    specialRequests,
    guestName: guestName || req.user.name,
    guestEmail: guestEmail || req.user.email,
    guestPhone: guestPhone || req.user.phone,
  });

  await booking.populate([
    { path: "restaurant", select: "name address coverImage phone" },
    { path: "user", select: "name email phone" },
  ]);

  // Increment restaurant booking count
  await Restaurant.findByIdAndUpdate(restaurantId, {
    $inc: { totalBookings: 1 },
  });

  // ─── Real-time notification via Socket.IO ─────────────────
  if (req.io) {
    // Notify restaurant owner's room
    req.io.to(`restaurant_${restaurantId}`).emit("new_booking", {
      type: "new_booking",
      booking: {
        _id: booking._id,
        confirmationCode: booking.confirmationCode,
        tableNumber,
        date,
        timeSlot,
        guests,
        status: booking.status,
        guestName: booking.guestName,
      },
    });

    // Notify user
    req.io.to(`user_${req.user._id}`).emit("booking_created", {
      type: "booking_created",
      message: `Booking confirmed at ${restaurant.name}!`,
      booking: booking._id,
      confirmationCode: booking.confirmationCode,
    });
  }

  res.status(201).json({ success: true, booking });
});

// ─── @GET /api/bookings/my ───────────────────────────────────
// @desc    Get logged-in user's bookings
// @access  Private/User
const getMyBookings = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;

  const query = { user: req.user._id };
  if (status) query.status = status;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Booking.countDocuments(query);

  const bookings = await Booking.find(query)
    .populate("restaurant", "name coverImage address cuisine averageRating")
    .sort("-date")
    .skip(skip)
    .limit(parseInt(limit));

  res.json({
    success: true,
    bookings,
    total,
    pages: Math.ceil(total / parseInt(limit)),
    currentPage: parseInt(page),
  });
});

// ─── @GET /api/bookings/restaurant/:id ───────────────────────
// @desc    Get all bookings for a specific restaurant (owner view)
// @access  Private/Owner
const getRestaurantBookings = asyncHandler(async (req, res) => {
  const { status, date, page = 1, limit = 20 } = req.query;

  // Verify ownership
  const restaurant = await Restaurant.findById(req.params.id);
  if (!restaurant) {
    res.status(404);
    throw new Error("Restaurant not found");
  }
  if (
    restaurant.owner.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    res.status(403);
    throw new Error("Not authorized");
  }

  const query = { restaurant: req.params.id };
  if (status) query.status = status;
  if (date) {
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);
    query.date = { $gte: startDate, $lt: endDate };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Booking.countDocuments(query);

  const bookings = await Booking.find(query)
    .populate("user", "name email phone avatar")
    .sort("-createdAt")
    .skip(skip)
    .limit(parseInt(limit));

  res.json({ success: true, bookings, total, pages: Math.ceil(total / parseInt(limit)) });
});

// ─── @GET /api/bookings/:id ───────────────────────────────────
// @desc    Get single booking
// @access  Private
const getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate("restaurant", "name address phone coverImage")
    .populate("user", "name email phone avatar");

  if (!booking) {
    res.status(404);
    throw new Error("Booking not found");
  }

  // Only the booking user, restaurant owner, or admin can view
  const restaurant = await Restaurant.findById(booking.restaurant._id);
  const isOwner = restaurant?.owner?.toString() === req.user._id.toString();
  const isUser = booking.user._id.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";

  if (!isUser && !isOwner && !isAdmin) {
    res.status(403);
    throw new Error("Not authorized");
  }

  res.json({ success: true, booking });
});

// ─── @PUT /api/bookings/:id/status ───────────────────────────
// @desc    Update booking status (owner confirms/rejects)
// @access  Private/Owner or Admin
const updateBookingStatus = asyncHandler(async (req, res) => {
  const { status, cancellationReason } = req.body;

  const booking = await Booking.findById(req.params.id).populate("restaurant");

  if (!booking) {
    res.status(404);
    throw new Error("Booking not found");
  }

  // Owner or admin authorization
  const isOwner =
    booking.restaurant.owner.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    res.status(403);
    throw new Error("Not authorized to update this booking");
  }

  booking.status = status;

  if (status === "confirmed") booking.confirmedAt = Date.now();
  if (status === "completed") booking.completedAt = Date.now();
  if (status === "cancelled") {
    booking.cancelledAt = Date.now();
    booking.cancelledBy = req.user._id;
    booking.cancellationReason = cancellationReason || "Cancelled by restaurant";
  }

  await booking.save();

  // Real-time notification to user
  if (req.io) {
    req.io.to(`user_${booking.user}`).emit("booking_status_update", {
      type: "booking_status_update",
      bookingId: booking._id,
      status,
      message: `Your booking at ${booking.restaurant.name} has been ${status}`,
    });
  }

  res.json({ success: true, booking });
});

// ─── @PUT /api/bookings/:id/cancel ───────────────────────────
// @desc    User cancels their own booking
// @access  Private/User
const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate("restaurant", "name owner");

  if (!booking) {
    res.status(404);
    throw new Error("Booking not found");
  }

  if (booking.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized");
  }

  if (["cancelled", "completed"].includes(booking.status)) {
    res.status(400);
    throw new Error(`Booking is already ${booking.status}`);
  }

  booking.status = "cancelled";
  booking.cancelledAt = Date.now();
  booking.cancelledBy = req.user._id;
  booking.cancellationReason = req.body.reason || "Cancelled by user";

  await booking.save();

  // Notify restaurant owner
  if (req.io) {
    req.io.to(`restaurant_${booking.restaurant._id}`).emit("booking_cancelled", {
      type: "booking_cancelled",
      bookingId: booking._id,
      message: `Booking #${booking.confirmationCode} was cancelled by the user`,
    });
  }

  res.json({ success: true, booking });
});

// ─── @GET /api/bookings/stats ────────────────────────────────
// @desc    Get booking statistics for owner dashboard
// @access  Private/Owner
const getBookingStats = asyncHandler(async (req, res) => {
  const { restaurantId } = req.query;

  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant || restaurant.owner.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized");
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));

  const [total, thisMonth, thisWeek, pending, confirmed, cancelled] = await Promise.all([
    Booking.countDocuments({ restaurant: restaurantId }),
    Booking.countDocuments({ restaurant: restaurantId, createdAt: { $gte: startOfMonth } }),
    Booking.countDocuments({ restaurant: restaurantId, createdAt: { $gte: startOfWeek } }),
    Booking.countDocuments({ restaurant: restaurantId, status: "pending" }),
    Booking.countDocuments({ restaurant: restaurantId, status: "confirmed" }),
    Booking.countDocuments({ restaurant: restaurantId, status: "cancelled" }),
  ]);

  res.json({
    success: true,
    stats: { total, thisMonth, thisWeek, pending, confirmed, cancelled },
  });
});

module.exports = {
  createBooking,
  getMyBookings,
  getRestaurantBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  getBookingStats,
};
