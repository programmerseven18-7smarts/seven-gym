import { allBranchIds, getBranchById } from "./branches";
import {
  checkIns,
  members,
  mockClasses,
  mockPTSessions,
  mockTrainers,
  products,
  rewards,
} from "./mockData";

export type PaymentStatus = "completed" | "pending" | "failed" | "void";
export type ShiftStatus = "open" | "closed" | "review";
export type QueueStatus = "queued" | "sent" | "failed" | "retrying";

const branchMultiplier: Record<string, number> = {
  "branch-pusat": 1,
  "branch-bsd": 0.74,
  "branch-bekasi": 0.56,
  "branch-depok": 0.2,
};

export const memberBranchAccess = [
  { memberId: "M001", homeBranchId: "branch-pusat", allowedBranchIds: ["branch-pusat", "branch-bsd"] },
  { memberId: "M002", homeBranchId: "branch-pusat", allowedBranchIds: ["branch-pusat"] },
  { memberId: "M003", homeBranchId: "branch-bsd", allowedBranchIds: ["branch-bsd"] },
  { memberId: "M004", homeBranchId: "branch-bekasi", allowedBranchIds: ["branch-bekasi"] },
  { memberId: "M005", homeBranchId: "branch-bsd", allowedBranchIds: ["branch-pusat", "branch-bsd"] },
  { memberId: "M006", homeBranchId: "branch-bekasi", allowedBranchIds: ["branch-bekasi", "branch-depok"] },
];

export const branchMembers = members.map((member) => {
  const branchAccess =
    memberBranchAccess.find((access) => access.memberId === member.id) ??
    memberBranchAccess[0];

  return {
    ...member,
    branchId: branchAccess.homeBranchId,
    allowedBranchIds: branchAccess.allowedBranchIds,
  };
});

export const branchTrainers = mockTrainers.map((trainer, index) => ({
  ...trainer,
  branchIds:
    index === 0
      ? ["branch-pusat", "branch-bsd"]
      : index === 1
      ? ["branch-pusat"]
      : index === 2
      ? ["branch-bsd", "branch-bekasi"]
      : ["branch-bekasi"],
}));

export const branchClasses = mockClasses.map((gymClass, index) => ({
  ...gymClass,
  branchId: index % 3 === 0 ? "branch-pusat" : index % 3 === 1 ? "branch-bsd" : "branch-bekasi",
  room: index % 2 === 0 ? "Studio A" : "Studio B",
}));

export const branchPTSessions = mockPTSessions.map((session, index) => ({
  ...session,
  branchId: index % 3 === 0 ? "branch-pusat" : index % 3 === 1 ? "branch-bsd" : "branch-bekasi",
}));

export const branchCheckIns = checkIns.map((checkIn, index) => {
  const memberAccess =
    memberBranchAccess.find((access) => access.memberId === checkIn.memberId) ??
    memberBranchAccess[0];
  const branchId =
    index % 2 === 0 ? memberAccess.homeBranchId : memberAccess.allowedBranchIds[0];

  return {
    ...checkIn,
    branchId,
    gate: index % 2 === 0 ? "Front Gate" : "Studio Gate",
    validation: checkIn.checkoutTime ? "completed" : "active",
  };
});

export const branchInventory = allBranchIds.flatMap((branchId) =>
  products.map((product, index) => {
    const multiplier = branchMultiplier[branchId] ?? 1;
    const stock = Math.max(0, Math.round(product.stock * multiplier) - index * 2);

    return {
      id: `${branchId}-${product.id}`,
      productId: product.id,
      branchId,
      name: product.name,
      category: product.category === "beverage" ? "consumable" : product.category,
      price: product.price,
      stock,
      minStock: product.minStock,
      sku: `${getBranchById(branchId).code}-${product.sku}`,
      image: product.image,
      reorderStatus: stock <= product.minStock ? "needs-restock" : "ok",
    };
  }),
);

export const branchTransactions = [
  {
    id: "INV-PST-260526-001",
    branchId: "branch-pusat",
    cashierName: "Budi Santoso",
    type: "membership",
    memberName: "Andi Wijaya",
    description: "Premium Membership - 3 Bulan",
    amount: 1500000,
    status: "completed" as PaymentStatus,
    paymentMethod: "qris",
    date: "2026-05-26",
  },
  {
    id: "INV-PST-260526-002",
    branchId: "branch-pusat",
    cashierName: "Budi Santoso",
    type: "pt-session",
    memberName: "Siti Rahayu",
    description: "Paket PT Session - 10x",
    amount: 2000000,
    status: "completed" as PaymentStatus,
    paymentMethod: "transfer",
    date: "2026-05-26",
  },
  {
    id: "INV-BSD-260526-001",
    branchId: "branch-bsd",
    cashierName: "Nadia Putri",
    type: "product",
    memberName: "Reza Mahendra",
    description: "Whey Protein + BCAA Powder",
    amount: 1300000,
    status: "completed" as PaymentStatus,
    paymentMethod: "cash",
    date: "2026-05-26",
  },
  {
    id: "INV-BKS-260525-001",
    branchId: "branch-bekasi",
    cashierName: "Fajar Nugroho",
    type: "class",
    memberName: "Maya Sari",
    description: "Class Pass - 5x",
    amount: 350000,
    status: "pending" as PaymentStatus,
    paymentMethod: "transfer",
    date: "2026-05-25",
  },
  {
    id: "INV-BSD-260524-001",
    branchId: "branch-bsd",
    cashierName: "Nadia Putri",
    type: "membership",
    memberName: "Bimo Satrio",
    description: "Renewal Basic - 1 Bulan",
    amount: 300000,
    status: "failed" as PaymentStatus,
    paymentMethod: "qris",
    date: "2026-05-24",
  },
];

