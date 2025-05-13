import React, { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // ✅ Correct import for autoTable

const AdminUsers = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);

  // ✅ Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/users`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        const data = await res.json();
        if (data.success) {
          setUsers(data.users);
        } else {
          alert(data.message || 'Failed to fetch users');
        }
      } catch (err) {
        console.error(err);
        alert('Error fetching users');
      }
    };

    fetchUsers();
  }, []);

  // ✅ Delete user handler
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this user?');
    if (!confirmDelete) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/users/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await res.json();
      if (data.success) {
        setUsers(prev => prev.filter(user => user._id !== id));
        alert('User deleted successfully');
      } else {
        alert(data.message || 'Failed to delete user');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting user');
    }
  };

  // ✅ Generate PDF
  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("User List", 14, 20);

    const tableColumn = ["#", "Name", "Email"];
    const tableRows = users.map((user, index) => [
      index + 1,
      user.name,
      user.email
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      theme: 'striped',
      styles: { fontSize: 10 },
    });

    doc.save("user-list.pdf");
  };

  // ✅ Search filter
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Users Management</h2>
        <button
          onClick={generatePDF}
          className="flex items-center px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
        >
          <FileText size={16} className="mr-2" /> Generate PDF
        </button>
      </div>

      <div className="overflow-hidden bg-white rounded-lg shadow-md dark:bg-gray-800">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="w-64">
            <input
              type="text"
              placeholder="Search users..."
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
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">Name</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">Email</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {filteredUsers.map((user, index) => (
                <tr key={user._id} className="hover:bg-gray-100 dark:hover:bg-gray-750">
                  <td className="px-6 py-4 text-sm whitespace-nowrap">{index + 1}</td>
                  <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">{user.name}</td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap">{user.email}</td>
                  <td className="flex px-6 py-4 space-x-2 text-sm font-medium whitespace-nowrap">
                    <button
                      onClick={() => handleDelete(user._id)}
                      className="text-red-600 hover:text-red-900 dark:hover:text-red-400"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-sm text-center text-gray-500">
                    No users found.
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

export default AdminUsers;
