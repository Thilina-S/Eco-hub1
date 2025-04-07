import express from 'express';
import { addProduct, getProducts, updateProduct, deleteProduct } from '../controllers/productController.js'; // Import functions from controller
import upload from '../middleware/multer.js'; // Import multer

const router = express.Router();

// Add new product
router.post('/', upload.single('image'), addProduct);

// Get all products
router.get('/', getProducts);

// Update product by ID
router.put('/:id', updateProduct);

// Delete product by ID
router.delete('/:id', deleteProduct);

export default router;  // Use export default for ES module
