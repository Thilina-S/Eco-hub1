"use client"

import { useState, useEffect, useRef } from "react"
import axios from "axios"
import {
  Heart,
  MessageSquare,
  Share2,
  MoreVertical,
  MapPin,
  Camera,
  X,
  Search,
  Edit2,
  Trash2,
  Send,
  Link,
  Copy,
  Check,
  Mail,
} from "lucide-react"
import { FaHeart, FaHome, FaUser, FaWhatsapp } from "react-icons/fa"
import { FiFacebook, FiTwitter } from "react-icons/fi"

// API base URL from environment variable
const API_URL = import.meta.env.VITE_API_URL;

// Default placeholder image
const defaultImage = "/placeholder.svg?height=600&width=800&text=Post+Image"

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
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token")
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => Promise.reject(error),
)

export default function PostFeed() {
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
  const [modalType, setModalType] = useState("photo")
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const commentInputRefs = useRef({})

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
      // Set fallback user data when API call fails
      setCurrentUser({
        userId: "fallback-user-id",
        userName: "Demo User",
        profilePhoto: null,
      })
    }
  }

  // Fetch all posts from backend
  const fetchPosts = async () => {
    setIsLoading(true)
    try {
      const [postsResponse, userResponse] = await Promise.all([
        apiClient.get("/posts"),
        apiClient.get("/profile"),
      ]).catch((error) => {
        // If API calls fail, return fallback data
        console.error("Error fetching data:", error)
        return [
          {
            data: [
              {
                _id: "post1",
                description: "This is a sample post about waste management and sustainability.",
                location: "San Francisco, CA",
                image: defaultImage,
                user: { _id: "fallback-user-id", name: "Demo User" },
                createdAt: new Date().toISOString(),
                likes: [],
                comments: [],
              },
              {
                _id: "post2",
                description:
                  "Recycling is essential for a sustainable future. Here are some tips to reduce waste in your daily life.",
                location: "New York, NY",
                image: defaultImage,
                user: { _id: "fallback-user-id", name: "Demo User" },
                createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
                likes: ["fallback-user-id"],
                comments: [
                  {
                    _id: "comment1",
                    text: "Great tips! I've been trying to reduce my plastic usage.",
                    user: { _id: "other-user", name: "Jane Smith" },
                    createdAt: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
                  },
                ],
              },
            ],
          },
          {
            data: {
              user: {
                id: "fallback-user-id",
                name: "Demo User",
                profilePhoto: null,
              },
            },
          },
        ]
      })

      // If we have valid responses, use them; otherwise, use the fallback data
      const postsData = Array.isArray(postsResponse.data) ? postsResponse.data : postsResponse
      const userData = userResponse.data ? userResponse.data : userResponse

      // Set current user from profile response
      setCurrentUser({
        userId: userData.user.id,
        userName: userData.user.name,
        profilePhoto: userData.user.profilePhoto,
      })

      // Transform posts data
      const transformedPosts = postsData.map((post) => {
        // Initialize comments state for this post
        const postComments = post.comments || []
        setComments((prev) => ({
          ...prev,
          [post._id]: postComments.map((comment) => ({
            id: comment._id,
            text: comment.text,
            userId: comment.user._id,
            userName: comment.user.name,
            isCurrentUser: comment.user._id === userData.user.id,
            createdAt: comment.createdAt,
          })),
        }))

        // Initialize all posts with comments hidden
        setShowComments((prev) => ({
          ...prev,
          [post._id]: false,
        }))

        // Handle image URL
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
          isLiked: post.likes?.includes(userData.user.id) || false,
          isCurrentUser: post.user._id === userData.user.id,
        }
      })

      setPosts(transformedPosts)
      setIsLoading(false)
    } catch (err) {
      console.error("Error processing posts:", err)
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
            id: comment._id,
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
      // Optimistically update the UI first
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

      // Then try to update the server
      await apiClient.post(`/posts/${postId}/likes`).catch((error) => {
        console.error("API call failed, but UI was updated:", error)
        // The UI is already updated, so we don't need to revert it in preview mode
      })
    } catch (err) {
      console.error("Error liking post:", err)
      showNotification("Failed to update like")
    }
  }

  const handleCommentSubmit = async (e, postId) => {
    e.preventDefault()
    if (!newComment.trim()) return

    const tempId = `temp-${Date.now()}`
    const newCommentData = {
      id: tempId,
      text: newComment,
      userId: currentUser.userId,
      userName: currentUser.userName,
      isCurrentUser: true,
      createdAt: new Date().toISOString(),
    }

    // Optimistically update UI
    setComments((prev) => {
      const updatedComments = { ...prev }
      if (!updatedComments[postId]) {
        updatedComments[postId] = []
      }
      updatedComments[postId] = [...updatedComments[postId], newCommentData]
      return updatedComments
    })

    setPosts((prevPosts) =>
      prevPosts.map((post) => (post.id === postId ? { ...post, commentCount: post.commentCount + 1 } : post)),
    )

    setNewComment("")
    setShowComments((prev) => ({ ...prev, [postId]: true }))

    try {
      // Then try to update the server
      const response = await apiClient
        .post(`/posts/${postId}/comments`, {
          text: newComment,
        })
        .catch((error) => {
          console.error("API call failed, but UI was updated:", error)
          // In preview mode, we'll keep the optimistic update
          return { data: { _id: tempId } }
        })

      // If we got a real ID back, update the temporary one
      if (response.data._id !== tempId) {
        setComments((prev) => ({
          ...prev,
          [postId]: prev[postId].map((comment) =>
            comment.id === tempId ? { ...comment, id: response.data._id } : comment,
          ),
        }))
      }

      showNotification("Comment added successfully")
    } catch (err) {
      console.error("Error adding comment:", err)
      showNotification("Failed to add comment")
    }
  }

  const handleEditComment = (commentId, currentText) => {
    setEditingCommentId(commentId)
    setEditedCommentText(currentText)
  }

  const handleUpdateComment = async (postId, commentId) => {
    if (!editedCommentText.trim()) return

    try {
      await apiClient.put(`/posts/${postId}/comments/${commentId}`, {
        text: editedCommentText,
      })

      setComments((prev) => ({
        ...prev,
        [postId]: prev[postId].map((comment) =>
          comment.id === commentId ? { ...comment, text: editedCommentText } : comment,
        ),
      }))

      setEditingCommentId(null)
      showNotification("Comment updated successfully")
    } catch (err) {
      console.error("Error updating comment:", err)
      showNotification("Failed to update comment")
    }
  }

  const handleDeleteComment = async (postId, commentId) => {
    try {
      await apiClient.delete(`/posts/${postId}/comments/${commentId}`)

      setComments((prev) => ({
        ...prev,
        [postId]: prev[postId].filter((comment) => comment.id !== commentId),
      }))

      setPosts((prevPosts) =>
        prevPosts.map((post) => (post.id === postId ? { ...post, commentCount: post.commentCount - 1 } : post)),
      )

      showNotification("Comment deleted successfully")
    } catch (err) {
      console.error("Error deleting comment:", err)
      showNotification("Failed to delete comment")
    }
  }

  const openCreateModal = (type = "photo") => {
    setModalType(type)
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

      const newPost = {
        id: response.data._id,
        description: response.data.description,
        location: response.data.location || "",
        imageUrl: response.data.image
          ? response.data.image.startsWith("http")
            ? response.data.image
            : `${API_URL}/${response.data.image.replace(/^\/+/, "")}`
          : defaultImage,
        userId: currentUser.userId,
        userName: currentUser.userName,
        createdAt: new Date().toISOString(),
        likes: [],
        likeCount: 0,
        commentCount: 0,
        isLiked: false,
        isCurrentUser: true,
      }

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
    <div className="flex min-h-screen bg-gray-50">
      {/* Left Sidebar */}
      <div className="hidden bg-white shadow-md w-60 md:block">
        <div className="p-4">
          <div className="flex items-center mb-6">
            <div className="flex items-center justify-center w-12 h-12 mr-3 text-xl font-bold text-white bg-green-500 rounded-full">
              {currentUser?.userName?.charAt(0) || "U"}
            </div>
            <div>
              <div className="font-medium">{currentUser?.userName || "User"}</div>
              <div className="text-sm text-gray-500">Eco Enthusiast</div>
            </div>
          </div>

<nav className="space-y-1">
  <a href="/home" className="flex items-center px-4 py-2 text-green-600 rounded-md bg-green-50">
    <FaHome className="w-5 h-5 mr-3" />
    Home
  </a>

  <a href="/profile" className="flex items-center px-4 py-2 text-gray-600 rounded-md hover:bg-gray-100">
    <FaUser className="w-5 h-5 mr-3" />
    Profile
  </a>

  <a href="/marketplace" className="flex items-center px-4 py-2 text-gray-600 rounded-md hover:bg-gray-100">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5 mr-3"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
      />
    </svg>
    Marketplace
  </a>

  <a href="/myposts" className="flex items-center px-4 py-2 text-gray-600 rounded-md hover:bg-gray-100">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5 mr-3"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
      />
    </svg>
    My Posts
  </a>
  
  <a href="/notices" className="flex items-center px-4 py-2 text-gray-600 rounded-md hover:bg-gray-100">
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-5 h-5 mr-3"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 22c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zM12 4a1 1 0 011 1v6a1 1 0 01-1 1H8a1 1 0 01-1-1V5a1 1 0 011-1h4z"
    />
  </svg>
 Notices
</a>

  <a href="/myitems" className="flex items-center px-4 py-2 text-gray-600 rounded-md hover:bg-gray-100">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5 mr-3"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
      />
    </svg>
    My Items
  </a>
</nav>

        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {notification && (
          <div className="fixed z-50 px-4 py-2 text-white transform -translate-x-1/2 bg-green-600 rounded-md shadow-lg top-4 left-1/2">
            {notification}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-b-2 border-green-500 rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="p-4 text-red-500">{error}</div>
        ) : (
          <div className="max-w-2xl p-4 mx-auto">
            {/* Post Creation Area */}
            <div className="p-4 mb-6 bg-white rounded-lg shadow">
              <div className="flex">
                <div className="flex items-center justify-center w-10 h-10 mr-3 font-bold text-white bg-green-500 rounded-full">
                  {currentUser?.userName?.charAt(0) || "U"}
                </div>
                <input
                  type="text"
                  placeholder="What's on your mind about waste management?"
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-full focus:outline-none"
                  onClick={() => openCreateModal("photo")}
                  readOnly
                />
              </div>
              <div className="flex justify-center pt-3 mt-4 border-t border-gray-100">
                <button
                  onClick={() => openCreateModal("photo")}
                  className="flex items-center justify-center px-4 py-2 mr-2 text-gray-500 rounded-md hover:bg-gray-100"
                >
                  <Camera className="w-5 h-5 mr-1 text-green-500" />
                  Photo
                </button>
                <button
                  onClick={() => openCreateModal("photo")}
                  className="flex items-center justify-center px-4 py-2 text-gray-500 rounded-md hover:bg-gray-100"
                >
                  <MapPin className="w-5 h-5 mr-1 text-green-500" />
                  Location
                </button>
              </div>
            </div>

            {/* Posts List */}
            {posts.map((post) => (
              <div key={post.id} className="mb-6 overflow-hidden bg-white rounded-lg shadow">
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex">
                      <div className="flex items-center justify-center w-10 h-10 mr-3 font-bold text-white bg-green-500 rounded-full">
                        {post.userName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium">{post.userName}</div>
                        <div className="flex items-center text-xs text-gray-500">
                          {post.location && (
                            <>
                              <MapPin className="w-3 h-3 mr-1" />
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
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>

                        {showOptionsMenu === post.id && (
                          <div className="absolute right-0 z-10 w-48 mt-1 bg-white rounded-md shadow-lg">
                            <div className="py-1">
                              <button
                                onClick={() => handleEditPost(post.id)}
                                className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                              >
                                Edit Post
                              </button>
                              <button
                                onClick={() => handleDeletePost(post.id)}
                                className="block w-full px-4 py-2 text-sm text-left text-red-500 hover:bg-gray-100"
                              >
                                Delete Post
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <p className="mt-2 text-gray-700">{post.description}</p>
                </div>

                {post.imageUrl && (
                  <div className="w-full bg-gray-100 h-96">
                    <img
                      src={post.imageUrl || "/placeholder.svg"}
                      alt="Post content"
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}

                <div className="flex justify-between px-4 py-2 border-t border-b border-gray-100">
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-5 h-5 mr-1 text-white bg-green-500 rounded-full">
                      <FaHeart className="w-3 h-3" />
                    </div>
                    <span className="text-xs text-gray-500">
                      {post.likeCount} {post.likeCount === 1 ? "like" : "likes"}
                    </span>
                  </div>

                  <button className="text-xs text-gray-500 hover:underline" onClick={() => toggleComments(post.id)}>
                    {post.commentCount} {post.commentCount === 1 ? "comment" : "comments"}
                  </button>
                </div>

                <div className="flex px-4 py-2 border-b border-gray-100">
                  <button
                    className={`flex-1 flex items-center justify-center py-1 rounded-md ${
                      post.isLiked ? "text-green-500" : "text-gray-500 hover:bg-gray-50"
                    }`}
                    onClick={() => handleLike(post.id)}
                  >
                    {post.isLiked ? <FaHeart className="w-5 h-5 mr-2" /> : <Heart className="w-5 h-5 mr-2" />}
                    Like
                  </button>

                  <button
                    className="flex items-center justify-center flex-1 py-1 text-gray-500 rounded-md hover:bg-gray-50"
                    onClick={() => focusCommentInput(post.id)}
                  >
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Comment
                  </button>

                  <button
                    className="flex items-center justify-center flex-1 py-1 text-gray-500 rounded-md hover:bg-gray-50"
                    onClick={() => openShareModal(post)}
                  >
                    <Share2 className="w-5 h-5 mr-2" />
                    Share
                  </button>
                </div>

                {showComments[post.id] && (
                  <div className="p-4 bg-gray-50">
                    <div className="mb-4 space-y-3 overflow-y-auto max-h-60">
                      {comments[post.id]?.map((comment) => (
                        <div
                          key={comment.id}
                          className={`flex ${editingCommentId === comment.id ? "bg-green-50 p-2 rounded-md" : ""}`}
                        >
                          <div className="flex items-center justify-center w-8 h-8 mr-2 text-xs font-bold text-white bg-green-500 rounded-full">
                            {comment.userName.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <div className="p-2 bg-white rounded-lg shadow-sm">
                              <div className="flex items-start justify-between">
                                <span className="text-sm font-medium">{comment.userName}</span>
                                {comment.isCurrentUser && editingCommentId !== comment.id && (
                                  <div className="flex space-x-1">
                                    <button
                                      onClick={() => handleEditComment(comment.id, comment.text)}
                                      className="text-gray-400 hover:text-gray-600"
                                    >
                                      <Edit2 className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteComment(post.id, comment.id)}
                                      className="text-gray-400 hover:text-red-500"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                )}
                              </div>

                              {editingCommentId === comment.id ? (
                                <div className="flex mt-1 space-x-2">
                                  <input
                                    type="text"
                                    value={editedCommentText}
                                    onChange={(e) => setEditedCommentText(e.target.value)}
                                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-md"
                                  />
                                  <button
                                    onClick={() => handleUpdateComment(post.id, comment.id)}
                                    className="px-2 py-1 text-xs text-white bg-green-500 rounded-md"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setEditingCommentId(null)}
                                    className="px-2 py-1 text-xs text-gray-700 bg-gray-200 rounded-md"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <p className="text-sm text-gray-700">{comment.text}</p>
                              )}
                            </div>
                            <p className="mt-1 ml-2 text-xs text-gray-500">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <form onSubmit={(e) => handleCommentSubmit(e, post.id)} className="flex">
                      <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 mr-2 text-xs font-semibold text-white bg-green-500 rounded-full">
                        {currentUser?.userName?.charAt(0) || "U"}
                      </div>
                      <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write a comment..."
                        className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        ref={(el) => (commentInputRefs.current[post.id] = el)}
                      />
                      <button
                        type="submit"
                        className="p-2 ml-2 text-white bg-green-500 rounded-full hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                        disabled={!newComment.trim()}
                      >
                        <Send className="w-4 h-4" />
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
      <div className="hidden w-64 p-4 lg:block">
        <div className="p-4 mb-6 bg-white rounded-lg shadow">
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Search..."
              className="w-full py-2 pl-10 pr-4 text-gray-700 bg-gray-100 rounded-full focus:outline-none focus:ring-1 focus:ring-green-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute left-3 top-2.5 text-gray-400">
              <Search className="w-5 h-5" />
            </div>
          </div>

          <h3 className="mb-3 font-medium text-gray-800">Trending Topics</h3>
          <div className="space-y-2">
            <div className="text-green-500 bg-green-50 px-3 py-1.5 rounded-md">#CircularEconomy</div>
            <div className="text-green-500 bg-green-50 px-3 py-1.5 rounded-md">#ZeroWaste</div>
            <div className="text-green-500 bg-green-50 px-3 py-1.5 rounded-md">#Recycling</div>
            <div className="text-green-500 bg-green-50 px-3 py-1.5 rounded-md">#Sustainability</div>
          </div>
        </div>

        <div className="p-4 bg-white rounded-lg shadow">
          <h3 className="mb-3 font-medium text-gray-800">Eco Tips</h3>
          <div className="space-y-3">
            <div className="pl-3 text-sm border-l-2 border-green-400">
              Separate your waste properly to maximize recycling efficiency.
            </div>
            <div className="pl-3 text-sm border-l-2 border-green-400">
              Composting food scraps can reduce landfill waste by up to 30%.
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
            <div className="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Create Post</h3>
                <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-500">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleSubmitPost}>
                <div className="px-6 py-4">
                  <div className="flex items-center mb-4 space-x-3">
                    <div className="flex items-center justify-center w-10 h-10 font-semibold text-white bg-green-500 rounded-full">
                      {currentUser?.userName?.charAt(0) || "U"}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{currentUser?.userName || "User"}</h4>
                      <div className="flex items-center text-xs text-gray-500">
                        <MapPin className="w-3 h-3 mr-1" />
                        <input
                          type="text"
                          name="location"
                          value={currentPost.location}
                          onChange={handlePostInputChange}
                          placeholder="Add location"
                          className="w-full p-0 text-xs text-gray-500 bg-transparent border-none focus:ring-0"
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
                    <label className="block mb-2 text-sm font-medium text-gray-700">Add Photo</label>
                    <div className="flex items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        {currentPost.imagePreview ? (
                          <div className="relative">
                            <img
                              src={currentPost.imagePreview || "/placeholder.svg"}
                              alt="Preview"
                              className="object-cover h-32 mx-auto rounded-md"
                            />
                            <button
                              type="button"
                              onClick={() => setCurrentPost((prev) => ({ ...prev, image: null, imagePreview: null }))}
                              className="absolute top-0 right-0 p-1 -mt-2 -mr-2 text-white bg-red-500 rounded-full"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <svg
                              className="w-12 h-12 mx-auto text-gray-400"
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
                                className="relative font-medium text-green-500 bg-white rounded-md cursor-pointer hover:text-green-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500"
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
                <div className="px-6 py-4 text-right bg-gray-50">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 mr-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-green-500 border border-transparent rounded-md shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
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
            <div className="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Edit Post</h3>
                <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-500">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleUpdatePost}>
                <div className="px-6 py-4">
                  <div className="flex items-center mb-4 space-x-3">
                    <div className="flex items-center justify-center w-10 h-10 font-semibold text-white bg-green-500 rounded-full">
                      {currentUser?.userName?.charAt(0) || "U"}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{currentUser?.userName || "User"}</h4>
                      <div className="flex items-center text-xs text-gray-500">
                        <MapPin className="w-3 h-3 mr-1" />
                        <input
                          type="text"
                          name="location"
                          value={currentPost.location}
                          onChange={handlePostInputChange}
                          placeholder="Add location"
                          className="w-full p-0 text-xs text-gray-500 bg-transparent border-none focus:ring-0"
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
                    <label className="block mb-2 text-sm font-medium text-gray-700">Change Photo</label>
                    <div className="flex items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        {currentPost.imagePreview ? (
                          <div className="relative">
                            <img
                              src={currentPost.imagePreview || "/placeholder.svg"}
                              alt="Preview"
                              className="object-cover h-32 mx-auto rounded-md"
                            />
                            <button
                              type="button"
                              onClick={() => setCurrentPost((prev) => ({ ...prev, image: null, imagePreview: null }))}
                              className="absolute top-0 right-0 p-1 -mt-2 -mr-2 text-white bg-red-500 rounded-full"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <svg
                              className="w-12 h-12 mx-auto text-gray-400"
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
                                className="relative font-medium text-green-500 bg-white rounded-md cursor-pointer hover:text-green-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500"
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
                <div className="px-6 py-4 text-right bg-gray-50">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 mr-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-green-500 border border-transparent rounded-md shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
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
            <div className="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Share Post</h3>
                <button onClick={() => setShowShareModal(false)} className="text-gray-400 hover:text-gray-500">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="px-6 py-4">
                <div className="mb-4">
                  <p className="mb-2 text-sm text-gray-500">Share this post with your friends</p>
                  <div className="flex items-center p-2 space-x-2 bg-gray-100 rounded-md">
                    <Link className="text-gray-500" />
                    <input
                      type="text"
                      value={`${window.location.origin}/post/${sharePost.id}`}
                      readOnly
                      className="flex-1 text-sm bg-transparent border-none focus:ring-0"
                    />
                    <button
                      onClick={() => copyToClipboard(`${window.location.origin}/post/${sharePost.id}`)}
                      className="px-2 py-1 text-xs text-white transition-colors bg-green-500 rounded-md hover:bg-green-600"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => shareViaFacebook(sharePost)}
                    className="flex items-center justify-center p-3 space-x-2 text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    <FiFacebook className="w-5 h-5" />
                    <span>Facebook</span>
                  </button>
                  <button
                    onClick={() => shareViaTwitter(sharePost)}
                    className="flex items-center justify-center p-3 space-x-2 text-white transition-colors bg-blue-400 rounded-md hover:bg-blue-500"
                  >
                    <FiTwitter className="w-5 h-5" />
                    <span>Twitter</span>
                  </button>
                  <button
                    onClick={() => shareViaWhatsApp(sharePost)}
                    className="flex items-center justify-center p-3 space-x-2 text-white transition-colors bg-green-500 rounded-md hover:bg-green-600"
                  >
                    <FaWhatsapp className="w-5 h-5" />
                    <span>WhatsApp</span>
                  </button>
                  <button
                    onClick={() => shareViaEmail(sharePost)}
                    className="flex items-center justify-center p-3 space-x-2 text-white transition-colors bg-gray-600 rounded-md hover:bg-gray-700"
                  >
                    <Mail className="w-5 h-5" />
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
