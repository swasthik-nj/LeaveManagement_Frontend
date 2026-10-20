import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { calculateWorkingDays, formatDate } from "@/lib/dateUtils";
import { calculateLeaveBalance } from "@/lib/calculations";
import { LEAVE_TYPES } from "@/data/demoData";
import { CalendarIcon, Check, ChevronsUpDown, Loader2, Upload, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function ApplyLeave() {
  const navigate = useNavigate();
  const { user, leaveRequests, leavePolicies, addLeaveRequest } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [typeOpen, setTypeOpen] = useState(false);
  const [startOpen, setStartOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);
  const [fileName, setFileName] = useState("");
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    leaveType: "",
    startDate: null,
    endDate: null,
    halfDay: false,
    reason: "",
  });

  const myRequests = useMemo(
    () => leaveRequests.filter((r) => r.employeeId === user?.employeeId),
    [leaveRequests, user]
  );

  const selectedPolicy = leavePolicies.find((p) => p.type === form.leaveType);
  const balance = selectedPolicy
    ? calculateLeaveBalance(myRequests, form.leaveType, selectedPolicy.totalDays)
    : null;

  const workingDays = useMemo(() => {
    if (!form.startDate || !form.endDate) return 0;
    const days = calculateWorkingDays(form.startDate, form.endDate);
    return form.halfDay ? Math.max(days - 0.5, 0.5) : days;
  }, [form.startDate, form.endDate, form.halfDay]);

  const remainingAfter = balance ? balance.available - workingDays : null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const validate = () => {
    const e = {};
    if (!form.leaveType) e.leaveType = "Select a leave type";
    if (!form.startDate) e.startDate = "Select a start date";
    if (!form.endDate) e.endDate = "Select an end date";
    if (form.startDate && form.endDate && form.endDate < form.startDate) e.endDate = "End date must be after start date";
    if (!form.reason.trim()) e.reason = "Please provide a reason";
    if (workingDays <= 0 && form.startDate && form.endDate) e.endDate = "Selected range has no working days";
    if (remainingAfter !== null && remainingAfter < 0) e.leaveType = "Insufficient leave balance";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);

    const selectedType = LEAVE_TYPES.find((t) => t.value === form.leaveType);
    const startStr = formatDate(form.startDate, "yyyy-MM-dd");
    const endStr = formatDate(form.endDate, "yyyy-MM-dd");

    const result = await addLeaveRequest({
      employeeId: user?.employeeId,
      employeeName: user?.name,
      department: user?.department,
      leaveType: form.leaveType,
      leaveTypeLabel: selectedType?.label || form.leaveType,
      startDate: startStr,
      endDate: endStr,
      days: workingDays,
      isHalfDay: form.isHalfDay,
      reason: form.reason.trim(),
    });

    if (result.success) {
      toast.success("Leave request submitted and saved to database!");
      navigate("/leave-requests");
    } else {
      toast.error(result.message || "Failed to submit leave request.");
    }
    setIsSubmitting(false);
  };

  const FieldError = ({ field }) => errors[field] ? <p className="text-xs text-destructive mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors[field]}</p> : null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Apply for Leave</h1>
        <p className="text-muted-foreground text-sm mt-1">Submit a new leave request for approval.</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Leave type combobox */}
            <div className="space-y-2">
              <Label>Leave Type</Label>
              <Popover open={typeOpen} onOpenChange={setTypeOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" aria-expanded={typeOpen} className={cn("w-full justify-between font-normal", !form.leaveType && "text-muted-foreground")}>
                    {form.leaveType ? LEAVE_TYPES.find((t) => t.value === form.leaveType)?.label : "Select leave type…"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search leave types…" />
                    <CommandList>
                      <CommandEmpty>No leave type found.</CommandEmpty>
                      <CommandGroup>
                        {LEAVE_TYPES.map((t) => {
                          const pol = leavePolicies.find((p) => p.type === t.value);
                          const bal = pol ? calculateLeaveBalance(myRequests, t.value, pol.totalDays) : null;
                          return (
                            <CommandItem
                              key={t.value}
                              value={t.value}
                              onSelect={(v) => { setForm((p) => ({ ...p, leaveType: v })); setTypeOpen(false); if (errors.leaveType) setErrors((p) => ({ ...p, leaveType: "" })); }}
                            >
                              <Check className={cn("mr-2 h-4 w-4", form.leaveType === t.value ? "opacity-100" : "opacity-0")} />
                              <span className="flex-1">{t.label}</span>
                              {bal && <span className="text-xs text-muted-foreground">{bal.available} days available</span>}
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FieldError field="leaveType" />
            </div>

            {/* Date pickers */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover open={startOpen} onOpenChange={setStartOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start font-normal", !form.startDate && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {form.startDate ? formatDate(form.startDate) : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={form.startDate}
                      onSelect={(d) => {
                        setForm((p) => ({ ...p, startDate: d, endDate: p.endDate && p.endDate < d ? d : p.endDate }));
                        setStartOpen(false);
                        if (errors.startDate) setErrors((p) => ({ ...p, startDate: "" }));
                      }}
                      disabled={(date) => date < today}
                    />
                  </PopoverContent>
                </Popover>
                <FieldError field="startDate" />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Popover open={endOpen} onOpenChange={setEndOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start font-normal", !form.endDate && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {form.endDate ? formatDate(form.endDate) : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={form.endDate}
                      onSelect={(d) => {
                        setForm((p) => ({ ...p, endDate: d }));
                        setEndOpen(false);
                        if (errors.endDate) setErrors((p) => ({ ...p, endDate: "" }));
                      }}
                      disabled={(date) => date < today || (form.startDate && date < form.startDate)}
                    />
                  </PopoverContent>
                </Popover>
                <FieldError field="endDate" />
              </div>
            </div>

            {/* Half day toggle */}
            <div className="flex items-center justify-between rounded-lg border p-3.5">
              <div>
                <p className="text-sm font-medium">Half-day leave</p>
                <p className="text-xs text-muted-foreground">Apply for half a working day</p>
              </div>
              <Switch checked={form.halfDay} onCheckedChange={(c) => setForm((p) => ({ ...p, halfDay: c }))} />
            </div>

            {/* Working days info */}
            {form.startDate && form.endDate && (
              <div className="rounded-lg border bg-muted/30 p-3.5 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Working days</span>
                  <span className="font-medium">{workingDays} day{workingDays !== 1 ? "s" : ""}</span>
                </div>
                {balance && (
                  <>
                    <Separator />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Current balance</span>
                      <span className="font-medium">{balance.available} days</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Balance after request</span>
                      <span className={cn("font-medium", remainingAfter < 0 && "text-destructive")}>
                        {remainingAfter} days {remainingAfter < 0 ? "(insufficient)" : ""}
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Reason */}
            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Textarea
                id="reason"
                placeholder="Describe the reason for your leave request…"
                value={form.reason}
                onChange={(e) => { setForm((p) => ({ ...p, reason: e.target.value })); if (errors.reason) setErrors((p) => ({ ...p, reason: "" })); }}
                rows={3}
              />
              <FieldError field="reason" />
            </div>

            {/* File upload */}
            <div className="space-y-2">
              <Label>Supporting Document (optional)</Label>
              <div className="flex items-center gap-3">
                <Button type="button" variant="outline" size="sm" onClick={() => {
                  setFileName("medical_certificate.pdf");
                  toast.info("Demo: File selected (not actually uploaded)");
                }}>
                  <Upload className="h-4 w-4 mr-1.5" /> Choose file
                </Button>
                {fileName && <span className="text-sm text-muted-foreground">{fileName}</span>}
              </div>
            </div>

            <Separator />

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</> : "Submit Request"}
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              ⓘ Frontend demo — requests are stored in memory and will reset on page refresh.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
