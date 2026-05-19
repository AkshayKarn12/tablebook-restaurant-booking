// routes/menu.routes.js
const express = require("express");
const router = express.Router();
const { getMenu, addMenuItem, deleteMenuItem } = require("../controllers/menu.controller");
const { protect, authorize } = require("../middleware/auth.middleware");
const { uploadMenuItem } = require("../middleware/upload.middleware");

router.get("/:restaurantId", getMenu);
router.post(
  "/:restaurantId",
  protect,
  authorize("owner", "admin"),
  (req, res, next) => {
    uploadMenuItem(req, res, (err) => {
      if (err) return next(err);
      next();
    });
  },
  addMenuItem
);
router.delete(
  "/:restaurantId/items/:itemId",
  protect,
  authorize("owner", "admin"),
  deleteMenuItem
);

module.exports = router;
