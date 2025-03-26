import { useState } from "react";
import { Link } from "react-router-dom";

const Header = ({ currentUser, handleSignOut }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAvatarHovered, setIsAvatarHovered] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-green-200 text-gray-900 p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">Eco Hub</h1>

        {/* Desktop Navigation */}
        <nav className="hidden md:block">
          <ul className="flex space-x-6">
            <li><Link to="/" className="hover:text-green-600">Home</Link></li>
            <li><Link to="/marketplace" className="hover:text-green-600">Marketplace</Link></li>
            <li><Link to="/contactus" className="hover:text-green-600">Contact Us</Link></li>
            <li><Link to="/aboutus" className="hover:text-green-600">About Us</Link></li>
            <li><Link to="/chatbot" className="hover:text-green-600">Chatbot</Link></li>
          </ul>
        </nav>

        {/* Desktop Avatar */}
        <div className="hidden md:flex items-center space-x-6">
          <div
            className="relative cursor-pointer"
            onMouseEnter={() => setIsAvatarHovered(true)}
            onMouseLeave={() => setIsAvatarHovered(false)}
          >
            <div className="w-10 h-10 rounded-full border-2 border-green-600 bg-green-500 flex items-center justify-center text-white">
              {currentUser ? (
                currentUser.profilePicture ? (
                  <img 
                    src={currentUser.profilePicture} 
                    alt="User Avatar" 
                    className="w-full h-full rounded-full"
                  />
                ) : (
                  <span>{currentUser.username?.charAt(0).toUpperCase() || 'U'}</span>
                )
              ) : (
                <span>👤</span>
              )}
            </div>
            
            {isAvatarHovered && (
              <div className="absolute bg-white text-gray-900 p-2 rounded shadow-md mt-2 right-0 w-48 z-10">
                {currentUser ? (
                  <>
                    <div className="text-sm font-medium">@{currentUser.username}</div>
                    <div className="text-xs text-gray-600">{currentUser.email}</div>
                    <div className="mt-2 space-y-2">
                      <Link to="/profile" className="block text-green-700 hover:text-green-900">Profile</Link>
                      <button 
                        onClick={handleSignOut} 
                        className="block text-red-600 hover:text-red-800 w-full text-left"
                      >
                        Logout
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-2">
                    <Link to="/signin" className="block text-green-700 hover:text-green-900">Sign In</Link>
                    <Link to="/signup" className="block text-green-700 hover:text-green-900">Sign Up</Link>
                    <Link to="/profile" className="block text-green-700 hover:text-green-900">Profile</Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
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
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <nav className="px-2 pt-2 pb-4">
            <ul className="flex flex-col space-y-3">
              <li><Link to="/" className="block hover:text-green-600" onClick={toggleMenu}>Home</Link></li>
              <li><Link to="/marketplace" className="block hover:text-green-600" onClick={toggleMenu}>Marketplace</Link></li>
              <li><Link to="/contactus" className="block hover:text-green-600" onClick={toggleMenu}>Contact Us</Link></li>
              <li><Link to="/aboutus" className="block hover:text-green-600" onClick={toggleMenu}>About Us</Link></li>
              <li><Link to="/chatbot" className="block hover:text-green-600" onClick={toggleMenu}>Chatbot</Link></li>
              <li className="pt-2 border-t border-green-300">
                <div className="flex flex-col space-y-3">
                  {currentUser ? (
                    <>
                      <div className="text-sm font-medium">@{currentUser.username}</div>
                      <div className="text-xs text-gray-600">{currentUser.email}</div>
                      <Link to="/profile" className="block hover:text-green-600" onClick={toggleMenu}>Profile</Link>
                      <button 
                        onClick={() => { handleSignOut(); toggleMenu(); }} 
                        className="block text-red-600 hover:text-red-800 w-full text-left"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link to="/signin" className="block hover:text-green-600" onClick={toggleMenu}>Sign In</Link>
                      <Link to="/signup" className="block hover:text-green-600" onClick={toggleMenu}>Sign Up</Link>
                      <Link to="/profile" className="block hover:text-green-600" onClick={toggleMenu}>Profile</Link>
                    </>
                  )}
                </div>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;