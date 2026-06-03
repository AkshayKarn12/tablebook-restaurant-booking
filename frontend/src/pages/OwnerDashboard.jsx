// src/pages/OwnerDashboard.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiPlus, FiCheck, FiX, FiClock, FiStar } from "react-icons/fi";
import { restaurantAPI, bookingAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { getSocket } from "../services/socket";
import { toast } from "react-toastify";
import { format } from "date-fns";
import LoadingSpinner from "../components/common/LoadingSpinner";

const StatCard = ({ icon, label, value, color, sub }) => (
  <div className={`${color} rounded-2xl p-5`}>
    <div className="text-2xl mb-2">{icon}</div>
    <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">{label}</p>
    {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
  </div>
);

const OwnerDashboard = () => {
  const { user } = useAuth();
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    restaurantAPI.getMyRestaurants().then(({ data }) => {
      setRestaurants(data.restaurants);
      if (data.restaurants.length > 0) {
        setSelectedRestaurant(data.restaurants[0]);
      }
    }).catch(() => toast.error("Failed to load restaurants"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedRestaurant) return;

    const fetchData = async () => {
      setBookingLoading(true);
      try {
        const [bookRes, statRes] = await Promise.all([
          bookingAPI.getRestaurantBookings(selectedRestaurant._id),
          bookingAPI.getStats(selectedRestaurant._id),
        ]);
        setBookings(bookRes.data.bookings);
        setStats(statRes.data.stats);
      } catch (err) {
        toast.error("Failed to load booking data");
      } finally {
        setBookingLoading(false);
      }
    };
    fetchData();

    // Real-time socket updates
    const socket = getSocket();
    if (socket) {
      socket.on("new_booking", (data) => {
        toast.info(`🔔 New booking: ${data.booking.guestName} — Table ${data.booking.tableNumber}`);
        setStats((prev) => prev ? { ...prev, total: prev.total + 1, pending: prev.pending + 1 } : prev);
      });
      socket.on("booking_cancelled", (data) => {
        toast.warning(`⚠️ Booking cancelled: #${data.message}`);
      });
    }
    return () => {
      if (socket) {
        socket.off("new_booking");
        socket.off("booking_cancelled");
      }
    };
  }, [selectedRestaurant]);

  const handleBookingStatus = async (bookingId, status) => {
    try {
      await bookingAPI.updateStatus(bookingId, { status });
      setBookings((prev) => prev.map((b) => b._id === bookingId ? { ...b, status } : b));
      toast.success(`Booking ${status} successfully`);
    } catch {
      toast.error("Failed to update booking status");
    }
  };

  const filteredBookings = statusFilter === "all"
    ? bookings
    : bookings.filter((b) => b.status === statusFilter);

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Owner Dashboard 🏪
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Manage your restaurants and reservations
            </p>
          </div>
          <Link to="/owner/add-restaurant" className="btn-primary flex items-center gap-2 text-sm">
            <FiPlus /> Add Restaurant
          </Link>
        </div>

        {/* No restaurants state */}
        {restaurants.length === 0 && (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl">
            <div className="text-6xl mb-4">🏪</div>
            <h3 className="font-display text-xl font-bold text-gray-900 dark:text-white mb-2">
              No restaurants yet
            </h3>
            <p className="text-gray-500 mb-6">
              Add your first restaurant to start accepting bookings.
            </p>
            <Link to="/owner/add-restaurant" className="btn-primary flex items-center gap-2 mx-auto w-fit">
              <FiPlus /> Add Restaurant
            </Link>
          </div>
        )}

        {restaurants.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

            {/* Sidebar: restaurant selector */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-3">
                  My Restaurants
                </h3>
                <div className="space-y-2">
                  {restaurants.map((r) => (
                    <button
                      key={r._id}
                      onClick={() => setSelectedRestaurant(r)}
                      className={`w-full text-left p-3 rounded-xl transition-all ${
                        selectedRestaurant?._id === r._id
                          ? "bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800"
                          : "hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={r.coverImage}
                          alt={r.name}
                          className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {r.name}
                          </p>
                          <span className={`text-xs ${r.isApproved ? "text-green-500" : "text-yellow-500"}`}>
                            {r.isApproved ? "✓ Approved" : "⏳ Pending"}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Add another restaurant link */}
                <Link
                  to="/owner/add-restaurant"
                  className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400 hover:border-primary-300 hover:text-primary-500 transition-all"
                >
                  <FiPlus className="text-sm" /> Add New Restaurant
                </Link>
              </div>
            </div>

            {/* Main content */}
            <div className="lg:col-span-3 space-y-6">

              {/* Restaurant header */}
              {selectedRestaurant && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden">
                  <div className="relative h-36">
                    <img
                      src={selectedRestaurant.coverImage}
                      alt={selectedRestaurant.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-4">
                      <h2 className="font-display text-xl font-bold text-white">
                        {selectedRestaurant.name}
                      </h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          selectedRestaurant.isApproved
                            ? "bg-green-500 text-white"
                            : "bg-yellow-500 text-white"
                        }`}>
                          {selectedRestaurant.isApproved ? "Active" : "Pending Approval"}
                        </span>
                        <span className="text-xs text-white/80">
                          {selectedRestaurant.totalTables} tables
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Stats */}
              {stats && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <StatCard icon="📅" label="Total Bookings" value={stats.total} color="bg-blue-50 dark:bg-blue-900/20" />
                  <StatCard icon="⏳" label="Pending" value={stats.pending} color="bg-yellow-50 dark:bg-yellow-900/20" sub="Needs action" />
                  <StatCard icon="✅" label="Confirmed" value={stats.confirmed} color="bg-green-50 dark:bg-green-900/20" />
                  <StatCard icon="📆" label="This Month" value={stats.thisMonth} color="bg-purple-50 dark:bg-purple-900/20" />
                  <StatCard icon="📊" label="This Week" value={stats.thisWeek} color="bg-indigo-50 dark:bg-indigo-900/20" />
                  <StatCard icon="❌" label="Cancelled" value={stats.cancelled} color="bg-red-50 dark:bg-red-900/20" />
                </div>
              )}

              {/* Bookings table */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Reservations</h3>
                  <div className="flex gap-2 flex-wrap">
                    {["all", "pending", "confirmed", "completed", "cancelled"].map((s) => (
                      <button
                        key={s}
                        onClick={() => setStatusFilter(s)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all ${
                          statusFilter === s
                            ? "bg-primary-500 text-white"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {bookingLoading ? <LoadingSpinner /> : filteredBookings.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-3">📋</div>
                    <p className="text-gray-500">
                      No {statusFilter === "all" ? "" : statusFilter} bookings found
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                          {["Guest", "Date & Time", "Table", "Guests", "Status", "Actions"].map((h) => (
                            <th key={h} className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 py-3">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {filteredBookings.map((booking) => (
                          <tr key={booking._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <img
                                  src={booking.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(booking.guestName || "G")}&background=f97316&color=fff&size=32`}
                                  className="w-8 h-8 rounded-full object-cover"
                                  alt=""
                                />
                                <div>
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {booking.guestName || booking.user?.name}
                                  </p>
                                  <p className="text-xs text-gray-500 font-mono">
                                    {booking.confirmationCode}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <p className="text-sm text-gray-900 dark:text-white">
                                {format(new Date(booking.date), "dd MMM yyyy")}
                              </p>
                              <p className="text-xs text-gray-500">{booking.timeSlot}</p>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                              #{booking.tableNumber}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                              {booking.guests}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`badge ${
                                booking.status === "confirmed" ? "badge-success" :
                                booking.status === "pending" ? "badge-warning" :
                                booking.status === "cancelled" ? "badge-danger" : "badge-info"
                              }`}>
                                {booking.status}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-1">
                                {booking.status === "pending" && (
                                  <>
                                    <button
                                      onClick={() => handleBookingStatus(booking._id, "confirmed")}
                                      className="w-7 h-7 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center hover:bg-green-200 transition-colors"
                                      title="Confirm"
                                    >
                                      <FiCheck className="text-xs" />
                                    </button>
                                    <button
                                      onClick={() => handleBookingStatus(booking._id, "cancelled")}
                                      className="w-7 h-7 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center hover:bg-red-200 transition-colors"
                                      title="Reject"
                                    >
                                      <FiX className="text-xs" />
                                    </button>
                                  </>
                                )}
                                {booking.status === "confirmed" && (
                                  <button
                                    onClick={() => handleBookingStatus(booking._id, "completed")}
                                    className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center hover:bg-blue-200 transition-colors"
                                    title="Mark Complete"
                                  >
                                    <FiStar className="text-xs" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerDashboard;