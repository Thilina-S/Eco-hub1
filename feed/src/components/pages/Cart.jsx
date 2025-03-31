import React, { useState, useEffect } from "react";
import { FaTrash, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function CartPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  // Load cart from localStorage on component mount
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart") || []);
    setCart(savedCart);
  }, []);

  const validateEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const handleSignup = (e) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address.");
    } else {
      setEmailError("");
      alert("Subscribed successfully!");
      setEmail("");
    }
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    
    const updatedCart = cart.map(item => 
      item.id === id ? { ...item, quantity: newQuantity } : item
    );
    
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const removeItem = (id) => {
    const updatedCart = cart.filter(item => item.id !== id);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  // Calculate subtotal using discounted price
  const subtotal = cart.reduce((sum, item) => {
    const discountedPrice = item.price - (item.price * item.discount / 100);
    return sum + (discountedPrice * item.quantity);
  }, 0);

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert("Your cart is empty. Please add items before checkout.");
      return;
    }
    navigate('/checkout', { state: { cart, subtotal } });
  };

  return (
    <div className="min-h-screen p-4 text-black bg-green-100">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-green-800 hover:text-green-600"
          >
            <FaArrowLeft className="mr-2" /> Back
          </button>
          <h1 className="text-2xl font-bold text-green-800">MY CART</h1>
          <div className="w-8"></div> {/* Spacer for alignment */}
        </div>

        {cart.length === 0 ? (
          <div className="py-12 text-center">
            <h2 className="mb-4 text-xl font-semibold text-green-800">Your cart is empty</h2>
            <button
              onClick={() => navigate("/marketplace")}
              className="px-6 py-2 text-white transition bg-green-700 rounded-full hover:bg-green-600"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Product Cards */}
            <div className="space-y-4">
              {cart.map((item) => {
                const discountedPrice = item.price - (item.price * item.discount / 100);
                
                return (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-white shadow-sm rounded-xl">
                    <div className="flex flex-col gap-2">
                      <h2 className="text-lg font-bold text-green-800">{item.title}</h2>
                      <div className="flex items-center gap-2">
                        <p className="text-green-700">Rs.{discountedPrice.toFixed(2)}</p>
                        {item.discount > 0 && (
                          <span className="text-xs text-gray-500 line-through">Rs.{item.price.toFixed(2)}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <button
                          className="px-2 py-1 text-green-800 border border-green-700 rounded hover:bg-green-200"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          className="px-2 py-1 text-green-800 border border-green-700 rounded hover:bg-green-200"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          +
                        </button>
                        <button 
                          className="ml-4 text-red-500 hover:text-red-700"
                          onClick={() => removeItem(item.id)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                    <img
                      src={item.image}
                      alt={item.title}
                      className="object-cover w-28 h-28 rounded-xl"
                    />
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="sticky p-6 space-y-4 bg-white shadow-md rounded-xl h-fit top-4">
              <h2 className="text-lg font-bold text-green-800">ORDER SUMMARY</h2>
              <div className="flex justify-between">
                <span>Subtotal ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                <span>Rs.{subtotal.toFixed(2)}</span>
              </div>
              <p className="text-sm text-gray-500">
                Shipping calculated at check out
                <br />
                Tax calculated at check out
              </p>
              <button 
                className="w-full py-3 font-semibold text-white transition bg-green-700 rounded-full hover:bg-green-600"
                onClick={handleCheckout}
              >
                CHECK OUT – Rs.{subtotal.toFixed(2)}
              </button>
            </div>
          </div>
        )}

        {/* Newsletter Section */}
        <div className="px-4 py-12 mt-16 text-center bg-green-200 rounded-lg shadow-inner">
          <h3 className="mb-2 text-xl font-semibold text-green-900">
            OUR NEWEST PRODUCTS STRAIGHT TO YOUR INBOX.
          </h3>
          <p className="max-w-xl mx-auto mb-4 text-sm text-gray-700">
            Be the first to know about our products, limited-time offers, community events, and more.
          </p>
          <form
            onSubmit={handleSignup}
            className="flex flex-col items-center justify-center max-w-md gap-2 mx-auto md:flex-row"
          >
            <input
              type="email"
              placeholder="Enter your email address"
              className="w-full px-4 py-2 text-black bg-white border border-green-400 rounded-full focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              type="submit"
              className="px-6 py-2 text-white transition bg-green-700 rounded-full hover:bg-green-600"
            >
              Sign up
            </button>
          </form>
          {emailError && <p className="mt-2 text-sm text-red-600">{emailError}</p>}
        </div>
      </div>
    </div>
  );
}