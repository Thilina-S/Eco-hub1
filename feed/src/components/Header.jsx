import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

const Header = ({ currentUser, handleSignOut }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAvatarOpen, setIsAvatarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleAvatarMenu = () => {
    setIsAvatarOpen(!isAvatarOpen);
  };

  const handleLogout = () => {
    handleSignOut();
    setIsAvatarOpen(false);
    navigate("/signin");
  };

  // FAQ Button Click Handler
  const handleFaqClick = () => {
    navigate("/faq"); // Navigate to the FAQ page when the button is clicked
  };

  // Check if current path matches the link
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="p-4 text-gray-900 bg-green-200 shadow-md">
      <div className="container relative flex items-center justify-between mx-auto">
        <h1 className="text-2xl font-bold">Eco Hub</h1>

        {/* Desktop Navigation */}
        <nav className="hidden md:block">
          <ul className="flex space-x-6">
            <li>
              <Link 
                to="/" 
                className={`hover:text-green-600 transition-all duration-200 ${isActive('/') ? 'border-b-2 border-green-600' : 'hover:border-b-2 hover:border-green-400'}`}
              >
                Home
              </Link>
            </li>
            <li>
              <Link 
                to="/marketplace" 
                className={`hover:text-green-600 transition-all duration-200 ${isActive('/marketplace') ? 'border-b-2 border-green-600' : 'hover:border-b-2 hover:border-green-400'}`}
              >
                Marketplace
              </Link>
            </li>
            <li>
              <Link 
                to="/chatbot" 
                className={`hover:text-green-600 transition-all duration-200 ${isActive('/chatbot') ? 'border-b-2 border-green-600' : 'hover:border-b-2 hover:border-green-400'}`}
              >
                Chatbot
              </Link>
            </li>
            <li>
              <Link 
                to="/aboutus" 
                className={`hover:text-green-600 transition-all duration-200 ${isActive('/aboutus') ? 'border-b-2 border-green-600' : 'hover:border-b-2 hover:border-green-400'}`}
              >
                About Us
              </Link>
            </li>
            <li>
              <Link 
                to="/contactus" 
                className={`hover:text-green-600 transition-all duration-200 ${isActive('/contactus') ? 'border-b-2 border-green-600' : 'hover:border-b-2 hover:border-green-400'}`}
              >
                Contact Us
              </Link>
            </li>
            <li>
              <Link 
                to="/faq" 
                className={`hover:text-green-600 transition-all duration-200 ${isActive('/faq') ? 'border-b-2 border-green-600' : 'hover:border-b-2 hover:border-green-400'}`}
              >
                FAQ
              </Link>
            </li>
          </ul>
        </nav>

        {/* Desktop Avatar */}
        <div className="relative items-center hidden space-x-6 md:flex">
          <button
            onClick={toggleAvatarMenu}
            className="flex items-center justify-center w-10 h-10 text-white bg-green-500 border-2 border-green-600 rounded-full focus:outline-none"
          >
            {currentUser ? (
              currentUser.profilePicture ? (
                <img
                  src={currentUser.profilePicture}
                  alt="User Avatar"
                  className="object-cover w-full h-full rounded-full"
                />
              ) : (
                <span>{currentUser.username?.charAt(0).toUpperCase() || 'U'}</span>
              )
            ) : (
              <span>👤</span>
            )}
          </button>

          {/* Avatar Dropdown - Desktop */}
          {isAvatarOpen && (
            <div className="absolute z-20 w-48 p-2 space-y-1 text-sm text-gray-900 -translate-x-1/2 bg-white rounded shadow-md top-full left-1/2">
              {currentUser ? (
                <>
                  <div className="text-sm font-medium">@{currentUser.username}</div>
                  <div className="mb-1 text-xs text-gray-600">{currentUser.email}</div>
                  <Link 
                    to="/profile" 
                    className={`block text-green-700 hover:text-green-900 ${isActive('/profile') ? 'border-b-2 border-green-600' : 'hover:border-b-2 hover:border-green-400'}`}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left text-red-600 hover:text-red-800"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/signin" 
                    className={`block text-green-700 hover:text-green-900 ${isActive('/signin') ? 'border-b-2 border-green-600' : 'hover:border-b-2 hover:border-green-400'}`}
                  >
                    Sign In
                  </Link>
                  <Link 
                    to="/signup" 
                    className={`block text-green-700 hover:text-green-900 ${isActive('/signup') ? 'border-b-2 border-green-600' : 'hover:border-b-2 hover:border-green-400'}`}
                  >
                    Sign Up
                  </Link>
                  <Link 
                    to="/profile" 
                    className={`block text-green-700 hover:text-green-900 ${isActive('/profile') ? 'border-b-2 border-green-600' : 'hover:border-b-2 hover:border-green-400'}`}
                  >
                    Profile
                  </Link>
                </>
              )}
            </div>
          )}
        </div>

        {/* Mobile Avatar & Menu Toggle */}
        <div className="relative flex items-center space-x-4 md:hidden">
          <button
            onClick={toggleAvatarMenu}
            className="flex items-center justify-center text-white bg-green-500 border-2 border-green-600 rounded-full w-9 h-9"
          >
            {currentUser ? (
              currentUser.profilePicture ? (
                <img
                  src={currentUser.profilePicture}
                  alt="User Avatar"
                  className="object-cover w-full h-full rounded-full"
                />
              ) : (
                <span>{currentUser.username?.charAt(0).toUpperCase() || 'U'}</span>
              )
            ) : (
              <span>👤</span>
            )}
          </button>

          <button
            onClick={toggleMenu}
            className="text-gray-900 hover:text-green-600 focus:outline-none"
            aria-label="Toggle menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
              />
            </svg>
          </button>

          {/* Avatar Dropdown - Mobile */}
          {isAvatarOpen && (
            <div className="absolute z-20 w-48 p-2 space-y-1 text-sm -translate-x-1/2 bg-white rounded shadow-md top-full left-1/2 sm:w-56 md:w-64">
              {currentUser ? (
                <>
                  <div className="font-medium">@{currentUser.username}</div>
                  <div className="mb-1 text-xs text-gray-600">{currentUser.email}</div>
                  <Link 
                    to="/profile" 
                    className={`block text-green-700 hover:text-green-900 ${isActive('/profile') ? 'border-b-2 border-green-600' : 'hover:border-b-2 hover:border-green-400'}`} 
                    onClick={() => setIsAvatarOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left text-red-600 hover:text-red-800"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/signin" 
                    className={`block text-green-700 hover:text-green-900 ${isActive('/signin') ? 'border-b-2 border-green-600' : 'hover:border-b-2 hover:border-green-400'}`} 
                    onClick={() => setIsAvatarOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link 
                    to="/signup" 
                    className={`block text-green-700 hover:text-green-900 ${isActive('/signup') ? 'border-b-2 border-green-600' : 'hover:border-b-2 hover:border-green-400'}`} 
                    onClick={() => setIsAvatarOpen(false)}
                  >
                    Sign Up
                  </Link>
                  <Link 
                    to="/profile" 
                    className={`block text-green-700 hover:text-green-900 ${isActive('/profile') ? 'border-b-2 border-green-600' : 'hover:border-b-2 hover:border-green-400'}`} 
                    onClick={() => setIsAvatarOpen(false)}
                  >
                    Profile
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation Links */}
      {isMenuOpen && (
        <div className="mt-2 md:hidden">
          <nav className="px-2 pt-2 pb-4">
            <ul className="flex flex-col space-y-3">
              <li>
                <Link 
                  to="/" 
                  className={`block hover:text-green-600 ${isActive('/') ? 'border-b-2 border-green-600' : 'hover:border-b-2 hover:border-green-400'}`} 
                  onClick={toggleMenu}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  to="/marketplace" 
                  className={`block hover:text-green-600 ${isActive('/marketplace') ? 'border-b-2 border-green-600' : 'hover:border-b-2 hover:border-green-400'}`} 
                  onClick={toggleMenu}
                >
                  Marketplace
                </Link>
              </li>
              <li>
                <Link 
                  to="/contactus" 
                  className={`block hover:text-green-600 ${isActive('/contactus') ? 'border-b-2 border-green-600' : 'hover:border-b-2 hover:border-green-400'}`} 
                  onClick={toggleMenu}
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link 
                  to="/aboutus" 
                  className={`block hover:text-green-600 ${isActive('/aboutus') ? 'border-b-2 border-green-600' : 'hover:border-b-2 hover:border-green-400'}`} 
                  onClick={toggleMenu}
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link 
                  to="/chatbot" 
                  className={`block hover:text-green-600 ${isActive('/chatbot') ? 'border-b-2 border-green-600' : 'hover:border-b-2 hover:border-green-400'}`} 
                  onClick={toggleMenu}
                >
                  Chatbot
                </Link>
              </li>
              <li>
                <Link 
                  to="/faq" 
                  className={`block hover:text-green-600 ${isActive('/faq') ? 'border-b-2 border-green-600' : 'hover:border-b-2 hover:border-green-400'}`} 
                  onClick={toggleMenu}
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      )}
      
      {/* FAQ Button in the bottom-right corner with position: fixed */}
      <div
        className="fixed cursor-pointer bottom-4 right-4"
        onClick={handleFaqClick}
        style={{
          width: "60px",
          height: "60px",
          backgroundImage: `url("/faq1.jpg")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          borderRadius: "50%",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
        }}
      />
    </header>
  );
};

export default Header;