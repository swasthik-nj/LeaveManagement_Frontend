import React, { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import StatusBadge from "@/components/shared/StatusBadge";
import {
  Search,
  Check,
  X,
  Eye,
  FilterX,
  AlertTriangle,
  ClipboardCheck,
  Calendar,
  Building,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

export default function LeaveApprovals() {
  const { user, leaveRequests, approveLeaveRequest, rejectLeaveRequest, DEPARTMENTS } = useApp();

  const [activeTab, setActiveTab] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectingItem, setRejectingItem] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const pendingCount = useMemo(() => {
    return leaveRequests.filter((r) => r.status === "pending").length;
  }, [leaveRequests]);

  // Filtered requests
  const filteredRequests = useMemo(() => {
    return leaveRequests.filter((item) => {
      const matchesTab = activeTab === "all" || item.status === activeTab;
      const matchesDept = departmentFilter === "all" || item.department === departmentFilter;
      const matchesType = typeFilter === "all" || item.leaveType === typeFilter;
      const matchesSearch =
        (item.employeeName ? item.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) : false) ||
        (item.id ? String(item.id).toLowerCase().includes(searchTerm.toLowerCase()) : false) ||
        (item.reason ? item.reason.toLowerCase().includes(searchTerm.toLowerCase()) : false);

      return matchesTab && matchesDept && matchesType && matchesSearch;
    });
  }, [leaveRequests, activeTab, departmentFilter, typeFilter, searchTerm]);

  const handleApprove = (reqId) => {
    approveLeaveRequest(reqId, user?.name || "Admin");
  };

  const handleConfirmReject = () => {
    if (rejectingItem) {
      rejectLeaveRequest(
        rejectingItem.id,
        user?.name || "Admin",
        rejectReason.trim() || "Operational requirements prevent approval at this time."
      );
      setRejectingItem(null);
      setRejectReason("");
      if (selectedRequest?.id === rejectingItem.id) {
        setSelectedRequest(null);
      }
    }
  };

  // Check for potential department overlap
  const getOverlappingLeaves = (targetReq) => {
    if (!targetReq) return [];
    return leaveRequests.filter(
      (r) =>
        r.id !== targetReq.id &&
        r.department === targetReq.department &&
        r.status === "approved" &&
        !(r.endDate < targetReq.startDate || r.startDate > targetReq.endDate)
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Leave Approvals</h1>
          <p className="text-sm text-muted-foreground">
            Review, evaluate, and approve or decline employee leave applications company-wide.
          </p>
        </div>
      </div>

      {/* Tabs and Filters */}
      <Card>
        <CardHeader className="pb-3">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <TabsList className="grid grid-cols-4 w-full sm:w-[480px]">
                <TabsTrigger value="pending" className="gap-1.5">
                  <span>Pending</span>
                  {pendingCount > 0 && (
                    <Badge variant="destructive" className="h-4 px-1 text-[10px]">
                      {pendingCount}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
              </TabsList>

              {/* Search and Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative flex-1 sm:w-60">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search name, ID, reason..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 h-9"
                  />
                </div>

                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger className="w-[140px] h-9">
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

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[140px] h-9">
                    <SelectValue placeholder="Leave Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="annual">Annual</SelectItem>
                    <SelectItem value="sick">Sick</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                  </SelectContent>
                </Select>

                {(searchTerm || departmentFilter !== "all" || typeFilter !== "all") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchTerm("");
                      setDepartmentFilter("all");
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
          </Tabs>
        </CardHeader>
        <CardContent>
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12 px-4 border rounded-lg border-dashed">
              <ClipboardCheck className="mx-auto h-10 w-10 text-muted-foreground/60 mb-3" />
              <h3 className="text-base font-semibold">No requests in this view</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                No leave requests match the selected tab filter or query criteria.
              </p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
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
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
                              {req.employeeName
                                ?.split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase() || "E"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-xs">{req.employeeName}</p>
                            <p className="text-[11px] text-muted-foreground">{req.department}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-xs">{req.leaveTypeLabel}</span>
                        {req.reason && (
                          <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                            {req.reason}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="text-xs">
                        <div className="flex items-center gap-1 font-medium">
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
                      <TableCell className="text-xs text-muted-foreground">{req.appliedDate}</TableCell>
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
                            title="View details & team coverage"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {req.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 px-2.5 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200 gap-1"
                                onClick={() => handleApprove(req.id)}
                              >
                                <Check className="h-3.5 w-3.5" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 px-2.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 gap-1"
                                onClick={() => {
                                  setRejectingItem(req);
                                  setRejectReason("");
                                }}
                              >
                                <X className="h-3.5 w-3.5" />
                                Reject
                              </Button>
                            </>
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

      {/* Details & Coverage Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="flex items-center justify-between pr-4">
              <DialogTitle className="flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5 text-primary" />
                <span>Leave Evaluation</span>
              </DialogTitle>
              {selectedRequest && <StatusBadge status={selectedRequest.status} />}
            </div>
            <DialogDescription className="font-mono text-xs">
              ID: {selectedRequest?.id} • Applied {selectedRequest?.appliedDate}
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4 py-2 text-sm">
              <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-lg">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="text-sm font-semibold bg-primary text-primary-foreground">
                    {selectedRequest.employeeName
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase() || "E"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold text-sm">{selectedRequest.employeeName}</h4>
                  <p className="text-xs text-muted-foreground">
                    Department: {selectedRequest.department}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-muted/20 border rounded-lg text-xs">
                <div>
                  <span className="text-muted-foreground block">Leave Type</span>
                  <span className="font-semibold text-sm">{selectedRequest.leaveTypeLabel}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Requested Duration</span>
                  <span className="font-semibold text-sm">
                    {selectedRequest.days} {selectedRequest.days === 1 ? "working day" : "working days"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Start Date</span>
                  <span className="font-medium">{selectedRequest.startDate}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">End Date</span>
                  <span className="font-medium">{selectedRequest.endDate}</span>
                </div>
              </div>

              <div>
                <span className="text-xs text-muted-foreground block mb-1">Reason Stated</span>
                <p className="p-3 bg-card border rounded-md text-sm text-foreground">
                  {selectedRequest.reason || "No explanation provided."}
                </p>
              </div>

              {/* Department Overlap Warning */}
              {(() => {
                const overlaps = getOverlappingLeaves(selectedRequest);
                if (overlaps.length > 0) {
                  return (
                    <div className="p-3 rounded-md bg-amber-500/10 border border-amber-500/20 text-xs">
                      <p className="font-semibold flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
                        <AlertTriangle className="h-4 w-4" />
                        Team Coverage Alert: {overlaps.length} overlapping leave(s) in {selectedRequest.department}
                      </p>
                      <ul className="mt-1 list-disc list-inside text-muted-foreground space-y-0.5">
                        {overlaps.map((o) => (
                          <li key={o.id}>
                            <strong>{o.employeeName}</strong> ({o.startDate} to {o.endDate})
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                }
                return (
                  <div className="p-2.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                    <span>No departmental leave conflicts detected for this period.</span>
                  </div>
                );
              })()}

              {selectedRequest.rejectionReason && (
                <div className="p-3 rounded-md bg-rose-500/10 border border-rose-500/20 text-xs text-rose-800 dark:text-rose-300">
                  <strong>Rejection Note:</strong> {selectedRequest.rejectionReason}
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            {selectedRequest?.status === "pending" && (
              <>
                <Button
                  variant="outline"
                  className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
                  size="sm"
                  onClick={() => {
                    setRejectingItem(selectedRequest);
                    setRejectReason("");
                  }}
                >
                  <X className="h-4 w-4 mr-1" />
                  Decline
                </Button>
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => {
                    handleApprove(selectedRequest.id);
                    setSelectedRequest(null);
                  }}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Approve Application
                </Button>
              </>
            )}
            <Button variant="outline" size="sm" onClick={() => setSelectedRequest(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rejection Modal */}
      <Dialog open={!!rejectingItem} onOpenChange={(open) => !open && setRejectingItem(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <span>Decline Leave Request</span>
            </DialogTitle>
            <DialogDescription>
              Provide justification for declining {rejectingItem?.employeeName}'s leave application.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <label className="text-xs font-medium text-foreground block">
              Reason / Feedback:
            </label>
            <Textarea
              placeholder="e.g. Schedule conflict with release sprint, minimum headcount requirements..."
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
