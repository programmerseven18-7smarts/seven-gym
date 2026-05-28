"use client";

import { useState } from "react";
import { mockMembers, mockPTSessions } from "@/data/mockData";
import { UserIcon } from "@/icons/gym-icons";

export default function MyClientsPage() {
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Mock: Current trainer's clients
  const currentTrainerId = "trainer-1";
  const trainerSessions = mockPTSessions.filter(
    (s) => s.trainerId === currentTrainerId
  );

  // Get unique client IDs from sessions
  const clientIds = [...new Set(trainerSessions.map((s) => s.memberId))];
  const clients = mockMembers.filter((m) => clientIds.includes(m.id));

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getClientSessions = (clientId: string) => {
    return trainerSessions.filter((s) => s.memberId === clientId);
  };

  const getMembershipColor = (type: string) => {
    switch (type) {
      case "premium":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "vip":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Klien Saya
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Kelola dan monitor progres klien personal training
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-2 dark:bg-emerald-900/20">
          <UserIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
            {clients.length} klien aktif
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Cari klien..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:w-64"
        />
        <svg
          className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
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
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Client List */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div className="border-b border-gray-200 p-4 dark:border-gray-700">
              <h2 className="font-semibold text-gray-900 dark:text-white">
                Daftar Klien ({filteredClients.length})
              </h2>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredClients.length > 0 ? (
                filteredClients.map((client) => {
                  const clientSessions = getClientSessions(client.id);
                  const completedSessions = clientSessions.filter(
                    (s) => s.status === "completed"
                  ).length;
                  const upcomingSessions = clientSessions.filter(
                    (s) => s.status === "scheduled"
                  ).length;

                  return (
                    <div
                      key={client.id}
                      onClick={() => setSelectedClient(client.id)}
                      className={`cursor-pointer p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                        selectedClient === client.id
                          ? "bg-emerald-50 dark:bg-emerald-900/20"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-lg font-semibold text-white">
                          {client.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {client.name}
                            </h3>
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-medium ${getMembershipColor(
                                client.membership
                              )}`}
                            >
                              {client.membership}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {client.email}
                          </p>
                          <div className="mt-2 flex items-center gap-4 text-sm">
                            <span className="text-emerald-600 dark:text-emerald-400">
                              {completedSessions} sesi selesai
                            </span>
                            <span className="text-blue-600 dark:text-blue-400">
                              {upcomingSessions} terjadwal
                            </span>
                          </div>
                        </div>
                        <svg
                          className="h-5 w-5 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center">
                  <UserIcon className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
                  <p className="mt-2 text-gray-500 dark:text-gray-400">
                    Tidak ada klien ditemukan
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Client Detail */}
        <div>
          {selectedClient ? (
            <div className="space-y-4">
              {/* Client Profile Card */}
              <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                {(() => {
                  const client = clients.find((c) => c.id === selectedClient);
                  const clientSessions = getClientSessions(selectedClient);
                  if (!client) return null;
                  return (
                    <>
                      <div className="text-center">
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-2xl font-bold text-white">
                          {client.name.charAt(0)}
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                          {client.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {client.phone}
                        </p>
                      </div>
                      <div className="mt-6 space-y-3">
                        <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-2 dark:bg-gray-700">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Total Sesi
                          </span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {clientSessions.length}
                          </span>
                        </div>
                        <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-2 dark:bg-gray-700">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Membership
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${getMembershipColor(
                              client.membership
                            )}`}
                          >
                            {client.membership}
                          </span>
                        </div>
                        <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-2 dark:bg-gray-700">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Bergabung
                          </span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {client.joinDate}
                          </span>
                        </div>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <button className="flex-1 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600">
                          Jadwalkan Sesi
                        </button>
                        <button className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                          Chat
                        </button>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Recent Sessions */}
              <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
                <div className="border-b border-gray-200 p-4 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Sesi Terakhir
                  </h3>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {getClientSessions(selectedClient)
                    .slice(0, 5)
                    .map((session) => (
                      <div key={session.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {session.focus}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {session.date} - {session.time}
                            </p>
                          </div>
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                              session.status === "completed"
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                : session.status === "scheduled"
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            }`}
                          >
                            {session.status === "completed"
                              ? "Selesai"
                              : session.status === "scheduled"
                              ? "Terjadwal"
                              : "Dibatalkan"}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-gray-300 dark:border-gray-600">
              <div className="text-center">
                <UserIcon className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Pilih klien untuk melihat detail
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