export const cashShifts = [
  {
    id: "SHIFT-PST-001",
    branchId: "branch-pusat",
    cashierName: "Budi Santoso",
    openedAt: "2026-05-26 07:00",
    closedAt: "",
    openingCash: 1200000,
    expectedCash: 3900000,
    countedCash: 0,
    status: "open" as ShiftStatus,
  },
  {
    id: "SHIFT-BSD-001",
    branchId: "branch-bsd",
    cashierName: "Nadia Putri",
    openedAt: "2026-05-26 08:00",
    closedAt: "2026-05-26 16:15",
    openingCash: 800000,
    expectedCash: 2100000,
    countedCash: 2100000,
    status: "closed" as ShiftStatus,
  },
  {
    id: "SHIFT-BKS-001",
    branchId: "branch-bekasi",
    cashierName: "Fajar Nugroho",
    openedAt: "2026-05-26 08:00",
    closedAt: "",
    openingCash: 650000,
    expectedCash: 1000000,
    countedCash: 0,
    status: "review" as ShiftStatus,
  },
];

export const invoiceQueue = branchTransactions.map((transaction, index) => ({
  id: `QUEUE-${transaction.id}`,
  branchId: transaction.branchId,
  invoiceNo: transaction.id,
  recipient: transaction.memberName,
  channel: index % 2 === 0 ? "whatsapp" : "email",
  status: transaction.status === "completed" ? "sent" : "queued",
  generatedAt: `${transaction.date} 10:${String(index + 10).padStart(2, "0")}`,
}));

export const classBookingQueue = [
  {
    id: "BOOK-001",
    branchId: "branch-pusat",
    className: "Morning Yoga",
    memberName: "Andi Wijaya",
    date: "2026-05-27",
    time: "06:00",
    status: "confirmed",
    capacity: "18/20",
  },
  {
    id: "BOOK-002",
    branchId: "branch-bsd",
    className: "HIIT Blast",
    memberName: "Reza Mahendra",
    date: "2026-05-27",
    time: "18:30",
    status: "waitlist",
    capacity: "15/15",
  },
  {
    id: "BOOK-003",
    branchId: "branch-bekasi",
    className: "Zumba Party",
    memberName: "Maya Sari",
    date: "2026-05-28",
    time: "18:00",
    status: "confirmed",
    capacity: "21/25",
  },
];

export const equipmentInspections = [
  {
    id: "EQ-001",
    branchId: "branch-pusat",
    equipmentName: "Treadmill T-07",
    location: "Cardio Area",
    status: "ok",
    nextCheck: "2026-06-02",
  },
  {
    id: "EQ-002",
    branchId: "branch-bsd",
    equipmentName: "Cable Crossover",
    location: "Strength Area",
    status: "maintenance",
    nextCheck: "2026-05-28",
  },
  {
    id: "EQ-003",
    branchId: "branch-bekasi",
    equipmentName: "Smith Machine",
    location: "Weight Room",
    status: "needs-part",
    nextCheck: "2026-05-30",
  },
];

export const whatsappQueue = [
  {
    id: "WA-001",
    branchId: "branch-pusat",
    template: "membership_expiry_h7",
    recipient: "Bimo Satrio",
    status: "queued" as QueueStatus,
    scheduledAt: "2026-05-26 09:00",
  },
  {
    id: "WA-002",
    branchId: "branch-bsd",
    template: "class_reminder_h2",
    recipient: "Reza Mahendra",
    status: "sent" as QueueStatus,
    scheduledAt: "2026-05-26 16:30",
  },
  {
    id: "WA-003",
    branchId: "branch-bekasi",
    template: "payment_pending",
    recipient: "Maya Sari",
    status: "retrying" as QueueStatus,
    scheduledAt: "2026-05-26 11:00",
  },
];

export const auditLogs = [
  {
    id: "AUD-001",
    branchId: "branch-pusat",
    actor: "Raka Pradana",
    action: "roles.update",
    target: "Receptionist BSD",
    time: "2026-05-26 08:15",
  },
  {
    id: "AUD-002",
    branchId: "branch-bsd",
    actor: "Nadia Putri",
    action: "members.freeze",
    target: "Bimo Satrio",
    time: "2026-05-26 09:25",
  },
  {
    id: "AUD-003",
    branchId: "branch-bekasi",
    actor: "Fajar Nugroho",
    action: "pos.void.request",
    target: "INV-BKS-260525-001",
    time: "2026-05-26 10:05",
  },
  {
    id: "AUD-004",
    branchId: "branch-pusat",
    actor: "Budi Santoso",
    action: "inventory.restock",
    target: "Whey Protein Gold Standard",
    time: "2026-05-26 10:30",
  },
];

