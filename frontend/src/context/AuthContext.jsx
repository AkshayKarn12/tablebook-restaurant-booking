// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authAPI } from "../services/api";
import { signInWithGoogle, signOutGoogle } from "../services/firebase";
import { connectSocket, disconnectSocket, joinUserRoom } from "../services/socket";
import { toast } from "react-toastify";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token"));

  // ─── Initialize user from stored token ───────────────────────
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        try {
          const { data } = await authAPI.getMe();
          setUser(data.user);
          // Connect socket and join user room
          const socket = connectSocket();
          joinUserRoom(data.user._id);
        } catch {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setToken(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  // ─── Helper: Store auth data ──────────────────────────────────
  const storeAuth = (userData, userToken) => {
    localStorage.setItem("token", userToken);
    localStorage.setItem("user", JSON.stringify(userData));
    setToken(userToken);
    setUser(userData);
    const socket = connectSocket();
    joinUserRoom(userData._id);
  };

  // ─── Register ─────────────────────────────────────────────────
  const register = async (formData) => {
    const { data } = await authAPI.register(formData);
    storeAuth(data.user, data.token);
    toast.success(`Welcome to TableBook, ${data.user.name}! 🎉`);
    return data;
  };

  // ─── Login ────────────────────────────────────────────────────
  const login = async (formData) => {
    const { data } = await authAPI.login(formData);
    storeAuth(data.user, data.token);
    toast.success(`Welcome back, ${data.user.name}! 👋`);
    return data;
  };

  // ─── Google Sign-In ───────────────────────────────────────────
  const loginWithGoogle = async (role = "user") => {
    const googleUser = await signInWithGoogle();
    const { data } = await authAPI.googleAuth({ ...googleUser, role });
    storeAuth(data.user, data.token);
    toast.success(`Welcome, ${data.user.name}! 🎉`);
    return data;
  };

  // ─── Logout ───────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    disconnectSocket();
    signOutGoogle().catch(() => {});
    toast.info("Logged out successfully");
  }, []);

  // ─── Update user in context ───────────────────────────────────
  const updateUser = (updatedUser) => {
    setUser((prev) => ({ ...prev, ...updatedUser }));
    localStorage.setItem("user", JSON.stringify({ ...user, ...updatedUser }));
  };

  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.role === "admin";
  const isOwner = user?.role === "owner" || user?.role === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isAdmin,
        isOwner,
        register,
        login,
        loginWithGoogle,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
