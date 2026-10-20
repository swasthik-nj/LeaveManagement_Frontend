import React from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Bell, LogOut, Settings, Search, PanelLeftOpen, ChevronRight } from "lucide-react";

const routeTitles = {
  "/dashboard": "Overview",
  "/apply-leave": "Apply for Leave",
  "/leave-requests": "My Leave Requests",
  "/leave-history": "Leave History",
  "/leave-balance": "Leave Balance",
  "/admin": "Admin Dashboard",
  "/admin/approvals": "Leave Approvals",
  "/admin/employees": "Employees",
  "/admin/policies": "Leave Policies",
  "/admin/reports": "Reports",
};

export default function AppHeader({ onMobileMenuOpen }) {
  const { user, logout } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const pageTitle = routeTitles[location.pathname] || "Dashboard";
  const isAdmin = location.pathname.startsWith("/admin");

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 sm:px-6">
      {/* Mobile menu button */}
      <Button variant="ghost" size="icon" className="md:hidden" onClick={onMobileMenuOpen} aria-label="Open menu">
        <PanelLeftOpen className="h-5 w-5" />
      </Button>

      {/* Breadcrumb */}
      <nav className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link to="/dashboard" className="hover:text-foreground transition-colors">LeaveFlow</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        {isAdmin && (
          <>
            <Link to="/admin" className="hover:text-foreground transition-colors">Admin</Link>
            <ChevronRight className="h-3.5 w-3.5" />
          </>
        )}
        <span className="font-medium text-foreground">{pageTitle}</span>
      </nav>

      {/* Mobile title */}
      <span className="sm:hidden text-sm font-semibold">{pageTitle}</span>

      <div className="ml-auto flex items-center gap-2">
        {/* Search trigger */}
        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Search">
          <Search className="h-4 w-4" />
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="h-8 w-8 relative" aria-label="Notifications">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
        </Button>

        <Separator orientation="vertical" className="h-6 mx-1 hidden sm:block" />

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 gap-2 px-2">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-primary/10 text-primary text-[10px]">{initials}</AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline text-sm font-medium">{user?.name?.split(" ")[0]}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <p className="font-medium">{user?.name}</p>
              <p className="text-xs text-muted-foreground font-normal">{user?.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
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
    </header>
  );
}
