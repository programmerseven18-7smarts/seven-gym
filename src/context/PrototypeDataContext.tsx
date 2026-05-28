"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getBranchById, mockBranches, type Branch } from "@/data/branches";
import { challenges, members, membershipPackages, promos, ptPackages, rewards } from "@/data/mockData";
import {
  branchCheckIns,
  branchPTSessions,
  branchInventory,
  branchTransactions,
  cashShifts,
  classBookingQueue,
  auditLogs,
  branchClasses,
  invoiceQueue,
  memberBranchAccess,
  whatsappQueue,
} from "@/data/operationalData";

export type PrototypeMember = (typeof members)[number];
export type PrototypeCheckIn = (typeof branchCheckIns)[number];
export type PrototypeInventoryItem = (typeof branchInventory)[number];
export type PrototypeTransaction = (typeof branchTransactions)[number];
export type PrototypeInvoice = Omit<(typeof invoiceQueue)[number], "status"> & {
  status: "queued" | "sent" | "failed" | "retrying";
};
export type PrototypePTSession = (typeof branchPTSessions)[number];
export type PrototypeGymClass = (typeof branchClasses)[number];
export type PrototypeCashShift = (typeof cashShifts)[number];
export type PrototypePaymentMethod = "cash" | "transfer" | "qris";
export type PrototypePromo = (typeof promos)[number];
export type PrototypeReward = (typeof rewards)[number];
export type PrototypeChallenge = (typeof challenges)[number];
export type PrototypeWhatsappMessage = (typeof whatsappQueue)[number];
export type PrototypeAuditLog = (typeof auditLogs)[number];
export type PrototypeMembershipPackage = (typeof membershipPackages)[number] & {
  status: "active" | "inactive";
};
export type PrototypePtPackage = (typeof ptPackages)[number] & {
  status: "active" | "inactive";
};
export type PrototypePaymentConfig = {
  id: string;
  name: string;
  settlement: string;
  fee: string;
  status: "active" | "draft" | "inactive";
};
export type PrototypeMessageTemplate = {
  id: string;
  name: string;
  trigger: string;
  audience: string;
  channel: "WhatsApp" | "Email" | "Email + WhatsApp" | "Push + WhatsApp";
  status: "active" | "draft" | "inactive";
};
export type PrototypeBranch = Branch;

export type StockMovement = {
  id: string;
  branchId: string;
  type: "Masuk" | "Keluar";
  item: string;
  qty: number;
  source: string;
  date: string;
  status: "posted" | "review";
};

type MemberAccess = {
  memberId: string;
  homeBranchId: string;
  allowedBranchIds: string[];
};

type MemberInput = {
  branchId: string;
  name: string;
  email: string;
  phone: string;
  membershipType: PrototypeMember["membershipType"];
  membershipStatus: PrototypeMember["membershipStatus"];
  membershipEnd: string;
  weight?: number;
  height?: number;
  bmi?: number;
};

type UpdateMemberInput = Partial<
  Pick<
    PrototypeMember,
    | "name"
    | "email"
    | "phone"
    | "membershipType"
    | "membershipStatus"
    | "membershipEnd"
    | "weight"
    | "height"
    | "bmi"
  >
>;

type ScanResult = {
  tone: "emerald" | "sky" | "amber" | "rose" | "slate";
  message: string;
};

type PosItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
  category: string;
};

type CreatePosTransactionInput = {
  branchId: string;
  cashierName: string;
  memberId?: string;
  memberName?: string;
  items: PosItem[];
  total: number;
  paymentMethod: PrototypePaymentMethod;
  promoId?: string;
  promoCode?: string;
  discountAmount?: number;
  cashAmount?: number;
};

export type PrototypeClassBooking = {
  id: string;
  branchId: string;
  classId?: string;
  className: string;
  memberId?: string;
  memberName: string;
  date: string;
  time: string;
  status: "confirmed" | "waitlist" | "attended" | "cancelled";
  capacity: string;
};

type CreateClassBookingInput = {
  branchId: string;
  classId: string;
  memberId: string;
  date: string;
};

type CreatePtBookingInput = {
  branchId: string;
  trainerId: string;
  memberId: string;
  date: string;
  time: string;
  duration: number;
  focus: string;
};

type CreateGymClassInput = {
  branchId: string;
  name: string;
  trainerId: string;
  description: string;
  category: string;
  scheduleDay: string;
  scheduleTime: string;
  duration: number;
  maxParticipants: number;
  status?: PrototypeGymClass["status"];
};

type CreateInventoryItemInput = {
  branchId: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  minStock: number;
  sku: string;
};

type CreatePromoInput = {
  name: string;
  description: string;
  discount: number;
  type: PrototypePromo["type"];
  validUntil: string;
  code: string;
  maxUsage: number;
  status?: PrototypePromo["status"];
};

type CreateWhatsappBroadcastInput = {
  branchId: string;
  template: string;
  recipient: string;
  scheduledAt: string;
};

type CreateMembershipPackageInput = {
  name: string;
  price: number;
  duration: number;
};

type CreatePtPackageInput = {
  name: string;
  price: number;
  sessions: number;
};

type CreatePaymentConfigInput = {
  name: string;
  settlement: string;
  fee: string;
};

type CreateMessageTemplateInput = {
  name: string;
  trigger: string;
  audience: string;
  channel: PrototypeMessageTemplate["channel"];
};

type CreateBranchInput = {
  name: string;
  code: string;
  city: string;
  address: string;
};

type CreateRewardInput = {
  name: string;
  points: number;
  stock: number;
};

type CreateChallengeInput = {
  name: string;
  description: string;
  target: number;
  reward: number;
  endDate: string;
};

type AuditLogInput = {
  branchId: string;
  actor: string;
  action: string;
  target: string;
};

type PrototypeSnapshot = {
  branch: ReturnType<typeof getBranchById>;
  revenue: number;
  activeMembers: number;
  totalMembers: number;
  checkInsToday: number;
  activeInGym: number;
  lowStock: number;
  classBookings: number;
  ptSessions: number;
  waitlist: number;
  rewardsStock: number;
  openShift: PrototypeCashShift | undefined;
  scopedMembers: Array<PrototypeMember & MemberAccess & { branchId: string }>;
  scopedCheckIns: PrototypeCheckIn[];
  scopedInventory: PrototypeInventoryItem[];
  scopedTransactions: PrototypeTransaction[];
  scopedClasses: PrototypeGymClass[];
  scopedClassBookings: PrototypeClassBooking[];
  scopedPtSessions: PrototypePTSession[];
};

