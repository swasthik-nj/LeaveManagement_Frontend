import React, { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import StatusBadge from "@/components/shared/StatusBadge";
import {
  Download,
  Calendar,
  History,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  FilterX,
  Search,
  FileSpreadsheet
} from "lucide-react";

export default function LeaveHistory() {
  const { user, leaveRequests } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [yearFilter, setYearFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRecord, setSelectedRecord] = useState(null);

  // User's own leaves
  const myRequests = useMemo(() => {
    return leaveRequests.filter((r) => r.employeeId === user?.employeeId || (user?._id && String(r.user) === String(user._id)));
  }, [leaveRequests, user]);

  // Filtered leaves
  const filteredRecords = useMemo(() => {
    return myRequests.filter((item) => {
      const itemYear = item.startDate ? item.startDate.split("-")[0] : "";
      const matchesYear = yearFilter === "all" || itemYear === yearFilter;
      const matchesType = typeFilter === "all" || item.leaveType === typeFilter;
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      const matchesSearch =
        (item.id ? String(item.id).toLowerCase().includes(searchTerm.toLowerCase()) : false) ||
        (item.reason ? item.reason.toLowerCase().includes(searchTerm.toLowerCase()) : false) ||
        (item.leaveTypeLabel ? item.leaveTypeLabel.toLowerCase().includes(searchTerm.toLowerCase()) : false);

      return matchesYear && matchesType && matchesStatus && matchesSearch;
    });
  }, [myRequests, yearFilter, typeFilter, statusFilter, searchTerm]);

  // Calculated stats for filtered or all
  const stats = useMemo(() => {
    const approved = filteredRecords.filter((r) => r.status === "approved");
    const totalDaysTaken = approved.reduce((acc, curr) => acc + (curr.days || 0), 0);
    const pendingCount = filteredRecords.filter((r) => r.status === "pending").length;
    const rejectedCount = filteredRecords.filter((r) => r.status === "rejected").length;

    return {
      totalDaysTaken,
      approvedCount: approved.length,
      pendingCount,
      rejectedCount,
    };
  }, [filteredRecords]);

  // Export to CSV functionality
  const handleExportCSV = () => {
    if (filteredRecords.length === 0) return;

    const headers = ["Request ID", "Leave Type", "Start Date", "End Date", "Working Days", "Status", "Applied Date", "Approved By", "Reason"];
    const rows = filteredRecords.map((r) => [
      r.id,
      r.leaveTypeLabel,
      r.startDate,
      r.endDate,
      r.days,
      r.status,
      r.appliedDate,
      r.approvedBy || "N/A",
      `"${(r.reason || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `leave_history_${user?.name?.replace(/\s+/g, "_")}_${yearFilter}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Leave History</h1>
          <p className="text-sm text-muted-foreground">
            Complete archive of your past leave applications, balances consumed, and decisions.
          </p>
        </div>
        <Button
          variant="outline"
          className="gap-2"
          onClick={handleExportCSV}
          disabled={filteredRecords.length === 0}
        >
          <Download className="h-4 w-4" />
          Export to CSV
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase">Days Utilized</p>
            <p className="text-2xl font-bold text-primary">{stats.totalDaysTaken}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <History className="h-5 w-5" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase">Approved Leaves</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.approvedCount}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase">Pending In Queue</p>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.pendingCount}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Clock className="h-5 w-5" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase">Not Approved</p>
            <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">{stats.rejectedCount}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-400">
            <XCircle className="h-5 w-5" />
          </div>
        </Card>
      </div>

      {/* Filter and Table Container */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search history by keyword..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger className="w-[110px] h-9">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  <SelectItem value="2026">2026</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[140px] h-9">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="annual">Annual</SelectItem>
                  <SelectItem value="sick">Sick</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] h-9">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              {(searchTerm || yearFilter !== "2024" || typeFilter !== "all" || statusFilter !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setYearFilter("2024");
                    setTypeFilter("all");
                    setStatusFilter("all");
                  }}
                  className="h-9 px-2.5 gap-1 text-muted-foreground hover:text-foreground"
                >
                  <FilterX className="h-4 w-4" />
                  Reset
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredRecords.length === 0 ? (
            <div className="text-center py-12 px-4 border rounded-lg border-dashed">
              <FileSpreadsheet className="mx-auto h-10 w-10 text-muted-foreground/60 mb-3" />
              <h3 className="text-base font-semibold">No historical records found</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                No leave records match the selected time period or criteria.
              </p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request ID</TableHead>
                    <TableHead>Leave Type</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead className="text-center">Days</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Decision By</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell className="font-mono text-xs font-medium">
                        {req.id}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{req.leaveTypeLabel}</span>
                        {req.reason && (
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {req.reason}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="text-xs">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{req.startDate}</span>
                          <span className="text-muted-foreground">to</span>
                          <span>{req.endDate}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex items-center justify-center font-semibold px-2 py-0.5 rounded bg-muted text-xs">
                          {req.days} {req.days === 1 ? "day" : "days"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={req.status} />
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {req.approvedBy ? (
                          <span>{req.approvedBy}</span>
                        ) : (
                          <span className="italic">Pending</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setSelectedRecord(req)}
                          title="View record details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Record Details Modal */}
      <Dialog open={!!selectedRecord} onOpenChange={(open) => !open && setSelectedRecord(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-between pr-4">
              <DialogTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-primary" />
                <span>Leave Record Archive</span>
              </DialogTitle>
              {selectedRecord && <StatusBadge status={selectedRecord.status} />}
            </div>
            <DialogDescription className="font-mono text-xs">
              ID: {selectedRecord?.id}
            </DialogDescription>
          </DialogHeader>

          {selectedRecord && (
            <div className="space-y-4 py-2 text-sm">
              <div className="grid grid-cols-2 gap-3 p-3 bg-muted/40 rounded-lg">
                <div>
                  <span className="text-xs text-muted-foreground block">Leave Type</span>
                  <span className="font-medium">{selectedRecord.leaveTypeLabel}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Duration</span>
                  <span className="font-medium">
                    {selectedRecord.days} {selectedRecord.days === 1 ? "working day" : "working days"}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Date Range</span>
                  <span className="font-medium">{selectedRecord.startDate} - {selectedRecord.endDate}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Applied On</span>
                  <span className="font-medium">{selectedRecord.appliedDate}</span>
                </div>
              </div>

              <div>
                <span className="text-xs text-muted-foreground block mb-1">Reason for Leave</span>
                <p className="p-3 bg-card border rounded-md text-sm text-foreground">
                  {selectedRecord.reason || "No reason specified."}
                </p>
              </div>

              {selectedRecord.status === "approved" && (
                <div className="p-3 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-900 dark:text-emerald-200">
                  <p className="text-xs font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    Approved by {selectedRecord.approvedBy || "Manager"}
                  </p>
                  {selectedRecord.approvedDate && (
                    <p className="text-xs mt-0.5 text-muted-foreground">
                      Authorized on {selectedRecord.approvedDate}
                    </p>
                  )}
                </div>
              )}

              {selectedRecord.status === "rejected" && (
                <div className="p-3 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-900 dark:text-rose-200">
                  <p className="text-xs font-semibold flex items-center gap-1.5">
                    <XCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                    Rejected by {selectedRecord.approvedBy || "Manager"}
                  </p>
                  {selectedRecord.rejectionReason && (
                    <p className="text-xs mt-1 text-rose-800 dark:text-rose-300">
                      <strong>Reason:</strong> {selectedRecord.rejectionReason}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setSelectedRecord(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
