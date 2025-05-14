import express from 'express';
import { postUpload } from '../middleware/multer.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { 
  addProduct, 
  getProducts, 
  updateProduct, 
  deleteProduct,
  addReview,
  getReviews,
  updateReview,
  deleteReview,
  getProductById,  // Add the new controller function to get product by ID
  getUserProducts
} from '../controllers/productController.js';


const router = express.Router();

// Product Routes
router.post('/', authMiddleware, postUpload, addProduct); // Protect route
router.get('/my-products', authMiddleware, getUserProducts); // Route for logged-in user's products
 // Add new product
router.get('/', getProducts); // Get all products
router.get('/:id', getProductById); // Get product by ID
router.put('/:id', postUpload, updateProduct); // Update product by ID
router.delete('/:id', deleteProduct); // Delete product by ID

// Review Routes
router.post('/:productId/reviews',authMiddleware, addReview); // Add review for a product
router.get('/:productId/reviews',authMiddleware, getReviews); // Get reviews for a product
router.put('/:productId/reviews/:reviewId',authMiddleware, updateReview); // Update a review
router.delete('/:productId/reviews/:reviewId',authMiddleware, deleteReview); // Delete a review

export default router;
