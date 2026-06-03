// src/components/restaurant/RestaurantCard.jsx
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiStar, FiMapPin, FiHeart, FiUsers } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { userAPI } from "../../services/api";
import { toast } from "react-toastify";

const PriceRange = ({ range }) => {
  const levels = ["$", "$$", "$$$", "$$$$"];
  const idx = levels.indexOf(range);
  return (
    <span className="text-xs font-medium">
      {levels.map((l, i) => (
        <span key={i} className={i <= idx ? "text-primary-500" : "text-gray-300 dark:text-gray-600"}>{l}</span>
      ))}
    </span>
  );
};

const RestaurantCard = ({ restaurant, onFavoriteToggle }) => {
  const { isAuthenticated, user } = useAuth();
  const [isFav, setIsFav] = React.useState(
    user?.favorites?.includes(restaurant._id)
  );
  const [favLoading, setFavLoading] = React.useState(false);

  const handleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.info("Please login to save favorites");
      return;
    }
    setFavLoading(true);
    try {
      const { data } = await userAPI.toggleFavorite(restaurant._id);
      setIsFav(data.isFavorite);
      if (onFavoriteToggle) onFavoriteToggle(restaurant._id, data.isFavorite);
    } catch {
      toast.error("Failed to update favorites");
    } finally {
      setFavLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="group bg-white dark:bg-gray-800 rounded-2xl shadow-card hover:shadow-card-hover overflow-hidden transition-all duration-300"
    >
      <Link to={`/restaurants/${restaurant._id}`}>
        {/* Image */}
        <div className="relative h-52 overflow-hidden">
          <img
            src={restaurant.coverImage || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600"}
            alt={restaurant.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.target.src = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600";
            }}
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Price range badge */}
          <div className="absolute top-3 left-3">
            <span className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-200">
              {restaurant.priceRange}
            </span>
          </div>

          {/* Favorite button */}
          <button
            onClick={handleFavorite}
            disabled={favLoading}
            className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-200 ${
              isFav
                ? "bg-red-500 text-white"
                : "bg-white/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 hover:bg-red-50 hover:text-red-500"
            }`}
          >
            <FiHeart className={`text-sm ${isFav ? "fill-current" : ""}`} />
          </button>

          {/* Featured badge */}
          {restaurant.isFeatured && (
            <div className="absolute bottom-3 left-3">
              <span className="bg-gradient-to-r from-primary-500 to-amber-500 text-white text-xs font-semibold px-2.5 py-1 rounded-lg">
                ⭐ Featured
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Name & Rating */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-display font-semibold text-gray-900 dark:text-white text-base leading-tight line-clamp-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              {restaurant.name}
            </h3>
            <div className="flex items-center gap-1 flex-shrink-0">
              <FiStar className="text-amber-400 fill-current text-sm" />
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {restaurant.averageRating?.toFixed(1) || "New"}
              </span>
              {restaurant.totalReviews > 0 && (
                <span className="text-xs text-gray-400">({restaurant.totalReviews})</span>
              )}
            </div>
          </div>

          {/* Cuisine tags */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {restaurant.cuisine?.slice(0, 3).map((c, i) => (
              <span key={i} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">
                {c}
              </span>
            ))}
          </div>

          {/* Location & Capacity */}
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <FiMapPin className="text-primary-400 flex-shrink-0" />
              <span className="truncate max-w-[140px]">
                {restaurant.address?.city}, {restaurant.address?.state}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <FiUsers className="text-gray-400" />
              <span>{restaurant.totalTables || 0} tables</span>
            </div>
          </div>
        </div>

        {/* Book button */}
        <div className="px-4 pb-4">
          <div className="w-full text-center py-2.5 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-sm font-semibold group-hover:bg-primary-500 group-hover:text-white transition-all duration-300">
            Book a Table →
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default RestaurantCard;
