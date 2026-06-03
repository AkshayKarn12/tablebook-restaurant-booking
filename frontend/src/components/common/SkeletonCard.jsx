// src/components/common/SkeletonCard.jsx
import React from "react";

const SkeletonCard = () => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden">
    <div className="skeleton h-52 w-full" />
    <div className="p-4 space-y-3">
      <div className="flex justify-between">
        <div className="skeleton h-5 w-40 rounded-lg" />
        <div className="skeleton h-5 w-12 rounded-lg" />
      </div>
      <div className="flex gap-2">
        <div className="skeleton h-4 w-16 rounded-full" />
        <div className="skeleton h-4 w-20 rounded-full" />
      </div>
      <div className="skeleton h-4 w-32 rounded-lg" />
      <div className="skeleton h-10 w-full rounded-xl" />
    </div>
  </div>
);

export const SkeletonGrid = ({ count = 6 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}
  </div>
);

export default SkeletonCard;
