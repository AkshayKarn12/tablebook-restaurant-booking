// ============================================================
// routes/auth.routes.js
// ============================================================
const express = require("express");
const router = express.Router();
const { register, login, googleAuth, getMe, updatePassword } = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth.middleware");

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleAuth);
router.get("/me", protect, getMe);
router.put("/updatepassword", protect, updatePassword);

module.exports = router;
