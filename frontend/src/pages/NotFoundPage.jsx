// src/pages/NotFoundPage.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowLeft, FiHome } from "react-icons/fi";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", damping: 20 }}
        >
          {/* Animated 404 */}
          <motion.div
            animate={{ y: [-10, 10, -10] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="text-9xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-amber-400 select-none mb-2"
          >
            404
          </motion.div>

          <div className="text-5xl mb-4">🍽️</div>

          <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Table Not Found
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm leading-relaxed">
            Looks like this page wandered off the menu. The page you're looking for doesn't exist or has been moved.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate(-1)}
              className="btn-secondary flex items-center justify-center gap-2"
            >
              <FiArrowLeft /> Go Back
            </button>
            <Link to="/" className="btn-primary flex items-center justify-center gap-2">
              <FiHome /> Back to Home
            </Link>
          </div>

          <div className="mt-10">
            <p className="text-sm text-gray-400 mb-3">Or explore these pages:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {[["Restaurants", "/restaurants"], ["Login", "/login"], ["Sign Up", "/signup"]].map(([label, href]) => (
                <Link
                  key={label}
                  to={href}
                  className="px-4 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm text-gray-600 dark:text-gray-300 hover:border-primary-300 hover:text-primary-600 transition-all"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFoundPage;
