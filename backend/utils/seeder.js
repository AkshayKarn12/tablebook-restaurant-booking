// ============================================================
// utils/seeder.js — Seed sample restaurants & admin user
// ============================================================
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
dotenv.config();

const User = require("../models/User.model");
const Restaurant = require("../models/Restaurant.model");

const sampleUsers = [
  {
    name: "Admin User",
    email: "admin@tablebook.com",
    password: "Admin@1234",
    role: "admin",
  },
  {
    name: "Restaurant Owner",
    email: "owner@tablebook.com",
    password: "Owner@1234",
    role: "owner",
  },
  {
    name: "John Doe",
    email: "user@tablebook.com",
    password: "User@1234",
    role: "user",
  },
];

const generateTables = (count, capacity) =>
  Array.from({ length: count }, (_, i) => ({
    tableNumber: i + 1,
    capacity,
    isAvailable: true,
  }));

const sampleRestaurants = [
  {
    name: "The Grand Spice",
    description: "An opulent fine-dining experience celebrating the rich tapestry of Indian cuisine. From slow-cooked biryanis to delicate tandoor preparations, every dish is a masterpiece.",
    cuisine: ["Indian", "Mughlai", "North Indian"],
    address: { street: "12 MG Road", city: "Mumbai", state: "Maharashtra", zipCode: "400001" },
    phone: "+91-9876543210",
    email: "info@grandspice.com",
    priceRange: "$$$",
    coverImage: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800",
    images: [
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800",
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800",
    ],
    tables: [
      ...generateTables(4, 2),
      ...generateTables(6, 4),
      ...generateTables(3, 6),
      ...generateTables(2, 8),
    ],
    averageRating: 4.7,
    totalReviews: 342,
    isFeatured: true,
    isApproved: true,
    amenities: ["WiFi", "Parking", "AC", "Valet", "Live Music"],
    tags: ["Fine Dining", "Family", "Date Night"],
    openingHours: {
      monday: { open: "12:00", close: "23:00", isOpen: true },
      tuesday: { open: "12:00", close: "23:00", isOpen: true },
      wednesday: { open: "12:00", close: "23:00", isOpen: true },
      thursday: { open: "12:00", close: "23:00", isOpen: true },
      friday: { open: "12:00", close: "00:00", isOpen: true },
      saturday: { open: "11:00", close: "00:00", isOpen: true },
      sunday: { open: "11:00", close: "22:00", isOpen: true },
    },
  },
  {
    name: "Sakura Garden",
    description: "Authentic Japanese cuisine crafted by a Tokyo-trained chef. Experience sushi, ramen, and omakase tasting menus in a serene zen-inspired setting.",
    cuisine: ["Japanese", "Sushi", "Asian"],
    address: { street: "56 Connaught Place", city: "Delhi", state: "Delhi", zipCode: "110001" },
    phone: "+91-9876543211",
    email: "hello@sakuragarden.com",
    priceRange: "$$$$",
    coverImage: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800",
    images: ["https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800"],
    tables: [...generateTables(5, 2), ...generateTables(5, 4), ...generateTables(2, 6)],
    averageRating: 4.9,
    totalReviews: 218,
    isFeatured: true,
    isApproved: true,
    amenities: ["WiFi", "AC", "Private Dining Room", "Sake Bar"],
    tags: ["Romantic", "Business Lunch", "Special Occasion"],
    openingHours: {
      monday: { open: "12:00", close: "22:00", isOpen: false },
      tuesday: { open: "12:00", close: "22:00", isOpen: true },
      wednesday: { open: "12:00", close: "22:00", isOpen: true },
      thursday: { open: "12:00", close: "22:00", isOpen: true },
      friday: { open: "12:00", close: "23:00", isOpen: true },
      saturday: { open: "11:00", close: "23:00", isOpen: true },
      sunday: { open: "11:00", close: "21:00", isOpen: true },
    },
  },
  {
    name: "La Dolce Vita",
    description: "Step into the heart of Rome with our authentic Italian trattoria. House-made pasta, wood-fired pizzas, and an extensive Italian wine collection.",
    cuisine: ["Italian", "Mediterranean", "Pizza"],
    address: { street: "78 Park Street", city: "Kolkata", state: "West Bengal", zipCode: "700016" },
    phone: "+91-9876543212",
    priceRange: "$$",
    coverImage: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800",
    images: ["https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800"],
    tables: [...generateTables(8, 2), ...generateTables(6, 4), ...generateTables(3, 6)],
    averageRating: 4.5,
    totalReviews: 189,
    isFeatured: true,
    isApproved: true,
    amenities: ["WiFi", "Outdoor Seating", "AC", "Takeaway"],
    tags: ["Casual Dining", "Family", "Pizza"],
    openingHours: {
      monday: { open: "11:00", close: "22:00", isOpen: true },
      tuesday: { open: "11:00", close: "22:00", isOpen: true },
      wednesday: { open: "11:00", close: "22:00", isOpen: true },
      thursday: { open: "11:00", close: "22:00", isOpen: true },
      friday: { open: "11:00", close: "23:00", isOpen: true },
      saturday: { open: "10:00", close: "23:00", isOpen: true },
      sunday: { open: "10:00", close: "22:00", isOpen: true },
    },
  },
  {
    name: "The Coastal Kitchen",
    description: "Fresh-catch seafood and coastal Indian cuisine. Dive into lobster thermidors, prawn masalas, and tangy fish curries from the Malabar coast.",
    cuisine: ["Seafood", "South Indian", "Coastal"],
    address: { street: "34 Marine Drive", city: "Kochi", state: "Kerala", zipCode: "682031" },
    phone: "+91-9876543213",
    priceRange: "$$$",
    coverImage: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800",
    images: ["https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800"],
    tables: [...generateTables(6, 2), ...generateTables(4, 4), ...generateTables(2, 8)],
    averageRating: 4.6,
    totalReviews: 156,
    isFeatured: false,
    isApproved: true,
    amenities: ["Seafront View", "AC", "Parking", "Live Music"],
    tags: ["Seafood", "Scenic View", "Date Night"],
    openingHours: {
      monday: { open: "12:00", close: "22:00", isOpen: true },
      tuesday: { open: "12:00", close: "22:00", isOpen: true },
      wednesday: { open: "12:00", close: "22:00", isOpen: true },
      thursday: { open: "12:00", close: "22:00", isOpen: true },
      friday: { open: "12:00", close: "23:00", isOpen: true },
      saturday: { open: "11:00", close: "23:00", isOpen: true },
      sunday: { open: "11:00", close: "21:00", isOpen: true },
    },
  },
  {
    name: "Burger Lab",
    description: "Craft burgers meet culinary science. Hand-pressed patties, brioche buns baked fresh daily, and 30+ sauce combinations for the ultimate burger experience.",
    cuisine: ["American", "Burgers", "Fast Casual"],
    address: { street: "22 Koregaon Park", city: "Pune", state: "Maharashtra", zipCode: "411001" },
    phone: "+91-9876543214",
    priceRange: "$",
    coverImage: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800",
    images: ["https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800"],
    tables: [...generateTables(10, 2), ...generateTables(5, 4)],
    averageRating: 4.3,
    totalReviews: 421,
    isFeatured: false,
    isApproved: true,
    amenities: ["WiFi", "AC", "Takeaway", "Delivery"],
    tags: ["Quick Bite", "Student Friendly", "Burgers"],
    openingHours: {
      monday: { open: "10:00", close: "23:00", isOpen: true },
      tuesday: { open: "10:00", close: "23:00", isOpen: true },
      wednesday: { open: "10:00", close: "23:00", isOpen: true },
      thursday: { open: "10:00", close: "23:00", isOpen: true },
      friday: { open: "10:00", close: "00:00", isOpen: true },
      saturday: { open: "10:00", close: "00:00", isOpen: true },
      sunday: { open: "11:00", close: "23:00", isOpen: true },
    },
  },
  {
    name: "Spice Route",
    description: "A culinary journey through Southeast Asia. Authentic Thai, Vietnamese, and Indonesian recipes prepared with aromatic herbs and traditional cooking techniques.",
    cuisine: ["Thai", "Vietnamese", "Asian"],
    address: { street: "90 Brigade Road", city: "Bangalore", state: "Karnataka", zipCode: "560001" },
    phone: "+91-9876543215",
    priceRange: "$$",
    coverImage: "https://images.unsplash.com/photo-1562802378-063ec186a863?w=800",
    images: ["https://images.unsplash.com/photo-1562802378-063ec186a863?w=800"],
    tables: [...generateTables(7, 2), ...generateTables(5, 4), ...generateTables(2, 6)],
    averageRating: 4.4,
    totalReviews: 263,
    isFeatured: true,
    isApproved: true,
    amenities: ["WiFi", "AC", "Private Dining", "Cocktail Bar"],
    tags: ["Asian Fusion", "Casual", "Cocktails"],
    openingHours: {
      monday: { open: "12:00", close: "22:30", isOpen: true },
      tuesday: { open: "12:00", close: "22:30", isOpen: true },
      wednesday: { open: "12:00", close: "22:30", isOpen: true },
      thursday: { open: "12:00", close: "22:30", isOpen: true },
      friday: { open: "12:00", close: "23:30", isOpen: true },
      saturday: { open: "11:00", close: "23:30", isOpen: true },
      sunday: { open: "11:00", close: "22:00", isOpen: true },
    },
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    await User.deleteMany({});
    await Restaurant.deleteMany({});
    console.log("🗑️  Cleared existing data");

    // ✅ Hash passwords manually before inserting
    const usersWithHashedPasswords = await Promise.all(
      sampleUsers.map(async (u) => {
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(u.password, salt);
        return { ...u, password: hashedPassword };
      })
    );

    const createdUsers = await User.insertMany(usersWithHashedPasswords);
    console.log(`👤 Created ${createdUsers.length} users`);

    const owner = createdUsers.find((u) => u.role === "owner");

    // Assign owner to all restaurants
    const restaurantsWithOwner = sampleRestaurants.map((r) => ({
      ...r,
      owner: owner._id,
    }));

    await Restaurant.insertMany(restaurantsWithOwner);
    console.log(`🍽️  Created ${sampleRestaurants.length} restaurants`);

    console.log("\n✅ Database seeded successfully!");
    console.log("\n📋 Test Accounts:");
    console.log("  Admin:  admin@tablebook.com  / Admin@1234");
    console.log("  Owner:  owner@tablebook.com  / Owner@1234");
    console.log("  User:   user@tablebook.com   / User@1234");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding error:", error);
    process.exit(1);
  }
};

seedDB();