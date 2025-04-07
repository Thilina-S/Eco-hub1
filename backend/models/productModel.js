import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  price: { type: Number, required: true },
  discount: { type: Number, required: true },
  imageUrl: { type: String, required: false }, // Store image URL here
  stock: { type: Number, required: true },
});

const Product = mongoose.model('Product', productSchema);

export default Product;
