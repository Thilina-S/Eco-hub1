import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Header = ({ currentUser, handleSignOut }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAvatarOpen, setIsAvatarOpen] = useState(false);
  const navigate = useNavigate();

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

  return (
    <header className="bg-green-200 text-gray-900 p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center relative">
        <h1 className="text-2xl font-bold">Eco Hub</h1>

        {/* Desktop Navigation */}
        <nav className="hidden md:block">
          <ul className="flex space-x-6">
            <li><Link to="/" className="hover:text-green-600">Home</Link></li>
            <li><Link to="/marketplace" className="hover:text-green-600">Marketplace</Link></li>
            <li><Link to="/chatbot" className="hover:text-green-600">Chatbot</Link></li>
            <li><Link to="/aboutus" className="hover:text-green-600">About Us</Link></li>
            <li><Link to="/contactus" className="hover:text-green-600">Contact Us</Link></li>
          </ul>
        </nav>

        {/* Desktop Avatar */}
        <div className="hidden md:flex items-center space-x-6 relative">
          <button
            onClick={toggleAvatarMenu}
            className="w-10 h-10 rounded-full border-2 border-green-600 bg-green-500 flex items-center justify-center text-white focus:outline-none"
          >
            {currentUser ? (
              currentUser.profilePicture ? (
                <img
                  src={currentUser.profilePicture}
                  alt="User Avatar"
                  className="w-full h-full rounded-full object-cover"
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
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-white text-gray-900 p-2 rounded shadow-md z-20 w-fit text-sm space-y-1">
              {currentUser ? (
                <>
                  <div className="text-sm font-medium">@{currentUser.username}</div>
                  <div className="text-xs text-gray-600 mb-1">{currentUser.email}</div>
                  <Link to="/profile" className="block text-green-700 hover:text-green-900">Profile</Link>
                  <button
                    onClick={handleLogout}
                    className="block text-red-600 hover:text-red-800 w-full text-left"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/signin" className="block text-green-700 hover:text-green-900">Sign In</Link>
                  <Link to="/signup" className="block text-green-700 hover:text-green-900">Sign Up</Link>
                  <Link to="/profile" className="block text-green-700 hover:text-green-900">Profile</Link>
                </>
              )}
            </div>
          )}
        </div>

        {/* Mobile Avatar & Menu Toggle */}
        <div className="md:hidden flex items-center space-x-4 relative">
          <button
            onClick={toggleAvatarMenu}
            className="w-9 h-9 rounded-full border-2 border-green-600 bg-green-500 text-white flex items-center justify-center"
          >
            {currentUser ? (
              currentUser.profilePicture ? (
                <img
                  src={currentUser.profilePicture}
                  alt="User Avatar"
                  className="w-full h-full rounded-full object-cover"
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
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-white p-2 rounded shadow-md text-sm space-y-1 z-20 w-30">
              {currentUser ? (
                <>
                  <div className="font-medium">@{currentUser.username}</div>
                  <div className="text-gray-600 text-xs mb-1">{currentUser.email}</div>
                  <Link to="/profile" className="block text-green-700 hover:text-green-900" onClick={() => setIsAvatarOpen(false)}>Profile</Link>
                  <button
                    onClick={handleLogout}
                    className="block text-red-600 hover:text-red-800 w-full text-left"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/signin" className="block text-green-700 hover:text-green-900" onClick={() => setIsAvatarOpen(false)}>Sign In</Link>
                  <Link to="/signup" className="block text-green-700 hover:text-green-900" onClick={() => setIsAvatarOpen(false)}>Sign Up</Link>
                  <Link to="/profile" className="block text-green-700 hover:text-green-900" onClick={() => setIsAvatarOpen(false)}>Profile</Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation Links */}
      {isMenuOpen && (
        <div className="md:hidden mt-2">
          <nav className="px-2 pt-2 pb-4">
            <ul className="flex flex-col space-y-3">
              <li><Link to="/" className="block hover:text-green-600" onClick={toggleMenu}>Home</Link></li>
              <li><Link to="/marketplace" className="block hover:text-green-600" onClick={toggleMenu}>Marketplace</Link></li>
              <li><Link to="/contactus" className="block hover:text-green-600" onClick={toggleMenu}>Contact Us</Link></li>
              <li><Link to="/aboutus" className="block hover:text-green-600" onClick={toggleMenu}>About Us</Link></li>
              <li><Link to="/chatbot" className="block hover:text-green-600" onClick={toggleMenu}>Chatbot</Link></li>
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
