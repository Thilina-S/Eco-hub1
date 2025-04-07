// productController.js
import Product from '../models/productModel.js';

// Add new product
export const addProduct = async (req, res) => {
  const { title, price, discount, stock } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null; // Use the image URL from multer

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
