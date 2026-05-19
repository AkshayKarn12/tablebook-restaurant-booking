// ============================================================
// middleware/auth.middleware.js — JWT verification & role guard
// ============================================================
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/User.model");

// ─── Protect Routes: Verify JWT ───────────────────────────────
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Read token from Authorization header (Bearer <token>)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized — no token");
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to request (exclude password)
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      res.status(401);
      throw new Error("User not found");
    }

    if (!req.user.isActive) {
      res.status(403);
      throw new Error("Account has been deactivated");
    }

    next();
  } catch (error) {
    res.status(401);
    throw new Error("Not authorized — invalid token");
  }
});

// ─── Role Authorization ───────────────────────────────────────
// Usage: authorize("admin") or authorize("admin", "owner")
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      res.status(403);
      throw new Error(
        `Role '${req.user.role}' is not authorized to access this route`
      );
    }
    next();
  };
};

module.exports = { protect, authorize };
