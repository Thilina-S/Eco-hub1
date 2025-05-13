import Notice from '../models/noticeModel.js';  // Use import instead of require

// Get all notices
export const getNotices = async (req, res) => {
  try {
    const notices = await Notice.find();
    res.json(notices);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

// Create a new notice
export const createNotice = async (req, res) => {
  const { title, content, status } = req.body;
  try {
    const newNotice = new Notice({
      title,
      content,
      status,
      date: new Date().toISOString().split('T')[0],
    });
    await newNotice.save();
    res.status(201).json({ message: 'Notice created successfully!', notice: newNotice });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

// Update a notice
export const updateNotice = async (req, res) => {
  const { id } = req.params;  // Ensure 'id' is being passed correctly
  const { title, content, status } = req.body;
  try {
    const notice = await Notice.findByIdAndUpdate(
      id,
      { title, content, status },
      { new: true }
    );
    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }
    res.json({ message: 'Notice updated successfully!', notice });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

// Delete a notice
export const deleteNotice = async (req, res) => {
  const { id } = req.params;
  try {
    const notice = await Notice.findByIdAndDelete(id);
    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }
    res.json({ message: 'Notice deleted successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};
