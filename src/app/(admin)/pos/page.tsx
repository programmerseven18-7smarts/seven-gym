"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRole } from "@/context/RoleContext";
import { usePrototypeData } from "@/context/PrototypeDataContext";
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
type PaymentMethodKey = "cash" | "transfer" | "qris";
type ReceiptInfo = {
  invoiceNo: string;
  issuedAt: string;
};

const paymentIcons: Record<PaymentMethodKey, string> = {
  cash: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2",
  transfer: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
  qris: "M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h2",
};

const normalizePaymentMethod = (value: string): PaymentMethodKey | null => {
  const normalized = value.toLowerCase();
  if (normalized.includes("tunai") || normalized.includes("cash")) return "cash";
  if (normalized.includes("qris") || normalized.includes("qr")) return "qris";
  if (normalized.includes("transfer") || normalized.includes("bank")) return "transfer";
  return null;
};

const membershipCatalogImages = [
  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?auto=format&fit=crop&w=900&q=80",
];

const ptCatalogImages = [
  "https://images.unsplash.com/photo-1571019613914-85f342c6a11e?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1594737625785-a6cbdabd333c?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&w=900&q=80",
];

const productCatalogImages: Record<string, string> = {
  P001: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=900&q=80",
  P002: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=900&q=80",
  P003: "https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=900&q=80",
  P004: "https://images.unsplash.com/photo-1553530979-7ee52a2670c4?auto=format&fit=crop&w=900&q=80",
  P005: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=900&q=80",
};

const ExpandIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
  </svg>
);

const CollapseIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" />
  </svg>
);

