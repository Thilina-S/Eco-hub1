"use client"

import { useState, useEffect, useRef } from "react"
import axios from "axios"
import { Link } from "react-router-dom"
import {
  FiHeart,
  FiMessageSquare,
  FiShare2,
  FiMoreVertical,
  FiMapPin,
  FiCamera,
  FiX,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiSend,
  FiLink,
  FiCopy,
  FiFacebook,
  FiTwitter,
  FiMail,
  FiCheck,
} from "react-icons/fi"
import { FaHeart, FaHome, FaUser, FaWhatsapp } from "react-icons/fa"

// API base URL from environment variable
const API_URL = import.meta.env.VITE_API_URL

// Axios instance with auth header
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Add auth token to every request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

const Post = () => {
  const [posts, setPosts] = useState([])
  const [comments, setComments] = useState({})
  const [showComments, setShowComments] = useState({})
  const [newComment, setNewComment] = useState("")
  const [editingCommentId, setEditingCommentId] = useState(null)
  const [editedCommentText, setEditedCommentText] = useState("")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [currentPost, setCurrentPost] = useState({
    id: null,
    description: "",
    location: "",
    image: null,
    imagePreview: null,
  })
  const [sharePost, setSharePost] = useState(null)
  const [copied, setCopied] = useState(false)
  const [showOptionsMenu, setShowOptionsMenu] = useState(null)
  const [notification, setNotification] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const commentInputRefs = useRef({})
  const defaultImage = "/placeholder.jpg"

  // Fetch current user info from backend
  const fetchCurrentUser = async () => {
    try {
      const response = await apiClient.get("/profile")
      setCurrentUser({
        userId: response.data.user.id,
        userName: response.data.user.name,
        profilePhoto: response.data.user.profilePhoto,
      })
    } catch (err) {
      console.error("Error fetching current user:", err)
      setError("Failed to load user data")
    }
  }

  // Fetch all posts from backend
  const fetchPosts = async () => {
    setIsLoading(true)
    try {
      const [postsResponse, userResponse] = await Promise.all([apiClient.get("/posts"), apiClient.get("/profile")])

      // Set current user from profile response
      setCurrentUser({
        userId: userResponse.data.user.id,
        userName: userResponse.data.user.name,
        profilePhoto: userResponse.data.user.profilePhoto,
      })

      // Transform posts data
      const transformedPosts = postsResponse.data.map((post) => {
        // Initialize comments state for this post
        const postComments = post.comments || []
        setComments((prev) => ({
          ...prev,
          [post._id]: postComments.map((comment) => ({
            id: comment._id,
            text: comment.text,
            userId: comment.user._id,
            userName: comment.user.name,
            isCurrentUser: comment.user._id === userResponse.data.user.id,
            createdAt: comment.createdAt,
          })),
        }))

        // Initialize all posts with comments hidden
        setShowComments((prev) => ({
          ...prev,
          [post._id]: false,
        }))

        // Handle image URL - ensure consistent formatting
        let imageUrl = defaultImage
        if (post.image) {
          imageUrl = post.image.startsWith("http") ? post.image : `${API_URL}/${post.image.replace(/^\/+/, "")}`
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
          isCurrentUser: post.user._id === userResponse.data.user.id,
        }
      })

      setPosts(transformedPosts)
      setIsLoading(false)
    } catch (err) {
      console.error("Error fetching posts:", err)
      setError("Failed to load posts")
      setIsLoading(false)
    }
  }

  // Fetch data on component mount
  useEffect(() => {
    fetchCurrentUser()
    fetchPosts()
  }, [])

  const toggleComments = async (postId) => {
    // If comments aren't loaded yet, fetch them
    if (!comments[postId]) {
      try {
        const response = await apiClient.get(`/posts/${postId}/comments`)
        setComments((prev) => ({
          ...prev,
          [postId]: response.data.map((comment) => ({
            id: comment._id, // Make sure this is the correct property name
            text: comment.text,
            userId: comment.user._id,
            userName: comment.user.name,
            isCurrentUser: comment.user._id === currentUser?.userId,
            createdAt: comment.createdAt,
          })),
        }))
      } catch (err) {
        console.error("Error fetching comments:", err)
        showNotification("Failed to load comments")
      }
    }

    setShowComments((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }))
  }

  const handleLike = async (postId) => {
    try {
      await apiClient.post(`/posts/${postId}/likes`)

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                isLiked: !post.isLiked,
                likeCount: post.isLiked ? post.likeCount - 1 : post.likeCount + 1,
                likes: post.isLiked
                  ? post.likes.filter((id) => id !== currentUser.userId)
                  : [...post.likes, currentUser.userId],
              }
            : post,
        ),
      )
    } catch (err) {
      console.error("Error liking post:", err)
      showNotification("Failed to update like")
    }
  }

  const handleCommentSubmit = async (e, postId) => {
    e.preventDefault()
    if (!newComment.trim()) return

    try {
      console.log("Submitting comment for post:", postId)
      console.log("Comment text:", newComment)

      const response = await apiClient.post(`/posts/${postId}/comments`, {
        text: newComment,
      })

      console.log("Comment submission response:", response.data)

      // Check if the response contains the expected data
      if (!response.data || !response.data._id) {
        console.error("Invalid response from server:", response)
        throw new Error("Invalid response from server")
      }

      const newCommentData = {
        id: response.data._id,
        text: newComment,
        userId: currentUser.userId,
        userName: currentUser.userName,
        isCurrentUser: true,
        createdAt: new Date().toISOString(),
      }

      console.log("Adding new comment to state:", newCommentData)

      // Update comments state with the new comment
      setComments((prev) => {
        const updatedComments = { ...prev }
        if (!updatedComments[postId]) {
          updatedComments[postId] = []
        }
        updatedComments[postId] = [...updatedComments[postId], newCommentData]
        return updatedComments
      })

      // Update post comment count
      setPosts((prevPosts) =>
        prevPosts.map((post) => (post.id === postId ? { ...post, commentCount: post.commentCount + 1 } : post)),
      )

      // Clear the input field
      setNewComment("")

      // Make sure comments are visible
      setShowComments((prev) => ({ ...prev, [postId]: true }))

      showNotification("Comment added successfully")
    } catch (err) {
      console.error("Error adding comment:", err)

      // Check if the comment was actually added despite the error
      // This is a fallback in case the API returns an error but the comment was actually added
      setTimeout(() => {
        apiClient
          .get(`/posts/${postId}/comments`)
          .then((response) => {
            if (response.data && Array.isArray(response.data)) {
              // Update the comments with the latest from the server
              setComments((prev) => ({
                ...prev,
                [postId]: response.data.map((comment) => ({
                  id: comment._id,
                  text: comment.text,
                  userId: comment.user._id,
                  userName: comment.user.name,
                  isCurrentUser: comment.user._id === currentUser?.userId,
                  createdAt: comment.createdAt,
                })),
              }))

              // Update the comment count
              setPosts((prevPosts) =>
                prevPosts.map((post) => (post.id === postId ? { ...post, commentCount: response.data.length } : post)),
              )

              // Clear the input field
              setNewComment("")
            }
          })
          .catch((fetchErr) => console.error("Error fetching comments after failed add:", fetchErr))
      }, 1000)

      showNotification("Comment may have been added. Refreshing comments...")
    }
  }

  const handleEditComment = (commentId, currentText) => {
    console.log("Setting editing comment ID:", commentId)
    setEditingCommentId(commentId)
    setEditedCommentText(currentText)
  }

  const handleUpdateComment = async (postId, commentId) => {
    if (!editedCommentText.trim()) return

    console.log("Updating comment:", postId, commentId) // Debug log

    try {
      // Make sure we have valid IDs
      if (!postId || !commentId) {
        throw new Error("Invalid post ID or comment ID")
      }

      const response = await apiClient.put(`/posts/${postId}/comments/${commentId}`, {
        text: editedCommentText,
      })

      // Check if the response is valid
      if (!response.data) {
        throw new Error("Invalid response from server")
      }

      // Update the comment in the state
      setComments((prev) => {
        // Make sure we have the comments for this post
        if (!prev[postId]) {
          return prev
        }

        return {
          ...prev,
          [postId]: prev[postId].map((comment) =>
            comment.id === commentId ? { ...comment, text: editedCommentText } : comment,
          ),
        }
      })

      setEditingCommentId(null)
      showNotification("Comment updated successfully")
    } catch (err) {
      console.error("Error updating comment:", err, "PostID:", postId, "CommentID:", commentId)
      showNotification("Failed to update comment")
    }
  }

  const handleDeleteComment = async (postId, commentId) => {
    console.log("Deleting comment:", postId, commentId) // Debug log

    try {
      // Make sure we have valid IDs
      if (!postId || !commentId) {
        throw new Error("Invalid post ID or comment ID")
      }

      await apiClient.delete(`/posts/${postId}/comments/${commentId}`)

      // Remove the comment from the state
      setComments((prev) => {
        // Make sure we have the comments for this post
        if (!prev[postId]) {
          return prev
        }

        return {
          ...prev,
          [postId]: prev[postId].filter((comment) => comment.id !== commentId),
        }
      })

      // Update the comment count for the post
      setPosts((prevPosts) =>
        prevPosts.map((post) => (post.id === postId ? { ...post, commentCount: post.commentCount - 1 } : post)),
      )

      showNotification("Comment deleted successfully")
    } catch (err) {
      console.error("Error deleting comment:", err, "PostID:", postId, "CommentID:", commentId)
      showNotification("Failed to delete comment")
    }
  }

  const openCreateModal = () => {
    setCurrentPost({
      id: null,
      description: "",
      location: "",
      image: null,
      imagePreview: null,
    })
    setShowCreateModal(true)
  }

  const handlePostInputChange = (e) => {
    const { name, value } = e.target
    setCurrentPost((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setCurrentPost((prev) => ({
          ...prev,
          image: file,
          imagePreview: reader.result,
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmitPost = async (e) => {
    e.preventDefault()
    if (!currentPost.description.trim()) return

    try {
      const formData = new FormData()
      formData.append("description", currentPost.description)
      if (currentPost.location) formData.append("location", currentPost.location)
      if (currentPost.image) formData.append("image", currentPost.image)

      const response = await axios.post(`${API_URL}/posts`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      // Properly format the image URL to ensure it's displayed immediately
      let imageUrl = defaultImage
      if (response.data.image) {
        imageUrl = response.data.image.startsWith("http")
          ? response.data.image
          : `${API_URL}/${response.data.image.replace(/^\/+/, "")}`
      }

      const newPost = {
        id: response.data._id,
        description: response.data.description,
        location: response.data.location || "",
        imageUrl: imageUrl, // Use the properly formatted imageUrl
        userId: currentUser.userId,
        userName: currentUser.userName,
        createdAt: new Date().toISOString(),
        likes: [],
        likeCount: 0,
        commentCount: 0,
        isLiked: false,
        isCurrentUser: true,
      }

      // Add the new post to the state
      setPosts((prev) => [newPost, ...prev])
      setComments((prev) => ({ ...prev, [newPost.id]: [] }))
      setShowComments((prev) => ({ ...prev, [newPost.id]: false }))
      setShowCreateModal(false)
      showNotification("Post created successfully!")
    } catch (err) {
      console.error("Error creating post:", err)
      showNotification("Failed to create post")
    }
  }

  const handleEditPost = (postId) => {
    const postToEdit = posts.find((post) => post.id === postId)
    if (postToEdit) {
      setCurrentPost({
        id: postId,
        description: postToEdit.description,
        location: postToEdit.location,
        image: null,
        imagePreview: postToEdit.imageUrl,
      })
      setShowEditModal(true)
      setShowOptionsMenu(null)
    }
  }

  const handleUpdatePost = async (e) => {
    e.preventDefault()

    // Validate required fields
    if (!currentPost.description.trim()) {
      showNotification("Post description cannot be empty")
      return
    }

    try {
      let response
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }

      // Check if we're updating with a new image
      if (currentPost.image) {
        const formData = new FormData()
        formData.append("description", currentPost.description)
        if (currentPost.location) formData.append("location", currentPost.location)
        formData.append("image", currentPost.image)

        config.headers["Content-Type"] = "multipart/form-data"

        response = await axios.put(`${API_URL}/posts/${currentPost.id}`, formData, config)
      } else {
        // No image update, just send JSON
        config.headers["Content-Type"] = "application/json"

        response = await axios.put(
          `${API_URL}/posts/${currentPost.id}`,
          {
            description: currentPost.description,
            location: currentPost.location || "",
          },
          config,
        )
      }

      // Check if response is valid
      if (!response.data) {
        throw new Error("No data returned from server")
      }

      // Update the posts state with the new data
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === currentPost.id
            ? {
                ...post,
                description: response.data.description || currentPost.description,
                location: response.data.location || currentPost.location || "",
                imageUrl: response.data.image
                  ? response.data.image.startsWith("http")
                    ? response.data.image
                    : `${API_URL}/${response.data.image.replace(/^\/+/, "")}`
                  : post.imageUrl, // Keep old image if no new one was provided
                updatedAt: response.data.updatedAt || new Date().toISOString(),
              }
            : post,
        ),
      )

      setShowEditModal(false)
      showNotification("Post updated successfully!")
    } catch (err) {
      console.error("Error updating post:", err)

      let errorMessage = "Failed to update post"
      if (err.response) {
        // Handle specific error messages from backend
        if (err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message
        } else if (err.response.status === 401) {
          errorMessage = "Unauthorized - Please login again"
        } else if (err.response.status === 404) {
          errorMessage = "Post not found"
        }
      }

      showNotification(errorMessage)
    }
  }

  const handleDeletePost = async (postId) => {
    try {
      await apiClient.delete(`/posts/${postId}`)
      setPosts((prev) => prev.filter((post) => post.id !== postId))
      setShowOptionsMenu(null)
      showNotification("Post deleted successfully!")
    } catch (err) {
      console.error("Error deleting post:", err)
      showNotification("Failed to delete post")
    }
  }

  const toggleOptionsMenu = (postId) => {
    setShowOptionsMenu(showOptionsMenu === postId ? null : postId)
  }

  const showNotification = (message) => {
    setNotification(message)
    setTimeout(() => setNotification(null), 3000)
  }

  const focusCommentInput = (postId) => {
    setShowComments((prev) => ({ ...prev, [postId]: true }))

    // Use setTimeout to ensure the comment section is rendered before focusing
    setTimeout(() => {
      if (commentInputRefs.current[postId]) {
        commentInputRefs.current[postId].focus()
      }
    }, 100)
  }

  // Format date for display
  const formatDate = (dateString) => {
    const options = { month: "long", day: "numeric", year: "numeric" }
    return new Date(dateString).toLocaleDateString("en-US", options)
  }

  // Share post functionality
  const openShareModal = (post) => {
    setSharePost(post)
    setShowShareModal(true)
    setCopied(false)
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      },
      (err) => {
        console.error("Could not copy text: ", err)
        showNotification("Failed to copy to clipboard")
      },
    )
  }

  const shareViaFacebook = (post) => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      `${window.location.origin}/post/${post.id}`,
    )}`
    window.open(url, "_blank")
  }

  const shareViaTwitter = (post) => {
    const text = `Check out this post about waste management: ${post.description.substring(0, 100)}...`
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      text,
    )}&url=${encodeURIComponent(`${window.location.origin}/post/${post.id}`)}`
    window.open(url, "_blank")
  }

  const shareViaWhatsApp = (post) => {
    const text = `Check out this post about waste management: ${post.description.substring(0, 100)}...`
    const url = `https://wa.me/?text=${encodeURIComponent(`${text} ${window.location.origin}/post/${post.id}`)}`
    window.open(url, "_blank")
  }

  const shareViaEmail = (post) => {
    const subject = "Check out this post about waste management"
    const body = `I thought you might be interested in this post:\n\n${post.description}\n\nView it here: ${window.location.origin}/post/${post.id}`
    const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.location.href = url
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Left Sidebar */}
      <div className="hidden lg:block w-64 bg-white rounded-lg shadow-sm p-4 h-fit sticky top-20">
        <div className="flex flex-col">
          <div className="flex items-center space-x-3 mb-6 pb-6 border-b border-gray-100">
            <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center text-white text-xl font-semibold">
              {currentUser?.userName?.charAt(0) || "U"}
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{currentUser?.userName || "User"}</h3>
              <p className="text-sm text-gray-500">Eco Enthusiast</p>
            </div>
          </div>

          <nav className="space-y-1">
            <Link to="/" className="flex items-center px-3 py-2 text-green-600 bg-green-50 rounded-md font-medium">
              <FaHome className="w-5 h-5 mr-3" />
              Home
            </Link>
            <Link to="/profile" className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md">
              <FaUser className="w-5 h-5 mr-3" />
              Profile
            </Link>
            <Link to="/marketplace" className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md">
              <svg
                className="w-5 h-5 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                ></path>
              </svg>
              Marketplace
            </Link>
            <Link to="/myitems" className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md">
              <svg
                className="w-5 h-5 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                ></path>
              </svg>
              My Items
            </Link>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-3xl mx-auto w-full">
        {notification && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-green-600 text-white px-4 py-2 rounded-md shadow-lg">
            {notification}
          </div>
        )}

        {/* Create Post Card */}
        <div className="bg-white rounded-lg shadow-sm mb-6 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-semibold">
              {currentUser?.userName?.charAt(0) || "U"}
            </div>
            <button
              onClick={openCreateModal}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-500 text-left px-4 py-2 rounded-full"
            >
              What's on your mind about waste management?
            </button>
          </div>
          <div className="flex mt-3 pt-3 border-t border-gray-100">
            <button
              onClick={openCreateModal}
              className="flex-1 flex items-center justify-center py-1 text-gray-700 hover:bg-gray-50 rounded-md"
            >
              <FiCamera className="w-5 h-5 mr-2 text-green-600" />
              <span>Photo</span>
            </button>
            <button
              onClick={openCreateModal}
              className="flex-1 flex items-center justify-center py-1 text-gray-700 hover:bg-gray-50 rounded-md"
            >
              <FiMapPin className="w-5 h-5 mr-2 text-green-600" />
              <span>Location</span>
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-md">{error}</div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <div key={post.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-semibold">
                        {post.userName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{post.userName}</h3>
                        <div className="flex items-center text-xs text-gray-500">
                          {post.location && (
                            <>
                              <FiMapPin className="w-3 h-3 mr-1" />
                              <span className="mr-2">{post.location}</span>
                              <span className="mx-1">•</span>
                            </>
                          )}
                          <span>{formatDate(post.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    {post.isCurrentUser && (
                      <div className="relative">
                        <button
                          onClick={() => toggleOptionsMenu(post.id)}
                          className="p-1 rounded-full hover:bg-gray-100"
                        >
                          <FiMoreVertical className="w-5 h-5 text-gray-500" />
                        </button>

                        {showOptionsMenu === post.id && (
                          <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10">
                            <button
                              onClick={() => handleEditPost(post.id)}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Edit Post
                            </button>
                            <button
                              onClick={() => handleDeletePost(post.id)}
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                            >
                              Delete Post
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <p className="mt-3 text-gray-800">{post.description}</p>
                </div>

                {post.imageUrl && (
                  <div className="w-full h-96 bg-gray-100">
                    <img
                      src={post.imageUrl || "/placeholder.svg"}
                      alt="Post content"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="px-4 py-2 flex items-center justify-between text-sm text-gray-500 border-t border-b border-gray-100">
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-5 h-5 rounded-full bg-green-600 text-white mr-1">
                      <FaHeart className="w-3 h-3" />
                    </div>
                    <span>{post.likeCount}</span>
                  </div>
                  <button onClick={() => toggleComments(post.id)} className="hover:underline">
                    {post.commentCount} {post.commentCount === 1 ? "comment" : "comments"}
                  </button>
                </div>

                <div className="px-4 py-2 flex border-b border-gray-100">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`flex-1 flex items-center justify-center py-1 rounded-md ${
                      post.isLiked ? "text-green-600" : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {post.isLiked ? (
                      <FaHeart className="w-5 h-5 mr-2 text-green-600" />
                    ) : (
                      <FiHeart className="w-5 h-5 mr-2" />
                    )}
                    Like
                  </button>
                  <button
                    onClick={() => focusCommentInput(post.id)}
                    className="flex-1 flex items-center justify-center py-1 text-gray-700 hover:bg-gray-50 rounded-md"
                  >
                    <FiMessageSquare className="w-5 h-5 mr-2" />
                    Comment
                  </button>
                  <button
                    onClick={() => openShareModal(post)}
                    className="flex-1 flex items-center justify-center py-1 text-gray-700 hover:bg-gray-50 rounded-md"
                  >
                    <FiShare2 className="w-5 h-5 mr-2" />
                    Share
                  </button>
                </div>

                {showComments[post.id] && (
                  <div className="p-4 bg-gray-50">
                    <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                      {comments[post.id]?.map((comment) => (
                        <div
                          key={comment.id}
                          className={`flex ${editingCommentId === comment.id ? "bg-green-50 p-2 rounded-md" : ""}`}
                        >
                          <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white text-xs font-semibold mr-2 flex-shrink-0">
                            {comment.userName.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <div className="bg-white rounded-lg p-2 shadow-sm">
                              <div className="flex justify-between items-start">
                                <span className="font-medium text-sm text-gray-900">{comment.userName}</span>
                                {comment.isCurrentUser && editingCommentId !== comment.id && (
                                  <div className="flex space-x-1">
                                    <button
                                      onClick={() => {
                                        console.log("Edit comment clicked:", comment.id) // Add this for debugging
                                        handleEditComment(comment.id, comment.text)
                                      }}
                                      className="text-gray-400 hover:text-gray-600"
                                    >
                                      <FiEdit2 className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={() => {
                                        console.log("Delete comment clicked:", post.id, comment.id) // Add this for debugging
                                        handleDeleteComment(post.id, comment.id)
                                      }}
                                      className="text-gray-400 hover:text-red-500"
                                    >
                                      <FiTrash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                )}
                              </div>

                              {editingCommentId === comment.id ? (
                                <div className="mt-1 flex space-x-2">
                                  <input
                                    type="text"
                                    value={editedCommentText}
                                    onChange={(e) => setEditedCommentText(e.target.value)}
                                    className="flex-1 border border-gray-300 rounded-md px-2 py-1 text-sm"
                                  />
                                  <button
                                    onClick={() => {
                                      console.log("Save comment clicked:", post.id, comment.id) // Add this for debugging
                                      handleUpdateComment(post.id, comment.id)
                                    }}
                                    className="px-2 py-1 bg-green-600 text-white text-xs rounded-md"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setEditingCommentId(null)}
                                    className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-md"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <p className="text-sm text-gray-700">{comment.text}</p>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1 ml-2">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <form onSubmit={(e) => handleCommentSubmit(e, post.id)} className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                        {currentUser?.userName?.charAt(0) || "U"}
                      </div>
                      <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write a comment..."
                        className="flex-1 bg-white border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        ref={(el) => (commentInputRefs.current[post.id] = el)}
                      />
                      <button
                        type="submit"
                        className="bg-green-600 text-white rounded-full p-2 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                        disabled={!newComment.trim()}
                      >
                        <FiSend className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Sidebar */}
      <div className="hidden xl:block w-72 bg-white rounded-lg shadow-sm p-4 h-fit sticky top-20">
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Trending Topics</h3>
          <div className="space-y-2">
            <div className="flex items-center px-3 py-2 bg-green-50 rounded-md text-green-700 hover:bg-green-100 cursor-pointer">
              <span className="text-sm font-medium">#CircularEconomy</span>
            </div>
            <div className="flex items-center px-3 py-2 bg-green-50 rounded-md text-green-700 hover:bg-green-100 cursor-pointer">
              <span className="text-sm font-medium">#ZeroWaste</span>
            </div>
            <div className="flex items-center px-3 py-2 bg-green-50 rounded-md text-green-700 hover:bg-green-100 cursor-pointer">
              <span className="text-sm font-medium">#Recycling</span>
            </div>
            <div className="flex items-center px-3 py-2 bg-green-50 rounded-md text-green-700 hover:bg-green-100 cursor-pointer">
              <span className="text-sm font-medium">#Sustainability</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Eco Tips</h3>
          <div className="space-y-3">
            <div className="p-3 bg-green-50 rounded-md">
              <p className="text-sm text-green-800">Separate your waste properly to maximize recycling efficiency.</p>
            </div>
            <div className="p-3 bg-green-50 rounded-md">
              <p className="text-sm text-green-800">Composting food scraps can reduce landfill waste by up to 30%.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Create Post</h3>
                <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-500">
                  <FiX className="h-6 w-6" />
                </button>
              </div>
              <form onSubmit={handleSubmitPost}>
                <div className="px-6 py-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-semibold">
                      {currentUser?.userName?.charAt(0) || "U"}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{currentUser?.userName || "User"}</h4>
                      <div className="flex items-center text-xs text-gray-500">
                        <FiMapPin className="w-3 h-3 mr-1" />
                        <input
                          type="text"
                          name="location"
                          value={currentPost.location}
                          onChange={handlePostInputChange}
                          placeholder="Add location"
                          className="bg-transparent border-none p-0 text-xs text-gray-500 focus:ring-0 w-full"
                        />
                      </div>
                    </div>
                  </div>
                  <textarea
                    name="description"
                    value={currentPost.description}
                    onChange={handlePostInputChange}
                    placeholder="What's on your mind about waste management?"
                    className="w-full border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 min-h-[120px]"
                    required
                  ></textarea>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Add Photo</label>
                    <div className="flex items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        {currentPost.imagePreview ? (
                          <div className="relative">
                            <img
                              src={currentPost.imagePreview || "/placeholder.svg"}
                              alt="Preview"
                              className="mx-auto h-32 object-cover rounded-md"
                            />
                            <button
                              type="button"
                              onClick={() => setCurrentPost((prev) => ({ ...prev, image: null, imagePreview: null }))}
                              className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full p-1"
                            >
                              <FiX className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <svg
                              className="mx-auto h-12 w-12 text-gray-400"
                              stroke="currentColor"
                              fill="none"
                              viewBox="0 0 48 48"
                              aria-hidden="true"
                            >
                              <path
                                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            <div className="flex text-sm text-gray-600">
                              <label
                                htmlFor="file-upload"
                                className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500"
                              >
                                <span>Upload a file</span>
                                <input
                                  id="file-upload"
                                  name="file-upload"
                                  type="file"
                                  className="sr-only"
                                  onChange={handleImageChange}
                                  accept="image/*"
                                />
                              </label>
                              <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-4 bg-gray-50 text-right">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 mr-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    disabled={!currentPost.description.trim()}
                  >
                    Post
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Post Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Edit Post</h3>
                <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-500">
                  <FiX className="h-6 w-6" />
                </button>
              </div>
              <form onSubmit={handleUpdatePost}>
                <div className="px-6 py-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-semibold">
                      {currentUser?.userName?.charAt(0) || "U"}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{currentUser?.userName || "User"}</h4>
                      <div className="flex items-center text-xs text-gray-500">
                        <FiMapPin className="w-3 h-3 mr-1" />
                        <input
                          type="text"
                          name="location"
                          value={currentPost.location}
                          onChange={handlePostInputChange}
                          placeholder="Add location"
                          className="bg-transparent border-none p-0 text-xs text-gray-500 focus:ring-0 w-full"
                        />
                      </div>
                    </div>
                  </div>
                  <textarea
                    name="description"
                    value={currentPost.description}
                    onChange={handlePostInputChange}
                    placeholder="What's on your mind about waste management?"
                    className="w-full border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 min-h-[120px]"
                    required
                  ></textarea>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Change Photo</label>
                    <div className="flex items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        {currentPost.imagePreview ? (
                          <div className="relative">
                            <img
                              src={currentPost.imagePreview || "/placeholder.svg"}
                              alt="Preview"
                              className="mx-auto h-32 object-cover rounded-md"
                            />
                            <button
                              type="button"
                              onClick={() => setCurrentPost((prev) => ({ ...prev, image: null, imagePreview: null }))}
                              className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full p-1"
                            >
                              <FiX className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <svg
                              className="mx-auto h-12 w-12 text-gray-400"
                              stroke="currentColor"
                              fill="none"
                              viewBox="0 0 48 48"
                              aria-hidden="true"
                            >
                              <path
                                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            <div className="flex text-sm text-gray-600">
                              <label
                                htmlFor="file-upload-edit"
                                className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500"
                              >
                                <span>Upload a file</span>
                                <input
                                  id="file-upload-edit"
                                  name="file-upload-edit"
                                  type="file"
                                  className="sr-only"
                                  onChange={handleImageChange}
                                  accept="image/*"
                                />
                              </label>
                              <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-4 bg-gray-50 text-right">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 mr-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Share Post Modal */}
      {showShareModal && sharePost && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Share Post</h3>
                <button onClick={() => setShowShareModal(false)} className="text-gray-400 hover:text-gray-500">
                  <FiX className="h-6 w-6" />
                </button>
              </div>
              <div className="px-6 py-4">
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-2">Share this post with your friends</p>
                  <div className="flex items-center space-x-2 bg-gray-100 p-2 rounded-md">
                    <FiLink className="text-gray-500" />
                    <input
                      type="text"
                      value={`${window.location.origin}/post/${sharePost.id}`}
                      readOnly
                      className="flex-1 bg-transparent border-none focus:ring-0 text-sm"
                    />
                    <button
                      onClick={() => copyToClipboard(`${window.location.origin}/post/${sharePost.id}`)}
                      className="px-2 py-1 bg-green-600 text-white text-xs rounded-md hover:bg-green-700 transition-colors"
                    >
                      {copied ? <FiCheck className="h-4 w-4" /> : <FiCopy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => shareViaFacebook(sharePost)}
                    className="flex items-center justify-center space-x-2 p-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <FiFacebook className="h-5 w-5" />
                    <span>Facebook</span>
                  </button>
                  <button
                    onClick={() => shareViaTwitter(sharePost)}
                    className="flex items-center justify-center space-x-2 p-3 bg-blue-400 text-white rounded-md hover:bg-blue-500 transition-colors"
                  >
                    <FiTwitter className="h-5 w-5" />
                    <span>Twitter</span>
                  </button>
                  <button
                    onClick={() => shareViaWhatsApp(sharePost)}
                    className="flex items-center justify-center space-x-2 p-3 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                  >
                    <FaWhatsapp className="h-5 w-5" />
                    <span>WhatsApp</span>
                  </button>
                  <button
                    onClick={() => shareViaEmail(sharePost)}
                    className="flex items-center justify-center space-x-2 p-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                  >
                    <FiMail className="h-5 w-5" />
                    <span>Email</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Post
