"use client";
import React from "react";
import { useRole } from "@/context/RoleContext";
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import MemberDashboard from "@/components/dashboard/MemberDashboard";
import TrainerDashboard from "@/components/dashboard/TrainerDashboard";

export default function DashboardPage() {
  const { currentRole } = useRole();

  if (currentRole === "member") {
    return <MemberDashboard />;
  }

  if (currentRole === "trainer") {
    return <TrainerDashboard />;
  }

  return <AdminDashboard />;
}
