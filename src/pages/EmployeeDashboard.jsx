import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import StatusBadge from "@/components/shared/StatusBadge";
import { getGreeting, formatDate, formatDateRange } from "@/lib/dateUtils";
import { getEmployeeSummary } from "@/lib/calculations";
import { CalendarPlus, CalendarDays, Clock, Timer, CalendarCheck, MoreHorizontal, Eye, XCircle, ArrowRight } from "lucide-react";

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const { user, leaveRequests, leavePolicies, cancelLeaveRequest } = useApp();

  const myRequests = useMemo(
    () => leaveRequests.filter((r) => r.employeeId === user?.employeeId),
    [leaveRequests, user]
  );

  const summary = useMemo(
    () => getEmployeeSummary(myRequests, leavePolicies),
    [myRequests, leavePolicies]
  );

  const recentRequests = myRequests.slice(0, 5);

  const summaryCards = [
    { title: "Available Leave", value: `${summary.totalAvailable} days`, description: `of ${summary.totalEntitlement} total entitlement`, icon: CalendarDays, color: "text-emerald-600 bg-emerald-50" },
    { title: "Used This Year", value: `${summary.totalUsed} days`, description: `${summary.totalEntitlement - summary.totalUsed} days remaining`, icon: Clock, color: "text-blue-600 bg-blue-50" },
    { title: "Pending Requests", value: summary.pendingRequests, description: summary.pendingRequests > 0 ? "Awaiting manager approval" : "No pending requests", icon: Timer, color: "text-amber-600 bg-amber-50" },
    { title: "Upcoming Leave", value: summary.upcomingLeave.length > 0 ? formatDate(summary.upcomingLeave[0].startDate, "MMM dd") : "None", description: summary.upcomingLeave.length > 0 ? `${summary.upcomingLeave[0].days} day(s) · ${summary.upcomingLeave[0].leaveTypeLabel}` : "No upcoming leave scheduled", icon: CalendarCheck, color: "text-violet-600 bg-violet-50" },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{getGreeting()}, {user?.name?.split(" ")[0]} 👋</h1>
          <p className="text-muted-foreground text-sm mt-1">Here's an overview of your time off and upcoming plans.</p>
        </div>
        <Button onClick={() => navigate("/apply-leave")} className="shrink-0">
          <CalendarPlus className="h-4 w-4" /> Apply for Leave
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                    <p className="text-2xl font-bold">{card.value}</p>
                    <p className="text-xs text-muted-foreground">{card.description}</p>
                  </div>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Leave balance breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Leave Balance</CardTitle>
              <CardDescription>Your current leave entitlements</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate("/leave-balance")}>
              View details <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            {summary.balances.map((b) => {
              const pct = b.balance.total > 0 ? (b.balance.used / b.balance.total) * 100 : 0;
              return (
                <div key={b.type} className="space-y-2 rounded-lg border p-3.5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{b.label}</p>
                    <p className="text-xs text-muted-foreground">{b.balance.available} / {b.balance.total} available</p>
                  </div>
                  <Progress value={pct} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{b.balance.used} used</span>
                    {b.balance.pending > 0 && <span>{b.balance.pending} pending</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming leave */}
      {summary.upcomingLeave.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Upcoming Leave</CardTitle>
            <CardDescription>Your next approved time off</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {summary.upcomingLeave.slice(0, 3).map((req) => (
                <div key={req.id} className="flex items-center justify-between rounded-lg border p-3.5">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">{req.leaveTypeLabel}</p>
                    <p className="text-xs text-muted-foreground">{formatDateRange(req.startDate, req.endDate)}</p>
                  </div>
                  <div className="text-right space-y-0.5">
                    <p className="text-sm font-medium">{req.days} day{req.days !== 1 ? "s" : ""}</p>
                    <StatusBadge status={req.status} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent requests table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Recent Leave Requests</CardTitle>
              <CardDescription>Your latest submissions</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate("/leave-requests")}>
              View all <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CalendarDays className="h-10 w-10 text-muted-foreground/50 mb-3" />
              <p className="text-sm font-medium">No leave requests yet</p>
              <p className="text-xs text-muted-foreground mt-1">Your submitted leave requests will appear here.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="hidden sm:table-cell">Dates</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead className="hidden md:table-cell">Applied</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentRequests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell className="font-mono text-xs">{req.id}</TableCell>
                    <TableCell className="text-sm">{req.leaveTypeLabel}</TableCell>
                    <TableCell className="hidden sm:table-cell text-sm">{formatDateRange(req.startDate, req.endDate)}</TableCell>
                    <TableCell className="text-sm">{req.days}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{formatDate(req.appliedDate)}</TableCell>
                    <TableCell><StatusBadge status={req.status} /></TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem><Eye className="mr-2 h-4 w-4" /> View details</DropdownMenuItem>
                          {req.status === "pending" && (
                            <DropdownMenuItem className="text-destructive" onClick={() => cancelLeaveRequest(req.id)}>
                              <XCircle className="mr-2 h-4 w-4" /> Cancel request
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
