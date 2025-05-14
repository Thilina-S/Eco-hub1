import React, { useState, useEffect } from "react";
import { FaHeart, FaShoppingCart, FaSearch } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import jsPDF from 'jspdf';

export default function ProductGrid() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState("");
  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

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

  const navigateToItemView = (productId) => {
    navigate(`/itemview/${productId}`);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Safe search implementation with optional chaining
  const filteredProducts = products.filter((product) =>
    product?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const generatePdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("Product List", 14, 22);

    let y = 30;
    filteredProducts.forEach((product) => {
      const discountedPrice = product.price - (product.price * product.discount) / 100;
      doc.setFontSize(12);
      doc.text(`Title: ${product.title}`, 14, y);
      doc.text(`Price: Rs. ${discountedPrice.toFixed(2)}`, 14, y + 6);
      doc.text(`Discount: ${product.discount}%`, 14, y + 12);
      doc.text(`Stock: ${product.stock}`, 14, y + 18);
      y += 30;
    });

    doc.save("products.pdf");
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

      {/* Navbar with Dark Green and Light Green Styling */}
      <nav className="flex items-center justify-between p-4 text-black bg-[#006400]"> {/* Dark Green */}
        <div className="flex items-center">
          <Link to="/" className="text-2xl font-bold text-[#90EE90]"> {/* Light Green Text */}
            Marketplace
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              className="px-4 py-2 bg-gray-200 rounded-md"
              placeholder="Search..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <FaSearch className="absolute text-lg transform -translate-y-1/2 right-2 top-1/2" />
          </div>
          <Link to="/wishlist" className="relative">
            <FaHeart className="text-xl text-[#90EE90]" /> {/* Light Green Icons */}
            {wishlist.length > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-black bg-red-500 rounded-full">
                {wishlist.length}
              </span>
            )}
          </Link>
          <Link to="/cart" className="relative">
            <FaShoppingCart className="text-xl text-[#90EE90]" /> {/* Light Green Icons */}
            {cart.length > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-500 rounded-full">
                {cart.length}
              </span>
            )}
          </Link>
        </div>
      </nav>

      <div className="grid grid-cols-1 gap-6 mt-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {filteredProducts.map((product) => {
          const isInWishlist = wishlist.some((item) => item._id === product._id);
          const isInCart = cart.some((item) => item._id === product._id);
          const discountedPrice = product.price - (product.price * product.discount) / 100;

          return (
            <div
              key={product._id}
              className="relative p-4 transition-transform duration-300 bg-white rounded-xl shadow-md hover:scale-[1.02]"
            >
              <div onClick={() => navigateToItemView(product._id)} className="cursor-pointer">
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
                    className={`cursor-pointer text-lg transition-colors duration-200 ${isInWishlist ? "text-red-500" : "text-gray-400 hover:text-red-400"}`}
                  />
                  <FaShoppingCart
                    onClick={() => toggleCart(product)}
                    className={`cursor-pointer text-lg transition-colors duration-200 ${isInCart ? "text-blue-600" : "text-gray-400 hover:text-blue-400"}`}
                  />
                </div>
                <span className="text-sm font-semibold text-emerald-700">{product.stock} In stock</span>
              </div>

              <div onClick={() => navigateToItemView(product._id)} className="mt-3 cursor-pointer">
                <h2 className="text-base font-semibold text-emerald-900 line-clamp-2">{product.title}</h2>
                <div className="flex items-center mt-1 space-x-2">
                  <p className="font-bold text-green-600">Rs.{discountedPrice.toFixed(2)}</p>
                  <p className="text-sm text-gray-500 line-through">Rs.{product.price.toFixed(2)}</p>
                  <p className="text-sm text-emerald-600">-{product.discount}%</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={generatePdf}
        className="fixed p-3 text-white bg-green-700 rounded-full shadow-md bottom-4 right-4 hover:bg-green-800"
      >
        Generate PDF
      </button>
    </div>
  );
}
