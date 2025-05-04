import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import axios from "axios";

const MyPosts = () => {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch posts from API
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/posts`);
        if (!response.ok) throw new Error("Failed to fetch posts");
        const data = await response.json();
        setPosts(data);
        setFilteredPosts(data); // Initially display all posts
        setLoading(false);
      } catch (error) {
        console.error("Error fetching posts:", error);
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  // Search filter by keyword (description or title)
  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = posts.filter(
      (post) =>
        post.description.toLowerCase().includes(query) ||
        post.user.name.toLowerCase().includes(query)
    );
    setFilteredPosts(filtered);
  };

  // PDF Generation function
  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(12);
    doc.text("My Posts", 20, 20);

    let y = 30; // Start printing after the title
    filteredPosts.forEach((post, index) => {
      doc.text(`Post #${index + 1}: ${post.description}`, 20, y);
      y += 10;
      doc.text(`Author: ${post.user.name}`, 20, y);
      y += 10;
      doc.text(`Likes: ${post.likes.length} | Comments: ${post.comments.length}`, 20, y);
      y += 10;
      doc.text(`Location: ${post.location || "N/A"}`, 20, y);
      y += 15; // Extra space between posts

      // Add a new page if space runs out
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });

    doc.save("posts.pdf");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-b-2 border-gray-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">My Posts</h1>
        <button
          onClick={generatePDF}
          className="px-6 py-2 font-semibold text-white rounded-lg shadow-md bg-[#006400]"

        >
          Download as PDF
        </button>
      </div>

      {/* Search Bar */}
      <input
        type="text"
        value={searchQuery}
        onChange={handleSearch}
        placeholder="Search by description or author"
        className="w-full px-4 py-2 mb-8 border rounded-md"
      />

      {/* Desktop Table */}
      <div className="hidden overflow-x-auto rounded-lg shadow md:block">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Author</th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Description</th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Image</th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Likes</th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Comments</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredPosts.map((post) => (
              <tr key={post._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <img
                      src={post.user.profilePhoto || "https://via.placeholder.com/40"}
                      alt={post.user.name}
                      className="object-cover w-10 h-10 rounded-full"
                    />
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{post.user.name}</div>
                      {post.location && <div className="text-sm text-gray-500">{post.location}</div>}
                    </div>
                  </div>
                </td>
                <td className="max-w-xs px-6 py-4 text-sm text-gray-700">{post.description}</td>
                <td className="px-6 py-4">
                  {post.image && (
                    <img
                      src={`${import.meta.env.VITE_API_URL}/../${post.image}`}
                      alt="Post"
                      className="object-cover w-20 h-20 rounded"
                    />
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{post.likes.length} likes</td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div className="space-y-2">
                    {post.comments.map((comment) => (
                      <div key={comment._id} className="flex items-start">
                        <img
                          src={comment.user.profilePhoto || "https://via.placeholder.com/32"}
                          alt={comment.user.name}
                          className="object-cover w-6 h-6 mt-1 rounded-full"
                        />
                        <div className="ml-2">
                          <div className="text-xs font-medium">{comment.user.name}</div>
                          <div className="text-xs text-gray-600">{comment.text}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="space-y-4 md:hidden">
        {filteredPosts.map((post) => (
          <div key={post._id} className="p-4 bg-white rounded-lg shadow">
            <div className="flex items-center mb-4">
              <img
                src={post.user.profilePhoto || "https://via.placeholder.com/40"}
                alt={post.user.name}
                className="object-cover w-10 h-10 rounded-full"
              />
              <div className="ml-3">
                <h3 className="font-semibold text-gray-800">{post.user.name}</h3>
                {post.location && <p className="text-sm text-gray-500">{post.location}</p>}
              </div>
            </div>

            {post.image && (
              <img
                src={`${import.meta.env.VITE_API_URL}/../${post.image}`}
                alt="Post"
                className="object-cover w-full h-48 mb-4 rounded-lg"
              />
            )}

            <p className="mb-4 text-gray-700">{post.description}</p>

            <div className="flex items-center mb-4">
              <span className="text-sm text-gray-600">{post.likes.length} likes</span>
            </div>

            <div className="pt-4 border-t">
              <h4 className="mb-3 font-semibold text-gray-700">Comments</h4>
              {post.comments.map((comment) => (
                <div key={comment._id} className="flex items-start mb-3">
                  <img
                    src={comment.user.profilePhoto || "https://via.placeholder.com/32"}
                    alt={comment.user.name}
                    className="object-cover w-6 h-6 rounded-full"
                  />
                  <div className="flex-1 p-2 ml-3 rounded-lg bg-gray-50">
                    <div className="flex items-center mb-1">
                      <span className="text-xs font-medium text-gray-700">{comment.user.name}</span>
                    </div>
                    <p className="text-xs text-gray-600">{comment.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyPosts;
