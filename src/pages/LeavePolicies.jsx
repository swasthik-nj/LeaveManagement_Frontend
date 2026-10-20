import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  BookOpen,
  Edit,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Sparkles,
  Info,
  RotateCcw
} from "lucide-react";

export default function LeavePolicies() {
  const { leavePolicies, updatePolicy } = useApp();
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleOpenEdit = (policy) => {
    setEditingPolicy({ ...policy });
  };

  const handleSavePolicy = (e) => {
    e.preventDefault();
    if (!editingPolicy) return;

    updatePolicy(editingPolicy.id, {
      totalDays: Number(editingPolicy.totalDays),
      carryForward: editingPolicy.carryForward,
      maxCarryForward: Number(editingPolicy.maxCarryForward || 0),
      approvalRequired: editingPolicy.approvalRequired,
      description: editingPolicy.description,
    });
    setEditingPolicy(null);
  };

  const handleSimulateYearEndReset = () => {
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Leave Policies & Rules</h1>
          <p className="text-sm text-muted-foreground">
            Configure statutory and company leave entitlements, carry forward thresholds, and approval workflows.
          </p>
        </div>
        <Button
          variant="outline"
          className="gap-2"
          onClick={handleSimulateYearEndReset}
        >
          <RotateCcw className="h-4 w-4" />
          Simulate Year-End Rollover
        </Button>
      </div>

      {resetSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 rounded-lg text-sm flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>
            Year-end rollover simulated successfully! Unused balances were processed and eligible days carried forward according to policy rules.
          </span>
        </div>
      )}

      {/* Policy Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {leavePolicies.map((policy) => (
          <Card key={policy.id} className="relative flex flex-col justify-between">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{policy.label}</CardTitle>
                    <p className="text-xs text-muted-foreground font-mono">Policy ID: {policy.id}</p>
                  </div>
                </div>
                <Badge variant={policy.approvalRequired ? "default" : "secondary"} className="text-xs">
                  {policy.approvalRequired ? "Requires Approval" : "Auto-Approved"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 flex-1">
              <p className="text-xs text-muted-foreground leading-relaxed">
                {policy.description}
              </p>

              <div className="grid grid-cols-2 gap-3 p-3 bg-muted/30 rounded-lg text-xs">
                <div>
                  <span className="text-muted-foreground block">Annual Entitlement</span>
                  <span className="text-lg font-bold text-foreground">{policy.totalDays} Days</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Carry Forward</span>
                  <span className="text-sm font-semibold text-foreground">
                    {policy.carryForward ? `Yes (Up to ${policy.maxCarryForward}d)` : "Disabled"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Manager Approval</span>
                  <span className="text-sm font-semibold text-foreground">
                    {policy.approvalRequired ? "Mandatory" : "Not Required"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Type Category</span>
                  <span className="text-sm font-semibold capitalize text-foreground">{policy.type}</span>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenEdit(policy)}
                  className="gap-1.5"
                >
                  <Edit className="h-3.5 w-3.5" />
                  Edit Policy Terms
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Policy Dialog */}
      <Dialog open={!!editingPolicy} onOpenChange={(open) => !open && setEditingPolicy(null)}>
        <DialogContent className="sm:max-w-md">
          {editingPolicy && (
            <form onSubmit={handleSavePolicy}>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Edit className="h-5 w-5 text-primary" />
                  <span>Configure {editingPolicy.label}</span>
                </DialogTitle>
                <DialogDescription>
                  Update entitlement limits and workflow constraints for this leave category.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-3 text-sm">
                <div className="space-y-1">
                  <Label htmlFor="policy-days" className="text-xs">Annual Entitlement (Days) *</Label>
                  <Input
                    id="policy-days"
                    type="number"
                    min="1"
                    max="60"
                    value={editingPolicy.totalDays}
                    onChange={(e) =>
                      setEditingPolicy({ ...editingPolicy, totalDays: e.target.value })
                    }
                    className="h-9"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="policy-desc" className="text-xs">Policy Terms & Conditions</Label>
                  <Textarea
                    id="policy-desc"
                    value={editingPolicy.description}
                    onChange={(e) =>
                      setEditingPolicy({ ...editingPolicy, description: e.target.value })
                    }
                    rows={3}
                  />
                </div>

                <div className="p-3 rounded-lg border bg-muted/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="carry-toggle" className="text-xs font-semibold">
                        Allow Carry Forward
                      </Label>
                      <p className="text-[11px] text-muted-foreground">
                        Roll over unused balances to the following calendar year.
                      </p>
                    </div>
                    <Switch
                      id="carry-toggle"
                      checked={editingPolicy.carryForward}
                      onCheckedChange={(checked) =>
                        setEditingPolicy({ ...editingPolicy, carryForward: checked })
                      }
                    />
                  </div>

                  {editingPolicy.carryForward && (
                    <div className="pt-2 border-t space-y-1">
                      <Label htmlFor="max-carry" className="text-xs">Max Days Allowed to Carry Forward</Label>
                      <Input
                        id="max-carry"
                        type="number"
                        min="1"
                        max="30"
                        value={editingPolicy.maxCarryForward}
                        onChange={(e) =>
                          setEditingPolicy({
                            ...editingPolicy,
                            maxCarryForward: e.target.value,
                          })
                        }
                        className="h-9"
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                  <div>
                    <Label htmlFor="approval-toggle" className="text-xs font-semibold">
                      Require Management Approval
                    </Label>
                    <p className="text-[11px] text-muted-foreground">
                      If disabled, leave requests will automatically be granted.
                    </p>
                  </div>
                  <Switch
                    id="approval-toggle"
                    checked={editingPolicy.approvalRequired}
                    onCheckedChange={(checked) =>
                      setEditingPolicy({ ...editingPolicy, approvalRequired: checked })
                    }
                  />
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button type="button" variant="outline" size="sm" onClick={() => setEditingPolicy(null)}>
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
    </div>
  );
}
