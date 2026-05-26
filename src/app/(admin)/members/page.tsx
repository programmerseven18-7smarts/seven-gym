"use client";
import React, { useState } from "react";
import { members } from "@/data/mockData";
import Badge from "@/components/ui/badge/Badge";
import Image from "next/image";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";

export default function MembersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.phone.includes(searchTerm);
    const matchesStatus = filterStatus === "all" || member.membershipStatus === filterStatus;
    const matchesType = filterType === "all" || member.membershipType === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "success";
      case "expired":
        return "error";
      case "frozen":
        return "warning";
      default:
        return "light";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "VIP":
        return "warning";
      case "Premium":
        return "success";
      case "Basic":
        return "light";
      default:
        return "light";
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Daftar Member" />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="p-4 bg-white border border-gray-200 rounded-xl dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Member</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{members.length}</p>
        </div>
        <div className="p-4 bg-white border border-gray-200 rounded-xl dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">Member Aktif</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {members.filter((m) => m.membershipStatus === "active").length}
          </p>
        </div>
        <div className="p-4 bg-white border border-gray-200 rounded-xl dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">Member Expired</p>
          <p className="mt-1 text-2xl font-bold text-error-600 dark:text-error-400">
            {members.filter((m) => m.membershipStatus === "expired").length}
          </p>
        </div>
        <div className="p-4 bg-white border border-gray-200 rounded-xl dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">Member Frozen</p>
          <p className="mt-1 text-2xl font-bold text-warning-600 dark:text-warning-400">
            {members.filter((m) => m.membershipStatus === "frozen").length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="p-5 bg-white border border-gray-200 rounded-2xl dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row">
            {/* Search */}
            <div className="relative">
              <svg
                className="absolute w-5 h-5 text-gray-400 left-3 top-1/2 -translate-y-1/2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Cari member..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-2 pl-10 pr-4 text-sm border border-gray-200 rounded-lg sm:w-64 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 text-sm border border-gray-200 rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            >
              <option value="all">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="expired">Expired</option>
              <option value="frozen">Frozen</option>
            </select>

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 text-sm border border-gray-200 rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            >
              <option value="all">Semua Tipe</option>
              <option value="Basic">Basic</option>
              <option value="Premium">Premium</option>
              <option value="VIP">VIP</option>
            </select>
          </div>

          <button className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg bg-emerald-500 hover:bg-emerald-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tambah Member
          </button>
        </div>
      </div>

      {/* Members Table */}
      <div className="overflow-hidden bg-white border border-gray-200 rounded-2xl dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-5 py-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                  Member
                </th>
                <th className="px-5 py-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                  Tipe
                </th>
                <th className="px-5 py-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                  Status
                </th>
                <th className="px-5 py-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                  Berakhir
                </th>
                <th className="px-5 py-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                  Check-in
                </th>
                <th className="px-5 py-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                  Points
                </th>
                <th className="px-5 py-4 text-xs font-medium text-right text-gray-500 uppercase dark:text-gray-400">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Image
                        src={member.avatar}
                        alt={member.name}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{member.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <Badge color={getTypeColor(member.membershipType) as "warning" | "success" | "light"} size="sm">
                      {member.membershipType}
                    </Badge>
                  </td>
                  <td className="px-5 py-4">
                    <Badge color={getStatusColor(member.membershipStatus) as "success" | "error" | "warning" | "light"} size="sm">
                      {member.membershipStatus}
                    </Badge>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {formatDate(member.membershipEnd)}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{member.checkins}x</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                      {member.points.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-gray-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </button>
                      <button className="p-2 text-gray-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Menampilkan {filteredMembers.length} dari {members.length} member
          </p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg dark:border-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800">
              Prev
            </button>
            <button className="px-3 py-1.5 text-sm text-white bg-brand-500 rounded-lg">1</button>
            <button className="px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg dark:border-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800">
              2
            </button>
            <button className="px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg dark:border-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
