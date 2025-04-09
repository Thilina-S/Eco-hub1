// models/reviewModel.js
import mongoose from 'mongoose';

const reviewSchema = mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    text: { type: String, required: true },
    date: { type: String, required: true },
    isCurrentUser: { type: Boolean, default: false },
    rating: { type: Number, required: true },  // Assuming reviews have a rating system
  },
  { timestamps: true }
);

const Review = mongoose.model('Review', reviewSchema);

export default Review;
