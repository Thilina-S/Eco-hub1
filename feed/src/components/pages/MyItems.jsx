import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function MyItems() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [message, setMessage] = useState("");
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    discount: "",
    image: null,
    imageUrl: "",
    stock: "", // Added stock field
  });
  const [formErrors, setFormErrors] = useState({});

  // Load products from localStorage
  useEffect(() => {
    const savedProducts = localStorage.getItem("products");
    if (savedProducts) {
      const allProductsList = JSON.parse(savedProducts);
      setAllProducts(allProductsList);
      
      // Only get custom added products (those after the first 5 initial products)
      const customProducts = allProductsList.slice(5);
      setProducts(customProducts);
    }
  }, []);

  // Clear message after 3 seconds
  useEffect(() => {
    if (message) {
      const timeout = setTimeout(() => setMessage(""), 3000);
      return () => clearTimeout(timeout);
    }
  }, [message]);

  const showPopup = (msg) => setMessage(msg);

  const handleDelete = (index) => {
    // Need to get all products first
    const realIndex = index + 5; // to account for initial products
    const updatedAllProducts = allProducts.filter((_, i) => i !== realIndex);
    
    // Save back to localStorage
    localStorage.setItem("products", JSON.stringify(updatedAllProducts));
    
    // Update states
    setAllProducts(updatedAllProducts);
    setProducts(products.filter((_, i) => i !== index));
    showPopup("Item deleted successfully!");
  };

  const handleUpdateClick = (index) => {
    const product = products[index];
    const originalPrice = Math.round(
      product.price / (1 - product.discount / 100)
    );
    
    setFormData({
      title: product.title,
      price: originalPrice,
      discount: product.discount,
      imageUrl: product.image,
      stock: product.stock, // Set stock in formData
    });
    
    setSelectedProduct(index);
    setShowUpdateModal(true);
    setFormErrors({});
  };

  const handleAddNewClick = () => {
    setFormData({
      title: "",
      price: "",
      discount: "",
      image: null,
      imageUrl: "",
      stock: "", // Initialize stock field
    });
    setShowAddModal(true);
    setFormErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      if (files && files[0]) {
        const file = files[0];
        setFormData({
          ...formData,
          image: file,
          imageUrl: URL.createObjectURL(file),
        });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.title.trim()) {
      errors.title = "Title is required";
    }
    
    if (!formData.price) {
      errors.price = "Price is required";
    } else if (isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      errors.price = "Price must be a positive number";
    }
    
    if (!formData.discount) {
      errors.discount = "Discount is required";
    } else if (
      isNaN(formData.discount) || 
      parseFloat(formData.discount) < 0 || 
      parseFloat(formData.discount) > 100
    ) {
      errors.discount = "Discount must be between 0 and 100";
    }
    
    if (!formData.imageUrl && !formData.image) {
      errors.image = "Image is required";
    }

    if (!formData.stock) {
      errors.stock = "Stock is required";
    } else if (isNaN(formData.stock) || parseInt(formData.stock) < 0) {
      errors.stock = "Stock must be a non-negative integer";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Calculate the final price
    const originalPrice = parseFloat(formData.price);
    const discount = parseFloat(formData.discount);
    const finalPrice = Math.round(
      originalPrice - originalPrice * (discount / 100)
    );

    const updatedProduct = {
      title: formData.title,
      price: finalPrice,
      discount: discount,
      image: formData.imageUrl,
      reviews: products[selectedProduct].reviews || [],
      stock: parseInt(formData.stock), // Update stock here
    };

    // The real index is selectedProduct + 5 (to account for initial products)
    const realIndex = selectedProduct + 5;
    const updatedAllProducts = [...allProducts];
    updatedAllProducts[realIndex] = updatedProduct;
      
    // Save back to localStorage
    localStorage.setItem("products", JSON.stringify(updatedAllProducts));
    
    // Update states
    setAllProducts(updatedAllProducts);
    const newProducts = [...products];
    newProducts[selectedProduct] = updatedProduct;
    setProducts(newProducts);
    
    setShowUpdateModal(false);
    showPopup("Item updated successfully!");
  };

  const handleAddProduct = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Calculate the final price
    const originalPrice = parseFloat(formData.price);
    const discount = parseFloat(formData.discount);
    const finalPrice = Math.round(
      originalPrice - originalPrice * (discount / 100)
    );

    const newProduct = {
      title: formData.title,
      price: finalPrice,
      discount: discount,
      image: formData.imageUrl,
      reviews: [],
      stock: parseInt(formData.stock), // Add stock to new product
    };

    // Add to all products
    const updatedAllProducts = [...allProducts, newProduct];
    
    // Save back to localStorage
    localStorage.setItem("products", JSON.stringify(updatedAllProducts));
    
    // Update states
    setAllProducts(updatedAllProducts);
    setProducts([...products, newProduct]);
    
    setShowAddModal(false);
    showPopup("Item added successfully!");
    
    // Reset form
    setFormData({
      title: "",
      price: "",
      discount: "",
      image: null,
      imageUrl: "",
      stock: "", // Reset stock
    });
  };

  return (
    <div className="relative min-h-screen px-6 py-8 bg-gray-100">
      {/* Notification message */}
      {message && (
        <div className="fixed z-50 px-4 py-2 text-white transition-all duration-300 bg-green-600 rounded shadow top-4 right-4">
          {message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col items-start justify-between mb-6 sm:flex-row sm:items-center">
        <h1 className="mb-4 text-2xl font-bold text-green-700 sm:mb-0">My Items</h1>
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/marketplace')}
            className="px-4 py-2 text-white bg-green-500 rounded shadow hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Back to Marketplace
          </button>
          <button
            onClick={handleAddNewClick}
            className="px-4 py-2 text-white bg-green-600 rounded shadow hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Add New Item
          </button>
        </div>
      </div>

      {/* Table Container with horizontal scroll for small screens */}
      <div className="w-full overflow-x-auto bg-white rounded-lg shadow">
        {products.length > 0 ? (
          <table className="w-full overflow-hidden">
            <thead>
              <tr className="text-white bg-green-700">
                <th className="p-3 text-left">Image</th>
                <th className="p-3 text-left">Title</th>
                <th className="p-3 text-left">Price (Rs.)</th>
                <th className="p-3 text-left">Discount (%)</th>
                <th className="p-3 text-left">Final Price (Rs.)</th>
                <th className="p-3 text-left">Stock</th> {/* Added Stock column */}
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => {
                const originalPrice = Math.round(
                  product.price / (1 - product.discount / 100)
                );
                
                return (
                  <tr key={index} className="border-b hover:bg-green-50">
                    <td className="p-3">
                      <img
                        src={product.image}
                        alt={product.title}
                        className="object-cover w-16 h-16 rounded"
                      />
                    </td>
                    <td className="p-3">{product.title}</td>
                    <td className="p-3">{originalPrice}</td>
                    <td className="p-3">{product.discount}</td>
                    <td className="p-3">{product.price}</td>
                    <td className="p-3">{product.stock}</td> {/* Display Stock */}
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => handleUpdateClick(index)}
                          className="p-2 text-white bg-blue-600 rounded-full hover:bg-blue-700 focus:outline-none"
                          aria-label="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(index)}
                          className="p-2 text-white bg-red-600 rounded-full hover:bg-red-700 focus:outline-none"
                          aria-label="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="flex flex-col items-center justify-center p-8">
            <p className="mb-4 text-lg text-gray-600">You haven't added any items yet.</p>
            <button
              onClick={handleAddNewClick}
              className="px-4 py-2 text-white bg-green-600 rounded shadow hover:bg-green-700 focus:outline-none"
            >
              Add Your First Item
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Item Modal */}
      {(showAddModal || showUpdateModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-96">
            <form
              onSubmit={showAddModal ? handleAddProduct : handleUpdate}
              className="p-6"
            >
              <h2 className="mb-4 text-xl font-bold text-green-700">
                {showAddModal ? "Add New Item" : "Edit Item"}
              </h2>

              <div className="mb-4">
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700"
                >
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full p-3 mt-1 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                {formErrors.title && <span className="text-sm text-red-500">{formErrors.title}</span>}
              </div>

              <div className="mb-4">
                <label
                  htmlFor="price"
                  className="block text-sm font-medium text-gray-700"
                >
                  Price (Rs.)
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full p-3 mt-1 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                {formErrors.price && <span className="text-sm text-red-500">{formErrors.price}</span>}
              </div>

              <div className="mb-4">
                <label
                  htmlFor="discount"
                  className="block text-sm font-medium text-gray-700"
                >
                  Discount (%) 
                </label>
                <input
                  type="number"
                  id="discount"
                  name="discount"
                  value={formData.discount}
                  onChange={handleInputChange}
                  className="w-full p-3 mt-1 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                {formErrors.discount && <span className="text-sm text-red-500">{formErrors.discount}</span>}
              </div>

              <div className="mb-4">
                <label
                  htmlFor="stock"
                  className="block text-sm font-medium text-gray-700"
                >
                  Available Stock
                </label>
                <input
                  type="number"
                  id="stock"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  className="w-full p-3 mt-1 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                {formErrors.stock && <span className="text-sm text-red-500">{formErrors.stock}</span>}
              </div>

              <div className="mb-4">
                <label
                  htmlFor="image"
                  className="block text-sm font-medium text-gray-700"
                >
                  Image
                </label>
                <input
                  type="file"
                  id="image"
                  name="image"
                  accept="image/*"
                  onChange={handleInputChange}
                  className="w-full p-3 mt-1 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                {formErrors.image && <span className="text-sm text-red-500">{formErrors.image}</span>}
              </div>

              <div className="flex justify-between gap-4">
                <button
                  type="submit"
                  className="px-6 py-2 text-white bg-green-600 rounded-lg focus:outline-none"
                >
                  {showAddModal ? "Add Item" : "Update Item"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setShowUpdateModal(false);
                  }}
                  className="px-6 py-2 text-white bg-gray-600 rounded-lg focus:outline-none"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
