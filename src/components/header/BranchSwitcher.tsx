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
        className="flex h-11 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-300 dark:hover:bg-white/[0.06]"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-xs font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
          {activeBranch.code}
        </span>
        <span className="hidden max-w-[150px] truncate text-left xl:block">
          {activeBranch.name}
        </span>
        <SwitchIcon className="h-4 w-4 text-gray-500" />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-[300px] rounded-xl border border-gray-200 bg-white p-2 shadow-theme-lg dark:border-gray-800 dark:bg-gray-900">
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
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
              >
                <span className="min-w-0">
                  <span className="block truncate font-medium">{branch.name}</span>
                  <span className="block truncate text-xs opacity-70">{branch.city}</span>
                </span>
                <span className="ml-3 rounded-md bg-white px-2 py-1 text-xs font-semibold text-gray-600 dark:bg-white/[0.08] dark:text-gray-300">
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
