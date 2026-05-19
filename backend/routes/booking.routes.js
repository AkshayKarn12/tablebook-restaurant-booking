// routes/booking.routes.js
const express = require("express");
const router = express.Router();
const {
  createBooking, getMyBookings, getRestaurantBookings,
  getBookingById, updateBookingStatus, cancelBooking, getBookingStats,
} = require("../controllers/booking.controller");
const { protect, authorize } = require("../middleware/auth.middleware");

router.post("/", protect, createBooking);
router.get("/my", protect, getMyBookings);
router.get("/stats", protect, authorize("owner", "admin"), getBookingStats);
router.get("/restaurant/:id", protect, authorize("owner", "admin"), getRestaurantBookings);
router.get("/:id", protect, getBookingById);
router.put("/:id/status", protect, authorize("owner", "admin"), updateBookingStatus);
router.put("/:id/cancel", protect, cancelBooking);

module.exports = router;
