import React, { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import StatusBadge from "@/components/shared/StatusBadge";
import {
  Users,
  UserPlus,
  Search,
  FilterX,
  Mail,
  Phone,
  Briefcase,
  Building,
  Edit2,
  Eye,
  ShieldCheck,
  Calendar,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";

export default function EmployeeManagement() {
  const { employees, addEmployee, updateEmployee, leaveRequests } = useApp();

  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [viewingEmployee, setViewingEmployee] = useState(null);

  // Form state for add
  const [newEmp, setNewEmp] = useState({
    name: "",
    email: "",
    department: "Engineering",
    designation: "",
    role: "employee",
    phone: "",
    joiningDate: new Date().toISOString().split("T")[0],
  });
  const [formErrors, setFormErrors] = useState({});

  // Summary Metrics
  const metrics = useMemo(() => {
    const active = employees.filter((e) => e.status === "active").length;
    const admins = employees.filter((e) => e.role === "admin").length;
    const depts = new Set(employees.map((e) => e.department)).size;

    return {
      total: employees.length,
      active,
      admins,
      departments: depts,
    };
  }, [employees]);

  // Filtered list
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchesSearch =
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.designation?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDept = departmentFilter === "all" || emp.department === departmentFilter;
      const matchesRole = roleFilter === "all" || emp.role === roleFilter;
      const matchesStatus = statusFilter === "all" || emp.status === statusFilter;

      return matchesSearch && matchesDept && matchesRole && matchesStatus;
    });
  }, [employees, searchTerm, departmentFilter, roleFilter, statusFilter]);

  const validateNewEmp = () => {
    const errors = {};
    if (!newEmp.name.trim()) errors.name = "Full name is required";
    if (!newEmp.email.trim()) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(newEmp.email)) errors.email = "Invalid email format";
    if (!newEmp.designation.trim()) errors.designation = "Job title is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    if (!validateNewEmp()) return;

    const res = await addEmployee(newEmp);
    if (res && res.success === false) {
      toast.error(res.message || "Failed to create employee");
      return;
    }

    toast.success("Employee created and saved to database!");
    setIsAddOpen(false);
    setNewEmp({
      name: "",
      email: "",
      department: "Engineering",
      designation: "",
      role: "employee",
      phone: "",
      joiningDate: new Date().toISOString().split("T")[0],
    });
    setFormErrors({});
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingEmployee) return;

    const res = await updateEmployee(editingEmployee.id || editingEmployee._id, {
      name: editingEmployee.name,
      department: editingEmployee.department,
      designation: editingEmployee.designation,
      role: editingEmployee.role,
      phone: editingEmployee.phone,
      status: editingEmployee.status,
    });

    if (res && res.success === false) {
      toast.error(res.message || "Failed to update employee");
      return;
    }

    toast.success("Employee details updated in database!");
    setEditingEmployee(null);
  };

  // Leaves for viewed employee
  const employeeLeaves = useMemo(() => {
    if (!viewingEmployee) return [];
    return leaveRequests.filter(
      (r) =>
        r.employeeId === viewingEmployee.employeeId ||
        r.employeeId === viewingEmployee.id ||
        (viewingEmployee._id && String(r.user) === String(viewingEmployee._id))
    );
  }, [viewingEmployee, leaveRequests]);

  return (
    <div className="space-y-6">
      {/* Page Title & Add CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Staff & Directory</h1>
          <p className="text-sm text-muted-foreground">
            Manage organization members, assign roles, view leave records, and onboard staff.
          </p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="gap-2">
          <UserPlus className="h-4 w-4" />
          Add Employee
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase">Total Staff</p>
            <p className="text-2xl font-bold">{metrics.total}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Users className="h-5 w-5" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase">Active Status</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{metrics.active}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase">Administrators</p>
            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{metrics.admins}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <ShieldCheck className="h-5 w-5" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase">Departments</p>
            <p className="text-2xl font-bold">{metrics.departments}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Building className="h-5 w-5" />
          </div>
        </Card>
      </div>

      {/* Directory Table Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, ID, title, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
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

              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[120px] h-9">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[120px] h-9">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              {(searchTerm || departmentFilter !== "all" || roleFilter !== "all" || statusFilter !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setDepartmentFilter("all");
                    setRoleFilter("all");
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
          {filteredEmployees.length === 0 ? (
            <div className="text-center py-12 px-4 border rounded-lg border-dashed">
              <Users className="mx-auto h-10 w-10 text-muted-foreground/60 mb-3" />
              <h3 className="text-base font-semibold">No employees found</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                No staff members matched your current filter or search criteria.
              </p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Department & Title</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map((emp) => (
                    <TableRow key={emp.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
                              {emp.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-xs text-foreground">{emp.name}</p>
                            <p className="text-[11px] text-muted-foreground">{emp.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{emp.employeeId}</TableCell>
                      <TableCell>
                        <p className="text-xs font-medium">{emp.designation}</p>
                        <p className="text-[11px] text-muted-foreground">{emp.department}</p>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={emp.role === "admin" ? "default" : "secondary"}
                          className="capitalize text-[10px]"
                        >
                          {emp.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={emp.status} />
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{emp.joiningDate}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setViewingEmployee(emp)}
                            title="View Profile & Leaves"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setEditingEmployee({ ...emp })}
                            title="Edit Employee"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
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

      {/* Add Employee Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleCreateEmployee}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-primary" />
                <span>Onboard New Employee</span>
              </DialogTitle>
              <DialogDescription>
                Add employee credentials and employment details to the directory.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-3 text-sm">
              <div className="space-y-1">
                <Label htmlFor="add-name" className="text-xs">Full Name *</Label>
                <Input
                  id="add-name"
                  placeholder="e.g. Jordan Miller"
                  value={newEmp.name}
                  onChange={(e) => setNewEmp({ ...newEmp, name: e.target.value })}
                  className="h-9"
                />
                {formErrors.name && <p className="text-[11px] text-destructive">{formErrors.name}</p>}
              </div>

              <div className="space-y-1">
                <Label htmlFor="add-email" className="text-xs">Corporate Email *</Label>
                <Input
                  id="add-email"
                  type="email"
                  placeholder="jordan.miller@leaveflow.io"
                  value={newEmp.email}
                  onChange={(e) => setNewEmp({ ...newEmp, email: e.target.value })}
                  className="h-9"
                />
                {formErrors.email && <p className="text-[11px] text-destructive">{formErrors.email}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Department</Label>
                  <Select
                    value={newEmp.department}
                    onValueChange={(val) => setNewEmp({ ...newEmp, department: val })}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Engineering">Engineering</SelectItem>
                      <SelectItem value="Design">Design</SelectItem>
                      <SelectItem value="Product">Product</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Human Resources">Human Resources</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="Sales">Sales</SelectItem>
                      <SelectItem value="Operations">Operations</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Role Permission</Label>
                  <Select
                    value={newEmp.role}
                    onValueChange={(val) => setNewEmp({ ...newEmp, role: val })}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employee">Employee</SelectItem>
                      <SelectItem value="admin">Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="add-desig" className="text-xs">Designation / Job Title *</Label>
                <Input
                  id="add-desig"
                  placeholder="e.g. Senior Frontend Architect"
                  value={newEmp.designation}
                  onChange={(e) => setNewEmp({ ...newEmp, designation: e.target.value })}
                  className="h-9"
                />
                {formErrors.designation && (
                  <p className="text-[11px] text-destructive">{formErrors.designation}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="add-phone" className="text-xs">Phone (optional)</Label>
                  <Input
                    id="add-phone"
                    placeholder="+1 (555) 000-0000"
                    value={newEmp.phone}
                    onChange={(e) => setNewEmp({ ...newEmp, phone: e.target.value })}
                    className="h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="add-date" className="text-xs">Joining Date</Label>
                  <Input
                    id="add-date"
                    type="date"
                    value={newEmp.joiningDate}
                    onChange={(e) => setNewEmp({ ...newEmp, joiningDate: e.target.value })}
                    className="h-9"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Save & Onboard
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Employee Dialog */}
      <Dialog open={!!editingEmployee} onOpenChange={(open) => !open && setEditingEmployee(null)}>
        <DialogContent className="sm:max-w-md">
          {editingEmployee && (
            <form onSubmit={handleSaveEdit}>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Edit2 className="h-5 w-5 text-primary" />
                  <span>Update Staff Profile</span>
                </DialogTitle>
                <DialogDescription>
                  Modify roles, designations, and account status for {editingEmployee.name}.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 py-3 text-sm">
                <div className="space-y-1">
                  <Label className="text-xs">Designation / Title</Label>
                  <Input
                    value={editingEmployee.designation}
                    onChange={(e) =>
                      setEditingEmployee({ ...editingEmployee, designation: e.target.value })
                    }
                    className="h-9"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Department</Label>
                    <Select
                      value={editingEmployee.department}
                      onValueChange={(val) =>
                        setEditingEmployee({ ...editingEmployee, department: val })
                      }
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Engineering">Engineering</SelectItem>
                        <SelectItem value="Design">Design</SelectItem>
                        <SelectItem value="Product">Product</SelectItem>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                        <SelectItem value="Human Resources">Human Resources</SelectItem>
                        <SelectItem value="Finance">Finance</SelectItem>
                        <SelectItem value="Sales">Sales</SelectItem>
                        <SelectItem value="Operations">Operations</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Role</Label>
                    <Select
                      value={editingEmployee.role}
                      onValueChange={(val) =>
                        setEditingEmployee({ ...editingEmployee, role: val })
                      }
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="employee">Employee</SelectItem>
                        <SelectItem value="admin">Administrator</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Contact Phone</Label>
                  <Input
                    value={editingEmployee.phone || ""}
                    onChange={(e) =>
                      setEditingEmployee({ ...editingEmployee, phone: e.target.value })
                    }
                    className="h-9"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                  <div className="space-y-0.5">
                    <Label htmlFor="active-status" className="text-xs font-semibold">
                      Account Status
                    </Label>
                    <p className="text-[11px] text-muted-foreground">
                      Inactive members cannot submit new leave requests.
                    </p>
                  </div>
                  <Switch
                    id="active-status"
                    checked={editingEmployee.status === "active"}
                    onCheckedChange={(checked) =>
                      setEditingEmployee({
                        ...editingEmployee,
                        status: checked ? "active" : "inactive",
                      })
                    }
                  />
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button type="button" variant="outline" size="sm" onClick={() => setEditingEmployee(null)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* View Profile & Leaves Dialog */}
      <Dialog open={!!viewingEmployee} onOpenChange={(open) => !open && setViewingEmployee(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <span>Employee Overview</span>
            </DialogTitle>
            <DialogDescription>
              Profile metadata and recorded leave history.
            </DialogDescription>
          </DialogHeader>

          {viewingEmployee && (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-lg">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="text-sm font-bold bg-primary text-primary-foreground">
                    {viewingEmployee.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold text-base">{viewingEmployee.name}</h4>
                  <p className="text-xs text-muted-foreground">
                    {viewingEmployee.designation} • {viewingEmployee.department}
                  </p>
                  <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
                    {viewingEmployee.employeeId} • {viewingEmployee.email}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs p-3 rounded-md border">
                <div>
                  <span className="text-muted-foreground block">Role Permission</span>
                  <span className="font-semibold capitalize">{viewingEmployee.role}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Account Status</span>
                  <StatusBadge status={viewingEmployee.status} />
                </div>
                <div>
                  <span className="text-muted-foreground block">Contact Phone</span>
                  <span className="font-medium">{viewingEmployee.phone || "Not provided"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Joined Organization</span>
                  <span className="font-medium">{viewingEmployee.joiningDate}</span>
                </div>
              </div>

              {/* Leave records */}
              <div className="space-y-2">
                <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Recorded Leaves ({employeeLeaves.length})
                </h5>
                {employeeLeaves.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-3 text-center border rounded">
                    No leave requests found for this employee.
                  </p>
                ) : (
                  <div className="max-h-48 overflow-y-auto rounded border divide-y">
                    {employeeLeaves.map((l) => (
                      <div key={l.id} className="p-2.5 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-medium">{l.leaveTypeLabel} ({l.days}d)</p>
                          <p className="text-[11px] text-muted-foreground">{l.startDate} to {l.endDate}</p>
                        </div>
                        <StatusBadge status={l.status} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setViewingEmployee(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
