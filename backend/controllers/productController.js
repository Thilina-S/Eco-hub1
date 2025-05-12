import Product from '../models/productModel.js';
import Review from '../models/reviewModel.js';  // Import Review model

// ----- Product Functions -----
// Add new product
export const addProduct = async (req, res) => {
  const { title, price, discount, stock } = req.body;
  const imageUrl = req.file
    ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
    : null;

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

// Get a product by ID
export const getProductById = async (req, res) => {
  const { id } = req.params; // Get productId from params
  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve product', error: err.message });
  }
};

// Update product by ID
export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { title, price, discount, stock } = req.body;

  let updateData = { title, price, discount, stock };

  if (req.file) {
    updateData.imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  }

  try {
    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true });
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
  try {
    const { productId } = req.params;
    const { name, text, rating } = req.body;

    if (!name || !text || !rating) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const newReview = await Review.create({
      productId,
      userId: req.userId, // use authenticated user
      name,
      text,
      rating,
      date: new Date().toISOString(),
    });

    res.status(201).json({ message: 'Review added successfully', newReview });
  } catch (err) {
    console.error(err);
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
    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    if (review.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'You can only update your own review' });
    }

    review.text = req.body.text;
    review.rating = req.body.rating;
    review.date = 'Edited just now';

    const updatedReview = await review.save();

    res.status(200).json({ message: 'Review updated successfully', updatedReview });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update review', error: err.message });
  }
};

// Delete review
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    if (review.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'You can only delete your own review' });
    }

    await Review.findByIdAndDelete(req.params.reviewId);
    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete review', error: err.message });
  }
};

