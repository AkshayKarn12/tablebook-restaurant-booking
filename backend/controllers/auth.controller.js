// ============================================================
// controllers/auth.controller.js — Signup, Login, Google Auth
// ============================================================
const asyncHandler = require("express-async-handler");
const User = require("../models/User.model");

// ─── Helper: Send token response ─────────────────────────────
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
      favorites: user.favorites,
      isGoogleAuth: user.isGoogleAuth,
      createdAt: user.createdAt,
    },
  });
};

// ─── @POST /api/auth/register ─────────────────────────────────
// @desc    Register a new user
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please provide name, email and password");
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400);
    throw new Error("Email already registered");
  }

  // Only allow user or owner roles on signup
  const allowedRoles = ["user", "owner"];
  const userRole = allowedRoles.includes(role) ? role : "user";

  const user = await User.create({ name, email, password, role: userRole });

  sendTokenResponse(user, 201, res);
});

// ─── @POST /api/auth/login ────────────────────────────────────
// @desc    Login user
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Please provide email and password");
  }

  // Find user and explicitly select password
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  if (user.isGoogleAuth && !user.password) {
    res.status(400);
    throw new Error("This account uses Google Sign-In. Please login with Google.");
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  if (!user.isActive) {
    res.status(403);
    throw new Error("Your account has been deactivated. Contact support.");
  }

  // Update last login
  user.lastLogin = Date.now();
  await user.save({ validateBeforeSave: false });

  sendTokenResponse(user, 200, res);
});

// ─── @POST /api/auth/google ───────────────────────────────────
// @desc    Google Sign-In (Firebase token → backend user)
// @access  Public
const googleAuth = asyncHandler(async (req, res) => {
  const { uid, email, name, avatar, role } = req.body;

  if (!uid || !email) {
    res.status(400);
    throw new Error("Google authentication data incomplete");
  }

  // Find or create user
  let user = await User.findOne({ email });

  if (user) {
    // Update Google info if user exists but logged in via password before
    if (!user.googleId) {
      user.googleId = uid;
      user.isGoogleAuth = true;
      if (avatar && !user.avatar) user.avatar = avatar;
      await user.save({ validateBeforeSave: false });
    }
  } else {
    // Create new user via Google
    const allowedRoles = ["user", "owner"];
    const userRole = allowedRoles.includes(role) ? role : "user";

    user = await User.create({
      name: name || email.split("@")[0],
      email,
      googleId: uid,
      isGoogleAuth: true,
      avatar: avatar || "",
      role: userRole,
    });
  }

  user.lastLogin = Date.now();
  await user.save({ validateBeforeSave: false });

  sendTokenResponse(user, 200, res);
});

// ─── @GET /api/auth/me ────────────────────────────────────────
// @desc    Get current logged-in user
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate("favorites", "name coverImage averageRating cuisine");

  res.json({
    success: true,
    user,
  });
});

// ─── @PUT /api/auth/updatepassword ───────────────────────────
// @desc    Update password
// @access  Private
const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select("+password");

  if (user.password) {
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      res.status(401);
      throw new Error("Current password is incorrect");
    }
  }

  user.password = newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

module.exports = { register, login, googleAuth, getMe, updatePassword };
