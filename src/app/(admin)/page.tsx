"use client";
import React from "react";
import { useRole } from "@/context/RoleContext";
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import TrainerDashboard from "@/components/dashboard/TrainerDashboard";
import GymPrototypePage from "@/components/gym/GymPrototypePage";

export default function DashboardPage() {
  const { currentRole } = useRole();

  if (currentRole === "trainer") {
    return <TrainerDashboard />;
  }

  if (currentRole === "member") {
    return <GymPrototypePage slug={["member"]} />;
  }

  return <AdminDashboard />;
}
