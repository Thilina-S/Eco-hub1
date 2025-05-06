// productRoutes.js
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
  deleteReview
} from '../controllers/productController.js';

const router = express.Router();

// Product Routes
router.post('/', postUpload, addProduct);
router.get('/', getProducts);
router.put('/:id', postUpload, updateProduct);
router.delete('/:id', deleteProduct);

// Review Routes - Updated path structure
router.post('/:productId/reviews', addReview);
router.get('/:productId/reviews', getReviews);
router.put('/:productId/reviews/:reviewId', updateReview);
router.delete('/:productId/reviews/:reviewId', deleteReview);

export default router;