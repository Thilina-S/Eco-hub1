import React, { useState } from "react";

const initialProducts = [
  {
    title: "Versatile Sweatpants Hoodies Sportswear",
    price: 1738,
    discount: 78,
    image: "https://via.placeholder.com/150"
  },
  {
    title: "i12 TWS Wireless Bluetooth Earbuds",
    price: 790,
    discount: 76,
    image: "https://via.placeholder.com/150"
  },
  {
    title: "PulsePro Wireless Speaker",
    price: 3151,
    discount: 37,
    image: "https://via.placeholder.com/150"
  },
  {
    title: "4L Perfume Rose Flavor",
    price: 790,
    discount: 61,
    image: "https://via.placeholder.com/150"
  }
];

export default function ProductGrid() {
  const [products, setProducts] = useState(initialProducts);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    discount: "",
    image: null,
    imageUrl: ""
  });
  const [popupIndex, setPopupIndex] = useState(null);
  const [editIndex, setEditIndex] = useState(null);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      const file = files[0];
      setFormData({
        ...formData,
        image: file,
        imageUrl: URL.createObjectURL(file)
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleAddProduct = (e) => {
    e.preventDefault();
    const originalPrice = parseFloat(formData.price);
    const discount = parseFloat(formData.discount);
    const finalPrice = Math.round(originalPrice - (originalPrice * (discount / 100)));

    const newProduct = {
      title: formData.title,
      price: finalPrice,
      discount: discount,
      image: formData.imageUrl
    };

    if (editIndex !== null) {
      const updated = [...products];
      updated[editIndex] = newProduct;
      setProducts(updated);
      setEditIndex(null);
    } else {
      setProducts([...products, newProduct]);
    }

    setFormData({ title: "", price: "", discount: "", image: null, imageUrl: "" });
    setShowForm(false);
  };

  const handleDelete = (index) => {
    const updated = products.filter((_, i) => i !== index);
    setProducts(updated);
    setPopupIndex(null);
  };

  const handleEdit = (index) => {
    const product = products[index];
    const originalPrice = Math.round(product.price / (1 - product.discount / 100));
    setFormData({
      title: product.title,
      price: originalPrice,
      discount: product.discount,
      imageUrl: product.image
    });
    setEditIndex(index);
    setShowForm(true);
    setPopupIndex(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 px-6 py-8">
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-green-600">Suggestions For You</h1>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditIndex(null);
            setFormData({ title: "", price: "", discount: "", image: null, imageUrl: "" });
          }}
          className="bg-green-500 text-white px-4 py-2 rounded shadow hover:bg-green-600"
        >
          {showForm ? "Cancel" : "Add Post"}
        </button>
      </div>

      {/* Add Post Form */}
      {showForm && (
        <form onSubmit={handleAddProduct} className="bg-white p-4 rounded shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="title"
              placeholder="Title"
              value={formData.title}
              onChange={handleInputChange}
              className="border p-2 rounded w-full"
              required
            />
            <input
              type="number"
              name="price"
              placeholder="Original Price"
              value={formData.price}
              onChange={handleInputChange}
              className="border p-2 rounded w-full"
              required
            />
            <input
              type="number"
              name="discount"
              placeholder="Discount %"
              value={formData.discount}
              onChange={handleInputChange}
              className="border p-2 rounded w-full"
              min="0"
              max="100"
              required
            />
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleInputChange}
              className="border p-2 rounded w-full"
              required={!formData.imageUrl}
            />
          </div>
          <button
            type="submit"
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            {editIndex !== null ? "Update Post" : "Submit Post"}
          </button>
        </form>
      )}

      {/* Product Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {products.map((product, index) => {
          const isCustomAdded = index >= initialProducts.length;

          return (
            <div key={index} className="bg-white shadow p-3 rounded-lg relative">
              {isCustomAdded && (
                <div
                  className="absolute top-2 right-2 cursor-pointer"
                  onClick={() => setPopupIndex(popupIndex === index ? null : index)}
                >
                  <span className="text-xl">⋮</span>
                </div>
              )}
              {popupIndex === index && isCustomAdded && (
                <div className="absolute top-10 right-2 bg-white border border-green-300 shadow-lg rounded-xl p-3 z-10 w-56">
                  <p className="text-base font-semibold text-green-700 mb-2">{product.title}</p>
                  <p className="text-sm text-gray-700 mb-1">Price: Rs.{product.price}</p>
                  <p className="text-sm text-gray-700 mb-2">Discount: {product.discount}%</p>
                  <div className="flex justify-between">
                    <button
                      onClick={() => handleEdit(index)}
                      className="text-blue-600 font-medium text-sm hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(index)}
                      className="text-red-600 font-medium text-sm hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
              <img
                src={product.image}
                alt={product.title}
                className="w-full h-36 object-cover rounded"
              />
              <h2 className="text-sm font-medium mt-2 line-clamp-2">{product.title}</h2>
              <p className="text-green-600 font-semibold">Rs.{product.price}</p>
              <p className="text-sm text-gray-500">-{product.discount}%</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