export const permissionMatrix = [
  { module: "Member", owner: "full", staff: "operate", trainer: "none", member: "self" },
  { module: "Check-In", owner: "full", staff: "operate", trainer: "none", member: "self" },
  { module: "Kelas", owner: "full", staff: "operate", trainer: "view", member: "self" },
  { module: "PT", owner: "full", staff: "operate", trainer: "self", member: "self" },
  { module: "POS", owner: "full", staff: "operate", trainer: "none", member: "none" },
  { module: "Inventory", owner: "full", staff: "operate", trainer: "none", member: "none" },
  { module: "Promo", owner: "full", staff: "none", trainer: "none", member: "view" },
  { module: "Notifikasi", owner: "full", staff: "view", trainer: "none", member: "none" },
  { module: "Reports", owner: "full", staff: "none", trainer: "self", member: "self" },
  { module: "Settings", owner: "full", staff: "none", trainer: "none", member: "none" },
  { module: "IAM", owner: "full", staff: "none", trainer: "none", member: "none" },
];

export const apiContracts = [
  { method: "GET", path: "/api/branches/:branchId/members", guard: "members.view + branchAccess" },
  { method: "POST", path: "/api/checkins", guard: "checkin.create + active membership" },
  { method: "POST", path: "/api/pos/transactions", guard: "pos.create + open cash shift" },
  { method: "PATCH", path: "/api/iam/users/:id/roles", guard: "iam.roles + audit log" },
  { method: "POST", path: "/api/notifications/whatsapp/queue", guard: "notifications.manage" },
];

export const businessRules = [
  "Semua data operasional wajib membawa branchId.",
  "Owner bisa melihat semua cabang, staff hanya cabang yang terdaftar di branchAccess.",
  "POS hanya bisa transaksi jika cash shift kasir sedang open.",
  "Check-in ditolak jika membership expired/frozen atau cabang tidak diizinkan.",
  "Booking kelas masuk waiting list jika kapasitas penuh.",
  "Void/refund transaksi wajib approval owner/admin dan masuk audit log.",
];

export const getBranchMembers = (branchId: string) =>
  branchMembers.filter((member) => member.allowedBranchIds.includes(branchId));

export const getBranchCheckIns = (branchId: string) =>
  branchCheckIns.filter((checkIn) => checkIn.branchId === branchId);

export const getBranchInventory = (branchId: string) =>
  branchInventory.filter((item) => item.branchId === branchId);

export const getBranchTransactions = (branchId: string) =>
  branchTransactions.filter((transaction) => transaction.branchId === branchId);

export const getBranchClasses = (branchId: string) =>
  branchClasses.filter((gymClass) => gymClass.branchId === branchId);

export const getBranchPTSessions = (branchId: string) =>
  branchPTSessions.filter((session) => session.branchId === branchId);

export const getBranchAuditLogs = (branchId: string) =>
  auditLogs.filter((log) => log.branchId === branchId || branchId === "branch-pusat");

export const getBranchOperationalSnapshot = (branchId: string) => {
  const scopedMembers = getBranchMembers(branchId);
  const scopedCheckIns = getBranchCheckIns(branchId);
  const scopedInventory = getBranchInventory(branchId);
  const scopedTransactions = getBranchTransactions(branchId);
  const scopedClasses = getBranchClasses(branchId);
  const scopedPtSessions = getBranchPTSessions(branchId);
  const revenue = scopedTransactions
    .filter((transaction) => transaction.status === "completed")
    .reduce((total, transaction) => total + transaction.amount, 0);

  return {
    branch: getBranchById(branchId),
    revenue,
    activeMembers: scopedMembers.filter((member) => member.membershipStatus === "active").length,
    totalMembers: scopedMembers.length,
    checkInsToday: scopedCheckIns.length,
    activeInGym: scopedCheckIns.filter((checkIn) => !checkIn.checkoutTime).length,
    lowStock: scopedInventory.filter((item) => item.stock <= item.minStock).length,
    classBookings: classBookingQueue.filter((booking) => booking.branchId === branchId).length,
    ptSessions: scopedPtSessions.length,
    waitlist: classBookingQueue.filter(
      (booking) => booking.branchId === branchId && booking.status === "waitlist",
    ).length,
    rewardsStock: rewards.reduce((total, reward) => total + reward.stock, 0),
    openShift: cashShifts.find(
      (shift) => shift.branchId === branchId && shift.status === "open",
    ),
    scopedMembers,
    scopedCheckIns,
    scopedInventory,
    scopedTransactions,
    scopedClasses,
    scopedPtSessions,
  };
};
