// src/App.js

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/DashboardLayout';
import Dashboard from './pages/Dashboard';
import WorkOrderManagement from './pages/WorkOrderManagement';
import UserManagement from './pages/UserManagement';
import Login from './pages/Login'; // Ensure this import points to your updated Login.js
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="work-orders" element={<WorkOrderManagement />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default App;
