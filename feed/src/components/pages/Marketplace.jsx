import React, { useState, useEffect } from "react";
import { FaHeart, FaShoppingCart } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

const initialProducts = [
  {
    id: 1,
    title: "Leaf Rake",
    price: 1275,
    discount: 15,
    image: "../../../public/leaf-rake.jpg",
  },
  {
    id: 2,
    title: "Rake",
    price: 1600,
    discount: 20,
    image: "../../../public/rake.jpg",
  },
  {
    id: 3,
    title: "Recycle Bins",
    price: 2400,
    discount: 20,
    image: "../../../public/recycle bins.jpeg",
  },
  {
    id: 4,
    title: "Vaccum Garbage Collector",
    price: 12750,
    discount: 15,
    image: "../../../public/vaccum garbage collector.jpeg",
  },
  {
    id: 5,
    title: "Garbage Pickup Tool",
    price: 1600,
    discount: 20,
    image: "../../../public/pickeuu tool.jpeg",
  },
];

export default function ProductGrid() {
  const navigate = useNavigate();
  
  // Initialize products from localStorage or use initial products if none exist
  const [products, setProducts] = useState(() => {
    const savedProducts = localStorage.getItem("products");
    return savedProducts ? JSON.parse(savedProducts) : initialProducts;
  });

  const [message, setMessage] = useState("");
  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState([]);
  
  // Load wishlist and cart from localStorage on component mount
  useEffect(() => {
    const savedWishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
    const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setWishlist(savedWishlist);
    setCart(savedCart);
  }, []);

  // Save products to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("products", JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    if (message) {
      const timeout = setTimeout(() => setMessage(""), 3000);
      return () => clearTimeout(timeout);
    }
  }, [message]);

  const showPopup = (msg) => setMessage(msg);

  const toggleWishlist = (product) => {
    let updatedWishlist;
    const isInWishlist = wishlist.some(item => item.id === product.id);
    
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

  const toggleCart = (product) => {
    let updatedCart;
    const isInCart = cart.some(item => item.id === product.id);
    
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

  const navigateToItemView = (product) => {
    navigate('/itemview', { state: { product } });
  };

  return (
    <div className="relative min-h-screen px-4 py-8 bg-gray-100 sm:px-6">
      {message && (
        <div className="fixed z-50 px-4 py-2 text-white transition-all duration-300 bg-green-500 rounded shadow top-4 right-4">
          {message}
        </div>
      )}

      {/* Top Bar */}
      <div className="flex flex-col items-center justify-between mb-6 space-y-4 sm:flex-row sm:space-y-0">
        <h1 className="text-2xl font-bold text-green-600">
          Suggestions For You
        </h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Link to="/wishlist">
              <FaHeart className="text-xl text-red-500 cursor-pointer" />
            </Link>
            {wishlist.length > 0 && (
              <span className="absolute px-1 text-xs text-white bg-red-500 rounded-full -top-2 -right-2">
                {wishlist.length}
              </span>
            )}
          </div>
          <div className="relative">
            <Link to="/cart">
              <FaShoppingCart className="text-xl text-blue-600 cursor-pointer" />
            </Link>
            {cart.length > 0 && (
              <span className="absolute px-1 text-xs text-white bg-blue-600 rounded-full -top-2 -right-2">
                {cart.length}
              </span>
            )}
          </div>
          <button
            onClick={() => navigate('/myitems')}
            className="px-4 py-2 text-white bg-green-500 rounded shadow hover:bg-green-600"
          >
            My Items
          </button>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {products.map((product) => {
          const isInWishlist = wishlist.some(item => item.id === product.id);
          const isInCart = cart.some(item => item.id === product.id);
          const discountedPrice = product.price - (product.price * product.discount / 100);

          return (
            <div
              key={product.id}
              className="relative p-4 transition-shadow duration-300 rounded-lg shadow-md bg-green-50 hover:shadow-lg"
            >
              {/* Product Image - clickable */}
              <div 
                onClick={() => navigateToItemView(product)} 
                className="cursor-pointer"
              >
                <img
                  src={product.image}
                  alt={product.title}
                  className="object-cover w-full rounded-lg h-36 sm:h-40 md:h-48"
                />
              </div>

              {/* Wishlist/Cart Buttons - under image */}
              <div className="flex justify-end gap-3 mt-3">
                <FaHeart
                  onClick={() => toggleWishlist(product)}
                  className={`cursor-pointer text-lg ${
                    isInWishlist
                      ? "text-red-500"
                      : "text-gray-400 hover:text-red-400"
                  }`}
                />
                <FaShoppingCart
                  onClick={() => toggleCart(product)}
                  className={`cursor-pointer text-lg ${
                    isInCart
                      ? "text-blue-600"
                      : "text-gray-400 hover:text-blue-400"
                  }`}
                />
              </div>

              {/* Product Info - clickable */}
              <div 
                onClick={() => navigateToItemView(product)} 
                className="mt-3 cursor-pointer"
              >
                <h2 className="text-sm font-medium line-clamp-2 sm:text-base">
                  {product.title}
                </h2>
                <div className="flex items-center mt-1 space-x-2">
                  <p className="font-semibold text-green-600">Rs.{discountedPrice.toFixed(2)}</p>
                  <p className="text-xs text-gray-500 line-through sm:text-sm">Rs.{product.price.toFixed(2)}</p>
                  <p className="text-xs text-green-600 sm:text-sm">-{product.discount}%</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}