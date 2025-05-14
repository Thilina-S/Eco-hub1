import React, { useState, useEffect } from "react";
import { FaTrash } from "react-icons/fa";  // Import the FaTrash icon
import jsPDF from 'jspdf';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState("");

  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/products`);
        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        showPopup(error.message);
      }
    };
    fetchProducts();
  }, []);

  // Show popup message
  const showPopup = (msg) => setMessage(msg);

  // Delete product handler
  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/products/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete product');

      setProducts(products.filter((product) => product._id !== id));
      showPopup("Product deleted successfully!");
    } catch (error) {
      showPopup(error.message);
    }
  };

  // Search filter handler
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Filtered products based on search query
  const filteredProducts = products.filter((product) =>
    product?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Generate PDF function
  const generatePdf = () => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text("Product List", 14, 22);

    let y = 30;
    filteredProducts.forEach((product) => {
      doc.setFontSize(12);
      doc.text(`Title: ${product.title}`, 14, y);
      doc.text(`Price: Rs. ${product.price}`, 14, y + 6);
      doc.text(`Discount: ${product.discount}%`, 14, y + 12);
      doc.text(`Stock: ${product.stock}`, 14, y + 18);
      y += 30;
    });

    doc.save("products.pdf");
  };

  return (
    <div>
      {/* Notification message */}
      {message && (
        <div className="fixed z-50 px-4 py-2 text-white transition-all duration-300 bg-green-600 rounded shadow top-4 right-4">
          {message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col items-start justify-between mb-6 sm:flex-row sm:items-center">
        <h1 className="mb-4 text-2xl font-bold text-green-700 sm:mb-0">Products Management</h1>
        <div className="flex gap-4">
          <button
            onClick={generatePdf}
            className="px-4 py-2 text-white bg-[#006400] rounded shadow focus:outline-none"
          >
            Generate PDF
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by Title"
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* Table Container with horizontal scroll for small screens */}
      <div className="w-full overflow-x-auto bg-white rounded-lg shadow">
        {filteredProducts.length > 0 ? (
          <table className="w-full overflow-hidden">
            <thead>
              <tr className="text-white bg-green-700">
                <th className="p-3 text-left">Image</th>
                <th className="p-3 text-left">Title</th>
                <th className="p-3 text-left">Price (Rs.)</th>
                <th className="p-3 text-left">Discount (%)</th>
                <th className="p-3 text-left">Final Price (Rs.)</th>
                <th className="p-3 text-left">Stock</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => {
                const originalPrice = Math.round(
                  product.price / (1 - product.discount / 100)
                );

                return (
                  <tr key={product._id} className="border-b hover:bg-green-50">
                    <td className="p-3">
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        className="object-cover w-16 h-16 rounded"
                      />
                    </td>
                    <td className="p-3">{product.title}</td>
                    <td className="p-3">{originalPrice}</td>
                    <td className="p-3">{product.discount}</td>
                    <td className="p-3">{product.price}</td>
                    <td className="p-3">{product.stock}</td>
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => handleDelete(product._id)}
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
            <p className="mb-4 text-lg text-gray-600">No products found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;
