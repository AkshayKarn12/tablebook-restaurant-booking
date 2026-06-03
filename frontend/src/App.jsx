// src/App.jsx
import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import LoadingSpinner from "./components/common/LoadingSpinner";

// Lazy-loaded pages for code splitting
const HomePage = lazy(() => import("./pages/HomePage"));
const RestaurantsPage = lazy(() => import("./pages/RestaurantsPage"));
const RestaurantDetailPage = lazy(() => import("./pages/RestaurantDetailPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const SignupPage = lazy(() => import("./pages/SignupPage"));
const UserDashboard = lazy(() => import("./pages/UserDashboard"));
const OwnerDashboard = lazy(() => import("./pages/OwnerDashboard"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const BookingPage = lazy(() => import("./pages/BookingPage"));
const FavoritesPage = lazy(() => import("./pages/FavoritesPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
const AddRestaurantPage = lazy(() => import("./pages/AddRestaurantPage"));

// ─── Protected route wrapper ──────────────────────────────────
const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) return <LoadingSpinner fullScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/" replace />;

  return children;
};

// ─── Guest-only route (redirect if logged in) ─────────────────
const GuestRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/" replace />;
  return children;
};

// ─── App Layout ───────────────────────────────────────────────
const AppLayout = ({ children, noFooter }) => (
  <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-dark-900">
    <Navbar />
    <main className="flex-1">
      <Suspense fallback={<LoadingSpinner fullScreen />}>{children}</Suspense>
    </main>
    {!noFooter && <Footer />}
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
          />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<AppLayout><HomePage /></AppLayout>} />
            <Route path="/restaurants" element={<AppLayout><RestaurantsPage /></AppLayout>} />
            <Route path="/restaurants/:id" element={<AppLayout><RestaurantDetailPage /></AppLayout>} />

            {/* Guest-only routes */}
            <Route path="/login" element={<GuestRoute><AppLayout noFooter><LoginPage /></AppLayout></GuestRoute>} />
            <Route path="/signup" element={<GuestRoute><AppLayout noFooter><SignupPage /></AppLayout></GuestRoute>} />

            {/* Protected: User */}
            <Route path="/dashboard" element={<ProtectedRoute roles={["user"]}><AppLayout><UserDashboard /></AppLayout></ProtectedRoute>} />
            <Route path="/favorites" element={<ProtectedRoute><AppLayout><FavoritesPage /></AppLayout></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><AppLayout><ProfilePage /></AppLayout></ProtectedRoute>} />
            <Route path="/book/:restaurantId" element={<ProtectedRoute><AppLayout><BookingPage /></AppLayout></ProtectedRoute>} />

            {/* Protected: Owner */}
            <Route path="/owner" element={<ProtectedRoute roles={["owner", "admin"]}><AppLayout><OwnerDashboard /></AppLayout></ProtectedRoute>} />
            <Route path="/owner/add-restaurant" element={<ProtectedRoute roles={["owner", "admin"]}><AppLayout><AddRestaurantPage /></AppLayout></ProtectedRoute>} />

            {/* Protected: Admin */}
            <Route path="/admin" element={<ProtectedRoute roles={["admin"]}><AppLayout><AdminDashboard /></AppLayout></ProtectedRoute>} />

            {/* 404 */}
            <Route path="*" element={<AppLayout noFooter><NotFoundPage /></AppLayout>} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;