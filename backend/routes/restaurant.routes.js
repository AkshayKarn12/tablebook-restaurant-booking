// routes/restaurant.routes.js
const express = require("express");
const router = express.Router();
const {
  getRestaurants, getFeaturedRestaurants, getRestaurantById,
  createRestaurant, updateRestaurant, deleteRestaurant,
  getMyRestaurants, checkAvailability, addReview,
} = require("../controllers/restaurant.controller");
const { protect, authorize } = require("../middleware/auth.middleware");
const { uploadRestaurantImages } = require("../middleware/upload.middleware");

// Public
router.get("/", getRestaurants);
router.get("/featured", getFeaturedRestaurants);
router.get("/owner/my", protect, authorize("owner", "admin"), getMyRestaurants);
router.get("/:id", getRestaurantById);
router.get("/:id/availability", checkAvailability);

// Protected
router.post(
  "/",
  protect,
  authorize("owner", "admin"),
  (req, res, next) => {
    uploadRestaurantImages(req, res, (err) => {
      if (err) return next(err);
      next();
    });
  },
  createRestaurant
);

router.put(
  "/:id",
  protect,
  authorize("owner", "admin"),
  (req, res, next) => {
    uploadRestaurantImages(req, res, (err) => {
      if (err) return next(err);
      next();
    });
  },
  updateRestaurant
);

router.delete("/:id", protect, authorize("owner", "admin"), deleteRestaurant);
router.post("/:id/reviews", protect, authorize("user"), addReview);

module.exports = router;
