import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard, CalendarPlus, FileText, History, Wallet,
  ShieldCheck, ClipboardCheck, Users, BookOpen, BarChart3,
  PanelLeftClose, PanelLeftOpen, LogOut, Settings, Leaf, ChevronDown,
} from "lucide-react";

const employeeNav = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/apply-leave", label: "Apply for Leave", icon: CalendarPlus },
  { to: "/leave-requests", label: "My Leave Requests", icon: FileText },
  { to: "/leave-history", label: "Leave History", icon: History },
  { to: "/leave-balance", label: "Leave Balance", icon: Wallet },
];

const adminNav = [
  { to: "/admin", label: "Admin Dashboard", icon: ShieldCheck },
  { to: "/admin/approvals", label: "Leave Approvals", icon: ClipboardCheck },
  { to: "/admin/employees", label: "Employees", icon: Users },
  { to: "/admin/policies", label: "Leave Policies", icon: BookOpen },
  { to: "/admin/reports", label: "Reports", icon: BarChart3 },
];

export default function AppSidebar({ collapsed, setCollapsed }) {
  const { user, logout, isAdmin } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-screen flex-col border-r bg-sidebar text-sidebar-foreground transition-all duration-300",
          collapsed ? "w-[68px]" : "w-[260px]"
        )}
      >
        {/* Brand */}
        <div className="flex h-14 items-center gap-2.5 border-b px-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Leaf className="h-4 w-4" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold leading-tight">LeaveFlow</span>
              <span className="text-[10px] text-muted-foreground leading-tight">People Operations</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className={cn("ml-auto h-7 w-7 shrink-0", collapsed && "ml-0")}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {/* Workspace */}
          <div>
            {!collapsed && <p className="mb-2 px-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Workspace</p>}
            <div className="space-y-0.5">
              {employeeNav.map((item) => {
                const Icon = item.icon;
                const link = (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        collapsed && "justify-center px-2"
                      )
                    }
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </NavLink>
                );

                if (collapsed) {
                  return (
                    <Tooltip key={item.to}>
                      <TooltipTrigger asChild>{link}</TooltipTrigger>
                      <TooltipContent side="right">{item.label}</TooltipContent>
                    </Tooltip>
                  );
                }
                return link;
              })}
            </div>
          </div>

          {/* Admin */}
          {isAdmin && (
            <div>
              <Separator className="mb-4" />
              {!collapsed && <p className="mb-2 px-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Administration</p>}
              <div className="space-y-0.5">
                {adminNav.map((item) => {
                  const Icon = item.icon;
                  const link = (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === "/admin"}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                          collapsed && "justify-center px-2"
                        )
                      }
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.label}</span>}
                    </NavLink>
                  );

                  if (collapsed) {
                    return (
                      <Tooltip key={item.to}>
                        <TooltipTrigger asChild>{link}</TooltipTrigger>
                        <TooltipContent side="right">{item.label}</TooltipContent>
                      </Tooltip>
                    );
                  }
                  return link;
                })}
              </div>
            </div>
          )}
        </nav>

        {/* User */}
        <div className="border-t p-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left text-sm hover:bg-sidebar-accent transition-colors",
                  collapsed && "justify-center px-0"
                )}
              >
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">{initials}</AvatarFallback>
                </Avatar>
                {!collapsed && (
                  <div className="flex-1 overflow-hidden">
                    <p className="truncate text-sm font-medium leading-tight">{user?.name}</p>
                    <p className="truncate text-[11px] text-muted-foreground leading-tight capitalize">{user?.role}</p>
                  </div>
                )}
                {!collapsed && <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="top" className="w-56">
              <DropdownMenuLabel>
                <p className="font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground font-normal">{user?.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {}}>
                <Settings className="mr-2 h-4 w-4" /> Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" /> Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>
    </TooltipProvider>
  );
}
