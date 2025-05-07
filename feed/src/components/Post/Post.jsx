import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import PostActions from "./PostActions";
import defaultImage from "../../assets/images/forhome.png";
import styles from "./Post.module.css";

// API base URL from environment variable
const API_URL = import.meta.env.VITE_API_URL;

// Axios instance with auth header
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add auth token to every request
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

const Post = () => {
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState({});
  const [showComments, setShowComments] = useState({});
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedCommentText, setEditedCommentText] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentPost, setCurrentPost] = useState({
    id: null,
    description: "",
    location: "",
    image: null,
    imagePreview: null,
  });
  const [showOptionsMenu, setShowOptionsMenu] = useState(null);
  const [notification, setNotification] = useState(null);
  const [modalType, setModalType] = useState("photo");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const commentInputRef = useRef(null);

  // Fetch current user info from backend
  const fetchCurrentUser = async () => {
    try {
      const response = await apiClient.get('/profile');
      setCurrentUser({
        userId: response.data.user.id,
        userName: response.data.user.name,
        profilePhoto: response.data.user.profilePhoto
      });
    } catch (err) {
      console.error("Error fetching current user:", err);
      setError("Failed to load user data");
    }
  };

  // Fetch all posts from backend
  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const [postsResponse, userResponse] = await Promise.all([
        apiClient.get('/posts'),
        apiClient.get('/profile')
      ]);

      // Set current user from profile response
      setCurrentUser({
        userId: userResponse.data.user.id,
        userName: userResponse.data.user.name,
        profilePhoto: userResponse.data.user.profilePhoto
      });

      // Transform posts data
      const transformedPosts = postsResponse.data.map(post => {
        // Initialize comments state for this post
        const postComments = post.comments || [];
        setComments(prev => ({
          ...prev,
          [post._id]: postComments.map(comment => ({
            id: comment._id,
            text: comment.text,
            userId: comment.user._id,
            userName: comment.user.name,
            isCurrentUser: comment.user._id === userResponse.data.user.id,
            createdAt: comment.createdAt
          }))
        }));

        // Initialize all posts with comments hidden
        setShowComments(prev => ({
          ...prev,
          [post._id]: false
        }));

        // Handle image URL
        let imageUrl = defaultImage;
        if (post.image) {
          imageUrl = post.image.startsWith('http') 
            ? post.image 
            : `${API_URL}/${post.image.replace(/^\/+/, '')}`;
        }

        return {
          id: post._id,
          description: post.description,
          location: post.location || "",
          imageUrl,
          userId: post.user._id,
          userName: post.user.name,
          createdAt: post.createdAt,
          likes: post.likes || [],
          likeCount: post.likes?.length || 0,
          commentCount: post.comments?.length || 0,
          isLiked: post.likes?.includes(userResponse.data.user.id) || false,
          isCurrentUser: post.user._id === userResponse.data.user.id
        };
      });

      setPosts(transformedPosts);
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError("Failed to load posts");
      setIsLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchCurrentUser();
    fetchPosts();
  }, []);

  const toggleComments = async (postId) => {
    // If comments aren't loaded yet, fetch them
    if (!comments[postId]) {
      try {
        const response = await apiClient.get(`/posts/${postId}/comments`);
        setComments(prev => ({
          ...prev,
          [postId]: response.data.map(comment => ({
            id: comment._id,
            text: comment.text,
            userId: comment.user._id,
            userName: comment.user.name,
            isCurrentUser: comment.user._id === currentUser?.userId,
            createdAt: comment.createdAt
          }))
        }));
      } catch (err) {
        console.error("Error fetching comments:", err);
        showNotification("Failed to load comments");
      }
    }
    
    setShowComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const handleLike = async (postId) => {
    try {
      await apiClient.post(`/posts/${postId}/likes`);
      
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? {
                ...post,
                isLiked: !post.isLiked,
                likeCount: post.isLiked ? post.likeCount - 1 : post.likeCount + 1,
                likes: post.isLiked
                  ? post.likes.filter(id => id !== currentUser.userId)
                  : [...post.likes, currentUser.userId]
              }
            : post
        )
      );
    } catch (err) {
      console.error("Error liking post:", err);
      showNotification("Failed to update like");
    }
  };

  const handleCommentSubmit = async (e, postId) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await apiClient.post(`/posts/${postId}/comments`, {
        text: newComment
      });

      const newCommentData = {
        id: response.data._id,
        text: newComment,
        userId: currentUser.userId,
        userName: currentUser.userName,
        isCurrentUser: true,
        createdAt: new Date().toISOString()
      };

      setComments(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), newCommentData]
      }));

      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? { ...post, commentCount: post.commentCount + 1 }
            : post
        )
      );

      setNewComment("");
      setShowComments(prev => ({ ...prev, [postId]: true }));
    } catch (err) {
      console.error("Error adding comment:", err);
      showNotification("Failed to add comment");
    }
  };

  const handleEditComment = (commentId, currentText) => {
    setEditingCommentId(commentId);
    setEditedCommentText(currentText);
  };

  const handleUpdateComment = async (postId, commentId) => {
    if (!editedCommentText.trim()) return;

    try {
      await apiClient.put(`/posts/${postId}/comments/${commentId}`, {
        text: editedCommentText
      });

      setComments(prev => ({
        ...prev,
        [postId]: prev[postId].map(comment =>
          comment.id === commentId
            ? { ...comment, text: editedCommentText }
            : comment
        )
      }));

      setEditingCommentId(null);
      showNotification("Comment updated");
    } catch (err) {
      console.error("Error updating comment:", err);
      showNotification("Failed to update comment");
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    try {
      await apiClient.delete(`/posts/${postId}/comments/${commentId}`);

      setComments(prev => ({
        ...prev,
        [postId]: prev[postId].filter(comment => comment.id !== commentId)
      }));

      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? { ...post, commentCount: post.commentCount - 1 }
            : post
        )
      );

      showNotification("Comment deleted");
    } catch (err) {
      console.error("Error deleting comment:", err);
      showNotification("Failed to delete comment");
    }
  };

  const openCreateModal = (type) => {
    setModalType(type);
    setCurrentPost({
      id: null,
      description: "",
      location: "",
      image: null,
      imagePreview: null,
    });
    setShowCreateModal(true);
  };

  const handlePostInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentPost(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentPost(prev => ({
          ...prev,
          image: file,
          imagePreview: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitPost = async (e) => {
    e.preventDefault();
    if (!currentPost.description.trim()) return;

    try {
      const formData = new FormData();
      formData.append('description', currentPost.description);
      if (currentPost.location) formData.append('location', currentPost.location);
      if (currentPost.image) formData.append('image', currentPost.image);

      const response = await axios.post(`${API_URL}/posts`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const newPost = {
        id: response.data._id,
        description: response.data.description,
        location: response.data.location || "",
        imageUrl: response.data.image 
          ? `${API_URL}/${response.data.image.replace(/^\/+/, '')}`
          : defaultImage,
        userId: currentUser.userId,
        userName: currentUser.userName,
        createdAt: new Date().toISOString(),
        likes: [],
        likeCount: 0,
        commentCount: 0,
        isLiked: false,
        isCurrentUser: true
      };

      setPosts(prev => [newPost, ...prev]);
      setComments(prev => ({ ...prev, [newPost.id]: [] }));
      setShowComments(prev => ({ ...prev, [newPost.id]: false }));
      setShowCreateModal(false);
      showNotification("Post created successfully!");
    } catch (err) {
      console.error("Error creating post:", err);
      showNotification("Failed to create post");
    }
  };

  const handleEditPost = (postId) => {
    const postToEdit = posts.find(post => post.id === postId);
    if (postToEdit) {
      setCurrentPost({
        id: postId,
        description: postToEdit.description,
        location: postToEdit.location,
        image: null,
        imagePreview: postToEdit.imageUrl,
      });
      setShowEditModal(true);
      setShowOptionsMenu(null);
    }
  };

  const handleUpdatePost = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!currentPost.description.trim()) {
      showNotification("Post description cannot be empty");
      return;
    }
  
    try {
      let response;
      const config = {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      };
  
      // Check if we're updating with a new image
      if (currentPost.image) {
        const formData = new FormData();
        formData.append('description', currentPost.description);
        if (currentPost.location) formData.append('location', currentPost.location);
        formData.append('image', currentPost.image);
        
        config.headers['Content-Type'] = 'multipart/form-data';
        
        response = await axios.put(
          `${API_URL}/posts/${currentPost.id}`,
          formData,
          config
        );
      } else {
        // No image update, just send JSON
        config.headers['Content-Type'] = 'application/json';
        
        response = await axios.put(
          `${API_URL}/posts/${currentPost.id}`,
          {
            description: currentPost.description,
            location: currentPost.location || ""
          },
          config
        );
      }
  
      // Check if response is valid
      if (!response.data) {
        throw new Error("No data returned from server");
      }
  
      // Update the posts state with the new data
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === currentPost.id
            ? {
                ...post,
                description: response.data.description || currentPost.description,
                location: response.data.location || currentPost.location || "",
                imageUrl: response.data.image 
                  ? response.data.image.startsWith('http')
                    ? response.data.image
                    : `${API_URL}/${response.data.image.replace(/^\/+/, '')}`
                  : post.imageUrl, // Keep old image if no new one was provided
                updatedAt: response.data.updatedAt || new Date().toISOString()
              }
            : post
        )
      );
  
      setShowEditModal(false);
      showNotification("Post updated successfully!");
    } catch (err) {
      console.error("Error updating post:", err);
      
      let errorMessage = "Failed to update post";
      if (err.response) {
        // Handle specific error messages from backend
        if (err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.status === 401) {
          errorMessage = "Unauthorized - Please login again";
        } else if (err.response.status === 404) {
          errorMessage = "Post not found";
        }
      }
      
      showNotification(errorMessage);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await apiClient.delete(`/posts/${postId}`);
      setPosts(prev => prev.filter(post => post.id !== postId));
      setShowOptionsMenu(null);
      showNotification("Post deleted successfully!");
    } catch (err) {
      console.error("Error deleting post:", err);
      showNotification("Failed to delete post");
    }
  };

  const toggleOptionsMenu = (postId) => {
    setShowOptionsMenu(showOptionsMenu === postId ? null : postId);
  };

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const focusCommentInput = (postId) => {
    setShowComments(prev => ({ ...prev, [postId]: true }));
    if (commentInputRef.current) {
      commentInputRef.current.focus();
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { month: "long", day: "numeric", year: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  return (
    <div className={styles.mainContainer}>
      {/* Left Sidebar */}
      <div className={styles.leftSidebar}>
        <div className={styles.sidebarContent}>
          <div className={styles.profileSection}>
            <div className={styles.sidebarAvatar}>
              {currentUser?.userName?.charAt(0) || 'U'}
            </div>
            <span className={styles.profileName}>
              {currentUser?.userName || 'User'}
            </span>
          </div>
          <nav className={styles.navMenu}>
            <button className={styles.navItem}>
              <span className={styles.navIcon}>🏠</span> Home
            </button>
            <button className={styles.navItem}>
              <span className={styles.navIcon}>👤</span> Profile
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.postsContainer}>
        {notification && (
          <div className={styles.notification}>{notification}</div>
        )}

        {isLoading ? (
          <div className={styles.loadingMessage}>Loading posts...</div>
        ) : error ? (
          <div className={styles.errorMessage}>{error}</div>
        ) : (
          <>
            <div className={styles.postCreationButtons}>
              <button
                onClick={() => openCreateModal("photo")}
                className={styles.postButton}
              >
                <span className={styles.postButtonIcon}>📷</span> Photo
              </button>
            </div>

            {showCreateModal && (
              <div className={styles.postModalOverlay}>
                <div className={styles.postModal}>
                  <h3>Create Post</h3>
                  <form onSubmit={handleSubmitPost}>
                    <textarea
                      name="description"
                      value={currentPost.description}
                      onChange={handlePostInputChange}
                      placeholder="What's on your mind?"
                      className={styles.postTextarea}
                      required
                    />
                    <input
                      type="text"
                      name="location"
                      value={currentPost.location}
                      onChange={handlePostInputChange}
                      placeholder="Add location"
                      className={styles.postInput}
                    />
                    <div className={styles.mediaUpload}>
                      <label>
                        <input
                          type="file"
                          onChange={handleImageChange}
                          accept="image/*"
                          className={styles.fileInput}
                        />
                        <span className={styles.uploadButton}>Add Photo</span>
                      </label>
                      {currentPost.imagePreview && (
                        <img
                          src={currentPost.imagePreview}
                          alt="Preview"
                          className={styles.mediaPreview}
                        />
                      )}
                    </div>
                    <div className={styles.modalButtons}>
                      <button
                        type="button"
                        onClick={() => setShowCreateModal(false)}
                        className={styles.cancelButton}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className={styles.postSubmitButton}
                        disabled={!currentPost.description.trim()}
                      >
                        Post
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {showEditModal && (
              <div className={styles.postModalOverlay}>
                <div className={styles.postModal}>
                  <h3>Edit Post</h3>
                  <form onSubmit={handleUpdatePost}>
                    <textarea
                      name="description"
                      value={currentPost.description}
                      onChange={handlePostInputChange}
                      placeholder="What's on your mind?"
                      className={styles.postTextarea}
                      required
                    />
                    <input
                      type="text"
                      name="location"
                      value={currentPost.location}
                      onChange={handlePostInputChange}
                      placeholder="Add location"
                      className={styles.postInput}
                    />
                    <div className={styles.mediaUpload}>
                      <label>
                        <input
                          type="file"
                          onChange={handleImageChange}
                          accept="image/*"
                          className={styles.fileInput}
                        />
                        <span className={styles.uploadButton}>Change Photo</span>
                      </label>
                      {currentPost.imagePreview && (
                        <img
                          src={currentPost.imagePreview}
                          alt="Preview"
                          className={styles.mediaPreview}
                        />
                      )}
                    </div>
                    <div className={styles.modalButtons}>
                      <button
                        type="button"
                        onClick={() => setShowEditModal(false)}
                        className={styles.cancelButton}
                      >
                        Cancel
                      </button>
                      <button type="submit" className={styles.postSubmitButton}>
                        Update
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {posts.map((post) => (
              <div key={post.id} className={styles.postContainer}>
                <div className={styles.postHeader}>
                  <div className={styles.headerTop}>
                    <div className={styles.userInfo}>
                      <div className={styles.userAvatar}>
                        {post.userName.charAt(0)}
                      </div>
                      <div>
                        <h3 className={styles.username}>{post.userName}</h3>
                        <p className={styles.meta}>
                          {post.location && `${post.location} • `}
                          {formatDate(post.createdAt)}
                        </p>
                      </div>
                    </div>

                    {post.isCurrentUser && (
                      <div className={styles.postOptions}>
                        <button
                          onClick={() => toggleOptionsMenu(post.id)}
                          className={styles.optionsButton}
                        >
                          ⋮
                        </button>

                        {showOptionsMenu === post.id && (
                          <div className={styles.optionsMenu}>
                            <button
                              onClick={() => handleEditPost(post.id)}
                              className={styles.menuItem}
                            >
                              Edit Post
                            </button>
                            <button
                              onClick={() => handleDeletePost(post.id)}
                              className={styles.menuItem}
                            >
                              Delete Post
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <p className={styles.description}>{post.description}</p>
                </div>

                {post.imageUrl && (
                  <div className={styles.postImage}>
                    <img
                      src={post.imageUrl}
                      alt="Post content"
                      className={styles.image}
                    />
                  </div>
                )}

                <div className={styles.stats}>
                  <span className={styles.likeCount}>
                    {post.likeCount} {post.likeCount === 1 ? "like" : "likes"}
                  </span>
                  <button 
                    className={styles.commentCount}
                    onClick={() => toggleComments(post.id)}
                  >
                    {post.commentCount} {post.commentCount === 1 ? "comment" : "comments"}
                  </button>
                </div>

                <div className={styles.postActions}>
                  <button 
                    className={`${styles.actionButton} ${post.isLiked ? styles.liked : ''}`}
                    onClick={() => handleLike(post.id)}
                  >
                    <span className={styles.actionIcon}>👍</span> Like
                  </button>
                  <button 
                    className={styles.actionButton}
                    onClick={() => focusCommentInput(post.id)}
                  >
                    <span className={styles.actionIcon}>💬</span> Comment
                  </button>
                </div>

                {showComments[post.id] && (
                  <div className={styles.commentsSection}>
                    {comments[post.id]?.map((comment) => (
                      <div key={comment.id} className={`${styles.comment} ${editingCommentId === comment.id ? styles.editing : ''}`}>
                        <div className={styles.commentContent}>
                          <span className={styles.commentUser}>{comment.userName}</span>
                          <span className={styles.commentText}>
                            {editingCommentId === comment.id ? (
                              <input
                                type="text"
                                value={editedCommentText}
                                onChange={(e) => setEditedCommentText(e.target.value)}
                                className={styles.editInput}
                              />
                            ) : (
                              comment.text
                            )}
                          </span>
                        </div>

                        {comment.isCurrentUser && (
                          <div className={styles.commentActions}>
                            {editingCommentId === comment.id ? (
                              <>
                                <button
                                  onClick={() => handleUpdateComment(post.id, comment.id)}
                                  className={styles.commentActionButton}
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingCommentId(null)}
                                  className={styles.commentActionButton}
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() =>
                                    handleEditComment(comment.id, comment.text)
                                  }
                                  className={styles.commentActionButton}
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteComment(post.id, comment.id)}
                                  className={styles.commentActionButton}
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                    
                    <form
                      onSubmit={(e) => handleCommentSubmit(e, post.id)}
                      className={styles.commentForm}
                    >
                      <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        className={styles.commentInput}
                        ref={commentInputRef}
                      />
                      <button
                        type="submit"
                        className={styles.commentButton}
                        disabled={!newComment.trim()}
                      >
                        Post
                      </button>
                    </form>
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </div>

      {/* Right Sidebar */}
      <div className={styles.rightSidebar}>
        <div className={styles.sidebarContent}>
          <div className={styles.searchContainer}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className={styles.searchInput}
            />
          </div>
          <div className={styles.trending}>
            <h3 className={styles.suggestionsTitle}>Trending Topics</h3>
            <div className={styles.trendingItem}>#Circular Economy</div>
            <div className={styles.trendingItem}>#Zero Waste</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Post;