import express from 'express';
import {
  createPost,
  getAllPosts,
  updatePost,
  deletePost,
  addComment,
  updateComment,
  deleteComment,
  toggleLike
} from '../controllers/postController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Post routes
router.post('/', authMiddleware, upload.single('image'), createPost);
router.get('/', getAllPosts);
router.put('/:id', authMiddleware, updatePost);
router.delete('/:id', authMiddleware, deletePost);

// Comment routes
router.post('/:postId/comments', authMiddleware, addComment);
router.put('/:postId/comments/:commentId', authMiddleware, updateComment); // Comment update route
router.delete('/:postId/comments/:commentId', authMiddleware, deleteComment);


// Like routes
router.post('/:postId/likes', authMiddleware, toggleLike);

export default router;
