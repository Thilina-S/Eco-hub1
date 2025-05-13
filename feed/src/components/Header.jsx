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

  // Check authentication status on component mount and when localStorage changes
  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem("token");
      setIsAuthenticated(!!token);

      if (token) {
        // Fetch user data if token exists
        fetchUserData(token);
      } else {
        setCurrentUser(null);
      }
    };

    checkAuthStatus();

    // Listen for storage events (when token is added/removed in another tab)
    window.addEventListener("storage", checkAuthStatus);

    return () => {
      window.removeEventListener("storage", checkAuthStatus);
    };
  }, []);

  // Fetch user data from API
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
        // If response is not ok, token might be invalid
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
      // Navigate to marketplace with search query in the URL
      navigate(`/marketplace?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery(""); // Clear search input after submission
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
              <span className="text-2xl font-bold" style={{ color: "black" }}>
                Eco Hub
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden space-x-8 md:flex">
            <Link to="/" className={isActive("/")} style={{ color: "black" }}>
              Home
            </Link>
            <Link to="/marketplace" className={isActive("/marketplace")} style={{ color: "black" }}>
              Marketplace
            </Link>
            <Link to="/aboutus" className={isActive("/aboutus")} style={{ color: "black" }}>
              About Us
            </Link>
            <Link to="/contactus" className={isActive("/contactus")} style={{ color: "black" }}>
              Contact
            </Link>
            <Link to="/chatbot" className={isActive("/contactus")} style={{ color: "black" }}>
              Chatbot
            </Link>
            {/* Admin Dashboard Link */}
            {isAuthenticated && currentUser?.name === "admin" && (
              <Link to="/admindashboard" className={isActive("/admindashboard")} style={{ color: "black" }}>
                Admin Dashboard
              </Link>
            )}
          </nav>

          {/* Search Bar */}
          <div className="items-center flex-1 hidden max-w-xs mx-4 md:flex">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <FiSearch className="w-5 h-5" style={{ color: "black" }} />
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
                    className="flex items-center p-2 rounded-full hover:bg-opacity-20 hover:bg-black"
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
                        <Link to="/profile" className="block px-4 py-2 text-sm text-black hover:bg-gray-100">
                          Profile
                        </Link>
                        <Link to="/settings" className="block px-4 py-2 text-sm text-black hover:bg-gray-100">
                          <div className="flex items-center">
                            <FiSettings className="mr-2" />
                            Settings
                          </div>
                        </Link>
                      </div>
                      <div className="py-1">
                        <button
                          onClick={handleLogout}
                          className="block w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-gray-100"
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
                <Link to="/signin" className="px-4 py-2" style={{ color: "black" }}>
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 text-white bg-black border border-black rounded-md hover:bg-opacity-90"
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
              className="inline-flex items-center justify-center p-2 rounded-md hover:bg-black hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <FiX className="block w-6 h-6" style={{ color: "black" }} />
              ) : (
                <FiMenu className="block w-6 h-6" style={{ color: "black" }} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="bg-white shadow-lg md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {["/", "/marketplace", "/aboutus", "/contactus"].map((path) => (
              <Link
                key={path}
                to={path}
                className="block px-3 py-2 text-base font-medium rounded-md hover:bg-gray-100"
                onClick={closeMenu}
                style={{ color: "black" }}
              >
                {path === "/" ? "Home" : path.slice(1).replace("us", " Us")}
              </Link>
            ))}
          </div>

          {/* Mobile search */}
          <div className="px-2 py-3">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <FiSearch className="w-5 h-5" style={{ color: "black" }} />
                </button>
              </div>
            </form>
          </div>

          {/* Mobile user menu */}
          <div className="pt-4 pb-3 border-t border-gray-200">
            {isAuthenticated ? (
              <div className="px-2 space-y-1">
                <div className="px-3 py-2 text-base font-medium text-black rounded-md">
                  {currentUser?.name || "User"}
                </div>
                {["/profile", "/cart", "/wishlist", "/myitems", "/myposts", "/myreviews", "/settings"].map((path) => (
                  <Link
                    key={path}
                    to={path}
                    className="block px-3 py-2 text-base font-medium rounded-md hover:bg-gray-100"
                    onClick={closeMenu}
                    style={{ color: "black" }}
                  >
                    {path
                      .slice(1)
                      .replace(/my/, "My ")
                      .replace(/([a-z])([A-Z])/g, "$1 $2")}
                  </Link>
                ))}
                <button
                  onClick={() => {
                    handleLogout();
                    closeMenu();
                  }}
                  className="block w-full px-3 py-2 text-base font-medium text-left rounded-md hover:bg-gray-100"
                  style={{ color: "red" }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="px-2 space-y-1">
                <Link
                  to="/signin"
                  className="block px-3 py-2 text-base font-medium rounded-md hover:bg-gray-100"
                  onClick={closeMenu}
                  style={{ color: "black" }}
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="block px-3 py-2 text-base font-medium text-white bg-black border border-black rounded-md hover:bg-opacity-90"
                  onClick={closeMenu}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
