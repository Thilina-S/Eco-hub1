import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";

export default function CheckoutPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [shippingInfo, setShippingInfo] = useState({
    name: "",
    address: "",
    city: "",
    contact: "",
  });
  const [errors, setErrors] = useState({});
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: "",
    expiryDate: "",
    securityCode: "",
    cardName: "",
    paymentMethod: "credit" // Default to credit card
  });
  const [paymentErrors, setPaymentErrors] = useState({});

  // Get cart and subtotal from navigation state
  const cart = state?.cart || [];
  const subtotal = state?.subtotal || 0;
  const shippingCost = 399.00;
  const total = subtotal + shippingCost;

  const handleInputChange = (e) => {
    setShippingInfo({ ...shippingInfo, [e.target.name]: e.target.value });
  };

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setPaymentInfo({ ...paymentInfo, [name]: value });
  };

  const validateShipping = () => {
    const newErrors = {};
    if (!shippingInfo.name.trim()) newErrors.name = "Name is required";
    if (!shippingInfo.address.trim()) newErrors.address = "Address is required";
    if (!shippingInfo.city.trim()) newErrors.city = "City is required";
    if (!shippingInfo.contact.trim()) newErrors.contact = "Contact number is required";
    else if (!/^\d{10}$/.test(shippingInfo.contact)) newErrors.contact = "Invalid contact number (10 digits required)";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePayment = () => {
    if (paymentInfo.paymentMethod === "cash") {
      return true; // No validation needed for cash on delivery
    }

    const newErrors = {};
    if (!paymentInfo.cardNumber.trim()) newErrors.cardNumber = "Card number is required";
    else if (!/^\d{16}$/.test(paymentInfo.cardNumber.replace(/\s/g, ''))) newErrors.cardNumber = "Invalid card number (16 digits required)";
    
    if (!paymentInfo.expiryDate.trim()) newErrors.expiryDate = "Expiry date is required";
    else if (!/^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(paymentInfo.expiryDate)) newErrors.expiryDate = "Invalid expiry date (MM/YY)";
    
    if (!paymentInfo.securityCode.trim()) newErrors.securityCode = "Security code is required";
    else if (!/^\d{3,4}$/.test(paymentInfo.securityCode)) newErrors.securityCode = "Invalid security code (3-4 digits required)";
    
    if (!paymentInfo.cardName.trim()) newErrors.cardName = "Card name is required";
    
    setPaymentErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (validateShipping()) {
      setShowModal(false);
    }
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    if (validateShipping() && validatePayment()) {
      // Process payment and show confirmation
      localStorage.removeItem("cart");
      setOrderConfirmed(true);
    }
  };

  useEffect(() => {
    if (orderConfirmed) {
      const timer = setTimeout(() => {
        navigate("/");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [orderConfirmed, navigate]);

  if (orderConfirmed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-white bg-green-600">
        <div className="p-8 text-center">
          <div className="relative flex items-center justify-center mb-6">
            <div className="absolute w-32 h-32 bg-green-700 rounded-full animate-ping"></div>
            <FaCheckCircle className="z-10 text-6xl text-white" />
          </div>
          <h2 className="mb-4 text-3xl font-bold">Order completed successfully.</h2>
          <p className="text-lg">You will be redirected to the home page shortly...</p>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0e1b13]">
        <div className="text-center">
          <h2 className="mb-4 text-xl font-semibold text-green-300">No items in cart</h2>
          <button
            onClick={() => navigate("/marketplace")}
            className="px-6 py-2 text-white bg-green-600 rounded hover:bg-green-500"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0e1b13] text-white font-sans p-4">
      <header className="mb-6 text-3xl font-bold text-center text-green-400">
        Eco Hub
      </header>

      <div className="grid max-w-6xl gap-8 mx-auto md:grid-cols-3">
        {/* Left Side */}
        <div className="space-y-6 md:col-span-2">
          {/* Account */}
          <div>
            <h2 className="mb-1 font-semibold text-green-300">Account</h2>
            <p>guest@example.com</p>
          </div>

          {/* Ship To */}
          <div>
            <h2 className="mb-1 font-semibold text-green-300">Ship to</h2>
            <button
              className="w-full text-left bg-[#153b29] px-4 py-2 rounded hover:bg-green-700 transition"
              onClick={() => setShowModal(true)}
            >
              {shippingInfo.name
                ? `${shippingInfo.name}, ${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.contact}`
                : "Click to add shipping information"}
            </button>
            {errors.general && <p className="mt-1 text-sm text-red-500">{errors.general}</p>}
          </div>

          {/* Shipping Method */}
          <div>
            <h2 className="mb-1 font-semibold text-green-300">Shipping method</h2>
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
            <h2 className="mb-4 text-lg font-bold text-green-300">Payment</h2>
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              {/* Payment Method Selection */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-4 border border-green-700 rounded">
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value="credit" 
                    checked={paymentInfo.paymentMethod === "credit"}
                    onChange={handlePaymentChange}
                  />
                  <span>Credit card</span>
                  <div className="flex gap-2 ml-auto">
                    <img src="https://img.icons8.com/color/32/visa.png" alt="Visa" />
                    <img src="https://img.icons8.com/color/32/mastercard.png" alt="Mastercard" />
                  </div>
                </div>

                <div className="flex items-center gap-2 p-4 border border-green-700 rounded">
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value="cash" 
                    checked={paymentInfo.paymentMethod === "cash"}
                    onChange={handlePaymentChange}
                  />
                  <span>Cash on Delivery</span>
                </div>
              </div>

              {/* Credit Card Form (only shown when credit card is selected) */}
              {paymentInfo.paymentMethod === "credit" && (
                <div className="p-4 space-y-4 border border-green-700 rounded">
                  <div>
                    <input
                      className="w-full bg-[#1c2b24] text-white p-2 rounded"
                      placeholder="Card number"
                      name="cardNumber"
                      value={paymentInfo.cardNumber}
                      onChange={handlePaymentChange}
                    />
                    {paymentErrors.cardNumber && <p className="mt-1 text-sm text-red-500">{paymentErrors.cardNumber}</p>}
                  </div>
                  <div className="flex gap-2">
                    <div className="w-1/2">
                      <input
                        className="w-full bg-[#1c2b24] text-white p-2 rounded"
                        placeholder="Expiration date (MM / YY)"
                        name="expiryDate"
                        value={paymentInfo.expiryDate}
                        onChange={handlePaymentChange}
                      />
                      {paymentErrors.expiryDate && <p className="mt-1 text-sm text-red-500">{paymentErrors.expiryDate}</p>}
                    </div>
                    <div className="w-1/2">
                      <input
                        className="w-full bg-[#1c2b24] text-white p-2 rounded"
                        placeholder="Security code"
                        name="securityCode"
                        value={paymentInfo.securityCode}
                        onChange={handlePaymentChange}
                      />
                      {paymentErrors.securityCode && <p className="mt-1 text-sm text-red-500">{paymentErrors.securityCode}</p>}
                    </div>
                  </div>
                  <div>
                    <input
                      className="w-full bg-[#1c2b24] text-white p-2 rounded"
                      placeholder="Name on card"
                      name="cardName"
                      value={paymentInfo.cardName || shippingInfo.name}
                      onChange={handlePaymentChange}
                    />
                    {paymentErrors.cardName && <p className="mt-1 text-sm text-red-500">{paymentErrors.cardName}</p>}
                  </div>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="accent-green-500" defaultChecked />
                    Use shipping address as billing address
                  </label>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Right Side - Summary */}
        <div className="border border-green-700 rounded p-6 space-y-4 bg-[#132c1f]">
          <h2 className="text-lg font-semibold">Order Summary</h2>
          {cart.map((item) => {
            const discountedPrice = item.price - (item.price * item.discount / 100);
            return (
              <div key={item.id} className="flex items-center gap-4">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-16 h-16 rounded"
                />
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-sm text-gray-400">Qty: {item.quantity}</p>
                </div>
                <span className="ml-auto">Rs {discountedPrice.toFixed(2)}</span>
              </div>
            );
          })}

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Discount code or gift card"
              className="w-full p-2 text-white bg-black border border-gray-700 rounded"
            />
            <button className="px-4 bg-green-700 rounded hover:bg-green-600">
              Apply
            </button>
          </div>

          <div className="pt-4 space-y-2 text-sm border-t">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>Rs {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>Rs {shippingCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-2 font-semibold border-t">
              <span>Total</span>
              <span className="text-lg text-green-300">Rs {total.toFixed(2)}</span>
            </div>
          </div>

          {/* Place Order Button moved here */}
          <button
            onClick={handlePaymentSubmit}
            className="w-full py-3 mt-4 font-semibold text-white bg-green-600 rounded hover:bg-green-500"
          >
            PLACE ORDER
          </button>
        </div>
      </div>

      {/* Modal for Shipping Form */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
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
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
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
                {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
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
                {errors.city && <p className="text-sm text-red-500">{errors.city}</p>}
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
                {errors.contact && <p className="text-sm text-red-500">{errors.contact}</p>}
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 rounded hover:bg-green-500"
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