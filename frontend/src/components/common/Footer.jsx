// src/components/common/Footer.jsx
import React from "react";
import { Link } from "react-router-dom";
import { MdRestaurantMenu } from "react-icons/md";
import { FiTwitter, FiInstagram, FiLinkedin, FiGithub } from "react-icons/fi";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 dark:bg-dark-950 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-amber-500 rounded-xl flex items-center justify-center">
                <MdRestaurantMenu className="text-white text-lg" />
              </div>
              <span className="font-display font-bold text-xl text-white">
                Table<span className="text-primary-400">Book</span>
              </span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              Discover the finest restaurants and book your perfect table in seconds. Premium dining experiences await.
            </p>
            <div className="flex gap-3 mt-5">
              {[FiTwitter, FiInstagram, FiLinkedin, FiGithub].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-primary-600 transition-all duration-200">
                  <Icon className="text-sm" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Explore</h4>
            <ul className="space-y-2.5">
              {[["Restaurants", "/restaurants"], ["Cuisines", "/restaurants?filter=cuisine"], ["Top Rated", "/restaurants?minRating=4"], ["Near Me", "/restaurants?near=true"]].map(([label, href]) => (
                <li key={label}>
                  <Link to={href} className="text-sm text-gray-400 hover:text-primary-400 transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="font-semibold text-white mb-4">Account</h4>
            <ul className="space-y-2.5">
              {[["Sign Up", "/signup"], ["Sign In", "/login"], ["Dashboard", "/dashboard"], ["My Bookings", "/dashboard"], ["Favorites", "/favorites"]].map(([label, href]) => (
                <li key={label}>
                  <Link to={href} className="text-sm text-gray-400 hover:text-primary-400 transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Business */}
          <div>
            <h4 className="font-semibold text-white mb-4">For Business</h4>
            <ul className="space-y-2.5">
              {[["List Your Restaurant", "/signup"], ["Owner Dashboard", "/owner"], ["Analytics", "/owner"], ["Support", "#"], ["Contact Us", "#"]].map(([label, href]) => (
                <li key={label}>
                  <Link to={href} className="text-sm text-gray-400 hover:text-primary-400 transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500">© {year} TableBook. All rights reserved. Built for BCA Final Year Project.</p>
          <div className="flex gap-5">
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((item) => (
              <a key={item} href="#" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">{item}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
