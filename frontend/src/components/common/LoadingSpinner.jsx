// src/components/common/LoadingSpinner.jsx
import React from "react";
import { motion } from "framer-motion";

const LoadingSpinner = ({ fullScreen, size = "md" }) => {
  const sizes = { sm: "w-5 h-5", md: "w-8 h-8", lg: "w-12 h-12" };

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white dark:bg-dark-900">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 border-3 border-gray-200 border-t-primary-500 rounded-full"
          style={{ borderWidth: "3px" }}
        />
        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center p-8">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
        className={`${sizes[size]} border-gray-200 border-t-primary-500 rounded-full`}
        style={{ borderWidth: "3px", borderStyle: "solid" }}
      />
    </div>
  );
};

export default LoadingSpinner;
