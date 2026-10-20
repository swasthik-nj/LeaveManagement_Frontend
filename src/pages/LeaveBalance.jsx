import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import StatusBadge from "@/components/shared/StatusBadge";
import {
  Wallet,
  CalendarPlus,
  Info,
  Calendar,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Sparkles
} from "lucide-react";

export default function LeaveBalance() {
  const { user, leaveRequests, leavePolicies } = useApp();

  // Compute balance breakdown for current employee
  const balanceData = useMemo(() => {
    const userLeaves = leaveRequests.filter((r) => r.employeeId === user?.employeeId);

    return leavePolicies.map((policy) => {
      // approved days count as used
      const usedDays = userLeaves
        .filter((r) => r.leaveType === policy.type && r.status === "approved")
        .reduce((sum, r) => sum + (r.days || 0), 0);

      // pending days count as reserved
      const pendingDays = userLeaves
        .filter((r) => r.leaveType === policy.type && r.status === "pending")
        .reduce((sum, r) => sum + (r.days || 0), 0);

      const total = policy.totalDays;
      const remaining = Math.max(0, total - usedDays);
      const usagePercentage = Math.min(100, Math.round((usedDays / total) * 100));

      return {
        ...policy,
        usedDays,
        pendingDays,
        remaining,
        usagePercentage,
      };
    });
  }, [leavePolicies, leaveRequests, user]);

  const totalEntitled = useMemo(() => {
    return balanceData.reduce((sum, item) => sum + item.totalDays, 0);
  }, [balanceData]);

  const totalUsed = useMemo(() => {
    return balanceData.reduce((sum, item) => sum + item.usedDays, 0);
  }, [balanceData]);

  const totalRemaining = useMemo(() => {
    return balanceData.reduce((sum, item) => sum + item.remaining, 0);
  }, [balanceData]);

  // Approved leave history for the usage breakdown
  const usageHistory = useMemo(() => {
    return leaveRequests
      .filter((r) => r.employeeId === user?.employeeId && r.status === "approved")
      .sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
  }, [leaveRequests, user]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Leave Balance</h1>
          <p className="text-sm text-muted-foreground">
            Current year entitlement, consumption, and policy terms for {user?.name}.
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link to="/apply-leave">
            <CalendarPlus className="h-4 w-4" />
            Apply for Leave
          </Link>
        </Button>
      </div>

      {/* Aggregate Overview Card */}
      <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                  Annual Allocation 2024
                </span>
              </div>
              <h2 className="text-xl font-bold">Total Available Balance: {totalRemaining} Days</h2>
              <p className="text-sm text-muted-foreground max-w-xl">
                You have utilized {totalUsed} out of your {totalEntitled} annual allocated days across all leave categories.
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Entitled</p>
                <p className="text-2xl font-bold">{totalEntitled}</p>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Utilized</p>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{totalUsed}</p>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Remaining</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{totalRemaining}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Balance Cards per Leave Type */}
      <div className="grid gap-4 md:grid-cols-2">
        {balanceData.map((category) => (
          <Card key={category.id} className="relative overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">{category.label}</CardTitle>
                  <CardDescription className="text-xs mt-1">
                    {category.description}
                  </CardDescription>
                </div>
                <Badge variant={category.remaining > 3 ? "outline" : "secondary"}>
                  {category.remaining} days left
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Utilization</span>
                  <span className="font-semibold">{category.usagePercentage}%</span>
                </div>
                <Progress value={category.usagePercentage} className="h-2" />
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t text-center">
                <div className="p-2 rounded bg-muted/40">
                  <span className="text-[11px] text-muted-foreground block">Allowed</span>
                  <span className="text-base font-semibold">{category.totalDays}</span>
                </div>
                <div className="p-2 rounded bg-muted/40">
                  <span className="text-[11px] text-muted-foreground block">Used</span>
                  <span className="text-base font-semibold text-amber-600 dark:text-amber-400">
                    {category.usedDays}
                  </span>
                </div>
                <div className="p-2 rounded bg-muted/40">
                  <span className="text-[11px] text-muted-foreground block">Available</span>
                  <span className="text-base font-semibold text-emerald-600 dark:text-emerald-400">
                    {category.remaining}
                  </span>
                </div>
              </div>

              {category.pendingDays > 0 && (
                <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 p-2 rounded">
                  <Info className="h-4 w-4 shrink-0" />
                  <span>{category.pendingDays} day(s) currently pending approval</span>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                <span>Carry forward: {category.carryForward ? `Yes (max ${category.maxCarryForward}d)` : "No"}</span>
                <span>Approval: {category.approvalRequired ? "Required" : "Auto-approved"}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Consumption Breakdown Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Leave Deductions</CardTitle>
          <CardDescription>
            Audit log of approved leaves that deducted from your entitlement balances this year.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {usageHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No leave deductions recorded yet for this year.
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference ID</TableHead>
                    <TableHead>Leave Type</TableHead>
                    <TableHead>Date Interval</TableHead>
                    <TableHead className="text-center">Days Deducted</TableHead>
                    <TableHead>Approved By</TableHead>
                    <TableHead>Authorization Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usageHistory.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell className="font-mono text-xs font-medium">{req.id}</TableCell>
                      <TableCell className="font-medium">{req.leaveTypeLabel}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {req.startDate} to {req.endDate}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-semibold text-rose-600 dark:text-rose-400">
                          -{req.days} {req.days === 1 ? "day" : "days"}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs">{req.approvedBy || "Manager"}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{req.approvedDate || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
