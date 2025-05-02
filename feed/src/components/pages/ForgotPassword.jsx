import { useState } from "react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/request-reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Something went wrong");

      setMessage(data.message);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-md p-6 mx-auto mt-12 bg-white rounded-md shadow-md">
      <h2 className="mb-4 text-xl font-bold text-center">Forgot Password</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          className="w-full p-2 mb-3 border rounded"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full p-2 text-white bg-blue-600 rounded hover:bg-blue-700"
        >
          Send Reset Link
        </button>
      </form>
      {message && <p className="mt-4 text-center text-green-600">{message}</p>}
      {error && <p className="mt-4 text-center text-red-600">{error}</p>}
    </div>
  );
}
