import express from 'express';
import upload from '../middleware/multer.js'; // Import multer
import { addProduct, getProducts, updateProduct, deleteProduct } from '../controllers/productController.js'; // Import product functions
import { addReview, getReviews, updateReview, deleteReview } from '../controllers/productController.js'; // Import review functions

const router = express.Router();

// Product Routes
router.post('/', upload.single('image'), addProduct); // Add new product
router.get('/', getProducts); // Get all products
router.put('/:id', updateProduct); // Update product by ID
router.delete('/:id', deleteProduct); // Delete product by ID

// Review Routes
router.post('/reviews/:productId', addReview); // Add new review
router.get('/reviews/:productId', getReviews); // Get all reviews for a product
router.put('/reviews/:reviewId', updateReview); // Update review by ID
router.delete('/reviews/:reviewId', deleteReview); // Delete review by ID

export default router;
