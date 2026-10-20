import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import { DEMO_ACCOUNTS, EMPLOYEES, LEAVE_REQUESTS, LEAVE_POLICIES } from "../data/demoData";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [employees, setEmployees] = useState([...EMPLOYEES]);
  const [leaveRequests, setLeaveRequests] = useState([...LEAVE_REQUESTS]);
  const [leavePolicies, setLeavePolicies] = useState([...LEAVE_POLICIES]);
  const [nextRequestId, setNextRequestId] = useState(17);

  // Auth
  const login = useCallback((email, password) => {
    const account = DEMO_ACCOUNTS.find(
      (a) => a.email === email && a.password === password
    );
    if (!account) return { success: false, message: "Invalid email or password" };

    const employee = EMPLOYEES.find((e) => e.id === account.employeeId);
    const userData = {
      ...account,
      department: employee?.department || "",
      designation: employee?.designation || "",
    };
    setUser(userData);
    return { success: true, user: userData };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  // Leave requests
  const addLeaveRequest = useCallback((request) => {
    setNextRequestId((prev) => {
      const id = `LR-2024-${String(prev).padStart(3, "0")}`;
      const employeeData = employees.find((e) => e.id === request.employeeId);
      const newRequest = {
        ...request,
        id,
        employeeName: employeeData?.name || request.employeeName || "",
        department: employeeData?.department || request.department || "",
        status: "pending",
        appliedDate: new Date().toISOString().split("T")[0],
        approvedBy: null,
        approvedDate: null,
        rejectionReason: null,
      };
      setLeaveRequests((prev) => [newRequest, ...prev]);
      return prev + 1;
    });
  }, [employees]);

  const cancelLeaveRequest = useCallback((requestId) => {
    setLeaveRequests((prev) =>
      prev.map((r) =>
        r.id === requestId && r.status === "pending"
          ? { ...r, status: "cancelled" }
          : r
      )
    );
  }, []);

  const approveLeaveRequest = useCallback((requestId, approverName) => {
    setLeaveRequests((prev) =>
      prev.map((r) =>
        r.id === requestId && r.status === "pending"
          ? {
              ...r,
              status: "approved",
              approvedBy: approverName,
              approvedDate: new Date().toISOString().split("T")[0],
            }
          : r
      )
    );
  }, []);

  const rejectLeaveRequest = useCallback((requestId, approverName, reason) => {
    setLeaveRequests((prev) =>
      prev.map((r) =>
        r.id === requestId && r.status === "pending"
          ? {
              ...r,
              status: "rejected",
              approvedBy: approverName,
              approvedDate: new Date().toISOString().split("T")[0],
              rejectionReason: reason,
            }
          : r
      )
    );
  }, []);

  // Employees
  const addEmployee = useCallback((employee) => {
    const id = `emp-${String(employees.length + 1).padStart(3, "0")}`;
    const employeeId = `EMP-${1000 + employees.length + 1}`;
    setEmployees((prev) => [
      ...prev,
      { ...employee, id, employeeId, status: "active", avatar: null },
    ]);
  }, [employees.length]);

  const updateEmployee = useCallback((id, updates) => {
    setEmployees((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
    );
  }, []);

  // Policies
  const updatePolicy = useCallback((policyId, updates) => {
    setLeavePolicies((prev) =>
      prev.map((p) => (p.id === policyId ? { ...p, ...updates } : p))
    );
  }, []);

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
      isAuthenticated: !!user,
      isAdmin: user?.role === "admin",
      employees,
      leaveRequests,
      leavePolicies,
      addLeaveRequest,
      cancelLeaveRequest,
      approveLeaveRequest,
      rejectLeaveRequest,
      addEmployee,
      updateEmployee,
      updatePolicy,
    }),
    [user, employees, leaveRequests, leavePolicies, login, logout, addLeaveRequest, cancelLeaveRequest, approveLeaveRequest, rejectLeaveRequest, addEmployee, updateEmployee, updatePolicy]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
