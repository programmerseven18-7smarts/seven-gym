"use client";
import React, { useState } from "react";
import { members, checkIns } from "@/data/mockData";
import Badge from "@/components/ui/badge/Badge";
import Image from "next/image";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";

export default function CheckInPage() {
  const [scanInput, setScanInput] = useState("");
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    member?: (typeof members)[0];
    message: string;
  } | null>(null);
  const [recentCheckIns, setRecentCheckIns] = useState(checkIns);
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = () => {
    setIsScanning(true);
    
    // Simulate scan delay
    setTimeout(() => {
      const member = members.find(
        (m) => m.id === scanInput || m.email.toLowerCase() === scanInput.toLowerCase()
      );

      if (member) {
        if (member.membershipStatus === "active") {
          setScanResult({
            success: true,
            member,
            message: `Selamat datang, ${member.name}!`,
          });
          // Add to recent check-ins
          const newCheckIn = {
            id: `CI${Date.now()}`,
            memberId: member.id,
            memberName: member.name,
            memberAvatar: member.avatar,
            time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
            date: new Date().toISOString().split("T")[0],
          };
          setRecentCheckIns([newCheckIn, ...recentCheckIns.slice(0, 9)]);
        } else if (member.membershipStatus === "expired") {
          setScanResult({
            success: false,
            member,
            message: "Membership sudah expired. Silakan perpanjang.",
          });
        } else {
          setScanResult({
            success: false,
            member,
            message: "Membership sedang dibekukan.",
          });
        }
      } else {
        setScanResult({
          success: false,
          message: "Member tidak ditemukan.",
        });
      }
      setIsScanning(false);
      setScanInput("");
    }, 800);
  };

  const activeInGym = recentCheckIns.filter((c) => !c.checkoutTime).length;

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Scan QR Check-In" />

      <div className="grid grid-cols-12 gap-6">
        {/* Scanner Panel */}
        <div className="col-span-12 lg:col-span-5">
          <div className="p-6 bg-white border border-gray-200 rounded-2xl dark:border-gray-800 dark:bg-white/[0.03]">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Scanner Station</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Scan QR code atau masukkan ID member
            </p>

            {/* QR Scanner Mock */}
            <div className="relative mt-6">
              <div className="flex items-center justify-center w-full bg-gray-100 border-2 border-dashed border-gray-300 rounded-2xl aspect-square dark:bg-gray-800/50 dark:border-gray-700">
                {isScanning ? (
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto border-4 rounded-full border-emerald-500 border-t-transparent animate-spin" />
                    <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Memproses...</p>
                  </div>
                ) : (
                  <div className="text-center p-8">
                    <svg
                      className="w-24 h-24 mx-auto text-gray-400 dark:text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h2M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                      />
                    </svg>
                    <p className="mt-4 text-gray-500 dark:text-gray-400">
                      Arahkan QR code ke scanner
                    </p>
                    <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
                      atau gunakan input manual di bawah
                    </p>
                  </div>
                )}
              </div>

              {/* Corner decorations */}
              <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-emerald-500 rounded-tl-lg" />
              <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-emerald-500 rounded-tr-lg" />
              <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-emerald-500 rounded-bl-lg" />
              <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-emerald-500 rounded-br-lg" />
            </div>

            {/* Manual Input */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Manual Input (ID / Email)
              </label>
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={scanInput}
                  onChange={(e) => setScanInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleScan()}
                  placeholder="Masukkan ID member atau email"
                  className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
                <button
                  onClick={handleScan}
                  disabled={!scanInput || isScanning}
                  className="px-6 py-2.5 text-sm font-medium text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Check-In
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Coba: M001, M002, atau email member
              </p>
            </div>

            {/* Scan Result */}
            {scanResult && (
              <div
                className={`mt-6 p-4 rounded-xl ${
                  scanResult.success
                    ? "bg-emerald-50 border border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/30"
                    : "bg-error-50 border border-error-200 dark:bg-error-500/10 dark:border-error-500/30"
                }`}
              >
                <div className="flex items-center gap-4">
                  {scanResult.member && (
                    <Image
                      src={scanResult.member.avatar}
                      alt={scanResult.member.name}
                      width={56}
                      height={56}
                      className="rounded-full"
                    />
                  )}
                  <div className="flex-1">
                    {scanResult.member && (
                      <p
                        className={`font-semibold ${
                          scanResult.success
                            ? "text-emerald-800 dark:text-emerald-300"
                            : "text-error-800 dark:text-error-300"
                        }`}
                      >
                        {scanResult.member.name}
                      </p>
                    )}
                    <p
                      className={`text-sm ${
                        scanResult.success
                          ? "text-emerald-700 dark:text-emerald-400"
                          : "text-error-700 dark:text-error-400"
                      }`}
                    >
                      {scanResult.message}
                    </p>
                    {scanResult.member && (
                      <div className="flex items-center gap-2 mt-2">
                        <Badge
                          color={
                            scanResult.member.membershipStatus === "active"
                              ? "success"
                              : scanResult.member.membershipStatus === "expired"
                              ? "error"
                              : "warning"
                          }
                          size="sm"
                        >
                          {scanResult.member.membershipType}
                        </Badge>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          exp: {scanResult.member.membershipEnd}
                        </span>
                      </div>
                    )}
                  </div>
                  <div
                    className={`flex items-center justify-center w-12 h-12 rounded-full ${
                      scanResult.success
                        ? "bg-emerald-100 dark:bg-emerald-500/20"
                        : "bg-error-100 dark:bg-error-500/20"
                    }`}
                  >
                    {scanResult.success ? (
                      <svg
                        className="w-6 h-6 text-emerald-600 dark:text-emerald-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-6 h-6 text-error-600 dark:text-error-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel */}
        <div className="col-span-12 space-y-6 lg:col-span-7">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-white border border-gray-200 rounded-xl dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-500/20">
                  <svg
                    className="w-5 h-5 text-emerald-600 dark:text-emerald-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeInGym}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Sedang di Gym</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white border border-gray-200 rounded-xl dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-cyan-100 dark:bg-cyan-500/20">
                  <svg
                    className="w-5 h-5 text-cyan-600 dark:text-cyan-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {recentCheckIns.length}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Check-in Hari Ini</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white border border-gray-200 rounded-xl dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-500/20">
                  <svg
                    className="w-5 h-5 text-amber-600 dark:text-amber-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">18:30</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Peak Hour</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Check-ins */}
          <div className="p-5 bg-white border border-gray-200 rounded-2xl dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Check-in Terbaru
              </h3>
              <Badge color="success" size="sm">
                Live
              </Badge>
            </div>

            <div className="space-y-3">
              {recentCheckIns.slice(0, 8).map((checkin) => (
                <div
                  key={checkin.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50"
                >
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
                  {checkin.checkoutTime ? (
                    <Badge color="light" size="sm">
                      Out {checkin.checkoutTime}
                    </Badge>
                  ) : (
                    <div className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      Active
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