export default function POSPage() {
  const { activeBranch, currentUser, hasAnyPermission } = useRole();
  const {
    createPosTransaction,
    voidTransaction,
    updateInvoiceStatus,
    closeCashShift,
    getInventoryForBranch,
    getMembersForBranch,
    transactions,
    invoices,
    cashShifts,
    membershipPackageSettings,
    ptPackageSettings,
    paymentMethodSettings,
    promos,
    addAuditLog,
  } = usePrototypeData();
  const branchMembers = getMembersForBranch(activeBranch.id);
  const branchProducts = getInventoryForBranch(activeBranch.id);
  const membershipPackages = membershipPackageSettings.filter((pkg) => pkg.status === "active");
  const ptPackages = ptPackageSettings.filter((pkg) => pkg.status === "active");
  const activePromos = promos.filter(
    (promo) => promo.status === "active" && promo.usageCount < promo.maxUsage,
  );
  const openShift = cashShifts.find(
    (shift) => shift.branchId === activeBranch.id && shift.status === "open",
  );
  const canCreatePayment = hasAnyPermission(["pos.create", "payments.create"]) && Boolean(openShift);
  const [activeTab, setActiveTab] = useState<TabType>("membership");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedMember, setSelectedMember] = useState<(typeof branchMembers)[0] | null>(null);
  const [memberSearch, setMemberSearch] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodKey>("cash");
  const [splitPayment, setSplitPayment] = useState(false);
  const [secondaryPaymentMethod, setSecondaryPaymentMethod] = useState<Exclude<PaymentMethodKey, "cash">>("qris");
  const [splitCashAmount, setSplitCashAmount] = useState("0");
  const [discount, setDiscount] = useState(0);
  const [selectedPromoId, setSelectedPromoId] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showCloseShift, setShowCloseShift] = useState(false);
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [receiptInfo, setReceiptInfo] = useState<ReceiptInfo | null>(null);
  const [countedCash, setCountedCash] = useState(openShift ? String(openShift.expectedCash) : "0");

  const filteredMembers = branchMembers.filter(
    (m) =>
      m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
      m.email.toLowerCase().includes(memberSearch.toLowerCase())
  );

  useEffect(() => {
    document.body.classList.toggle("pos-fullscreen-active", isFullscreen);

    return () => {
      document.body.classList.remove("pos-fullscreen-active");
    };
  }, [isFullscreen]);

  const paymentOptions = useMemo(() => {
    const seenMethods = new Set<PaymentMethodKey>();
    const configuredMethods = paymentMethodSettings
      .filter((method) => method.status === "active")
      .map((method) => {
        const key = normalizePaymentMethod(`${method.id} ${method.name}`);
        if (!key || seenMethods.has(key)) return null;
        seenMethods.add(key);
        return {
          key,
          label: method.name,
          helper: `${method.settlement} / fee ${method.fee}`,
          icon: paymentIcons[key],
        };
      })
      .filter(Boolean) as Array<{ key: PaymentMethodKey; label: string; helper: string; icon: string }>;

    return configuredMethods.length
      ? configuredMethods
      : [
          { key: "cash" as const, label: "Cash", helper: "Realtime / fee 0%", icon: paymentIcons.cash },
          { key: "transfer" as const, label: "Transfer", helper: "Manual verify / fee 0%", icon: paymentIcons.transfer },
          { key: "qris" as const, label: "QRIS", helper: "H+1 / fee 0.7%", icon: paymentIcons.qris },
        ];
  }, [paymentMethodSettings]);
  const secondaryPaymentOptions = useMemo(
    () =>
      paymentOptions.filter(
        (method): method is { key: Exclude<PaymentMethodKey, "cash">; label: string; helper: string; icon: string } =>
          method.key !== "cash",
      ),
    [paymentOptions],
  );
  const effectivePaymentMethod = paymentOptions.some((method) => method.key === paymentMethod)
    ? paymentMethod
    : paymentOptions[0]?.key ?? "cash";
  const effectiveSecondaryPaymentMethod = secondaryPaymentOptions.some((method) => method.key === secondaryPaymentMethod)
    ? secondaryPaymentMethod
    : secondaryPaymentOptions[0]?.key ?? "qris";

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
  const selectedPromo = activePromos.find((promo) => promo.id === selectedPromoId);
  const manualDiscountAmount = (subtotal * discount) / 100;
  const promoDiscountAmount = selectedPromo
    ? selectedPromo.type === "percentage"
      ? (subtotal * selectedPromo.discount) / 100
      : Math.min(subtotal, selectedPromo.discount)
    : 0;
  const discountAmount = selectedPromo ? promoDiscountAmount : manualDiscountAmount;
  const discountLabel = selectedPromo
    ? `${selectedPromo.code} (${selectedPromo.type === "percentage" ? `${selectedPromo.discount}%` : formatCurrency(selectedPromo.discount)})`
    : discount > 0
    ? `${discount}%`
    : "";
  const total = subtotal - discountAmount;
  const splitCash = splitPayment ? Math.min(total, Math.max(0, Number(splitCashAmount) || 0)) : total;
  const splitRemainder = splitPayment ? Math.max(0, total - splitCash) : 0;
  const recentTransactions = transactions
    .filter((transaction) => transaction.branchId === activeBranch.id)
    .slice(0, 6);

  const downloadTextFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const handlePayment = () => {
    if (cart.length === 0) return;
    if (!canCreatePayment) return;
    const result = createPosTransaction({
      branchId: activeBranch.id,
      cashierName: currentUser.name,
      memberId: selectedMember?.id,
      memberName: selectedMember?.name,
      items: cart,
      total,
      paymentMethod: splitPayment ? effectiveSecondaryPaymentMethod : effectivePaymentMethod,
      promoId: selectedPromo?.id,
      promoCode: selectedPromo?.code,
      discountAmount,
      cashAmount: splitPayment ? splitCash : effectivePaymentMethod === "cash" ? total : 0,
    });

    if (!result) return;

    setReceiptInfo({
      invoiceNo: result.invoice.invoiceNo,
      issuedAt: result.invoice.generatedAt,
    });
    setShowPaymentModal(false);
    setShowReceipt(true);
  };

  const resetTransaction = () => {
    setCart([]);
    setSelectedMember(null);
    setDiscount(0);
    setSelectedPromoId("");
    setSplitPayment(false);
    setSplitCashAmount("0");
    setShowPaymentModal(false);
    setShowReceipt(false);
    setReceiptInfo(null);
    setMemberSearch("");
  };

  const downloadReceipt = () => {
    downloadTextFile(
      `${receiptInfo?.invoiceNo ?? "seven-gym-receipt"}.txt`,
      [
        "Seven Gym",
        `Invoice: ${receiptInfo?.invoiceNo ?? "-"}`,
        `Tanggal: ${receiptInfo?.issuedAt ?? "-"}`,
        selectedMember ? `Customer: ${selectedMember.name}` : "Customer: Walk-in",
        "",
        ...cart.map((item) => `${item.name} x${item.qty} = ${formatCurrency(item.price * item.qty)}`),
        "",
        `Subtotal: ${formatCurrency(subtotal)}`,
        discountAmount > 0 ? `Diskon: -${formatCurrency(discountAmount)}` : "",
        `Total: ${formatCurrency(total)}`,
        splitPayment
          ? `Pembayaran: Cash ${formatCurrency(splitCash)} + ${effectiveSecondaryPaymentMethod.toUpperCase()} ${formatCurrency(splitRemainder)}`
          : `Pembayaran: ${effectivePaymentMethod.toUpperCase()}`,
      ].filter(Boolean).join("\n"),
    );
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

  const posShellClass = isFullscreen
    ? "fixed inset-0 z-[999999] flex h-screen flex-col gap-4 overflow-hidden bg-gray-50 p-3 dark:bg-gray-950 xl:flex-row"
    : "flex min-h-[calc(100vh-120px)] flex-col gap-6 xl:h-[calc(100vh-120px)] xl:flex-row";

  return (
    <div className={posShellClass}>
      {/* Left Panel - Product Catalog */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white border border-gray-200 rounded-2xl dark:border-gray-800 dark:bg-white/[0.03]">
        {/* Tabs */}
        <div className="border-b border-gray-200 p-3 dark:border-gray-800">
          <div className="mb-3 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span>POS {activeBranch.name} / Kasir: {currentUser.name} / Shift: {openShift ? openShift.id : "belum open"}</span>
              <div className="flex items-center gap-2">
              {openShift && (
                <button
                  type="button"
                  onClick={() => {
                    setCountedCash(String(openShift.expectedCash));
                    setShowCloseShift(true);
                  }}
                  className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                >
                  Close Shift
                </button>
              )}
                <button
                  type="button"
                  title={isFullscreen ? "Keluar fullscreen" : "Fullscreen POS"}
                  aria-label={isFullscreen ? "Keluar fullscreen" : "Fullscreen POS"}
                  onClick={() => setIsFullscreen((value) => !value)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50 dark:border-emerald-500/30 dark:bg-gray-900 dark:text-emerald-300"
                >
                  {isFullscreen ? <CollapseIcon /> : <ExpandIcon />}
                </button>
              </div>
            </div>
          </div>
          <div className="flex gap-1">
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
        </div>

        {/* Product Grid */}
        <div className="flex-1 p-4 overflow-y-auto">
          {activeTab === "membership" && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-3">
              {membershipPackages.map((pkg, index) => (
                <button
                  key={pkg.id}
                  onClick={() => addToCart(pkg, "membership")}
                  className="overflow-hidden text-left transition-all border border-gray-200 rounded-xl hover:border-emerald-300 hover:shadow-md dark:border-gray-700 dark:hover:border-emerald-500/50 group"
                >
                  <div className="relative h-28 overflow-hidden bg-gray-100 dark:bg-gray-800">
                    <Image
                      src={membershipCatalogImages[index % membershipCatalogImages.length]}
                      alt={pkg.name}
                      fill
                      sizes="(min-width: 1536px) 22vw, (min-width: 640px) 36vw, 88vw"
                      className="object-cover transition duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                    <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      Membership
                    </span>
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{pkg.name}</p>
                    <p className="mt-1 text-lg font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(pkg.price)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {activeTab === "pt" && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-3">
              {ptPackages.map((pkg, index) => (
                <button
                  key={pkg.id}
                  onClick={() => addToCart(pkg, "pt")}
                  className="overflow-hidden text-left transition-all border border-gray-200 rounded-xl hover:border-cyan-300 hover:shadow-md dark:border-gray-700 dark:hover:border-cyan-500/50 group"
                >
                  <div className="relative h-28 overflow-hidden bg-gray-100 dark:bg-gray-800">
                    <Image
                      src={ptCatalogImages[index % ptCatalogImages.length]}
                      alt={pkg.name}
                      fill
                      sizes="(min-width: 1536px) 22vw, (min-width: 640px) 36vw, 88vw"
                      className="object-cover transition duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                    <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-cyan-700">
                      Personal Trainer
                    </span>
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{pkg.name}</p>
                    <p className="mt-1 text-lg font-bold text-cyan-600 dark:text-cyan-400">
                      {formatCurrency(pkg.price)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {activeTab === "product" && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-3">
              {branchProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product, "product")}
                  disabled={product.stock === 0}
                  className="p-4 text-left transition-all border border-gray-200 rounded-xl hover:border-amber-300 hover:shadow-md dark:border-gray-700 dark:hover:border-amber-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="relative w-full mb-3 overflow-hidden rounded-lg aspect-square bg-gray-100 dark:bg-gray-800">
                    <Image
                      src={productCatalogImages[product.productId] ?? product.image}
                      alt={product.name}
                      fill
                      sizes="(min-width: 1536px) 22vw, (min-width: 640px) 36vw, 88vw"
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

          <div className="mt-4 rounded-xl border border-gray-200 p-3 dark:border-gray-800">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Riwayat Hari Ini</p>
              <button
                type="button"
                onClick={() => downloadTextFile("seven-gym-pos-transactions.json", JSON.stringify(recentTransactions, null, 2))}
                className="text-xs font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
              >
                Export
              </button>
            </div>
            <div className="space-y-2">
              {recentTransactions.map((transaction) => {
                const invoice = invoices.find((item) => item.invoiceNo === transaction.id);

                return (
                  <div key={transaction.id} className="flex items-center justify-between gap-3 rounded-lg bg-gray-50 p-2 dark:bg-gray-800/60">
                    <div className="min-w-0">
                      <p className="truncate font-mono text-xs font-medium text-gray-900 dark:text-white">{transaction.id}</p>
                      <p className="truncate text-xs text-gray-500">{transaction.memberName} / {formatCurrency(transaction.amount)}</p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        onClick={() => invoice && updateInvoiceStatus(invoice.id, "queued")}
                        className="rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-600 hover:bg-white dark:border-gray-700 dark:text-gray-300"
                      >
                        Resend
                      </button>
                      <button
                        type="button"
                        disabled={transaction.status !== "completed"}
                        onClick={() => {
                          voidTransaction(transaction.id);
                          addAuditLog({
                            branchId: activeBranch.id,
                            actor: currentUser.name,
                            action: "pos.void",
                            target: transaction.id,
                          });
                        }}
                        className="rounded-md border border-rose-200 px-2 py-1 text-xs text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-rose-500/30 dark:text-rose-400"
                      >
                        Void
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Cart */}
      <div className="flex min-h-0 w-full flex-col bg-white border border-gray-200 rounded-2xl dark:border-gray-800 dark:bg-white/[0.03] xl:w-[420px]">
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

        {/* Payment Summary */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="p-3 mb-4 space-y-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
              <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Diskon ({discountLabel})</span>
                <span className="font-medium text-error-600 dark:text-error-400">-{formatCurrency(discountAmount)}</span>
              </div>
            )}
            <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
              <span className="font-medium text-gray-900 dark:text-white">Total</span>
              <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(total)}</span>
            </div>
          </div>

          <button
            onClick={() => setShowPaymentModal(true)}
            disabled={cart.length === 0 || !canCreatePayment}
            className="w-full py-3 text-lg font-medium text-white transition-colors rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {openShift ? "Bayar" : "Buka Shift Dulu"}
          </button>
          {!canCreatePayment && (
            <p className="mt-2 text-center text-xs text-error-500">
              Transaksi butuh permission POS dan cash shift aktif.
            </p>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-[1000000] flex items-center justify-center bg-black/60 px-4 py-6">
          <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-900">
            <div className="flex items-start justify-between gap-4 border-b border-gray-200 p-5 dark:border-gray-800">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Checkout POS</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {selectedMember ? selectedMember.name : "Walk-in"} / {cart.length} item
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                aria-label="Tutup checkout"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px]">
                <div className="space-y-5">
                  <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
                    <label className="text-sm font-semibold text-gray-900 dark:text-white">Promo POS</label>
                    <select
                      value={selectedPromoId}
                      onChange={(e) => {
                        setSelectedPromoId(e.target.value);
                        if (e.target.value) setDiscount(0);
                      }}
                      className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    >
                      <option value="">Tanpa Promo</option>
                      {activePromos.map((promo) => (
                        <option key={promo.id} value={promo.id}>
                          {promo.code} - {promo.name}
                        </option>
                      ))}
                    </select>
                    <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Diskon manual</span>
                      <select
                        value={discount}
                        onChange={(e) => setDiscount(Number(e.target.value))}
                        disabled={Boolean(selectedPromo)}
                        className="rounded-lg border border-gray-200 px-3 py-2 text-sm disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      >
                        <option value={0}>Tanpa Diskon</option>
                        <option value={10}>10%</option>
                        <option value={20}>20%</option>
                        <option value={30}>30%</option>
                      </select>
                    </div>
                    {selectedPromo && (
                      <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400">
                        Promo {selectedPromo.code} akan masuk ke transaksi ini.
                      </p>
                    )}
                  </div>

                  <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Metode Pembayaran</p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-3">
                      {paymentOptions.map((method) => (
                        <button
                          key={method.key}
                          type="button"
                          onClick={() => setPaymentMethod(method.key)}
                          className={`flex min-h-[92px] flex-col items-start justify-between rounded-xl border p-3 text-left transition-colors ${
                            effectivePaymentMethod === method.key
                              ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                              : "border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
                          }`}
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={method.icon} />
                          </svg>
                          <span className="text-sm font-semibold">{method.label}</span>
                          <span className="text-xs text-gray-400">{method.helper}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
                    <label className="flex items-center justify-between gap-3 text-sm font-semibold text-gray-900 dark:text-white">
                      Split Payment
                      <input
                        type="checkbox"
                        checked={splitPayment}
                        disabled={!secondaryPaymentOptions.length}
                        onChange={(e) => {
                          setSplitPayment(e.target.checked && secondaryPaymentOptions.length > 0);
                          if (e.target.checked) setSplitCashAmount(String(Math.round(total / 2)));
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 disabled:opacity-50"
                      />
                    </label>
                    {splitPayment && (
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <label className="text-xs text-gray-500 dark:text-gray-400">
                          Cash
                          <input
                            type="number"
                            min={0}
                            max={total}
                            value={splitCashAmount}
                            onChange={(e) => setSplitCashAmount(e.target.value)}
                            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                          />
                        </label>
                        <label className="text-xs text-gray-500 dark:text-gray-400">
                          Sisa
                          <select
                            value={effectiveSecondaryPaymentMethod}
                            onChange={(e) => setSecondaryPaymentMethod(e.target.value as Exclude<PaymentMethodKey, "cash">)}
                            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                          >
                            {secondaryPaymentOptions.map((method) => (
                              <option key={method.key} value={method.key}>
                                {method.label} {formatCurrency(splitRemainder)}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800/60">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Ringkasan</p>
                  <div className="mt-4 space-y-3">
                    {cart.map((item) => (
                      <div key={item.id} className="flex justify-between gap-3 text-sm">
                        <span className="text-gray-600 dark:text-gray-300">{item.name} x{item.qty}</span>
                        <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(item.price * item.qty)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 space-y-2 border-t border-gray-200 pt-4 dark:border-gray-700">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
                      <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(subtotal)}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Diskon</span>
                        <span className="font-medium text-error-600 dark:text-error-400">-{formatCurrency(discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-gray-200 pt-3 dark:border-gray-700">
                      <span className="font-semibold text-gray-900 dark:text-white">Total</span>
                      <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(total)}</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {splitPayment
                        ? `Split: cash ${formatCurrency(splitCash)} + ${effectiveSecondaryPaymentMethod.toUpperCase()} ${formatCurrency(splitRemainder)}`
                        : `Metode: ${effectivePaymentMethod.toUpperCase()}`}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-gray-200 p-5 dark:border-gray-800 sm:flex-row">
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handlePayment}
                disabled={cart.length === 0 || !canCreatePayment}
                className="flex-1 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Konfirmasi Bayar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Close Shift Modal */}
      {showCloseShift && openShift && (
        <div className="fixed inset-0 z-[1000000] flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 dark:bg-gray-900">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Close Shift</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {openShift.id} / expected {formatCurrency(openShift.expectedCash)}
            </p>
            <label className="mt-5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Cash Counted
              <input
                type="number"
                min={0}
                value={countedCash}
                onChange={(e) => setCountedCash(e.target.value)}
                className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </label>
            <div className="mt-3 rounded-lg bg-gray-50 p-3 text-sm text-gray-600 dark:bg-gray-800/60 dark:text-gray-300">
              Selisih: {formatCurrency((Number(countedCash) || 0) - openShift.expectedCash)}
            </div>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setShowCloseShift(false)}
                className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  closeCashShift(openShift.id, Number(countedCash) || 0);
                  addAuditLog({
                    branchId: activeBranch.id,
                    actor: currentUser.name,
                    action: "cash-shift.close",
                    target: openShift.id,
                  });
                  setShowCloseShift(false);
                }}
                className="flex-1 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-600"
              >
                Close Shift
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceipt && (
        <div className="fixed inset-0 z-[1000000] flex items-center justify-center bg-black/50">
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
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Invoice #{receiptInfo?.invoiceNo ?? "00000000"}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {receiptInfo?.issuedAt ?? "-"}
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
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Diskon ({discountLabel})</span>
                    <span className="text-error-600 dark:text-error-400">-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between mt-2 text-lg font-bold">
                  <span className="text-gray-900 dark:text-white">Total</span>
                  <span className="text-emerald-600 dark:text-emerald-400">{formatCurrency(total)}</span>
                </div>
                <p className="mt-2 text-sm text-center text-gray-500 dark:text-gray-400">
                  Metode: {splitPayment ? `SPLIT CASH ${formatCurrency(splitCash)} + ${effectiveSecondaryPaymentMethod.toUpperCase()} ${formatCurrency(splitRemainder)}` : effectivePaymentMethod.toUpperCase()}
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
                onClick={downloadReceipt}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl dark:border-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Download
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
