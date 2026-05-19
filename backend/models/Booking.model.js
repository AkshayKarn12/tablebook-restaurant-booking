// ============================================================
// models/Booking.model.js — Booking/Reservation schema
// ============================================================
const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    tableNumber: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      required: [true, "Booking date is required"],
    },
    timeSlot: {
      type: String,
      required: [true, "Time slot is required"],
    },
    guests: {
      type: Number,
      required: [true, "Number of guests is required"],
      min: [1, "At least 1 guest required"],
      max: [20, "Maximum 20 guests per booking"],
    },
    specialRequests: {
      type: String,
      maxlength: [500, "Special requests cannot exceed 500 characters"],
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed", "no-show"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "refunded"],
      default: "unpaid",
    },
    totalAmount: {
      type: Number,
      default: 0,
    },
    confirmationCode: {
      type: String,
      unique: true,
    },
    cancelledAt: Date,
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    cancellationReason: String,
    confirmedAt: Date,
    completedAt: Date,
    guestName: { type: String },
    guestEmail: { type: String },
    guestPhone: { type: String },
  },
  {
    timestamps: true,
  }
);

// Generate unique confirmation code before saving
bookingSchema.pre("save", function (next) {
  if (!this.confirmationCode) {
    // e.g. RB-A1B2C3D4
    this.confirmationCode =
      "RB-" +
      Math.random().toString(36).substring(2, 10).toUpperCase();
  }
  next();
});

// Index for fast querying
bookingSchema.index({ restaurant: 1, date: 1, status: 1 });
bookingSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model("Booking", bookingSchema);
