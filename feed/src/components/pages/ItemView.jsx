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
  const [rating, setRating] = useState(0);
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

  // Fetch reviews as soon as productId is available
  useEffect(() => {
    if (productId && currentUser) {
      const fetchReviews = async () => {
        try {
<<<<<<< HEAD
          const response = await axios.get(
            `${import.meta.env.VITE_API_URL}/products/reviews/${productId}`
          );
          console.log("Fetched reviews:", response.data);
=======
          const response = await apiClient.get(`/products/${productId}/reviews`);

          const processedReviews = response.data.map((review) => ({
            ...review,
            isCurrentUser: currentUser && review.userId === currentUser.id,
          }));
          
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
    if (rating === 0) return; // Only check if rating is selected

    console.log("product._id:", product._id);

    console.log("Submitting review:", {
      userId: currentUser?.id,
      name: currentUser?.name || "Anonymous",
      text: newReview.trim() || "No text review provided",
      rating,
    });

    try {
      if (!isAuthenticated) {
        showPopup("Please log in to leave a review");
        return;
      }

      const userData = currentUser || { id: "current-user", name: "User" };

      await apiClient.post(
        `/products/${productId}/reviews`,
        {
<<<<<<< HEAD
          userId: currentUser?.id,
          name: currentUser?.name || "Anonymous",
          text: newReview.trim() || "No text review provided", // Make text optional
=======
          userId: userData.id,
          name: userData.name || "User",
          text: newReview,
>>>>>>> 0edc26a0d9cf9d7bea248e47f5eadcd0fbdf97f6
          rating,
        }
      );

<<<<<<< HEAD
      console.log("Review response:", response.data);

      if (response.data.newReview) {
        setReviews([
          {
            ...response.data.newReview,
            isCurrentUser: true,
          },
          ...reviews,
        ]);
        setNewReview("");
        setRating(0);
        showPopup("Review added successfully");
      } else {
        console.error("Invalid response format:", response.data);
        showPopup("Failed to add review: Invalid response format");
      }
    } catch (error) {
      const errMsg = error.response?.data?.error || error.message;
      showPopup("Failed to add review: " + errMsg);
=======
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
>>>>>>> 0edc26a0d9cf9d7bea248e47f5eadcd0fbdf97f6
    }
  };

  // Handle Review Update
  const handleUpdateReview = async () => {
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
    setEditText(
      !review.text || review.text === "No text review provided"
        ? ""
        : review.text
    );
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
            <h1 className="mb-8 text-2xl font-bold text-green-700 text-left tracking-wide">
              Rating and review of {product?.title || "this product"}
            </h1>

            {/* Add Review Form */}
<<<<<<< HEAD
            {currentUser?.isAuthenticated ? (
              <div className="p-6 mb-8 bg-white rounded-lg shadow-md">
                <h2 className="mb-4 text-xl font-bold text-black">
                  Write a Review
                </h2>
                <form onSubmit={handleAddReview} className="space-y-4">
                  {/* Rating Selection */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-black">
                      Your Rating
                    </label>
                    <div className="flex items-center space-x-2">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <button
                          key={`rating-${num}`}
                          type="button"
                          onClick={() => {
                            if (rating === num) {
                              setRating(num - 1);
                            } else {
                              setRating(num);
                            }
                          }}
                          className={`p-2 rounded-full transition-colors ${
                            rating >= num
                              ? "bg-yellow-100 text-yellow-500"
                              : "bg-gray-100 text-gray-400 hover:bg-yellow-50"
                          }`}
                        >
                          <FaStar size={24} />
                        </button>
                      ))}
                    </div>
                  </div>
=======
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
>>>>>>> 0edc26a0d9cf9d7bea248e47f5eadcd0fbdf97f6

                  {/* Review Text */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-black">
                      Your Review (Optional)
                    </label>
                    <textarea
                      value={newReview}
                      onChange={(e) => setNewReview(e.target.value)}
                      placeholder="Share your experience with this product... (Optional)"
                      className="w-full p-4 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 min-h-[120px] placeholder-gray-400"
                      rows="4"
                      maxLength="500"
                    />
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-gray-500">
                        {500 - newReview.length} characters remaining
                      </span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={rating === 0}
                      className={`px-6 py-3 text-white rounded-lg transition-colors ${
                        rating === 0
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-green-600 hover:bg-green-700"
                      }`}
                    >
                      Submit Review
                    </button>
                  </div>
                </form>
              </div>
            ) : (
<<<<<<< HEAD
              <div className="p-6 mb-8 text-center bg-white rounded-lg shadow-md">
                <h2 className="mb-2 text-xl font-bold text-black">
                  Want to Share Your Experience?
                </h2>
                <p className="mb-4 text-gray-600">
                  Please log in to leave a review
                </p>
                <button
                  onClick={() => navigate("/login")}
                  className="px-6 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
=======
              <div className="p-4 mb-8 text-center bg-gray-100 rounded">
                <p>Please log in to leave a review</p>
                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 mt-2 text-white bg-green-600 rounded hover:bg-green-700"
>>>>>>> 0edc26a0d9cf9d7bea248e47f5eadcd0fbdf97f6
                >
                  Log In
                </button>
              </div>
            )}

            {/* Reviews List */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-black">
                    Customer Reviews
                  </h2>
                  <div className="flex items-center mt-2 space-x-4">
                    <div className="flex items-center">
                      <span className="text-3xl font-bold text-black">
                        {averageRating}
                      </span>
                      <span className="ml-2 text-gray-600">out of 5</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-600">
                        {reviews.length} reviews
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {reviews.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-lg shadow-md">
                  <p className="text-lg text-gray-600">
                    No reviews yet. Be the first to review!
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div
                      key={`review-${review._id}`}
                      className="p-4 border-b border-gray-200"
                    >
                      <div className="flex justify-between">
                        <div>
                          <div className="font-medium">
                            {review.name || "Anonymous"}
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
<<<<<<< HEAD
                          <div className="mt-2 text-sm text-gray-500">
                            {new Date(review.createdAt).toLocaleString()}
=======
                          <div className="text-sm text-gray-500">
                            {new Date(review.date).toLocaleString()}
>>>>>>> 0edc26a0d9cf9d7bea248e47f5eadcd0fbdf97f6
                          </div>
                        </div>

                        {/* Show edit/delete options */}
                        {isAuthenticated && review.isCurrentUser && (
                          <div className="flex space-x-2">
                            {editingId === review._id ? (
                              <>
                                <button
                                  onClick={handleUpdateReview}
                                  className="px-3 py-1 text-sm text-white bg-green-600 rounded hover:bg-green-700"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={cancelEditing}
                                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => startEditing(review)}
                                  className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => {
                                    if (
                                      window.confirm(
                                        "Are you sure you want to delete this review?"
                                      )
                                    ) {
                                      handleDeleteReview(review._id);
                                    }
                                  }}
                                  className="px-3 py-1 text-sm text-red-600 hover:text-red-800"
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        )}

                      </div>

                      {editingId === review._id ? (
                        <div className="mt-4 space-y-4">
                          <div className="flex items-center space-x-2">
                            {[1, 2, 3, 4, 5].map((num) => (
                              <button
                                key={`edit-rating-${num}`}
                                type="button"
                                onClick={() => setRating(num)}
                                className={`p-2 rounded-full transition-colors ${
                                  rating >= num
                                    ? "bg-yellow-100 text-yellow-500"
                                    : "bg-gray-100 text-gray-400 hover:bg-yellow-50"
                                }`}
                              >
                                <FaStar size={20} />
                              </button>
                            ))}
                          </div>
                          <textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="w-full p-3 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            rows="3"
                            placeholder="Type here..."
                          />
                        </div>
                      ) : (
                        <div className="mt-4">
                          {review.text &&
                          review.text !== "No text review provided" ? (
                            <p className="text-black">{review.text}</p>
                          ) : (
                            <p className="text-gray-500 italic">
                              No text review provided
                            </p>
                          )}
                        </div>
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