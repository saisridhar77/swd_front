import React, { useState } from "react";
import { Users } from "lucide-react";
import axios from "axios";

const LoginScreen = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Please fill in both fields.");
      return;
    }

    try {
      const response = await axios.post(
        "https://merchportalswd-796324132621.asia-south1.run.app/api/auth/login",
        {
          username: username,
          password: password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Store the complete response data including token
      localStorage.setItem("swd_user", JSON.stringify(response.data.data));

      onLogin({
        username: response.data.data.user.username,
        role: response.data.data.user.role,
        token: response.data.data.token, // Include token in user data
      });
    } catch (error) {
      if (error.response) {
        setError(error.response.data.message || "Invalid credentials");
      } else {
        setError("Network error. Please try again.");
      }
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              SWD Store Control Portal
            </h1>
            <p className="text-gray-600">Access your dashboard by signing in</p>
          </div>

          <form
            onSubmit={handleLogin}
            className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
          >
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Sign in to continue
              </h2>
            </div>

            {error && (
              <p className="text-sm text-red-600 mb-4 text-center">{error}</p>
            )}

            <div className="mb-4">
              <label className="block text-sm text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="Never Gonna Give You Up"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-all"
            >
              Login
            </button>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                By signing in, you agree to our Terms of Service and Privacy
                Policy
              </p>
            </div>
          </form>
        </div>
      </div>
      <footer class="w-full border-t border-gray-200 bg-gray-50 px-4 py-3 text-center text-sm text-gray-600">
  Made with ❤️ from 
  <span class="font-bold text-[#3aa6a1]"> Dev</span>
  <span class="font-bold text-[#24353f]">Soc</span>
</footer>
    </>
  );
};

export default LoginScreen;
