import React, { useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import AppSidebar from "./AppSidebar";
import AppHeader from "./AppHeader";
import { cn } from "@/lib/utils";

export default function AppLayout() {
  const { isAuthenticated } = useApp();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed left-0 top-0 h-full w-[260px] z-50">
            <AppSidebar collapsed={false} setCollapsed={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <AppSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      </div>

      {/* Main content */}
      <div className={cn("flex flex-col transition-all duration-300", sidebarCollapsed ? "md:ml-[68px]" : "md:ml-[260px]")}>
        <AppHeader onMobileMenuOpen={() => setMobileMenuOpen(true)} />
        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
