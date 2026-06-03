// src/pages/ProfilePage.jsx
import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { FiUser, FiMail, FiPhone, FiCamera, FiSave, FiLock, FiCheck } from "react-icons/fi";
import { userAPI, authAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [changingPass, setChangingPass] = useState(false);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("phone", form.phone);
      if (avatarFile) formData.append("avatar", avatarFile);

      const { data } = await userAPI.updateProfile(formData);
      updateUser(data.user);
      toast.success("Profile updated successfully! ✅");
      setAvatarPreview(null);
      setAvatarFile(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setChangingPass(true);
    try {
      await authAPI.updatePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success("Password changed successfully! 🔒");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setChangingPass(false);
    }
  };

  const displayAvatar = avatarPreview || user?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "U")}&background=f97316&color=fff&size=128`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 pt-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-2">
            My Profile
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
            Manage your account information and security settings
          </p>

          {/* Profile form */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6 mb-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <FiUser className="text-primary-500" /> Personal Information
            </h2>

            <form onSubmit={handleSaveProfile} className="space-y-5">
              {/* Avatar */}
              <div className="flex items-center gap-5">
                <div className="relative">
                  <img
                    src={displayAvatar}
                    alt={user?.name}
                    className="w-20 h-20 rounded-2xl object-cover ring-4 ring-primary-100 dark:ring-primary-900"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary-500 hover:bg-primary-600 text-white rounded-lg flex items-center justify-center shadow-lg transition-colors"
                  >
                    <FiCamera className="text-xs" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{user?.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
                  <span className={`mt-1 inline-block badge ${
                    user?.role === "admin" ? "badge-primary" :
                    user?.role === "owner" ? "badge-info" : "badge-success"
                  }`}>
                    {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                  </span>
                  {user?.isGoogleAuth && (
                    <span className="ml-2 badge badge-info">Google Account</span>
                  )}
                </div>
              </div>

              {avatarPreview && (
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                  <FiCheck /> New photo selected — save to apply
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Your full name"
                      className="input-field pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative">
                    <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+91 XXXXX XXXXX"
                      className="input-field pl-10"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={user?.email}
                    disabled
                    className="input-field pl-10 opacity-60 cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
              </div>

              <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                {saving ? (
                  <>
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                    Saving...
                  </>
                ) : (
                  <><FiSave /> Save Changes</>
                )}
              </button>
            </form>
          </div>

          {/* Password change form */}
          {!user?.isGoogleAuth && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <FiLock className="text-primary-500" /> Change Password
              </h2>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    placeholder="••••••••"
                    className="input-field"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      placeholder="••••••••"
                      className="input-field"
                      required
                      minLength={6}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      placeholder="••••••••"
                      className="input-field"
                      required
                    />
                  </div>
                </div>

                <button type="submit" disabled={changingPass} className="btn-primary flex items-center gap-2">
                  {changingPass ? (
                    <>
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                      Updating...
                    </>
                  ) : (
                    <><FiLock /> Update Password</>
                  )}
                </button>
              </form>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;
