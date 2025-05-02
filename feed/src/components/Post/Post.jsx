import React, { useState, useEffect, useRef } from "react";
import PostActions from "./PostActions";
import defaultImage from "../../assets/images/forhome.png";
import styles from "./Post.module.css";
import "../../assets/images/forhome.png";
import axios from "axios";

// API base URL from environment variable
const API_URL = import.meta.env.VITE_API_URL;

// Get token from localStorage - you'll need to implement your authentication system
const getAuthToken = () => localStorage.getItem('token');

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
    const token = getAuthToken();
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
  const commentInputRef = useRef(null);

  // Fetch all posts on component mount
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/posts');
      
      // Transform backend data to match frontend structure
      const transformedPosts = response.data.map(post => {
        // Initialize comments state for this post
        const postComments = post.comments || [];
        setComments(prev => ({
          ...prev,
          [post._id]: postComments.map(comment => ({
            id: comment._id,
            user: comment.user.name,
            text: comment.text,
            isCurrentUser: checkIfCurrentUser(comment.user._id),
          }))
        }));

        return {
          id: post._id,
          username: post.user.name,
          location: post.location || "",
          date: new Date(post.createdAt).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          }),
          description: post.description,
          likes: post.likes || [],
          likeCount: post.likes?.length || 0,
          commentCount: post.comments?.length || 0,
          isLiked: checkIfUserLiked(post.likes),
          imageUrl: post.image ? `${API_URL}${post.image}` : defaultImage,
          isCurrentUser: checkIfCurrentUser(post.user._id),
        };
      });

      setPosts(transformedPosts);
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError("Failed to load posts. Please try again later.");
      setIsLoading(false);
    }
  };

  // Helper function to check if current user liked a post
  const checkIfUserLiked = (likes) => {
    // You'll need to implement logic to get current user ID from your auth system
    const currentUserId = getCurrentUserId();
    return likes?.includes(currentUserId) || false;
  };

  // Helper function to check if a post/comment belongs to current user
  const checkIfCurrentUser = (userId) => {
    // You'll need to implement logic to get current user ID from your auth system
    const currentUserId = getCurrentUserId();
    return userId === currentUserId;
  };

  // Placeholder function to get current user ID - replace with your auth logic
  const getCurrentUserId = () => {
    // Return the user ID from your auth context or localStorage
    return localStorage.getItem('userId') || "user_id"; // Default for testing
  };

  const handleLike = async (postId) => {
    try {
      // Toggle like/unlike on the backend
      const response = await apiClient.post(`/posts/${postId}/likes`);
      
      // Update UI
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                isLiked: !post.isLiked,
                likeCount: post.isLiked ? post.likeCount - 1 : post.likeCount + 1,
              }
            : post
        )
      );
    } catch (err) {
      console.error("Error liking/unliking post:", err);
      showNotification("Failed to update like status. Please try again.");
    }
  };

  const handleCommentSubmit = async (e, postId) => {
    e.preventDefault();
    if (newComment.trim()) {
      try {
        // Add comment on the backend
        const response = await apiClient.post(`/posts/${postId}/comments`, {
          text: newComment
        });
        
        // Get the new comment from the response
        // Assuming the backend returns the updated comments array
        const latestComment = response.data[response.data.length - 1];
        
        // Update local comments state
        const newCommentObj = {
          id: latestComment._id,
          user: "CurrentUser", // Frontend display name
          text: newComment,
          isCurrentUser: true,
        };
        
        setComments(prevComments => ({
          ...prevComments,
          [postId]: [...(prevComments[postId] || []), newCommentObj]
        }));

        // Update post comment count
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId
              ? { ...post, commentCount: post.commentCount + 1 }
              : post
          )
        );
        
        setNewComment("");
      } catch (err) {
        console.error("Error adding comment:", err);
        showNotification("Failed to add comment. Please try again.");
      }
    }
  };

  const handleEditComment = (commentId, currentText) => {
    setEditingCommentId(commentId);
    setEditedCommentText(currentText);
  };

  const handleUpdateComment = async (postId, commentId) => {
    if (editedCommentText.trim()) {
      try {
        // Update comment on the backend
        const response = await apiClient.put(`/posts/${postId}/comments/${commentId}`, {
          text: editedCommentText
        });
        
        // Update local state
        setComments(prevComments => ({
          ...prevComments,
          [postId]: prevComments[postId].map((comment) =>
            comment.id === commentId
              ? { ...comment, text: editedCommentText }
              : comment
          )
        }));
        
        setEditingCommentId(null);
      } catch (err) {
        console.error("Error updating comment:", err);
        showNotification("Failed to update comment. Please try again.");
      }
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    try {
      console.log("Deleting comment with postId:", postId, "and commentId:", commentId); // Log the IDs
      const response = await apiClient.delete(`/posts/${postId}/comments/${commentId}`);
      const updatedPost = response.data;
  
      setComments((prevComments) => ({
        ...prevComments,
        [postId]: updatedPost.comments,
      }));
  
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? { ...post, commentCount: updatedPost.comments.length }
            : post
        )
      );
    } catch (err) {
      console.error("Error deleting comment:", err);
      if (err.response) {
        console.error("Server responded with:", err.response.data);
      } else if (err.request) {
        console.error("Request was made but no response received:", err.request);
      } else {
        console.error("Error setting up the request:", err.message);
      }
      showNotification("Failed to delete comment. Please try again.");
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
    setCurrentPost((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentPost((prev) => ({
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
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('description', currentPost.description);
      
      if (currentPost.location) {
        formData.append('location', currentPost.location);
      }
      
      if (currentPost.image) {
        formData.append('image', currentPost.image);
      }

      // Custom headers for form data
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${getAuthToken()}`
        }
      };

      // Create post on the backend
      const response = await axios.post(`${API_URL}/posts`, formData, config);
      const newPost = response.data;

      // Create frontend post object
      const newPostObj = {
        id: newPost._id,
        username: "Current User", // You can get this from your auth context
        location: currentPost.location || "",
        date: new Date().toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
        description: currentPost.description,
        likes: [],
        likeCount: 0,
        commentCount: 0,
        isLiked: false,
        imageUrl: newPost.image ? `${API_URL}${newPost.image}` : defaultImage,
        isCurrentUser: true,
      };

      setPosts([newPostObj, ...posts]);
      setComments(prev => ({
        ...prev,
        [newPostObj.id]: []
      }));
      
      setShowCreateModal(false);
      showNotification("Post created successfully!");
    } catch (err) {
      console.error("Error creating post:", err);
      showNotification("Failed to create post. Please try again.");
    }
  };

  const handleEditPost = (postId) => {
    const postToEdit = posts.find((post) => post.id === postId);
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
    if (!currentPost.description.trim()) return;

    try {
      // If there's a new image, we need to use FormData
      if (currentPost.image) {
        const formData = new FormData();
        formData.append('description', currentPost.description);
        
        if (currentPost.location) {
          formData.append('location', currentPost.location);
        }
        
        formData.append('image', currentPost.image);

        // Custom headers for form data
        const config = {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${getAuthToken()}`
          }
        };

        // Update post with new image
        await axios.put(`${API_URL}/posts/${currentPost.id}`, formData, config);
      } else {
        // Just update text fields
        await apiClient.put(`/posts/${currentPost.id}`, {
          description: currentPost.description,
          location: currentPost.location || ""
        });
      }

      // Update local state
      setPosts(
        posts.map((post) =>
          post.id === currentPost.id
            ? {
                ...post,
                description: currentPost.description,
                location: currentPost.location || "",
                imageUrl: currentPost.imagePreview || post.imageUrl,
              }
            : post
        )
      );

      setShowEditModal(false);
      showNotification("Post updated successfully!");
    } catch (err) {
      console.error("Error updating post:", err);
      showNotification("Failed to update post. Please try again.");
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      // Delete post on the backend
      await apiClient.delete(`/posts/${postId}`);
      
      // Update local state
      setPosts(posts.filter((post) => post.id !== postId));
      setShowOptionsMenu(null);
      showNotification("Post deleted successfully!");
    } catch (err) {
      console.error("Error deleting post:", err);
      showNotification("Failed to delete post. Please try again.");
    }
  };

  const toggleOptionsMenu = (postId) => {
    setShowOptionsMenu(showOptionsMenu === postId ? null : postId);
  };

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const focusCommentInput = () => {
    if (commentInputRef.current) {
      commentInputRef.current.focus();
    }
  };

  return (
    <div className={styles.mainContainer}>
      {/* Left Sidebar */}
      <div className={styles.leftSidebar}>
        <div className={styles.sidebarContent}>
          <div className={styles.profileSection}>
            <div className={styles.sidebarAvatar}>CU</div>
            <span className={styles.profileName}>Current User</span>
          </div>
          <nav className={styles.navMenu}>
            <button className={styles.navItem}>
              <span className={styles.navIcon}>🏠</span> Home
            </button>
            <button className={styles.navItem}>
              <span className={styles.navIcon}>👤</span> Profile
            </button>
            <button className={styles.navItem}>
              <span className={styles.navIcon}>👥</span> Friends
            </button>
            <button className={styles.navItem}>
              <span className={styles.navIcon}>📸</span> Photos
            </button>
            <button className={styles.navItem}>
              <span className={styles.navIcon}>⚙️</span> Settings
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
              <button
                onClick={() => openCreateModal("video")}
                className={styles.postButton}
              >
                <span className={styles.postButtonIcon}>🎥</span> Video
              </button>
              <button
                onClick={() => openCreateModal("feeling")}
                className={styles.postButton}
              >
                <span className={styles.postButtonIcon}>😊</span> Feeling
              </button>
            </div>

            {showCreateModal && (
              <div className={styles.postModalOverlay}>
                <div className={styles.postModal}>
                  <h3>
                    Create{" "}
                    {modalType === "photo"
                      ? "Photo"
                      : modalType === "video"
                      ? "Video"
                      : "Feeling"}{" "}
                    Post
                  </h3>
                  <form onSubmit={handleSubmitPost}>
                    <textarea
                      name="description"
                      value={currentPost.description}
                      onChange={handlePostInputChange}
                      placeholder={`What's on your mind?`}
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
                    {modalType !== "feeling" && (
                      <div className={styles.mediaUpload}>
                        <label>
                          <input
                            type="file"
                            onChange={handleImageChange}
                            accept={modalType === "photo" ? "image/*" : "video/*"}
                            className={styles.fileInput}
                          />
                          <span className={styles.uploadButton}>
                            Add {modalType === "photo" ? "Photo" : "Video"}
                          </span>
                        </label>
                        {currentPost.imagePreview &&
                          (modalType === "photo" ? (
                            <img
                              src={currentPost.imagePreview}
                              alt="Preview"
                              className={styles.mediaPreview}
                            />
                          ) : (
                            <video controls className={styles.mediaPreview}>
                              <source
                                src={currentPost.imagePreview}
                                type="video/mp4"
                              />
                            </video>
                          ))}
                      </div>
                    )}
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
                        {post.username.charAt(0)}
                      </div>
                      <div>
                        <h3 className={styles.username}>{post.username}</h3>
                        <p className={styles.meta}>
                          {post.location} - {post.date}
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
                  <span className={styles.commentCount}>
                    {post.commentCount} {post.commentCount === 1 ? "comment" : "comments"}
                  </span>
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
                    onClick={focusCommentInput}
                  >
                    <span className={styles.actionIcon}>💬</span> Comment
                  </button>
                  <button className={styles.actionButton}>
                    <span className={styles.actionIcon}>↗️</span> Share
                  </button>
                </div>

                <div className={styles.commentsSection}>
                  {comments[post.id]?.map((comment) => (
                    <div key={comment.id} className={`${styles.comment} ${editingCommentId === comment.id ? styles.editing : ''}`}>
                      <div className={styles.commentContent}>
                        <span className={styles.commentUser}>{comment.user}</span>
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
                </div>

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
          <div className={styles.suggestions}>
            <h3 className={styles.suggestionsTitle}>Suggested Friends</h3>
            <div className={styles.suggestionItem}>
              <div className={styles.suggestionAvatar}>J</div>
              <span>John Doe</span>
              <button className={styles.addFriendButton}>Add Friend</button>
            </div>
            <div className={styles.suggestionItem}>
              <div className={styles.suggestionAvatar}>S</div>
              <span>Sarah Smith</span>
              <button className={styles.addFriendButton}>Add Friend</button>
            </div>
          </div>
          <div className={styles.trending}>
            <h3 className={styles.suggestionsTitle}>Trending Topics</h3>
            <div className={styles.trendingItem}>#Circular Economy & Zero Waste</div>
            <div className={styles.trendingItem}>#Smart Waste Technologies</div>
            <div className={styles.trendingItem}>#E-Waste Management</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Post;