type PrototypeDataContextType = {
  prototypeToday: string;
  members: PrototypeMember[];
  checkIns: PrototypeCheckIn[];
  inventory: PrototypeInventoryItem[];
  transactions: PrototypeTransaction[];
  invoices: PrototypeInvoice[];
  cashShifts: PrototypeCashShift[];
  stockMovements: StockMovement[];
  classBookings: PrototypeClassBooking[];
  ptSessions: PrototypePTSession[];
  classes: PrototypeGymClass[];
  promos: PrototypePromo[];
  rewards: PrototypeReward[];
  challenges: PrototypeChallenge[];
  whatsappMessages: PrototypeWhatsappMessage[];
  membershipPackageSettings: PrototypeMembershipPackage[];
  ptPackageSettings: PrototypePtPackage[];
  paymentMethodSettings: PrototypePaymentConfig[];
  messageTemplateSettings: PrototypeMessageTemplate[];
  branchSettings: PrototypeBranch[];
  auditLogs: PrototypeAuditLog[];
  getMembersForBranch: (branchId: string) => PrototypeSnapshot["scopedMembers"];
  getCheckInsForBranch: (branchId: string) => PrototypeCheckIn[];
  getInventoryForBranch: (branchId: string) => PrototypeInventoryItem[];
  getTransactionsForBranch: (branchId: string) => PrototypeTransaction[];
  getInvoicesForBranch: (branchId: string) => PrototypeInvoice[];
  getCashShiftsForBranch: (branchId: string) => PrototypeCashShift[];
  getClassBookingsForBranch: (branchId: string) => PrototypeClassBooking[];
  getClassesForBranch: (branchId: string) => PrototypeGymClass[];
  getPtSessionsForBranch: (branchId: string) => PrototypePTSession[];
  getOperationalSnapshot: (branchId: string) => PrototypeSnapshot;
  createMember: (input: MemberInput) => PrototypeMember;
  updateMember: (memberId: string, input: UpdateMemberInput) => void;
  renewMember: (memberId: string) => void;
  toggleFreezeMember: (memberId: string) => void;
  scanCheckInMember: (memberId: string, branchId: string) => ScanResult;
  checkoutMember: (checkInId: string) => void;
  createStockMovement: (input: {
    branchId: string;
    productId: string;
    type: StockMovement["type"];
    qty: number;
    source: string;
    date: string;
  }) => StockMovement | null;
  createPosTransaction: (input: CreatePosTransactionInput) => {
    transaction: PrototypeTransaction;
    invoice: PrototypeInvoice;
  } | null;
  voidTransaction: (transactionId: string) => void;
  updateInvoiceStatus: (invoiceId: string, status: PrototypeInvoice["status"]) => void;
  closeCashShift: (shiftId: string, countedCash: number) => void;
  reopenCashShift: (shiftId: string) => void;
  createClassBooking: (input: CreateClassBookingInput) => PrototypeClassBooking | null;
  cancelClassBooking: (bookingId: string) => void;
  promoteClassWaitlist: (bookingId: string) => void;
  markClassAttendance: (bookingId: string) => void;
  createGymClass: (input: CreateGymClassInput) => PrototypeGymClass;
  updateGymClass: (classId: string, input: Partial<CreateGymClassInput>) => void;
  deleteGymClass: (classId: string) => void;
  createPtBooking: (input: CreatePtBookingInput) => PrototypePTSession | null;
  updatePtSessionStatus: (sessionId: string, status: PrototypePTSession["status"]) => void;
  createInventoryItem: (input: CreateInventoryItemInput) => PrototypeInventoryItem;
  updateInventoryItem: (itemId: string, input: Partial<CreateInventoryItemInput>) => void;
  deleteInventoryItem: (itemId: string) => void;
  createPromo: (input: CreatePromoInput) => PrototypePromo;
  updatePromo: (promoId: string, input: Partial<CreatePromoInput>) => void;
  togglePromoStatus: (promoId: string) => void;
  redeemReward: (memberId: string, rewardId: string) => ScanResult;
  createReward: (input: CreateRewardInput) => PrototypeReward;
  updateReward: (rewardId: string, input: Partial<CreateRewardInput>) => void;
  deleteReward: (rewardId: string) => void;
  boostChallenge: (challengeId: string) => void;
  createChallenge: (input: CreateChallengeInput) => PrototypeChallenge;
  updateChallenge: (challengeId: string, input: Partial<CreateChallengeInput>) => void;
  deleteChallenge: (challengeId: string) => void;
  createWhatsappBroadcast: (input: CreateWhatsappBroadcastInput) => PrototypeWhatsappMessage;
  updateWhatsappStatus: (
    messageId: string,
    status: PrototypeWhatsappMessage["status"],
  ) => void;
  createMembershipPackage: (input: CreateMembershipPackageInput) => PrototypeMembershipPackage;
  updateMembershipPackage: (
    packageId: string,
    input: Partial<CreateMembershipPackageInput>,
  ) => void;
  toggleMembershipPackageStatus: (packageId: string) => void;
  deleteMembershipPackage: (packageId: string) => void;
  createPtPackage: (input: CreatePtPackageInput) => PrototypePtPackage;
  updatePtPackage: (packageId: string, input: Partial<CreatePtPackageInput>) => void;
  togglePtPackageStatus: (packageId: string) => void;
  deletePtPackage: (packageId: string) => void;
  createPaymentMethod: (input: CreatePaymentConfigInput) => PrototypePaymentConfig;
  updatePaymentMethod: (methodId: string, input: Partial<CreatePaymentConfigInput>) => void;
  togglePaymentMethodStatus: (methodId: string) => void;
  deletePaymentMethod: (methodId: string) => void;
  createMessageTemplate: (input: CreateMessageTemplateInput) => PrototypeMessageTemplate;
  updateMessageTemplate: (
    templateId: string,
    input: Partial<CreateMessageTemplateInput>,
  ) => void;
  toggleMessageTemplateStatus: (templateId: string) => void;
  deleteMessageTemplate: (templateId: string) => void;
  createBranch: (input: CreateBranchInput) => PrototypeBranch;
  updateBranch: (branchId: string, input: Partial<CreateBranchInput>) => void;
  toggleBranchStatus: (branchId: string) => void;
  deleteBranch: (branchId: string) => void;
  addAuditLog: (input: AuditLogInput) => PrototypeAuditLog;
  getAuditLogsForBranch: (branchId: string) => PrototypeAuditLog[];
};

const prototypeToday = "2026-05-28";

const initialStockMovements: StockMovement[] = [
  { id: "IN-001", branchId: "branch-pusat", type: "Masuk", item: "Whey Protein Gold Standard", qty: 12, source: "FitSupply Indonesia", date: "2026-05-26", status: "posted" },
  { id: "IN-002", branchId: "branch-pusat", type: "Masuk", item: "Seven Gym T-Shirt", qty: 20, source: "FitSupply Indonesia", date: "2026-05-26", status: "posted" },
  { id: "OUT-001", branchId: "branch-pusat", type: "Keluar", item: "Protein Shake Ready", qty: 8, source: "POS", date: "2026-05-26", status: "posted" },
  { id: "OUT-002", branchId: "branch-bsd", type: "Keluar", item: "Gym Gloves Pro", qty: 2, source: "Adjustment", date: "2026-05-25", status: "review" },
];

const initialClassBookings: PrototypeClassBooking[] = classBookingQueue.map((booking) => ({
  ...booking,
  status: booking.status as PrototypeClassBooking["status"],
}));

const initialMembershipPackageSettings: PrototypeMembershipPackage[] = membershipPackages.map(
  (membershipPackage) => ({
    ...membershipPackage,
    status: "active",
  }),
);

const initialPtPackageSettings: PrototypePtPackage[] = ptPackages.map((ptPackage) => ({
  ...ptPackage,
  status: "active",
}));

const initialPaymentMethodSettings: PrototypePaymentConfig[] = [
  { id: "PAY-CASH", name: "Tunai", settlement: "Realtime", fee: "0%", status: "active" },
  { id: "PAY-QRIS", name: "QRIS", settlement: "H+1", fee: "0.7%", status: "active" },
  { id: "PAY-TRF", name: "Transfer Bank", settlement: "Manual verify", fee: "0%", status: "active" },
  { id: "PAY-CC", name: "Kartu Debit/Kredit", settlement: "H+2", fee: "2.2%", status: "draft" },
];

const initialMessageTemplateSettings: PrototypeMessageTemplate[] = [
  {
    id: "REM-MEM",
    name: "Reminder Membership",
    trigger: "membership_expiry_h7",
    audience: "Member expired H-7",
    channel: "WhatsApp",
    status: "active",
  },
  {
    id: "REM-WORK",
    name: "Reminder Latihan",
    trigger: "member_inactive_h14",
    audience: "Member pasif",
    channel: "WhatsApp",
    status: "active",
  },
  {
    id: "REM-CLASS",
    name: "Reminder Kelas",
    trigger: "class_reminder_h2",
    audience: "Peserta booking",
    channel: "WhatsApp",
    status: "active",
  },
  {
    id: "BRD-PROMO",
    name: "Broadcast Promo",
    trigger: "manual_broadcast",
    audience: "Segment promo",
    channel: "WhatsApp",
    status: "draft",
  },
  {
    id: "BDAY",
    name: "Ucapan Ulang Tahun",
    trigger: "member_birthday",
    audience: "Member ulang tahun",
    channel: "WhatsApp",
    status: "active",
  },
];

const PrototypeDataContext = createContext<PrototypeDataContextType | undefined>(undefined);

const addMonthsToIsoDate = (dateString: string, months: number) => {
  const date = new Date(`${dateString}T00:00:00`);
  date.setMonth(date.getMonth() + months);
  return date.toISOString().slice(0, 10);
};

const createReferralCode = (name: string, sequence: number) => {
  const prefix = name
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 5)
    .toUpperCase();

  return `${prefix || "MEM"}${String(sequence).padStart(3, "0")}`;
};

const formatAuditAmount = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);

type PrototypePersistedState = {
  members: PrototypeMember[];
  memberAccess: MemberAccess[];
  checkIns: PrototypeCheckIn[];
  inventory: PrototypeInventoryItem[];
  transactions: PrototypeTransaction[];
  invoices: PrototypeInvoice[];
  cashShifts: PrototypeCashShift[];
  stockMovements: StockMovement[];
  classBookings: PrototypeClassBooking[];
  ptSessions: PrototypePTSession[];
  classes: PrototypeGymClass[];
  promos: PrototypePromo[];
  rewards: PrototypeReward[];
  challenges: PrototypeChallenge[];
  whatsappMessages: PrototypeWhatsappMessage[];
  membershipPackages: PrototypeMembershipPackage[];
  ptPackages: PrototypePtPackage[];
  paymentMethods: PrototypePaymentConfig[];
  messageTemplates: PrototypeMessageTemplate[];
  branches: PrototypeBranch[];
  auditLogs: PrototypeAuditLog[];
};

