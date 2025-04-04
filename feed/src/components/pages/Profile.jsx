import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

  // Handle logout
  const handleLogout = () => {
    // Perform logout logic (like clearing sessionStorage or localStorage, etc.)
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen px-4 py-12 bg-gray-50 sm:px-6 lg:px-8">
      {/* Sidebar */}
      <div className="w-1/4 px-6 py-8 text-white bg-gray-800">
        <h2 className="mb-8 text-xl font-bold">Dashboard</h2>
        <div className="space-y-4">
          <button
            onClick={() => navigate('/my-items')}
            className="w-full px-4 py-2 text-left rounded-md hover:bg-gray-700"
          >
            My Items
          </button>
          <button
            onClick={() => navigate('/my-posts')}
            className="w-full px-4 py-2 text-left rounded-md hover:bg-gray-700"
          >
            My Posts
          </button>
          <button
            onClick={() => navigate('/listed-items')}
            className="w-full px-4 py-2 text-left rounded-md hover:bg-gray-700"
          >
            Listed Items
          </button>
          <button
            onClick={() => navigate('/my-orders')}
            className="w-full px-4 py-2 text-left rounded-md hover:bg-gray-700"
          >
            My Orders
          </button>
          <button
            onClick={() => navigate('/notices')}
            className="w-full px-4 py-2 text-left rounded-md hover:bg-gray-700"
          >
            Notices
          </button>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 mt-8 text-left bg-red-500 rounded-md hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Profile Content */}
      <div className="w-3/4 max-w-3xl mx-auto">
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
    </div>
  );
}