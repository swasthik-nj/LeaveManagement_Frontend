import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";
import { DEMO_ACCOUNTS, EMPLOYEES, LEAVE_REQUESTS, LEAVE_POLICIES } from "../data/demoData";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("leaveflow_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [employees, setEmployees] = useState([...EMPLOYEES]);
  const [leaveRequests, setLeaveRequests] = useState([...LEAVE_REQUESTS]);
  const [leavePolicies, setLeavePolicies] = useState([...LEAVE_POLICIES]);

  // Auth: Login
  const login = useCallback(async (email, password) => {
    // 1. Try real backend API
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (data.success && data.data?.user) {
        const u = data.data.user;
        const userData = {
          ...u,
          department: u.department || "",
          designation: u.designation || "",
        };
        if (data.data.accessToken) {
          localStorage.setItem("leaveflow_token", data.data.accessToken);
        }
        localStorage.setItem("leaveflow_user", JSON.stringify(userData));
        setUser(userData);
        return { success: true, user: userData };
      }
    } catch (err) {
      // Backend unreachable, fallback to demo accounts
    }

    // 2. Demo accounts fallback
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
    localStorage.setItem("leaveflow_user", JSON.stringify(userData));
    setUser(userData);
    return { success: true, user: userData };
  }, []);

  // Auth: Logout
  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch {
      // Ignore network errors on logout
    }
    localStorage.removeItem("leaveflow_token");
    localStorage.removeItem("leaveflow_user");
    setUser(null);
  }, []);

  // Sync leaves from MongoDB database
  useEffect(() => {
    if (!user) return;

    const fetchLeaves = async () => {
      try {
        const token = localStorage.getItem("leaveflow_token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        // If admin, fetch all pending + personal leaves; if employee, fetch /api/leaves/me
        const endpoint = user.role === "admin" ? "/api/approvals/pending" : "/api/leaves/me";
        const res = await fetch(endpoint, { headers, credentials: "include" });
        const data = await res.json();

        const items = data.data?.leaves || data.data?.requests;
        if (data.success && Array.isArray(items)) {
          const apiLeaves = items.map((l) => ({
            ...l,
            id: l._id || l.id,
            appliedDate: l.appliedDate ? l.appliedDate.split("T")[0] : "",
          }));

          setLeaveRequests((prev) => {
            const apiIds = new Set(apiLeaves.map((a) => a.id));
            const remaining = prev.filter((p) => !apiIds.has(p.id));
            return [...apiLeaves, ...remaining];
          });
        }
      } catch (err) {
        // Fallback to local data
      }
    };

    fetchLeaves();
  }, [user]);

  // Leave requests: Apply (saves to MongoDB)
  const addLeaveRequest = useCallback(async (requestData) => {
    const token = localStorage.getItem("leaveflow_token");
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    // 1. Send to real backend MongoDB API
    try {
      const res = await fetch("/api/leaves", {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({
          leaveType: requestData.leaveType,
          startDate: requestData.startDate,
          endDate: requestData.endDate,
          reason: requestData.reason,
          isHalfDay: !!requestData.isHalfDay,
        }),
      });

      const data = await res.json();
      if (data.success && data.data?.request) {
        const saved = data.data.request;
        const newReq = {
          ...saved,
          id: saved._id || saved.id,
          leaveTypeLabel: requestData.leaveTypeLabel || saved.leaveType,
          appliedDate: saved.appliedDate ? saved.appliedDate.split("T")[0] : new Date().toISOString().split("T")[0],
        };

        // Update state with deduplication (ensures it is NEVER added twice)
        setLeaveRequests((prev) => [newReq, ...prev.filter((r) => r.id !== newReq.id)]);
        return { success: true, request: newReq };
      } else {
        const errorMsg = data.message || (data.errors && data.errors[0]) || "Failed to submit leave request.";
        return { success: false, message: errorMsg };
      }
    } catch (err) {
      console.warn("Backend offline or request failed, fallback to local", err);
    }

    // 2. Local fallback if backend is offline
    const fallbackId = `LR-2024-${String(Date.now()).slice(-3)}`;
    const newRequest = {
      ...requestData,
      id: fallbackId,
      status: "pending",
      appliedDate: new Date().toISOString().split("T")[0],
      approvedBy: null,
      approvedDate: null,
      rejectionReason: null,
    };

    // Update state safely with deduplication
    setLeaveRequests((prev) => [newRequest, ...prev.filter((r) => r.id !== fallbackId)]);
    return { success: true, request: newRequest };
  }, []);

  // Cancel leave request
  const cancelLeaveRequest = useCallback(async (requestId) => {
    const token = localStorage.getItem("leaveflow_token");
    try {
      await fetch(`/api/leaves/${requestId}/cancel`, {
        method: "PATCH",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: "include",
      });
    } catch {
      // Local fallback
    }

    setLeaveRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: "cancelled" } : r))
    );
  }, []);

  // Approve leave request (Admin)
  const approveLeaveRequest = useCallback(async (requestId, approverName) => {
    const token = localStorage.getItem("leaveflow_token");
    try {
      await fetch(`/api/approvals/${requestId}/approve`, {
        method: "PATCH",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: "include",
      });
    } catch {
      // Local fallback
    }

    setLeaveRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
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

  // Reject leave request (Admin)
  const rejectLeaveRequest = useCallback(async (requestId, approverName, reason) => {
    const token = localStorage.getItem("leaveflow_token");
    try {
      await fetch(`/api/approvals/${requestId}/reject`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({ reason }),
      });
    } catch {
      // Local fallback
    }

    setLeaveRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
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
