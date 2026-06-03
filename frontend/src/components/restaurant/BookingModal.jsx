// src/components/restaurant/BookingModal.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiCalendar, FiClock, FiUsers, FiCheck, FiAlertCircle } from "react-icons/fi";
import { restaurantAPI, bookingAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { format, addDays } from "date-fns";

const TIME_SLOTS = [
  "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
  "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM",
  "06:00 PM", "06:30 PM", "07:00 PM", "07:30 PM",
  "08:00 PM", "08:30 PM", "09:00 PM", "09:30 PM",
];

const BookingModal = ({ restaurant, isOpen, onClose }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1=select, 2=details, 3=confirm
  const [form, setForm] = useState({
    date: format(addDays(new Date(), 1), "yyyy-MM-dd"),
    timeSlot: "",
    guests: 2,
    specialRequests: "",
    guestName: "",
    guestPhone: "",
  });
  const [availability, setAvailability] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [checkingAvail, setCheckingAvail] = useState(false);
  const [booking, setBooking] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Reset when closed
  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setAvailability(null);
      setSelectedTable(null);
      setConfirmedBooking(null);
    }
  }, [isOpen]);

  const checkAvailability = async () => {
    if (!form.date || !form.timeSlot) {
      toast.warning("Please select a date and time slot");
      return;
    }
    setCheckingAvail(true);
    try {
      const { data } = await restaurantAPI.checkAvailability(restaurant._id, {
        date: form.date,
        timeSlot: form.timeSlot,
        guests: form.guests,
      });
      setAvailability(data);
      if (data.availableTables.length > 0) {
        setSelectedTable(data.availableTables[0]);
        setStep(2);
      } else {
        toast.error("No tables available for this selection. Try a different time.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to check availability");
    } finally {
      setCheckingAvail(false);
    }
  };

  const confirmBooking = async () => {
    if (!isAuthenticated) {
      onClose();
      navigate("/login");
      return;
    }
    if (!selectedTable) {
      toast.error("Please select a table");
      return;
    }
    setBooking(true);
    try {
      const { data } = await bookingAPI.create({
        restaurantId: restaurant._id,
        tableNumber: selectedTable.tableNumber,
        date: form.date,
        timeSlot: form.timeSlot,
        guests: form.guests,
        specialRequests: form.specialRequests,
        guestName: form.guestName,
        guestPhone: form.guestPhone,
      });
      setConfirmedBooking(data.booking);
      setStep(3);
      toast.success("🎉 Table booked successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Booking failed. Please try again.");
    } finally {
      setBooking(false);
    }
  };

  const today = format(new Date(), "yyyy-MM-dd");
  const maxDate = format(addDays(new Date(), 60), "yyyy-MM-dd");

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative z-10 w-full sm:max-w-lg bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-primary-600 to-amber-600 px-6 py-5">
              <div className="pr-10">
                <h2 className="font-display text-xl font-bold text-white">Reserve a Table</h2>
                <p className="text-primary-100 text-sm mt-0.5 truncate">{restaurant?.name}</p>
              </div>
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
              >
                <FiX />
              </button>

              {/* Step indicators */}
              {step < 3 && (
                <div className="flex gap-2 mt-4">
                  {["Select Time", "Guest Details", "Confirm"].slice(0, 2).map((label, i) => (
                    <div key={i} className={`flex items-center gap-1.5 ${i > 0 ? "opacity-60" : ""}`}>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                        step > i + 1 ? "bg-white text-primary-600" :
                        step === i + 1 ? "bg-white text-primary-600" : "bg-white/30 text-white"
                      }`}>
                        {step > i + 1 ? <FiCheck className="text-xs" /> : i + 1}
                      </div>
                      <span className="text-xs text-white/80 hidden sm:block">{label}</span>
                      {i < 1 && <div className="w-8 h-px bg-white/40 mx-1" />}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {/* Step 1: Date, Time, Guests */}
              {step === 1 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                  {/* Date */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      <FiCalendar className="inline mr-1.5 text-primary-500" />
                      Select Date
                    </label>
                    <input
                      type="date"
                      min={today}
                      max={maxDate}
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      className="input-field"
                    />
                  </div>

                  {/* Guests */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      <FiUsers className="inline mr-1.5 text-primary-500" />
                      Number of Guests
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setForm({ ...form, guests: Math.max(1, form.guests - 1) })}
                        className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-lg font-bold hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
                      >
                        −
                      </button>
                      <span className="text-2xl font-bold text-gray-900 dark:text-white w-8 text-center">
                        {form.guests}
                      </span>
                      <button
                        onClick={() => setForm({ ...form, guests: Math.min(20, form.guests + 1) })}
                        className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-lg font-bold hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
                      >
                        +
                      </button>
                      <span className="text-sm text-gray-500 ml-1">guests</span>
                    </div>
                  </div>

                  {/* Time Slots */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <FiClock className="inline mr-1.5 text-primary-500" />
                      Select Time Slot
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {TIME_SLOTS.map((slot) => (
                        <button
                          key={slot}
                          onClick={() => setForm({ ...form, timeSlot: slot })}
                          className={`py-2 px-1 rounded-xl text-xs font-medium border-2 transition-all ${
                            form.timeSlot === slot
                              ? "border-primary-500 bg-primary-500 text-white"
                              : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary-300"
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={checkAvailability}
                    disabled={checkingAvail || !form.date || !form.timeSlot}
                    className="btn-primary w-full"
                  >
                    {checkingAvail ? (
                      <span className="flex items-center justify-center gap-2">
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                          className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                        Checking Availability...
                      </span>
                    ) : "Check Availability →"}
                  </button>
                </motion.div>
              )}

              {/* Step 2: Guest Details & Table Selection */}
              {step === 2 && availability && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                  {/* Availability summary */}
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-3 flex items-center gap-2">
                    <FiCheck className="text-green-500 flex-shrink-0" />
                    <span className="text-sm text-green-700 dark:text-green-400 font-medium">
                      {availability.totalAvailable} table{availability.totalAvailable > 1 ? "s" : ""} available for {form.guests} guests on {form.date} at {form.timeSlot}
                    </span>
                  </div>

                  {/* Table Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Select Table</label>
                    <div className="grid grid-cols-3 gap-2">
                      {availability.availableTables.map((table) => (
                        <button
                          key={table.tableNumber}
                          onClick={() => setSelectedTable(table)}
                          className={`p-3 rounded-xl border-2 text-center transition-all ${
                            selectedTable?.tableNumber === table.tableNumber
                              ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                              : "border-gray-200 dark:border-gray-700 hover:border-primary-300"
                          }`}
                        >
                          <div className="text-lg">🪑</div>
                          <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">Table {table.tableNumber}</div>
                          <div className="text-xs text-gray-500">Up to {table.capacity}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Guest Name & Phone */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Your Name</label>
                      <input
                        type="text"
                        placeholder="Full name"
                        value={form.guestName}
                        onChange={(e) => setForm({ ...form, guestName: e.target.value })}
                        className="input-field text-sm py-2.5"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Phone</label>
                      <input
                        type="tel"
                        placeholder="+91 XXXXX"
                        value={form.guestPhone}
                        onChange={(e) => setForm({ ...form, guestPhone: e.target.value })}
                        className="input-field text-sm py-2.5"
                      />
                    </div>
                  </div>

                  {/* Special Requests */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                      Special Requests <span className="text-gray-400">(optional)</span>
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Allergies, seating preferences, celebrations..."
                      value={form.specialRequests}
                      onChange={(e) => setForm({ ...form, specialRequests: e.target.value })}
                      className="input-field text-sm resize-none"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => setStep(1)} className="btn-secondary flex-1">← Back</button>
                    <button
                      onClick={confirmBooking}
                      disabled={booking || !selectedTable}
                      className="btn-primary flex-1"
                    >
                      {booking ? (
                        <span className="flex items-center justify-center gap-2">
                          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                          Booking...
                        </span>
                      ) : "Confirm Booking"}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Confirmation */}
              {step === 3 && confirmedBooking && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-4"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.1 }}
                    className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-5"
                  >
                    <FiCheck className="text-4xl text-green-500" />
                  </motion.div>
                  <h3 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Booking Confirmed! 🎉
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    Your table has been reserved. We'll see you soon!
                  </p>

                  <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 text-left space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Confirmation</span>
                      <span className="text-sm font-bold text-primary-600 dark:text-primary-400">{confirmedBooking.confirmationCode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Restaurant</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{restaurant.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Date & Time</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{form.date} • {form.timeSlot}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Table</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">Table #{selectedTable?.tableNumber} (up to {selectedTable?.capacity})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Guests</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{form.guests} people</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Status</span>
                      <span className="badge badge-warning">Pending Confirmation</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button onClick={onClose} className="btn-secondary flex-1">Close</button>
                    <button
                      onClick={() => { onClose(); navigate("/dashboard"); }}
                      className="btn-primary flex-1"
                    >
                      View My Bookings
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default BookingModal;
