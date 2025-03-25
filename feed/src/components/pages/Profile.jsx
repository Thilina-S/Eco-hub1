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
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Profile Header */}
          <div className="bg-emerald-500 px-6 py-8 text-center">
            <div className="relative mx-auto w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
              {user.profilePhoto ? (
                <img 
                  src={user.profilePhoto} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-4xl text-gray-600">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <button
                onClick={() => document.getElementById('profile-photo').click()}
                className="absolute inset-0 w-full h-full opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end justify-center"
              >
                <span className="w-full bg-black bg-opacity-50 text-white text-sm py-2">
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
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Profile Information</h2>
              
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center border-b border-gray-200 py-3">
                  <span className="text-gray-600 font-medium sm:w-1/4">Name</span>
                  <span className="sm:w-2/4">{user.name}</span>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center border-b border-gray-200 py-3">
                  <span className="text-gray-600 font-medium sm:w-1/4">Email</span>
                  <span className="sm:w-2/4">{user.email}</span>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center border-b border-gray-200 py-3">
                  <span className="text-gray-600 font-medium sm:w-1/4">Password</span>
                  <span className="sm:w-2/4">{user.password}</span>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center border-b border-gray-200 py-3">
                  <span className="text-gray-600 font-medium sm:w-1/4">Join Date</span>
                  <span className="sm:w-2/4">{user.joinDate}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleEditClick}
                className="px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition"
              >
                Update Profile
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Update Profile</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={editData.name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={editData.email}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input
                  type="password"
                  name="password"
                  value={editData.password}
                  onChange={handleInputChange}
                  placeholder="Leave blank to keep current"
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveChanges}
                className="px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Delete Account</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete your account? This action cannot be undone.</p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Success Modal */}
      {showDeleteSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 text-center">
            <CheckCircleIcon className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Account Deleted Successfully</h3>
            <p className="text-gray-600">You will be redirected to the home page.</p>
          </div>
        </div>
      )}

      {/* Success Messages */}
      {showSuccess && (
        <div className="fixed bottom-4 right-4 bg-emerald-500 text-white px-4 py-2 rounded-md shadow-lg z-50 flex items-center">
          <CheckCircleIcon className="h-5 w-5 mr-2" />
          Profile updated successfully!
        </div>
      )}

      {showImageSuccess && (
        <div className="fixed bottom-4 right-4 bg-emerald-500 text-white px-4 py-2 rounded-md shadow-lg z-50 flex items-center">
          <CheckCircleIcon className="h-5 w-5 mr-2" />
          Profile image uploaded successfully!
        </div>
      )}

      {errors.profilePhoto && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-md shadow-lg z-50 flex items-center">
          <XCircleIcon className="h-5 w-5 mr-2" />
          {errors.profilePhoto}
        </div>
      )}
    </div>
  );
}