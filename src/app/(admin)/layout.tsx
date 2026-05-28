"use client";

import { useSidebar } from "@/context/SidebarContext";
import { useRole } from "@/context/RoleContext";
import DummyLoginPanel from "@/components/auth/DummyLoginPanel";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import { findNavAccessByPath } from "@/layout/gymNavigationConfig";
import { ShieldIcon } from "@/icons/gym-icons";
import { usePathname } from "next/navigation";
import React from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const { currentRole, hasAnyPermission, hasRole, isAuthenticated, isSessionReady } = useRole();
  const pathname = usePathname();

  if (!isSessionReady) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-8 dark:bg-gray-950">
        <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center justify-center">
          <div className="w-full rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="mx-auto h-12 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10" />
            <div className="mx-auto mt-5 h-5 w-40 rounded bg-gray-100 dark:bg-gray-800" />
            <div className="mx-auto mt-3 h-3 w-56 rounded bg-gray-100 dark:bg-gray-800" />
          </div>
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return <DummyLoginPanel />;
  }

  // Dynamic class for main content margin based on sidebar state
  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[290px]"
    : "lg:ml-[90px]";
  const routeAccess = pathname === "/" ? undefined : findNavAccessByPath(pathname, currentRole);
  const isAccessDenied = Boolean(
    routeAccess &&
      (!hasRole(routeAccess.requiredRolesAny) ||
        !hasAnyPermission(routeAccess.requiredAny)),
  );

  return (
    <div className="min-h-screen xl:flex">
      {/* Sidebar and Backdrop */}
      <AppSidebar />
      <Backdrop />
      {/* Main Content Area */}
      <div
        className={`admin-main-content flex-1 transition-all  duration-300 ease-in-out ${mainContentMargin}`}
      >
        {/* Header */}
        <AppHeader />
        {/* Page Content */}
        <div className="admin-page-content p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
          {isAccessDenied ? (
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
                <ShieldIcon className="h-7 w-7" />
              </div>
              <h1 className="mt-5 text-xl font-semibold text-gray-900 dark:text-white">
                Akses Ditolak
              </h1>
              <p className="mx-auto mt-2 max-w-md text-sm text-gray-500 dark:text-gray-400">
                User yang sedang login tidak punya permission untuk membuka menu
                {routeAccess ? ` ${routeAccess.parent} / ${routeAccess.name}` : ""}.
              </p>
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );
}
