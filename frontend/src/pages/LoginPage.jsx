// src/pages/LoginPage.jsx
import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { MdRestaurantMenu } from "react-icons/md";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError("Please fill in all fields"); return; }
    setLoading(true);
    try {
      const data = await login(form);
      navigate(data.user.role === "admin" ? "/admin" : data.user.role === "owner" ? "/owner" : redirect);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      const data = await loginWithGoogle();
      navigate(data.user.role === "admin" ? "/admin" : data.user.role === "owner" ? "/owner" : redirect);
    } catch (err) {
      setError(err.message || "Google sign-in failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel - decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-primary-700 to-amber-600 items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80" alt="" className="w-full h-full object-cover opacity-30" />
        </div>
        <div className="relative z-10 text-center text-white px-12">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
            <MdRestaurantMenu className="text-3xl" />
          </div>
          <h2 className="font-display text-4xl font-bold mb-4">Welcome Back!</h2>
          <p className="text-white/80 text-lg leading-relaxed max-w-sm mx-auto">
            Sign in to manage your reservations and discover extraordinary dining experiences.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4">
            {["500+ Restaurants", "50K+ Bookings", "4.8★ Rating"].map((s, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                <p className="text-sm font-semibold text-white">{s}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white dark:bg-dark-900">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-amber-500 rounded-xl flex items-center justify-center">
              <MdRestaurantMenu className="text-white text-lg" />
            </div>
            <span className="font-display font-bold text-xl text-gray-900 dark:text-white">
              Table<span className="text-gradient">Book</span>
            </span>
          </div>

          <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white mb-1">Sign In</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
              Sign Up
            </Link>
          </p>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl mb-5 text-sm"
            >
              <FiAlertCircle className="flex-shrink-0" />
              {error}
            </motion.div>
          )}

          {/* Google button */}
          <button
            onClick={handleGoogle}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 font-medium hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all mb-5 disabled:opacity-60"
          >
            <FcGoogle className="text-xl" />
            {googleLoading ? "Signing in..." : "Continue with Google"}
          </button>

          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white dark:bg-dark-900 px-4 text-xs text-gray-400 uppercase tracking-wider">or sign in with email</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Password</label>
                <a href="#" className="text-xs text-primary-600 dark:text-primary-400 hover:underline font-medium">Forgot password?</a>
              </div>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPass ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="input-field pl-10 pr-10"
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                  Signing In...
                </span>
              ) : "Sign In"}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Demo Accounts</p>
            <div className="space-y-1">
              {[
                { role: "Admin", email: "admin@tablebook.com", pass: "Admin@1234" },
                { role: "Owner", email: "owner@tablebook.com", pass: "Owner@1234" },
                { role: "User", email: "user@tablebook.com", pass: "User@1234" },
              ].map((a) => (
                <button
                  key={a.role}
                  onClick={() => { setForm({ email: a.email, password: a.pass }); setError(""); }}
                  className="w-full text-left text-xs text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 py-0.5 transition-colors"
                >
                  <span className="font-semibold">{a.role}:</span> {a.email}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
