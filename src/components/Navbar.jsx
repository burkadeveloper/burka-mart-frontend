import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "./ThemeToggle";
import NotificationsDropdown from "./NotificationsDropdown";
import {
  ShoppingCart,
  User,
  LogOut,
  Menu,
  X,
  MessageCircle,
  Home,
  Package,
} from "lucide-react";
import { logout } from "../features/authSlice";
import { clearCart } from "../features/cartSlice";
import { useState, useEffect, useRef } from "react";
import { useTotalUnreadCount } from "../api/chatApi";

export default function Navbar() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { totalQuantity } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const { data: unreadData } = useTotalUnreadCount();
  const unreadMessages = unreadData?.count || 0;

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearCart());
    navigate("/login");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown when navigating to another page
  useEffect(() => {
    setDropdownOpen(false);
  }, [location.pathname]);

  // Close mobile menu when clicking a link
  const closeMobileMenu = () => setMobileMenuOpen(false);

  const navLinks = [
    { to: "/", label: "Home", icon: Home },
    { to: "/products", label: "Shop", icon: Package },
  ];

  const userLinks = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/orders", label: "Orders" },
    { to: "/profile", label: "Profile" },
    { to: "/wallet", label: "Wallet" },
    { to: "/tickets", label: "Support" },
  ];

  const sellerLinks = [
    { to: "/my-products", label: "My Products" },
    { to: "/create-product", label: "Add Product" },
    { to: "/seller-orders", label: "Orders Received" },
  ];

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Marketplace
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 font-medium"
                >
                  {link.label}
                </Link>
              ))}

              {isAuthenticated && user?.isSeller && (
                <div className="relative group">
                  <button className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 font-medium">
                    Seller
                  </button>
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 border border-gray-100 dark:border-gray-700">
                    {sellerLinks.map((link) => (
                      <Link
                        key={link.to}
                        to={link.to}
                        className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {isAuthenticated && (
                <Link
                  to="/chat"
                  className="relative text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <MessageCircle size={20} />
                  {unreadMessages > 0 && (
                    <span className="absolute -top-2 -right-3 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                      {unreadMessages > 9 ? "9+" : unreadMessages}
                    </span>
                  )}
                </Link>
              )}

              <NotificationsDropdown />
              <ThemeToggle />

              <Link
                to="/cart"
                className="relative text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <ShoppingCart size={20} />
                {totalQuantity > 0 && (
                  <span className="absolute -top-2 -right-3 bg-blue-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                    {totalQuantity}
                  </span>
                )}
              </Link>

              {/* User Dropdown */}
              {isAuthenticated ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center space-x-2 focus:outline-none"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold text-sm">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-gray-700 dark:text-gray-300 font-medium hidden lg:inline">
                      {user?.name?.split(" ")[0]}
                    </span>
                  </button>
                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 z-10"
                      >
                        <div className="py-2">
                          {userLinks.map((link) => (
                            <Link
                              key={link.to}
                              to={link.to}
                              onClick={() => setDropdownOpen(false)}
                              className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400"
                            >
                              {link.label}
                            </Link>
                          ))}
                          {user?.role === "admin" && (
                            <Link
                              to="/admin"
                              onClick={() => setDropdownOpen(false)}
                              className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400"
                            >
                              Admin Panel
                            </Link>
                          )}
                          {!user?.isSeller && user?.sellerRequestPending && (
                            <div className="px-4 py-2 text-yellow-600 text-sm">
                              Seller request pending
                            </div>
                          )}
                          {!user?.isSeller && !user?.sellerRequestPending && (
                            <Link
                              to="/profile"
                              onClick={() => setDropdownOpen(false)}
                              className="block px-4 py-2 text-green-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                              Become a Seller
                            </Link>
                          )}
                          <hr className="my-1 border-gray-200 dark:border-gray-700" />
                          <button
                            onClick={handleLogout}
                            className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2 rounded-full hover:shadow-md transition-shadow"
                >
                  Sign In
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-gray-700 dark:text-gray-300 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={closeMobileMenu}
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed right-0 top-0 bottom-0 w-80 bg-white dark:bg-gray-800 shadow-xl z-50 flex flex-col md:hidden"
            >
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Marketplace
                </h2>
                <button
                  onClick={closeMobileMenu}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto py-4 px-4 space-y-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="block py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 text-lg"
                    onClick={closeMobileMenu}
                  >
                    {link.label}
                  </Link>
                ))}
                {isAuthenticated && user?.isSeller && (
                  <div className="pt-2">
                    <div className="font-semibold text-gray-500 mb-2">
                      Seller
                    </div>
                    {sellerLinks.map((link) => (
                      <Link
                        key={link.to}
                        to={link.to}
                        className="block py-2 pl-4 text-gray-700 dark:text-gray-300 hover:text-blue-600"
                        onClick={closeMobileMenu}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                )}
                {isAuthenticated && (
                  <>
                    <Link
                      to="/chat"
                      className="block py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 text-lg"
                      onClick={closeMobileMenu}
                    >
                      Chat {unreadMessages > 0 && `(${unreadMessages})`}
                    </Link>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-gray-700 dark:text-gray-300">
                        Notifications
                      </span>
                      <NotificationsDropdown />
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-gray-700 dark:text-gray-300">
                        Dark Mode
                      </span>
                      <ThemeToggle />
                    </div>
                    <Link
                      to="/cart"
                      className="block py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 text-lg"
                      onClick={closeMobileMenu}
                    >
                      Cart ({totalQuantity})
                    </Link>
                    <div className="pt-2">
                      <div className="font-semibold text-gray-500 mb-2">
                        Account
                      </div>
                      {userLinks.map((link) => (
                        <Link
                          key={link.to}
                          to={link.to}
                          className="block py-2 pl-4 text-gray-700 dark:text-gray-300 hover:text-blue-600"
                          onClick={closeMobileMenu}
                        >
                          {link.label}
                        </Link>
                      ))}
                      {user?.role === "admin" && (
                        <Link
                          to="/admin"
                          className="block py-2 pl-4 text-blue-600 dark:text-blue-400"
                          onClick={closeMobileMenu}
                        >
                          Admin Panel
                        </Link>
                      )}
                      {!user?.isSeller && user?.sellerRequestPending && (
                        <div className="py-2 pl-4 text-yellow-600">
                          Seller request pending
                        </div>
                      )}
                      {!user?.isSeller && !user?.sellerRequestPending && (
                        <Link
                          to="/profile"
                          className="block py-2 pl-4 text-green-600"
                          onClick={closeMobileMenu}
                        >
                          Become a Seller
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          handleLogout();
                          closeMobileMenu();
                        }}
                        className="block w-full text-left py-2 pl-4 text-red-600"
                      >
                        Logout
                      </button>
                    </div>
                  </>
                )}
                {!isAuthenticated && (
                  <Link
                    to="/login"
                    className="block py-2 text-blue-600 text-lg"
                    onClick={closeMobileMenu}
                  >
                    Login
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
