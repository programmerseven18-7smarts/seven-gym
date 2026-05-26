"use client";

import { useState } from "react";
import { mockTrainers, mockPTSessions } from "@/data/mockData";
import { UserIcon, StarIcon, ClockIcon, CalendarIcon } from "@/icons/gym-icons";

export default function TrainersPage() {
  const [selectedTrainer, setSelectedTrainer] = useState<string | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "on-leave":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "inactive":
        return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getSessionStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "completed":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "cancelled":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const trainerSessions = selectedTrainer
    ? mockPTSessions.filter((s) => s.trainerId === selectedTrainer)
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Personal Trainer
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Kelola trainer dan sesi personal training
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Trainer
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Trainer List */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div className="border-b border-gray-200 p-4 dark:border-gray-700">
              <h2 className="font-semibold text-gray-900 dark:text-white">
                Daftar Trainer ({mockTrainers.length})
              </h2>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {mockTrainers.map((trainer) => (
                <div
                  key={trainer.id}
                  onClick={() => setSelectedTrainer(trainer.id)}
                  className={`cursor-pointer p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                    selectedTrainer === trainer.id
                      ? "bg-emerald-50 dark:bg-emerald-900/20"
                      : ""
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-lg font-semibold text-white">
                      {trainer.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {trainer.name}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {trainer.email}
                          </p>
                        </div>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(trainer.status)}`}>
                          {trainer.status === "active" ? "Aktif" : trainer.status === "on-leave" ? "Cuti" : "Tidak Aktif"}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {trainer.specializations.map((spec) => (
                          <span
                            key={spec}
                            className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                      <div className="mt-3 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <StarIcon className="h-4 w-4 text-yellow-400" />
                          <span>{trainer.rating}</span>
                        </div>
                        <span>|</span>
                        <span>{trainer.totalClients} klien</span>
                        <span>|</span>
                        <span className="text-emerald-600 dark:text-emerald-400">
                          Rp {trainer.hourlyRate.toLocaleString("id-ID")}/jam
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Trainer Detail / Schedule */}
        <div className="space-y-6">
          {selectedTrainer ? (
            <>
              {/* Trainer Info Card */}
              <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                <div className="text-center">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-2xl font-bold text-white">
                    {mockTrainers.find((t) => t.id === selectedTrainer)?.name.charAt(0)}
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                    {mockTrainers.find((t) => t.id === selectedTrainer)?.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {mockTrainers.find((t) => t.id === selectedTrainer)?.email}
                  </p>
                </div>
                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-2 dark:bg-gray-700">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Klien</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {mockTrainers.find((t) => t.id === selectedTrainer)?.totalClients}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-2 dark:bg-gray-700">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Sesi Minggu Ini</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {trainerSessions.filter((s) => s.status === "scheduled").length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-2 dark:bg-gray-700">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Rating</span>
                    <div className="flex items-center gap-1">
                      <StarIcon className="h-4 w-4 text-yellow-400" />
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {mockTrainers.find((t) => t.id === selectedTrainer)?.rating}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => setShowScheduleModal(true)}
                    className="flex-1 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600"
                  >
                    Jadwalkan Sesi
                  </button>
                  <button className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                    Edit
                  </button>
                </div>
              </div>

              {/* Upcoming Sessions */}
              <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
                <div className="border-b border-gray-200 p-4 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Sesi Mendatang
                  </h3>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {trainerSessions.length > 0 ? (
                    trainerSessions.slice(0, 5).map((session) => (
                      <div key={session.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {session.memberName}
                            </p>
                            <div className="mt-1 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                              <CalendarIcon className="h-4 w-4" />
                              <span>{session.date}</span>
                              <ClockIcon className="h-4 w-4" />
                              <span>{session.time}</span>
                            </div>
                          </div>
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getSessionStatusColor(session.status)}`}>
                            {session.status === "scheduled" ? "Terjadwal" : session.status === "completed" ? "Selesai" : "Dibatalkan"}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                          Fokus: {session.focus}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <UserIcon className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Belum ada sesi terjadwal
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-gray-300 dark:border-gray-600">
              <div className="text-center">
                <UserIcon className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Pilih trainer untuk melihat detail
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Schedule Session Modal */}
      {showScheduleModal && selectedTrainer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6 dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Jadwalkan Sesi PT
              </h2>
              <button
                onClick={() => setShowScheduleModal(false)}
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
                  Trainer
                </label>
                <input
                  type="text"
                  value={mockTrainers.find((t) => t.id === selectedTrainer)?.name || ""}
                  disabled
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Pilih Member
                </label>
                <select className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-emerald-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                  <option value="">Pilih member...</option>
                  <option value="1">Andi Wijaya</option>
                  <option value="2">Sari Putri</option>
                  <option value="3">Budi Santoso</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tanggal
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-emerald-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Waktu
                  </label>
                  <input
                    type="time"
                    className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-emerald-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Fokus Latihan
                </label>
                <select className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-emerald-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                  <option value="strength">Strength Training</option>
                  <option value="cardio">Cardio</option>
                  <option value="weight-loss">Weight Loss</option>
                  <option value="flexibility">Flexibility</option>
                  <option value="rehabilitation">Rehabilitation</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Catatan
                </label>
                <textarea
                  rows={2}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-emerald-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Catatan tambahan..."
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="flex-1 rounded-lg border border-gray-200 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-emerald-500 px-4 py-2 font-medium text-white hover:bg-emerald-600"
                >
                  Jadwalkan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
