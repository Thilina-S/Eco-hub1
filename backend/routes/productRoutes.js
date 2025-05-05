import express from 'express';
import { profileUpload, postUpload } from '../middleware/multer.js'; // Using named exports
import { addProduct, getProducts, updateProduct, deleteProduct } from '../controllers/productController.js';
import { addReview, getReviews, updateReview, deleteReview } from '../controllers/productController.js';

const router = express.Router();

// Product Routes
router.post('/', postUpload, addProduct); // Use postUpload for product images
router.get('/', getProducts);
router.put('/:id', postUpload, updateProduct); // Allow image updates with PUT requests
router.delete('/:id', deleteProduct);

// Review Routes
router.post('/reviews/:productId', addReview);
router.get('/reviews/:productId', getReviews);
router.put('/reviews/:reviewId', updateReview);
router.delete('/reviews/:reviewId', deleteReview);

export default router;