// src/pages/UserDashboard.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiCalendar, FiClock, FiMapPin, FiX, FiEye, FiHeart, FiStar, FiCheck } from "react-icons/fi";
import { bookingAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { format } from "date-fns";
import LoadingSpinner from "../components/common/LoadingSpinner";

const STATUS_CONFIG = {
  pending: { label: "Pending", class: "badge-warning", icon: FiClock },
  confirmed: { label: "Confirmed", class: "badge-success", icon: FiCheck },
  cancelled: { label: "Cancelled", class: "badge-danger", icon: FiX },
  completed: { label: "Completed", class: "badge-info", icon: FiStar },
  "no-show": { label: "No Show", class: "badge-danger", icon: FiX },
};

const BookingCard = ({ booking, onCancel }) => {
  const [cancelling, setCancelling] = useState(false);
  const config = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;
  const StatusIcon = config.icon;
  const canCancel = ["pending", "confirmed"].includes(booking.status);

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    setCancelling(true);
    try {
      await bookingAPI.cancel(booking._id, { reason: "Cancelled by user" });
      toast.success("Booking cancelled");
      onCancel(booking._id);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to cancel booking");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden hover:shadow-card-hover transition-shadow"
    >
      <div className="flex flex-col sm:flex-row">
        {/* Image */}
        <div className="sm:w-36 h-32 sm:h-auto flex-shrink-0">
          <img
            src={booking.restaurant?.coverImage || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=300"}
            alt={booking.restaurant?.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{booking.restaurant?.name}</h3>
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                <FiMapPin className="flex-shrink-0" />
                {booking.restaurant?.address?.city}
              </p>
            </div>
            <span className={`badge ${config.class} flex items-center gap-1`}>
              <StatusIcon className="text-xs" />
              {config.label}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
            <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300">
              <FiCalendar className="text-primary-400" />
              {format(new Date(booking.date), "dd MMM yyyy")}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300">
              <FiClock className="text-primary-400" />
              {booking.timeSlot}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-300">
              👥 {booking.guests} guests
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-400">Confirmation: </span>
              <span className="text-xs font-mono font-bold text-primary-600 dark:text-primary-400">{booking.confirmationCode}</span>
            </div>
            <div className="flex gap-2">
              <Link
                to={`/restaurants/${booking.restaurant?._id}`}
                className="text-xs text-gray-500 hover:text-primary-500 flex items-center gap-1 transition-colors"
              >
                <FiEye className="text-xs" /> View
              </Link>
              {canCancel && (
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1 transition-colors disabled:opacity-50"
                >
                  <FiX className="text-xs" /> {cancelling ? "..." : "Cancel"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const UserDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const params = { page, limit: 10 };
        if (activeFilter !== "all") params.status = activeFilter;
        const { data } = await bookingAPI.getMyBookings(params);
        setBookings(data.bookings);
        setPagination({ total: data.total, pages: data.pages });
      } catch {
        toast.error("Failed to load bookings");
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [activeFilter, page]);

  const handleCancel = (id) => {
    setBookings((prev) =>
      prev.map((b) => b._id === id ? { ...b, status: "cancelled" } : b)
    );
  };

  const FILTERS = ["all", "pending", "confirmed", "completed", "cancelled"];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-4">
            <img
              src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "U")}&background=f97316&color=fff`}
              alt={user?.name}
              className="w-16 h-16 rounded-2xl object-cover"
            />
            <div>
              <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">
                Welcome back, {user?.name?.split(" ")[0]}! 👋
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Manage your reservations and favorites</p>
            </div>
          </div>
        </motion.div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Bookings", value: pagination.total, icon: "📅", color: "bg-blue-50 dark:bg-blue-900/20" },
            { label: "Active", value: bookings.filter((b) => b.status === "confirmed").length, icon: "✅", color: "bg-green-50 dark:bg-green-900/20" },
            { label: "Pending", value: bookings.filter((b) => b.status === "pending").length, icon: "⏳", color: "bg-yellow-50 dark:bg-yellow-900/20" },
            { label: "Favorites", value: user?.favorites?.length || 0, icon: "❤️", color: "bg-red-50 dark:bg-red-900/20" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`${stat.color} rounded-2xl p-4`}
            >
              <div className="text-2xl mb-1">{stat.icon}</div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Quick links */}
        <div className="flex gap-3 mb-8">
          <Link to="/restaurants" className="btn-primary text-sm py-2.5">🍽️ Find Restaurants</Link>
          <Link to="/favorites" className="btn-secondary text-sm py-2.5">❤️ My Favorites</Link>
          <Link to="/profile" className="btn-secondary text-sm py-2.5">👤 Profile</Link>
        </div>

        {/* Bookings section */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white">My Reservations</h2>
          </div>

          {/* Status filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => { setActiveFilter(f); setPage(1); }}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-all ${
                  activeFilter === f
                    ? "bg-primary-500 text-white"
                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-primary-300"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : bookings.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl">
              <div className="text-5xl mb-4">📅</div>
              <h3 className="font-display text-lg font-bold text-gray-900 dark:text-white mb-2">No bookings found</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {activeFilter === "all" ? "You haven't made any reservations yet." : `No ${activeFilter} bookings.`}
              </p>
              <Link to="/restaurants" className="btn-primary">Book a Table</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <BookingCard key={booking._id} booking={booking} onCancel={handleCancel} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button onClick={() => setPage((p) => p - 1)} disabled={page === 1} className="btn-secondary px-4 py-2 text-sm disabled:opacity-40">← Prev</button>
              <span className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">{page} / {pagination.pages}</span>
              <button onClick={() => setPage((p) => p + 1)} disabled={page === pagination.pages} className="btn-secondary px-4 py-2 text-sm disabled:opacity-40">Next →</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
