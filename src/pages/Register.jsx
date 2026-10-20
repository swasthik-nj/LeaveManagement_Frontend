import React, { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Leaf, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { DEPARTMENTS } from "@/data/demoData";

export default function Register() {
  const navigate = useNavigate();
  const { isAuthenticated } = useApp();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: "", email: "", employeeId: "", department: "", password: "", confirmPassword: "", role: "employee", terms: false,
  });

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!formData.name.trim()) e.name = "Full name is required";
    if (!formData.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = "Invalid email format";
    if (!formData.employeeId.trim()) e.employeeId = "Employee ID is required";
    if (!formData.department) e.department = "Department is required";
    if (formData.password.length < 6) e.password = "Password must be at least 6 characters";
    if (formData.password !== formData.confirmPassword) e.confirmPassword = "Passwords do not match";
    if (!formData.terms) e.terms = "You must accept the terms";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          employeeId: formData.employeeId.trim(),
          password: formData.password,
          department: formData.department,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Account registered successfully in the database! Please sign in.");
        navigate("/login");
      } else {
        const errorMsg = data.message || (data.errors && data.errors[0]) || "Registration failed.";
        toast.error(errorMsg);
        setErrors((prev) => ({ ...prev, email: errorMsg }));
      }
    } catch (err) {
      toast.error("Network error: Could not reach the backend server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const FieldError = ({ field }) => errors[field] ? <p className="text-xs text-destructive mt-1">{errors[field]}</p> : null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 p-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <Card className="relative z-10 w-full max-w-lg shadow-lg border-border/50">
        <CardHeader className="space-y-1 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Leaf className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold">LeaveFlow</span>
          </div>
          <CardTitle className="text-2xl">Create an account</CardTitle>
          <CardDescription>Get started with LeaveFlow today</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="reg-name">Full name</Label>
                <Input id="reg-name" name="name" placeholder="Alex Johnson" value={formData.name} onChange={handleChange} />
                <FieldError field="name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-empid">Employee ID</Label>
                <Input id="reg-empid" name="employeeId" placeholder="EMP-1001" value={formData.employeeId} onChange={handleChange} />
                <FieldError field="employeeId" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reg-email">Work email</Label>
              <Input id="reg-email" name="email" type="email" placeholder="you@leaveflow.io" value={formData.email} onChange={handleChange} />
              <FieldError field="email" />
            </div>

            <div className="space-y-2">
              <Label>Department</Label>
              <Select value={formData.department} onValueChange={(v) => { setFormData((p) => ({ ...p, department: v })); if (errors.department) setErrors((p) => ({ ...p, department: "" })); }}>
                <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((d) => (<SelectItem key={d} value={d}>{d}</SelectItem>))}
                </SelectContent>
              </Select>
              <FieldError field="department" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="reg-pw">Password</Label>
                <div className="relative">
                  <Input id="reg-pw" name="password" type={showPassword ? "text" : "password"} placeholder="Min. 6 characters" value={formData.password} onChange={handleChange} className="pr-10" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label="Toggle password">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <FieldError field="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-cpw">Confirm password</Label>
                <div className="relative">
                  <Input id="reg-cpw" name="confirmPassword" type={showConfirm ? "text" : "password"} placeholder="Re-enter password" value={formData.confirmPassword} onChange={handleChange} className="pr-10" />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label="Toggle confirm">
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <FieldError field="confirmPassword" />
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Checkbox id="terms" checked={formData.terms} onCheckedChange={(c) => { setFormData((p) => ({ ...p, terms: c })); if (errors.terms) setErrors((p) => ({ ...p, terms: "" })); }} className="mt-0.5" />
              <div>
                <Label htmlFor="terms" className="text-sm font-normal cursor-pointer">
                  I agree to the Terms of Service and Privacy Policy
                </Label>
                <FieldError field="terms" />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating account…</> : "Create account"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline font-medium">Sign in</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
