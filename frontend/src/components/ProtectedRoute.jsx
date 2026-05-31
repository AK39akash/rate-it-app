import React from 'react';
import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");
  let user = null;

  try {
    user = userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    console.error("Failed to parse user from local storage", e);
    // If user data is corrupted, clear it? Or just let it fail to login.
  }

  // Not authenticated
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Role check if specific role validation is required
  if (role && user.role?.toUpperCase() !== role.toUpperCase()) {
    console.warn(`Access denied. Required: ${role}, Current: ${user.role}`);
    return <Navigate to="/login" replace />;
  }

  // If wrapping child components directly
  return children ? children : <Outlet />;
}
