import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import StatusBadge from "@/components/shared/StatusBadge";
import {
  Users,
  Clock,
  CalendarCheck,
  UserCheck,
  Check,
  X,
  ArrowRight,
  TrendingUp,
  Building,
  ShieldCheck,
  AlertTriangle,
  ChevronRight,
  Calendar,
  Sparkles
} from "lucide-react";

export default function AdminDashboard() {
  const { user, employees, leaveRequests, approveLeaveRequest, rejectLeaveRequest } = useApp();
  const navigate = useNavigate();

  const [rejectingItem, setRejectingItem] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const pendingRequests = useMemo(() => {
    return leaveRequests.filter((r) => r.status === "pending");
  }, [leaveRequests]);

  const approvedRequests = useMemo(() => {
    return leaveRequests.filter((r) => r.status === "approved");
  }, [leaveRequests]);

  // Today's date check (or latest in demo timeframe, say current date)
  const activeEmployees = useMemo(() => {
    return employees.filter((e) => e.status === "active");
  }, [employees]);

  // Approvals queue
  const recentPending = useMemo(() => {
    return pendingRequests.slice(0, 5);
  }, [pendingRequests]);

  // Upcoming leaves (leaves with start date in future or currently active)
  const upcomingLeaves = useMemo(() => {
    return approvedRequests.slice(0, 5);
  }, [approvedRequests]);

  // Department distribution
  const departmentStats = useMemo(() => {
    const counts = {};
    employees.forEach((emp) => {
      const dept = emp.department || "Other";
      counts[dept] = (counts[dept] || 0) + 1;
    });

    const leaveCounts = {};
    leaveRequests.forEach((req) => {
      if (req.status === "approved") {
        const dept = req.department || "Other";
        leaveCounts[dept] = (leaveCounts[dept] || 0) + (req.days || 0);
      }
    });

    return Object.keys(counts).map((dept) => ({
      name: dept,
      employees: counts[dept],
      daysTaken: leaveCounts[dept] || 0,
    }));
  }, [employees, leaveRequests]);

  const handleApprove = (reqId) => {
    approveLeaveRequest(reqId, user?.name || "Admin");
  };

  const handleConfirmReject = async () => {
    if (rejectingItem) {
      await rejectLeaveRequest(
        rejectingItem.id,
        user?.name || "Admin",
        rejectReason.trim() || "Operational requirements prevent approval at this time."
      );
      setRejectingItem(null);
      setRejectReason("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Admin Operations Console</h1>
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
              Admin Access
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Welcome back, {user?.name}. Monitor team leave patterns, handle pending requests, and manage workforce capacity.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/admin/employees">
              <Users className="h-4 w-4 mr-1.5" />
              Manage Staff
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/admin/approvals">
              <Clock className="h-4 w-4 mr-1.5" />
              Review Queue ({pendingRequests.length})
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase">Active Workforce</p>
            <p className="text-2xl font-bold">{activeEmployees.length}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Across {departmentStats.length} departments</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Users className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase">Pending Approvals</p>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{pendingRequests.length}</p>
            <p className="text-[11px] text-amber-600/80 dark:text-amber-400/80 mt-0.5">Requires manager action</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Clock className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase">Approved Leaves</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{approvedRequests.length}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Total granted requests</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <CalendarCheck className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase">On Planned Leave</p>
            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{upcomingLeaves.length}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Scheduled upcoming</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <UserCheck className="h-5 w-5" />
          </div>
        </Card>
      </div>

      {/* Main Grid: Pending Approvals & Upcoming Staff Off */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Urgent Action Queue (4 cols) */}
        <Card className="lg:col-span-4">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <span>Pending Approvals Queue</span>
                {pendingRequests.length > 0 && (
                  <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">
                    {pendingRequests.length}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="text-xs">
                Directly approve or reject requests awaiting your decision.
              </CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm" className="gap-1 text-xs">
              <Link to="/admin/approvals">
                View All <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentPending.length === 0 ? (
              <div className="text-center py-10 border rounded-lg border-dashed">
                <CalendarCheck className="mx-auto h-8 w-8 text-emerald-600 mb-2" />
                <p className="text-sm font-medium">All caught up!</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  There are no pending leave requests requiring review.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentPending.map((req) => (
                  <div
                    key={req.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-9 w-9 mt-0.5">
                        <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                          {req.employeeName
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase() || "E"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">{req.employeeName}</span>
                          <Badge variant="outline" className="text-[10px] py-0">
                            {req.department}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          <span className="font-medium text-foreground">{req.leaveTypeLabel}</span> •{" "}
                          {req.days} {req.days === 1 ? "day" : "days"} ({req.startDate} to {req.endDate})
                        </p>
                        {req.reason && (
                          <p className="text-xs text-muted-foreground/80 italic mt-1 line-clamp-1">
                            "{req.reason}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 gap-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200"
                        onClick={() => handleApprove(req.id)}
                      >
                        <Check className="h-3.5 w-3.5" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 gap-1 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
                        onClick={() => {
                          setRejectingItem(req);
                          setRejectReason("");
                        }}
                      >
                        <X className="h-3.5 w-3.5" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Scheduled Absences / Leaves (3 cols) */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span>Upcoming Scheduled Leaves</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Employees on approved leave across all departments.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingLeaves.length === 0 ? (
              <div className="text-center py-8 text-xs text-muted-foreground">
                No upcoming leaves scheduled.
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingLeaves.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 p-2.5 rounded-md border text-sm"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs bg-muted">
                          {item.employeeName
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase() || "E"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-medium text-xs truncate">{item.employeeName}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{item.department}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-medium block">{item.startDate}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {item.days}d ({item.leaveTypeLabel})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Department Breakdown Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Department Workforce & Leave Distribution</CardTitle>
              <CardDescription className="text-xs">
                Staff distribution and approved leave days consumed per department.
              </CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to="/admin/reports">
                Detailed Analytics
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {departmentStats.map((dept) => (
              <div key={dept.name} className="p-3 rounded-lg border bg-muted/20 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">{dept.name}</span>
                  <Badge variant="secondary" className="text-[10px]">
                    {dept.employees} {dept.employees === 1 ? "staff" : "staff"}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  Days taken: <strong className="text-foreground">{dept.daysTaken} days</strong>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reject Reason Modal */}
      <Dialog open={!!rejectingItem} onOpenChange={(open) => !open && setRejectingItem(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <span>Decline Leave Request</span>
            </DialogTitle>
            <DialogDescription>
              Please provide feedback or a reason for declining {rejectingItem?.employeeName}'s request (
              {rejectingItem?.leaveTypeLabel}, {rejectingItem?.days} days).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <label className="text-xs font-medium text-foreground block">
              Reason for rejection (shared with employee):
            </label>
            <Textarea
              placeholder="e.g. Critical project deadline, overlapping coverage shortage, etc."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setRejectingItem(null)}>
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={handleConfirmReject}>
              Confirm Decline
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
