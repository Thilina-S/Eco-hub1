import React, { useState, useEffect } from "react";
import { FaHeart, FaShoppingCart } from "react-icons/fa";

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
  const [message, setMessage] = useState("");
  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    if (message) {
      const timeout = setTimeout(() => setMessage(""), 3000);
      return () => clearTimeout(timeout);
    }
  }, [message]);

  const showPopup = (msg) => setMessage(msg);

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
      showPopup("Post updated successfully!");
      setEditIndex(null);
    } else {
      setProducts([...products, newProduct]);
      showPopup("Post added successfully!");
    }

    setFormData({ title: "", price: "", discount: "", image: null, imageUrl: "" });
    setShowForm(false);
  };

  const handleDelete = (index) => {
    const updated = products.filter((_, i) => i !== index);
    setProducts(updated);
    setPopupIndex(null);
    showPopup("Post deleted successfully!");
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

  const toggleWishlist = (index) => {
    if (wishlist.includes(index)) {
      setWishlist(wishlist.filter(i => i !== index));
    } else {
      setWishlist([...wishlist, index]);
    }
  };

  const toggleCart = (index) => {
    if (cart.includes(index)) {
      setCart(cart.filter(i => i !== index));
    } else {
      setCart([...cart, index]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 px-6 py-8 relative">
      {/* Popup */}
      {message && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow z-50 transition-all duration-300">
          {message}
        </div>
      )}

      {/* Top Bar */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-green-600">Suggestions For You</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <FaHeart className="text-red-500 text-xl cursor-pointer" />
            {wishlist.length > 0 && (
              <span className="absolute -top-2 -right-2 text-xs bg-red-500 text-white rounded-full px-1">
                {wishlist.length}
              </span>
            )}
          </div>
          <div className="relative">
            <FaShoppingCart className="text-blue-600 text-xl cursor-pointer" />
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 text-xs bg-blue-600 text-white rounded-full px-1">
                {cart.length}
              </span>
            )}
          </div>
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

              {/* Wishlist & Cart Icons */}
              <div className="absolute bottom-2 right-2 flex gap-3">
                <FaHeart
                  onClick={() => toggleWishlist(index)}
                  className={`cursor-pointer text-lg ${
                    wishlist.includes(index) ? "text-red-500" : "text-gray-400"
                  }`}
                />
                <FaShoppingCart
                  onClick={() => toggleCart(index)}
                  className={`cursor-pointer text-lg ${
                    cart.includes(index) ? "text-blue-600" : "text-gray-400"
                  }`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
