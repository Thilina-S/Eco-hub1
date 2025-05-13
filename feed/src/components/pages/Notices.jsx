import React, { useState, useEffect } from 'react';

const AdminNotice = () => {
  const [notices, setNotices] = useState([]);

  const API_URL = import.meta.env.VITE_API_URL;

  // Fetch all notices from the backend
  useEffect(() => {
    fetch(`${API_URL}/notices`)
      .then((response) => response.json())
      .then((data) => {
        // Filter notices to show only active ones
        const activeNotices = data.filter((notice) => notice.status === 'Active');
        setNotices(activeNotices);
      })
      .catch((error) => console.error('Error fetching notices:', error));
  }, []);

  return (
    <div className="min-h-screen py-6 bg-gray-100 dark:bg-gray-800">
      <div className="max-w-4xl p-4 mx-auto bg-white rounded-lg shadow-md dark:bg-green-800">
        <h2 className="mb-6 text-3xl font-bold text-green-700 dark:text-green-200">My Notices</h2>

        {/* Display each notice */}
        {notices.map((notice) => (
          <div
            key={notice._id}
            className="p-4 mb-6 border-l-4 border-green-600 bg-green-50 dark:bg-green-700 dark:border-green-400"
          >
            <h3 className="text-xl font-semibold text-green-800 dark:text-green-100">{notice.title}</h3>
            <p className="mt-2 text-gray-700 dark:text-gray-200">{notice.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminNotice;
