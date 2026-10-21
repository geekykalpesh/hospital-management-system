import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShimmerStats, ShimmerTable } from '../components/common/Shimmer';

export const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { user, isAuthenticated, loading, role } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 space-y-6 max-w-6xl mx-auto">
        <div className="h-8 w-48 shimmer-wave rounded" />
        <ShimmerStats count={4} />
        <ShimmerTable rows={6} />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    // Redirect user to their own valid dashboard
    if (role === 'admin') return <Navigate to="/admin" replace />;
    if (role === 'doctor') return <Navigate to="/doctor" replace />;
    return <Navigate to="/patient" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
