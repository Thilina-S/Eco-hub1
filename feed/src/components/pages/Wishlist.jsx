import React, { useState, useEffect } from "react";

export default function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const storedWishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setWishlist(storedWishlist);
    setCart(storedCart);
  }, []);

  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (message) {
      const timeout = setTimeout(() => setMessage(""), 3000);
      return () => clearTimeout(timeout);
    }
  }, [message]);

  const handleAddToCart = (item) => {
    if (!item || !item.name || !item.price) {
      setError("Invalid item details");
      return;
    }
    const isAlreadyInCart = cart.some((tool) => tool.id === item.id);
    if (isAlreadyInCart) {
      setMessage("Already in cart");
      return;
    }
    const updatedCart = [...cart, { ...item, quantity: 1 }];
    setCart(updatedCart);
    setMessage(`${item.name} added to cart!`);
    setError("");
  };

  const removeItem = (id) => {
    const updatedWishlist = wishlist.filter((item) => item.id !== id);
    setWishlist(updatedWishlist);
  };

  return (
    <div className="p-4 max-w-6xl mx-auto text-gray-800 dark:text-gray-100">
      <h1 className="text-3xl font-bold mb-4 text-emerald-700 dark:text-emerald-300">
        🌟 Wishlist
      </h1>

      {error && <p className="text-red-500 text-sm mb-2 font-medium">{error}</p>}
      {message && (
        <div className="px-4 py-2 mb-4 text-sm text-white bg-green-600 rounded shadow">
          {message}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-gray-800 shadow rounded-lg">
          <thead>
            <tr className="text-left border-b dark:border-gray-600">
              <th className="p-4"></th>
              <th className="p-4">Product name</th>
              <th className="p-4">Unit price</th>
              <th className="p-4">Stock status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {wishlist.length === 0 ? (
              <tr>
                <td className="p-4 text-center text-gray-500" colSpan="5">
                  Your wishlist is empty.
                </td>
              </tr>
            ) : (
              wishlist.map((item) => (
                <tr
                  key={item.id}
                  className="border-b hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <td className="p-4">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 font-bold text-lg"
                    >
                      &times;
                    </button>
                  </td>
                  <td className="p-4 flex items-center gap-2">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 rounded"
                    />
                    <span className="text-base font-medium">{item.name}</span>
                  </td>
                  <td className="p-4 font-semibold text-green-700 dark:text-green-300">
                    ${item.price.toFixed(2)}
                  </td>
                  <td className="p-4">
                    <span className="text-green-700 dark:text-green-400 font-medium">
                      {item.status || "In Stock"}
                    </span>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="border border-green-700 dark:border-green-300 text-green-700 dark:text-green-300 hover:bg-green-700 hover:text-white dark:hover:bg-green-300 dark:hover:text-black font-semibold py-1 px-3 rounded transition"
                    >
                      🛒 Add to Cart
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
