// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiUsers, FiCheck, FiX, FiTrash2, FiSearch, FiStar, FiTrendingUp, FiGrid } from "react-icons/fi";
import { MdRestaurant } from "react-icons/md";
import { adminAPI } from "../services/api";
import { toast } from "react-toastify";
import LoadingSpinner from "../components/common/LoadingSpinner";

const StatCard = ({ icon, label, value, color, sub }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className={`${color} rounded-2xl p-5`}
  >
    <div className="text-3xl mb-2">{icon}</div>
    <p className="text-3xl font-bold text-gray-900 dark:text-white">{value?.toLocaleString()}</p>
    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{label}</p>
    {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
  </motion.div>
);

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [page, setPage] = useState(1);
  const [restFilter, setRestFilter] = useState("all"); // all, approved, pending

  // Fetch stats on mount
  useEffect(() => {
    adminAPI.getStats()
      .then(({ data }) => setStats(data.stats))
      .catch(() => toast.error("Failed to load stats"))
      .finally(() => setLoading(false));
  }, []);

  // Fetch users when on users tab
  useEffect(() => {
    if (activeTab !== "users") return;
    setLoading(true);
    const params = { page, limit: 15 };
    if (search) params.search = search;
    adminAPI.getUsers(params)
      .then(({ data }) => {
        setUsers(data.users);
        setPagination({ total: data.total, pages: data.pages });
      })
      .catch(() => toast.error("Failed to load users"))
      .finally(() => setLoading(false));
  }, [activeTab, page, search]);

  // Fetch restaurants when on restaurants tab
  useEffect(() => {
    if (activeTab !== "restaurants") return;
    setLoading(true);
    const params = { page, limit: 15 };
    if (search) params.search = search;
    if (restFilter !== "all") params.isApproved = restFilter === "approved";
    adminAPI.getRestaurants(params)
      .then(({ data }) => {
        setRestaurants(data.restaurants);
        setPagination({ total: data.total, pages: data.pages });
      })
      .catch(() => toast.error("Failed to load restaurants"))
      .finally(() => setLoading(false));
  }, [activeTab, page, search, restFilter]);

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Permanently delete this user?")) return;
    try {
      await adminAPI.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u._id !== id));
      toast.success("User deleted");
    } catch { toast.error("Failed to delete user"); }
  };

  const handleToggleUserStatus = async (id, isActive) => {
    try {
      const { data } = await adminAPI.updateUser(id, { isActive: !isActive });
      setUsers((prev) => prev.map((u) => u._id === id ? { ...u, isActive: !isActive } : u));
      toast.success(`User ${!isActive ? "activated" : "deactivated"}`);
    } catch { toast.error("Failed to update user"); }
  };

  const handleApproveRestaurant = async (id, isApproved) => {
    try {
      await adminAPI.approveRestaurant(id, { isApproved });
      setRestaurants((prev) => prev.map((r) => r._id === id ? { ...r, isApproved } : r));
      toast.success(`Restaurant ${isApproved ? "approved" : "rejected"}`);
    } catch { toast.error("Failed to update restaurant"); }
  };

  const handleToggleFeatured = async (id, isFeatured) => {
    try {
      await adminAPI.approveRestaurant(id, { isFeatured: !isFeatured });
      setRestaurants((prev) => prev.map((r) => r._id === id ? { ...r, isFeatured: !isFeatured } : r));
      toast.success(`Restaurant ${!isFeatured ? "featured" : "unfeatured"}`);
    } catch { toast.error("Failed to update restaurant"); }
  };

  const handleDeleteRestaurant = async (id) => {
    if (!window.confirm("Permanently delete this restaurant?")) return;
    try {
      await adminAPI.deleteRestaurant(id);
      setRestaurants((prev) => prev.filter((r) => r._id !== id));
      toast.success("Restaurant deleted");
    } catch { toast.error("Failed to delete restaurant"); }
  };

  const TABS = [
    { id: "overview", label: "Overview", icon: FiGrid },
    { id: "restaurants", label: "Restaurants", icon: MdRestaurant },
    { id: "users", label: "Users", icon: FiUsers },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Admin Dashboard 🛡️
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Platform management and analytics
          </p>
        </div>

        {/* Tab navigation */}
        <div className="flex gap-1 bg-white dark:bg-gray-800 rounded-2xl p-1 shadow-card mb-8 w-fit">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setPage(1); setSearch(""); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-primary-500 text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <tab.icon className="text-sm" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ─── Overview Tab ─────────────────────────────────────── */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {loading ? <LoadingSpinner /> : stats && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                  <StatCard icon="👥" label="Total Users" value={stats.totalUsers} color="bg-blue-50 dark:bg-blue-900/20" />
                  <StatCard icon="🏪" label="Restaurants" value={stats.totalRestaurants} color="bg-green-50 dark:bg-green-900/20" />
                  <StatCard icon="📅" label="Total Bookings" value={stats.totalBookings} color="bg-purple-50 dark:bg-purple-900/20" />
                  <StatCard icon="⏳" label="Pending Approvals" value={stats.pendingApprovals} color="bg-yellow-50 dark:bg-yellow-900/20" sub="Needs review" />
                  <StatCard icon="✅" label="Active Users" value={stats.activeUsers} color="bg-teal-50 dark:bg-teal-900/20" />
                  <StatCard icon="📆" label="This Month" value={stats.monthlyBookings} color="bg-indigo-50 dark:bg-indigo-900/20" />
                </div>

                {/* Quick action cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-yellow-50 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
                        <span className="text-xl">⏳</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Pending Approvals</h3>
                        <p className="text-xs text-gray-500">{stats.pendingApprovals} restaurants awaiting review</p>
                      </div>
                    </div>
                    <button
                      onClick={() => { setActiveTab("restaurants"); setRestFilter("pending"); }}
                      className="btn-primary w-full text-sm py-2"
                    >
                      Review Now →
                    </button>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                        <span className="text-xl">👥</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">User Management</h3>
                        <p className="text-xs text-gray-500">{stats.totalUsers} registered users</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab("users")}
                      className="btn-secondary w-full text-sm py-2"
                    >
                      Manage Users →
                    </button>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-green-50 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                        <span className="text-xl">🏪</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">All Restaurants</h3>
                        <p className="text-xs text-gray-500">{stats.totalRestaurants} active listings</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab("restaurants")}
                      className="btn-secondary w-full text-sm py-2"
                    >
                      View All →
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ─── Restaurants Tab ───────────────────────────────────── */}
        {activeTab === "restaurants" && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden">
            {/* Toolbar */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Search restaurants..."
                  className="input-field pl-9 text-sm py-2"
                />
              </div>
              <div className="flex gap-2">
                {["all", "approved", "pending"].map((f) => (
                  <button
                    key={f}
                    onClick={() => { setRestFilter(f); setPage(1); }}
                    className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
                      restFilter === f ? "bg-primary-500 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {loading ? <LoadingSpinner /> : restaurants.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-3">🏪</div>
                <p className="text-gray-500">No restaurants found</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                      <tr>
                        {["Restaurant", "Owner", "City", "Rating", "Status", "Actions"].map((h) => (
                          <th key={h} className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 py-3">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {restaurants.map((r) => (
                        <tr key={r._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={r.coverImage || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=60"}
                                alt={r.name}
                                className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
                              />
                              <div>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">{r.name}</p>
                                <p className="text-xs text-gray-500">{r.cuisine?.slice(0, 2).join(", ")}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                            {r.owner?.name || "—"}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                            {r.address?.city}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <FiStar className="text-amber-400 fill-current text-xs" />
                              <span className="text-sm text-gray-900 dark:text-white">{r.averageRating?.toFixed(1) || "New"}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`badge ${r.isApproved ? "badge-success" : "badge-warning"}`}>
                              {r.isApproved ? "Approved" : "Pending"}
                            </span>
                            {r.isFeatured && <span className="badge badge-primary ml-1">Featured</span>}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1.5">
                              {!r.isApproved ? (
                                <button
                                  onClick={() => handleApproveRestaurant(r._id, true)}
                                  className="w-7 h-7 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center hover:bg-green-200 transition-colors"
                                  title="Approve"
                                >
                                  <FiCheck className="text-xs" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleApproveRestaurant(r._id, false)}
                                  className="w-7 h-7 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 flex items-center justify-center hover:bg-yellow-200 transition-colors"
                                  title="Revoke Approval"
                                >
                                  <FiX className="text-xs" />
                                </button>
                              )}
                              <button
                                onClick={() => handleToggleFeatured(r._id, r.isFeatured)}
                                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                                  r.isFeatured
                                    ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 hover:bg-amber-200"
                                    : "bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600"
                                }`}
                                title={r.isFeatured ? "Unfeature" : "Feature"}
                              >
                                <FiStar className="text-xs" />
                              </button>
                              <button
                                onClick={() => handleDeleteRestaurant(r._id)}
                                className="w-7 h-7 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-500 flex items-center justify-center hover:bg-red-200 transition-colors"
                                title="Delete"
                              >
                                <FiTrash2 className="text-xs" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex justify-center gap-2 p-4 border-t border-gray-100 dark:border-gray-700">
                    <button onClick={() => setPage((p) => p - 1)} disabled={page === 1} className="btn-secondary px-4 py-2 text-sm disabled:opacity-40">← Prev</button>
                    <span className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">Page {page} of {pagination.pages}</span>
                    <button onClick={() => setPage((p) => p + 1)} disabled={page === pagination.pages} className="btn-secondary px-4 py-2 text-sm disabled:opacity-40">Next →</button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ─── Users Tab ─────────────────────────────────────────── */}
        {activeTab === "users" && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden">
            {/* Toolbar */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-700">
              <div className="relative max-w-sm">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Search users..."
                  className="input-field pl-9 text-sm py-2"
                />
              </div>
            </div>

            {loading ? <LoadingSpinner /> : users.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-3">👥</div>
                <p className="text-gray-500">No users found</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                      <tr>
                        {["User", "Email", "Role", "Joined", "Status", "Actions"].map((h) => (
                          <th key={h} className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 py-3">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {users.map((u) => (
                        <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=f97316&color=fff&size=36`}
                                alt={u.name}
                                className="w-9 h-9 rounded-full object-cover"
                              />
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{u.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{u.email}</td>
                          <td className="px-4 py-3">
                            <span className={`badge ${
                              u.role === "admin" ? "badge-primary" :
                              u.role === "owner" ? "badge-info" : "badge-success"
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                            {new Date(u.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`badge ${u.isActive ? "badge-success" : "badge-danger"}`}>
                              {u.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => handleToggleUserStatus(u._id, u.isActive)}
                                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                                  u.isActive
                                    ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 hover:bg-yellow-200"
                                    : "bg-green-100 dark:bg-green-900/30 text-green-600 hover:bg-green-200"
                                }`}
                                title={u.isActive ? "Deactivate" : "Activate"}
                              >
                                {u.isActive ? <FiX className="text-xs" /> : <FiCheck className="text-xs" />}
                              </button>
                              <button
                                onClick={() => handleDeleteUser(u._id)}
                                className="w-7 h-7 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-500 flex items-center justify-center hover:bg-red-200 transition-colors"
                                title="Delete user"
                              >
                                <FiTrash2 className="text-xs" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {pagination.pages > 1 && (
                  <div className="flex justify-center gap-2 p-4 border-t border-gray-100 dark:border-gray-700">
                    <button onClick={() => setPage((p) => p - 1)} disabled={page === 1} className="btn-secondary px-4 py-2 text-sm disabled:opacity-40">← Prev</button>
                    <span className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">Page {page} of {pagination.pages}</span>
                    <button onClick={() => setPage((p) => p + 1)} disabled={page === pagination.pages} className="btn-secondary px-4 py-2 text-sm disabled:opacity-40">Next →</button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
