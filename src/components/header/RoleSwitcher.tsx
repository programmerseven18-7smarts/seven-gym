"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  mockLoginUsers,
  roleLabels,
  useRole,
  UserRole,
} from "@/context/RoleContext";
import { SwitchIcon } from "@/icons/gym-icons";

const getRoleColor = (role: UserRole) => {
  switch (role) {
    case "owner":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400";
    case "staff":
      return "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400";
    case "trainer":
      return "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400";
    case "member":
      return "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-400";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const getRoleBadgeColor = (role: UserRole) => {
  switch (role) {
    case "owner":
      return "bg-emerald-500";
    case "staff":
      return "bg-amber-500";
    case "trainer":
      return "bg-rose-500";
    case "member":
      return "bg-sky-500";
    default:
      return "bg-gray-500";
  }
};

const RoleSwitcher: React.FC = () => {
  const {
    currentRole,
    currentUser,
    loginAsUser,
    logout,
    refreshSession,
    sessionToken,
  } = useRole();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
      >
        <div className="relative">
          <Image
            src={currentUser.avatar}
            alt={currentUser.name}
            width={32}
            height={32}
            className="rounded-full"
          />
          <span
            className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white dark:border-gray-800 ${getRoleBadgeColor(currentRole)}`}
          />
        </div>
        <div className="hidden text-left md:block">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {currentUser.name}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {roleLabels[currentRole]}
          </p>
        </div>
        <SwitchIcon className="h-4 w-4 text-gray-500" />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-[360px] rounded-xl border border-gray-200 bg-white shadow-theme-lg dark:border-gray-800 dark:bg-gray-900">
          <div className="border-b border-gray-200 p-4 dark:border-gray-800">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                  Dummy Session
                </p>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  Role dan menu mengikuti user yang sedang login.
                </p>
              </div>
              <span className={`rounded-full px-2 py-1 text-xs font-medium ${getRoleColor(currentRole)}`}>
                {roleLabels[currentRole]}
              </span>
            </div>
            <div className="mt-3 rounded-lg bg-gray-50 p-3 dark:bg-white/[0.04]">
              <p className="text-xs text-gray-500 dark:text-gray-400">Token</p>
              <p className="mt-1 truncate font-mono text-xs text-gray-700 dark:text-gray-300">
                {sessionToken}
              </p>
            </div>
          </div>

          <div className="max-h-[320px] overflow-y-auto p-2">
            <p className="px-2 py-2 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
              Login sebagai user
            </p>
            {mockLoginUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => {
                  loginAsUser(user.id);
                  setIsOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 transition-colors ${
                  currentUser.id === user.id
                    ? getRoleColor(user.role)
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <div className="relative">
                  <Image
                    src={user.avatar}
                    alt={user.name}
                    width={34}
                    height={34}
                    className="rounded-full"
                  />
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-gray-900 ${getRoleBadgeColor(user.role)}`}
                  />
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                    {user.name}
                  </p>
                  <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                    {roleLabels[user.role]} / {user.branchAccess.length} cabang
                  </p>
                </div>
                {currentUser.id === user.id && (
                  <svg className="h-5 w-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>

          <div className="flex gap-2 border-t border-gray-200 p-3 dark:border-gray-800">
            <button
              onClick={refreshSession}
              className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Refresh Token
            </button>
            <button
              onClick={logout}
              className="flex-1 rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleSwitcher;
