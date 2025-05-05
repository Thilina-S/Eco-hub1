import Product from "../models/productModel.js";
import Review from "../models/reviewModel.js"; // Import Review model
import mongoose from "mongoose";

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
    res.status(201).json({ message: "Product added successfully", newProduct });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to add product", error: err.message });
  }
};

// Get all products
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to retrieve products", error: err.message });
  }
};

// ----- Review Functions -----
// Add new review
export const addReview = async (req, res) => {
  const { name, text, rating, userId } = req.body;
  const productId = req.params.productId;

  if (!name || !text || !rating) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // Validate productId
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({ message: "Invalid productId" });
  }

  try {
    const newReview = await Review.create({
      productId,
      userId,
      name,
      text,
      rating,
      date: new Date().toLocaleString(),
    });

    res.status(201).json({
      message: "Review added successfully",
      newReview,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to add review", error: err.message });
  }
};
// Get reviews for a product
export const getReviews = async (req, res) => {
  const productId = req.params.productId;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({ message: "Invalid productId" });
  }

  try {
    const reviews = await Review.find({ productId });
    res.status(200).json(reviews);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to retrieve reviews", error: err.message });
  }
};
