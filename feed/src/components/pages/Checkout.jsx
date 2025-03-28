import React, { useState } from "react";

export default function CheckoutPage() {
  const [showModal, setShowModal] = useState(false);
  const [shippingInfo, setShippingInfo] = useState({
    name: "",
    address: "",
    city: "",
    contact: "",
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    setShippingInfo({ ...shippingInfo, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const newErrors = {};
    if (!shippingInfo.name) newErrors.name = "Name is required";
    if (!shippingInfo.address) newErrors.address = "Address is required";
    if (!shippingInfo.city) newErrors.city = "City is required";
    if (!shippingInfo.contact) newErrors.contact = "Contact number is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      setShowModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0e1b13] text-white font-sans p-4">
      <header className="text-center text-3xl font-bold text-green-400 mb-6">
        CARNAGE
      </header>

      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
        {/* Left Side */}
        <div className="md:col-span-2 space-y-6">
          {/* Account */}
          <div>
            <h2 className="font-semibold text-green-300 mb-1">Account</h2>
            <p>thilinasandamal678@gmail.com</p>
          </div>

          {/* Ship To */}
          <div>
            <h2 className="font-semibold text-green-300 mb-1">Ship to</h2>
            <button
              className="text-left bg-[#153b29] px-4 py-2 rounded hover:bg-green-700 transition"
              onClick={() => setShowModal(true)}
            >
              {shippingInfo.name
                ? `${shippingInfo.name}, ${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.contact}`
                : "Click to add shipping information"}
            </button>
          </div>

          {/* Shipping Method */}
          <div>
            <h2 className="font-semibold text-green-300 mb-1">Shipping method</h2>
            <p>Standard – Rs 399.00</p>
            <p className="text-sm text-gray-400">2-3 Business Days</p>
          </div>

          {/* News & Offers */}
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="accent-green-500" />
              Email me with news and offers
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="accent-green-500" />
              Text me with news and offers
            </label>
          </div>

          {/* Payment */}
          <div>
            <h2 className="font-bold text-lg text-green-300 mb-4">Payment</h2>
            <div className="border border-green-700 rounded p-4 space-y-4">
              <div className="flex items-center gap-2">
                <input type="radio" defaultChecked />
                <span>Credit card</span>
                <div className="ml-auto flex gap-2">
                  <img src="https://img.icons8.com/color/32/visa.png" alt="Visa" />
                  <img src="https://img.icons8.com/color/32/mastercard.png" alt="Mastercard" />
                </div>
              </div>

              <input
                className="w-full bg-[#1c2b24] text-white p-2 rounded"
                placeholder="Card number"
              />
              <div className="flex gap-2">
                <input
                  className="w-1/2 bg-[#1c2b24] text-white p-2 rounded"
                  placeholder="Expiration date (MM / YY)"
                />
                <input
                  className="w-1/2 bg-[#1c2b24] text-white p-2 rounded"
                  placeholder="Security code"
                />
              </div>
              <input
                className="w-full bg-[#1c2b24] text-white p-2 rounded"
                defaultValue={shippingInfo.name || "Name on card"}
              />
              <label className="flex items-center gap-2">
                <input type="checkbox" className="accent-green-500" defaultChecked />
                Use shipping address as billing address
              </label>
            </div>
          </div>
        </div>

        {/* Right Side - Summary */}
        <div className="border border-green-700 rounded p-6 space-y-4 bg-[#132c1f]">
          <div className="flex items-center gap-4">
            <img
              src="https://via.placeholder.com/60"
              alt="Mid Half Socks"
              className="w-16 h-16"
            />
            <div>
              <h3 className="font-semibold">Mid Half Socks</h3>
              <p className="text-sm text-gray-400">Sheer White</p>
            </div>
            <span className="ml-auto">Rs 1,250.00</span>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Discount code or gift card"
              className="w-full p-2 rounded bg-black border border-gray-700 text-white"
            />
            <button className="bg-green-700 px-4 rounded hover:bg-green-600">
              Apply
            </button>
          </div>

          <div className="border-t pt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>Rs 1,250.00</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>Rs 399.00</span>
            </div>
            <div className="flex justify-between font-semibold pt-2 border-t">
              <span>Total</span>
              <span className="text-lg text-green-300">LKR Rs 1,649.00</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Shipping Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-[#102018] rounded-lg p-6 w-[90%] max-w-md space-y-4">
            <h2 className="text-xl font-bold text-green-400">Shipping Info</h2>
            <form onSubmit={handleFormSubmit} className="space-y-3">
              <div>
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={shippingInfo.name}
                  onChange={handleInputChange}
                  className="w-full p-2 rounded bg-[#1b2e26] text-white"
                />
                {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
              </div>
              <div>
                <input
                  type="text"
                  name="address"
                  placeholder="Address"
                  value={shippingInfo.address}
                  onChange={handleInputChange}
                  className="w-full p-2 rounded bg-[#1b2e26] text-white"
                />
                {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
              </div>
              <div>
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  value={shippingInfo.city}
                  onChange={handleInputChange}
                  className="w-full p-2 rounded bg-[#1b2e26] text-white"
                />
                {errors.city && <p className="text-red-500 text-sm">{errors.city}</p>}
              </div>
              <div>
                <input
                  type="text"
                  name="contact"
                  placeholder="Contact Number"
                  value={shippingInfo.contact}
                  onChange={handleInputChange}
                  className="w-full p-2 rounded bg-[#1b2e26] text-white"
                />
                {errors.contact && <p className="text-red-500 text-sm">{errors.contact}</p>}
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-green-600 hover:bg-green-500"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
