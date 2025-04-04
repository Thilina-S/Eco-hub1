import React, { useState, useEffect } from "react";
import { FaHeart, FaShoppingCart, FaArrowLeft, FaBars, FaTimes } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";

export default function ItemView() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get product from location state
  const { product } = location.state || {};
  
  // State for wishlist and cart
  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState([]);
  const [message, setMessage] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Load wishlist and cart from localStorage on component mount
  useEffect(() => {
    const savedWishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
    const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setWishlist(savedWishlist);
    setCart(savedCart);
  }, []);
  
  // Handle if no product is found
  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen px-6 py-8 bg-gray-100">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold text-red-600">Product Not Found</h2>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 text-white bg-green-600 rounded shadow hover:bg-green-700"
          >
            Return to Products
          </button>
        </div>
      </div>
    );
  }
  
  // Check if product is in wishlist or cart
  const isInWishlist = wishlist.some(item => item.id === product.id);
  const isInCart = cart.some(item => item.id === product.id);
  
  // Calculate actual price after discount
  const discountedPrice = product.price - (product.price * product.discount / 100);
  
  // Show popup message
  const showPopup = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };
  
  // Toggle wishlist status
  const toggleWishlist = () => {
    let updatedWishlist;
    if (isInWishlist) {
      updatedWishlist = wishlist.filter(item => item.id !== product.id);
      showPopup("Removed from wishlist");
    } else {
      updatedWishlist = [...wishlist, {...product, quantity: 1}];
      showPopup("Added to wishlist");
    }
    
    setWishlist(updatedWishlist);
    localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
  };
  
  // Toggle cart status
  const toggleCart = () => {
    let updatedCart;
    if (isInCart) {
      updatedCart = cart.filter(item => item.id !== product.id);
      showPopup("Removed from cart");
    } else {
      updatedCart = [...cart, {...product, quantity: 1}];
      showPopup("Added to cart");
    }
    
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };
  
  return (
    <div className="relative min-h-screen bg-gray-100">
      {/* Header/Navigation */}
      <header className="text-white bg-green-800 shadow-md">
        <div className="container px-6 py-4 mx-auto">
          <div className="flex items-center justify-between">
            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-white focus:outline-none"
              >
                {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
              </button>
            </div>
            
            {/* Item Name - Center on mobile, left on desktop */}
            <h1 className="text-xl font-bold truncate md:text-2xl md:flex-1">
              {product.title}
            </h1>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center md:space-x-6">
              <div className="relative">
                <button 
                  onClick={() => navigate("/wishlist")}
                  className="flex items-center space-x-1 hover:text-green-200"
                >
                  <FaHeart />
                  <span className="hidden lg:inline">Wishlist</span>
                  {wishlist.length > 0 && (
                    <span className="absolute flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-green-600 rounded-full -top-2 -right-2">
                      {wishlist.length}
                    </span>
                  )}
                </button>
              </div>
              
              <div className="relative">
                <button 
                  onClick={() => navigate("/cart")}
                  className="flex items-center space-x-1 hover:text-green-200"
                >
                  <FaShoppingCart />
                  <span className="hidden lg:inline">Cart</span>
                  {cart.length > 0 && (
                    <span className="absolute flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-green-600 rounded-full -top-2 -right-2">
                      {cart.length}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
          
          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="pt-4 pb-2 md:hidden">
              <div className="flex flex-col items-start space-y-4">
                <button 
                  onClick={() => {
                    navigate("/wishlist");
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-2 hover:text-green-200"
                >
                  <FaHeart />
                  <span>Wishlist</span>
                  {wishlist.length > 0 && (
                    <span className="flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-green-600 rounded-full">
                      {wishlist.length}
                    </span>
                  )}
                </button>
                
                <button 
                  onClick={() => {
                    navigate("/cart");
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-2 hover:text-green-200"
                >
                  <FaShoppingCart />
                  <span>Cart</span>
                  {cart.length > 0 && (
                    <span className="flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-green-600 rounded-full">
                      {cart.length}
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </header>
      
      {/* Main Content */}
      <div className="container px-6 py-8 mx-auto">
        {/* Popup Message */}
        {message && (
          <div className="fixed z-50 px-4 py-2 text-white transition-all duration-300 bg-green-600 rounded shadow top-4 right-4">
            {message}
          </div>
        )}
        
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center mb-6 text-green-800 hover:text-green-600"
        >
          <FaArrowLeft className="mr-2" /> Back to Products
        </button>
        
        <div className="overflow-hidden bg-white rounded-lg shadow-lg">
          <div className="md:flex">
            {/* Product Image */}
            <div className="md:w-1/2">
              <img
                src={product.image}
                alt={product.title}
                className="object-cover w-full h-96"
              />
            </div>
            
            {/* Product Details */}
            <div className="p-6 md:w-1/2">
              <h1 className="mb-4 text-3xl font-bold text-gray-800">{product.title}</h1>
              
              <div className="flex items-end gap-3 mb-4">
                <span className="text-2xl font-bold text-green-600">Rs.{discountedPrice.toFixed(2)}</span>
                <span className="text-lg text-gray-500 line-through">Rs.{product.price.toFixed(2)}</span>
                <span className="px-2 py-1 text-sm font-semibold text-white bg-green-800 rounded">-{product.discount}%</span>
              </div>
              
              <p className="mb-6 text-gray-600">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla facilisi. 
                Sed euismod, nunc vel tincidunt lacinia, nunc nisl aliquam nisl, 
                eget aliquam nunc nisl eu nunc.
              </p>

              {/* Stock Info */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Available Stock:</h3>
                <p className="text-gray-600">{product.stock} items left</p>
              </div>
              
              <div className="flex gap-4 mb-6">
                <button
                  onClick={toggleWishlist}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isInWishlist 
                      ? "bg-green-100 text-green-800 border border-green-300" 
                      : "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-green-50"
                  }`}
                >
                  <FaHeart className={isInWishlist ? "text-red-500" : ""} /> 
                  {isInWishlist ? "In Wishlist" : "Add to Wishlist"}
                </button>
                
                <button
                  onClick={toggleCart}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isInCart 
                      ? "bg-green-100 text-green-800 border border-green-300" 
                      : "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-green-50"
                  }`}
                >
                  <FaShoppingCart /> {isInCart ? "In Cart" : "Add to Cart"}
                </button>
              </div>
              
              <div className="mt-8">
                <h2 className="mb-4 text-xl font-bold text-gray-800">Product Specifications</h2>
                <ul className="space-y-2 text-gray-600 list-disc list-inside">
                  <li>High-quality eco-friendly material</li>
                  <li>Durable and long-lasting</li>
                  <li>Ergonomic design for comfortable use</li>
                  <li>Easy to clean and maintain</li>
                  <li>Perfect for gardening and cleaning tasks</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
