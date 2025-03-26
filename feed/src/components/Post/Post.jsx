import React, { useState, useEffect, useRef } from "react";
import PostActions from "./PostActions";
import defaultImage from "../../assets/images/default-post.jpg";
import styles from "./Post.module.css";

const Post = () => {
  const [posts, setPosts] = useState([
    {
      id: 1,
      username: "Current User",
      location: "cmb",
      date: "March 25, 2025",
      description: "i dont kno",
      likes: [],
      likeCount: 0,
      commentCount: 1,
      isLiked: false,
      imageUrl: defaultImage,
      isCurrentUser: true,
    },
  ]);

  const [comments, setComments] = useState({
    1: [
      { id: 1, user: "User1", text: "Nice post!", isCurrentUser: false },
      {
        id: 2,
        user: "CurrentUser",
        text: "Beautiful place!",
        isCurrentUser: true,
      },
    ]
  });

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
  const commentInputRef = useRef(null);

  const handleLike = (postId) => {
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
  };

  const handleCommentSubmit = (e, postId) => {
    e.preventDefault();
    if (newComment.trim()) {
      const comment = {
        id: Date.now(),
        user: "CurrentUser",
        text: newComment,
        isCurrentUser: true,
      };
      
      setComments(prevComments => ({
        ...prevComments,
        [postId]: [...(prevComments[postId] || []), comment]
      }));

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? { ...post, commentCount: post.commentCount + 1 }
            : post
        )
      );
      setNewComment("");
    }
  };

  const handleEditComment = (commentId, currentText) => {
    setEditingCommentId(commentId);
    setEditedCommentText(currentText);
  };

  const handleUpdateComment = (postId, commentId) => {
    if (editedCommentText.trim()) {
      setComments(prevComments => ({
        ...prevComments,
        [postId]: prevComments[postId].map((comment) =>
          comment.id === commentId
            ? { ...comment, text: editedCommentText }
            : comment
        )
      }));
      setEditingCommentId(null);
    }
  };

  const handleDeleteComment = (postId, commentId) => {
    setComments(prevComments => ({
      ...prevComments,
      [postId]: prevComments[postId].filter((comment) => comment.id !== commentId)
    }));
    
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId && post.commentCount > 0
          ? { ...post, commentCount: post.commentCount - 1 }
          : post
      )
    );
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

  const handleSubmitPost = (e) => {
    e.preventDefault();
    if (!currentPost.description.trim()) return;

    const newPostObj = {
      id: posts.length + 1,
      username: "Current User",
      location: currentPost.location || "",
      date: new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
      description: currentPost.description,
      likes: [],
      likeCount: 0,
      commentCount: 1,
      isLiked: false,
      imageUrl: currentPost.imagePreview || defaultImage,
      isCurrentUser: true,
    };

    setPosts([newPostObj, ...posts]);
    setComments(prev => ({
      ...prev,
      [newPostObj.id]: []
    }));
    setShowCreateModal(false);
    showNotification("Post created successfully!");
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

  const handleUpdatePost = (e) => {
    e.preventDefault();
    if (!currentPost.description.trim()) return;

    setPosts(
      posts.map((post) =>
        post.id === currentPost.id
          ? {
              ...post,
              description: currentPost.description,
              location: currentPost.location,
              imageUrl: currentPost.imagePreview || post.imageUrl,
            }
          : post
      )
    );

    setShowEditModal(false);
    showNotification("Post updated successfully!");
  };

  const handleDeletePost = (postId) => {
    setPosts(posts.filter((post) => post.id !== postId));
    setShowOptionsMenu(null);
    showNotification("Post deleted successfully!");
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
            <div className={styles.trendingItem}>#SpringVibes</div>
            <div className={styles.trendingItem}>#TechNews</div>
            <div className={styles.trendingItem}>#TravelGoals</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Post;