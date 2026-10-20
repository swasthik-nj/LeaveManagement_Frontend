import React, { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { DEMO_ACCOUNTS } from "@/data/demoData";

export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useApp();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({ email: "", password: "", remember: false });

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    // Simulate network delay
    await new Promise((r) => setTimeout(r, 800));

    const result = await login(formData.email.trim(), formData.password);
    if (result.success) {
      toast.success(`Welcome back, ${result.user.name.split(" ")[0]}!`);
      navigate("/dashboard");
    } else {
      setError(result.message || "Invalid credentials");
      toast.error(result.message || "Invalid credentials");
    }
    setIsSubmitting(false);
  };

  const fillDemo = (account) => {
    setFormData({ email: account.email, password: account.password, remember: false });
    setError("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 p-4">
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-[960px] grid gap-8 lg:grid-cols-2 items-center">
        {/* Left side – branding */}
        <div className="hidden lg:flex flex-col gap-6 px-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Leaf className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold">LeaveFlow</h1>
              <p className="text-xs text-muted-foreground">People Operations</p>
            </div>
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-bold leading-tight text-foreground">
              Streamline your team's<br />leave management
            </h2>
            <p className="text-muted-foreground max-w-sm">
              Track balances, manage approvals, and keep your team aligned — all in one elegant dashboard.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 max-w-sm">
            <div className="rounded-xl border bg-card p-3.5 shadow-sm">
              <p className="text-2xl font-bold">98%</p>
              <p className="text-xs text-muted-foreground mt-0.5">Approval rate</p>
            </div>
            <div className="rounded-xl border bg-card p-3.5 shadow-sm">
              <p className="text-2xl font-bold">2.4h</p>
              <p className="text-xs text-muted-foreground mt-0.5">Avg. response time</p>
            </div>
          </div>
        </div>

        {/* Right side – login form */}
        <Card className="w-full max-w-md mx-auto shadow-lg border-border/50">
          <CardHeader className="space-y-1 text-center">
            <div className="flex items-center justify-center gap-2 lg:hidden mb-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Leaf className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold">LeaveFlow</span>
            </div>
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription>Sign in to your account to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  name="email"
                  type="email"
                  placeholder="you@leaveflow.io"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <div className="relative">
                  <Input
                    id="login-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="pr-10"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="remember"
                    checked={formData.remember}
                    onCheckedChange={(checked) => setFormData((p) => ({ ...p, remember: checked }))}
                  />
                  <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">Remember me</Label>
                </div>
                <button type="button" className="text-sm text-primary hover:underline">
                  Forgot password?
                </button>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/register" className="text-primary hover:underline font-medium">
                  Create one
                </Link>
              </p>
            </form>

            {/* Demo accounts */}
            <div className="mt-6 pt-4 border-t">
              <p className="text-xs text-muted-foreground mb-3 text-center">Demo accounts for testing</p>
              <div className="grid gap-2">
                {DEMO_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.email}
                    onClick={() => fillDemo(acc)}
                    className="flex items-center justify-between rounded-lg border px-3 py-2.5 text-left text-sm hover:bg-accent transition-colors"
                  >
                    <div>
                      <p className="font-medium">{acc.name}</p>
                      <p className="text-xs text-muted-foreground">{acc.email}</p>
                    </div>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full capitalize">{acc.role}</span>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
