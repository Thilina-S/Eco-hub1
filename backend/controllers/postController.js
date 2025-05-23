import Post from '../models/Post.js';
import User from '../models/userModel.js';

// Create Post
export const createPost = async (req, res) => {
  try {
    const { description, location } = req.body;
    const user = await User.findById(req.userId);

    // Ensure full image URL is formed when image is uploaded
    const imageUrl = req.file ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}` : null;

    const newPost = new Post({
      user: req.userId,
      description,
      location,
      image: imageUrl,
    });

    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create post', error: error.message });
  }
};

// Get All Posts
export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('user', 'name profilePhoto')
      .populate('comments.user', 'name profilePhoto')
      .sort('-createdAt');

    // Format image URLs to ensure the full path is included
    const formattedPosts = posts.map(post => {
      const imageUrl = post.image
        ? `${req.protocol}://${req.get('host')}/uploads/${post.image.replace(/^\/+/, '')}`
        : null;
      return { ...post.toObject(), imageUrl };  // Return the formatted post with imageUrl
    });

    res.json(formattedPosts);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch posts', error: error.message });
  }
};

// Update Post
export const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.user.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to update this post' });
    }

    post.description = req.body.description || post.description;
    post.location = req.body.location || post.location;

    if (req.file) {
      post.image = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;  // Update image path
    }

    const updatedPost = await post.save();
    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update post', error: error.message });
  }
};

// Delete Post
// Delete Post
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.user.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    // Use deleteOne or findByIdAndDelete
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete post', error: error.message });
  }
};


// Add Comment
export const addComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const newComment = {
      user: req.userId,
      text: req.body.text
    };

    post.comments.push(newComment);
    await post.save();

    const populatedPost = await Post.findById(post._id)
      .populate('comments.user', 'name profilePhoto');

    res.json(populatedPost.comments);
  } catch (error) {
    res.status(500).json({ message: 'Failed to add comment', error: error.message });
  }
};

// Update Comment
export const updateComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    if (comment.user.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to update this comment' });
    }

    comment.text = req.body.text || comment.text;
    await post.save();

    const populatedPost = await Post.findById(post._id)
      .populate('comments.user', 'name profilePhoto');

    res.json(populatedPost.comments);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update comment', error: error.message });
  }
};

// Delete Comment
export const deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    if (comment.user.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    post.comments.pull(commentId);
    await post.save();

    res.json(post); // Return updated post data
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete comment', error: error.message });
  }
};

// Like/Unlike Post
export const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const userId = req.userId;
    const index = post.likes.indexOf(userId);

    if (index === -1) {
      post.likes.push(userId);
    } else {
      post.likes.splice(index, 1);
    }

    await post.save();
    res.json(post.likes);
  } catch (error) {
    res.status(500).json({ message: 'Failed to toggle like', error: error.message });
  }
};
