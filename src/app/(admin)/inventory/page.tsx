"use client";

import { useState } from "react";
import { mockInventory } from "@/data/mockData";
import { PackageIcon, AlertIcon, TrendingUpIcon } from "@/icons/gym-icons";

type FilterCategory = "all" | "supplement" | "equipment" | "merchandise" | "consumable";

export default function InventoryPage() {
  const [filterCategory, setFilterCategory] = useState<FilterCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState<string | null>(null);

  const filteredInventory = mockInventory.filter((item) => {
    const matchesCategory = filterCategory === "all" || item.category === filterCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const lowStockItems = mockInventory.filter((item) => item.stock <= item.minStock);
  const totalValue = mockInventory.reduce((sum, item) => sum + item.stock * item.price, 0);

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "supplement":
        return "Suplemen";
      case "equipment":
        return "Peralatan";
      case "merchandise":
        return "Merchandise";
      case "consumable":
        return "Konsumsi";
      default:
        return category;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "supplement":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "equipment":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
      case "merchandise":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
      case "consumable":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Inventaris
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Kelola stok produk dan peralatan gym
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Produk
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
              <PackageIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Produk</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {mockInventory.length}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <TrendingUpIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Nilai Inventaris</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                Rp {(totalValue / 1000000).toFixed(1)}jt
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
              <AlertIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Stok Menipis</p>
              <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
                {lowStockItems.length}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
              <PackageIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Habis</p>
              <p className="text-xl font-bold text-red-600 dark:text-red-400">
                {mockInventory.filter((i) => i.stock === 0).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900/50 dark:bg-yellow-900/20">
          <div className="flex items-start gap-3">
            <AlertIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            <div>
              <h3 className="font-medium text-yellow-800 dark:text-yellow-300">
                Peringatan Stok Menipis
              </h3>
              <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-400">
                {lowStockItems.length} produk memerlukan restok:{" "}
                {lowStockItems.map((i) => i.name).join(", ")}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {(["all", "supplement", "equipment", "merchandise", "consumable"] as FilterCategory[]).map(
            (category) => (
              <button
                key={category}
                onClick={() => setFilterCategory(category)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  filterCategory === category
                    ? "bg-emerald-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                {category === "all" ? "Semua" : getCategoryLabel(category)}
              </button>
            )
          )}
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Cari produk..."
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
      </div>

      {/* Inventory Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Produk
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Kategori
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Harga
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Stok
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredInventory.map((item) => {
                const isLowStock = item.stock <= item.minStock && item.stock > 0;
                const isOutOfStock = item.stock === 0;
                return (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700">
                          <PackageIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {item.name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            SKU: {item.sku}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getCategoryColor(item.category)}`}>
                        {getCategoryLabel(item.category)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 dark:text-white">
                        Rp {item.price.toLocaleString("id-ID")}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-medium ${
                            isOutOfStock
                              ? "text-red-600 dark:text-red-400"
                              : isLowStock
                              ? "text-yellow-600 dark:text-yellow-400"
                              : "text-gray-900 dark:text-white"
                          }`}
                        >
                          {item.stock}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          / {item.minStock} min
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {isOutOfStock ? (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                          Habis
                        </span>
                      ) : isLowStock ? (
                        <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                          Menipis
                        </span>
                      ) : (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                          Tersedia
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setShowRestockModal(item.id)}
                          className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                          Restok
                        </button>
                        <button className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6 dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Tambah Produk Baru
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
                  Nama Produk
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-emerald-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Contoh: Whey Protein 2kg"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    SKU
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-emerald-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="WP-001"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Kategori
                  </label>
                  <select className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-emerald-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                    <option value="supplement">Suplemen</option>
                    <option value="equipment">Peralatan</option>
                    <option value="merchandise">Merchandise</option>
                    <option value="consumable">Konsumsi</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Harga (Rp)
                  </label>
                  <input
                    type="number"
                    className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-emerald-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="500000"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Stok Awal
                  </label>
                  <input
                    type="number"
                    className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-emerald-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="50"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Minimum Stok
                </label>
                <input
                  type="number"
                  className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-emerald-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="10"
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

      {/* Restock Modal */}
      {showRestockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Restok Produk
              </h2>
              <button
                onClick={() => setShowRestockModal(null)}
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
                  Produk
                </label>
                <input
                  type="text"
                  value={mockInventory.find((i) => i.id === showRestockModal)?.name || ""}
                  disabled
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Stok Saat Ini
                </label>
                <input
                  type="text"
                  value={mockInventory.find((i) => i.id === showRestockModal)?.stock || 0}
                  disabled
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Jumlah Restok
                </label>
                <input
                  type="number"
                  className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-emerald-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Masukkan jumlah"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowRestockModal(null)}
                  className="flex-1 rounded-lg border border-gray-200 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-emerald-500 px-4 py-2 font-medium text-white hover:bg-emerald-600"
                >
                  Restok
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
