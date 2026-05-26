"use client";

import { useState } from "react";
import { mockPTSessions, mockTrainers, mockMembers } from "@/data/mockData";
import { CalendarIcon, ClockIcon, UserIcon, CheckIcon } from "@/icons/gym-icons";

export default function MySchedulePage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCompleteModal, setShowCompleteModal] = useState<string | null>(null);

  // Mock: Current trainer ID
  const currentTrainerId = "trainer-1";
  const currentTrainer = mockTrainers.find((t) => t.id === currentTrainerId);

  const trainerSessions = mockPTSessions.filter(
    (s) => s.trainerId === currentTrainerId
  );

  const todaySessions = trainerSessions.filter(
    (s) => s.status === "scheduled"
  );

  const completedToday = trainerSessions.filter(
    (s) => s.status === "completed"
  );

  const getSessionStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "border-l-blue-500 bg-blue-50 dark:bg-blue-900/20";
      case "completed":
        return "border-l-emerald-500 bg-emerald-50 dark:bg-emerald-900/20";
      case "cancelled":
        return "border-l-red-500 bg-red-50 dark:bg-red-900/20";
      default:
        return "border-l-gray-500 bg-gray-50 dark:bg-gray-900/20";
    }
  };

  const weekDays = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    weekDays.push(date);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Jadwal Saya
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Kelola sesi personal training Anda
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-2 dark:bg-emerald-900/20">
          <div className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
            {todaySessions.length} sesi hari ini
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Sesi Minggu Ini</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
            {trainerSessions.filter((s) => s.status !== "cancelled").length}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Selesai</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {completedToday.length}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Klien</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
            {currentTrainer?.totalClients || 0}
          </p>
        </div>
      </div>

      {/* Week Calendar */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 dark:text-white">Minggu Ini</h2>
          <button className="text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400">
            Lihat Kalender Penuh
          </button>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((date, idx) => {
            const isSelected =
              date.toDateString() === selectedDate.toDateString();
            const isToday = date.toDateString() === today.toDateString();
            return (
              <button
                key={idx}
                onClick={() => setSelectedDate(date)}
                className={`flex flex-col items-center rounded-lg p-2 transition-colors ${
                  isSelected
                    ? "bg-emerald-500 text-white"
                    : isToday
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <span className="text-xs">
                  {date.toLocaleDateString("id-ID", { weekday: "short" })}
                </span>
                <span className="mt-1 text-lg font-semibold">{date.getDate()}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sessions List */}
      <div className="space-y-4">
        <h2 className="font-semibold text-gray-900 dark:text-white">
          Sesi Hari Ini ({todaySessions.length})
        </h2>
        {todaySessions.length > 0 ? (
          <div className="space-y-3">
            {todaySessions.map((session) => (
              <div
                key={session.id}
                className={`rounded-xl border-l-4 border border-gray-200 p-4 dark:border-gray-700 ${getSessionStatusColor(session.status)}`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow dark:bg-gray-700">
                      <UserIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {session.memberName}
                      </h3>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <ClockIcon className="h-4 w-4" />
                          {session.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="h-4 w-4" />
                          {session.date}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-emerald-600 dark:text-emerald-400">
                        Fokus: {session.focus}
                      </p>
                      {session.notes && (
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          Catatan: {session.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-white dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                      Reschedule
                    </button>
                    <button
                      onClick={() => setShowCompleteModal(session.id)}
                      className="flex items-center gap-1 rounded-lg bg-emerald-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-600"
                    >
                      <CheckIcon className="h-4 w-4" />
                      Selesai
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center dark:border-gray-600 dark:bg-gray-800">
            <CalendarIcon className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Tidak ada sesi terjadwal untuk hari ini
            </p>
          </div>
        )}
      </div>

      {/* Completed Sessions */}
      {completedToday.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">
            Selesai Hari Ini ({completedToday.length})
          </h2>
          <div className="space-y-3">
            {completedToday.map((session) => (
              <div
                key={session.id}
                className={`rounded-xl border-l-4 border border-gray-200 p-4 dark:border-gray-700 ${getSessionStatusColor(session.status)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                      <CheckIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {session.memberName}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {session.time} - {session.focus}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                    Selesai
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Complete Session Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6 dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Selesaikan Sesi
              </h2>
              <button
                onClick={() => setShowCompleteModal(null)}
                className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Catatan Sesi
                </label>
                <textarea
                  rows={3}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-emerald-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Progres member, latihan yang dilakukan, dll..."
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Rating Performa Member
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <svg
                        className="h-6 w-6 text-yellow-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCompleteModal(null)}
                  className="flex-1 rounded-lg border border-gray-200 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-emerald-500 px-4 py-2 font-medium text-white hover:bg-emerald-600"
                >
                  Selesaikan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
