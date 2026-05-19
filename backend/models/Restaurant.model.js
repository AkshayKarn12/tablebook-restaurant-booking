// ============================================================
// models/Restaurant.model.js — Restaurant schema
// ============================================================
const mongoose = require("mongoose");

const tableSchema = new mongoose.Schema({
  tableNumber: { type: Number, required: true },
  capacity: { type: Number, required: true },
  isAvailable: { type: Boolean, default: true },
});

const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Restaurant name is required"],
      trim: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    cuisine: {
      type: [String],
      required: [true, "Cuisine type is required"],
    },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      country: { type: String, default: "India" },
    },
    location: {
      type: { type: String, default: "Point" },
      coordinates: { type: [Number], default: [0, 0] }, // [longitude, latitude]
    },
    phone: { type: String, required: true },
    email: { type: String },
    website: { type: String },
    images: {
      type: [String],
      default: [],
    },
    coverImage: {
      type: String,
      default: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800",
    },
    priceRange: {
      type: String,
      enum: ["$", "$$", "$$$", "$$$$"],
      default: "$$",
    },
    openingHours: {
      monday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
      tuesday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
      wednesday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
      thursday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
      friday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
      saturday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
      sunday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    },
    tables: [tableSchema],
    totalTables: { type: Number, default: 0 },
    maxCapacity: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    tags: [String],
    amenities: [String], // e.g., ["Wifi", "Parking", "Outdoor Seating"]
    isApproved: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    totalBookings: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for geo queries
restaurantSchema.index({ location: "2dsphere" });
restaurantSchema.index({ name: "text", description: "text" });

// Virtual: menus
restaurantSchema.virtual("menus", {
  ref: "Menu",
  localField: "_id",
  foreignField: "restaurant",
});

// Calculate total tables and max capacity before saving
restaurantSchema.pre("save", function (next) {
  this.totalTables = this.tables.length;
  this.maxCapacity = this.tables.reduce((acc, t) => acc + t.capacity, 0);
  next();
});

module.exports = mongoose.model("Restaurant", restaurantSchema);
