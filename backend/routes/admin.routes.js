// routes/admin.routes.js
const express = require("express");
const router = express.Router();
const {
  getAdminStats, getAllUsers, updateUser, deleteUser,
  getAllRestaurants, approveRestaurant, deleteRestaurant,
} = require("../controllers/admin.controller");
const { protect, authorize } = require("../middleware/auth.middleware");

router.use(protect, authorize("admin")); // all admin routes are protected

router.get("/stats", getAdminStats);
router.get("/users", getAllUsers);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);
router.get("/restaurants", getAllRestaurants);
router.put("/restaurants/:id/approve", approveRestaurant);
router.delete("/restaurants/:id", deleteRestaurant);

module.exports = router;
