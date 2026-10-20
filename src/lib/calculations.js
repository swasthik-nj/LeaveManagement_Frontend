/**
 * Calculate leave balance for a specific leave type
 */
export function calculateLeaveBalance(leaveRequests, leaveType, totalEntitlement) {
  const approvedDays = leaveRequests
    .filter(r => r.leaveType === leaveType && r.status === "approved")
    .reduce((sum, r) => sum + r.days, 0);

  const pendingDays = leaveRequests
    .filter(r => r.leaveType === leaveType && r.status === "pending")
    .reduce((sum, r) => sum + r.days, 0);

  return {
    total: totalEntitlement,
    used: approvedDays,
    pending: pendingDays,
    available: totalEntitlement - approvedDays,
    projected: totalEntitlement - approvedDays - pendingDays,
  };
}

/**
 * Calculate all leave balances from requests and policy
 */
export function calculateAllBalances(leaveRequests, policies) {
  return policies.map(policy => ({
    ...policy,
    balance: calculateLeaveBalance(leaveRequests, policy.type, policy.totalDays),
  }));
}

/**
 * Get summary statistics for an employee
 */
export function getEmployeeSummary(leaveRequests, policies) {
  const balances = calculateAllBalances(leaveRequests, policies);
  
  const totalAvailable = balances.reduce((sum, b) => sum + b.balance.available, 0);
  const totalUsed = balances.reduce((sum, b) => sum + b.balance.used, 0);
  const totalEntitlement = balances.reduce((sum, b) => sum + b.balance.total, 0);
  const pendingRequests = leaveRequests.filter(r => r.status === "pending").length;
  
  const upcomingLeave = leaveRequests
    .filter(r => r.status === "approved" && new Date(r.startDate) >= new Date())
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

  return {
    totalAvailable,
    totalUsed,
    totalEntitlement,
    pendingRequests,
    upcomingLeave,
    balances,
  };
}

/**
 * Get admin dashboard statistics
 */
export function getAdminStats(allRequests, employees) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const pendingApprovals = allRequests.filter(r => r.status === "pending").length;

  const onLeaveToday = allRequests.filter(r => {
    if (r.status !== "approved") return false;
    const start = new Date(r.startDate);
    const end = new Date(r.endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    return start <= today && end >= today;
  }).length;

  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const requestsThisMonth = allRequests.filter(r => {
    const d = new Date(r.appliedDate);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).length;

  const activeEmployees = employees.filter(e => e.status === "active").length;

  return {
    totalEmployees: activeEmployees,
    pendingApprovals,
    onLeaveToday,
    requestsThisMonth,
  };
}

/**
 * Get monthly leave trend data for charts
 */
export function getMonthlyTrends(requests, year) {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  return months.map((month, idx) => {
    const monthRequests = requests.filter(r => {
      const d = new Date(r.appliedDate);
      return d.getMonth() === idx && d.getFullYear() === year;
    });

    return {
      month,
      approved: monthRequests.filter(r => r.status === "approved").reduce((s, r) => s + r.days, 0),
      rejected: monthRequests.filter(r => r.status === "rejected").length,
      pending: monthRequests.filter(r => r.status === "pending").length,
      total: monthRequests.length,
    };
  });
}

/**
 * Get leave distribution by type
 */
export function getLeaveDistribution(requests) {
  const dist = {};
  requests
    .filter(r => r.status === "approved")
    .forEach(r => {
      dist[r.leaveType] = (dist[r.leaveType] || 0) + r.days;
    });
  
  return Object.entries(dist).map(([type, days]) => ({
    type,
    days,
    label: type.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()),
  }));
}

/**
 * Get department-wise leave usage
 */
export function getDepartmentUsage(requests, employees) {
  const deptMap = {};
  employees.forEach(emp => {
    if (!deptMap[emp.department]) {
      deptMap[emp.department] = { department: emp.department, totalDays: 0, employees: 0 };
    }
    deptMap[emp.department].employees++;
  });

  requests
    .filter(r => r.status === "approved")
    .forEach(r => {
      const emp = employees.find(e => e.id === r.employeeId);
      if (emp && deptMap[emp.department]) {
        deptMap[emp.department].totalDays += r.days;
      }
    });

  return Object.values(deptMap).map(d => ({
    ...d,
    avgPerEmployee: d.employees > 0 ? Math.round((d.totalDays / d.employees) * 10) / 10 : 0,
  }));
}

/**
 * Convert data to CSV string
 */
export function toCSV(data, columns) {
  const escapeCSV = (val) => {
    const str = String(val ?? "");
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const header = columns.map(c => escapeCSV(c.label)).join(",");
  const rows = data.map(row =>
    columns.map(c => escapeCSV(c.accessor(row))).join(",")
  );

  return [header, ...rows].join("\n");
}

/**
 * Download a string as a file
 */
export function downloadFile(content, filename, mimeType = "text/csv") {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
