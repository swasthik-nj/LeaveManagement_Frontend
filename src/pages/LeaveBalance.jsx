import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell, Label } from "recharts";
import {
  CalendarPlus,
  Info,
  Sparkles,
  PieChart as PieIcon,
  CheckCircle2
} from "lucide-react";

// Distinct color per leave type matching the design system
const CATEGORY_COLORS = {
  annual: "#6366f1",   // Indigo
  sick: "#ec4899",     // Pink/Fuchsia
  casual: "#06b6d4",   // Cyan/Teal
  personal: "#8b5cf6", // Purple/Violet
};

const DEFAULT_CATEGORY_COLOR = "#3b82f6";
const AVAILABLE_COLOR = "#10b981"; // Emerald
const PENDING_COLOR = "#f59e0b";   // Amber

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
      const usagePercentage = total > 0 ? Math.min(100, Math.round((usedDays / total) * 100)) : 0;
      const categoryColor = CATEGORY_COLORS[policy.type] || DEFAULT_CATEGORY_COLOR;

      // Pie chart slices for this specific category card
      const chartData = [
        {
          name: "Available",
          days: remaining,
          fill: AVAILABLE_COLOR,
        },
        ...(pendingDays > 0
          ? [
              {
                name: "Pending",
                days: pendingDays,
                fill: PENDING_COLOR,
              },
            ]
          : []),
        ...(usedDays > 0
          ? [
              {
                name: "Used",
                days: usedDays,
                fill: categoryColor,
              },
            ]
          : []),
      ];

      return {
        ...policy,
        usedDays,
        pendingDays,
        remaining,
        usagePercentage,
        color: categoryColor,
        chartData,
      };
    });
  }, [leavePolicies, leaveRequests, user]);

  const totalEntitled = useMemo(() => {
    return balanceData.reduce((sum, item) => sum + item.totalDays, 0);
  }, [balanceData]);

  const totalUsed = useMemo(() => {
    return balanceData.reduce((sum, item) => sum + item.usedDays, 0);
  }, [balanceData]);

  const totalPending = useMemo(() => {
    return balanceData.reduce((sum, item) => sum + item.pendingDays, 0);
  }, [balanceData]);

  const totalRemaining = useMemo(() => {
    return balanceData.reduce((sum, item) => sum + item.remaining, 0);
  }, [balanceData]);

  const overallUtilization = useMemo(() => {
    return totalEntitled > 0 ? Math.round((totalUsed / totalEntitled) * 100) : 0;
  }, [totalUsed, totalEntitled]);

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
                  Annual Entitlement 2024
                </span>
              </div>
              <h2 className="text-xl font-bold">Total Available: {totalRemaining} Days</h2>
              <p className="text-sm text-muted-foreground max-w-xl">
                You have utilized {totalUsed} days ({overallUtilization}%) out of your {totalEntitled} annual allocated days across all categories.
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
                <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{totalUsed}</p>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{totalPending}</p>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Available</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{totalRemaining}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid of Leave Category Cards with individual Pie/Donut Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {balanceData.map((category) => (
          <Card key={category.id} className="relative overflow-hidden flex flex-col justify-between border shadow-sm hover:shadow-md transition-shadow">
            {/* Colored top accent bar */}
            <div
              className="absolute top-0 left-0 right-0 h-1.5"
              style={{ backgroundColor: category.color }}
            />

            <CardHeader className="pb-2 pt-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full shrink-0"
                      style={{ backgroundColor: category.color }}
                    />
                    <CardTitle className="text-lg font-bold">{category.label}</CardTitle>
                  </div>
                  <CardDescription className="text-xs mt-1 text-muted-foreground line-clamp-2">
                    {category.description}
                  </CardDescription>
                </div>
                <Badge
                  variant={category.remaining > 3 ? "outline" : "secondary"}
                  className="shrink-0 font-semibold"
                >
                  {category.remaining} days left
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Interactive Donut / Pie Chart for this Category */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2 px-3 rounded-xl bg-muted/20 border border-muted/50">
                <div className="w-full sm:w-[170px] flex justify-center">
                  <ChartContainer
                    config={{
                      Available: { label: "Available Days", color: AVAILABLE_COLOR },
                      Pending: { label: "Pending Approval", color: PENDING_COLOR },
                      Used: { label: "Utilized Days", color: category.color },
                    }}
                    className="mx-auto aspect-square h-[150px] w-[150px]"
                  >
                    <PieChart>
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                      />
                      <Pie
                        data={category.chartData}
                        dataKey="days"
                        nameKey="name"
                        innerRadius={44}
                        outerRadius={66}
                        paddingAngle={3}
                        strokeWidth={2}
                      >
                        {category.chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                        <Label
                          content={({ viewBox }) => {
                            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                              return (
                                <text
                                  x={viewBox.cx}
                                  y={viewBox.cy}
                                  textAnchor="middle"
                                  dominantBaseline="middle"
                                >
                                  <tspan
                                    x={viewBox.cx}
                                    y={viewBox.cy}
                                    className="fill-foreground text-2xl font-bold"
                                  >
                                    {category.usagePercentage}%
                                  </tspan>
                                  <tspan
                                    x={viewBox.cx}
                                    y={(viewBox.cy || 0) + 16}
                                    className="fill-muted-foreground text-[10px] uppercase tracking-wider"
                                  >
                                    used
                                  </tspan>
                                </text>
                              );
                            }
                          }}
                        />
                      </Pie>
                    </PieChart>
                  </ChartContainer>
                </div>

                {/* Mini Legend & Progress Summary */}
                <div className="flex-1 w-full space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: AVAILABLE_COLOR }} />
                      <span className="text-muted-foreground">Available:</span>
                    </div>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {category.remaining} days ({category.totalDays > 0 ? Math.round((category.remaining / category.totalDays) * 100) : 0}%)
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: category.color }} />
                      <span className="text-muted-foreground">Utilized:</span>
                    </div>
                    <span className="font-semibold" style={{ color: category.color }}>
                      {category.usedDays} days ({category.usagePercentage}%)
                    </span>
                  </div>

                  {category.pendingDays > 0 && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PENDING_COLOR }} />
                        <span className="text-muted-foreground">Pending Review:</span>
                      </div>
                      <span className="font-semibold text-amber-600 dark:text-amber-400">
                        {category.pendingDays} days
                      </span>
                    </div>
                  )}

                  {/* Visual mini-bar indicator */}
                  <div className="pt-1">
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden flex">
                      <div
                        className="h-full transition-all"
                        style={{
                          width: `${category.usagePercentage}%`,
                          backgroundColor: category.color,
                        }}
                      />
                      {category.pendingDays > 0 && (
                        <div
                          className="h-full transition-all bg-amber-400"
                          style={{
                            width: `${Math.round((category.pendingDays / category.totalDays) * 100)}%`,
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 3 Metric Summary Boxes */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-lg bg-muted/40 border">
                  <span className="text-[11px] text-muted-foreground block font-medium">Allowed</span>
                  <span className="text-base font-bold">{category.totalDays}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-muted/40 border">
                  <span className="text-[11px] text-muted-foreground block font-medium">Used</span>
                  <span className="text-base font-bold" style={{ color: category.color }}>
                    {category.usedDays}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-muted/40 border">
                  <span className="text-[11px] text-muted-foreground block font-medium">Available</span>
                  <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                    {category.remaining}
                  </span>
                </div>
              </div>

              {category.pendingDays > 0 && (
                <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 p-2.5 rounded-lg">
                  <Info className="h-4 w-4 shrink-0" />
                  <span>{category.pendingDays} day(s) currently pending review</span>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
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
