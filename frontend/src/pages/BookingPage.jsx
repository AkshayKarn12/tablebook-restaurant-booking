// src/pages/BookingPage.jsx
// Standalone booking page — wraps the BookingModal in a full page context
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { restaurantAPI } from "../services/api";
import BookingModal from "../components/restaurant/BookingModal";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { toast } from "react-toastify";

const BookingPage = () => {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    restaurantAPI.getById(restaurantId)
      .then(({ data }) => setRestaurant(data.restaurant))
      .catch(() => { toast.error("Restaurant not found"); navigate("/restaurants"); })
      .finally(() => setLoading(false));
  }, [restaurantId]);

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 pt-16 flex items-center justify-center">
      <BookingModal
        restaurant={restaurant}
        isOpen={true}
        onClose={() => navigate(`/restaurants/${restaurantId}`)}
      />
    </div>
  );
};

export default BookingPage;
