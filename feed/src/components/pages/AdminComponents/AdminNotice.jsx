import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';

const AdminNotice = () => {
  const [notices, setNotices] = useState([]);
  const [newNotice, setNewNotice] = useState({ title: '', content: '', status: 'Active' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(''); // Type of modal ('create', 'edit', 'view')
  const [selectedNotice, setSelectedNotice] = useState(null); // Notice being viewed or edited
  const [notification, setNotification] = useState('');

  const API_URL = import.meta.env.VITE_API_URL;

  // Fetch all notices from the backend
  useEffect(() => {
    fetch(`${API_URL}/notices`)
      .then((response) => response.json())
      .then((data) => setNotices(data))
      .catch((error) => console.error('Error fetching notices:', error));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewNotice((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (modalType === 'create') {
      // Create a new notice
      fetch(`${API_URL}/notices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNotice),
      })
        .then((res) => res.json())
        .then((data) => {
          setNotices((prev) => [...prev, data.notice]);
          setNotification('Notice created successfully!');
        })
        .catch((err) => console.error('Error creating notice:', err));
    } else if (modalType === 'edit' && selectedNotice) {
      // Update an existing notice
      fetch(`${API_URL}/notices/${selectedNotice._id}`, {  // Use _id for MongoDB object ID
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNotice),
      })
        .then((res) => res.json())
        .then((data) => {
          setNotices((prev) =>
            prev.map((notice) =>
              notice._id === selectedNotice._id ? data.notice : notice // Use _id for unique identification
            )
          );
          setNotification('Notice updated successfully!');
        })
        .catch((err) => console.error('Error updating notice:', err));
    }
    setIsModalOpen(false);
    setNewNotice({ title: '', content: '', status: 'Active' });
  };

  const handleDelete = (id) => {
    fetch(`${API_URL}/notices/${id}`, { method: 'DELETE' })
      .then((res) => res.json())
      .then(() => {
        setNotices((prev) => prev.filter((notice) => notice._id !== id));  // Use _id for filtering
        setNotification('Notice deleted successfully!');
      })
      .catch((err) => console.error('Error deleting notice:', err));
  };

  const handleModalOpen = (type, notice = null) => {
    setModalType(type);
    setSelectedNotice(notice);
    setNewNotice(notice ? { title: notice.title, content: notice.content, status: notice.status } : { title: '', content: '', status: 'Active' });
    setIsModalOpen(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Notice Management</h2>
        <button
          className="flex items-center px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
          onClick={() => handleModalOpen('create')}
        >
          <Bell size={16} className="mr-2" /> Create New Notice
        </button>
      </div>

      {/* Notification */}
      {notification && (
        <div className="fixed z-50 p-4 text-white bg-green-600 rounded-lg shadow-lg bottom-4 left-4">
          {notification}
        </div>
      )}

      {/* Modal for Create/Edit/View Notice */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500 bg-opacity-50 dark:bg-opacity-70">
          <div className="w-full max-w-lg p-6 text-gray-900 transition-transform transform scale-100 bg-white rounded-lg dark:bg-green-800 dark:text-white animate-popup">
            <h3 className="mb-4 text-2xl font-bold text-green-600 dark:text-green-200">
              {modalType === 'create' ? 'Create New Notice' : modalType === 'edit' ? 'Edit Notice' : 'View Notice'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block mb-1 text-sm font-medium text-green-700 dark:text-green-300">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={newNotice.title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700"
                    required
                    disabled={modalType === 'view'}
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-green-700 dark:text-green-300">Content</label>
                  <textarea
                    name="content"
                    value={newNotice.content}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700"
                    required
                    disabled={modalType === 'view'}
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-green-700 dark:text-green-300">Status</label>
                  <select
                    name="status"
                    value={newNotice.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700"
                    disabled={modalType === 'view'}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end mt-6 modal-action">
                <button
                  type="button"
                  className="mr-2 text-white bg-gray-500 btn hover:bg-gray-600"
                  onClick={() => setIsModalOpen(false)} // Close modal
                >
                  Cancel
                </button>
                {modalType !== 'view' && (
                  <button
                    type="submit"
                    className="text-white bg-green-600 btn hover:bg-green-700"
                  >
                    {modalType === 'create' ? 'Create Notice' : 'Save Changes'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="overflow-hidden bg-white rounded-lg shadow-md dark:bg-gray-800">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <input
            type="text"
            placeholder="Search notices..."
            className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">ID</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">Title</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">Content</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">Status</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">Date</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {notices.map((notice) => (
                <tr key={notice._id} className="hover:bg-gray-100 dark:hover:bg-gray-750">
                  <td className="px-6 py-4 text-sm whitespace-nowrap">{notice._id}</td>
                  <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">{notice.title}</td>
                  <td className="max-w-xs px-6 py-4 text-sm truncate">{notice.content}</td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs ${notice.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                      {notice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap">{notice.date}</td>
                  <td className="flex px-6 py-4 space-x-2 text-sm font-medium whitespace-nowrap">
                    <button
                      className="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400"
                      onClick={() => handleModalOpen('view', notice)}
                    >
                      View
                    </button>
                    <button
                      className="text-green-600 hover:text-green-900 dark:hover:text-green-400"
                      onClick={() => handleModalOpen('edit', notice)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-600 hover:text-red-900 dark:hover:text-red-400"
                      onClick={() => handleDelete(notice._id)} // Use _id for deleting notice
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing <span className="font-medium">1</span> to <span className="font-medium">4</span> of <span className="font-medium">4</span> results
          </div>
          <div className="flex space-x-2">
            <button className="px-3 py-1 border border-gray-300 rounded-md dark:border-gray-600 disabled:opacity-50">Previous</button>
            <button className="px-3 py-1 text-white bg-green-600 border border-gray-300 rounded-md dark:border-gray-600">1</button>
            <button className="px-3 py-1 border border-gray-300 rounded-md dark:border-gray-600 disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNotice;
