import React from "react";
import { Badge } from "@/components/ui/badge";

const statusConfig = {
  pending: { variant: "warning", label: "Pending" },
  approved: { variant: "success", label: "Approved" },
  rejected: { variant: "destructive", label: "Rejected" },
  cancelled: { variant: "secondary", label: "Cancelled" },
  active: { variant: "success", label: "Active" },
  inactive: { variant: "secondary", label: "Inactive" },
};

export default function StatusBadge({ status }) {
  const config = statusConfig[status] || { variant: "outline", label: status };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
