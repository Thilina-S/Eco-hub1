import React, { useState } from "react";

const wishlistData = [
  {
    id: 1,
    name: "Armchair",
    price: 99.0,
    status: "In Stock",
    image: "https://via.placeholder.com/60x60?text=Armchair",
  },
  {
    id: 2,
    name: "Jugs",
    price: 19.0,
    status: "In Stock",
    image: "https://via.placeholder.com/60x60?text=Jugs",
  },
  {
    id: 3,
    name: "Small Chair",
    price: 55.0,
    status: "In Stock",
    image: "https://via.placeholder.com/60x60?text=Small+Chair",
  },
  {
    id: 4,
    name: "Chair",
    price: 29.0,
    status: "In Stock",
    image: "https://via.placeholder.com/60x60?text=Chair",
  },
  {
    id: 5,
    name: "Light Bulb",
    price: 19.0,
    status: "In Stock",
    image: "https://via.placeholder.com/60x60?text=Light+Bulb",
  },
];

export default function Wishlist() {
  const [wishlist, setWishlist] = useState(wishlistData);
  const [error, setError] = useState("");

  const handleAddToCart = (item) => {
    if (!item || !item.name || !item.price) {
      setError("Invalid item details");
      return;
    }
    setError("");
    alert(`${item.name} added to cart!`);
  };

  const removeItem = (id) => {
    setWishlist(wishlist.filter((item) => item.id !== id));
  };

  return (
    <div className="p-4 max-w-6xl mx-auto text-gray-800 dark:text-gray-100">
      <h1 className="text-2xl font-bold mb-4 text-green-900 dark:text-green-300">Wishlist</h1>
      {error && (
        <p className="text-red-500 text-sm mb-2 font-medium">{error}</p>
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
            {wishlist.map((item) => (
              <tr key={item.id} className="border-b hover:bg-gray-100 dark:hover:bg-gray-700">
                <td className="p-4">
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-500 font-bold"
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
                  {item.name}
                </td>
                <td className="p-4">${item.price.toFixed(2)}</td>
                <td className="p-4">
                  <span className="text-green-700 dark:text-green-400 font-medium">
                    {item.status}
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
