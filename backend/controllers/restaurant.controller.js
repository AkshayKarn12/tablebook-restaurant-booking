// ============================================================
// controllers/restaurant.controller.js — CRUD for restaurants
// ============================================================
const asyncHandler = require("express-async-handler");
const Restaurant = require("../models/Restaurant.model");
const Booking = require("../models/Booking.model");
const Review = require("../models/Review.model");

// ─── @GET /api/restaurants ───────────────────────────────────
// @desc    Get all approved restaurants with filters
// @access  Public
const getRestaurants = asyncHandler(async (req, res) => {
  const {
    search,
    cuisine,
    priceRange,
    minRating,
    city,
    sort = "-createdAt",
    page = 1,
    limit = 12,
  } = req.query;

  const query = { isApproved: true, isActive: true };

  // Search by name or description
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { "address.city": { $regex: search, $options: "i" } },
    ];
  }

  // Filter by cuisine
  if (cuisine && cuisine !== "All") {
    query.cuisine = { $in: [cuisine] };
  }

  // Filter by price range
  if (priceRange) {
    query.priceRange = { $in: priceRange.split(",") };
  }

  // Filter by minimum rating
  if (minRating) {
    query.averageRating = { $gte: parseFloat(minRating) };
  }

  // Filter by city
  if (city && city !== "All") {
    query["address.city"] = { $regex: city, $options: "i" };
  }

  // Pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Restaurant.countDocuments(query);

  const restaurants = await Restaurant.find(query)
    .select("-tables")
    .populate("owner", "name email avatar")
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  res.json({
    success: true,
    count: restaurants.length,
    total,
    pages: Math.ceil(total / parseInt(limit)),
    currentPage: parseInt(page),
    restaurants,
  });
});

// ─── @GET /api/restaurants/featured ─────────────────────────
// @desc    Get featured restaurants for homepage
// @access  Public
const getFeaturedRestaurants = asyncHandler(async (req, res) => {
  const restaurants = await Restaurant.find({
    isApproved: true,
    isActive: true,
    isFeatured: true,
  })
    .select("-tables")
    .limit(8)
    .sort("-averageRating");

  res.json({ success: true, restaurants });
});

// ─── @GET /api/restaurants/:id ───────────────────────────────
// @desc    Get single restaurant with reviews
// @access  Public
const getRestaurantById = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id)
    .populate("owner", "name email avatar")
    .populate({ path: "menus" });

  if (!restaurant || !restaurant.isActive) {
    res.status(404);
    throw new Error("Restaurant not found");
  }

  const reviews = await Review.find({ restaurant: restaurant._id })
    .populate("user", "name avatar")
    .sort("-createdAt")
    .limit(20);

  res.json({ success: true, restaurant, reviews });
});

// ─── @POST /api/restaurants ──────────────────────────────────
// @desc    Create a new restaurant (owner only)
// @access  Private/Owner
const createRestaurant = asyncHandler(async (req, res) => {
  const {
    name, description, cuisine, address,
    phone, email, website, priceRange,
    openingHours, tables, tags, amenities,
  } = req.body;

  // Parse JSON strings (from FormData)
  const parsedCuisine = typeof cuisine === "string" ? JSON.parse(cuisine) : cuisine;
  const parsedAddress = typeof address === "string" ? JSON.parse(address) : address;
  const parsedOpeningHours = typeof openingHours === "string" ? JSON.parse(openingHours) : openingHours;
  const parsedTables = typeof tables === "string" ? JSON.parse(tables) : tables;

  // Get uploaded image URLs from Cloudinary (via multer middleware)
  const images = req.files ? req.files.map((f) => f.path) : [];
  const coverImage = images[0] || "";

  const restaurant = await Restaurant.create({
    name,
    description,
    cuisine: parsedCuisine,
    address: parsedAddress,
    phone,
    email,
    website,
    priceRange,
    openingHours: parsedOpeningHours,
    tables: parsedTables || [],
    images,
    coverImage,
    tags: tags ? (typeof tags === "string" ? JSON.parse(tags) : tags) : [],
    amenities: amenities ? (typeof amenities === "string" ? JSON.parse(amenities) : amenities) : [],
    owner: req.user._id,
  });

  res.status(201).json({ success: true, restaurant });
});

