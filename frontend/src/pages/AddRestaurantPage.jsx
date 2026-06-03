// src/pages/AddRestaurantPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiUpload, FiPlus, FiX } from "react-icons/fi";
import { restaurantAPI } from "../services/api";
import { toast } from "react-toastify";

const CUISINES = ["Indian", "Italian", "Japanese", "Chinese", "American", "Thai", "Mexican", "Seafood", "South Indian", "Continental"];
const AMENITIES = ["WiFi", "Parking", "AC", "Outdoor Seating", "Live Music", "Valet", "Takeaway", "Delivery"];
const TIME_SLOTS = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00", "00:00"];
const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

const AddRestaurantPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const [form, setForm] = useState({
    name: "",
    description: "",
    phone: "",
    email: "",
    priceRange: "$$",
    cuisine: [],
    amenities: [],
    tags: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
    },
    openingHours: DAYS.reduce((acc, day) => ({
      ...acc,
      [day]: { open: "11:00", close: "22:00", isOpen: true }
    }), {}),
    tables: [
      { tableNumber: 1, capacity: 2 },
      { tableNumber: 2, capacity: 4 },
      { tableNumber: 3, capacity: 6 },
    ],
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddressChange = (e) => {
    setForm({ ...form, address: { ...form.address, [e.target.name]: e.target.value } });
  };

  const toggleCuisine = (c) => {
    setForm((prev) => ({
      ...prev,
      cuisine: prev.cuisine.includes(c)
        ? prev.cuisine.filter((x) => x !== c)
        : [...prev.cuisine, c],
    }));
  };

  const toggleAmenity = (a) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(a)
        ? prev.amenities.filter((x) => x !== a)
        : [...prev.amenities, a],
    }));
  };

  const handleHoursChange = (day, field, value) => {
    setForm((prev) => ({
      ...prev,
      openingHours: {
        ...prev.openingHours,
        [day]: { ...prev.openingHours[day], [field]: value },
      },
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    const previews = files.map((f) => URL.createObjectURL(f));
    setImagePreviews(previews);
  };

  const addTable = () => {
    setForm((prev) => ({
      ...prev,
      tables: [
        ...prev.tables,
        { tableNumber: prev.tables.length + 1, capacity: 2 },
      ],
    }));
  };

  const removeTable = (index) => {
    setForm((prev) => ({
      ...prev,
      tables: prev.tables.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.cuisine.length === 0) {
      toast.error("Please select at least one cuisine");
      return;
    }
    if (form.tables.length === 0) {
      toast.error("Please add at least one table");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("phone", form.phone);
      formData.append("email", form.email);
      formData.append("priceRange", form.priceRange);
      formData.append("cuisine", JSON.stringify(form.cuisine));
      formData.append("address", JSON.stringify(form.address));
      formData.append("openingHours", JSON.stringify(form.openingHours));
      formData.append("tables", JSON.stringify(form.tables));
      formData.append("amenities", JSON.stringify(form.amenities));
      formData.append("tags", JSON.stringify(form.tags.split(",").map((t) => t.trim()).filter(Boolean)));

      images.forEach((img) => formData.append("images", img));

      await restaurantAPI.create(formData);
      toast.success("Restaurant submitted for approval! 🎉");
      navigate("/owner");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create restaurant");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 pt-20">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Add Your Restaurant 🏪
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            Fill in the details below. Your restaurant will be reviewed by admin before going live.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Basic Info */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6 space-y-4">
              <h2 className="font-semibold text-gray-900 dark:text-white text-lg">Basic Information</h2>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Restaurant Name *</label>
                <input type="text" name="name" value={form.name} onChange={handleChange}
                  placeholder="e.g. The Grand Spice" className="input-field" required />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Description *</label>
                <textarea name="description" value={form.description} onChange={handleChange}
                  placeholder="Describe your restaurant..." rows={3}
                  className="input-field resize-none" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Phone *</label>
                  <input type="tel" name="phone" value={form.phone} onChange={handleChange}
                    placeholder="+91 XXXXX XXXXX" className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
                  <input type="email" name="email" value={form.email} onChange={handleChange}
                    placeholder="restaurant@email.com" className="input-field" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Price Range *</label>
                <div className="flex gap-3">
                  {["$", "$$", "$$$", "$$$$"].map((p) => (
                    <button key={p} type="button" onClick={() => setForm({ ...form, priceRange: p })}
                      className={`px-4 py-2 rounded-xl border-2 font-bold transition-all ${
                        form.priceRange === p
                          ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600"
                          : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300"
                      }`}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6 space-y-4">
              <h2 className="font-semibold text-gray-900 dark:text-white text-lg">Address</h2>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Street *</label>
                <input type="text" name="street" value={form.address.street} onChange={handleAddressChange}
                  placeholder="123 Main Street" className="input-field" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">City *</label>
                  <input type="text" name="city" value={form.address.city} onChange={handleAddressChange}
                    placeholder="Mumbai" className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">State *</label>
                  <input type="text" name="state" value={form.address.state} onChange={handleAddressChange}
                    placeholder="Maharashtra" className="input-field" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">ZIP Code *</label>
                <input type="text" name="zipCode" value={form.address.zipCode} onChange={handleAddressChange}
                  placeholder="400001" className="input-field" required />
              </div>
            </div>

            {/* Cuisine */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6">
              <h2 className="font-semibold text-gray-900 dark:text-white text-lg mb-3">Cuisine Types *</h2>
              <div className="flex flex-wrap gap-2">
                {CUISINES.map((c) => (
                  <button key={c} type="button" onClick={() => toggleCuisine(c)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      form.cuisine.includes(c)
                        ? "bg-primary-500 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    }`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Amenities */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6">
              <h2 className="font-semibold text-gray-900 dark:text-white text-lg mb-3">Amenities</h2>
              <div className="flex flex-wrap gap-2">
                {AMENITIES.map((a) => (
                  <button key={a} type="button" onClick={() => toggleAmenity(a)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      form.amenities.includes(a)
                        ? "bg-primary-500 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    }`}>
                    {a}
                  </button>
                ))}
              </div>
            </div>

            {/* Tables */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900 dark:text-white text-lg">Tables *</h2>
                <button type="button" onClick={addTable}
                  className="flex items-center gap-1 text-sm text-primary-600 dark:text-primary-400 font-medium hover:underline">
                  <FiPlus /> Add Table
                </button>
              </div>
              <div className="space-y-3">
                {form.tables.map((table, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-20">
                      Table #{table.tableNumber}
                    </span>
                    <div className="flex items-center gap-2 flex-1">
                      <label className="text-xs text-gray-500">Capacity:</label>
                      <select
                        value={table.capacity}
                        onChange={(e) => {
                          const updated = [...form.tables];
                          updated[index].capacity = parseInt(e.target.value);
                          setForm({ ...form, tables: updated });
                        }}
                        className="input-field py-1.5 text-sm flex-1"
                      >
                        {[2, 4, 6, 8, 10, 12].map((n) => (
                          <option key={n} value={n}>{n} people</option>
                        ))}
                      </select>
                    </div>
                    <button type="button" onClick={() => removeTable(index)}
                      className="text-red-500 hover:text-red-600 p-1">
                      <FiX />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Opening Hours */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6">
              <h2 className="font-semibold text-gray-900 dark:text-white text-lg mb-4">Opening Hours</h2>
              <div className="space-y-3">
                {DAYS.map((day) => (
                  <div key={day} className="flex items-center gap-3">
                    <div className="w-28 flex items-center gap-2">
                      <input type="checkbox" checked={form.openingHours[day].isOpen}
                        onChange={(e) => handleHoursChange(day, "isOpen", e.target.checked)}
                        className="rounded" />
                      <span className="text-sm capitalize font-medium text-gray-700 dark:text-gray-300">{day}</span>
                    </div>
                    {form.openingHours[day].isOpen ? (
                      <div className="flex items-center gap-2 flex-1">
                        <select value={form.openingHours[day].open}
                          onChange={(e) => handleHoursChange(day, "open", e.target.value)}
                          className="input-field py-1.5 text-sm flex-1">
                          {TIME_SLOTS.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <span className="text-gray-400 text-sm">to</span>
                        <select value={form.openingHours[day].close}
                          onChange={(e) => handleHoursChange(day, "close", e.target.value)}
                          className="input-field py-1.5 text-sm flex-1">
                          {TIME_SLOTS.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                    ) : (
                      <span className="text-sm text-red-500 font-medium">Closed</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Images */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6">
              <h2 className="font-semibold text-gray-900 dark:text-white text-lg mb-3">Restaurant Images</h2>
              <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:border-primary-400 transition-colors">
                <FiUpload className="text-3xl text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">Click to upload images</span>
                <span className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB each</span>
                <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
              {imagePreviews.length > 0 && (
                <div className="flex gap-3 mt-4 flex-wrap">
                  {imagePreviews.map((src, i) => (
                    <img key={i} src={src} alt="" className="w-20 h-20 rounded-xl object-cover" />
                  ))}
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6">
              <h2 className="font-semibold text-gray-900 dark:text-white text-lg mb-3">Tags</h2>
              <input type="text" name="tags" value={form.tags} onChange={handleChange}
                placeholder="Fine Dining, Romantic, Family (comma separated)"
                className="input-field" />
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading} className="btn-primary w-full text-base py-4">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                  Submitting Restaurant...
                </span>
              ) : "Submit Restaurant for Approval 🚀"}
            </button>

          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default AddRestaurantPage;