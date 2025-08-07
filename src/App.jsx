import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import LoginScreen from "./components/LoginScreen";
import ClubCoordinatorPortal from "./components/ClubCoordinatorPortal";
import CSAPortal from "./components/CSAPortal";

const getStoredUser = () => {
  try {
    const stored = localStorage.getItem("swd_user");
    return stored ? JSON.parse(stored).user : null;
  } catch (err) {
    return null;
  }
};

const App = () => {
  const [user, setUser] = useState(() => getStoredUser());
  const [userRole, setUserRole] = useState(() => getStoredUser()?.role || null);
  const navigate = useNavigate();

  const handleLogin = (userData) => {
    setUser(userData);
    setUserRole(userData.role);
    localStorage.setItem("swd_user", JSON.stringify({ user: userData }));

    if (userData.role === "club") {
      navigate("/club_portal");
    } else if (userData.role === "csa") {
      navigate("/csa_portal");
    } else {
      navigate("/unauthorized");
    }
  };

  const handleLogout = () => {
    setUser(null);
    setUserRole(null);
    localStorage.removeItem("swd_user");
    navigate("/"); // go back to login
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          user ? (
            userRole === "club" ? (
              <Navigate to="/club_portal" replace />
            ) : userRole === "csa" ? (
              <Navigate to="/csa_portal" replace />
            ) : (
              <Navigate to="/unauthorized" replace />
            )
          ) : (
            <LoginScreen onLogin={handleLogin} />
          )
        }
      />

      <Route
        path="/club_portal"
        element={
          user && userRole === "club" ? (
            <ClubCoordinatorPortal onBack={handleLogout} />
          ) : (
            <Navigate to="/unauthorized" replace />
          )
        }
      />

      <Route
        path="/csa_portal"
        element={
          user && userRole === "csa" ? (
            <CSAPortal onBack={handleLogout} />
          ) : (
            <Navigate to="/unauthorized" replace />
          )
        }
      />

      <Route
        path="/unauthorized"
        element={
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Unauthorized Access
              </h2>
              <p className="text-gray-600 mb-6">
                You don't have permission to access this portal.
              </p>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Back to Login
              </button>
            </div>
          </div>
        }
      />
    </Routes>
  );
};

export default App;
