import React, { useState } from "react";
import { FaTrash } from "react-icons/fa";

export default function CartPage() {
  const [quantity, setQuantity] = useState(1);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

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

  return (
    <div className="bg-green-100 min-h-screen text-black p-4">
      <h1 className="text-center text-2xl font-bold text-green-800 mb-8">MY CART</h1>

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6">
        {/* Product Card */}
        <div className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center">
          <div className="flex flex-col gap-2">
            <h2 className="font-bold text-lg text-green-800">Mid Half Socks</h2>
            <p className="text-green-700">LKR 1,250</p>
            <p className="text-sm text-gray-500">Sheer White</p>
            <div className="flex items-center gap-3 mt-2">
              <button
                className="px-2 py-1 border border-green-700 rounded text-green-800 hover:bg-green-200"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                -
              </button>
              <span>{quantity}</span>
              <button
                className="px-2 py-1 border border-green-700 rounded text-green-800 hover:bg-green-200"
                onClick={() => setQuantity(quantity + 1)}
              >
                +
              </button>
              <button className="ml-4 text-red-500 hover:text-red-700">
                <FaTrash />
              </button>
            </div>
          </div>
          <img
            src="https://via.placeholder.com/120"
            alt="Mid Half Socks"
            className="w-28 h-auto rounded-xl object-cover"
          />
        </div>

        {/* Order Summary */}
        <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
          <h2 className="font-bold text-lg text-green-800">ORDER SUMMARY</h2>
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>LKR {1250 * quantity}</span>
          </div>
          <p className="text-sm text-gray-500">
            Shipping calculated at check out
            <br />
            Tax calculated at check out
          </p>
          <button className="w-full bg-green-700 text-white py-3 rounded-full font-semibold hover:bg-green-600 transition">
            CHECK OUT – LKR {1250 * quantity}
          </button>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="mt-16 py-12 bg-green-200 text-center px-4 rounded-lg shadow-inner">
        <h3 className="text-xl font-semibold text-green-900 mb-2">
          OUR NEWEST PRODUCTS STRAIGHT TO YOUR INBOX.
        </h3>
        <p className="text-sm text-gray-700 mb-4 max-w-xl mx-auto">
          Be the first to know about our products, limited-time offers, community events, and more.
        </p>
        <form
          onSubmit={handleSignup}
          className="flex flex-col md:flex-row justify-center items-center gap-2 max-w-md mx-auto"
        >
          <input
            type="email"
            placeholder="Enter your email address"
            className="w-full px-4 py-2 rounded-full bg-white text-black border border-green-400 focus:outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            type="submit"
            className="px-6 py-2 bg-green-700 text-white rounded-full hover:bg-green-600 transition"
          >
            SIGN UP
          </button>
        </form>
        {emailError && <p className="text-red-600 mt-2 text-sm">{emailError}</p>}
      </div>
    </div>
  );
}
