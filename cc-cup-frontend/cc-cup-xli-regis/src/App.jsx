import React, { useState, useEffect } from 'react';
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardSkeleton from './components/DashboardSkeleton';
import LoginPage from './pages/LoginPage';
import SignupStep1Page from './pages/SignupStep1Page';
import SignupStep2Page from './pages/SignupStep2Page';
import DashboardPage from './pages/DashboardPage';
import RejectedPage from './pages/DashboardRejected';
import { isAuthenticated as checkToken, clearAuth, getDashboard } from './lib/api';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [teamStatus, setTeamStatus] = useState(null);
  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(true);

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
        clearAuth();
      }
      setLoading(false);
    }
    restoreSession();
  }, []);

  const handleLogin = (team) => {
    setIsAuthenticated(true);
    setTeamData(team);
    setTeamStatus(team?.regis_status || 'PENDING');
  };

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

  if (loading) {
    return <DashboardSkeleton />;
  }

  const resolvedStatus = teamStatus || 'PENDING';

  // Define the router instance with the basename option
  const router = createBrowserRouter(
    [
      {
        path: '/login',
        element: isAuthenticated ? (
          <Navigate to={resolvedStatus === 'REJECTED' ? '/rejected' : '/dashboard'} replace />
        ) : (
          <LoginPage onLogin={handleLogin} />
        ),
      },
      {
        path: '/signup',
        element: isAuthenticated ? (
          <Navigate to={resolvedStatus === 'REJECTED' ? '/rejected' : '/dashboard'} replace />
        ) : (
          <SignupStep1Page />
        ),
      },
      {
        path: '/signup/step2',
        element: isAuthenticated ? (
          <Navigate to={resolvedStatus === 'REJECTED' ? '/rejected' : '/dashboard'} replace />
        ) : (
          <SignupStep2Page onSignup={handleSignup} />
        ),
      },
      {
        element: (
          <ProtectedRoute
            isAuthenticated={isAuthenticated}
            teamStatus={resolvedStatus}
            allowedStatus="DASHBOARD"
          />
        ),
        children: [
          {
            path: '/dashboard',
            element: (
              <DashboardPage
                teamData={teamData}
                onTeamUpdate={setTeamData}
                onStatusChange={setTeamStatus}
                onLogout={handleLogout}
              />
            ),
          },
        ],
      },
      {
        element: (
          <ProtectedRoute
            isAuthenticated={isAuthenticated}
            teamStatus={resolvedStatus}
            allowedStatus="REJECTED"
          />
        ),
        children: [
          {
            path: '/rejected',
            element: <RejectedPage teamData={teamData} onLogout={handleLogout} />,
          },
        ],
      },
      {
        path: '*',
        element: (
          <Navigate
            to={
              isAuthenticated
                ? resolvedStatus === 'REJECTED'
                  ? '/rejected'
                  : '/dashboard'
                : '/login'
            }
            replace
          />
        ),
      },
    ],
    {
      basename: '/regis', // <-- Pass basename here!
    }
  );

  return <RouterProvider router={router} />;
}

export default App;