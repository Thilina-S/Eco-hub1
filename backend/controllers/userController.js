import User from '../models/userModel.js';

// GET all users (Admin only)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, '_id name email'); // Only return id, name, email
    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve users', error: error.message });
  }
};

// DELETE a user by ID (Admin only)
export const deleteUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete user', error: error.message });
  }
};
