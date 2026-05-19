// ============================================================
// models/Review.model.js — User reviews for restaurants
// ============================================================
const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
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
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, "Review comment is required"],
      maxlength: [1000, "Review cannot exceed 1000 characters"],
    },
    images: [String],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// A user can only review a restaurant once per booking
reviewSchema.index({ user: 1, restaurant: 1, booking: 1 }, { unique: true });

// Static method: Calculate average rating for restaurant
reviewSchema.statics.calcAverageRating = async function (restaurantId) {
  const result = await this.aggregate([
    { $match: { restaurant: restaurantId } },
    {
      $group: {
        _id: "$restaurant",
        avgRating: { $avg: "$rating" },
        numReviews: { $sum: 1 },
      },
    },
  ]);

  if (result.length > 0) {
    await mongoose.model("Restaurant").findByIdAndUpdate(restaurantId, {
      averageRating: Math.round(result[0].avgRating * 10) / 10,
      totalReviews: result[0].numReviews,
    });
  } else {
    await mongoose.model("Restaurant").findByIdAndUpdate(restaurantId, {
      averageRating: 0,
      totalReviews: 0,
    });
  }
};

// Call calcAverageRating after save
reviewSchema.post("save", function () {
  this.constructor.calcAverageRating(this.restaurant);
});

// Call calcAverageRating after delete
reviewSchema.post("remove", function () {
  this.constructor.calcAverageRating(this.restaurant);
});

module.exports = mongoose.model("Review", reviewSchema);
