// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import OwnerDashboard from './pages/OwnerDashboard';
import DashboardLayout from './components/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute role="ADMIN">
          <DashboardLayout role="ADMIN">
             <Outlet />
          </DashboardLayout>
        </ProtectedRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminDashboard view="users" />} />
        <Route path="stores" element={<AdminDashboard view="stores" />} />
      </Route>

      {/* Owner Routes */}
      <Route path="/owner" element={
        <ProtectedRoute role="OWNER">
          <DashboardLayout role="OWNER">
            <Outlet />
          </DashboardLayout>
        </ProtectedRoute>
      }>
        <Route index element={<OwnerDashboard />} />
        <Route path="settings" element={<OwnerDashboard view="settings" />} />
      </Route>

      {/* User Routes */}
      <Route path="/user" element={
        <ProtectedRoute role="USER">
          <DashboardLayout role="USER">
             <Outlet />
          </DashboardLayout>
        </ProtectedRoute>
      }>
        <Route index element={<UserDashboard />} />
        <Route path="ratings" element={<UserDashboard view="ratings" />} />
        <Route path="settings" element={<UserDashboard view="settings" />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;