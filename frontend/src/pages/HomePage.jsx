// src/pages/HomePage.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import {
  FiSearch, FiMapPin, FiStar, FiArrowRight,
  FiShield, FiClock, FiAward, FiUsers,
} from "react-icons/fi";
import { MdRestaurant } from "react-icons/md";
import { restaurantAPI } from "../services/api";
import RestaurantCard from "../components/restaurant/RestaurantCard";
import { SkeletonGrid } from "../components/common/SkeletonCard";

// ─── Animated Counter ─────────────────────────────────────────
const Counter = ({ target, suffix = "" }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const step = target / 60;
    const interval = setInterval(() => {
      setCount((prev) => {
        const next = prev + step;
        if (next >= target) { clearInterval(interval); return target; }
        return next;
      });
    }, 16);
    return () => clearInterval(interval);
  }, [inView, target]);

  return <span ref={ref}>{Math.floor(count)}{suffix}</span>;
};

// ─── Cuisine Filter Pills ─────────────────────────────────────
const CUISINES = ["All", "Indian", "Italian", "Japanese", "Chinese", "American", "Thai", "Mexican", "Seafood"];

// ─── Hero Section ─────────────────────────────────────────────
const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (selectedCity) params.set("city", selectedCity);
    navigate(`/restaurants?${params.toString()}`);
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&q=80"
          alt="Restaurant ambiance"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary-950/40 to-transparent" />
      </div>

      {/* Floating food cards - decorative */}
      <motion.div
        animate={{ y: [-10, 10, -10] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        className="absolute top-32 right-10 hidden xl:block"
      >
        <div className="glass-card p-3 w-48 shadow-xl">
          <div className="flex items-center gap-3">
            <img src="https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=60&h=60&fit=crop" className="w-12 h-12 rounded-xl object-cover" />
            <div>
              <p className="text-xs font-semibold text-gray-900 dark:text-white">Sakura Garden</p>
              <div className="flex items-center gap-1"><FiStar className="text-amber-400 fill-current text-xs" /><span className="text-xs text-gray-600">4.9 • Japanese</span></div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [10, -10, 10] }}
        transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 0.5 }}
        className="absolute bottom-40 right-16 hidden xl:block"
      >
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 w-44 shadow-xl">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <FiStar className="text-white text-sm" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Live Booking</p>
              <p className="text-xs text-green-300">3 tables left!</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-white/90 text-sm font-medium">Real-time table availability</span>
            </div>

            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
              Discover &{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-amber-400">
                Book
              </span>
              <br />
              Extraordinary
              <br />
              Dining
            </h1>

            <p className="text-white/75 text-lg sm:text-xl mb-10 max-w-xl leading-relaxed">
              From cozy bistros to Michelin-starred experiences — find your perfect table and book it in seconds.
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <form onSubmit={handleSearch} className="bg-white dark:bg-gray-900 rounded-2xl p-2 shadow-2xl flex flex-col sm:flex-row gap-2">
              <div className="flex-1 flex items-center gap-2 px-3">
                <FiSearch className="text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Restaurant, cuisine, dish..."
                  className="w-full py-2 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none text-sm"
                />
              </div>
              <div className="w-px bg-gray-200 dark:bg-gray-700 hidden sm:block" />
              <div className="flex items-center gap-2 px-3">
                <FiMapPin className="text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  placeholder="City or area..."
                  className="w-full sm:w-36 py-2 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none text-sm"
                />
              </div>
              <button type="submit" className="btn-primary sm:rounded-xl text-sm px-8 py-3">
                Search
              </button>
            </form>

            {/* Quick cuisine links */}
            <div className="flex flex-wrap gap-2 mt-4">
              {["Indian", "Italian", "Japanese", "Seafood", "Chinese"].map((c) => (
                <button
                  key={c}
                  onClick={() => navigate(`/restaurants?cuisine=${c}`)}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-full text-white text-xs font-medium transition-all"
                >
                  {c}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center pt-2">
          <div className="w-1.5 h-2.5 bg-white/60 rounded-full" />
        </div>
      </motion.div>
    </section>
  );
};

// ─── Stats Section ─────────────────────────────────────────────
const StatsSection = () => (
  <section className="py-16 bg-gradient-to-r from-primary-600 to-amber-600">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {[
          { value: 500, suffix: "+", label: "Restaurants" },
          { value: 50000, suffix: "+", label: "Happy Diners" },
          { value: 25, suffix: "+", label: "Cities" },
          { value: 4.8, suffix: "★", label: "Avg Rating" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="text-center"
          >
            <p className="font-display text-4xl font-bold text-white">
              <Counter target={stat.value} suffix={stat.suffix} />
            </p>
            <p className="text-primary-100 text-sm mt-1 font-medium">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

// ─── Featured Restaurants ────────────────────────────────────
const FeaturedSection = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    restaurantAPI.getFeatured()
      .then(({ data }) => setRestaurants(data.restaurants))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-20 bg-gray-50 dark:bg-dark-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-end justify-between mb-10"
        >
          <div>
            <span className="text-primary-500 font-semibold text-sm uppercase tracking-wider">Handpicked for you</span>
            <h2 className="section-title mt-1">Featured Restaurants</h2>
            <p className="section-subtitle">Our curated selection of extraordinary dining experiences</p>
          </div>
          <Link to="/restaurants" className="hidden sm:flex items-center gap-1 text-primary-600 dark:text-primary-400 font-semibold text-sm hover:gap-2 transition-all">
            View all <FiArrowRight />
          </Link>
        </motion.div>

        {loading ? <SkeletonGrid count={6} /> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((r, i) => (
              <motion.div
                key={r._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <RestaurantCard restaurant={r} />
              </motion.div>
            ))}
          </div>
        )}

        <div className="text-center mt-10">
          <Link to="/restaurants" className="btn-outline inline-flex items-center gap-2">
            Explore All Restaurants <FiArrowRight />
          </Link>
        </div>
      </div>
    </section>
  );
};

// ─── Cuisines Section ─────────────────────────────────────────
const CuisinesSection = () => {
  const navigate = useNavigate();
  const cuisines = [
    { name: "Indian", emoji: "🍛", color: "from-orange-400 to-red-500", count: "120+ places" },
    { name: "Italian", emoji: "🍕", color: "from-green-400 to-teal-500", count: "85+ places" },
    { name: "Japanese", emoji: "🍱", color: "from-red-400 to-pink-500", count: "60+ places" },
    { name: "Chinese", emoji: "🥢", color: "from-yellow-400 to-orange-500", count: "95+ places" },
    { name: "American", emoji: "🍔", color: "from-blue-400 to-indigo-500", count: "75+ places" },
    { name: "Thai", emoji: "🍜", color: "from-purple-400 to-pink-500", count: "45+ places" },
    { name: "Seafood", emoji: "🦞", color: "from-cyan-400 to-blue-500", count: "50+ places" },
    { name: "Mexican", emoji: "🌮", color: "from-amber-400 to-orange-500", count: "35+ places" },
  ];

  return (
    <section className="py-20 bg-white dark:bg-dark-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-primary-500 font-semibold text-sm uppercase tracking-wider">Explore by taste</span>
          <h2 className="section-title mt-1">Popular Cuisines</h2>
          <p className="section-subtitle mx-auto">Find restaurants serving your favorite cuisine style</p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {cuisines.map((c, i) => (
            <motion.button
              key={c.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -4 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate(`/restaurants?cuisine=${c.name}`)}
              className="group relative overflow-hidden rounded-2xl p-5 text-left cursor-pointer"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${c.color} opacity-10 group-hover:opacity-20 transition-opacity`} />
              <div className="relative">
                <span className="text-4xl">{c.emoji}</span>
                <h3 className="font-display font-bold text-gray-900 dark:text-white mt-2">{c.name}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{c.count}</p>
                <div className={`mt-3 w-8 h-0.5 bg-gradient-to-r ${c.color} rounded-full group-hover:w-full transition-all duration-300`} />
              </div>
              <div className={`absolute inset-0 border-2 border-transparent group-hover:border-current rounded-2xl transition-all duration-300 opacity-20`} />
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── How It Works ─────────────────────────────────────────────
const HowItWorks = () => {
  const steps = [
    { icon: FiSearch, title: "Find Your Restaurant", desc: "Browse hundreds of curated restaurants by cuisine, location, or rating." },
    { icon: FiCalendar, title: "Choose Your Slot", desc: "Pick your date, time, and number of guests. Check real-time table availability." },
    { icon: FiUsers, title: "Book Instantly", desc: "Confirm your reservation in seconds. Receive instant confirmation." },
    { icon: MdRestaurant, title: "Enjoy Your Meal", desc: "Arrive at the restaurant and enjoy your premium dining experience." },
  ];

  return (
    <section className="py-20 bg-gray-50 dark:bg-dark-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="text-primary-500 font-semibold text-sm uppercase tracking-wider">Simple & fast</span>
          <h2 className="section-title mt-1">How It Works</h2>
          <p className="section-subtitle mx-auto">Four simple steps to your perfect dining experience</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {/* Connecting line (desktop) */}
          <div className="hidden lg:block absolute top-12 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-primary-200 via-primary-400 to-primary-200 dark:from-primary-900 dark:via-primary-600 dark:to-primary-900" />

          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative text-center"
            >
              <div className="w-20 h-20 bg-white dark:bg-gray-800 border-4 border-primary-100 dark:border-primary-900 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-card relative z-10">
                <step.icon className="text-2xl text-primary-500" />
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-primary-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {i + 1}
                </span>
              </div>
              <h3 className="font-display font-semibold text-gray-900 dark:text-white mb-2">{step.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── Features / USP Section ───────────────────────────────────
const FeaturesSection = () => {
  const features = [
    { icon: FiClock, title: "Real-Time Availability", desc: "Live table updates powered by Socket.IO. No double bookings, ever." },
    { icon: FiShield, title: "Secure Booking", desc: "JWT-secured reservations with instant email confirmation codes." },
    { icon: FiAward, title: "Curated Quality", desc: "Every restaurant is reviewed and approved by our team before listing." },
    { icon: FiStar, title: "Verified Reviews", desc: "Only diners who visited can review — authentic, trustworthy ratings." },
  ];

  return (
    <section className="py-20 bg-white dark:bg-dark-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-primary-500 font-semibold text-sm uppercase tracking-wider">Why choose us</span>
            <h2 className="section-title mt-1 mb-4">
              The Smarter Way<br />to Dine Out
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
              TableBook combines real-time booking technology with a hand-curated restaurant directory to give you the most seamless dining experience possible.
            </p>
            <Link to="/restaurants" className="btn-primary inline-flex items-center gap-2">
              Start Exploring <FiArrowRight />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-5 hover:shadow-card-hover transition-shadow"
              >
                <div className="w-11 h-11 bg-primary-50 dark:bg-primary-900/30 rounded-xl flex items-center justify-center mb-3">
                  <f.icon className="text-primary-500 text-xl" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{f.title}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// ─── Testimonials ─────────────────────────────────────────────
const TestimonialsSection = () => {
  const testimonials = [
    { name: "Priya Sharma", role: "Food Blogger", avatar: "https://ui-avatars.com/api/?name=Priya+Sharma&background=f97316&color=fff", text: "TableBook made our anniversary dinner absolutely seamless. The real-time booking was instant and the restaurant was exactly as described!", rating: 5 },
    { name: "Rahul Mehta", role: "Business Traveler", avatar: "https://ui-avatars.com/api/?name=Rahul+Mehta&background=3b82f6&color=fff", text: "As someone who travels for work, I rely on TableBook to find great restaurants quickly. The filters are incredibly useful.", rating: 5 },
    { name: "Ananya Patel", role: "Food Enthusiast", avatar: "https://ui-avatars.com/api/?name=Ananya+Patel&background=8b5cf6&color=fff", text: "Love the diversity of restaurants listed here. Found an amazing hidden gem last week through TableBook's cuisine filters!", rating: 5 },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 to-dark-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-primary-400 font-semibold text-sm uppercase tracking-wider">Loved by diners</span>
          <h2 className="section-title mt-1 text-white">What Our Users Say</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(t.rating)].map((_, j) => (
                  <FiStar key={j} className="text-amber-400 fill-current text-sm" />
                ))}
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mb-5">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full" />
                <div>
                  <p className="font-semibold text-white text-sm">{t.name}</p>
                  <p className="text-gray-400 text-xs">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── CTA Section ──────────────────────────────────────────────
const CTASection = () => (
  <section className="py-20 bg-white dark:bg-dark-900">
    <div className="max-w-4xl mx-auto px-4 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h2 className="font-display text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Ready to Find Your<br />Perfect Table?
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-lg mb-8 max-w-xl mx-auto">
          Join thousands of food lovers who book their dining experiences through TableBook.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/restaurants" className="btn-primary text-base px-8 py-3.5 inline-flex items-center gap-2">
            Explore Restaurants <FiArrowRight />
          </Link>
          <Link to="/signup?role=owner" className="btn-secondary text-base px-8 py-3.5">
            List Your Restaurant
          </Link>
        </div>
      </motion.div>
    </div>
  </section>
);

// ─── Main HomePage ────────────────────────────────────────────
import { FiCalendar } from "react-icons/fi";

const HomePage = () => (
  <div>
    <HeroSection />
    <StatsSection />
    <FeaturedSection />
    <CuisinesSection />
    <HowItWorks />
    <FeaturesSection />
    <TestimonialsSection />
    <CTASection />
  </div>
);

export default HomePage;
