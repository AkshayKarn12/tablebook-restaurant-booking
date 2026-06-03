// src/pages/RestaurantDetailPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiStar, FiMapPin, FiPhone, FiClock, FiWifi,
  FiHeart, FiShare2, FiArrowLeft, FiUsers, FiCheck,
} from "react-icons/fi";
import { MdOutlineTableBar } from "react-icons/md";
import { restaurantAPI, menuAPI, userAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { joinRestaurantRoom } from "../services/socket";
import { toast } from "react-toastify";
import BookingModal from "../components/restaurant/BookingModal";
import LoadingSpinner from "../components/common/LoadingSpinner";

const DAY_NAMES = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

const StarDisplay = ({ rating }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <FiStar
        key={s}
        className={`text-sm ${s <= Math.round(rating) ? "text-amber-400 fill-current" : "text-gray-300 dark:text-gray-600"}`}
      />
    ))}
  </div>
);

const RestaurantDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [restaurant, setRestaurant] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [menu, setMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");
  const [bookingOpen, setBookingOpen] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [restRes, menuRes] = await Promise.all([
          restaurantAPI.getById(id),
          menuAPI.getMenu(id),
        ]);
        setRestaurant(restRes.data.restaurant);
        setReviews(restRes.data.reviews);
        setMenu(menuRes.data.menu);
        setIsFav(user?.favorites?.includes(id));
        // Join restaurant socket room for real-time updates
        joinRestaurantRoom(id);
      } catch {
        toast.error("Restaurant not found");
        navigate("/restaurants");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleFavorite = async () => {
    if (!isAuthenticated) { toast.info("Please login to save favorites"); return; }
    setFavLoading(true);
    try {
      const { data } = await userAPI.toggleFavorite(id);
      setIsFav(data.isFavorite);
      toast.success(data.message);
    } catch { toast.error("Failed to update favorites"); }
    finally { setFavLoading(false); }
  };

  const todayHours = () => {
    if (!restaurant?.openingHours) return null;
    const today = DAY_NAMES[new Date().getDay()];
    const hours = restaurant.openingHours[today];
    if (!hours?.isOpen) return { text: "Closed today", open: false };
    return { text: `${hours.open} – ${hours.close}`, open: true };
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (!restaurant) return null;

  const allImages = [restaurant.coverImage, ...(restaurant.images || [])].filter(Boolean);
  const todayInfo = todayHours();

  const TABS = ["overview", "menu", "reviews"];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 pt-16">
      {/* Image Gallery Hero */}
      <div className="relative h-64 sm:h-80 md:h-96 bg-gray-900">
        <img
          src={allImages[activeImage] || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200"}
          alt={restaurant.name}
          className="w-full h-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white w-10 h-10 rounded-xl flex items-center justify-center transition-all"
        >
          <FiArrowLeft />
        </button>

        {/* Actions */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={handleFavorite}
            disabled={favLoading}
            className={`w-10 h-10 rounded-xl backdrop-blur-sm flex items-center justify-center transition-all ${
              isFav ? "bg-red-500 text-white" : "bg-black/40 hover:bg-black/60 text-white"
            }`}
          >
            <FiHeart className={isFav ? "fill-current" : ""} />
          </button>
          <button
            onClick={() => { navigator.clipboard?.writeText(window.location.href); toast.success("Link copied!"); }}
            className="w-10 h-10 rounded-xl bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white flex items-center justify-center transition-all"
          >
            <FiShare2 />
          </button>
        </div>

        {/* Thumbnail strip */}
        {allImages.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {allImages.slice(0, 6).map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={`w-10 h-10 rounded-lg overflow-hidden border-2 transition-all ${
                  activeImage === i ? "border-white scale-110" : "border-white/40"
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Restaurant header */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-card">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {restaurant.isFeatured && (
                      <span className="badge badge-primary">⭐ Featured</span>
                    )}
                    <span className="badge badge-success">
                      {todayInfo?.open ? "Open Now" : "Closed"}
                    </span>
                  </div>
                  <h1 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                    {restaurant.name}
                  </h1>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="flex items-center gap-1 justify-end">
                    <FiStar className="text-amber-400 fill-current" />
                    <span className="font-bold text-lg text-gray-900 dark:text-white">
                      {restaurant.averageRating?.toFixed(1) || "New"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{restaurant.totalReviews} reviews</p>
                </div>
              </div>

              {/* Cuisine tags & price */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {restaurant.cuisine?.map((c, i) => (
                  <span key={i} className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm px-3 py-1 rounded-full">
                    {c}
                  </span>
                ))}
                <span className="ml-2 font-bold text-primary-500">{restaurant.priceRange}</span>
              </div>

              {/* Key info */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <FiMapPin className="text-primary-400 flex-shrink-0" />
                  <span className="truncate">{restaurant.address?.city}, {restaurant.address?.state}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <FiPhone className="text-primary-400 flex-shrink-0" />
                  <span>{restaurant.phone}</span>
                </div>
                {todayInfo && (
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <FiClock className="text-primary-400 flex-shrink-0" />
                    <span>{todayInfo.text}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <MdOutlineTableBar className="text-primary-400 flex-shrink-0" />
                  <span>{restaurant.totalTables} tables</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <FiUsers className="text-primary-400 flex-shrink-0" />
                  <span>Up to {restaurant.maxCapacity} guests</span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden">
              <div className="flex border-b border-gray-100 dark:border-gray-700">
                {TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-3.5 text-sm font-semibold capitalize transition-all ${
                      activeTab === tab
                        ? "text-primary-600 dark:text-primary-400 border-b-2 border-primary-500"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    }`}
                  >
                    {tab}
                    {tab === "reviews" && ` (${reviews.length})`}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {/* Overview Tab */}
                {activeTab === "overview" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">About</h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{restaurant.description}</p>
                    </div>

                    {restaurant.amenities?.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Amenities</h3>
                        <div className="flex flex-wrap gap-2">
                          {restaurant.amenities.map((a, i) => (
                            <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300">
                              <FiCheck className="text-green-500 text-xs" /> {a}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Opening Hours */}
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Opening Hours</h3>
                      <div className="space-y-2">
                        {DAY_NAMES.map((day) => {
                          const h = restaurant.openingHours?.[day];
                          const isToday = DAY_NAMES[new Date().getDay()] === day;
                          return (
                            <div key={day} className={`flex justify-between text-sm py-1.5 px-3 rounded-lg ${isToday ? "bg-primary-50 dark:bg-primary-900/20" : ""}`}>
                              <span className={`capitalize font-medium ${isToday ? "text-primary-600 dark:text-primary-400" : "text-gray-700 dark:text-gray-300"}`}>
                                {day} {isToday && "(Today)"}
                              </span>
                              <span className={h?.isOpen ? "text-gray-600 dark:text-gray-300" : "text-red-500"}>
                                {h?.isOpen ? `${h.open} – ${h.close}` : "Closed"}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Full address */}
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Address</h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        {restaurant.address?.street}, {restaurant.address?.city},{" "}
                        {restaurant.address?.state} {restaurant.address?.zipCode}
                      </p>
                    </div>
                  </div>
                )}

                {/* Menu Tab */}
                {activeTab === "menu" && (
                  <div>
                    {!menu || menu.items?.length === 0 ? (
                      <div className="text-center py-10">
                        <div className="text-4xl mb-3">📋</div>
                        <p className="text-gray-500">Menu not available yet</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {menu.categories?.map((cat) => {
                          const items = menu.items.filter((i) => i.category === cat && i.isAvailable);
                          if (!items.length) return null;
                          return (
                            <div key={cat}>
                              <h4 className="font-display font-semibold text-gray-900 dark:text-white mb-3 pb-2 border-b border-gray-100 dark:border-gray-700">
                                {cat}
                              </h4>
                              <div className="space-y-3">
                                {items.map((item) => (
                                  <div key={item._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    {item.image && (
                                      <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <span className={`w-3 h-3 rounded-sm border-2 flex-shrink-0 ${item.isVeg ? "border-green-500" : "border-red-500"}`}>
                                          <span className={`block w-1.5 h-1.5 rounded-full m-auto mt-0.5 ${item.isVeg ? "bg-green-500" : "bg-red-500"}`} />
                                        </span>
                                        <span className="font-medium text-sm text-gray-900 dark:text-white">{item.name}</span>
                                        {item.isPopular && <span className="badge badge-warning text-xs">Popular</span>}
                                      </div>
                                      {item.description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{item.description}</p>}
                                    </div>
                                    <span className="font-bold text-gray-900 dark:text-white text-sm flex-shrink-0">₹{item.price}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Reviews Tab */}
                {activeTab === "reviews" && (
                  <div className="space-y-4">
                    {/* Rating summary */}
                    <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl mb-6">
                      <div className="text-center">
                        <p className="font-display text-4xl font-bold text-gray-900 dark:text-white">
                          {restaurant.averageRating?.toFixed(1) || "—"}
                        </p>
                        <StarDisplay rating={restaurant.averageRating || 0} />
                        <p className="text-xs text-gray-500 mt-1">{restaurant.totalReviews} reviews</p>
                      </div>
                    </div>

                    {reviews.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="text-4xl mb-3">⭐</div>
                        <p className="text-gray-500">No reviews yet. Be the first!</p>
                      </div>
                    ) : (
                      reviews.map((review) => (
                        <div key={review._id} className="border-b border-gray-100 dark:border-gray-700 pb-4 last:border-0">
                          <div className="flex items-start gap-3">
                            <img
                              src={review.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.user?.name || "U")}&background=f97316&color=fff`}
                              alt={review.user?.name}
                              className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-semibold text-sm text-gray-900 dark:text-white">{review.user?.name}</span>
                                <span className="text-xs text-gray-400">
                                  {new Date(review.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                </span>
                              </div>
                              <StarDisplay rating={review.rating} />
                              <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">{review.comment}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Booking sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6">
                <h3 className="font-display font-bold text-gray-900 dark:text-white mb-1">Make a Reservation</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
                  Book your table in seconds — no phone call needed.
                </p>

                <div className="space-y-3 mb-5">
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                    <div className="w-8 h-8 bg-primary-50 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                      <FiCheck className="text-primary-500 text-xs" />
                    </div>
                    Real-time availability
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                    <div className="w-8 h-8 bg-primary-50 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                      <FiCheck className="text-primary-500 text-xs" />
                    </div>
                    Instant confirmation code
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                    <div className="w-8 h-8 bg-primary-50 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                      <FiCheck className="text-primary-500 text-xs" />
                    </div>
                    Free cancellation
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (!isAuthenticated) { toast.info("Please login to book a table"); navigate("/login"); return; }
                    setBookingOpen(true);
                  }}
                  className="btn-primary w-full text-base"
                >
                  Reserve a Table →
                </button>

                {restaurant.phone && (
                  <a href={`tel:${restaurant.phone}`} className="block text-center mt-3 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-500 transition-colors">
                    Or call {restaurant.phone}
                  </a>
                )}
              </div>

              {/* Tags */}
              {restaurant.tags?.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-4">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {restaurant.tags.map((t, i) => (
                      <span key={i} className="badge badge-info">{t}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal restaurant={restaurant} isOpen={bookingOpen} onClose={() => setBookingOpen(false)} />
    </div>
  );
};

export default RestaurantDetailPage;
