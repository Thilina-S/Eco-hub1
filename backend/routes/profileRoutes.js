import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { getProfile, updateProfile, deleteProfile } from '../controllers/profileController.js';
import upload from '../middleware/multer.js';
import User from '../models/userModel.js';

const router = express.Router();

// Apply auth middleware to all profile routes
router.use(authMiddleware);

// GET /api/profile - Get user profile
router.get('/', getProfile);

// PUT /api/profile - Update user profile
router.put('/', updateProfile);

// POST /api/profile/photo - Upload profile photo
router.post('/photo', upload.single('profilePhoto'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: 'No file uploaded' 
      });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Update the profile photo path in the database
    user.profilePhoto = `/uploads/${req.file.filename}`;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile photo uploaded successfully',
      profilePhoto: user.profilePhoto
    });
  } catch (error) {
    console.error('Error uploading profile photo:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error uploading profile photo',
      error: error.message 
    });
  }
});

// DELETE /api/profile - Delete user account
router.delete('/', deleteProfile);

export default router;