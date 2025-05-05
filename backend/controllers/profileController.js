import User from '../models/userModel.js';
import bcrypt from 'bcrypt';

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePhoto: user.profilePhoto ? `${baseUrl}${user.profilePhoto}` : null,
        joinDate: user.createdAt
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    const { name, email, password } = req.body;

    if (name) user.name = name;
    if (email) {
      const existing = await User.findOne({ email });
      if (existing && existing._id.toString() !== req.userId) {
        return res.status(400).json({ 
          success: false,
          message: 'Email already in use' 
        });
      }
      user.email = email;
    }
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ 
          success: false,
          message: 'Password must be at least 6 characters' 
        });
      }
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePhoto: user.profilePhoto ? `${baseUrl}${user.profilePhoto}` : null,
        joinDate: user.createdAt
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update profile',
      error: error.message 
    });
  }
};

export const deleteProfile = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    res.status(200).json({ 
      success: true,
      message: 'Account deleted successfully' 
    });
  } catch (error) {
    console.error('Delete profile error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete account',
      error: error.message 
    });
  }
};