import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BsFillEyeFill, BsFillEyeSlashFill } from "react-icons/bs";
import SignInImage from "/SignIn.png"; // Corrected image import

export default function SignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    setErrors({ ...errors, [e.target.id]: "" });
  };

  const validate = () => {
    let tempErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email) {
      tempErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      tempErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      tempErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      tempErrors.password = "Password must be at least 6 characters";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Store token and user data
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        setShowSuccessPopup(true);
        setTimeout(() => {
          navigate("/");
        }, 1500);
      } else {
        setErrors({ server: data.message || "Invalid credentials" });
      }
    } catch (error) {
      setErrors({ server: "Failed to connect to server" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-8 bg-gray-50">
      <div className="grid w-full max-w-6xl grid-cols-1 overflow-hidden bg-white rounded-lg shadow-lg md:grid-cols-2">
        {/* Left Image */}
        <div className="hidden w-full h-full md:block">
          <img
            src={SignInImage}
            alt="Login visual"
            className="object-cover w-full h-full"
          />
        </div>

        {/* Right Form */}
        <div className="flex flex-col justify-center p-8 sm:px-10">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <h2 className="text-3xl font-extrabold text-center text-gray-900">
              Login to your account
            </h2>
          </div>

          <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
            {errors.server && (
              <div className="p-2 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
                {errors.server}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Your Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  placeholder="name@gmail.com"
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Your Password
                </label>
                <div className="relative mt-1">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <BsFillEyeSlashFill className="w-5 h-5 text-gray-400" />
                    ) : (
                      <BsFillEyeFill className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                )}
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 ${
                    isLoading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {isLoading ? "Logging in..." : "Log In"}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="font-medium text-green-600 hover:text-green-500"
                >
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-2 text-sm text-right text-blue-600 hover:underline">
        <Link to="/forgot-password">Forgot password?</Link>
      </p>

      {showSuccessPopup && (
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center w-full h-screen bg-gray-500 bg-opacity-50">
          <div className="p-6 bg-white rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-green-600">
              Login Successful!
            </h3>
            <p className="mt-2 text-gray-700">You are now logged in.</p>
          </div>
        </div>
      )}
    </div>
  );
}
