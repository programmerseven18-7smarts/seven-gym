"use client";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRole, UserRole } from "@/context/RoleContext";
import { SwitchIcon } from "@/icons/gym-icons";

const roleOptions: { role: UserRole; label: string; description: string }[] = [
  { role: "admin", label: "Admin / Owner", description: "Full access to all features" },
  { role: "member", label: "Member", description: "Access member area" },
  { role: "trainer", label: "Personal Trainer", description: "Manage clients & schedule" },
];

const RoleSwitcher: React.FC = () => {
  const { currentRole, currentUser, setRole } = useRole();
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

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case "admin":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400";
      case "member":
        return "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-400";
      case "trainer":
        return "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case "admin":
        return "bg-emerald-500";
      case "member":
        return "bg-cyan-500";
      case "trainer":
        return "bg-amber-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
      >
        <div className="relative">
          <Image
            src={currentUser.avatar}
            alt={currentUser.name}
            width={32}
            height={32}
            className="rounded-full"
          />
          <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${getRoleBadgeColor(currentRole)}`} />
        </div>
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-gray-900 dark:text-white">{currentUser.name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{currentRole}</p>
        </div>
        <SwitchIcon className="w-4 h-4 text-gray-500" />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 w-72 mt-2 bg-white border border-gray-200 rounded-xl shadow-theme-lg dark:bg-gray-900 dark:border-gray-800">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Switch Role (Demo)</p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              Select a role to view different interfaces
            </p>
          </div>
          <div className="p-2">
            {roleOptions.map((option) => (
              <button
                key={option.role}
                onClick={() => {
                  setRole(option.role);
                  setIsOpen(false);
                }}
                className={`flex items-center gap-3 w-full px-3 py-3 rounded-lg transition-colors ${
                  currentRole === option.role
                    ? getRoleColor(option.role)
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${getRoleBadgeColor(option.role)}`} />
                <div className="text-left">
                  <p className={`text-sm font-medium ${
                    currentRole === option.role 
                      ? "" 
                      : "text-gray-900 dark:text-white"
                  }`}>
                    {option.label}
                  </p>
                  <p className={`text-xs ${
                    currentRole === option.role 
                      ? "opacity-75" 
                      : "text-gray-500 dark:text-gray-400"
                  }`}>
                    {option.description}
                  </p>
                </div>
                {currentRole === option.role && (
                  <svg className="w-5 h-5 ml-auto" fill="currentColor" viewBox="0 0 20 20">
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
        </div>
      )}
    </div>
  );
};

export default RoleSwitcher;
