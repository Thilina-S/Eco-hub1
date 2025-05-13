import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaHeart,
  FaShoppingCart,
  FaArrowLeft,
  FaStar,
  FaBars,
  FaTimes
} from "react-icons/fa";

// Create an API client for authenticated requests
const createApiClient = () => {
  const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
      'Content-Type': 'application/json',
    }
  });

  apiClient.interceptors.request.use(
    config => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    error => Promise.reject(error)
  );

  return apiClient;
};

export default function ItemView() {
  const { productId } = useParams();  // Get productId from URL params
  const navigate = useNavigate();
  const apiClient = createApiClient();  // Initialize API client

  // States to store product and reviews data
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [message, setMessage] = useState("");
  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState([]);
  const [newReview, setNewReview] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [rating, setRating] = useState(5);
  const [currentUser, setCurrentUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch current user from backend
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          return; // No token, no authenticated user
        }

        const response = await apiClient.get('/profile');

        // Update user state with consistent structure
        setCurrentUser({
          id: response.data.user.id,
          userId: response.data.user.id, // Adding both for compatibility
          name: response.data.user.name,
          userName: response.data.user.name, // Adding both for compatibility
          profilePhoto: response.data.user.profilePhoto
        });

        setLoading(false);
      } catch (err) {
        console.error("Error fetching current user:", err);
        setError("Failed to load user data");
        setLoading(false);

        // Check for 401 unauthorized specifically
        if (err.response && err.response.status === 401) {
          // Token might be invalid or expired
        }
      }
    };

    fetchCurrentUser();
  }, []);

  // Fetch product when the component mounts
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await apiClient.get(`/products/${productId}`);
        setProduct(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch product:", error);
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);  // Re-fetch when productId changes

  // Fetch reviews for the product
  useEffect(() => {
    if (productId) {
      const fetchReviews = async () => {
        try {
          const response = await apiClient.get(`/products/${productId}/reviews`);

          // Process reviews to mark those belonging to current user
          const processedReviews = response.data.map((review) => {
            // For debugging
            console.log("Review:", review);
            console.log("Current User:", currentUser);

            // Check ID match in multiple formats to ensure compatibility
            const isUsersReview =
              currentUser &&
              (review.userId === currentUser.id ||
                review.userId === currentUser.userId ||
                review.user_id === currentUser.id ||
                review._id === currentUser.id);

            return {
              ...review,
              isCurrentUser: isUsersReview,
            };
          });

          console.log("Processed Reviews:", processedReviews);
          setReviews(processedReviews);
        } catch (error) {
          console.error("Failed to fetch reviews:", error);
        }
      };
      fetchReviews();
    }
  }, [productId, currentUser]);

  // Show popup message
  const showPopup = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  // Check if user is authenticated (has token)
  const isAuthenticated = !!localStorage.getItem("token");

  // Handle if product is still loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen px-6 py-8 bg-gray-100">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold text-green-800">
            Loading Product...
          </h2>
        </div>
      </div>
    );
  }

  // Handle if no product is found
  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen px-6 py-8 bg-gray-100">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold text-red-600">
            Product Not Found
          </h2>
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

  // Calculate discounted price
  const discountedPrice = product.price - (product.price * (product.discount || 0)) / 100;

  // Product status checks
  const isInWishlist = wishlist.some((item) => item.id === product._id);
  const isInCart = cart.some((item) => item.id === product._id);

  // Handle Wishlist toggle
  const toggleWishlist = () => {
    const updatedWishlist = isInWishlist
      ? wishlist.filter((item) => item.id !== product._id)
      : [...wishlist, { ...product, quantity: 1 }];

    setWishlist(updatedWishlist);
    showPopup(isInWishlist ? "Removed from wishlist" : "Added to wishlist");
  };

  // Handle Cart toggle
  const toggleCart = () => {
    const updatedCart = isInCart
      ? cart.filter((item) => item.id !== product._id)
      : [...cart, { ...product, quantity: 1 }];

    setCart(updatedCart);
    showPopup(isInCart ? "Removed from cart" : "Added to cart");
  };

  // Handle Review Add
  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!newReview.trim()) return;

    try {
      if (!isAuthenticated) {
        showPopup("Please log in to leave a review");
        return;
      }

      const userData = currentUser || { id: "current-user", name: "User" };

      await apiClient.post(
        `/products/${productId}/reviews`,
        {
          userId: userData.id,
          name: userData.name || "User",
          text: newReview,
          rating,
        }
      );

      // After adding the review, fetch the updated reviews
      const updatedReviewsResponse = await apiClient.get(`/products/${productId}/reviews`);

      const processedReviews = updatedReviewsResponse.data.map((review) => ({
        ...review,
        isCurrentUser: currentUser && review.userId === currentUser.id,
      }));

      setReviews(processedReviews);
      setNewReview("");
      setRating(5);
      showPopup("Review added successfully");
    } catch (error) {
      console.error("Failed to add review:", error);
      showPopup("Failed to add review. Please try again later.");
    }
  };

  // Handle Review Update
  const handleUpdateReview = async () => {
    if (!editText.trim()) return;

    try {
      if (!isAuthenticated) {
        showPopup("Please log in to update a review");
        return;
      }

      console.log("Updating review with ID:", editingId);
      await apiClient.put(
        `/products/${productId}/reviews/${editingId}`,
        {
          text: editText,
          rating,
        }
      );

      // After updating, fetch the updated reviews
      const updatedReviewsResponse = await apiClient.get(`/products/${productId}/reviews`);

      // Process reviews with the same logic as in the fetch function
      const processedReviews = updatedReviewsResponse.data.map((review) => {
        const isUsersReview =
          currentUser &&
          (review.userId === currentUser.id ||
            review.userId === currentUser.userId ||
            review.user_id === currentUser.id ||
            review._id === currentUser.id);

        return {
          ...review,
          isCurrentUser: isUsersReview,
        };
      });

      setReviews(processedReviews);
      setEditingId(null); // Reset editing state
      setEditText(""); // Clear edit input
      showPopup("Review updated successfully");
    } catch (error) {
      console.error("Failed to update review:", error);
      showPopup("Failed to update review");
    }
  };

  // Handle Review Deletion
  const handleDeleteReview = async (reviewId) => {
    try {
      if (!isAuthenticated) {
        showPopup("Please log in to delete a review");
        return;
      }

      console.log("Deleting review with ID:", reviewId);
      await apiClient.delete(`/products/${productId}/reviews/${reviewId}`);

      // After deletion, fetch the updated reviews
      const updatedReviewsResponse = await apiClient.get(`/products/${productId}/reviews`);

      // Process reviews with the same logic as in the fetch function
      const processedReviews = updatedReviewsResponse.data.map((review) => {
        const isUsersReview =
          currentUser &&
          (review.userId === currentUser.id ||
            review.userId === currentUser.userId ||
            review.user_id === currentUser.id ||
            review._id === currentUser.id);

        return {
          ...review,
          isCurrentUser: isUsersReview,
        };
      });

      setReviews(processedReviews);
      showPopup("Review deleted successfully");
    } catch (error) {
      console.error("Failed to delete review:", error);
      showPopup("Failed to delete review");
    }
  };

  const startEditing = (review) => {
    setEditingId(review._id);
    setEditText(review.text);
    setRating(review.rating);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditText("");
  };

  // Calculate average rating
  const averageRating =
    reviews.length > 0
      ? (
        reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      ).toFixed(1)
      : 0;

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

            {/* Item Name */}
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
          <div className="fixed z-50 px-4 py-2 text-white transition-all duration-300 bg-green-600 rounded top-4 right-4">
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

        {/* Product Details */}
        <div className="overflow-hidden bg-white rounded-lg shadow-lg">
          <div className="md:flex">
            {/* Product Image */}
            <div className="md:w-1/2">
              <img
                src={product.imageUrl || "/placeholder-product.jpg"}
                alt={product.title}
                className="object-cover w-full h-96"
              />
            </div>

            {/* Product Info */}
            <div className="p-6 md:w-1/2">
              <h1 className="mb-4 text-3xl font-bold text-gray-800">
                {product.title}
              </h1>

              <div className="flex items-end gap-3 mb-4">
                <span className="text-2xl font-bold text-green-600">
                  Rs.{discountedPrice.toFixed(2)}
                </span>
                {product.discount > 0 && (
                  <>
                    <span className="text-lg text-gray-500 line-through">
                      Rs.{product.price.toFixed(2)}
                    </span>
                    <span className="px-2 py-1 text-sm font-semibold text-white bg-green-800 rounded">
                      -{product.discount}%
                    </span>
                  </>
                )}
              </div>

              <p className="mb-6 text-gray-600">
                {product.description || "No description available."}
              </p>

              {/* Stock Info */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800">
                  Available Stock:
                </h3>
                <p className="text-gray-600">{product.stock} items left</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mb-6">
                <button
                  onClick={toggleWishlist}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${isInWishlist
                      ? "bg-green-100 text-green-800 border border-green-300"
                      : "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-green-50"
                    }`}
                >
                  <FaHeart className={isInWishlist ? "text-red-500" : ""} />
                  {isInWishlist ? "In Wishlist" : "Add to Wishlist"}
                </button>

                <button
                  onClick={toggleCart}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${isInCart
                      ? "bg-green-100 text-green-800 border border-green-300"
                      : "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-green-50"
                    }`}
                >
                  <FaShoppingCart /> {isInCart ? "In Cart" : "Add to Cart"}
                </button>
              </div>

              {/* Specifications */}
              <div className="mt-8">
                <h2 className="mb-4 text-xl font-bold text-gray-800">
                  Product Specifications
                </h2>
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

          {/* Reviews Section */}
          <div className="p-6 border-t border-gray-200">
            <h1 className="mb-6 text-2xl font-bold">Customer Reviews</h1>

            {/* Add Review Form */}
            {isAuthenticated ? (
              <div className="mb-8">
                <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium">Rating</label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="p-2 border border-gray-300 rounded"
                  >
                    {[5, 4, 3, 2, 1].map((num) => (
                      <option key={`rating-${num}`} value={num}>
                        {num} star{num !== 1 ? "s" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <form onSubmit={handleAddReview}>
                  <textarea
                    value={newReview}
                    onChange={(e) => setNewReview(e.target.value)}
                    placeholder="Write your review..."
                    className="w-full p-3 mb-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    rows="3"
                    maxLength="200"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {200 - newReview.length} characters remaining
                    </span>
                    <button
                      type="submit"
                      className="px-4 py-2 text-white bg-green-600 rounded hover:bg-green-700 disabled:opacity-50"
                      disabled={!newReview.trim()}
                    >
                      Submit Review
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="p-4 mb-8 text-center bg-gray-100 rounded">
                <p>Please log in to leave a review</p>
                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 mt-2 text-white bg-green-600 rounded hover:bg-green-700"
                >
                  Log In
                </button>
              </div>
            )}

            {/* Reviews List */}
            <div>
              <div className="mb-4 text-lg font-semibold">
                Reviews [{reviews.length}]
                {reviews.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    Average rating: {averageRating}/5
                  </span>
                )}
              </div>

              {reviews.length === 0 ? (
                <p className="text-gray-500">
                  No reviews yet. Be the first to review!
                </p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div
                      key={review._id}
                      className="p-4 border-b border-gray-200"
                    >
                      <div className="flex justify-between">
                        <div>
                          <div className="font-medium">
                            {review.name || "Anonymous"}
                            {review.isCurrentUser && (
                              <span className="ml-2 text-xs font-normal text-green-600">(You)</span>
                            )}
                          </div>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <FaStar
                                key={`star-${review._id}-${i}`}
                                className={
                                  i < review.rating
                                    ? "text-yellow-500"
                                    : "text-gray-300"
                                }
                              />
                            ))}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(review.date).toLocaleString()}
                          </div>
                        </div>

                        {/* Show edit/delete options */}
                        {isAuthenticated && review.isCurrentUser && (
                          <div className="flex space-x-2">
                            {editingId === review._id ? (
                              <>
                                <button
                                  onClick={handleUpdateReview}
                                  className="px-2 py-1 text-sm text-green-600 hover:text-green-800"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={cancelEditing}
                                  className="px-2 py-1 text-sm text-gray-600 hover:text-gray-800"
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => startEditing(review)}
                                  className="px-2 py-1 text-sm text-blue-600 hover:text-blue-800"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteReview(review._id)}
                                  className="px-2 py-1 text-sm text-red-600 hover:text-red-800"
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        )}

                      </div>

                      {editingId === review._id ? (
                        <>
                          <select
                            value={rating}
                            onChange={(e) => setRating(Number(e.target.value))}
                            className="p-2 mt-2 border border-gray-300 rounded"
                          >
                            {[5, 4, 3, 2, 1].map((num) => (
                              <option key={`edit-rating-${num}`} value={num}>
                                {num} star{num !== 1 ? "s" : ""}
                              </option>
                            ))}
                          </select>
                          <textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="w-full p-2 mt-2 border border-gray-300 rounded"
                            rows="2"
                          />
                        </>
                      ) : (
                        <p className="mt-2">{review.text}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}