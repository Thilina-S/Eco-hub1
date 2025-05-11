import express from 'express';
import { postUpload } from '../middleware/multer.js';
import { 
  addProduct, 
  getProducts, 
  updateProduct, 
  deleteProduct,
  addReview,
  getReviews,
  updateReview,
  deleteReview,
  getProductById  // Add the new controller function to get product by ID
} from '../controllers/productController.js';

const router = express.Router();

// Product Routes
router.post('/', postUpload, addProduct); // Add new product
router.get('/', getProducts); // Get all products
router.get('/:id', getProductById); // Get product by ID
router.put('/:id', postUpload, updateProduct); // Update product by ID
router.delete('/:id', deleteProduct); // Delete product by ID

// Review Routes
router.post('/:productId/reviews', addReview); // Add review for a product
router.get('/:productId/reviews', getReviews); // Get reviews for a product
router.put('/:productId/reviews/:reviewId', updateReview); // Update a review
router.delete('/:productId/reviews/:reviewId', deleteReview); // Delete a review

export default router;
