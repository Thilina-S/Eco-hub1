import React, { useState, useEffect } from "react";
import { FaHeart, FaShoppingCart } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

export default function ProductGrid() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState("");
  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/products`);
        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        showPopup(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Load wishlist and cart from localStorage
  useEffect(() => {
    const savedWishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
    const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setWishlist(savedWishlist);
    setCart(savedCart);
  }, []);

  // Message timeout
  useEffect(() => {
    if (message) {
      const timeout = setTimeout(() => setMessage(""), 3000);
      return () => clearTimeout(timeout);
    }
  }, [message]);

  const showPopup = (msg) => setMessage(msg);

  const toggleWishlist = (product) => {
    let updatedWishlist;
    const isInWishlist = wishlist.some((item) => item._id === product._id);

    if (isInWishlist) {
      updatedWishlist = wishlist.filter((item) => item._id !== product._id);
      showPopup("Removed from wishlist");
    } else {
      updatedWishlist = [...wishlist, { ...product, quantity: 1 }];
      showPopup("Added to wishlist");
    }

    setWishlist(updatedWishlist);
    localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
  };

  const toggleCart = (product) => {
    let updatedCart;
    const isInCart = cart.some((item) => item._id === product._id);

    if (isInCart) {
      updatedCart = cart.filter((item) => item._id !== product._id);
      showPopup("Removed from cart");
    } else {
      updatedCart = [...cart, { ...product, quantity: 1 }];
      showPopup("Added to cart");
    }

    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const navigateToItemView = (product) => {
    navigate("/itemview", { state: { product } });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-xl font-semibold text-emerald-800">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen px-4 py-8 bg-white sm:px-6">
      {message && (
        <div className="fixed z-50 px-4 py-2 text-white transition-all duration-300 bg-green-600 rounded shadow top-4 right-4">
          {message}
        </div>
      )}

      <div className="flex flex-col items-center justify-between mb-6 space-y-4 sm:flex-row sm:space-y-0">
        <h1 className="text-3xl font-extrabold text-emerald-800 drop-shadow-sm">🌿 Marketplace</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Link
              to="/wishlist"
              onClick={() => localStorage.setItem("wishlist", JSON.stringify(wishlist))}
            >
              <FaHeart className="text-2xl text-red-500 cursor-pointer" />
            </Link>
            {wishlist.length > 0 && (
              <span className="absolute px-1 text-xs text-white bg-red-600 rounded-full -top-2 -right-2">
                {wishlist.length}
              </span>
            )}
          </div>
          <div className="relative">
            <Link to="/cart">
              <FaShoppingCart className="text-2xl text-blue-600 cursor-pointer" />
            </Link>
            {cart.length > 0 && (
              <span className="absolute px-1 text-xs text-white bg-blue-600 rounded-full -top-2 -right-2">
                {cart.length}
              </span>
            )}
          </div>
          <button
            onClick={() => navigate("/myitems")}
            className="px-4 py-2 text-white rounded shadow bg-emerald-600 hover:bg-emerald-700"
          >
            My Items
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {products.map((product) => {
          const isInWishlist = wishlist.some((item) => item._id === product._id);
          const isInCart = cart.some((item) => item._id === product._id);
          const discountedPrice = product.price - (product.price * product.discount) / 100;

          return (
            <div
              key={product._id}
              className="relative p-4 transition-transform duration-300 bg-white rounded-xl shadow-md hover:scale-[1.02]"
            >
              <div onClick={() => navigateToItemView(product)} className="cursor-pointer">
                <img
                  src={product.imageUrl || "/placeholder-product.jpg"}
                  alt={product.title}
                  className="object-cover w-full h-40 rounded-md sm:h-48 md:h-56"
                />
              </div>

              <div className="flex items-center justify-between gap-3 mt-3">
                <div className="flex items-center gap-3">
                  <FaHeart
                    onClick={() => toggleWishlist(product)}
                    className={`cursor-pointer text-lg transition-colors duration-200 ${
                      isInWishlist ? "text-red-500" : "text-gray-400 hover:text-red-400"
                    }`}
                  />
                  <FaShoppingCart
                    onClick={() => toggleCart(product)}
                    className={`cursor-pointer text-lg transition-colors duration-200 ${
                      isInCart ? "text-blue-600" : "text-gray-400 hover:text-blue-400"
                    }`}
                  />
                </div>
                <span className="text-sm font-semibold text-emerald-700">
                  {product.stock} In stock
                </span>
              </div>

              <div onClick={() => navigateToItemView(product)} className="mt-3 cursor-pointer">
                <h2 className="text-base font-semibold text-emerald-900 line-clamp-2">
                  {product.title}
                </h2>
                <div className="flex items-center mt-1 space-x-2">
                  <p className="font-bold text-green-600">
                    Rs.{discountedPrice.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500 line-through">
                    Rs.{product.price.toFixed(2)}
                  </p>
                  <p className="text-sm text-emerald-600">-{product.discount}%</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}