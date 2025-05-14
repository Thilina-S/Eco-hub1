import React, { useState } from 'react';
import AdminNotice from './AdminComponents/AdminNotice';
import AdminUsers from './AdminComponents/AdminUsers';
import { 
  ChevronRight, 
  ChevronLeft, 
  Users, 
  FileText, 
  ShoppingBag, 
  Bell, 
  LogOut, 
  Settings, 
  Home, 
  BarChart2 
} from 'lucide-react';
import AdminPosts from './AdminComponents/AdminPosts';

// Main App Component
const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [adminImage, setAdminImage] = useState('/api/placeholder/150/150');
  const [adminEmail, setAdminEmail] = useState('admin@ecohub.com');
  
  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAdminImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  return (
    <div className="flex h-screen text-gray-800 bg-gray-100 dark:bg-gray-900 dark:text-gray-200">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-green-900 text-white transition-all duration-300 ease-in-out flex flex-col`}>
        {/* Logo and Toggle */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-green-800">
          <div className="flex items-center">
            {sidebarOpen && (
              <span className="text-xl font-bold text-green-100">EcoHub</span>
            )}
            {!sidebarOpen && <span className="text-xl font-bold text-green-100">E</span>}
          </div>
          <button onClick={toggleSidebar} className="p-1 rounded-full hover:bg-green-800 focus:outline-none">
            {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>
        
        {/* Admin Profile */}
        <div className={`flex ${sidebarOpen ? 'flex-row' : 'flex-col'} items-center p-4 border-b border-green-800`}>
          <div className="relative">
            <img
              src={adminImage}
              alt="Admin"
              className="object-cover w-12 h-12 border-2 border-green-500 rounded-full"
            />
            <label htmlFor="upload-image" className="absolute p-1 bg-green-600 rounded-full cursor-pointer -right-1 -bottom-1 hover:bg-green-500">
              <Settings size={14} />
              <input
                type="file"
                id="upload-image"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </label>
          </div>
          {sidebarOpen && (
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium truncate">{adminEmail}</p>
              <p className="text-xs text-green-300">Administrator</p>
            </div>
          )}
        </div>
        
        {/* Navigation Menu */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="px-2 space-y-2">
            <NavItem 
              icon={<Home />} 
              title="Dashboard" 
              active={activeMenu === 'dashboard'} 
              onClick={() => setActiveMenu('dashboard')} 
              sidebarOpen={sidebarOpen} 
            />
            <NavItem 
              icon={<Users />} 
              title="Users" 
              active={activeMenu === 'users'} 
              onClick={() => setActiveMenu('users')} 
              sidebarOpen={sidebarOpen} 
            />
            <NavItem 
              icon={<FileText />} 
              title="Posts" 
              active={activeMenu === 'posts'} 
              onClick={() => setActiveMenu('posts')} 
              sidebarOpen={sidebarOpen} 
            />
            <NavItem 
              icon={<ShoppingBag />} 
              title="Orders" 
              active={activeMenu === 'orders'} 
              onClick={() => setActiveMenu('orders')} 
              sidebarOpen={sidebarOpen} 
            />
            <NavItem 
              icon={<Bell />} 
              title="Manage Notice" 
              active={activeMenu === 'notice'} 
              onClick={() => setActiveMenu('notice')} 
              sidebarOpen={sidebarOpen} 
            />
          </ul>
        </nav>
        
        {/* Logout Button */}
        <div className="p-4 border-t border-green-800">
          <button 
            onClick={() => alert('Logout clicked')} 
            className={`flex items-center ${sidebarOpen ? 'justify-start w-full' : 'justify-center'} px-4 py-2 text-white rounded-lg hover:bg-green-800 transition-colors`}
          >
            <LogOut size={20} />
            {sidebarOpen && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between h-16 px-6 bg-white shadow-md dark:bg-gray-800">
          <h1 className="text-xl font-bold text-green-800 dark:text-green-400">
            {activeMenu.charAt(0).toUpperCase() + activeMenu.slice(1)}
          </h1>
          <div className="flex items-center space-x-4">
            <button className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white">
              <Settings size={20} />
            </button>
          </div>
        </header>
        
        {/* Main Content Area */}
        <main className="flex-1 p-6 overflow-y-auto">
          {activeMenu === 'dashboard' && <DashboardContent />}
          {activeMenu === 'users' && <AdminUsers />}
          {activeMenu === 'posts' && <AdminPosts />}
          {activeMenu === 'orders' && <OrdersContent />}
          {activeMenu === 'notice' && <AdminNotice />}
        </main>
      </div>
    </div>
  );
};

// Navigation Item Component
const NavItem = ({ icon, title, active, onClick, sidebarOpen }) => {
  return (
    <li>
      <button
        onClick={onClick}
        className={`flex items-center ${sidebarOpen ? 'justify-start w-full' : 'justify-center'} px-4 py-2 rounded-lg transition-colors ${
          active ? 'bg-green-700 text-white' : 'text-green-200 hover:bg-green-800'
        }`}
      >
        {icon}
        {sidebarOpen && <span className="ml-3">{title}</span>}
      </button>
    </li>
  );
};

// Content Components for each section
const DashboardContent = () => {
  const stats = [
    { title: 'Total Users', value: '3,456', icon: <Users size={24} /> },
    { title: 'Total Posts', value: '245', icon: <FileText size={24} /> },
    { title: 'Total Orders', value: '1,245', icon: <ShoppingBag size={24} /> },
    { title: 'Revenue', value: '$24,500', icon: <BarChart2 size={24} /> },
  ];
  
  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold">Dashboard Overview</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <div key={index} className="flex items-center p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
            <div className="p-3 mr-4 text-green-800 bg-green-100 rounded-full dark:bg-green-900 dark:text-green-300">
              {stat.icon}
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Recent Activity Chart (placeholder) */}
      <div className="p-6 mb-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <h3 className="mb-4 text-lg font-semibold">Recent Activity</h3>
        <div className="flex items-center justify-center h-64 bg-gray-200 rounded dark:bg-gray-700">
          <p className="text-gray-500 dark:text-gray-400">Activity Chart Placeholder</p>
        </div>
      </div>
      
      {/* Recent Orders Section */}
      <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <h3 className="mb-4 text-lg font-semibold">Recent Orders</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">Order ID</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">Customer</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">Date</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">Amount</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {[1, 2, 3, 4, 5].map((item) => (
                <tr key={item} className="hover:bg-gray-100 dark:hover:bg-gray-750">
                  <td className="px-6 py-4 text-sm whitespace-nowrap">#ORD-{1000 + item}</td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap">Customer {item}</td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap">2025-04-{item < 10 ? '0' + item : item}</td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap">${Math.floor(Math.random() * 500) + 10}.00</td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      item % 3 === 0 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 
                      item % 3 === 1 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                      'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    }`}>
                      {item % 3 === 0 ? 'Pending' : item % 3 === 1 ? 'Completed' : 'Processing'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

< AdminUsers />



const OrdersContent = () => {
    const orders = [
      { id: '1001', customer: 'John Smith', date: '2025-04-01', amount: '$245.00', status: 'Completed' },
      { id: '1002', customer: 'Sarah Johnson', date: '2025-04-01', amount: '$125.50', status: 'Processing' },
      { id: '1003', customer: 'Michael Brown', date: '2025-03-31', amount: '$349.99', status: 'Completed' },
      { id: '1004', customer: 'Emily Davis', date: '2025-03-31', amount: '$89.00', status: 'Pending' },
      { id: '1005', customer: 'David Wilson', date: '2025-03-30', amount: '$178.25', status: 'Completed' },
      { id: '1006', customer: 'Jessica Taylor', date: '2025-03-30', amount: '$220.00', status: 'Processing' },
    ];
    
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Orders Management</h2>
          <button className="flex items-center px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700">
            <ShoppingBag size={16} className="mr-2" /> Create New Order
          </button>
        </div>
        
        <div className="overflow-hidden bg-white rounded-lg shadow-md dark:bg-gray-800">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="w-64">
              <input
                type="text"
                placeholder="Search orders..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700"
              />
            </div>
            <div className="flex space-x-2">
              <select className="px-3 py-2 border border-gray-300 rounded-md dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700">
                <option>All Status</option>
                <option>Pending</option>
                <option>Processing</option>
                <option>Completed</option>
                <option>Cancelled</option>
              </select>
              <input
                type="date"
                className="px-3 py-2 border border-gray-300 rounded-md dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700"
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">Order ID</th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">Customer</th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">Date</th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">Amount</th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">Status</th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-100 dark:hover:bg-gray-750">
                    <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">#{order.id}</td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap">{order.customer}</td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap">{order.date}</td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap">{order.amount}</td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        order.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                        order.status === 'Processing' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 
                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="flex px-6 py-4 space-x-2 text-sm font-medium whitespace-nowrap">
                      <button className="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400">View</button>
                      <button className="text-green-600 hover:text-green-900 dark:hover:text-green-400">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Showing <span className="font-medium">1</span> to <span className="font-medium">6</span> of <span className="font-medium">6</span> results
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
  
  const NoticeContent = () => {
    const notices = [
      { id: 1, title: 'System Maintenance', content: 'Scheduled maintenance on April 5th, 2025 from 2:00 AM to 4:00 AM', status: 'Active', date: '2025-04-01' },
      { id: 2, title: 'New Features', content: 'New dashboard features have been deployed', status: 'Active', date: '2025-03-28' },
      { id: 3, title: 'Holiday Notice', content: 'Office will be closed on April 10th for holiday', status: 'Inactive', date: '2025-03-25' },
      { id: 4, title: 'Policy Update', content: 'Updated privacy policy effective April 15th', status: 'Active', date: '2025-03-22' },
    ];
    
    const [newNotice, setNewNotice] = useState({
      title: '',
      content: '',
      status: 'Active'
    });
    
    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setNewNotice(prev => ({ ...prev, [name]: value }));
    };
    
    const handleSubmit = (e) => {
      e.preventDefault();
      alert(`New notice created: ${JSON.stringify(newNotice)}`);
      setNewNotice({ title: '', content: '', status: 'Active' });
    };
    
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Notice Management</h2>
          <button 
            className="flex items-center px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
            onClick={() => document.getElementById('create-notice-modal').showModal()}
          >
            <Bell size={16} className="mr-2" /> Create New Notice
          </button>
        </div>
        
        < AdminNotice />
        
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
                  <tr key={notice.id} className="hover:bg-gray-100 dark:hover:bg-gray-750">
                    <td className="px-6 py-4 text-sm whitespace-nowrap">{notice.id}</td>
                    <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">{notice.title}</td>
                    <td className="max-w-xs px-6 py-4 text-sm truncate">{notice.content}</td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        notice.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {notice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap">{notice.date}</td>
                    <td className="flex px-6 py-4 space-x-2 text-sm font-medium whitespace-nowrap">
                      <button className="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400">View</button>
                      <button className="text-green-600 hover:text-green-900 dark:hover:text-green-400">Edit</button>
                      <button className="text-red-600 hover:text-red-900 dark:hover:text-red-400">Delete</button>
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
  
  export default AdminDashboard;