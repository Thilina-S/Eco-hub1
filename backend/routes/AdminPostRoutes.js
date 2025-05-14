import express from 'express';
import { deletePostById, deleteAllPosts, deleteAllComments, deleteCommentById } from '../controllers/AdminPostController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Route to delete a single post
router.delete('/posts/:postId', authMiddleware, deletePostById);

// Route to delete all posts
router.delete('/posts', authMiddleware, deleteAllPosts);

// Route to delete all comments under a post
router.delete('/posts/:postId/comments', authMiddleware, deleteAllComments);

// Route to delete a single comment under a post
router.delete('/posts/:postId/comments/:commentId', authMiddleware, deleteCommentById);

export default router;