// ─── @PUT /api/restaurants/:id ───────────────────────────────
// @desc    Update restaurant
// @access  Private/Owner or Admin
const updateRestaurant = asyncHandler(async (req, res) => {
  let restaurant = await Restaurant.findById(req.params.id);

  if (!restaurant) {
    res.status(404);
    throw new Error("Restaurant not found");
  }

  // Only owner or admin can update
  if (
    restaurant.owner.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    res.status(403);
    throw new Error("Not authorized to update this restaurant");
  }

  const updates = { ...req.body };

  // Parse JSON fields if coming from FormData
  ["cuisine", "address", "openingHours", "tables", "tags", "amenities"].forEach(
    (field) => {
      if (updates[field] && typeof updates[field] === "string") {
        updates[field] = JSON.parse(updates[field]);
      }
    }
  );

  // Handle new uploaded images
  if (req.files && req.files.length > 0) {
    const newImages = req.files.map((f) => f.path);
    updates.images = [...(restaurant.images || []), ...newImages];
    if (!restaurant.coverImage) updates.coverImage = newImages[0];
  }

  restaurant = await Restaurant.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });

  res.json({ success: true, restaurant });
});

// ─── @DELETE /api/restaurants/:id ────────────────────────────
// @desc    Delete restaurant
// @access  Private/Owner or Admin
const deleteRestaurant = asyncHandler(async (req, res) => {
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
    throw new Error("Not authorized to delete this restaurant");
  }

  // Soft delete
  restaurant.isActive = false;
  await restaurant.save();

  res.json({ success: true, message: "Restaurant removed" });
});

// ─── @GET /api/restaurants/owner/my-restaurants ──────────────
// @desc    Get restaurants owned by logged-in owner
// @access  Private/Owner
const getMyRestaurants = asyncHandler(async (req, res) => {
  const restaurants = await Restaurant.find({ owner: req.user._id });
  res.json({ success: true, restaurants });
});

// ─── @GET /api/restaurants/:id/availability ──────────────────
// @desc    Check table availability for a date/time
// @access  Public
const checkAvailability = asyncHandler(async (req, res) => {
  const { date, timeSlot, guests } = req.query;
  const restaurant = await Restaurant.findById(req.params.id);

  if (!restaurant) {
    res.status(404);
    throw new Error("Restaurant not found");
  }

  // Find bookings for this restaurant on this date and time slot
  const existingBookings = await Booking.find({
    restaurant: req.params.id,
    date: new Date(date),
    timeSlot,
    status: { $in: ["pending", "confirmed"] },
  });

  const bookedTableNumbers = existingBookings.map((b) => b.tableNumber);

  // Find available tables that fit the guests
  const availableTables = restaurant.tables.filter(
    (t) => t.isAvailable &&
    t.capacity >= parseInt(guests) &&
    !bookedTableNumbers.includes(t.tableNumber)
  );

  res.json({
    success: true,
    availableTables,
    totalAvailable: availableTables.length,
    isAvailable: availableTables.length > 0,
  });
});

// ─── @POST /api/restaurants/:id/reviews ──────────────────────
// @desc    Add review
// @access  Private/User
const addReview = asyncHandler(async (req, res) => {
  const { rating, comment, bookingId } = req.body;

  const restaurant = await Restaurant.findById(req.params.id);
  if (!restaurant) {
    res.status(404);
    throw new Error("Restaurant not found");
  }

  // Check if already reviewed this booking
  const existing = await Review.findOne({
    user: req.user._id,
    restaurant: req.params.id,
    booking: bookingId,
  });

  if (existing) {
    res.status(400);
    throw new Error("You have already reviewed this booking");
  }

  const review = await Review.create({
    user: req.user._id,
    restaurant: req.params.id,
    booking: bookingId,
    rating,
    comment,
  });

  await review.populate("user", "name avatar");

  res.status(201).json({ success: true, review });
});

module.exports = {
  getRestaurants,
  getFeaturedRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  getMyRestaurants,
  checkAvailability,
  addReview,
};
