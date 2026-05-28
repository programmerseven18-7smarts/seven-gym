"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRole } from "@/context/RoleContext";
import { SwitchIcon } from "@/icons/gym-icons";

const BranchSwitcher: React.FC = () => {
  const { activeBranch, accessibleBranches, setActiveBranch } = useRole();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="flex h-11 items-center gap-2 rounded-lg border border-brand-100 bg-white/80 px-3 text-sm font-medium text-gray-700 shadow-theme-xs transition-colors hover:border-brand-200 hover:bg-brand-50/80 hover:text-brand-800 dark:border-brand-500/15 dark:bg-white/[0.04] dark:text-gray-300 dark:hover:border-brand-500/30 dark:hover:bg-brand-500/10 dark:hover:text-brand-300"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-400 to-blue-light-400 text-xs font-bold text-white shadow-[0_10px_20px_rgba(0,230,118,0.25)]">
          {activeBranch.code}
        </span>
        <span className="hidden max-w-[150px] truncate text-left xl:block">
          {activeBranch.name}
        </span>
        <SwitchIcon className="h-4 w-4 text-brand-600 dark:text-brand-300" />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-[300px] rounded-xl border border-brand-100 bg-white p-2 shadow-theme-lg dark:border-brand-500/15 dark:bg-[#0b1117]">
          <div className="px-2 py-2">
            <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
              Switch Cabang
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Data halaman mengikuti cabang aktif.
            </p>
          </div>
          <div className="mt-1 grid gap-1">
            {accessibleBranches.map((branch) => (
              <button
                key={branch.id}
                type="button"
                onClick={() => {
                  setActiveBranch(branch.id);
                  setIsOpen(false);
                }}
                className={`flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  activeBranch.id === branch.id
                    ? "bg-brand-50 text-brand-800 shadow-[inset_3px_0_0_var(--color-brand-500)] dark:bg-brand-500/[0.12] dark:text-brand-300"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
              >
                <span className="min-w-0">
                  <span className="block truncate font-medium">{branch.name}</span>
                  <span className="block truncate text-xs opacity-70">{branch.city}</span>
                </span>
                <span className="ml-3 rounded-md bg-white px-2 py-1 text-xs font-semibold text-brand-700 dark:bg-white/[0.08] dark:text-brand-300">
                  {branch.code}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BranchSwitcher;
