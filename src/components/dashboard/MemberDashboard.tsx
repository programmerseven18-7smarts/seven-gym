"use client";
import React from "react";
import { members, gymClasses, challenges, promos, rewards } from "@/data/mockData";
import Badge from "@/components/ui/badge/Badge";
import Image from "next/image";

const MemberDashboard: React.FC = () => {
  // Simulate current member (first active member)
  const currentMember = members[0];
  const todayClasses = gymClasses.filter((c) => c.day === "Monday");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const daysRemaining = getDaysRemaining(currentMember.membershipEnd);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col gap-4 p-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Image
            src={currentMember.avatar}
            alt={currentMember.name}
            width={64}
            height={64}
            className="border-4 border-white rounded-full"
          />
          <div>
            <p className="text-sm text-emerald-100">Selamat datang kembali,</p>
            <h1 className="text-2xl font-bold text-white">{currentMember.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge color="warning" variant="solid" size="sm">
                {currentMember.membershipType}
              </Badge>
              <span className="text-sm text-emerald-100">
                {daysRemaining} hari tersisa
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 text-sm font-medium text-emerald-600 bg-white rounded-lg hover:bg-emerald-50">
            Perpanjang Membership
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="p-5 bg-white border border-gray-200 rounded-2xl dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-500/20">
            <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">{currentMember.points.toLocaleString()}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Point</p>
        </div>

        <div className="p-5 bg-white border border-gray-200 rounded-2xl dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-500/20">
            <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">{currentMember.checkins}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Check-in</p>
        </div>

        <div className="p-5 bg-white border border-gray-200 rounded-2xl dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-100 dark:bg-cyan-500/20">
            <svg className="w-6 h-6 text-cyan-600 dark:text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
            </svg>
          </div>
          <p className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">{currentMember.weight} kg</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Berat Badan</p>
        </div>

        <div className="p-5 bg-white border border-gray-200 rounded-2xl dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-brand-100 dark:bg-brand-500/20">
            <svg className="w-6 h-6 text-brand-600 dark:text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">{currentMember.bmi}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">BMI (Normal)</p>
        </div>
      </div>

      {/* QR Code & Membership Card */}
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 lg:col-span-4">
          <div className="p-6 text-center bg-white border border-gray-200 rounded-2xl dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">QR Check-In</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Tunjukkan QR ini untuk check-in</p>
            
            {/* QR Code Placeholder */}
            <div className="flex items-center justify-center w-48 h-48 mx-auto mt-4 bg-white border-2 border-gray-200 rounded-xl">
              <div className="grid grid-cols-5 gap-1 p-4">
                {[...Array(25)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-6 h-6 rounded-sm ${
                      Math.random() > 0.3 ? "bg-gray-900" : "bg-white"
                    }`}
                  />
                ))}
              </div>
            </div>
            
            <p className="mt-4 text-xs font-mono text-gray-500">ID: {currentMember.id}</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{currentMember.name}</p>
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="col-span-12 lg:col-span-4">
          <div className="h-full p-5 bg-white border border-gray-200 rounded-2xl dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Jadwal Hari Ini</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Kelas yang tersedia</p>
            
            <div className="mt-4 space-y-3">
              {todayClasses.slice(0, 3).map((cls) => (
                <div key={cls.id} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{cls.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{cls.instructor}</p>
                    </div>
                    <Badge color={cls.enrolled < cls.capacity ? "success" : "error"} size="sm">
                      {cls.enrolled < cls.capacity ? "Tersedia" : "Penuh"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {cls.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {cls.room}
                    </span>
                  </div>
                  <button className="w-full px-3 py-2 mt-3 text-sm font-medium text-white rounded-lg bg-emerald-500 hover:bg-emerald-600">
                    Booking Sekarang
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Active Promos */}
        <div className="col-span-12 lg:col-span-4">
          <div className="h-full p-5 bg-white border border-gray-200 rounded-2xl dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Promo Aktif</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Jangan lewatkan!</p>
            
            <div className="mt-4 space-y-3">
              {promos.filter(p => p.status === "active").slice(0, 3).map((promo) => (
                <div key={promo.id} className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-500/20">
                      <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm2.5 3a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm6.207.293a1 1 0 00-1.414 0l-6 6a1 1 0 101.414 1.414l6-6a1 1 0 000-1.414zM12.5 10a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{promo.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{promo.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <code className="px-2 py-1 text-xs font-mono rounded bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400">
                      {promo.code}
                    </code>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      s/d {promo.validUntil}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Challenges & Rewards */}
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 lg:col-span-6">
          <div className="p-5 bg-white border border-gray-200 rounded-2xl dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Challenge Aktif</h3>
              <a href="/member/challenge" className="text-sm font-medium text-brand-500 hover:text-brand-600">Lihat Semua</a>
            </div>
            <div className="space-y-4">
              {challenges.slice(0, 2).map((challenge) => (
                <div key={challenge.id} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900 dark:text-white">{challenge.name}</p>
                    <Badge color="warning" size="sm">+{challenge.reward} pts</Badge>
                  </div>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{challenge.description}</p>
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1 text-xs">
                      <span className="text-gray-500 dark:text-gray-400">Progress</span>
                      <span className="font-medium text-gray-900 dark:text-white">12/{challenge.target}</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700">
                      <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${(12 / challenge.target) * 100}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-6">
          <div className="p-5 bg-white border border-gray-200 rounded-2xl dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Tukar Point</h3>
              <span className="text-sm font-medium text-amber-600 dark:text-amber-400">{currentMember.points.toLocaleString()} pts</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {rewards.slice(0, 4).map((reward) => (
                <div key={reward.id} className="p-3 text-center rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex items-center justify-center w-10 h-10 mx-auto rounded-lg bg-amber-100 dark:bg-amber-500/20">
                    <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17C5.06 5.687 5 5.35 5 5zm4 1V5a1 1 0 10-1 1h1zm3 0a1 1 0 10-1-1v1h1z" clipRule="evenodd" />
                      <path d="M9 11H3v5a2 2 0 002 2h4v-7zM11 18h4a2 2 0 002-2v-5h-6v7z" />
                    </svg>
                  </div>
                  <p className="mt-2 text-sm font-medium text-gray-900 dark:text-white">{reward.name}</p>
                  <p className="text-xs text-amber-600 dark:text-amber-400">{reward.points.toLocaleString()} pts</p>
                  <button 
                    className={`w-full px-2 py-1.5 mt-2 text-xs font-medium rounded-lg ${
                      currentMember.points >= reward.points
                        ? "bg-amber-500 text-white hover:bg-amber-600"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-700"
                    }`}
                    disabled={currentMember.points < reward.points}
                  >
                    Tukar
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberDashboard;
