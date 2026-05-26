"use client";

import { useState } from "react";
import { mockClasses, mockTrainers, mockPTSessions } from "@/data/mockData";
import { CalendarIcon, ClockIcon, UserGroupIcon, StarIcon } from "@/icons/gym-icons";

export default function MyClassesPage() {
  const [activeTab, setActiveTab] = useState<"upcoming" | "history">("upcoming");
  const [showBookModal, setShowBookModal] = useState(false);

  // Mock enrolled classes for the member
  const enrolledClasses = mockClasses.slice(0, 3);
  const upcomingPTSessions = mockPTSessions.filter(s => s.status === "scheduled").slice(0, 2);
  const pastSessions = mockPTSessions.filter(s => s.status === "completed");

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "cardio": return "bg-red-500";
      case "strength": return "bg-blue-500";
      case "flexibility": return "bg-purple-500";
      case "martial-arts": return "bg-orange-500";
      case "dance": return "bg-pink-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Kelas Saya
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Kelola jadwal kelas dan sesi personal training
          </p>
        </div>
        <button
          onClick={() => setShowBookModal(true)}
          className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Pesan Kelas
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
        <button
          onClick={() => setActiveTab("upcoming")}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "upcoming"
              ? "bg-white text-gray-900 shadow dark:bg-gray-700 dark:text-white"
              : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          }`}
        >
          Akan Datang
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "history"
              ? "bg-white text-gray-900 shadow dark:bg-gray-700 dark:text-white"
              : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          }`}
        >
          Riwayat
        </button>
      </div>

      {activeTab === "upcoming" ? (
        <div className="space-y-6">
          {/* Enrolled Classes */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Kelas Grup Terdaftar
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {enrolledClasses.map((cls) => {
                const trainer = mockTrainers.find((t) => t.id === cls.trainerId);
                return (
                  <div
                    key={cls.id}
                    className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800"
                  >
                    <div className={`mb-3 h-1.5 w-16 rounded-full ${getCategoryColor(cls.category)}`} />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {cls.name}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Instruktur: {trainer?.name}
                    </p>
                    <div className="mt-4 space-y-2">
                      {cls.schedule.map((s, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <CalendarIcon className="h-4 w-4" />
                          <span>{s.day}, {s.time}</span>
                        </div>
                      ))}
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <ClockIcon className="h-4 w-4" />
                        <span>{cls.duration} menit</span>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                        Batalkan
                      </button>
                      <button className="flex-1 rounded-lg bg-emerald-500 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-600">
                        Check-in
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* PT Sessions */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Sesi Personal Training
            </h2>
            {upcomingPTSessions.length > 0 ? (
              <div className="space-y-3">
                {upcomingPTSessions.map((session) => {
                  const trainer = mockTrainers.find((t) => t.id === session.trainerId);
                  return (
                    <div
                      key={session.id}
                      className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-lg font-semibold text-white">
                          {trainer?.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            Sesi dengan {trainer?.name}
                          </p>
                          <div className="mt-1 flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <CalendarIcon className="h-4 w-4" />
                              {session.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <ClockIcon className="h-4 w-4" />
                              {session.time}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-emerald-600 dark:text-emerald-400">
                            Fokus: {session.focus}
                          </p>
                        </div>
                      </div>
                      <button className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                        Reschedule
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center dark:border-gray-600 dark:bg-gray-800">
                <UserGroupIcon className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
                <p className="mt-2 text-gray-500 dark:text-gray-400">
                  Belum ada sesi PT terjadwal
                </p>
                <button className="mt-4 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600">
                  Pesan Sesi PT
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* History Tab */
        <div className="space-y-4">
          {pastSessions.length > 0 ? (
            pastSessions.map((session) => {
              const trainer = mockTrainers.find((t) => t.id === session.trainerId);
              return (
                <div
                  key={session.id}
                  className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                        {trainer?.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {session.focus} dengan {trainer?.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {session.date} - {session.time}
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                      Selesai
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center dark:border-gray-600 dark:bg-gray-800">
              <CalendarIcon className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                Belum ada riwayat kelas
              </p>
            </div>
          )}
        </div>
      )}

      {/* Book Class Modal */}
      {showBookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Pesan Kelas
              </h2>
              <button
                onClick={() => setShowBookModal(false)}
                className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              {mockClasses.filter(c => c.status === "active").map((cls) => {
                const trainer = mockTrainers.find((t) => t.id === cls.trainerId);
                const isFull = cls.currentParticipants >= cls.maxParticipants;
                return (
                  <div
                    key={cls.id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${getCategoryColor(cls.category)}`}>
                        <UserGroupIcon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {cls.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {trainer?.name} | {cls.schedule[0]?.day} {cls.schedule[0]?.time}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {cls.currentParticipants}/{cls.maxParticipants} peserta
                        </p>
                      </div>
                    </div>
                    <button
                      disabled={isFull}
                      className={`rounded-lg px-4 py-2 text-sm font-medium ${
                        isFull
                          ? "cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-gray-700"
                          : "bg-emerald-500 text-white hover:bg-emerald-600"
                      }`}
                    >
                      {isFull ? "Penuh" : "Daftar"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
