// src/pages/FavoritesPage.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiHeart } from "react-icons/fi";
import { userAPI } from "../services/api";
import { toast } from "react-toastify";
import RestaurantCard from "../components/restaurant/RestaurantCard";
import LoadingSpinner from "../components/common/LoadingSpinner";

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userAPI.getFavorites()
      .then(({ data }) => setFavorites(data.favorites))
      .catch(() => toast.error("Failed to load favorites"))
      .finally(() => setLoading(false));
  }, []);

  const handleFavoriteToggle = (restaurantId, isFavorite) => {
    if (!isFavorite) {
      setFavorites((prev) => prev.filter((r) => r._id !== restaurantId));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
              <FiHeart className="text-red-500 fill-current" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">
                My Favorites
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {favorites.length} saved restaurant{favorites.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </motion.div>

        {loading ? (
          <LoadingSpinner />
        ) : favorites.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-card">
            <div className="text-6xl mb-4">❤️</div>
            <h3 className="font-display text-xl font-bold text-gray-900 dark:text-white mb-2">
              No favorites yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Start exploring and heart the restaurants you love.
            </p>
            <Link to="/restaurants" className="btn-primary">
              Explore Restaurants
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((restaurant, i) => (
              <motion.div
                key={restaurant._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <RestaurantCard
                  restaurant={restaurant}
                  onFavoriteToggle={handleFavoriteToggle}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
