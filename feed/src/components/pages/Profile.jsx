import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

export default function Profile() {
  const [user, setUser] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    password: '********',
    joinDate: '2023-05-15',
    profilePhoto: null
  });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [showImageSuccess, setShowImageSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    if (!editData.name) newErrors.name = 'Name is required';
    if (!editData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(editData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (editData.password && editData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEditClick = () => {
    setEditData({
      name: user.name,
      email: user.email,
      password: ''
    });
    setErrors({});
    setIsEditModalOpen(true);
  };

  const handleInputChange = (e) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value
    });
    // Clear error when user types
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: null
      });
    }
  };

  const handleSaveChanges = () => {
    if (!validateForm()) return;
    
    setUser({
      ...user,
      name: editData.name,
      email: editData.email,
      password: editData.password || user.password
    });
    setIsEditModalOpen(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleDeleteAccount = () => {
    // Simulate account deletion
    setShowDeleteConfirm(false);
    setShowDeleteSuccess(true);
    
    // Redirect after showing success message
    setTimeout(() => {
      navigate('/');
    }, 2000);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.match('image.*')) {
        setErrors({...errors, profilePhoto: 'Please select an image file'});
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setErrors({...errors, profilePhoto: 'File size should be less than 2MB'});
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setUser({
          ...user,
          profilePhoto: reader.result
        });
        setShowImageSuccess(true);
        setTimeout(() => setShowImageSuccess(false), 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 py-8 text-white bg-gray-800">
        <h2 className="text-2xl font-semibold text-center text-white">Dashboard</h2>
        <nav className="mt-8">
          <ul>
            <li>
              <button className="w-full py-2 pl-6 text-left hover:bg-gray-700" onClick={() => navigate('/myposts')}>
                My Posts
              </button>
            </li>
            <li>
              <button className="w-full py-2 pl-6 text-left hover:bg-gray-700" onClick={() => navigate('/myitems')}>
                My Listed Items
              </button>
            </li>
            <li>
              <button className="w-full py-2 pl-6 text-left hover:bg-gray-700" onClick={() => navigate('/myorders')}>
                My Orders
              </button>
            </li>
            <li>
              <button className="w-full py-2 pl-6 text-left hover:bg-gray-700" onClick={() => navigate('/notices')}>
                Notices
              </button>
            </li>
            <li>
              <button className="w-full py-2 pl-6 text-left hover:bg-gray-700" onClick={() => navigate('/logout')}>
                Logout
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Profile Content */}
      <div className="flex-1 px-4 py-12 bg-gray-50 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="overflow-hidden bg-white rounded-lg shadow">
            {/* Profile Header */}
            <div className="px-6 py-8 text-center bg-emerald-500">
              <div className="relative w-32 h-32 mx-auto overflow-hidden border-4 border-white rounded-full shadow-lg">
                {user.profilePhoto ? (
                  <img 
                    src={user.profilePhoto} 
                    alt="Profile" 
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-4xl text-gray-600 bg-gray-200">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <button
                  onClick={() => document.getElementById('profile-photo').click()}
                  className="absolute inset-0 flex items-end justify-center w-full h-full transition-opacity duration-300 opacity-0 hover:opacity-100"
                >
                  <span className="w-full py-2 text-sm text-white bg-black bg-opacity-50">
                    Change Photo
                  </span>
                </button>
                <input 
                  id="profile-photo" 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
              <h1 className="mt-4 text-2xl font-bold text-white">{user.name}</h1>
              <p className="text-emerald-100">{user.email}</p>
            </div>

            {/* Profile Details */}
            <div className="px-6 py-8">
              <div className="mb-8">
                <h2 className="mb-4 text-xl font-semibold text-gray-800">Profile Information</h2>
                
                <div className="space-y-4">
                  <div className="flex flex-col py-3 border-b border-gray-200 sm:flex-row sm:items-center">
                    <span className="font-medium text-gray-600 sm:w-1/4">Name</span>
                    <span className="sm:w-2/4">{user.name}</span>
                  </div>
                  
                  <div className="flex flex-col py-3 border-b border-gray-200 sm:flex-row sm:items-center">
                    <span className="font-medium text-gray-600 sm:w-1/4">Email</span>
                    <span className="sm:w-2/4">{user.email}</span>
                  </div>
                  
                  <div className="flex flex-col py-3 border-b border-gray-200 sm:flex-row sm:items-center">
                    <span className="font-medium text-gray-600 sm:w-1/4">Password</span>
                    <span className="sm:w-2/4">{user.password}</span>
                  </div>
                  
                  <div className="flex flex-col py-3 border-b border-gray-200 sm:flex-row sm:items-center">
                    <span className="font-medium text-gray-600 sm:w-1/4">Join Date</span>
                    <span className="sm:w-2/4">{user.joinDate}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <button
                  onClick={handleEditClick}
                  className="px-4 py-2 text-white transition rounded-md bg-emerald-500 hover:bg-emerald-600"
                >
                  Update Profile
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 text-white transition bg-red-500 rounded-md hover:bg-red-600"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
              <h3 className="mb-4 text-lg font-semibold">Update Profile</h3>
              <div className="space-y-4">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={editData.name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>
                
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={editData.email}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>
                
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">New Password</label>
                  <input
                    type="password"
                    name="password"
                    value={editData.password}
                    onChange={handleInputChange}
                    placeholder="Leave blank to keep current"
                    className={`w-full px-3 py-2 border rounded-md ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                </div>
              </div>
              
              <div className="flex justify-end mt-6 space-x-3">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveChanges}
                  className="px-4 py-2 text-white rounded-md bg-emerald-500 hover:bg-emerald-600"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
              <h3 className="mb-4 text-lg font-semibold">Delete Account</h3>
              <p className="mb-6 text-gray-600">Are you sure you want to delete your account? This action cannot be undone.</p>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 text-white bg-red-500 rounded-md hover:bg-red-600"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Success Modal */}
        {showDeleteSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="w-full max-w-md p-6 text-center bg-white rounded-lg shadow-xl">
              <CheckCircleIcon className="w-12 h-12 mx-auto mb-4 text-emerald-500" />
              <h3 className="mb-2 text-lg font-semibold">Account Deleted Successfully</h3>
              <p className="text-gray-600">You will be redirected to the home page.</p>
            </div>
          </div>
        )}

        {/* Success Messages */}
        {showSuccess && (
          <div className="fixed z-50 flex items-center px-4 py-2 text-white rounded-md shadow-lg bottom-4 right-4 bg-emerald-500">
            <CheckCircleIcon className="w-5 h-5 mr-2" />
            Profile updated successfully!
          </div>
        )}

        {showImageSuccess && (
          <div className="fixed z-50 flex items-center px-4 py-2 text-white rounded-md shadow-lg bottom-4 right-4 bg-emerald-500">
            <CheckCircleIcon className="w-5 h-5 mr-2" />
            Profile image uploaded successfully!
          </div>
        )}

        {errors.profilePhoto && (
          <div className="fixed z-50 flex items-center px-4 py-2 text-white bg-red-500 rounded-md shadow-lg bottom-4 right-4">
            <XCircleIcon className="w-5 h-5 mr-2" />
            {errors.profilePhoto}
          </div>
        )}
      </div>
    </div>
  );
}
