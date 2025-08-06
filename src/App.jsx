import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginScreen from './components/LoginScreen';
import ClubCoordinatorPortal from './components/ClubCoordinatorPortal';
import CSAPortal from './components/CSAPortal';

const App = () => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);

  const handleLogin = () => {
    // Mock user data after OAuth
    const mockUser = {
      id: '1',
      name: 'John Doe',
      email: 'f20230000@goa.bits-pilani.ac.in',
    };
    
    setUser(mockUser);
    
    // TODO: Implement email verification logic here

    // For now, using simple email check
    if (mockUser.email.includes('f20230000@goa.bits-pilani.ac.in')) {
      setUserRole('club-coordinator');
    } else {
      setUserRole('csa-member');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setUserRole(null);
  };

  const handleBackToLogin = () => {
    setUser(null);
    setUserRole(null);
  };

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/club-coordinator" 
          element={
            userRole === 'club-coordinator' ? (
              <ClubCoordinatorPortal onBack={handleBackToLogin} />
            ) : (
              <Navigate to="/unauthorized" replace />
            )
          } 
        />
        <Route 
          path="/csa-portal" 
          element={
            userRole === 'csa-member' ? (
              <CSAPortal onBack={handleBackToLogin} />
            ) : (
              <Navigate to="/unauthorized" replace />
            )
          } 
        />
        <Route 
          path="/" 
          element={
            userRole === 'club-coordinator' ? (
              <Navigate to="/club-coordinator" replace />
            ) : userRole === 'csa-member' ? (
              <Navigate to="/csa-portal" replace />
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
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Unauthorized Access</h2>
                <p className="text-gray-600 mb-6">You don't have permission to access this portal.</p>
                <button
                  onClick={handleBackToLogin}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Back to Login
                </button>
              </div>
            </div>
          } 
        />
      </Routes>
    </Router>
  );
};

export default App; 