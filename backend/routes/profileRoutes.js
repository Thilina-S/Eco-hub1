import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { getProfile, updateProfile, deleteProfile } from '../controllers/profileController.js';
import upload from '../middleware/multer.js';

const router = express.Router();

// Apply auth middleware to all profile routes
router.use(authMiddleware);

// GET /api/profile - Get user profile
router.get('/', getProfile);

// PUT /api/profile - Update user profile
router.put('/', updateProfile);

// DELETE /api/profile - Delete user account
router.delete('/', deleteProfile);

export default router;
