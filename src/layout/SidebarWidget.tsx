"use client";

import React from "react";
import { roleLabels, useRole } from "@/context/RoleContext";

export default function SidebarWidget() {
  const { activeBranch, currentRole } = useRole();

  return (
    <div className="mx-auto mb-10 w-full max-w-60 rounded-2xl border border-brand-100/80 bg-gradient-to-br from-brand-50 via-white to-blue-light-50 px-4 py-5 text-center shadow-[0_16px_34px_rgba(0,230,118,0.08)] dark:border-brand-500/15 dark:from-brand-500/10 dark:via-white/[0.03] dark:to-blue-light-500/10">
      <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
        Seven Gym Control
      </h3>
      <p className="mb-4 text-gray-500 text-theme-sm dark:text-gray-400">
        Prototype operasional gym berbasis role dan cabang.
      </p>
      <div className="rounded-lg border border-brand-200/70 bg-white/80 p-3 text-brand-800 text-theme-sm shadow-[0_10px_24px_rgba(0,230,118,0.08)] dark:border-brand-500/20 dark:bg-brand-500/15 dark:text-brand-300">
        {roleLabels[currentRole]} / {activeBranch.code}
      </div>
    </div>
  );
}
