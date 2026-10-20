import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "@/context/AppContext";
import { Toaster } from "sonner";

// Layout & Core
import AppLayout from "@/components/layout/AppLayout";

// Auth Pages
import Login from "@/pages/Login";
import Register from "@/pages/Register";

// Employee Pages
import EmployeeDashboard from "@/pages/EmployeeDashboard";
import ApplyLeave from "@/pages/ApplyLeave";
import MyLeaveRequests from "@/pages/MyLeaveRequests";
import LeaveHistory from "@/pages/LeaveHistory";
import LeaveBalance from "@/pages/LeaveBalance";

// Admin Pages
import AdminDashboard from "@/pages/AdminDashboard";
import LeaveApprovals from "@/pages/LeaveApprovals";
import EmployeeManagement from "@/pages/EmployeeManagement";
import LeavePolicies from "@/pages/LeavePolicies";
import Reports from "@/pages/Reports";

// Role-based route guard for Admin pages
function AdminRoute({ children }) {
  const { user, isAdmin } = useApp();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Authenticated Workspace Shell */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Employee Routes */}
        <Route path="/dashboard" element={<EmployeeDashboard />} />
        <Route path="/apply-leave" element={<ApplyLeave />} />
        <Route path="/leave-requests" element={<MyLeaveRequests />} />
        <Route path="/leave-history" element={<LeaveHistory />} />
        <Route path="/leave-balance" element={<LeaveBalance />} />

        {/* Admin Console Routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/approvals"
          element={
            <AdminRoute>
              <LeaveApprovals />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/employees"
          element={
            <AdminRoute>
              <EmployeeManagement />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/policies"
          element={
            <AdminRoute>
              <LeavePolicies />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <AdminRoute>
              <Reports />
            </AdminRoute>
          }
        />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Toaster position="top-right" richColors />
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}
