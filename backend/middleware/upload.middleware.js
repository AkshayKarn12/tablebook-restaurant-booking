// ============================================================
// middleware/upload.middleware.js — Multer + Cloudinary upload
// ============================================================
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cloudinary storage for restaurant images
const restaurantStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "restaurant_booking/restaurants",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 1200, height: 800, crop: "fill", quality: "auto" }],
  },
});

// Cloudinary storage for profile avatars
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "restaurant_booking/avatars",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 400, height: 400, crop: "fill", quality: "auto" }],
  },
});

// Cloudinary storage for menu items
const menuStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "restaurant_booking/menu",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 600, height: 400, crop: "fill", quality: "auto" }],
  },
});

// File filter — images only
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

// Export different upload instances
const uploadRestaurantImages = multer({
  storage: restaurantStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
}).array("images", 10); // max 10 images

const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
}).single("avatar");

const uploadMenuItem = multer({
  storage: menuStorage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
}).single("image");

module.exports = {
  uploadRestaurantImages,
  uploadAvatar,
  uploadMenuItem,
  cloudinary,
};
