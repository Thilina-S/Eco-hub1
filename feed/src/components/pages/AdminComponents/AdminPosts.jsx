import React, { useState, useEffect } from 'react';
import { FileText, Trash } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const AdminPosts = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [posts, setPosts] = useState([]);
  const [message, setMessage] = useState('');
  const [messageStatus, setMessageStatus] = useState('success'); // 'success' or 'error'

  // Fetch posts from API
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/posts`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`, // Send token in header
          },
        });

        const data = await res.json();
        if (data) {
          setPosts(data);
        } else {
          setMessage('Failed to fetch posts');
          setMessageStatus('error');
        }
      } catch (err) {
        console.error(err);
        setMessage('Error fetching posts');
        setMessageStatus('error');
      }
    };

    fetchPosts();
  }, []);

  // Delete a single post handler
  const handleDeletePost = async (postId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this post?');
    if (!confirmDelete) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/posts/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`, // Send token in header
        },
      });

      const data = await res.json();
      if (data.success) {
        setPosts(prev => prev.filter(post => post._id !== postId));
        setMessage('Post deleted successfully');
        setMessageStatus('success');
      } else {
        setMessage(data.message || 'Failed to delete post');
        setMessageStatus('error');
      }
    } catch (err) {
      console.error(err);
      setMessage('Error deleting post');
    }
  };

  // Delete all posts handler
  const handleDeleteAllPosts = async () => {
    const confirmDelete = window.confirm('Are you sure you want to delete all posts?');
    if (!confirmDelete) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/posts/posts`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`, // Send token in header
        },
      });

      const data = await res.json();
      if (data.success) {
        setPosts([]);
        setMessage('All posts deleted successfully');
        setMessageStatus('success');
      } else {
        setMessage(data.message || 'Failed to delete posts');
        setMessageStatus('error');
      }
    } catch (err) {
      console.error(err);
      setMessage('Error deleting posts');
    }
  };

  // Delete all comments handler
  const handleDeleteAllComments = async (postId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete all comments for this post?');
    if (!confirmDelete) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/posts/posts/${postId}/comments`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`, // Send token in header
        },
      });

      const data = await res.json();
      if (data.success) {
        setPosts(prevPosts =>
          prevPosts.map(post =>
            post._id === postId ? { ...post, comments: [] } : post
          )
        );
        setMessage('All comments deleted successfully');
        setMessageStatus('success');
      } else {
        setMessage(data.message || 'Failed to delete comments');
        setMessageStatus('error');
      }
    } catch (err) {
      console.error(err);
      setMessage('Error deleting comments');
    }
  };

  // Delete a single comment handler
const handleDeleteComment = async (postId, commentId) => {
  const confirmDelete = window.confirm('Are you sure you want to delete this comment?');
  if (!confirmDelete) return;

  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/posts/posts/${postId}/comments/${commentId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`, // Send token in header
      },
    });

    const data = await res.json();
    if (data.success) {
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post._id === postId
            ? { ...post, comments: post.comments.filter(comment => comment._id !== commentId) }
            : post
        )
      );
      setMessage('Comment deleted successfully');
      setMessageStatus('success');
    } else {
      setMessage(data.message || 'Failed to delete comment');
      setMessageStatus('error');
    }
  } catch (err) {
    console.error(err);
    setMessage('Error deleting comment');
  }
};



  // Generate PDF
  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Posts List", 14, 20);

    const tableColumn = ["#", "Title", "Location", "Description", "Comments Count"];
    const tableRows = posts.map((post, index) => [
      index + 1,
      post.title || 'No Title',
      post.location || 'No Location',
      post.description ? (post.description.length > 30 ? post.description.substring(0, 30) + '...' : post.description) : 'No Description',
      post.comments ? post.comments.length : 0
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      theme: 'striped',
      styles: { fontSize: 10 },
    });

    doc.save("posts-list.pdf");
  };

  // Search filter
  const filteredPosts = posts.filter(post =>
    (post.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (post.description?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (post.location?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Posts Management</h2>
        <button
          onClick={generatePDF}
          className="flex items-center px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
        >
          <FileText size={16} className="mr-2" /> Generate PDF
        </button>
        <button
          onClick={handleDeleteAllPosts}
          className="flex items-center px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700"
        >
          <Trash size={16} className="mr-2" /> Delete All Posts
        </button>
      </div>

      {message && (
        <div className={`p-3 mb-4 text-white rounded-md ${messageStatus === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {message}
        </div>
      )}

      <div className="overflow-hidden bg-white rounded-lg shadow-md dark:bg-gray-800">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="w-64">
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">ID</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">Title</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">Location</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">Description</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">Comments</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {filteredPosts.map((post, index) => (
                <tr key={post._id} className="hover:bg-gray-100 dark:hover:bg-gray-750">
                  <td className="px-6 py-4 text-sm whitespace-nowrap">{index + 1}</td>
                  <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">{post.title || 'No Title'}</td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap">{post.location || 'No Location'}</td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap">
                    {post.description 
                      ? (post.description.length > 50 
                          ? `${post.description.substring(0, 50)}...` 
                          : post.description) 
                      : 'No Description'}
                  </td>
                  <td className="px-6 py-4">
                    {post.comments && post.comments.length > 0 ? (
                      <div className="overflow-y-auto max-h-40">
                        {post.comments.map((comment) => (
                          <div key={comment._id} className="flex items-center justify-between p-1 mb-1 border-b">
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {comment.text?.substring(0, 30) || 'No text'}
                              {comment.text && comment.text.length > 30 ? '...' : ''}
                            </span>
                            <button
                              onClick={() => handleDeleteComment(post._id, comment._id)}
                              className="p-1 text-red-600 hover:text-red-900 dark:hover:text-red-400"
                            >
                              <Trash size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">No comments</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                    <button
                      onClick={() => handleDeletePost(post._id)}
                      className="text-red-600 hover:text-red-900 dark:hover:text-red-400"
                    >
                      Delete Post
                    </button>
                    <button
                      onClick={() => handleDeleteAllComments(post._id)}
                      className="ml-2 text-red-600 hover:text-red-900 dark:hover:text-red-400"
                    >
                      Delete All Comments
                    </button>
                  </td>
                </tr>
              ))}
              {filteredPosts.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-sm text-center text-gray-500">
                    No posts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPosts;
