import Post from '../models/Post.js';

// Delete a single post by ID (Any logged-in user can delete any post)
export const deletePostById = async (req, res) => {
  const { postId } = req.params;
  const currentUserId = req.userId;  // Access userId from the decoded token

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // No ownership check - any logged-in user can delete any post
    await Post.findByIdAndDelete(postId);
    res.status(200).json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ success: false, message: 'Failed to delete post', error: error.message });
  }
};

// Delete all posts (Any logged-in user can delete all posts)
export const deleteAllPosts = async (req, res) => {
  try {
    const posts = await Post.find();  // No filter by user email, allowing deletion of all posts
    if (posts.length === 0) {
      return res.status(404).json({ success: false, message: 'No posts found to delete' });
    }

    await Post.deleteMany({});  // Delete all posts
    res.status(200).json({ success: true, message: 'All posts deleted successfully' });
  } catch (error) {
    console.error('Error deleting posts:', error);
    res.status(500).json({ success: false, message: 'Failed to delete posts', error: error.message });
  }
};

// Delete all comments under a post (Any logged-in user can delete all comments under any post)
export const deleteAllComments = async (req, res) => {
  const { postId } = req.params;

  if (!postId) {
    return res.status(400).json({ success: false, message: 'Post ID is required' });
  }

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Remove all comments
    post.comments = [];
    await post.save();

    res.status(200).json({ success: true, message: 'All comments deleted successfully' });
  } catch (error) {
    console.error('Error deleting comments:', error);
    res.status(500).json({ success: false, message: 'Failed to delete comments', error: error.message });
  }
};

// Delete a single comment under a post (Any logged-in user can delete any comment under any post)
export const deleteCommentById = async (req, res) => {
  const { postId, commentId } = req.params;
  const currentUserId = req.userId;  // Access userId from the decoded token

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Find the comment by commentId
    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    // No ownership check - any logged-in user can delete any comment
    // Remove the comment using filter method
    post.comments = post.comments.filter(comment => comment._id.toString() !== commentId);

    // Save the post after the comment is deleted
    await post.save();

    res.status(200).json({ success: true, message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ success: false, message: 'Failed to delete comment', error: error.message });
  }
};
