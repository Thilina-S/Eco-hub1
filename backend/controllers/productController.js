import Product from '../models/productModel.js';
import Review from '../models/reviewModel.js';  // Import Review model

// ----- Product Functions -----
// Add new product
export const addProduct = async (req, res) => {
  const { title, price, discount, stock } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const newProduct = new Product({
      title,
      price,
      discount,
      imageUrl,
      stock,
    });

    await newProduct.save();
    res.status(201).json({ message: 'Product added successfully', newProduct });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add product', error: err.message });
  }
};

// Get all products
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve products', error: err.message });
  }
};

// Update product by ID
export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { title, price, discount, stock } = req.body;

  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { title, price, discount, stock },
      { new: true }
    );
    res.status(200).json(updatedProduct);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update product', error: err.message });
  }
};

// Delete product by ID
export const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedProduct = await Product.findByIdAndDelete(id);
    res.status(200).json({ message: 'Product deleted successfully', deletedProduct });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete product', error: err.message });
  }
};

// ----- Review Functions -----
// Add new review
export const addReview = async (req, res) => {
  const { productId } = req.params;
  const { name, text, rating } = req.body;  // Change username to name
  const date = new Date().toLocaleString();

  try {
    const newReview = new Review({
      productId,
      name,  // Change username to name
      text,
      date,
      rating,
      isCurrentUser: true,  // Assuming current user logic
    });

    await newReview.save();
    res.status(201).json({ message: 'Review added successfully', newReview });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add review', error: err.message });
  }
};

// Get all reviews for a product
export const getReviews = async (req, res) => {
  const { productId } = req.params;

  try {
    const reviews = await Review.find({ productId }).sort({ createdAt: -1 });
    res.status(200).json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve reviews', error: err.message });
  }
};

// Update review by ID
export const updateReview = async (req, res) => {
  const { reviewId } = req.params;
  const { text, rating } = req.body;

  try {
    const updatedReview = await Review.findByIdAndUpdate(
      reviewId,
      { text, rating, date: 'Edited just now' },
      { new: true }
    );
    res.status(200).json(updatedReview);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update review', error: err.message });
  }
};

// Delete review by ID
export const deleteReview = async (req, res) => {
  const { reviewId } = req.params;

  try {
    const deletedReview = await Review.findByIdAndDelete(reviewId);
    res.status(200).json({ message: 'Review deleted successfully', deletedReview });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete review', error: err.message });
  }
};
