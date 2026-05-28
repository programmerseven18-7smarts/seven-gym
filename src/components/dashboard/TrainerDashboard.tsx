"use client";
import React from "react";
import Link from "next/link";
import { trainers, members } from "@/data/mockData";
import Badge from "@/components/ui/badge/Badge";
import Image from "next/image";
import { ArrowUpIcon } from "@/icons";

const TrainerDashboard: React.FC = () => {
  // Simulate current trainer
  const currentTrainer = trainers[0];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const progressPercentage = Math.round(
    (currentTrainer.currentSessions / currentTrainer.monthlyTarget) * 100
  );

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col gap-4 p-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-cyan-600 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Image
            src={currentTrainer.avatar}
            alt={currentTrainer.name}
            width={64}
            height={64}
            className="border-4 border-white rounded-full"
          />
          <div>
            <p className="text-sm text-cyan-100">Personal Trainer</p>
            <h1 className="text-2xl font-bold text-white">{currentTrainer.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-white/20 rounded-full text-white">
                <svg className="w-3 h-3 text-amber-300" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {currentTrainer.rating}
              </div>
              <span className="text-sm text-cyan-100">
                {currentTrainer.specialization.join(", ")}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/10">
          <div className="text-right">
            <p className="text-sm text-cyan-100">Status</p>
            <p className="text-lg font-bold text-white capitalize">{currentTrainer.status}</p>
          </div>
          <div className={`w-3 h-3 rounded-full ${
            currentTrainer.status === "available" ? "bg-emerald-400" :
            currentTrainer.status === "busy" ? "bg-amber-400" : "bg-gray-400"
          }`} />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="p-5 bg-white border border-gray-200 rounded-2xl dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-100 dark:bg-cyan-500/20">
              <svg className="w-6 h-6 text-cyan-600 dark:text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <Badge color="success" size="sm">
              <ArrowUpIcon className="w-3 h-3" />
              +3
            </Badge>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{currentTrainer.activeClients}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Client Aktif</p>
          </div>
        </div>

        <div className="p-5 bg-white border border-gray-200 rounded-2xl dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-500/20">
              <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{currentTrainer.currentSessions}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Sesi Bulan Ini</p>
          </div>
        </div>

        <div className="p-5 bg-white border border-gray-200 rounded-2xl dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-500/20">
              <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(currentTrainer.commission)}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Komisi Bulan Ini</p>
          </div>
        </div>

        <div className="p-5 bg-white border border-gray-200 rounded-2xl dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-brand-100 dark:bg-brand-500/20">
              <svg className="w-6 h-6 text-brand-600 dark:text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{currentTrainer.totalClients}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Client</p>
          </div>
        </div>
      </div>

      {/* Target Progress & Today's Schedule */}
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        {/* Monthly Target */}
        <div className="col-span-12 lg:col-span-4">
          <div className="h-full p-5 bg-white border border-gray-200 rounded-2xl dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Target Bulanan</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Sesi PT bulan ini</p>
            
            <div className="flex items-center justify-center mt-6">
              <div className="relative w-40 h-40">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="12"
                    className="dark:stroke-gray-700"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={`${progressPercentage * 4.4} 440`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">{progressPercentage}%</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Tercapai</span>
                </div>
              </div>
            </div>
            
            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Selesai</span>
                <span className="font-medium text-gray-900 dark:text-white">{currentTrainer.currentSessions} sesi</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Target</span>
                <span className="font-medium text-gray-900 dark:text-white">{currentTrainer.monthlyTarget} sesi</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Sisa</span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                  {currentTrainer.monthlyTarget - currentTrainer.currentSessions} sesi
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="col-span-12 lg:col-span-4">
          <div className="h-full p-5 bg-white border border-gray-200 rounded-2xl dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Jadwal Hari Ini</h3>
              <Badge color="info" size="sm">4 sesi</Badge>
            </div>
            
            <div className="space-y-3">
              {[
                { time: "08:00", client: "Andi Wijaya", type: "Strength Training", status: "done" },
                { time: "10:00", client: "Siti Rahayu", type: "Weight Loss", status: "current" },
                { time: "14:00", client: "Reza Mahendra", type: "Muscle Gain", status: "upcoming" },
                { time: "16:00", client: "Maya Sari", type: "General Fitness", status: "upcoming" },
              ].map((session, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-3 p-3 rounded-xl ${
                    session.status === "current"
                      ? "bg-cyan-50 border border-cyan-200 dark:bg-cyan-500/10 dark:border-cyan-500/30"
                      : session.status === "done"
                      ? "bg-gray-50 dark:bg-gray-800/50"
                      : "bg-gray-50 dark:bg-gray-800/50"
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <span className={`text-sm font-medium ${
                      session.status === "current" ? "text-cyan-600 dark:text-cyan-400" : "text-gray-500 dark:text-gray-400"
                    }`}>
                      {session.time}
                    </span>
                    {session.status === "current" && (
                      <span className="w-2 h-2 mt-1 rounded-full bg-cyan-500 animate-pulse" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${
                      session.status === "done" ? "text-gray-400 line-through" : "text-gray-900 dark:text-white"
                    }`}>
                      {session.client}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{session.type}</p>
                  </div>
                  {session.status === "done" && (
                    <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                  {session.status === "current" && (
                    <Badge color="info" size="sm">Now</Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* New Booking Requests */}
        <div className="col-span-12 lg:col-span-4">
          <div className="h-full p-5 bg-white border border-gray-200 rounded-2xl dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Booking Baru</h3>
              <Badge color="warning" size="sm">3 pending</Badge>
            </div>
            
            <div className="space-y-3">
              {[
                { name: "Dewi Lestari", date: "22 Jan", time: "09:00", type: "Fat Loss" },
                { name: "Bimo Satrio", date: "23 Jan", time: "15:00", type: "Muscle Gain" },
                { name: "New Member", date: "24 Jan", time: "11:00", type: "Consultation" },
              ].map((booking, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{booking.name}</p>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{booking.date}</span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {booking.time} - {booking.type}
                  </p>
                  <div className="flex gap-2 mt-3">
                    <button className="flex-1 px-3 py-1.5 text-xs font-medium text-white bg-emerald-500 rounded-lg hover:bg-emerald-600">
                      Terima
                    </button>
                    <button className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
                      Tolak
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Active Clients */}
      <div className="p-5 bg-white border border-gray-200 rounded-2xl dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Client Aktif</h3>
          <Link href="/trainer/clients" className="text-sm font-medium text-brand-500 hover:text-brand-600">Lihat Semua</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="pb-3 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">Client</th>
                <th className="pb-3 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">Program</th>
                <th className="pb-3 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">Sesi Tersisa</th>
                <th className="pb-3 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">Progress</th>
                <th className="pb-3 text-xs font-medium text-right text-gray-500 uppercase dark:text-gray-400">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {members.slice(0, 4).map((member) => (
                <tr key={member.id}>
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <Image
                        src={member.avatar}
                        alt={member.name}
                        width={36}
                        height={36}
                        className="rounded-full"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{member.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Strength Training</span>
                  </td>
                  <td className="py-3">
                    <Badge color="info" size="sm">8 sesi</Badge>
                  </td>
                  <td className="py-3">
                    <div className="w-24">
                      <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700">
                        <div className="h-2 rounded-full bg-emerald-500" style={{ width: "65%" }} />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-right">
                    <button className="px-3 py-1.5 text-xs font-medium text-brand-600 bg-brand-50 rounded-lg hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-400">
                      Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TrainerDashboard;
