// routes/user.routes.js
const express = require("express");
const router = express.Router();
const { getProfile, updateProfile, toggleFavorite, getFavorites } = require("../controllers/user.controller");
const { protect } = require("../middleware/auth.middleware");
const { uploadAvatar } = require("../middleware/upload.middleware");

router.get("/profile", protect, getProfile);
router.put("/profile", protect, (req, res, next) => {
  uploadAvatar(req, res, (err) => {
    if (err) return next(err);
    next();
  });
}, updateProfile);
router.get("/favorites", protect, getFavorites);
router.post("/favorites/:restaurantId", protect, toggleFavorite);
router.delete("/favorites/:restaurantId", protect, toggleFavorite);

module.exports = router;
