"use client";
import React, { useState } from "react";
import { members, products, membershipPackages, ptPackages } from "@/data/mockData";
import Badge from "@/components/ui/badge/Badge";
import Image from "next/image";

interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  category: string;
}

type TabType = "membership" | "pt" | "product";

export default function POSPage() {
  const [activeTab, setActiveTab] = useState<TabType>("membership");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedMember, setSelectedMember] = useState<(typeof members)[0] | null>(null);
  const [memberSearch, setMemberSearch] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "transfer" | "qris">("cash");
  const [discount, setDiscount] = useState(0);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
      m.email.toLowerCase().includes(memberSearch.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const addToCart = (item: { id: string; name: string; price: number }, category: string) => {
    const existingItem = cart.find((c) => c.id === item.id);
    if (existingItem) {
      setCart(cart.map((c) => (c.id === item.id ? { ...c, qty: c.qty + 1 } : c)));
    } else {
      setCart([...cart, { ...item, qty: 1, category }]);
    }
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter((c) => c.id !== id));
  };

  const updateQty = (id: string, qty: number) => {
    if (qty < 1) {
      removeFromCart(id);
    } else {
      setCart(cart.map((c) => (c.id === id ? { ...c, qty } : c)));
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const discountAmount = (subtotal * discount) / 100;
  const total = subtotal - discountAmount;

  const handlePayment = () => {
    if (cart.length === 0) return;
    setShowReceipt(true);
  };

  const resetTransaction = () => {
    setCart([]);
    setSelectedMember(null);
    setDiscount(0);
    setShowReceipt(false);
    setMemberSearch("");
  };

  const tabs: { key: TabType; label: string; icon: React.ReactNode }[] = [
    {
      key: "membership",
      label: "Membership",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 9a2 2 0 10-4 0v5a2 2 0 01-2 2h6m-6-4h4m8 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      key: "pt",
      label: "PT Session",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      key: "product",
      label: "Produk",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex h-[calc(100vh-120px)] gap-6">
      {/* Left Panel - Product Catalog */}
      <div className="flex flex-col flex-1 overflow-hidden bg-white border border-gray-200 rounded-2xl dark:border-gray-800 dark:bg-white/[0.03]">
        {/* Tabs */}
        <div className="flex gap-1 p-2 border-b border-gray-200 dark:border-gray-800">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                activeTab === tab.key
                  ? "bg-emerald-500 text-white"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="flex-1 p-4 overflow-y-auto">
          {activeTab === "membership" && (
            <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
              {membershipPackages.map((pkg) => (
                <button
                  key={pkg.id}
                  onClick={() => addToCart(pkg, "membership")}
                  className="p-4 text-left transition-all border border-gray-200 rounded-xl hover:border-emerald-300 hover:shadow-md dark:border-gray-700 dark:hover:border-emerald-500/50 group"
                >
                  <div className="flex items-center justify-center w-10 h-10 mb-3 rounded-lg bg-emerald-100 dark:bg-emerald-500/20">
                    <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{pkg.name}</p>
                  <p className="mt-1 text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(pkg.price)}
                  </p>
                </button>
              ))}
            </div>
          )}

          {activeTab === "pt" && (
            <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
              {ptPackages.map((pkg) => (
                <button
                  key={pkg.id}
                  onClick={() => addToCart(pkg, "pt")}
                  className="p-4 text-left transition-all border border-gray-200 rounded-xl hover:border-cyan-300 hover:shadow-md dark:border-gray-700 dark:hover:border-cyan-500/50"
                >
                  <div className="flex items-center justify-center w-10 h-10 mb-3 rounded-lg bg-cyan-100 dark:bg-cyan-500/20">
                    <svg className="w-5 h-5 text-cyan-600 dark:text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{pkg.name}</p>
                  <p className="mt-1 text-lg font-bold text-cyan-600 dark:text-cyan-400">
                    {formatCurrency(pkg.price)}
                  </p>
                </button>
              ))}
            </div>
          )}

          {activeTab === "product" && (
            <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
              {products.map((product) => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product, "product")}
                  disabled={product.stock === 0}
                  className="p-4 text-left transition-all border border-gray-200 rounded-xl hover:border-amber-300 hover:shadow-md dark:border-gray-700 dark:hover:border-amber-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="relative w-full mb-3 overflow-hidden rounded-lg aspect-square bg-gray-100 dark:bg-gray-800">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                    {product.stock <= product.minStock && (
                      <div className="absolute px-2 py-1 text-xs font-medium text-white rounded-full top-2 right-2 bg-error-500">
                        Low Stock
                      </div>
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-900 truncate dark:text-white">
                    {product.name}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
                      {formatCurrency(product.price)}
                    </p>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Stok: {product.stock}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Cart */}
      <div className="flex flex-col w-[420px] bg-white border border-gray-200 rounded-2xl dark:border-gray-800 dark:bg-white/[0.03]">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Keranjang</h2>
        </div>

        {/* Member Selection */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Pilih Member
          </label>
          <div className="relative mt-2">
            <input
              type="text"
              value={selectedMember ? selectedMember.name : memberSearch}
              onChange={(e) => {
                setMemberSearch(e.target.value);
                setSelectedMember(null);
                setShowMemberDropdown(true);
              }}
              onFocus={() => setShowMemberDropdown(true)}
              placeholder="Cari member..."
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
            {showMemberDropdown && memberSearch && !selectedMember && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg dark:bg-gray-800 dark:border-gray-700">
                {filteredMembers.slice(0, 5).map((member) => (
                  <button
                    key={member.id}
                    onClick={() => {
                      setSelectedMember(member);
                      setMemberSearch("");
                      setShowMemberDropdown(false);
                    }}
                    className="flex items-center w-full gap-3 p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <Image
                      src={member.avatar}
                      alt={member.name}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {member.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{member.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          {selectedMember && (
            <div className="flex items-center gap-3 p-3 mt-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
              <Image
                src={selectedMember.avatar}
                alt={selectedMember.name}
                width={40}
                height={40}
                className="rounded-full"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {selectedMember.name}
                </p>
                <div className="flex items-center gap-2">
                  <Badge color={selectedMember.membershipStatus === "active" ? "success" : "error"} size="sm">
                    {selectedMember.membershipType}
                  </Badge>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {selectedMember.points.toLocaleString()} pts
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedMember(null)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Cart Items */}
        <div className="flex-1 p-4 overflow-y-auto">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <svg
                className="w-16 h-16 text-gray-300 dark:text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <p className="mt-4 text-gray-500 dark:text-gray-400">Keranjang kosong</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Pilih item dari katalog
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatCurrency(item.price)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQty(item.id, item.qty - 1)}
                      className="flex items-center justify-center w-8 h-8 text-gray-600 border border-gray-200 rounded-lg dark:border-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      -
                    </button>
                    <span className="w-8 text-sm font-medium text-center text-gray-900 dark:text-white">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => updateQty(item.id, item.qty + 1)}
                      className="flex items-center justify-center w-8 h-8 text-gray-600 border border-gray-200 rounded-lg dark:border-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-1 text-error-500 hover:text-error-600"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payment Section */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          {/* Discount */}
          <div className="flex items-center gap-2 mb-4">
            <label className="text-sm text-gray-600 dark:text-gray-400">Diskon:</label>
            <select
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value))}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value={0}>Tanpa Diskon</option>
              <option value={10}>10%</option>
              <option value={20}>20%</option>
              <option value={30}>30%</option>
            </select>
          </div>

          {/* Payment Method */}
          <div className="flex gap-2 mb-4">
            {[
              { key: "cash" as const, label: "Cash", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2" },
              { key: "transfer" as const, label: "Transfer", icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" },
              { key: "qris" as const, label: "QRIS", icon: "M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h2" },
            ].map((method) => (
              <button
                key={method.key}
                onClick={() => setPaymentMethod(method.key)}
                className={`flex-1 flex flex-col items-center gap-1 p-3 rounded-lg border transition-colors ${
                  paymentMethod === method.key
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                    : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={method.icon} />
                </svg>
                <span className="text-xs font-medium">{method.label}</span>
              </button>
            ))}
          </div>

          {/* Totals */}
          <div className="p-3 mb-4 space-y-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
              <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Diskon ({discount}%)</span>
                <span className="font-medium text-error-600 dark:text-error-400">-{formatCurrency(discountAmount)}</span>
              </div>
            )}
            <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
              <span className="font-medium text-gray-900 dark:text-white">Total</span>
              <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(total)}</span>
            </div>
          </div>

          {/* Pay Button */}
          <button
            onClick={handlePayment}
            disabled={cart.length === 0}
            className="w-full py-3 text-lg font-medium text-white transition-colors rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Bayar Sekarang
          </button>
        </div>
      </div>

      {/* Receipt Modal */}
      {showReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md p-6 mx-4 bg-white rounded-2xl dark:bg-gray-900">
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-500/20">
                <svg className="w-8 h-8 text-emerald-600 dark:text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">Pembayaran Berhasil!</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Transaksi telah selesai</p>
            </div>

            {/* Receipt Details */}
            <div className="p-4 mt-6 rounded-xl bg-gray-50 dark:bg-gray-800/50">
              <div className="pb-3 mb-3 text-center border-b border-dashed border-gray-300 dark:border-gray-700">
                <p className="text-lg font-bold text-gray-900 dark:text-white">Seven Gym</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Invoice #{Date.now().toString().slice(-8)}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {new Date().toLocaleString("id-ID")}
                </p>
              </div>

              {selectedMember && (
                <div className="pb-3 mb-3 border-b border-dashed border-gray-300 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Customer:</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedMember.name}</p>
                </div>
              )}

              <div className="space-y-2">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      {item.name} x{item.qty}
                    </span>
                    <span className="text-gray-900 dark:text-white">{formatCurrency(item.price * item.qty)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-3 mt-3 border-t border-dashed border-gray-300 dark:border-gray-700">
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Diskon ({discount}%)</span>
                    <span className="text-error-600 dark:text-error-400">-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between mt-2 text-lg font-bold">
                  <span className="text-gray-900 dark:text-white">Total</span>
                  <span className="text-emerald-600 dark:text-emerald-400">{formatCurrency(total)}</span>
                </div>
                <p className="mt-2 text-sm text-center text-gray-500 dark:text-gray-400">
                  Metode: {paymentMethod.toUpperCase()}
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => window.print()}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl dark:border-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Print Receipt
              </button>
              <button
                onClick={resetTransaction}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white rounded-xl bg-emerald-500 hover:bg-emerald-600"
              >
                Transaksi Baru
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
