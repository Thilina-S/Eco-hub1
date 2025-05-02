import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Something went wrong");

      setMessage(data.message);
      setTimeout(() => {
        navigate("/signin");
      }, 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-md p-6 mx-auto mt-12 bg-white rounded-md shadow-md">
      <h2 className="mb-4 text-xl font-bold text-center">Reset Your Password</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          className="w-full p-2 mb-3 border rounded"
          placeholder="Enter new password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full p-2 text-white bg-green-600 rounded hover:bg-green-700"
        >
          Reset Password
        </button>
      </form>
      {message && <p className="mt-4 text-center text-green-600">{message}</p>}
      {error && <p className="mt-4 text-center text-red-600">{error}</p>}
    </div>
  );
}
