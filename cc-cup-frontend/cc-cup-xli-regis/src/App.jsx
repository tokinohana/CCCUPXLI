import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import SignupStep1Page from './pages/SignupStep1Page';
import SignupStep2Page from './pages/SignupStep2Page';
import DashboardPage from './pages/DashboardPage';
import RejectedPage from './pages/DashboardRejected';
import { isAuthenticated as checkToken, clearAuth, getDashboard } from './lib/api';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [teamStatus, setTeamStatus] = useState(null); // null = loading
  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount: restore session from stored JWT
  useEffect(() => {
    async function restoreSession() {
      if (!checkToken()) {
        setLoading(false);
        return;
      }
      try {
        const data = await getDashboard();
        setTeamData(data);
        setTeamStatus(data.regis_status);
        setIsAuthenticated(true);
      } catch {
        // Token invalid/expired - clear and stay on login
        clearAuth();
      }
      setLoading(false);
    }
    restoreSession();
  }, []);

  // Called by LoginPage after successful API login
  const handleLogin = (team) => {
    setIsAuthenticated(true);
    setTeamData(team);
    setTeamStatus(team?.regis_status || 'PENDING');
  };

  // Called by SignupStep2Page after successful registration
  const handleSignup = (team) => {
    setIsAuthenticated(true);
    setTeamData(team);
    setTeamStatus(team?.regis_status || 'PENDING');
  };

  const handleLogout = () => {
    clearAuth();
    setIsAuthenticated(false);
    setTeamData(null);
    setTeamStatus(null);
  };

  // Show a minimal loading screen while checking stored token
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-4 border-black border-t-yellow-400 rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Memuat...</p>
        </div>
      </div>
    );
  }

  const resolvedStatus = teamStatus || 'PENDING';

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to={resolvedStatus === 'REJECTED' ? '/rejected' : '/dashboard'} replace />
            ) : (
              <LoginPage onLogin={handleLogin} />
            )
          }
        />

        {/* Signup Step 1 */}
        <Route
          path="/signup"
          element={
            isAuthenticated ? (
              <Navigate to={resolvedStatus === 'REJECTED' ? '/rejected' : '/dashboard'} replace />
            ) : (
              <SignupStep1Page />
            )
          }
        />

        {/* Signup Step 2 */}
        <Route
          path="/signup/step2"
          element={
            isAuthenticated ? (
              <Navigate to={resolvedStatus === 'REJECTED' ? '/rejected' : '/dashboard'} replace />
            ) : (
              <SignupStep2Page onSignup={handleSignup} />
            )
          }
        />

        {/* Protected Dashboard Route */}
        <Route
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              teamStatus={resolvedStatus}
              allowedStatus="DASHBOARD"
            />
          }
        >
          <Route
            path="/dashboard"
            element={
              <DashboardPage
                teamData={teamData}
                onTeamUpdate={setTeamData}
                onStatusChange={setTeamStatus}
                onLogout={handleLogout}
              />
            }
          />
        </Route>

        {/* Protected Rejected Route */}
        <Route
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              teamStatus={resolvedStatus}
              allowedStatus="REJECTED"
            />
          }
        >
          <Route
            path="/rejected"
            element={<RejectedPage teamData={teamData} onLogout={handleLogout} />}
          />
        </Route>

        {/* Catch-all Routing Redirects */}
        <Route
          path="*"
          element={
            <Navigate
              to={
                isAuthenticated
                  ? (resolvedStatus === 'REJECTED' ? '/rejected' : '/dashboard')
                  : '/login'
              }
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
