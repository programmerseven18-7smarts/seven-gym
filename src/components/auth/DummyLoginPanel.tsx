"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  mockLoginUsers,
  roleLabels,
  useRole,
} from "@/context/RoleContext";
import { mockBranches } from "@/data/branches";
import { DumbbellIcon, ShieldIcon } from "@/icons/gym-icons";

export default function DummyLoginPanel() {
  const { loginAsUser } = useRole();
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 dark:bg-gray-950">
      <div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-6xl items-center">
        <div className="grid w-full gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <section className="flex flex-col justify-between rounded-xl bg-gray-900 p-7 text-white">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500">
                <DumbbellIcon className="h-7 w-7" />
              </div>
              <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 border border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Demo Aplikasi
              </div>
              <h1 className="mt-4 text-3xl font-bold">Seven Gym</h1>
              {/* <p className="mt-3 text-sm leading-6 text-gray-300">
                Prototype login dengan session dummy. Role, permission, dan cabang
                aktif akan mengikuti user yang dipilih.
              </p> */}
              <div className="mt-4 rounded-lg bg-white/[0.03] border border-white/[0.08] p-3 text-xs text-gray-400">
                <strong className="text-white">Informasi Demo:</strong> Aplikasi ini dirancang untuk simulasi & evaluasi sistem manajemen gym modern. Seluruh data bersifat mock / dummy.
              </div>
            </div>
            <div className="mt-10 grid gap-3">
              {mockBranches.map((branch) => (
                <div
                  key={branch.id}
                  className="flex items-center justify-between rounded-lg bg-white/10 px-4 py-3"
                >
                  <div>
                    <p className="font-medium">{branch.name}</p>
                    <p className="text-xs text-gray-300">{branch.city}</p>
                  </div>
                  <span className="rounded-md bg-white/10 px-2 py-1 text-xs font-semibold">
                    {branch.code}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                <ShieldIcon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Pilih User Login
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Ini menggantikan role switch bebas: akses muncul dari user.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {mockLoginUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => {
                    loginAsUser(user.id);
                    if (user.role === "owner") {
                      router.push("/system-flow");
                    }
                  }}
                  className="rounded-xl border border-gray-200 p-4 text-left transition hover:border-emerald-300 hover:bg-emerald-50 dark:border-gray-800 dark:hover:bg-emerald-500/10"
                >
                  <div className="flex items-start gap-3">
                    <Image
                      src={user.avatar}
                      alt={user.name}
                      width={44}
                      height={44}
                      className="rounded-full"
                    />
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-gray-900 dark:text-white">
                        {user.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {roleLabels[user.role]}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {user.branchAccess.length} cabang
                    </span>
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 dark:bg-white/[0.06] dark:text-gray-300">
                      {user.email}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
