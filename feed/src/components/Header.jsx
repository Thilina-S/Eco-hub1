"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { FiShoppingCart, FiHeart, FiMenu, FiX, FiSearch, FiLogOut, FiSettings } from "react-icons/fi"

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [scrolled, setScrolled] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  // Check authentication status on component mount and when localStorage changes
  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem("token")
      setIsAuthenticated(!!token)

      if (token) {
        // Fetch user data if token exists
        fetchUserData(token)
      } else {
        setCurrentUser(null)
      }
    }

    checkAuthStatus()

    // Listen for storage events (when token is added/removed in another tab)
    window.addEventListener("storage", checkAuthStatus)

    return () => {
      window.removeEventListener("storage", checkAuthStatus)
    }
  }, [])

  // Fetch user data from API
  const fetchUserData = async (token) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setCurrentUser({
          name: data.user.name,
          id: data.user.id,
          profilePhoto: data.user.profilePhoto,
        })
      } else {
        // If response is not ok, token might be invalid
        localStorage.removeItem("token")
        setIsAuthenticated(false)
        setCurrentUser(null)
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/marketplace?search=${encodeURIComponent(searchQuery)}`)
      setSearchQuery("")
    }
  }

  const closeMenu = () => setIsMenuOpen(false)

  const isActive = (path) => {
    return location.pathname === path ? "font-semibold underline" : "hover:underline"
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    setIsAuthenticated(false)
    setCurrentUser(null)
    setShowUserDropdown(false)
    navigate("/signin")
  }

  const toggleUserDropdown = () => {
    setShowUserDropdown(!showUserDropdown)
  }

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${scrolled ? "shadow-md" : ""}`}
      style={{ backgroundColor: "#b9f7ce", color: "black" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold" style={{ color: "black" }}>
                Eco Hub
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
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
          </nav>

          {/* Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-xs mx-4">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <FiSearch className="h-5 w-5" style={{ color: "black" }} />
                </button>
              </div>
            </form>
          </div>

          {/* Right Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link to="/cart" className="p-2 rounded-full hover:bg-opacity-20 hover:bg-black relative">
                  <FiShoppingCart className="h-6 w-6" style={{ color: "black" }} />
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold text-white bg-black rounded-full">
                    0
                  </span>
                </Link>
                <Link to="/wishlist" className="p-2 rounded-full hover:bg-opacity-20 hover:bg-black">
                  <FiHeart className="h-6 w-6" style={{ color: "black" }} />
                </Link>
                <div className="relative">
                  <button
                    onClick={toggleUserDropdown}
                    className="p-2 rounded-full hover:bg-opacity-20 hover:bg-black flex items-center"
                  >
                    <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white font-semibold">
                      {currentUser?.name?.charAt(0) || "U"}
                    </div>
                  </button>
                  {showUserDropdown && (
                    <div className="absolute right-0 w-48 mt-2 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg">
                      <div className="py-1">
                        <div className="px-4 py-2 text-sm text-gray-700 font-medium border-b border-gray-100">
                          {currentUser?.name || "User"}
                        </div>
                        <Link to="/profile" className="block px-4 py-2 text-sm text-black hover:bg-gray-100">
                          Profile
                        </Link>
                        <Link to="/myitems" className="block px-4 py-2 text-sm text-black hover:bg-gray-100">
                          My Items
                        </Link>
                        <Link to="/myposts" className="block px-4 py-2 text-sm text-black hover:bg-gray-100">
                          My Posts
                        </Link>
                        <Link to="/myreviews" className="block px-4 py-2 text-sm text-black hover:bg-gray-100">
                          My Reviews
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
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
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
                  className="px-4 py-2 bg-black text-white rounded-md border border-black hover:bg-opacity-90"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md hover:bg-black hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <FiX className="block h-6 w-6" style={{ color: "black" }} />
              ) : (
                <FiMenu className="block h-6 w-6" style={{ color: "black" }} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {["/", "/marketplace", "/aboutus", "/contactus"].map((path) => (
              <Link
                key={path}
                to={path}
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100"
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
                  className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <FiSearch className="h-5 w-5" style={{ color: "black" }} />
                </button>
              </div>
            </form>
          </div>

          {/* Mobile user menu */}
          <div className="pt-4 pb-3 border-t border-gray-200">
            {isAuthenticated ? (
              <div className="px-2 space-y-1">
                <div className="px-3 py-2 rounded-md text-base font-medium text-black">
                  {currentUser?.name || "User"}
                </div>
                {["/profile", "/cart", "/wishlist", "/myitems", "/myposts", "/myreviews", "/settings"].map((path) => (
                  <Link
                    key={path}
                    to={path}
                    className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100"
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
                    handleLogout()
                    closeMenu()
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100"
                  style={{ color: "red" }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="px-2 space-y-1">
                <Link
                  to="/signin"
                  className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100"
                  onClick={closeMenu}
                  style={{ color: "black" }}
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="block px-3 py-2 rounded-md text-base font-medium bg-black text-white border border-black hover:bg-opacity-90"
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
  )
}

export default Header