const prototypeStorageKey = "seven-gym-prototype-state-v2";

const readPrototypeState = () => {
  if (typeof window === "undefined") return null;

  const storedState = window.localStorage.getItem(prototypeStorageKey);
  if (!storedState) return null;

  try {
    return JSON.parse(storedState) as Partial<PrototypePersistedState>;
  } catch {
    window.localStorage.removeItem(prototypeStorageKey);
    return null;
  }
};

export const usePrototypeData = () => {
  const context = useContext(PrototypeDataContext);
  if (!context) {
    throw new Error("usePrototypeData must be used within a PrototypeDataProvider");
  }
  return context;
};

export const PrototypeDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPersistedStateReady, setIsPersistedStateReady] = useState(false);
  const [memberRows, setMemberRows] = useState<PrototypeMember[]>(() => members);
  const [memberAccessRows, setMemberAccessRows] = useState<MemberAccess[]>(() => memberBranchAccess);
  const [checkInRows, setCheckInRows] = useState<PrototypeCheckIn[]>(() => branchCheckIns);
  const [inventoryRows, setInventoryRows] = useState<PrototypeInventoryItem[]>(() => branchInventory);
  const [transactionRows, setTransactionRows] = useState<PrototypeTransaction[]>(() => branchTransactions);
  const [invoiceRows, setInvoiceRows] = useState<PrototypeInvoice[]>(() =>
    invoiceQueue.map((invoice) => ({
      ...invoice,
      status: invoice.status as PrototypeInvoice["status"],
    })),
  );
  const [cashShiftRows, setCashShiftRows] = useState<PrototypeCashShift[]>(() => cashShifts);
  const [stockMovementRows, setStockMovementRows] = useState<StockMovement[]>(() => initialStockMovements);
  const [classBookingRows, setClassBookingRows] = useState<PrototypeClassBooking[]>(() => initialClassBookings);
  const [ptSessionRows, setPtSessionRows] = useState<PrototypePTSession[]>(() => branchPTSessions);
  const [gymClassRows, setGymClassRows] = useState<PrototypeGymClass[]>(() => branchClasses);
  const [promoRows, setPromoRows] = useState<PrototypePromo[]>(() => promos);
  const [rewardRows, setRewardRows] = useState<PrototypeReward[]>(() => rewards);
  const [challengeRows, setChallengeRows] = useState<PrototypeChallenge[]>(() => challenges);
  const [whatsappRows, setWhatsappRows] = useState<PrototypeWhatsappMessage[]>(() => whatsappQueue);
  const [membershipPackageRows, setMembershipPackageRows] = useState<PrototypeMembershipPackage[]>(
    () => initialMembershipPackageSettings,
  );
  const [ptPackageRows, setPtPackageRows] = useState<PrototypePtPackage[]>(
    () => initialPtPackageSettings,
  );
  const [paymentMethodRows, setPaymentMethodRows] = useState<PrototypePaymentConfig[]>(
    () => initialPaymentMethodSettings,
  );
  const [messageTemplateRows, setMessageTemplateRows] = useState<PrototypeMessageTemplate[]>(
    () => initialMessageTemplateSettings,
  );
  const [branchRows, setBranchRows] = useState<PrototypeBranch[]>(() => mockBranches);
  const [auditLogRows, setAuditLogRows] = useState<PrototypeAuditLog[]>(() => auditLogs);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const storedState = readPrototypeState();
      if (storedState) {
        if (storedState.members) setMemberRows(storedState.members);
        if (storedState.memberAccess) setMemberAccessRows(storedState.memberAccess);
        if (storedState.checkIns) setCheckInRows(storedState.checkIns);
        if (storedState.inventory) setInventoryRows(storedState.inventory);
        if (storedState.transactions) setTransactionRows(storedState.transactions);
        if (storedState.invoices) setInvoiceRows(storedState.invoices);
        if (storedState.cashShifts) setCashShiftRows(storedState.cashShifts);
        if (storedState.stockMovements) setStockMovementRows(storedState.stockMovements);
        if (storedState.classBookings) setClassBookingRows(storedState.classBookings);
        if (storedState.ptSessions) setPtSessionRows(storedState.ptSessions);
        if (storedState.classes) setGymClassRows(storedState.classes);
        if (storedState.promos) setPromoRows(storedState.promos);
        if (storedState.rewards) setRewardRows(storedState.rewards);
        if (storedState.challenges) setChallengeRows(storedState.challenges);
        if (storedState.whatsappMessages) setWhatsappRows(storedState.whatsappMessages);
        if (storedState.membershipPackages) setMembershipPackageRows(storedState.membershipPackages);
        if (storedState.ptPackages) setPtPackageRows(storedState.ptPackages);
        if (storedState.paymentMethods) setPaymentMethodRows(storedState.paymentMethods);
        if (storedState.messageTemplates) setMessageTemplateRows(storedState.messageTemplates);
        if (storedState.branches) setBranchRows(storedState.branches);
        if (storedState.auditLogs) setAuditLogRows(storedState.auditLogs);
      }

      setIsPersistedStateReady(true);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (!isPersistedStateReady || typeof window === "undefined") return;

    const nextState: PrototypePersistedState = {
      members: memberRows,
      memberAccess: memberAccessRows,
      checkIns: checkInRows,
      inventory: inventoryRows,
      transactions: transactionRows,
      invoices: invoiceRows,
      cashShifts: cashShiftRows,
      stockMovements: stockMovementRows,
      classBookings: classBookingRows,
      ptSessions: ptSessionRows,
      classes: gymClassRows,
      promos: promoRows,
      rewards: rewardRows,
      challenges: challengeRows,
      whatsappMessages: whatsappRows,
      membershipPackages: membershipPackageRows,
      ptPackages: ptPackageRows,
      paymentMethods: paymentMethodRows,
      messageTemplates: messageTemplateRows,
      branches: branchRows,
      auditLogs: auditLogRows,
    };

    window.localStorage.setItem(prototypeStorageKey, JSON.stringify(nextState));
  }, [
    auditLogRows,
    branchRows,
    cashShiftRows,
    challengeRows,
    checkInRows,
    classBookingRows,
    gymClassRows,
    inventoryRows,
    invoiceRows,
    isPersistedStateReady,
    memberAccessRows,
    memberRows,
    membershipPackageRows,
    messageTemplateRows,
    paymentMethodRows,
    promoRows,
    ptPackageRows,
    ptSessionRows,
    rewardRows,
    stockMovementRows,
    transactionRows,
    whatsappRows,
  ]);

  const addAuditLog = useCallback(
    (input: AuditLogInput) => {
      const nextLog: PrototypeAuditLog = {
        id: `AUD-${String(auditLogRows.length + 1).padStart(3, "0")}`,
        branchId: input.branchId,
        actor: input.actor.trim() || "System",
        action: input.action,
        target: input.target,
        time: `${prototypeToday} ${String(8 + (auditLogRows.length % 10)).padStart(2, "0")}:${String((auditLogRows.length * 7) % 60).padStart(2, "0")}`,
      };

      setAuditLogRows((currentRows) => [nextLog, ...currentRows]);
      return nextLog;
    },
    [auditLogRows.length],
  );

  const getAuditLogsForBranch = useCallback(
    (branchId: string) =>
      auditLogRows.filter((log) => log.branchId === branchId || branchId === "branch-pusat"),
    [auditLogRows],
  );

  const getMembersForBranch = useCallback(
    (branchId: string) =>
      memberRows
        .map((member) => {
          const access =
            memberAccessRows.find((item) => item.memberId === member.id) ?? {
              memberId: member.id,
              homeBranchId: branchId,
              allowedBranchIds: [branchId],
            };

          return {
            ...member,
            ...access,
            branchId: access.homeBranchId,
          };
        })
        .filter((member) => member.allowedBranchIds.includes(branchId)),
    [memberAccessRows, memberRows],
  );

  const getCheckInsForBranch = useCallback(
    (branchId: string) => checkInRows.filter((checkIn) => checkIn.branchId === branchId),
    [checkInRows],
  );

  const getInventoryForBranch = useCallback(
    (branchId: string) => inventoryRows.filter((item) => item.branchId === branchId),
    [inventoryRows],
  );

  const getTransactionsForBranch = useCallback(
    (branchId: string) => transactionRows.filter((transaction) => transaction.branchId === branchId),
    [transactionRows],
  );

  const getInvoicesForBranch = useCallback(
    (branchId: string) => invoiceRows.filter((invoice) => invoice.branchId === branchId),
    [invoiceRows],
  );

  const getCashShiftsForBranch = useCallback(
    (branchId: string) => cashShiftRows.filter((shift) => shift.branchId === branchId),
    [cashShiftRows],
  );

  const getClassBookingsForBranch = useCallback(
    (branchId: string) => classBookingRows.filter((booking) => booking.branchId === branchId),
    [classBookingRows],
  );

  const getClassesForBranch = useCallback(
    (branchId: string) => gymClassRows.filter((gymClass) => gymClass.branchId === branchId),
    [gymClassRows],
  );

  const getPtSessionsForBranch = useCallback(
    (branchId: string) => ptSessionRows.filter((session) => session.branchId === branchId),
    [ptSessionRows],
  );

  const getOperationalSnapshot = useCallback(
    (branchId: string): PrototypeSnapshot => {
      const scopedMembers = getMembersForBranch(branchId);
      const scopedCheckIns = getCheckInsForBranch(branchId);
      const scopedInventory = getInventoryForBranch(branchId);
      const scopedTransactions = getTransactionsForBranch(branchId);
      const scopedClasses = getClassesForBranch(branchId);
      const scopedClassBookings = getClassBookingsForBranch(branchId);
      const scopedPtSessions = getPtSessionsForBranch(branchId);
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
        classBookings: scopedClassBookings.filter((booking) => booking.status !== "cancelled").length,
        ptSessions: scopedPtSessions.length,
        waitlist: scopedClassBookings.filter((booking) => booking.status === "waitlist").length,
        rewardsStock: rewardRows.reduce((total, reward) => total + reward.stock, 0),
        openShift: cashShiftRows.find(
          (shift) => shift.branchId === branchId && shift.status === "open",
        ),
        scopedMembers,
        scopedCheckIns,
        scopedInventory,
        scopedTransactions,
        scopedClasses,
        scopedClassBookings,
        scopedPtSessions,
      };
    },
    [
      getCheckInsForBranch,
      getClassBookingsForBranch,
      getClassesForBranch,
      getInventoryForBranch,
      getMembersForBranch,
      getPtSessionsForBranch,
      getTransactionsForBranch,
      cashShiftRows,
      rewardRows,
    ],
  );

  const createMember = useCallback((input: MemberInput) => {
    const nextId = `M${String(memberRows.length + 1).padStart(3, "0")}`;
    const nextMember: PrototypeMember = {
      id: nextId,
      name: input.name.trim() || "Member Baru",
      email: input.email.trim() || `member${memberRows.length + 1}@email.com`,
      phone: input.phone.trim() || "+62 800 0000 0000",
      avatar: "/images/user/user-01.jpg",
      membershipType: input.membershipType,
      membershipStatus: input.membershipStatus,
      membershipStart: prototypeToday,
      membershipEnd: input.membershipEnd,
      points: 0,
      referralCode: createReferralCode(input.name, memberRows.length + 1),
      checkins: 0,
      lastCheckin: undefined,
      weight: input.weight,
      height: input.height,
      bmi: input.bmi,
      joinDate: prototypeToday,
    };

    setMemberRows((currentRows) => [nextMember, ...currentRows]);
    setMemberAccessRows((currentRows) => [
      { memberId: nextMember.id, homeBranchId: input.branchId, allowedBranchIds: [input.branchId] },
      ...currentRows,
    ]);
    return nextMember;
  }, [memberRows.length]);

  const updateMember = useCallback((memberId: string, input: UpdateMemberInput) => {
    setMemberRows((currentRows) =>
      currentRows.map((member) => (member.id === memberId ? { ...member, ...input } : member)),
    );
  }, []);

  const renewMember = useCallback((memberId: string) => {
    setMemberRows((currentRows) =>
      currentRows.map((member) =>
        member.id === memberId
          ? {
              ...member,
              membershipStatus: "active",
              membershipStart: prototypeToday,
              membershipEnd: addMonthsToIsoDate(
                member.membershipEnd > prototypeToday ? member.membershipEnd : prototypeToday,
                1,
              ),
              points: member.points + 50,
            }
          : member,
      ),
    );
  }, []);

  const toggleFreezeMember = useCallback((memberId: string) => {
    setMemberRows((currentRows) =>
      currentRows.map((member) =>
        member.id === memberId
          ? {
              ...member,
              membershipStatus: member.membershipStatus === "frozen" ? "active" : "frozen",
            }
          : member,
      ),
    );
  }, []);

  const scanCheckInMember = useCallback(
    (memberId: string, branchId: string): ScanResult => {
      const member = memberRows.find((item) => item.id === memberId);
      const branch = getBranchById(branchId);

      if (!member) {
        return { tone: "rose", message: "Member tidak ditemukan." };
      }

      const branchAccess = memberAccessRows.find((access) => access.memberId === member.id);
      const allowedBranchIds = branchAccess?.allowedBranchIds ?? [branchId];
      const isAlreadyInside = checkInRows.some(
        (checkIn) => checkIn.memberId === member.id && !checkIn.checkoutTime,
      );

      if (member.membershipStatus !== "active") {
        return {
          tone: "rose",
          message: `${member.name} tidak bisa check-in karena membership ${member.membershipStatus}.`,
        };
      }

      if (!allowedBranchIds.includes(branchId)) {
        return {
          tone: "rose",
          message: `${member.name} tidak punya akses ke ${branch.name}.`,
        };
      }

      if (isAlreadyInside) {
        return {
          tone: "amber",
          message: `${member.name} sudah terdaftar sedang gym.`,
        };
      }

      const nextIndex = checkInRows.length + 1;
      const nextTime = `${String(8 + (nextIndex % 10)).padStart(2, "0")}:${String((nextIndex * 7) % 60).padStart(2, "0")}`;
      const nextCheckIn: PrototypeCheckIn = {
        id: `CHK-${branch.code}-${String(nextIndex).padStart(3, "0")}`,
        memberId: member.id,
        memberName: member.name,
        memberAvatar: member.avatar,
        time: nextTime,
        date: prototypeToday,
        branchId,
        gate: "Front Gate",
        validation: "active",
      };

      setCheckInRows((currentRows) => [nextCheckIn, ...currentRows]);
      setMemberRows((currentRows) =>
        currentRows.map((item) =>
          item.id === member.id
            ? { ...item, checkins: item.checkins + 1, lastCheckin: prototypeToday }
            : item,
        ),
      );

      return {
        tone: "emerald",
        message: `${member.name} berhasil check-in di ${branch.name}.`,
      };
    },
    [checkInRows, memberAccessRows, memberRows],
  );

  const checkoutMember = useCallback((checkInId: string) => {
    setCheckInRows((currentRows) =>
      currentRows.map((checkIn) =>
        checkIn.id === checkInId
          ? { ...checkIn, checkoutTime: "21:00", validation: "completed" }
          : checkIn,
      ),
    );
  }, []);

  const createStockMovement = useCallback(
    (input: {
      branchId: string;
      productId: string;
      type: StockMovement["type"];
      qty: number;
      source: string;
      date: string;
    }) => {
      const product = inventoryRows.find(
        (item) => item.id === input.productId && item.branchId === input.branchId,
      );
      if (!product) return null;

      const qty = Math.max(1, input.qty);
      const prefix = input.type === "Masuk" ? "IN" : "OUT";
      const nextMovement: StockMovement = {
        id: `${prefix}-${String(stockMovementRows.length + 1).padStart(3, "0")}`,
        branchId: input.branchId,
        type: input.type,
        item: product.name,
        qty,
        source: input.source.trim() || (input.type === "Masuk" ? "Supplier" : "Adjustment"),
        date: input.date || prototypeToday,
        status: "posted",
      };

      setStockMovementRows((currentRows) => [nextMovement, ...currentRows]);
      setInventoryRows((currentRows) =>
        currentRows.map((item) =>
          item.id === product.id
            ? {
                ...item,
                stock: input.type === "Masuk" ? item.stock + qty : Math.max(0, item.stock - qty),
              }
            : item,
        ),
      );
      return nextMovement;
    },
    [inventoryRows, stockMovementRows.length],
  );

  const createInventoryItem = useCallback(
    (input: CreateInventoryItemInput) => {
      const branch = getBranchById(input.branchId);
      const sequence = inventoryRows.length + 1;
      const stock = Math.max(0, input.stock);
      const minStock = Math.max(0, input.minStock);
      const nextItem: PrototypeInventoryItem = {
        id: `${input.branchId}-new-${sequence}`,
        productId: `PNEW-${String(sequence).padStart(3, "0")}`,
        branchId: input.branchId,
        name: input.name.trim() || "Produk Baru",
        category: input.category.trim() || "general",
        price: Math.max(0, input.price),
        stock,
        minStock,
        sku:
          input.sku
            .replace(/[^a-zA-Z0-9-]/g, "")
            .slice(0, 24)
            .toUpperCase() || `${branch.code}-NEW-${String(sequence).padStart(3, "0")}`,
        image: "/images/product/product-01.jpg",
        reorderStatus: stock <= minStock ? "needs-restock" : "ok",
      };

      setInventoryRows((currentRows) => [nextItem, ...currentRows]);
      return nextItem;
    },
    [inventoryRows.length],
  );

  const updateInventoryItem = useCallback(
    (itemId: string, input: Partial<CreateInventoryItemInput>) => {
      setInventoryRows((currentRows) =>
        currentRows.map((item) => {
          if (item.id !== itemId) return item;

          const stock = typeof input.stock === "number" ? Math.max(0, input.stock) : item.stock;
          const minStock =
            typeof input.minStock === "number" ? Math.max(0, input.minStock) : item.minStock;

          return {
            ...item,
            name: input.name?.trim() || item.name,
            category: input.category?.trim() || item.category,
            price: typeof input.price === "number" ? Math.max(0, input.price) : item.price,
            stock,
            minStock,
            sku:
              input.sku
                ?.replace(/[^a-zA-Z0-9-]/g, "")
                .slice(0, 24)
                .toUpperCase() || item.sku,
            reorderStatus: stock <= minStock ? "needs-restock" : "ok",
          };
        }),
      );
    },
    [],
  );

  const deleteInventoryItem = useCallback((itemId: string) => {
    setInventoryRows((currentRows) => currentRows.filter((item) => item.id !== itemId));
  }, []);

  const createPosTransaction = useCallback(
    (input: CreatePosTransactionInput) => {
      if (input.items.length === 0) return null;

      const branch = getBranchById(input.branchId);
      const sequence = transactionRows.length + 1;
      const invoiceNo = `INV-${branch.code}-260528-${String(sequence).padStart(3, "0")}`;
      const description = [
        input.items.map((item) => `${item.name} x${item.qty}`).join(", "),
        input.promoCode ? `Promo ${input.promoCode}` : "",
      ]
        .filter(Boolean)
        .join(" / ");
      const type = input.items.some((item) => item.category === "membership")
        ? "membership"
        : input.items.some((item) => item.category === "pt")
        ? "pt-session"
        : "product";
      const transaction: PrototypeTransaction = {
        id: invoiceNo,
        branchId: input.branchId,
        cashierName: input.cashierName,
        type,
        memberName: input.memberName || "Walk-in Customer",
        description,
        amount: input.total,
        status: "completed",
        paymentMethod: input.paymentMethod,
        date: prototypeToday,
      };
      const invoice: PrototypeInvoice = {
        id: `QUEUE-${invoiceNo}`,
        branchId: input.branchId,
        invoiceNo,
        recipient: transaction.memberName,
        channel: input.paymentMethod === "cash" ? "email" : "whatsapp",
        status: "sent",
        generatedAt: `${prototypeToday} 12:${String(sequence).padStart(2, "0")}`,
      };

      setTransactionRows((currentRows) => [transaction, ...currentRows]);
      setInvoiceRows((currentRows) => [invoice, ...currentRows]);
      const cashAmount = input.cashAmount ?? (input.paymentMethod === "cash" ? input.total : 0);
      if (cashAmount > 0) {
        setCashShiftRows((currentRows) =>
          currentRows.map((shift) =>
            shift.branchId === input.branchId && shift.status === "open"
              ? { ...shift, expectedCash: shift.expectedCash + cashAmount }
              : shift,
          ),
        );
      }
      if (input.memberId && input.items.some((item) => item.category === "membership")) {
        setMemberRows((currentRows) =>
          currentRows.map((member) =>
            member.id === input.memberId
              ? {
                  ...member,
                  membershipStatus: "active",
                  membershipStart: prototypeToday,
                  membershipEnd: addMonthsToIsoDate(
                    member.membershipEnd > prototypeToday ? member.membershipEnd : prototypeToday,
                    1,
                  ),
                  points: member.points + 100,
                }
              : member,
          ),
        );
      }
      setInventoryRows((currentRows) =>
        currentRows.map((item) => {
          const cartItem = input.items.find(
            (posItem) => posItem.category === "product" && posItem.id === item.id,
          );
          return cartItem ? { ...item, stock: Math.max(0, item.stock - cartItem.qty) } : item;
        }),
      );
      if (input.promoId) {
        setPromoRows((currentRows) =>
          currentRows.map((promo) =>
            promo.id === input.promoId
              ? { ...promo, usageCount: Math.min(promo.maxUsage, promo.usageCount + 1) }
              : promo,
          ),
        );
      }
      addAuditLog({
        branchId: input.branchId,
        actor: input.cashierName,
        action: "pos.transaction.create",
        target: `${invoiceNo} / ${formatAuditAmount(input.total)}`,
      });

      return { transaction, invoice };
    },
    [addAuditLog, transactionRows.length],
  );

  const voidTransaction = useCallback((transactionId: string) => {
    const transaction = transactionRows.find((item) => item.id === transactionId);

    setTransactionRows((currentRows) =>
      currentRows.map((item) =>
        item.id === transactionId ? { ...item, status: "void" } : item,
      ),
    );
    setInvoiceRows((currentRows) =>
      currentRows.map((invoice) =>
        invoice.invoiceNo === transactionId ? { ...invoice, status: "failed" } : invoice,
      ),
    );
    if (transaction?.paymentMethod === "cash") {
      setCashShiftRows((currentRows) =>
        currentRows.map((shift) =>
          shift.branchId === transaction.branchId && shift.status === "open"
            ? { ...shift, expectedCash: Math.max(0, shift.expectedCash - transaction.amount) }
            : shift,
        ),
      );
    }
  }, [transactionRows]);

  const updateInvoiceStatus = useCallback((invoiceId: string, status: PrototypeInvoice["status"]) => {
    setInvoiceRows((currentRows) =>
      currentRows.map((invoice) =>
        invoice.id === invoiceId || invoice.invoiceNo === invoiceId ? { ...invoice, status } : invoice,
      ),
    );
  }, []);

  const closeCashShift = useCallback((shiftId: string, countedCash: number) => {
    setCashShiftRows((currentRows) =>
      currentRows.map((shift) =>
        shift.id === shiftId
          ? {
              ...shift,
              countedCash: Math.max(0, countedCash),
              closedAt: `${prototypeToday} 23:00`,
              status: Math.abs(Math.max(0, countedCash) - shift.expectedCash) > 10000 ? "review" : "closed",
            }
          : shift,
      ),
    );
  }, []);

  const reopenCashShift = useCallback((shiftId: string) => {
    setCashShiftRows((currentRows) =>
      currentRows.map((shift) =>
        shift.id === shiftId ? { ...shift, closedAt: "", countedCash: 0, status: "open" } : shift,
      ),
    );
  }, []);

  const createClassBooking = useCallback(
    (input: CreateClassBookingInput) => {
      const gymClass = gymClassRows.find(
        (item) => item.id === input.classId && item.branchId === input.branchId,
      );
      const member = memberRows.find((item) => item.id === input.memberId);
      if (!gymClass || !member) return null;

      const firstSchedule = gymClass.schedule[0];
      const activeBookings = classBookingRows.filter(
        (booking) =>
          booking.branchId === input.branchId &&
          booking.className === gymClass.name &&
          booking.date === input.date &&
          booking.status !== "cancelled",
      );
      const baseParticipants = Math.min(gymClass.currentParticipants, gymClass.maxParticipants);
      const confirmedExtra = activeBookings.filter(
        (booking) => booking.status === "confirmed" || booking.status === "attended",
      ).length;
      const occupied = baseParticipants + confirmedExtra;
      const status: PrototypeClassBooking["status"] =
        occupied >= gymClass.maxParticipants ? "waitlist" : "confirmed";
      const nextBooking: PrototypeClassBooking = {
        id: `BOOK-${String(classBookingRows.length + 1).padStart(3, "0")}`,
        branchId: input.branchId,
        classId: gymClass.id,
        className: gymClass.name,
        memberId: member.id,
        memberName: member.name,
        date: input.date || prototypeToday,
        time: firstSchedule?.time ?? "08:00",
        status,
        capacity:
          status === "waitlist"
            ? `${gymClass.maxParticipants}/${gymClass.maxParticipants}`
            : `${Math.min(occupied + 1, gymClass.maxParticipants)}/${gymClass.maxParticipants}`,
      };

      setClassBookingRows((currentRows) => [nextBooking, ...currentRows]);
      return nextBooking;
    },
    [classBookingRows, gymClassRows, memberRows],
  );

  const cancelClassBooking = useCallback((bookingId: string) => {
    setClassBookingRows((currentRows) =>
      currentRows.map((booking) =>
        booking.id === bookingId ? { ...booking, status: "cancelled" } : booking,
      ),
    );
  }, []);

  const promoteClassWaitlist = useCallback((bookingId: string) => {
    setClassBookingRows((currentRows) =>
      currentRows.map((booking) =>
        booking.id === bookingId ? { ...booking, status: "confirmed" } : booking,
      ),
    );
  }, []);

  const markClassAttendance = useCallback((bookingId: string) => {
    setClassBookingRows((currentRows) =>
      currentRows.map((booking) =>
        booking.id === bookingId ? { ...booking, status: "attended" } : booking,
      ),
    );
  }, []);

  const createGymClass = useCallback(
    (input: CreateGymClassInput) => {
      const nextClass: PrototypeGymClass = {
        id: `class-${gymClassRows.length + 1}`,
        branchId: input.branchId,
        name: input.name.trim() || "Kelas Baru",
        trainerId: input.trainerId,
        description: input.description.trim() || "Deskripsi kelas belum diisi.",
        category: input.category.trim() || "general",
        schedule: [
          {
            day: input.scheduleDay.trim() || "Senin",
            time: input.scheduleTime || "08:00",
          },
        ],
        currentParticipants: 0,
        maxParticipants: Math.max(1, input.maxParticipants),
        duration: Math.max(15, input.duration),
        status: input.status ?? "active",
        room: "Studio A",
      };

      setGymClassRows((currentRows) => [nextClass, ...currentRows]);
      return nextClass;
    },
    [gymClassRows.length],
  );

  const updateGymClass = useCallback((classId: string, input: Partial<CreateGymClassInput>) => {
    setGymClassRows((currentRows) =>
      currentRows.map((gymClass) =>
        gymClass.id === classId
          ? {
              ...gymClass,
              name: input.name?.trim() || gymClass.name,
              trainerId: input.trainerId || gymClass.trainerId,
              description: input.description?.trim() || gymClass.description,
              category: input.category?.trim() || gymClass.category,
              schedule:
                input.scheduleDay || input.scheduleTime
                  ? [
                      {
                        day: input.scheduleDay?.trim() || gymClass.schedule[0]?.day || "Senin",
                        time: input.scheduleTime || gymClass.schedule[0]?.time || "08:00",
                      },
                    ]
                  : gymClass.schedule,
              maxParticipants:
                typeof input.maxParticipants === "number"
                  ? Math.max(1, input.maxParticipants)
                  : gymClass.maxParticipants,
              duration:
                typeof input.duration === "number" ? Math.max(15, input.duration) : gymClass.duration,
              status: input.status ?? gymClass.status,
            }
          : gymClass,
      ),
    );
  }, []);

  const deleteGymClass = useCallback((classId: string) => {
    setGymClassRows((currentRows) => currentRows.filter((gymClass) => gymClass.id !== classId));
    setClassBookingRows((currentRows) =>
      currentRows.filter((booking) => booking.classId !== classId),
    );
  }, []);

  const createPtBooking = useCallback(
    (input: CreatePtBookingInput) => {
      const trainerSessionsAtTime = ptSessionRows.some(
        (session) =>
          session.trainerId === input.trainerId &&
          session.date === input.date &&
          session.time === input.time &&
          session.status === "scheduled",
      );
      const member = memberRows.find((item) => item.id === input.memberId);
      if (!member || trainerSessionsAtTime) return null;

      const nextSession: PrototypePTSession = {
        id: `session-${ptSessionRows.length + 1}`,
        branchId: input.branchId,
        trainerId: input.trainerId,
        memberId: member.id,
        memberName: member.name,
        date: input.date || prototypeToday,
        time: input.time || "09:00",
        duration: input.duration,
        status: "scheduled",
        focus: input.focus.trim() || "General Fitness",
        notes: "Booking dibuat dari prototype admin.",
      };

      setPtSessionRows((currentRows) => [nextSession, ...currentRows]);
      return nextSession;
    },
    [memberRows, ptSessionRows],
  );

  const updatePtSessionStatus = useCallback(
    (sessionId: string, status: PrototypePTSession["status"]) => {
      setPtSessionRows((currentRows) =>
        currentRows.map((session) => (session.id === sessionId ? { ...session, status } : session)),
      );
    },
    [],
  );

  const createPromo = useCallback(
    (input: CreatePromoInput) => {
      const nextPromo: PrototypePromo = {
        id: `PR${String(promoRows.length + 1).padStart(3, "0")}`,
        name: input.name.trim() || "Promo Baru",
        description: input.description.trim() || "Campaign promo Seven Gym.",
        discount: Math.max(0, input.discount),
        type: input.type,
        validUntil: input.validUntil || prototypeToday,
        code:
          input.code
            .replace(/[^a-zA-Z0-9]/g, "")
            .slice(0, 14)
            .toUpperCase() || `PROMO${promoRows.length + 1}`,
        usageCount: 0,
        maxUsage: Math.max(1, input.maxUsage),
        status: input.status ?? "upcoming",
      };

      setPromoRows((currentRows) => [nextPromo, ...currentRows]);
      return nextPromo;
    },
    [promoRows.length],
  );

  const updatePromo = useCallback((promoId: string, input: Partial<CreatePromoInput>) => {
    setPromoRows((currentRows) =>
      currentRows.map((promo) =>
        promo.id === promoId
          ? {
              ...promo,
              name: input.name?.trim() || promo.name,
              description: input.description?.trim() || promo.description,
              discount:
                typeof input.discount === "number" ? Math.max(0, input.discount) : promo.discount,
              type: input.type ?? promo.type,
              validUntil: input.validUntil || promo.validUntil,
              code:
                input.code
                  ?.replace(/[^a-zA-Z0-9]/g, "")
                  .slice(0, 14)
                  .toUpperCase() || promo.code,
              maxUsage:
                typeof input.maxUsage === "number" ? Math.max(1, input.maxUsage) : promo.maxUsage,
              status: input.status ?? promo.status,
            }
          : promo,
      ),
    );
  }, []);

  const togglePromoStatus = useCallback((promoId: string) => {
    setPromoRows((currentRows) =>
      currentRows.map((promo) =>
        promo.id === promoId
          ? { ...promo, status: promo.status === "active" ? "expired" : "active" }
          : promo,
      ),
    );
  }, []);

  const redeemReward = useCallback(
    (memberId: string, rewardId: string): ScanResult => {
      const member = memberRows.find((item) => item.id === memberId);
      const reward = rewardRows.find((item) => item.id === rewardId);

      if (!member || !reward) {
        return { tone: "rose", message: "Member atau reward tidak ditemukan." };
      }

      if (reward.stock <= 0) {
        return { tone: "amber", message: `${reward.name} sedang habis stok.` };
      }

      if (member.points < reward.points) {
        return {
          tone: "rose",
          message: `${member.name} butuh ${reward.points.toLocaleString("id-ID")} pts untuk ${reward.name}.`,
        };
      }

      setRewardRows((currentRows) =>
        currentRows.map((item) =>
          item.id === reward.id ? { ...item, stock: Math.max(0, item.stock - 1) } : item,
        ),
      );
      setMemberRows((currentRows) =>
        currentRows.map((item) =>
          item.id === member.id ? { ...item, points: item.points - reward.points } : item,
        ),
      );

      return {
        tone: "emerald",
        message: `${reward.name} berhasil ditukar oleh ${member.name}.`,
      };
    },
    [memberRows, rewardRows],
  );

  const createReward = useCallback(
    (input: CreateRewardInput) => {
      const nextReward: PrototypeReward = {
        id: `R${String(rewardRows.length + 1).padStart(3, "0")}`,
        name: input.name.trim() || "Reward Baru",
        points: Math.max(1, input.points),
        stock: Math.max(0, input.stock),
      };

      setRewardRows((currentRows) => [nextReward, ...currentRows]);
      return nextReward;
    },
    [rewardRows.length],
  );

  const updateReward = useCallback((rewardId: string, input: Partial<CreateRewardInput>) => {
    setRewardRows((currentRows) =>
      currentRows.map((reward) =>
        reward.id === rewardId
          ? {
              ...reward,
              name: input.name?.trim() || reward.name,
              points: typeof input.points === "number" ? Math.max(1, input.points) : reward.points,
              stock: typeof input.stock === "number" ? Math.max(0, input.stock) : reward.stock,
            }
          : reward,
      ),
    );
  }, []);

  const deleteReward = useCallback((rewardId: string) => {
    setRewardRows((currentRows) => currentRows.filter((reward) => reward.id !== rewardId));
  }, []);

  const boostChallenge = useCallback((challengeId: string) => {
    setChallengeRows((currentRows) =>
      currentRows.map((challenge) =>
        challenge.id === challengeId
          ? { ...challenge, participants: challenge.participants + 1 }
          : challenge,
      ),
    );
  }, []);

  const createChallenge = useCallback(
    (input: CreateChallengeInput) => {
      const nextChallenge: PrototypeChallenge = {
        id: `CH${String(challengeRows.length + 1).padStart(3, "0")}`,
        name: input.name.trim() || "Challenge Baru",
        description: input.description.trim() || "Deskripsi challenge belum diisi.",
        target: Math.max(1, input.target),
        reward: Math.max(1, input.reward),
        participants: 0,
        endDate: input.endDate || prototypeToday,
      };

      setChallengeRows((currentRows) => [nextChallenge, ...currentRows]);
      return nextChallenge;
    },
    [challengeRows.length],
  );

  const updateChallenge = useCallback(
    (challengeId: string, input: Partial<CreateChallengeInput>) => {
      setChallengeRows((currentRows) =>
        currentRows.map((challenge) =>
          challenge.id === challengeId
            ? {
                ...challenge,
                name: input.name?.trim() || challenge.name,
                description: input.description?.trim() || challenge.description,
                target: typeof input.target === "number" ? Math.max(1, input.target) : challenge.target,
                reward: typeof input.reward === "number" ? Math.max(1, input.reward) : challenge.reward,
                endDate: input.endDate || challenge.endDate,
              }
            : challenge,
        ),
      );
    },
    [],
  );

  const deleteChallenge = useCallback((challengeId: string) => {
    setChallengeRows((currentRows) =>
      currentRows.filter((challenge) => challenge.id !== challengeId),
    );
  }, []);

  const createWhatsappBroadcast = useCallback(
    (input: CreateWhatsappBroadcastInput) => {
      const nextMessage: PrototypeWhatsappMessage = {
        id: `WA-${String(whatsappRows.length + 1).padStart(3, "0")}`,
        branchId: input.branchId,
        template: input.template.trim() || "manual_broadcast",
        recipient: input.recipient.trim() || "Segment Promo",
        status: "queued",
        scheduledAt: input.scheduledAt || `${prototypeToday} 15:00`,
      };

      setWhatsappRows((currentRows) => [nextMessage, ...currentRows]);
      return nextMessage;
    },
    [whatsappRows.length],
  );

  const updateWhatsappStatus = useCallback(
    (messageId: string, status: PrototypeWhatsappMessage["status"]) => {
      setWhatsappRows((currentRows) =>
        currentRows.map((message) =>
          message.id === messageId ? { ...message, status } : message,
        ),
      );
    },
    [],
  );

  const createMembershipPackage = useCallback(
    (input: CreateMembershipPackageInput) => {
      const nextPackage: PrototypeMembershipPackage = {
        id: `MP${String(membershipPackageRows.length + 1).padStart(3, "0")}`,
        name: input.name.trim() || "Paket Membership Baru",
        price: Math.max(0, input.price),
        duration: Math.max(1, input.duration),
        status: "active",
      };

      setMembershipPackageRows((currentRows) => [nextPackage, ...currentRows]);
      return nextPackage;
    },
    [membershipPackageRows.length],
  );

  const updateMembershipPackage = useCallback(
    (packageId: string, input: Partial<CreateMembershipPackageInput>) => {
      setMembershipPackageRows((currentRows) =>
        currentRows.map((membershipPackage) =>
          membershipPackage.id === packageId
            ? {
                ...membershipPackage,
                name: input.name?.trim() || membershipPackage.name,
                duration:
                  typeof input.duration === "number"
                    ? Math.max(1, input.duration)
                    : membershipPackage.duration,
                price:
                  typeof input.price === "number"
                    ? Math.max(0, input.price)
                    : membershipPackage.price,
              }
            : membershipPackage,
        ),
      );
    },
    [],
  );

  const toggleMembershipPackageStatus = useCallback((packageId: string) => {
    setMembershipPackageRows((currentRows) =>
      currentRows.map((membershipPackage) =>
        membershipPackage.id === packageId
          ? {
              ...membershipPackage,
              status: membershipPackage.status === "active" ? "inactive" : "active",
            }
          : membershipPackage,
      ),
    );
  }, []);

  const deleteMembershipPackage = useCallback((packageId: string) => {
    setMembershipPackageRows((currentRows) =>
      currentRows.filter((membershipPackage) => membershipPackage.id !== packageId),
    );
  }, []);

  const createPtPackage = useCallback(
    (input: CreatePtPackageInput) => {
      const nextPackage: PrototypePtPackage = {
        id: `PT${String(ptPackageRows.length + 1).padStart(3, "0")}`,
        name: input.name.trim() || "Paket PT Baru",
        price: Math.max(0, input.price),
        sessions: Math.max(1, input.sessions),
        status: "active",
      };

      setPtPackageRows((currentRows) => [nextPackage, ...currentRows]);
      return nextPackage;
    },
    [ptPackageRows.length],
  );

  const updatePtPackage = useCallback((packageId: string, input: Partial<CreatePtPackageInput>) => {
    setPtPackageRows((currentRows) =>
      currentRows.map((ptPackage) =>
        ptPackage.id === packageId
          ? {
              ...ptPackage,
              name: input.name?.trim() || ptPackage.name,
              sessions:
                typeof input.sessions === "number" ? Math.max(1, input.sessions) : ptPackage.sessions,
              price: typeof input.price === "number" ? Math.max(0, input.price) : ptPackage.price,
            }
          : ptPackage,
      ),
    );
  }, []);

  const togglePtPackageStatus = useCallback((packageId: string) => {
    setPtPackageRows((currentRows) =>
      currentRows.map((ptPackage) =>
        ptPackage.id === packageId
          ? { ...ptPackage, status: ptPackage.status === "active" ? "inactive" : "active" }
          : ptPackage,
      ),
    );
  }, []);

  const deletePtPackage = useCallback((packageId: string) => {
    setPtPackageRows((currentRows) => currentRows.filter((ptPackage) => ptPackage.id !== packageId));
  }, []);

  const createPaymentMethod = useCallback(
    (input: CreatePaymentConfigInput) => {
      const nextMethod: PrototypePaymentConfig = {
        id: `PAY-${String(paymentMethodRows.length + 1).padStart(3, "0")}`,
        name: input.name.trim() || "Metode Baru",
        settlement: input.settlement.trim() || "Manual",
        fee: input.fee.trim() || "0%",
        status: "active",
      };

      setPaymentMethodRows((currentRows) => [nextMethod, ...currentRows]);
      return nextMethod;
    },
    [paymentMethodRows.length],
  );

  const updatePaymentMethod = useCallback(
    (methodId: string, input: Partial<CreatePaymentConfigInput>) => {
      setPaymentMethodRows((currentRows) =>
        currentRows.map((method) =>
          method.id === methodId
            ? {
                ...method,
                name: input.name?.trim() || method.name,
                settlement: input.settlement?.trim() || method.settlement,
                fee: input.fee?.trim() || method.fee,
              }
            : method,
        ),
      );
    },
    [],
  );

  const togglePaymentMethodStatus = useCallback((methodId: string) => {
    setPaymentMethodRows((currentRows) =>
      currentRows.map((method) =>
        method.id === methodId
          ? { ...method, status: method.status === "active" ? "inactive" : "active" }
          : method,
      ),
    );
  }, []);

  const deletePaymentMethod = useCallback((methodId: string) => {
    setPaymentMethodRows((currentRows) => currentRows.filter((method) => method.id !== methodId));
  }, []);

  const createMessageTemplate = useCallback(
    (input: CreateMessageTemplateInput) => {
      const nextTemplate: PrototypeMessageTemplate = {
        id: `TPL-${String(messageTemplateRows.length + 1).padStart(3, "0")}`,
        name: input.name.trim() || "Template Baru",
        trigger: input.trigger.trim() || "manual_trigger",
        audience: input.audience.trim() || "Member",
        channel: input.channel,
        status: "active",
      };

      setMessageTemplateRows((currentRows) => [nextTemplate, ...currentRows]);
      return nextTemplate;
    },
    [messageTemplateRows.length],
  );

  const updateMessageTemplate = useCallback(
    (templateId: string, input: Partial<CreateMessageTemplateInput>) => {
      setMessageTemplateRows((currentRows) =>
        currentRows.map((template) =>
          template.id === templateId
            ? {
                ...template,
                name: input.name?.trim() || template.name,
                trigger: input.trigger?.trim() || template.trigger,
                audience: input.audience?.trim() || template.audience,
                channel: input.channel ?? template.channel,
              }
            : template,
        ),
      );
    },
    [],
  );

  const toggleMessageTemplateStatus = useCallback((templateId: string) => {
    setMessageTemplateRows((currentRows) =>
      currentRows.map((template) =>
        template.id === templateId
          ? { ...template, status: template.status === "active" ? "inactive" : "active" }
          : template,
      ),
    );
  }, []);

  const deleteMessageTemplate = useCallback((templateId: string) => {
    setMessageTemplateRows((currentRows) =>
      currentRows.filter((template) => template.id !== templateId),
    );
  }, []);

  const createBranch = useCallback(
    (input: CreateBranchInput) => {
      const cleanCode =
        input.code
          .replace(/[^a-zA-Z0-9]/g, "")
          .slice(0, 4)
          .toUpperCase() || `B${branchRows.length + 1}`;
      const nextBranch: PrototypeBranch = {
        id: `branch-${cleanCode.toLowerCase()}-${branchRows.length + 1}`,
        name: input.name.trim() || "Seven Gym Cabang Baru",
        code: cleanCode,
        city: input.city.trim() || "Kota Baru",
        address: input.address.trim() || "Alamat belum diisi",
        status: "active",
      };

      setBranchRows((currentRows) => [nextBranch, ...currentRows]);
      return nextBranch;
    },
    [branchRows.length],
  );

  const updateBranch = useCallback((branchId: string, input: Partial<CreateBranchInput>) => {
    setBranchRows((currentRows) =>
      currentRows.map((branch) =>
        branch.id === branchId
          ? {
              ...branch,
              name: input.name?.trim() || branch.name,
              code:
                input.code
                  ?.replace(/[^a-zA-Z0-9]/g, "")
                  .slice(0, 4)
                  .toUpperCase() || branch.code,
              city: input.city?.trim() || branch.city,
              address: input.address?.trim() || branch.address,
            }
          : branch,
      ),
    );
  }, []);

  const toggleBranchStatus = useCallback((branchId: string) => {
    setBranchRows((currentRows) =>
      currentRows.map((branch) =>
        branch.id === branchId
          ? { ...branch, status: branch.status === "active" ? "maintenance" : "active" }
          : branch,
      ),
    );
  }, []);

  const deleteBranch = useCallback((branchId: string) => {
    setBranchRows((currentRows) => currentRows.filter((branch) => branch.id !== branchId));
  }, []);

  const value = useMemo(
    () => ({
      prototypeToday,
      members: memberRows,
      checkIns: checkInRows,
      inventory: inventoryRows,
      transactions: transactionRows,
      invoices: invoiceRows,
      cashShifts: cashShiftRows,
      stockMovements: stockMovementRows,
      classBookings: classBookingRows,
      ptSessions: ptSessionRows,
      classes: gymClassRows,
      promos: promoRows,
      rewards: rewardRows,
      challenges: challengeRows,
      whatsappMessages: whatsappRows,
      membershipPackageSettings: membershipPackageRows,
      ptPackageSettings: ptPackageRows,
      paymentMethodSettings: paymentMethodRows,
      messageTemplateSettings: messageTemplateRows,
      branchSettings: branchRows,
      auditLogs: auditLogRows,
      getMembersForBranch,
      getCheckInsForBranch,
      getInventoryForBranch,
      getTransactionsForBranch,
      getInvoicesForBranch,
      getCashShiftsForBranch,
      getClassBookingsForBranch,
      getClassesForBranch,
      getPtSessionsForBranch,
      getOperationalSnapshot,
      createMember,
      updateMember,
      renewMember,
      toggleFreezeMember,
      scanCheckInMember,
      checkoutMember,
      createStockMovement,
      createPosTransaction,
      voidTransaction,
      updateInvoiceStatus,
      closeCashShift,
      reopenCashShift,
      createClassBooking,
      cancelClassBooking,
      promoteClassWaitlist,
      markClassAttendance,
      createGymClass,
      updateGymClass,
      deleteGymClass,
      createPtBooking,
      updatePtSessionStatus,
      createInventoryItem,
      updateInventoryItem,
      deleteInventoryItem,
      createPromo,
      updatePromo,
      togglePromoStatus,
      redeemReward,
      createReward,
      updateReward,
      deleteReward,
      boostChallenge,
      createChallenge,
      updateChallenge,
      deleteChallenge,
      createWhatsappBroadcast,
      updateWhatsappStatus,
      createMembershipPackage,
      updateMembershipPackage,
      toggleMembershipPackageStatus,
      deleteMembershipPackage,
      createPtPackage,
      updatePtPackage,
      togglePtPackageStatus,
      deletePtPackage,
      createPaymentMethod,
      updatePaymentMethod,
      togglePaymentMethodStatus,
      deletePaymentMethod,
      createMessageTemplate,
      updateMessageTemplate,
      toggleMessageTemplateStatus,
      deleteMessageTemplate,
      createBranch,
      updateBranch,
      toggleBranchStatus,
      deleteBranch,
      addAuditLog,
      getAuditLogsForBranch,
    }),
    [
      addAuditLog,
      auditLogRows,
      boostChallenge,
      cancelClassBooking,
      cashShiftRows,
      challengeRows,
      checkInRows,
      checkoutMember,
      closeCashShift,
      classBookingRows,
      branchRows,
      createBranch,
      createChallenge,
      createClassBooking,
      createGymClass,
      createInventoryItem,
      createMember,
      createMembershipPackage,
      createMessageTemplate,
      createPaymentMethod,
      createPosTransaction,
      createPromo,
      createPtBooking,
      createPtPackage,
      createReward,
      createStockMovement,
      createWhatsappBroadcast,
      deleteBranch,
      deleteChallenge,
      deleteGymClass,
      deleteInventoryItem,
      deleteMembershipPackage,
      deleteMessageTemplate,
      deletePaymentMethod,
      deletePtPackage,
      deleteReward,
      getCheckInsForBranch,
      getCashShiftsForBranch,
      getClassBookingsForBranch,
      getClassesForBranch,
      getAuditLogsForBranch,
      getInventoryForBranch,
      getInvoicesForBranch,
      getMembersForBranch,
      getOperationalSnapshot,
      getPtSessionsForBranch,
      getTransactionsForBranch,
      gymClassRows,
      inventoryRows,
      invoiceRows,
      markClassAttendance,
      membershipPackageRows,
      memberRows,
      messageTemplateRows,
      paymentMethodRows,
      promoteClassWaitlist,
      promoRows,
      ptSessionRows,
      ptPackageRows,
      redeemReward,
      renewMember,
      rewardRows,
      reopenCashShift,
      scanCheckInMember,
      stockMovementRows,
      toggleBranchStatus,
      toggleFreezeMember,
      toggleMembershipPackageStatus,
      toggleMessageTemplateStatus,
      togglePaymentMethodStatus,
      togglePromoStatus,
      togglePtPackageStatus,
      transactionRows,
      updateBranch,
      updateChallenge,
      updateGymClass,
      updateInventoryItem,
      updateInvoiceStatus,
      updateMember,
      updateMembershipPackage,
      updateMessageTemplate,
      updatePaymentMethod,
      updatePromo,
      updatePtPackage,
      updatePtSessionStatus,
      updateReward,
      updateWhatsappStatus,
      voidTransaction,
      whatsappRows,
    ],
  );

  return (
    <PrototypeDataContext.Provider value={value}>
      {children}
    </PrototypeDataContext.Provider>
  );
};
