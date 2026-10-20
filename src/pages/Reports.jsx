import React, { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  Download,
  Calendar,
  Users,
  CheckCircle2,
  TrendingUp,
  FileSpreadsheet,
  Building,
  PieChart
} from "lucide-react";

export default function Reports() {
  const { employees, leaveRequests, leavePolicies } = useApp();

  const [periodFilter, setPeriodFilter] = useState("2024");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  // Filtered requests
  const filteredRequests = useMemo(() => {
    return leaveRequests.filter((r) => {
      const year = r.startDate ? r.startDate.split("-")[0] : "";
      const matchesPeriod = periodFilter === "all" || year === periodFilter;
      const matchesDept = departmentFilter === "all" || r.department === departmentFilter;

      return matchesPeriod && matchesDept;
    });
  }, [leaveRequests, periodFilter, departmentFilter]);

  const approvedRequests = useMemo(() => {
    return filteredRequests.filter((r) => r.status === "approved");
  }, [filteredRequests]);

  // High-level analytics
  const analytics = useMemo(() => {
    const totalDaysTaken = approvedRequests.reduce((sum, r) => sum + (r.days || 0), 0);
    const avgDuration =
      approvedRequests.length > 0
        ? (totalDaysTaken / approvedRequests.length).toFixed(1)
        : "0.0";

    const totalDecisions = filteredRequests.filter((r) =>
      ["approved", "rejected"].includes(r.status)
    ).length;
    const approvalRate =
      totalDecisions > 0
        ? Math.round((approvedRequests.length / totalDecisions) * 100)
        : 100;

    // Type counts
    const typeCounts = {};
    approvedRequests.forEach((r) => {
      typeCounts[r.leaveTypeLabel || r.leaveType] =
        (typeCounts[r.leaveTypeLabel || r.leaveType] || 0) + (r.days || 0);
    });

    let topType = "N/A";
    let maxDays = 0;
    Object.entries(typeCounts).forEach(([name, count]) => {
      if (count > maxDays) {
        maxDays = count;
        topType = name;
      }
    });

    return {
      totalDaysTaken,
      avgDuration,
      approvalRate,
      topType,
      totalRequests: filteredRequests.length,
    };
  }, [filteredRequests, approvedRequests]);

  // Department statistics
  const departmentStats = useMemo(() => {
    const deptMap = {};

    employees.forEach((emp) => {
      const dept = emp.department || "Other";
      if (!deptMap[dept]) {
        deptMap[dept] = { name: dept, headcount: 0, daysTaken: 0, requestCount: 0 };
      }
      deptMap[dept].headcount += 1;
    });

    approvedRequests.forEach((r) => {
      const dept = r.department || "Other";
      if (!deptMap[dept]) {
        deptMap[dept] = { name: dept, headcount: 1, daysTaken: 0, requestCount: 0 };
      }
      deptMap[dept].daysTaken += r.days || 0;
      deptMap[dept].requestCount += 1;
    });

    return Object.values(deptMap).map((d) => ({
      ...d,
      avgPerEmployee:
        d.headcount > 0 ? (d.daysTaken / d.headcount).toFixed(1) : "0.0",
    }));
  }, [employees, approvedRequests]);

  // Leave Type Breakdown
  const typeBreakdown = useMemo(() => {
    const counts = {};
    let total = 0;

    approvedRequests.forEach((r) => {
      const label = r.leaveTypeLabel || r.leaveType;
      counts[label] = (counts[label] || 0) + (r.days || 0);
      total += r.days || 0;
    });

    return Object.entries(counts).map(([name, days]) => ({
      name,
      days,
      percentage: total > 0 ? Math.round((days / total) * 100) : 0,
    }));
  }, [approvedRequests]);

  // Export CSV
  const handleExportCSV = () => {
    if (approvedRequests.length === 0) return;

    const headers = ["Request ID", "Employee", "Department", "Leave Type", "Start Date", "End Date", "Days", "Approved By"];
    const rows = approvedRequests.map((r) => [
      r.id,
      `"${r.employeeName}"`,
      `"${r.department}"`,
      r.leaveTypeLabel,
      r.startDate,
      r.endDate,
      r.days,
      r.approvedBy || "Admin",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `leaveflow_report_${periodFilter}_${departmentFilter}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics & Reports</h1>
          <p className="text-sm text-muted-foreground">
            Aggregate workforce absenteeism insights, department utilization, and compliance metrics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={handleExportCSV}
            disabled={approvedRequests.length === 0}
          >
            <Download className="h-4 w-4" />
            Export Report CSV
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Period:</span>
            <Select value={periodFilter} onValueChange={setPeriodFilter}>
              <SelectTrigger className="w-[120px] h-9">
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="2024">Year 2024</SelectItem>
                <SelectItem value="2023">Year 2023</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Department:</span>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-[160px] h-9">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="Engineering">Engineering</SelectItem>
                <SelectItem value="Design">Design</SelectItem>
                <SelectItem value="Product">Product</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="Human Resources">HR</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="Sales">Sales</SelectItem>
                <SelectItem value="Operations">Operations</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Metric Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase">Total Days Utilized</p>
            <p className="text-2xl font-bold text-primary">{analytics.totalDaysTaken}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Across approved leaves</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Calendar className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase">Average Duration</p>
            <p className="text-2xl font-bold">{analytics.avgDuration} <span className="text-xs font-normal text-muted-foreground">days</span></p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Per approved request</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <TrendingUp className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase">Approval Rate</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{analytics.approvalRate}%</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Applications accepted</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase">Top Category</p>
            <p className="text-lg font-bold truncate max-w-[130px]">{analytics.topType}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Most consumed type</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <PieChart className="h-5 w-5" />
          </div>
        </Card>
      </div>

      {/* Department Breakdown & Type Composition */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Department Table (4 cols) */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Building className="h-4 w-4 text-primary" />
              <span>Department Utilization Summary</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Staff count and leave consumption by functional unit.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Department</TableHead>
                    <TableHead className="text-center">Staff</TableHead>
                    <TableHead className="text-center">Days Taken</TableHead>
                    <TableHead className="text-right">Avg / Staff</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departmentStats.map((dept) => (
                    <TableRow key={dept.name}>
                      <TableCell className="font-medium text-xs">{dept.name}</TableCell>
                      <TableCell className="text-center text-xs">{dept.headcount}</TableCell>
                      <TableCell className="text-center text-xs font-semibold">
                        {dept.daysTaken}d
                      </TableCell>
                      <TableCell className="text-right text-xs">
                        {dept.avgPerEmployee} days
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Leave Category Distribution (3 cols) */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <PieChart className="h-4 w-4 text-primary" />
              <span>Leave Category Share</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Percentage distribution of all taken leave days.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {typeBreakdown.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8">
                No leave days logged for this period.
              </p>
            ) : (
              typeBreakdown.map((item) => (
                <div key={item.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-muted-foreground">
                      {item.days} days ({item.percentage}%)
                    </span>
                  </div>
                  <Progress value={item.percentage} className="h-2" />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
