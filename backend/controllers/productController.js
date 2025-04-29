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
// Add new review
export const addReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { userId, name, text, rating } = req.body;

    // Ensure required fields are present
    if (!userId || !name || !text || !rating) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Create a new review with the current date automatically set
    const newReview = await Review.create({
      productId,
      userId,
      name,
      text,
      rating,
      date: new Date().toISOString(),  // Automatically set the current date
      isCurrentUser: true
    });

    // Return success response
    res.status(201).json({ message: 'Review added successfully', newReview });
  } catch (err) {
    console.error(err);  // Log the error for better insight
    res.status(500).json({ message: 'Failed to add review', error: err.message });
  }
};

// Get reviews for a product
export const getReviews = async (req, res) => {
  const { productId } = req.params;
  try {
    const reviews = await Review.find({ productId });
    res.status(200).json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve reviews', error: err.message });
  }
};

// Update review
export const updateReview = async (req, res) => {
  try {
    const updatedReview = await Review.findByIdAndUpdate(
      req.params.reviewId,
      { 
        text: req.body.text, 
        rating: req.body.rating,
        date: 'Edited just now' 
      },
      { new: true }
    );
    
    res.status(200).json({ 
      message: 'Review updated successfully',
      updatedReview 
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update review', error: err.message });
  }
};

// Delete review
export const deleteReview = async (req, res) => {
  try {
    const deletedReview = await Review.findByIdAndDelete(req.params.reviewId);
    res.status(200).json({ 
      message: 'Review deleted successfully', 
      deletedReview 
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete review', error: err.message });
  }
};
