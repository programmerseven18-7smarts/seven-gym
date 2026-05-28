"use client";

import React from "react";
import { roleLabels, useRole } from "@/context/RoleContext";

export default function SidebarWidget() {
  const { activeBranch, currentRole } = useRole();

  return (
    <div className="mx-auto mb-10 w-full max-w-60 rounded-2xl bg-gray-50 px-4 py-5 text-center dark:bg-white/[0.03]">
      <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
        Seven Gym Control
      </h3>
      <p className="mb-4 text-gray-500 text-theme-sm dark:text-gray-400">
        Prototype operasional gym berbasis role dan cabang.
      </p>
      <div className="rounded-lg bg-brand-50 p-3 text-brand-700 text-theme-sm dark:bg-brand-500/15 dark:text-brand-300">
        {roleLabels[currentRole]} / {activeBranch.code}
      </div>
    </div>
  );
}
