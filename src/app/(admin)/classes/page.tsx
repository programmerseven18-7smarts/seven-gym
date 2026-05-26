"use client";

import { useState } from "react";
import { mockClasses, mockTrainers } from "@/data/mockData";
import { ClockIcon, UserGroupIcon, CalendarIcon } from "@/icons/gym-icons";

type ViewMode = "calendar" | "list";

export default function ClassesPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("calendar");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);

  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const currentDay = days[selectedDate.getDay()];

  const todayClasses = mockClasses.filter((cls) =>
    cls.schedule.some((s) => s.day === currentDay)
  );

  const getClassesForDay = (day: string) => {
    return mockClasses.filter((cls) =>
      cls.schedule.some((s) => s.day === day)
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "full":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "cancelled":
        return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "cardio":
        return "bg-red-500";
      case "strength":
        return "bg-blue-500";
      case "flexibility":
        return "bg-purple-500";
      case "martial-arts":
        return "bg-orange-500";
      case "dance":
        return "bg-pink-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Jadwal Kelas
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Kelola jadwal kelas grup dan sesi latihan
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
            <button
              onClick={() => setViewMode("calendar")}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                viewMode === "calendar"
                  ? "bg-white text-gray-900 shadow dark:bg-gray-700 dark:text-white"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              Kalender
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                viewMode === "list"
                  ? "bg-white text-gray-900 shadow dark:bg-gray-700 dark:text-white"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              Daftar
            </button>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tambah Kelas
          </button>
        </div>
      </div>

      {viewMode === "calendar" ? (
        /* Weekly Calendar View */
        <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          {/* Week Navigation */}
          <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
            <button className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700">
              <svg className="h-5 w-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Minggu Ini
            </h2>
            <button className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700">
              <svg className="h-5 w-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 divide-x divide-gray-200 dark:divide-gray-700">
            {days.map((day) => {
              const dayClasses = getClassesForDay(day);
              const isToday = day === currentDay;
              return (
                <div key={day} className="min-h-[300px]">
                  <div
                    className={`border-b border-gray-200 p-3 text-center dark:border-gray-700 ${
                      isToday ? "bg-emerald-50 dark:bg-emerald-900/20" : ""
                    }`}
                  >
                    <p className={`text-sm font-medium ${isToday ? "text-emerald-600 dark:text-emerald-400" : "text-gray-900 dark:text-white"}`}>
                      {day}
                    </p>
                  </div>
                  <div className="space-y-2 p-2">
                    {dayClasses.map((cls) => {
                      const schedule = cls.schedule.find((s) => s.day === day);
                      return (
                        <div
                          key={cls.id}
                          className="cursor-pointer rounded-lg border border-gray-200 bg-gray-50 p-2 transition-all hover:shadow-md dark:border-gray-600 dark:bg-gray-700"
                        >
                          <div className={`mb-1 h-1 w-full rounded-full ${getCategoryColor(cls.category)}`} />
                          <p className="text-xs font-medium text-gray-900 dark:text-white line-clamp-1">
                            {cls.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {schedule?.time}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            {cls.currentParticipants}/{cls.maxParticipants}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* List View */
        <div className="space-y-4">
          {mockClasses.map((cls) => {
            const trainer = mockTrainers.find((t) => t.id === cls.trainerId);
            return (
              <div
                key={cls.id}
                className="rounded-xl border border-gray-200 bg-white p-6 transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${getCategoryColor(cls.category)}`}>
                      <UserGroupIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {cls.name}
                        </h3>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(cls.status)}`}>
                          {cls.status === "active" ? "Aktif" : cls.status === "full" ? "Penuh" : "Dibatalkan"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Instruktur: {trainer?.name || "TBA"}
                      </p>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                        {cls.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-6">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <CalendarIcon className="h-5 w-5" />
                      <div className="text-sm">
                        {cls.schedule.map((s) => (
                          <div key={s.day}>
                            {s.day}: {s.time}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <ClockIcon className="h-5 w-5" />
                      <span className="text-sm">{cls.duration} menit</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <UserGroupIcon className="h-5 w-5" />
                      <span className="text-sm">
                        {cls.currentParticipants}/{cls.maxParticipants} peserta
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                    Edit
                  </button>
                  <button className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                    Lihat Peserta
                  </button>
                  <button className="rounded-lg bg-emerald-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-600">
                    Daftar Member
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Class Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Tambah Kelas Baru
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
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
                  Nama Kelas
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Contoh: Yoga Pagi"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Kategori
                  </label>
                  <select className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-emerald-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                    <option value="cardio">Cardio</option>
                    <option value="strength">Strength</option>
                    <option value="flexibility">Flexibility</option>
                    <option value="martial-arts">Martial Arts</option>
                    <option value="dance">Dance</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Instruktur
                  </label>
                  <select className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-emerald-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                    {mockTrainers.map((trainer) => (
                      <option key={trainer.id} value={trainer.id}>
                        {trainer.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Durasi (menit)
                  </label>
                  <input
                    type="number"
                    className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-emerald-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="60"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Maks Peserta
                  </label>
                  <input
                    type="number"
                    className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-emerald-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="20"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Deskripsi
                </label>
                <textarea
                  rows={3}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-emerald-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Deskripsi kelas..."
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 rounded-lg border border-gray-200 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-emerald-500 px-4 py-2 font-medium text-white hover:bg-emerald-600"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
