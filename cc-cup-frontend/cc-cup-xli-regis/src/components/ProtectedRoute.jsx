// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute({ allowedStatus, teamStatus, isAuthenticated }) {
  // 1. If user isn't logged in, redirect them immediately to the login gateway
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 2. If the team's account status is restricted, divert them strictly to the rejected panel
  if (teamStatus === 'REJECTED' && allowedStatus !== 'REJECTED') {
    return <Navigate to="/rejected" replace />;
  }

  // 3. Prevent banned/rejected teams from manually typing /dashboard in the URL bar
  if (teamStatus !== 'REJECTED' && allowedStatus === 'REJECTED') {
    return <Navigate to="/dashboard" replace />;
  }

  // Everything matches perfectly, allow react-router to render the requested child page
  return <Outlet />;
}