import React, { useState, useEffect } from "react";
import { FaHeart, FaShoppingCart } from "react-icons/fa";

const initialProducts = [
  {
    title: " Leaf Rake",
    price: 1275,
    discount: 15,
    image: "../../../public/leaf-rake.jpg"
  },
  {
    title: "Rake",
    price: 1600,
    discount: 20,
    image: "../../../public/rake.jpg"
  },
  {
    title: "Recycle Bins",
    price: 2400,
    discount: 20,
    image: "../../../public/recycle bins.jpeg"
  },
  {
    title: "Vaccum Garbage Collector",
    price: 12750,
    discount: 15,
    image: "../../../public/vaccum garbage collector.jpeg"
  },
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
  const [showMyItems, setShowMyItems] = useState(false);

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

  const filteredProducts = showMyItems 
    ? products.filter((_, index) => index >= initialProducts.length)
    : products;

  return (
    <div className="relative min-h-screen px-6 py-8 bg-gray-100">
      {/* Popup */}
      {message && (
        <div className="fixed z-50 px-4 py-2 text-white transition-all duration-300 bg-green-500 rounded shadow top-4 right-4">
          {message}
        </div>
      )}

      {/* Top Bar */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-green-600">Suggestions For You</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <FaHeart className="text-xl text-red-500 cursor-pointer" />
            {wishlist.length > 0 && (
              <span className="absolute px-1 text-xs text-white bg-red-500 rounded-full -top-2 -right-2">
                {wishlist.length}
              </span>
            )}
          </div>
          <div className="relative">
            <FaShoppingCart className="text-xl text-blue-600 cursor-pointer" />
            {cart.length > 0 && (
              <span className="absolute px-1 text-xs text-white bg-blue-600 rounded-full -top-2 -right-2">
                {cart.length}
              </span>
            )}
          </div>
          <button
            onClick={() => setShowMyItems(!showMyItems)}
            className={`px-4 py-2 rounded shadow hover:bg-green-600 ${
              showMyItems ? "bg-green-600 text-white" : "bg-green-500 text-white"
            }`}
          >
            My Items
          </button>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditIndex(null);
              setFormData({ title: "", price: "", discount: "", image: null, imageUrl: "" });
            }}
            className="px-4 py-2 text-white bg-green-500 rounded shadow hover:bg-green-600"
          >
            {showForm ? "Cancel" : "Add Post"}
          </button>
        </div>
      </div>

      {/* Add Post Form */}
      {showForm && (
        <form onSubmit={handleAddProduct} className="p-4 mb-6 bg-white rounded shadow">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <input
              type="text"
              name="title"
              placeholder="Title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="number"
              name="price"
              placeholder="Original Price"
              value={formData.price}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="number"
              name="discount"
              placeholder="Discount %"
              value={formData.discount}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              min="0"
              max="100"
              required
            />
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required={!formData.imageUrl}
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 mt-4 text-white bg-green-600 rounded hover:bg-green-700"
          >
            {editIndex !== null ? "Update Post" : "Submit Post"}
          </button>
        </form>
      )}

      {/* Product Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {filteredProducts.map((product, index) => {
          // For filtered products, we need to find the original index to maintain wishlist/cart functionality
          const originalIndex = products.findIndex(p => p === product);
          const isCustomAdded = originalIndex >= initialProducts.length;

          return (
            <div key={originalIndex} className="relative p-3 bg-white rounded-lg shadow">
              {isCustomAdded && (
                <div
                  className="absolute cursor-pointer top-2 right-2"
                  onClick={() => setPopupIndex(popupIndex === originalIndex ? null : originalIndex)}
                >
                  <span className="text-xl">⋮</span>
                </div>
              )}
              {popupIndex === originalIndex && isCustomAdded && (
                <div className="absolute z-10 w-56 p-3 bg-white border border-green-300 shadow-lg top-10 right-2 rounded-xl">
                  <p className="mb-2 text-base font-semibold text-green-700">{product.title}</p>
                  <p className="mb-1 text-sm text-gray-700">Price: Rs.{product.price}</p>
                  <p className="mb-2 text-sm text-gray-700">Discount: {product.discount}%</p>
                  <div className="flex justify-between">
                    <button
                      onClick={() => handleEdit(originalIndex)}
                      className="text-sm font-medium text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(originalIndex)}
                      className="text-sm font-medium text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
              <img
                src={product.image}
                alt={product.title}
                className="object-cover w-full rounded h-36"
              />
              <h2 className="mt-2 text-sm font-medium line-clamp-2">{product.title}</h2>
              <p className="font-semibold text-green-600">Rs.{product.price}</p>
              <p className="text-sm text-gray-500">-{product.discount}%</p>

              {/* Wishlist & Cart Icons */}
              <div className="absolute flex gap-3 bottom-2 right-2">
                <FaHeart
                  onClick={() => toggleWishlist(originalIndex)}
                  className={`cursor-pointer text-lg ${
                    wishlist.includes(originalIndex) ? "text-red-500" : "text-gray-400"
                  }`}
                />
                <FaShoppingCart
                  onClick={() => toggleCart(originalIndex)}
                  className={`cursor-pointer text-lg ${
                    cart.includes(originalIndex) ? "text-blue-600" : "text-gray-400"
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