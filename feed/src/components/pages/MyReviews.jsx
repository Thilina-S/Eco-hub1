import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf'; // Import jsPDF

const MyReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState('');

  // Fetch product reviews from backend (assuming you have an endpoint for this)
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/reviews`);
        if (!response.ok) throw new Error('Failed to fetch reviews');
        const data = await response.json();
        setReviews(data);
      } catch (error) {
        setMessage(error.message);
      }
    };
    fetchReviews();
  }, []);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredReviews = reviews.filter((review) =>
    review.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    review.review.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Generate PDF function
  const generatePdf = () => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text("Product Reviews", 14, 22);

    let y = 30;
    filteredReviews.forEach((review) => {
      doc.setFontSize(12);
      doc.text(`Product: ${review.productName}`, 14, y);
      doc.text(`Review: ${review.review}`, 14, y + 6);
      doc.text(`Rating: ${review.rating} stars`, 14, y + 12);
      y += 30;
    });

    doc.save("reviews.pdf");
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
        <h1 className="mb-4 text-2xl font-bold text-green-700 sm:mb-0">My Reviews</h1>
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
          placeholder="Search by Product or Review"
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* Table Container */}
      <div className="w-full overflow-x-auto bg-white rounded-lg shadow">
        {filteredReviews.length > 0 ? (
          <table className="w-full overflow-hidden">
            <thead>
              <tr className="text-white bg-green-700">
                <th className="p-3 text-left">Product Name</th>
                <th className="p-3 text-left">Review</th>
                <th className="p-3 text-left">Rating</th>
              </tr>
            </thead>
            <tbody>
              {filteredReviews.map((review) => (
                <tr key={review._id} className="border-b hover:bg-green-50">
                  <td className="p-3">{review.productName}</td>
                  <td className="p-3">{review.review}</td>
                  <td className="p-3">{review.rating} stars</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex flex-col items-center justify-center p-8">
            <p className="mb-4 text-lg text-gray-600">No reviews available yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyReviews;
