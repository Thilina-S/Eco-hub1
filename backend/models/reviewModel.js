import mongoose from 'mongoose';

const reviewSchema = mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // ✅ correctly placed
    name: { type: String, required: true },
    text: { type: String, required: true },
    date: { type: String, required: true },
    isCurrentUser: { type: Boolean, default: false },
    rating: { type: Number, required: true },
  },
  { timestamps: true }
);

const Review = mongoose.model('Review', reviewSchema);

export default Review;
