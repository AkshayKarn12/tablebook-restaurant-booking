// src/pages/SignupPage.jsx
import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle, FiCheck } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { MdRestaurantMenu } from "react-icons/md";
import { useAuth } from "../context/AuthContext";

const PasswordStrength = ({ password }) => {
  const checks = [
    { label: "8+ characters", valid: password.length >= 8 },
    { label: "Uppercase letter", valid: /[A-Z]/.test(password) },
    { label: "Number", valid: /\d/.test(password) },
  ];
  const score = checks.filter((c) => c.valid).length;
  const colors = ["bg-red-400", "bg-yellow-400", "bg-green-400"];

  if (!password) return null;
  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1.5">
        {[0, 1, 2].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i < score ? colors[score - 1] : "bg-gray-200 dark:bg-gray-700"}`} />
        ))}
      </div>
      <div className="flex gap-3">
        {checks.map((c) => (
          <span key={c.label} className={`text-xs flex items-center gap-1 ${c.valid ? "text-green-600 dark:text-green-400" : "text-gray-400"}`}>
            <FiCheck className={c.valid ? "text-green-500" : "text-gray-300"} />
            {c.label}
          </span>
        ))}
      </div>
    </div>
  );
};

const SignupPage = () => {
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: searchParams.get("role") === "owner" ? "owner" : "user",
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const validate = () => {
    if (!form.name.trim()) return "Name is required";
    if (!form.email) return "Email is required";
    if (form.password.length < 6) return "Password must be at least 6 characters";
    if (form.password !== form.confirmPassword) return "Passwords do not match";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setLoading(true);
    try {
      const data = await register({ name: form.name, email: form.email, password: form.password, role: form.role });
      navigate(data.user.role === "owner" ? "/owner" : "/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      const data = await loginWithGoogle(form.role);
      navigate(data.user.role === "owner" ? "/owner" : "/");
    } catch (err) {
      setError(err.message || "Google sign-in failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-amber-600 to-primary-700 items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=80" alt="" className="w-full h-full object-cover opacity-25" />
        </div>
        <div className="relative z-10 text-center text-white px-12">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
            <MdRestaurantMenu className="text-3xl" />
          </div>
          <h2 className="font-display text-4xl font-bold mb-4">Join TableBook</h2>
          <p className="text-white/80 text-lg leading-relaxed max-w-sm mx-auto">
            Create your account and start discovering extraordinary dining experiences today.
          </p>
          <div className="mt-10 space-y-4">
            {["Book tables in real-time", "Save your favorite restaurants", "Get instant confirmations", "Manage your reservations"].map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-white/90 text-sm">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <FiCheck className="text-xs" />
                </div>
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white dark:bg-dark-900 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md py-8"
        >
          <div className="flex items-center gap-2 mb-8">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-amber-500 rounded-xl flex items-center justify-center">
              <MdRestaurantMenu className="text-white text-lg" />
            </div>
            <span className="font-display font-bold text-xl text-gray-900 dark:text-white">
              Table<span className="text-gradient">Book</span>
            </span>
          </div>

          <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white mb-1">Create Account</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Already have an account?{" "}
            <Link to="/login" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">Sign In</Link>
          </p>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { role: "user", label: "Diner", desc: "Book & explore restaurants", icon: "🍽️" },
              { role: "owner", label: "Restaurant Owner", desc: "List & manage your restaurant", icon: "🏪" },
            ].map((opt) => (
              <button
                key={opt.role}
                type="button"
                onClick={() => setForm({ ...form, role: opt.role })}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  form.role === opt.role
                    ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                }`}
              >
                <div className="text-xl mb-1">{opt.icon}</div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{opt.label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{opt.desc}</p>
              </button>
            ))}
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl mb-4 text-sm">
              <FiAlertCircle className="flex-shrink-0" />
              {error}
            </motion.div>
          )}

          {/* Google button */}
          <button onClick={handleGoogle} disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 font-medium hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all mb-4 disabled:opacity-60">
            <FcGoogle className="text-xl" />
            {googleLoading ? "Connecting..." : "Continue with Google"}
          </button>

          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-gray-700" /></div>
            <div className="relative flex justify-center">
              <span className="bg-white dark:bg-dark-900 px-4 text-xs text-gray-400 uppercase tracking-wider">or create with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" name="name" value={form.name} onChange={handleChange}
                  placeholder="John Doe" className="input-field pl-10" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" name="email" value={form.email} onChange={handleChange}
                  placeholder="you@example.com" className="input-field pl-10" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type={showPass ? "text" : "password"} name="password" value={form.password} onChange={handleChange}
                  placeholder="••••••••" className="input-field pl-10 pr-10" required />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              <PasswordStrength password={form.password} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Confirm Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange}
                  placeholder="••••••••" className="input-field pl-10" required />
              </div>
              {form.confirmPassword && form.password !== form.confirmPassword && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><FiAlertCircle />Passwords do not match</p>
              )}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                  Creating Account...
                </span>
              ) : "Create Account"}
            </button>
          </form>

          <p className="mt-4 text-xs text-gray-400 text-center">
            By signing up, you agree to our{" "}
            <a href="#" className="text-primary-500 hover:underline">Terms of Service</a> and{" "}
            <a href="#" className="text-primary-500 hover:underline">Privacy Policy</a>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default SignupPage;
