import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div className="p-4 text-red-500">Something went wrong. Please try again.</div>;
    }
    return this.props.children;
  }
}

export default function Profile() {
  const [user, setUser] = useState({
    name: '',
    email: '',
    password: '********',
    joinDate: '',
    profilePhoto: null
  });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [showImageSuccess, setShowImageSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('token');
            navigate('/login');
          }
          throw new Error(`Request failed: ${response.status}`);
        }

        const data = await response.json();
        setUser({
          name: data.user?.name || '',
          email: data.user?.email || '',
          password: '********',
          joinDate: data.user?.joinDate ? new Date(data.user.joinDate).toLocaleDateString() : 'N/A',
          profilePhoto: data.user?.profilePhoto || null
        });
      } catch (error) {
        console.error('Profile fetch error:', error);
        setErrors({ api: 'Unable to load profile data. Please try again.' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const validateForm = () => {
    const newErrors = {};
    if (!editData.name?.trim()) newErrors.name = 'Name is required';
    if (!editData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(editData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (editData.password && editData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEditClick = () => {
    setEditData({
      name: user.name || '',
      email: user.email || '',
      password: ''
    });
    setErrors({});
    setIsEditModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
    setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleSaveChanges = async () => {
    if (!validateForm()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editData.name,
          email: editData.email,
          password: editData.password || undefined
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Update failed');
      }

      const data = await response.json();
      setUser({
        ...user,
        name: data.user?.name || '',
        email: data.user?.email || '',
        password: '********',
        profilePhoto: data.user?.profilePhoto || user.profilePhoto
      });
      setIsEditModalOpen(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Update error:', error);
      setErrors({ api: 'Unable to update profile. Please try again.' });
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/profile`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Account deletion failed');
      }

      localStorage.removeItem('token');
      setShowDeleteConfirm(false);
      setShowDeleteSuccess(true);
      setTimeout(() => navigate('/'), 2000);
    } catch (error) {
      console.error('Delete error:', error);
      setErrors({ api: 'Unable to delete account. Please try again.' });
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setErrors({ ...errors, profilePhoto: null });

    if (!file.type.match('image.*')) {
      setErrors({ ...errors, profilePhoto: 'Please select an image file' });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setErrors({ ...errors, profilePhoto: 'File size should be less than 2MB' });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('profilePhoto', file);

      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/profile/photo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload photo');
      }

      const data = await response.json();

      setUser(prev => ({
        ...prev,
        profilePhoto: data.profilePhoto
      }));
      setShowImageSuccess(true);
      setTimeout(() => setShowImageSuccess(false), 3000);
    } catch (error) {
      console.error('Upload error:', error);
      setErrors({ ...errors, profilePhoto: 'Unable to upload photo. Please try again.' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 rounded-full border-emerald-500 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar */}
        <div className="w-64 py-8 text-white bg-gray-800">
          <h2 className="text-2xl font-semibold text-center">Dashboard</h2>
          <nav className="mt-8">
            <ul>
              <li>
                <button 
                  className="w-full py-2 pl-6 text-left hover:bg-gray-700"
                  onClick={() => navigate('/myposts')}
                >
                  My Posts
                </button>
              </li>
              <li>
                <button 
                  className="w-full py-2 pl-6 text-left hover:bg-gray-700"
                  onClick={() => navigate('/myitems')}
                >
                  My Listed Items
                </button>
              </li>
              <li>
                <button 
                  className="w-full py-2 pl-6 text-left hover:bg-gray-700"
                  onClick={() => navigate('/myorders')}
                >
                  My Orders
                </button>
              </li>
              <li>
                <button 
                  className="w-full py-2 pl-6 text-left hover:bg-gray-700"
                  onClick={() => navigate('/notices')}
                >
                  Notices
                </button>
              </li>
              <li>
                <button 
                  className="w-full py-2 pl-6 text-left hover:bg-gray-700"
                  onClick={() => {
                    localStorage.removeItem('token');
                    navigate('/login');
                  }}
                >
                  Logout
                </button>
              </li>
            </ul>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 px-4 py-12 sm:px-6 lg:px-8">
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
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '';
                        // Fixed the error here - safer way to handle this without referencing classList
                        const fallbackDiv = e.target.parentElement?.querySelector('div');
                        if (fallbackDiv) {
                          fallbackDiv.classList.remove('hidden');
                        }
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-4xl text-gray-600 bg-gray-200">
                      {user.name ? user.name.charAt(0).toUpperCase() : '?'}
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
                <h1 className="mt-4 text-2xl font-bold text-white">{user.name || 'User'}</h1>
                <p className="text-emerald-100">{user.email || 'No email provided'}</p>
              </div>

              {/* Profile Details */}
              <div className="px-6 py-8">
                <div className="mb-8">
                  <h2 className="mb-4 text-xl font-semibold text-gray-800">Profile Information</h2>
                  
                  <div className="space-y-4">
                    <div className="flex flex-col py-3 border-b border-gray-200 sm:flex-row sm:items-center">
                      <span className="font-medium text-gray-600 sm:w-1/4">Name</span>
                      <span className="sm:w-2/4">{user.name || 'Not provided'}</span>
                    </div>
                    
                    <div className="flex flex-col py-3 border-b border-gray-200 sm:flex-row sm:items-center">
                      <span className="font-medium text-gray-600 sm:w-1/4">Email</span>
                      <span className="sm:w-2/4">{user.email || 'Not provided'}</span>
                    </div>
                    
                    <div className="flex flex-col py-3 border-b border-gray-200 sm:flex-row sm:items-center">
                      <span className="font-medium text-gray-600 sm:w-1/4">Password</span>
                      <span className="sm:w-2/4">{user.password}</span>
                    </div>
                    
                    <div className="flex flex-col py-3 border-b border-gray-200 sm:flex-row sm:items-center">
                      <span className="font-medium text-gray-600 sm:w-1/4">Member Since</span>
                      <span className="sm:w-2/4">{user.joinDate || 'N/A'}</span>
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

                {errors.api && (
                  <div className="p-3 mt-4 text-sm text-red-600 rounded-md bg-red-50">
                    {errors.api}
                  </div>
                )}

                {errors.profilePhoto && (
                  <div className="p-3 mt-4 text-sm text-red-600 rounded-md bg-red-50">
                    {errors.profilePhoto}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Edit Modal */}
          {isEditModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-600 bg-opacity-50">
              <div className="w-full max-w-lg p-8 bg-white rounded-lg">
                <h2 className="text-xl font-semibold text-gray-800">Edit Profile</h2>
                <form className="mt-4">
                  <div>
                    <label htmlFor="name" className="text-sm font-medium text-gray-600">Name</label>
                    <input 
                      id="name" 
                      name="name" 
                      type="text" 
                      value={editData.name || ''} 
                      onChange={handleInputChange} 
                      className="w-full p-2 mt-1 border border-gray-300 rounded-md"
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                  </div>

                  <div className="mt-4">
                    <label htmlFor="email" className="text-sm font-medium text-gray-600">Email</label>
                    <input 
                      id="email" 
                      name="email" 
                      type="email" 
                      value={editData.email || ''} 
                      onChange={handleInputChange} 
                      className="w-full p-2 mt-1 border border-gray-300 rounded-md"
                    />
                    {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                  </div>

                  <div className="mt-4">
                    <label htmlFor="password" className="text-sm font-medium text-gray-600">New Password</label>
                    <input 
                      id="password" 
                      name="password" 
                      type="password" 
                      placeholder="Leave blank to keep current"
                      value={editData.password || ''} 
                      onChange={handleInputChange} 
                      className="w-full p-2 mt-1 border border-gray-300 rounded-md"
                    />
                    {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
                  </div>

                  <div className="mt-4">
                    <button 
                      type="button" 
                      onClick={handleSaveChanges} 
                      className="w-full px-4 py-2 text-white rounded-md bg-emerald-500"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>

                <div className="mt-4 text-right">
                  <button 
                    onClick={() => setIsEditModalOpen(false)} 
                    className="text-sm text-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-600 bg-opacity-50">
              <div className="w-full max-w-md p-6 bg-white rounded-lg">
                <h2 className="text-xl font-semibold text-gray-800">Confirm Account Deletion</h2>
                <p className="mt-4 text-gray-600">Are you sure you want to delete your account? This action cannot be undone.</p>
                
                <div className="flex justify-end gap-4 mt-6">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
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

          {/* Success Notifications */}
          {showSuccess && (
            <div className="fixed p-4 text-white bg-green-500 rounded-md shadow-lg bottom-4 right-4">
              <div className="flex items-center">
                <CheckCircleIcon className="w-5 h-5 mr-2" />
                Profile updated successfully!
              </div>
            </div>
          )}

          {showImageSuccess && (
            <div className="fixed p-4 text-white bg-green-500 rounded-md shadow-lg bottom-4 right-4">
              <div className="flex items-center">
                <CheckCircleIcon className="w-5 h-5 mr-2" />
                Profile photo updated successfully!
              </div>
            </div>
          )}

          {showDeleteSuccess && (
            <div className="fixed p-4 text-white bg-red-500 rounded-md shadow-lg bottom-4 right-4">
              <div className="flex items-center">
                <CheckCircleIcon className="w-5 h-5 mr-2" />
                Account deleted successfully.
              </div>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}