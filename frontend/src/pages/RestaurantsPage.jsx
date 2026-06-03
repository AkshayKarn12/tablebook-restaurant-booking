// src/pages/RestaurantsPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiSearch, FiFilter, FiX, FiChevronDown, FiMapPin } from "react-icons/fi";
import { restaurantAPI } from "../services/api";
import RestaurantCard from "../components/restaurant/RestaurantCard";
import { SkeletonGrid } from "../components/common/SkeletonCard";

const CUISINES = ["All", "Indian", "Italian", "Japanese", "Chinese", "American", "Thai", "Mexican", "Seafood", "South Indian", "Continental"];
const PRICE_RANGES = ["$", "$$", "$$$", "$$$$"];
const SORT_OPTIONS = [
  { label: "Newest First", value: "-createdAt" },
  { label: "Top Rated", value: "-averageRating" },
  { label: "Most Popular", value: "-totalBookings" },
  { label: "Name A-Z", value: "name" },
];

const RestaurantsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, currentPage: 1 });
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    cuisine: searchParams.get("cuisine") || "All",
    city: searchParams.get("city") || "",
    minRating: searchParams.get("minRating") || "",
    priceRange: [],
    sort: "-createdAt",
    page: 1,
  });

  const fetchRestaurants = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: filters.page,
        sort: filters.sort,
        limit: 12,
      };
      if (filters.search) params.search = filters.search;
      if (filters.cuisine && filters.cuisine !== "All") params.cuisine = filters.cuisine;
      if (filters.city) params.city = filters.city;
      if (filters.minRating) params.minRating = filters.minRating;
      if (filters.priceRange.length) params.priceRange = filters.priceRange.join(",");

      const { data } = await restaurantAPI.getAll(params);
      setRestaurants(data.restaurants);
      setPagination({ total: data.total, pages: data.pages, currentPage: data.currentPage });
    } catch (err) {
      console.error("Failed to fetch restaurants:", err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchRestaurants(); }, [fetchRestaurants]);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const togglePriceRange = (range) => {
    setFilters((prev) => ({
      ...prev,
      priceRange: prev.priceRange.includes(range)
        ? prev.priceRange.filter((r) => r !== range)
        : [...prev.priceRange, range],
      page: 1,
    }));
  };

  const clearFilters = () => {
    setFilters({ search: "", cuisine: "All", city: "", minRating: "", priceRange: [], sort: "-createdAt", page: 1 });
    setSearchParams({});
  };

  const hasActiveFilters = filters.cuisine !== "All" || filters.city || filters.minRating || filters.priceRange.length > 0 || filters.search;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 pt-20">
      {/* Page Header */}
      <div className="bg-white dark:bg-dark-950 border-b border-gray-100 dark:border-gray-800 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            {/* Search bar */}
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => updateFilter("search", e.target.value)}
                placeholder="Search restaurants, cuisines..."
                className="input-field pl-9 text-sm py-2.5"
              />
              {filters.search && (
                <button onClick={() => updateFilter("search", "")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <FiX />
                </button>
              )}
            </div>

            {/* City filter */}
            <div className="relative sm:w-44">
              <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                value={filters.city}
                onChange={(e) => updateFilter("city", e.target.value)}
                placeholder="City..."
                className="input-field pl-8 text-sm py-2.5"
              />
            </div>

            {/* Sort */}
            <div className="relative sm:w-44">
              <select
                value={filters.sort}
                onChange={(e) => updateFilter("sort", e.target.value)}
                className="input-field text-sm py-2.5 appearance-none pr-8 cursor-pointer"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* Filter button */}
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 font-medium text-sm transition-all ${
                hasActiveFilters
                  ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
                  : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300"
              }`}
            >
              <FiFilter />
              Filters
              {hasActiveFilters && (
                <span className="w-5 h-5 bg-primary-500 text-white rounded-full text-xs flex items-center justify-center">
                  {[filters.cuisine !== "All", filters.minRating, filters.priceRange.length > 0].filter(Boolean).length}
                </span>
              )}
            </button>
          </div>

          {/* Expandable filter panel */}
          <AnimatePresence>
            {filtersOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-4 pb-2 space-y-4">
                  {/* Cuisine pills */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Cuisine</p>
                    <div className="flex flex-wrap gap-2">
                      {CUISINES.map((c) => (
                        <button
                          key={c}
                          onClick={() => updateFilter("cuisine", c)}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                            filters.cuisine === c
                              ? "bg-primary-500 text-white"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-6">
                    {/* Price range */}
                    <div>
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Price Range</p>
                      <div className="flex gap-2">
                        {PRICE_RANGES.map((p) => (
                          <button
                            key={p}
                            onClick={() => togglePriceRange(p)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium border-2 transition-all ${
                              filters.priceRange.includes(p)
                                ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
                                : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400"
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Rating filter */}
                    <div>
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Min Rating</p>
                      <div className="flex gap-2">
                        {["", "3", "3.5", "4", "4.5"].map((r) => (
                          <button
                            key={r}
                            onClick={() => updateFilter("minRating", r)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium border-2 transition-all ${
                              filters.minRating === r
                                ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
                                : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400"
                            }`}
                          >
                            {r ? `${r}+★` : "Any"}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {hasActiveFilters && (
                    <button onClick={clearFilters} className="text-sm text-red-500 hover:text-red-600 font-medium flex items-center gap-1">
                      <FiX /> Clear all filters
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Result count */}
        {!loading && (
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              <span className="font-semibold text-gray-900 dark:text-white">{pagination.total}</span>{" "}
              restaurant{pagination.total !== 1 ? "s" : ""} found
              {filters.search && <> for "<span className="text-primary-600 dark:text-primary-400">{filters.search}</span>"</>}
            </p>
          </div>
        )}

        {loading ? (
          <SkeletonGrid count={12} />
        ) : restaurants.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="font-display text-xl font-bold text-gray-900 dark:text-white mb-2">No restaurants found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Try adjusting your filters or search term.</p>
            <button onClick={clearFilters} className="btn-primary">Clear Filters</button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {restaurants.map((r) => (
                <RestaurantCard key={r._id} restaurant={r} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                <button
                  onClick={() => setFilters((p) => ({ ...p, page: p.page - 1 }))}
                  disabled={filters.page === 1}
                  className="btn-secondary px-4 py-2 text-sm disabled:opacity-40"
                >
                  ← Prev
                </button>
                {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === pagination.pages || Math.abs(p - filters.page) <= 1)
                  .map((p, i, arr) => (
                    <React.Fragment key={p}>
                      {i > 0 && arr[i - 1] !== p - 1 && <span className="px-2 py-2 text-gray-400">...</span>}
                      <button
                        onClick={() => setFilters((prev) => ({ ...prev, page: p }))}
                        className={`w-10 h-10 rounded-xl text-sm font-medium ${
                          filters.page === p ? "bg-primary-500 text-white" : "btn-secondary"
                        }`}
                      >
                        {p}
                      </button>
                    </React.Fragment>
                  ))}
                <button
                  onClick={() => setFilters((p) => ({ ...p, page: p.page + 1 }))}
                  disabled={filters.page === pagination.pages}
                  className="btn-secondary px-4 py-2 text-sm disabled:opacity-40"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RestaurantsPage;
