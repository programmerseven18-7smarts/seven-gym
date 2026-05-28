"use client";
import React from "react";
import Link from "next/link";
import { useRole } from "@/context/RoleContext";
import { getBranchOperationalSnapshot } from "@/data/operationalData";
import {
  dashboardStats,
  gymClasses,
  trainers,
  transactions,
} from "@/data/mockData";
import Badge from "@/components/ui/badge/Badge";
import { ArrowUpIcon, ArrowDownIcon } from "@/icons";
import Image from "next/image";
import RevenueChart from "./charts/RevenueChart";
import AttendanceChart from "./charts/AttendanceChart";

const AdminDashboard: React.FC = () => {
  const { activeBranch, currentRole } = useRole();
  const branchSnapshot = getBranchOperationalSnapshot(activeBranch.id);
  const todayCheckIns = branchSnapshot.scopedCheckIns;
  const activeMembers = branchSnapshot.scopedMembers.filter((m) => m.membershipStatus === "active");
  const todayClasses = gymClasses.filter((c) => c.day === "Monday");
  const recentTransactions = transactions.slice(0, 5);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (currentRole === "staff") {
    const lowStockItems = branchSnapshot.scopedInventory.filter((item) => item.stock <= item.minStock).slice(0, 5);
    const pendingTransactions = branchSnapshot.scopedTransactions.filter((transaction) => transaction.status === "pending");

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard Operasional
          </h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Ringkasan kerja cabang hari ini / {activeBranch.name}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <p className="text-sm text-gray-500 dark:text-gray-400">Member Sedang Gym</p>
            <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{branchSnapshot.activeInGym}</p>
            <Link href="/check-in/live" className="mt-3 inline-block text-sm font-medium text-emerald-600 hover:text-emerald-700">Lihat check-in</Link>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <p className="text-sm text-gray-500 dark:text-gray-400">Shift Kasir</p>
            <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{branchSnapshot.openShift ? "Open" : "Closed"}</p>
            <Link href="/finance/cash-shifts" className="mt-3 inline-block text-sm font-medium text-emerald-600 hover:text-emerald-700">Kelola shift</Link>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <p className="text-sm text-gray-500 dark:text-gray-400">Invoice Pending</p>
            <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{pendingTransactions.length}</p>
            <Link href="/payments/transactions" className="mt-3 inline-block text-sm font-medium text-emerald-600 hover:text-emerald-700">Cek transaksi</Link>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <p className="text-sm text-gray-500 dark:text-gray-400">Stok Menipis</p>
            <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{branchSnapshot.lowStock}</p>
            <Link href="/inventory/stock" className="mt-3 inline-block text-sm font-medium text-emerald-600 hover:text-emerald-700">Cek stok</Link>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 dark:text-white">Antrian Check-In</h2>
              <Link href="/check-in/scan" className="text-sm font-medium text-emerald-600 hover:text-emerald-700">Scan QR</Link>
            </div>
            <div className="space-y-3">
              {todayCheckIns.slice(0, 5).map((checkin) => (
                <div key={checkin.id} className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800/60">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{checkin.memberName}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{checkin.time} / {checkin.gate}</p>
                  </div>
                  <Badge color={checkin.checkoutTime ? "light" : "success"} size="sm">
                    {checkin.checkoutTime ? "Selesai" : "Aktif"}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 dark:text-white">Renewal Cepat</h2>
              <Link href="/members/membership" className="text-sm font-medium text-emerald-600 hover:text-emerald-700">Membership</Link>
            </div>
            <div className="space-y-3">
              {branchSnapshot.scopedMembers.slice(0, 5).map((member) => (
                <div key={member.id} className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-800">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{member.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{member.membershipType} / {member.membershipEnd}</p>
                  </div>
                  <Badge color={member.membershipStatus === "active" ? "success" : "warning"} size="sm">
                    {member.membershipStatus}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 dark:text-white">Stok Prioritas</h2>
              <Link href="/inventory/inbound" className="text-sm font-medium text-emerald-600 hover:text-emerald-700">Restock</Link>
            </div>
            <div className="space-y-3">
              {(lowStockItems.length ? lowStockItems : branchSnapshot.scopedInventory.slice(0, 5)).map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800/60">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.sku}</p>
                  </div>
                  <Badge color={item.stock <= item.minStock ? "warning" : "success"} size="sm">
                    {item.stock}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          Selamat datang di Seven Gym Management System / {activeBranch.name}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Today Revenue */}
        <div className="p-5 bg-white border border-gray-200 rounded-2xl dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-500/20">
              <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <Badge color="success" size="sm">
              <ArrowUpIcon className="w-3 h-3" />
              12.5%
            </Badge>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Pendapatan Hari Ini</p>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(branchSnapshot.revenue)}
            </p>
          </div>
        </div>

        {/* Active Members */}
        <div className="p-5 bg-white border border-gray-200 rounded-2xl dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-500/20">
              <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <Badge color="success" size="sm">
              <ArrowUpIcon className="w-3 h-3" />
              5.2%
            </Badge>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Member Aktif</p>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
              {branchSnapshot.activeMembers}
              <span className="text-sm font-normal text-gray-500"> / {branchSnapshot.totalMembers}</span>
            </p>
          </div>
        </div>

        {/* Today Check-ins */}
        <div className="p-5 bg-white border border-gray-200 rounded-2xl dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-100 dark:bg-cyan-500/20">
              <svg className="w-6 h-6 text-cyan-600 dark:text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <Badge color="error" size="sm">
              <ArrowDownIcon className="w-3 h-3" />
              8.3%
            </Badge>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Check-in Hari Ini</p>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
              {branchSnapshot.checkInsToday}
              <span className="text-sm font-normal text-gray-500"> avg {dashboardStats.avgDailyCheckins}</span>
            </p>
          </div>
        </div>

        {/* PT Sessions */}
        <div className="p-5 bg-white border border-gray-200 rounded-2xl dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-brand-100 dark:bg-brand-500/20">
              <svg className="w-6 h-6 text-brand-600 dark:text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <Badge color="success" size="sm">
              <ArrowUpIcon className="w-3 h-3" />
              15.0%
            </Badge>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Sesi PT Hari Ini</p>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
              {branchSnapshot.ptSessions}
              <span className="text-sm font-normal text-gray-500"> sessions</span>
            </p>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 xl:col-span-8">
          <RevenueChart />
        </div>
        <div className="col-span-12 xl:col-span-4">
          <AttendanceChart />
        </div>
      </div>

      {/* Activity Row */}
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        {/* Members Currently at Gym */}
        <div className="col-span-12 lg:col-span-4">
          <div className="h-full p-5 bg-white border border-gray-200 rounded-2xl dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Sedang di Gym
              </h3>
              <Badge color="success" size="sm">{todayCheckIns.filter(c => !c.checkoutTime).length} orang</Badge>
            </div>
            <div className="space-y-4">
              {todayCheckIns.filter(c => !c.checkoutTime).map((checkin) => (
                <div key={checkin.id} className="flex items-center gap-3">
                  <Image
                    src={checkin.memberAvatar}
                    alt={checkin.memberName}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate dark:text-white">
                      {checkin.memberName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Check-in {checkin.time}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    Active
                  </div>
                </div>
              ))}
              {todayCheckIns.filter(c => !c.checkoutTime).length === 0 && (
                <p className="text-sm text-center text-gray-500 py-8">Belum ada member</p>
              )}
            </div>
          </div>
        </div>

        {/* Today's Classes */}
        <div className="col-span-12 lg:col-span-4">
          <div className="h-full p-5 bg-white border border-gray-200 rounded-2xl dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Kelas Hari Ini
              </h3>
              <Badge color="info" size="sm">{todayClasses.length} kelas</Badge>
            </div>
            <div className="space-y-3">
              {todayClasses.map((cls) => (
                <div key={cls.id} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {cls.name}
                    </p>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      {cls.time}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {cls.instructor} - {cls.room}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full dark:bg-gray-700">
                      <div
                        className="h-2 rounded-full bg-cyan-500"
                        style={{ width: `${(cls.enrolled / cls.capacity) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {cls.enrolled}/{cls.capacity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="col-span-12 lg:col-span-4">
          <div className="h-full p-5 bg-white border border-gray-200 rounded-2xl dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Transaksi Terakhir
              </h3>
              <Link href="/payments/transactions" className="text-sm font-medium text-brand-500 hover:text-brand-600">
                Lihat Semua
              </Link>
            </div>
            <div className="space-y-4">
              {recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center gap-3">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${
                    tx.type === "membership" ? "bg-emerald-100 dark:bg-emerald-500/20" :
                    tx.type === "pt" ? "bg-cyan-100 dark:bg-cyan-500/20" :
                    "bg-amber-100 dark:bg-amber-500/20"
                  }`}>
                    {tx.type === "membership" && (
                      <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 9a2 2 0 10-4 0v5a2 2 0 01-2 2h6m-6-4h4m8 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                    {tx.type === "pt" && (
                      <svg className="w-5 h-5 text-cyan-600 dark:text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )}
                    {tx.type === "product" && (
                      <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate dark:text-white">
                      {tx.memberName}
                    </p>
                    <p className="text-xs text-gray-500 capitalize dark:text-gray-400">
                      {tx.type} - {tx.date}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(tx.total)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Trainers & Popular Classes */}
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        {/* Top Trainers */}
        <div className="col-span-12 lg:col-span-6">
          <div className="p-5 bg-white border border-gray-200 rounded-2xl dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Top Personal Trainers
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="pb-3 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">Trainer</th>
                    <th className="pb-3 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">Client</th>
                    <th className="pb-3 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">Rating</th>
                    <th className="pb-3 text-xs font-medium text-right text-gray-500 uppercase dark:text-gray-400">Komisi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {trainers.map((trainer) => (
                    <tr key={trainer.id}>
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <Image
                            src={trainer.avatar}
                            alt={trainer.name}
                            width={36}
                            height={36}
                            className="rounded-full"
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{trainer.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{trainer.specialization[0]}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className="text-sm text-gray-700 dark:text-gray-300">{trainer.activeClients}</span>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="text-sm text-gray-700 dark:text-gray-300">{trainer.rating}</span>
                        </div>
                      </td>
                      <td className="py-3 text-sm font-medium text-right text-gray-900 dark:text-white">
                        {formatCurrency(trainer.commission)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Membership Overview */}
        <div className="col-span-12 lg:col-span-6">
          <div className="p-5 bg-white border border-gray-200 rounded-2xl dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Overview Membership
              </h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 text-center rounded-xl bg-emerald-50 dark:bg-emerald-500/10">
                <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-500/20">
                  <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="mt-3 text-2xl font-bold text-emerald-600 dark:text-emerald-400">{activeMembers.length}</p>
                <p className="text-sm text-emerald-700 dark:text-emerald-300">Aktif</p>
              </div>
              <div className="p-4 text-center rounded-xl bg-error-50 dark:bg-error-500/10">
                <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-full bg-error-100 dark:bg-error-500/20">
                  <svg className="w-6 h-6 text-error-600 dark:text-error-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="mt-3 text-2xl font-bold text-error-600 dark:text-error-400">{dashboardStats.expiredMembers}</p>
                <p className="text-sm text-error-700 dark:text-error-300">Expired</p>
              </div>
              <div className="p-4 text-center rounded-xl bg-warning-50 dark:bg-warning-500/10">
                <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-full bg-warning-100 dark:bg-warning-500/20">
                  <svg className="w-6 h-6 text-warning-600 dark:text-warning-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="mt-3 text-2xl font-bold text-warning-600 dark:text-warning-400">{dashboardStats.frozenMembers}</p>
                <p className="text-sm text-warning-700 dark:text-warning-300">Frozen</p>
              </div>
            </div>

            {/* Members by Type */}
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Basic</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">45%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700">
                <div className="h-2 bg-gray-500 rounded-full" style={{ width: "45%" }} />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Premium</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">35%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700">
                <div className="h-2 rounded-full bg-emerald-500" style={{ width: "35%" }} />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">VIP</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">20%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700">
                <div className="h-2 rounded-full bg-amber-500" style={{ width: "20%" }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
