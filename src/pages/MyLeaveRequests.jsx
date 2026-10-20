import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import StatusBadge from "@/components/shared/StatusBadge";
import {
  Search,
  PlusCircle,
  FileText,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  Ban,
  ArrowUpDown,
  FilterX
} from "lucide-react";

export default function MyLeaveRequests() {
  const { user, leaveRequests, cancelLeaveRequest } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [requestToCancel, setRequestToCancel] = useState(null);

  // User's own requests
  const myRequests = useMemo(() => {
    return leaveRequests.filter((r) => r.employeeId === user?.employeeId || (user?._id && String(r.user) === String(user._id)));
  }, [leaveRequests, user]);

  // Status counts
  const stats = useMemo(() => {
    return {
      total: myRequests.length,
      pending: myRequests.filter((r) => r.status === "pending").length,
      approved: myRequests.filter((r) => r.status === "approved").length,
      rejected: myRequests.filter((r) => r.status === "rejected").length,
    };
  }, [myRequests]);

  // Filtered requests
  const filteredRequests = useMemo(() => {
    return myRequests.filter((item) => {
      const matchesSearch =
        (item.id ? String(item.id).toLowerCase().includes(searchTerm.toLowerCase()) : false) ||
        (item.reason ? item.reason.toLowerCase().includes(searchTerm.toLowerCase()) : false) ||
        (item.leaveTypeLabel ? item.leaveTypeLabel.toLowerCase().includes(searchTerm.toLowerCase()) : false);

      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      const matchesType = typeFilter === "all" || item.leaveType === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [myRequests, searchTerm, statusFilter, typeFilter]);

  const handleConfirmCancel = () => {
    if (requestToCancel) {
      cancelLeaveRequest(requestToCancel.id);
      setRequestToCancel(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Leave Requests</h1>
          <p className="text-sm text-muted-foreground">
            Track, view details, and manage all your submitted leave applications.
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link to="/apply-leave">
            <PlusCircle className="h-4 w-4" />
            Apply for Leave
          </Link>
        </Button>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase">Total Submitted</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <FileText className="h-5 w-5" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase">Pending Review</p>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.pending}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Clock className="h-5 w-5" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase">Approved</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.approved}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase">Rejected / Cancelled</p>
            <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">{stats.rejected}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-400">
            <XCircle className="h-5 w-5" />
          </div>
        </Card>
      </div>

      {/* Filters and Table Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by ID, reason, or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] h-9">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[150px] h-9">
                  <SelectValue placeholder="Leave Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="annual">Annual Leave</SelectItem>
                  <SelectItem value="sick">Sick Leave</SelectItem>
                  <SelectItem value="casual">Casual Leave</SelectItem>
                  <SelectItem value="personal">Personal Leave</SelectItem>
                </SelectContent>
              </Select>

              {(searchTerm || statusFilter !== "all" || typeFilter !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                    setTypeFilter("all");
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
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12 px-4 border rounded-lg border-dashed">
              <FileText className="mx-auto h-10 w-10 text-muted-foreground/60 mb-3" />
              <h3 className="text-base font-semibold">No leave requests found</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                {myRequests.length === 0
                  ? "You haven't applied for any leaves yet. Start by submitting your first request."
                  : "No requests match your current search or filter criteria."}
              </p>
              {myRequests.length === 0 && (
                <Button asChild className="mt-4 gap-2" size="sm">
                  <Link to="/apply-leave">
                    <PlusCircle className="h-4 w-4" />
                    Apply for Leave
                  </Link>
                </Button>
              )}
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
                    <TableHead>Applied Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((req) => (
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
                      <TableCell className="text-xs text-muted-foreground">
                        {req.appliedDate}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={req.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setSelectedRequest(req)}
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {req.status === "pending" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:bg-destructive/10"
                              onClick={() => setRequestToCancel(req)}
                              title="Cancel request"
                            >
                              <Ban className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-between pr-4">
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <span>Leave Request Details</span>
              </DialogTitle>
              {selectedRequest && <StatusBadge status={selectedRequest.status} />}
            </div>
            <DialogDescription className="font-mono text-xs">
              ID: {selectedRequest?.id}
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4 py-2 text-sm">
              <div className="grid grid-cols-2 gap-3 p-3 bg-muted/40 rounded-lg">
                <div>
                  <span className="text-xs text-muted-foreground block">Leave Type</span>
                  <span className="font-medium">{selectedRequest.leaveTypeLabel}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Duration</span>
                  <span className="font-medium">
                    {selectedRequest.days} {selectedRequest.days === 1 ? "working day" : "working days"}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Date Range</span>
                  <span className="font-medium">{selectedRequest.startDate} - {selectedRequest.endDate}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Applied On</span>
                  <span className="font-medium">{selectedRequest.appliedDate}</span>
                </div>
              </div>

              <div>
                <span className="text-xs text-muted-foreground block mb-1">Reason for Leave</span>
                <p className="p-3 bg-card border rounded-md text-sm text-foreground">
                  {selectedRequest.reason || "No reason specified."}
                </p>
              </div>

              {selectedRequest.status === "approved" && (
                <div className="p-3 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-900 dark:text-emerald-200">
                  <p className="text-xs font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    Approved by {selectedRequest.approvedBy || "Manager"}
                  </p>
                  {selectedRequest.approvedDate && (
                    <p className="text-xs mt-0.5 text-muted-foreground">
                      Decision made on {selectedRequest.approvedDate}
                    </p>
                  )}
                </div>
              )}

              {selectedRequest.status === "rejected" && (
                <div className="p-3 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-900 dark:text-rose-200">
                  <p className="text-xs font-semibold flex items-center gap-1.5">
                    <XCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                    Rejected by {selectedRequest.approvedBy || "Manager"}
                  </p>
                  {selectedRequest.rejectionReason && (
                    <p className="text-xs mt-1 text-rose-800 dark:text-rose-300">
                      <strong>Reason:</strong> {selectedRequest.rejectionReason}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            {selectedRequest?.status === "pending" && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  setRequestToCancel(selectedRequest);
                  setSelectedRequest(null);
                }}
              >
                Cancel Request
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => setSelectedRequest(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Alert */}
      <AlertDialog open={!!requestToCancel} onOpenChange={(open) => !open && setRequestToCancel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Cancel Leave Request?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel request <strong>{requestToCancel?.id}</strong> (
              {requestToCancel?.leaveTypeLabel}, {requestToCancel?.days} days)?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Request</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCancel}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, Cancel Request
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
