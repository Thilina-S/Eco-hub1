"use client";

import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FiShoppingCart, FiHeart, FiMenu, FiX, FiSearch, FiLogOut, FiSettings } from "react-icons/fi";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem("token");
      setIsAuthenticated(!!token);
      if (token) {
        fetchUserData(token);
      } else {
        setCurrentUser(null);
      }
    };
    checkAuthStatus();
    window.addEventListener("storage", checkAuthStatus);
    return () => {
      window.removeEventListener("storage", checkAuthStatus);
    };
  }, []);

  const fetchUserData = async (token) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setCurrentUser({
          name: data.user.name,
          id: data.user.id,
          profilePhoto: data.user.profilePhoto,
        });
      } else {
        localStorage.removeItem("token");
        setIsAuthenticated(false);
        setCurrentUser(null);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/marketplace?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  const closeMenu = () => setIsMenuOpen(false);

  const isActive = (path) => {
    return location.pathname === path ? "font-semibold underline" : "hover:underline";
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setCurrentUser(null);
    setShowUserDropdown(false);
    navigate("/signin");
  };

  const toggleUserDropdown = () => {
    setShowUserDropdown(!showUserDropdown);
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${scrolled ? "shadow-md" : ""}`}
      style={{ backgroundColor: "#b9f7ce", color: "black" }}
    >
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <span
                className="text-2xl font-serif font-extrabold uppercase bg-gradient-to-r from-green-800 to-green-400 bg-clip-text text-transparent"
              >
                ECO HUB 🌿
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden space-x-4 md:flex">
            {["/", "/Marketplace", "/Aboutus", "/Contactus", "/Chatbot"].map((path) => (
              <Link
                key={path}
                to={path}
                className={`${isActive(path)} px-3 py-2 rounded-md text-green-900 hover:bg-green-100`}
              >
                {path === "/" ? "Home" : path.slice(1).replace("us", " Us").replace("chatbot", "Chatbot")}
              </Link>
            ))}
            {isAuthenticated && currentUser?.name === "admin" && (
              <Link to="/admindashboard" className={`px-3 py-2 rounded-md text-green-900 hover:bg-green-100 ${isActive("/admindashboard")}`}>Admin Dashboard</Link>
            )}
          </nav>

          {/* Search Bar */}
          <div className="items-center flex-1 hidden max-w-xs mx-4 md:flex">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <FiSearch className="w-5 h-5 text-green-800" />
                </button>
              </div>
            </form>
          </div>

          {/* Right Navigation */}
          <div className="items-center hidden space-x-4 md:flex">
            {isAuthenticated ? (
              <>
                <div className="relative">
                  <button
                    onClick={toggleUserDropdown}
                    className="flex items-center p-2 rounded-full hover:bg-green-100"
                  >
                    <div className="flex items-center justify-center w-8 h-8 font-semibold text-white bg-green-600 rounded-full">
                      {currentUser?.name?.charAt(0) || "U"}
                    </div>
                  </button>
                  {showUserDropdown && (
                    <div className="absolute right-0 w-48 mt-2 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg">
                      <div className="py-1">
                        <div className="px-4 py-2 text-sm font-medium text-gray-700 border-b border-gray-100">
                          {currentUser?.name || "User"}
                        </div>
                        <Link to="/profile" className="block px-4 py-2 text-sm text-black hover:bg-green-50">
                          Profile
                        </Link>
                        <Link to="/settings" className="block px-4 py-2 text-sm text-black hover:bg-green-50">
                          <div className="flex items-center">
                            <FiSettings className="mr-2" />
                            Settings
                          </div>
                        </Link>
                      </div>
                      <div className="py-1">
                        <button
                          onClick={handleLogout}
                          className="block w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50"
                        >
                          <div className="flex items-center">
                            <FiLogOut className="mr-2" />
                            Logout
                          </div>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/signin" className="px-4 py-2 rounded-md text-green-900 hover:bg-green-100">
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 rounded-md text-white bg-green-700 hover:bg-green-600"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-700"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <FiX className="block w-6 h-6 text-green-800" />
              ) : (
                <FiMenu className="block w-6 h-6 text-green-800" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
