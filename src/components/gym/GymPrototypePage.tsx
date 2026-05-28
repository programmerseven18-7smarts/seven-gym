"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { mockLoginUsers, permissionsByRole, roleLabels, useRole, type UserRole } from "@/context/RoleContext";
import {
  usePrototypeData,
  type PrototypeCashShift,
  type PrototypeGymClass,
  type PrototypeInvoice,
  type PrototypeInventoryItem,
  type PrototypePTSession,
  type PrototypeTransaction,
  type StockMovement,
} from "@/context/PrototypeDataContext";
import {
  members,
  mockTrainers,
  rewards,
} from "@/data/mockData";
import {
  apiContracts,
  businessRules,
  classBookingQueue,
  equipmentInspections,
  memberBranchAccess,
  permissionMatrix,
} from "@/data/operationalData";
import { Modal } from "@/components/ui/modal";
import { findNavItemByPath } from "@/layout/gymNavigationConfig";
import {
  CashRegisterIcon,
  ClassIcon,
  ClockIcon,
  CreditCardIcon,
  DumbbellIcon,
  GiftIcon,
  InventoryIcon,
  MemberIcon,
  PackageIcon,
  PromoIcon,
  QrCodeIcon,
  ReportIcon,
  SettingsIcon,
  ShieldIcon,
  TargetIcon,
  TrainerIcon,
  TrendingUpIcon,
  WhatsAppIcon,
} from "@/icons/gym-icons";

type GymPrototypePageProps = {
  slug: string[];
};

type StatCardProps = {
  label: string;
  value: string;
  helper: string;
  icon: React.ReactNode;
  tone?: "emerald" | "sky" | "amber" | "rose" | "slate";
};

const toneClass = {
  emerald: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  sky: "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400",
  amber: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  rose: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
  slate: "bg-slate-50 text-slate-700 dark:bg-slate-500/10 dark:text-slate-300",
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);

const toTitle = (text: string) =>
  text
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const downloadTextFile = (filename: string, content: string) => {
  if (typeof window === "undefined") return;

  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
};

const downloadJsonFile = (filename: string, data: unknown) => {
  downloadTextFile(filename, JSON.stringify(data, null, 2));
};

const StatCard = ({
  label,
  value,
  helper,
  icon,
  tone = "emerald",
}: StatCardProps) => (
  <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
          {value}
        </p>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{helper}</p>
      </div>
      <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${toneClass[tone]}`}>
        {icon}
      </div>
    </div>
  </div>
);

const StatusPill = ({
  children,
  tone = "emerald",
}: {
  children: React.ReactNode;
  tone?: StatCardProps["tone"];
}) => (
  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${toneClass[tone]}`}>
    {children}
  </span>
);

const ProgressBar = ({ value, tone = "emerald" }: { value: number; tone?: string }) => (
  <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800">
    <div
      className={`h-2 rounded-full ${
        tone === "amber" ? "bg-amber-500" : tone === "sky" ? "bg-sky-500" : "bg-emerald-500"
      }`}
      style={{ width: `${Math.min(value, 100)}%` }}
    />
  </div>
);

const SectionPanel = ({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) => (
  <section className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
    <div className="mb-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
    </div>
    {children}
  </section>
);

type DataTableColumn<T> = {
  header: string;
  cell: (row: T, index: number) => React.ReactNode;
  className?: string;
};

const DataTable = <T,>({
  columns,
  data,
  getKey,
}: {
  columns: DataTableColumn<T>[];
  data: T[];
  getKey: (row: T, index: number) => string;
}) => (
  <div>
    <div className="hidden overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800 md:block">
      <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
        <thead className="bg-gray-50 dark:bg-gray-800/70">
          <tr>
            {columns.map((column) => (
              <th
                key={column.header}
                className={`whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 ${column.className ?? ""}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white dark:divide-gray-800 dark:bg-transparent">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                Data tidak ditemukan.
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr key={getKey(row, index)} className="transition hover:bg-gray-50 dark:hover:bg-white/[0.03]">
                {columns.map((column) => (
                  <td
                    key={`${getKey(row, index)}-${column.header}`}
                    className={`whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300 ${column.className ?? ""}`}
                  >
                    {column.cell(row, index)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
      </div>
    </div>

    <div className="space-y-3 md:hidden">
      {data.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800/60 dark:text-gray-400">
          Data tidak ditemukan.
        </div>
      ) : (
        data.map((row, index) => {
          const rowKey = getKey(row, index);
          const [primaryColumn, ...detailColumns] = columns;

          return (
            <div key={rowKey} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
              {primaryColumn && (
                <div className="border-b border-gray-100 pb-3 dark:border-gray-800">
                  <p className="text-xs font-semibold uppercase text-gray-400">{primaryColumn.header}</p>
                  <div className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                    {primaryColumn.cell(row, index)}
                  </div>
                </div>
              )}
              <div className="mt-3 space-y-2">
                {detailColumns.map((column) => (
                  <div key={`${rowKey}-${column.header}`} className="grid grid-cols-[112px_minmax(0,1fr)] gap-3 text-sm">
                    <span className="text-xs font-medium uppercase text-gray-400">{column.header}</span>
                    <div className="min-w-0 text-gray-700 dark:text-gray-300">{column.cell(row, index)}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  </div>
);

type InlineIconProps = { className?: string };

const PencilIcon = ({ className = "h-4 w-4" }: InlineIconProps) => (
  <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path
      d="M11.58 4.17L15.83 8.42M3.75 16.25L7.09 15.58C7.27 15.54 7.44 15.45 7.57 15.32L16.25 6.64C16.9 5.99 16.9 4.93 16.25 4.28L15.72 3.75C15.07 3.1 14.01 3.1 13.36 3.75L4.68 12.43C4.55 12.56 4.46 12.73 4.42 12.91L3.75 16.25Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const TrashIcon = ({ className = "h-4 w-4" }: InlineIconProps) => (
  <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path
      d="M3.33 5H16.67M8.33 8.33V13.33M11.67 8.33V13.33M4.17 5L5 16.67C5.05 17.15 5.42 17.5 5.9 17.5H14.1C14.58 17.5 14.95 17.15 15 16.67L15.83 5M7.5 5V3.75C7.5 3.06 8.06 2.5 8.75 2.5H11.25C11.94 2.5 12.5 3.06 12.5 3.75V5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PlusIcon = ({ className = "h-4 w-4" }: InlineIconProps) => (
  <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M10 4.17V15.83M4.17 10H15.83" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
);

const EyeIcon = ({ className = "h-4 w-4" }: InlineIconProps) => (
  <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path
      d="M2.5 10C4.08 6.67 6.58 5 10 5C13.42 5 15.92 6.67 17.5 10C15.92 13.33 13.42 15 10 15C6.58 15 4.08 13.33 2.5 10Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10 12.5C11.38 12.5 12.5 11.38 12.5 10C12.5 8.62 11.38 7.5 10 7.5C8.62 7.5 7.5 8.62 7.5 10C7.5 11.38 8.62 12.5 10 12.5Z"
      stroke="currentColor"
      strokeWidth="1.5"
    />
  </svg>
);

const PowerIcon = ({ className = "h-4 w-4" }: InlineIconProps) => (
  <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path
      d="M10 2.5V9.17M5.29 5.29C3.95 6.52 3.33 8.06 3.33 10C3.33 13.68 6.32 16.67 10 16.67C13.68 16.67 16.67 13.68 16.67 10C16.67 8.06 16.05 6.52 14.71 5.29"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CheckSmallIcon = ({ className = "h-4 w-4" }: InlineIconProps) => (
  <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M16.25 5.83L8.33 13.75L3.75 9.17" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const XSmallIcon = ({ className = "h-4 w-4" }: InlineIconProps) => (
  <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
);

const RefreshIcon = ({ className = "h-4 w-4" }: InlineIconProps) => (
  <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path
      d="M15.83 7.5C14.97 5.53 13.01 4.17 10.75 4.17C7.93 4.17 5.58 6.27 5.21 9M4.17 5.83V9H7.33M4.17 12.5C5.03 14.47 6.99 15.83 9.25 15.83C12.07 15.83 14.42 13.73 14.79 11M15.83 14.17V11H12.67"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SendIcon = ({ className = "h-4 w-4" }: InlineIconProps) => (
  <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path
      d="M17.5 2.5L9.17 10.83M17.5 2.5L12.2 17.5L9.17 10.83L2.5 7.8L17.5 2.5Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

type TableActionIconButtonProps = {
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "edit" | "delete" | "neutral" | "success" | "warning" | "info";
};

const tableActionIconClass: Record<NonNullable<TableActionIconButtonProps["variant"]>, string> = {
  edit: "border-gray-200 text-gray-500 hover:border-emerald-300 hover:text-emerald-600 dark:border-gray-700 dark:text-gray-400",
  delete: "border-gray-200 text-gray-500 hover:border-rose-300 hover:text-rose-600 dark:border-gray-700 dark:text-gray-400",
  neutral: "border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:border-gray-700 dark:text-gray-400 dark:hover:text-gray-200",
  success: "border-gray-200 text-gray-500 hover:border-emerald-300 hover:text-emerald-600 dark:border-gray-700 dark:text-gray-400",
  warning: "border-gray-200 text-gray-500 hover:border-amber-300 hover:text-amber-600 dark:border-gray-700 dark:text-gray-400",
  info: "border-gray-200 text-gray-500 hover:border-sky-300 hover:text-sky-600 dark:border-gray-700 dark:text-gray-400",
};

const TableActionIconButton = ({
  label,
  icon,
  onClick,
  disabled = false,
  variant = "neutral",
}: TableActionIconButtonProps) => (
  <button
    type="button"
    title={label}
    aria-label={label}
    onClick={onClick}
    disabled={disabled}
    className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border transition disabled:cursor-not-allowed disabled:opacity-60 ${tableActionIconClass[variant]}`}
  >
    {icon}
  </button>
);

const PrimaryToolbarButton = ({
  children,
  onClick,
  disabled = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
  >
    <PlusIcon />
    <span>{children}</span>
  </button>
);

type MemberRow = (typeof members)[number];
type TrainerRow = (typeof mockTrainers)[number];
type MemberStatusFilter = "all" | MemberRow["membershipStatus"];
type MemberFormState = {
  name: string;
  email: string;
  phone: string;
  membershipType: MemberRow["membershipType"];
  membershipStatus: MemberRow["membershipStatus"];
  membershipEnd: string;
  weight: string;
  height: string;
};

type StockMovementFormState = {
  productId: string;
  source: string;
  qty: string;
  date: string;
  note: string;
};

type ClassBookingFormState = {
  classId: string;
  memberId: string;
  date: string;
};

type PtBookingFormState = {
  trainerId: string;
  memberId: string;
  date: string;
  time: string;
  duration: string;
  focus: string;
};

type TrainerFormState = {
  name: string;
  email: string;
  phone: string;
  specializations: string;
  hourlyRate: string;
  status: TrainerRow["status"];
};

type GymClassFormState = {
  name: string;
  trainerId: string;
  description: string;
  category: string;
  scheduleDay: string;
  scheduleTime: string;
  duration: string;
  maxParticipants: string;
  status: PrototypeGymClass["status"];
};

type ProductFormState = {
  name: string;
  category: string;
  price: string;
  stock: string;
  minStock: string;
  sku: string;
};

type SupplierRow = {
  id: string;
  name: string;
  category: string;
  sla: string;
  status: "aktif" | "maintenance" | "nonaktif";
};

type SupplierFormState = {
  name: string;
  category: string;
  sla: string;
  status: SupplierRow["status"];
};

type EquipmentRow = (typeof equipmentInspections)[number];

type EquipmentFormState = {
  equipmentName: string;
  location: string;
  status: EquipmentRow["status"];
  nextCheck: string;
};

type RewardFormState = {
  name: string;
  points: string;
  stock: string;
};

type ChallengeFormState = {
  name: string;
  description: string;
  target: string;
  reward: string;
  endDate: string;
};

type StaffUserRow = (typeof mockLoginUsers)[number] & {
  status: "active" | "inactive";
};

type StaffUserFormState = {
  name: string;
  email: string;
  role: UserRole;
  branchAccess: string;
  status: StaffUserRow["status"];
};

type RoleRow = {
  id: AccessRoleKey;
  name: string;
  users: number;
  scope: string;
  color: StatCardProps["tone"];
};

type RoleFormState = {
  id: AccessRoleKey;
  name: string;
  users: string;
  scope: string;
  color: StatCardProps["tone"];
};

type PromoFormState = {
  name: string;
  code: string;
  description: string;
  discount: string;
  type: "percentage" | "fixed";
  maxUsage: string;
  validUntil: string;
};

type RewardRedemptionFormState = {
  memberId: string;
  rewardId: string;
};

type BroadcastFormState = {
  template: string;
  recipient: string;
  scheduledAt: string;
};

type MembershipPackageFormState = {
  name: string;
  duration: string;
  price: string;
};

type PtPackageFormState = {
  name: string;
  sessions: string;
  price: string;
};

type PaymentMethodFormState = {
  name: string;
  settlement: string;
  fee: string;
};

type MessageTemplateFormState = {
  name: string;
  trigger: string;
  audience: string;
  channel: "WhatsApp" | "Email" | "Email + WhatsApp" | "Push + WhatsApp";
};

type BranchFormState = {
  name: string;
  code: string;
  city: string;
  address: string;
};

type CloseShiftFormState = {
  shiftId: string;
  countedCash: string;
};

type DetailRow = {
  label: string;
  value: React.ReactNode;
};

type DetailModalState = {
  title: string;
  subtitle?: string;
  rows: DetailRow[];
  tone?: StatCardProps["tone"];
} | null;

type SeedModalState = {
  mode: "export" | "import";
} | null;

type PermissionMatrixRow = (typeof permissionMatrix)[number];
type AccessRoleKey = UserRole;
type SettingsModalType =
  | "branch"
  | "membership"
  | "pt"
  | "payment"
  | "template"
  | "promo";
type SettingsModalState = {
  type: SettingsModalType;
  mode: "create" | "edit";
  id?: string;
} | null;
type ActionModalType =
  | "class-booking"
  | "pt-booking"
  | "trainer"
  | "gym-class"
  | "product"
  | "supplier"
  | "equipment"
  | "stock-masuk"
  | "stock-keluar"
  | "reward-redemption"
  | "reward"
  | "challenge"
  | "staff-user"
  | "role"
  | "close-shift"
  | "broadcast";

type ConfirmDeleteState = {
  title: string;
  message: string;
  target: string;
  confirmLabel?: string;
  onConfirm: () => void;
} | null;

const prototypeToday = "2026-05-28";

const defaultMemberForm: MemberFormState = {
  name: "",
  email: "",
  phone: "",
  membershipType: "Basic",
  membershipStatus: "active",
  membershipEnd: "2026-06-28",
  weight: "",
  height: "",
};

const defaultStockMovementForm: StockMovementFormState = {
  productId: "",
  source: "",
  qty: "1",
  date: prototypeToday,
  note: "",
};

const defaultClassBookingForm: ClassBookingFormState = {
  classId: "",
  memberId: "",
  date: prototypeToday,
};

const defaultPtBookingForm: PtBookingFormState = {
  trainerId: "",
  memberId: "",
  date: prototypeToday,
  time: "09:00",
  duration: "60",
  focus: "Strength Training",
};

const defaultTrainerForm: TrainerFormState = {
  name: "",
  email: "",
  phone: "",
  specializations: "Strength Training, Mobility",
  hourlyRate: "250000",
  status: "active",
};

const defaultGymClassForm: GymClassFormState = {
  name: "",
  trainerId: mockTrainers[0]?.id ?? "",
  description: "",
  category: "strength",
  scheduleDay: "Senin",
  scheduleTime: "08:00",
  duration: "60",
  maxParticipants: "20",
  status: "active",
};

const defaultProductForm: ProductFormState = {
  name: "",
  category: "supplement",
  price: "150000",
  stock: "10",
  minStock: "5",
  sku: "",
};

const defaultSupplierForm: SupplierFormState = {
  name: "",
  category: "Produk & restock",
  sla: "1 hari",
  status: "aktif",
};

const defaultEquipmentForm: EquipmentFormState = {
  equipmentName: "",
  location: "Main Floor",
  status: "ok",
  nextCheck: "2026-06-01",
};

const defaultRewardForm: RewardFormState = {
  name: "",
  points: "500",
  stock: "10",
};

const defaultChallengeForm: ChallengeFormState = {
  name: "",
  description: "",
  target: "10",
  reward: "500",
  endDate: "2026-06-30",
};

const defaultStaffUserForm: StaffUserFormState = {
  name: "",
  email: "",
  role: "staff",
  branchAccess: "branch-pusat",
  status: "active",
};

const defaultRoleForm: RoleFormState = {
  id: "staff",
  name: "Staff",
  users: "1",
  scope: "Operasional cabang",
  color: "amber",
};

const initialSuppliers: SupplierRow[] = [
  { id: "SUP-001", name: "FitSupply Indonesia", category: "Produk & restock", sla: "1 hari", status: "aktif" },
  { id: "SUP-002", name: "ProteinHub Jakarta", category: "Suplemen", sla: "2 hari", status: "aktif" },
  { id: "SUP-003", name: "GymTech Service", category: "Service alat", sla: "3 hari", status: "maintenance" },
];

const initialStaffUsers: StaffUserRow[] = mockLoginUsers.map((user) => ({
  ...user,
  status: "active",
}));

const initialRoleRows: RoleRow[] = [
  { id: "owner", name: "Owner / Admin", users: 1, scope: "Full access semua cabang, laporan, setting, dan approval", color: "emerald" },
  { id: "staff", name: "Staff", users: 1, scope: "Operasional cabang: member, check-in, kelas, POS, stok harian", color: "amber" },
  { id: "trainer", name: "Personal Trainer", users: 1, scope: "Portal trainer: jadwal, client, progress, target, komisi", color: "sky" },
  { id: "member", name: "Member", users: 1, scope: "Portal member: membership, QR check-in, booking, pembayaran, reward", color: "slate" },
];

const defaultPromoForm: PromoFormState = {
  name: "",
  code: "",
  description: "",
  discount: "10",
  type: "percentage",
  maxUsage: "100",
  validUntil: "2026-06-30",
};

const defaultRewardRedemptionForm: RewardRedemptionFormState = {
  memberId: members[0]?.id ?? "",
  rewardId: rewards[0]?.id ?? "",
};

const defaultBroadcastForm: BroadcastFormState = {
  template: "manual_broadcast",
  recipient: "Segment Promo",
  scheduledAt: "2026-05-28 15:00",
};

const defaultMembershipPackageForm: MembershipPackageFormState = {
  name: "",
  duration: "1",
  price: "300000",
};

const defaultPtPackageForm: PtPackageFormState = {
  name: "",
  sessions: "4",
  price: "800000",
};

const defaultPaymentMethodForm: PaymentMethodFormState = {
  name: "",
  settlement: "Realtime",
  fee: "0%",
};

const defaultMessageTemplateForm: MessageTemplateFormState = {
  name: "",
  trigger: "",
  audience: "",
  channel: "WhatsApp",
};

const defaultBranchForm: BranchFormState = {
  name: "",
  code: "",
  city: "",
  address: "",
};

const defaultCloseShiftForm: CloseShiftFormState = {
  shiftId: "",
  countedCash: "0",
};

const prototypeLocalStorageKeys = [
  "seven-gym-prototype-state-v2",
  "seven-gym-prototype-trainers-v1",
  "seven-gym-prototype-suppliers-v1",
  "seven-gym-prototype-equipment-v1",
  "seven-gym-prototype-users-v1",
  "seven-gym-prototype-roles-v1",
  "seven-gym-access-matrix-v1",
];

const accessRoleKeys: AccessRoleKey[] = ["owner", "staff", "trainer", "member"];
const accessLevelCycle = ["none", "view", "self", "daily", "operate", "export", "manage", "full"];
const accessMatrixStorageKey = "seven-gym-access-matrix-v1";

const modulePermissionLevels: Record<string, Record<string, string[]>> = {
  Member: {
    view: ["members.view"],
    self: ["member.dashboard.view", "member.membership.view", "member.progress.view", "member.profile.view", "member.points.view", "member.referrals.view"],
    operate: ["members.view", "members.create", "members.edit"],
    manage: ["members.view", "members.create", "members.edit", "members.export"],
    full: ["members.view", "members.create", "members.edit", "members.export"],
  },
  "Check-In": {
    view: ["checkin.view"],
    self: ["member.qr.view"],
    operate: ["checkin.view", "checkin.create"],
    manage: ["checkin.view", "checkin.create"],
    full: ["checkin.view", "checkin.create"],
  },
  Kelas: {
    view: ["classes.view"],
    self: ["member.schedule.view", "member.bookings.view", "member.bookings.create"],
    operate: ["classes.view", "classes.bookings"],
    manage: ["classes.view", "classes.create", "classes.edit", "classes.bookings"],
    full: ["classes.view", "classes.create", "classes.edit", "classes.bookings"],
  },
  PT: {
    view: ["trainers.view", "pt.view"],
    self: ["trainer.schedule.view", "trainer.clients.view", "trainer.programs.view", "trainer.earnings.view", "member.schedule.view", "member.trainer.book"],
    operate: ["trainers.view", "pt.view", "pt.bookings"],
    manage: ["trainers.view", "trainers.create", "trainers.edit", "pt.view", "pt.bookings"],
    full: ["trainers.view", "trainers.create", "trainers.edit", "pt.view", "pt.bookings"],
  },
  POS: {
    view: ["pos.view", "payments.view"],
    operate: ["pos.view", "pos.create", "payments.view", "payments.create"],
    manage: ["pos.view", "pos.create", "payments.view", "payments.create", "payments.export"],
    full: ["pos.view", "pos.create", "payments.view", "payments.create", "payments.export"],
  },
  Inventory: {
    view: ["products.view"],
    operate: ["products.view", "products.edit"],
    manage: ["products.view", "products.create", "products.edit"],
    full: ["products.view", "products.create", "products.edit"],
  },
  Promo: {
    view: ["promos.view"],
    self: ["member.promos.view", "member.points.view", "member.referrals.view"],
    operate: ["promos.view", "promos.create"],
    manage: ["promos.view", "promos.create", "promos.edit"],
    full: ["promos.view", "promos.create", "promos.edit"],
  },
  Notifikasi: {
    view: ["notifications.view"],
    operate: ["notifications.view", "notifications.queue"],
    manage: ["notifications.view", "notifications.queue", "notifications.manage"],
    full: ["notifications.view", "notifications.queue", "notifications.manage"],
  },
  Reports: {
    view: ["reports.view"],
    self: ["trainer.earnings.view", "member.payments.view", "member.progress.view"],
    daily: ["reports.view"],
    export: ["reports.view", "reports.export"],
    manage: ["reports.view", "reports.export"],
    full: ["reports.view", "reports.export"],
  },
  Settings: {
    view: ["settings.view"],
    manage: ["settings.view", "settings.manage"],
    full: ["settings.view", "settings.manage"],
  },
  IAM: {
    view: ["iam.view"],
    manage: ["settings.view", "iam.view", "iam.users", "iam.roles", "iam.permissions", "iam.logs"],
    full: ["settings.view", "iam.view", "iam.users", "iam.roles", "iam.permissions", "iam.logs"],
  },
};

const buildPermissionsFromMatrix = (rows: PermissionMatrixRow[], roleKey: AccessRoleKey) => {
  if (roleKey === "owner") return ["*"];

  const permissions = rows.flatMap((row) => {
    const level = row[roleKey];
    return modulePermissionLevels[row.module]?.[level] ?? [];
  });

  const baselinePermissions: Record<Exclude<AccessRoleKey, "owner">, string[]> = {
    staff: ["dashboard.view"],
    trainer: ["trainer.dashboard.view"],
    member: ["member.dashboard.view"],
  };

  return Array.from(new Set([...baselinePermissions[roleKey], ...permissions]));
};

const normalizeAccessMatrixRows = (rows: PermissionMatrixRow[]) =>
  permissionMatrix.map((defaultRow) => {
    const storedRow = rows.find((row) => row.module === defaultRow.module);

    return {
      ...defaultRow,
      owner: storedRow?.owner ?? defaultRow.owner,
      staff: storedRow?.staff ?? defaultRow.staff,
      trainer: storedRow?.trainer ?? defaultRow.trainer,
      member: storedRow?.member ?? defaultRow.member,
    };
  });

const getNextAccessLevel = (value: string) => {
  const index = accessLevelCycle.indexOf(value);
  return accessLevelCycle[(index + 1) % accessLevelCycle.length];
};

const isAccessRoleKey = (role: string): role is AccessRoleKey =>
  accessRoleKeys.includes(role as AccessRoleKey);

const settingsItems = [
  { title: "Profil Gym", value: "Seven Gym HQ", helper: "Identitas brand, kontak, logo, dan legal" },
  { title: "Operasional", value: "05:00 - 23:00", helper: "Jam buka, aturan check-in, dan booking" },
  { title: "Template", value: "Invoice + WhatsApp", helper: "Format invoice, pesan reminder, broadcast" },
  { title: "Data Dummy", value: "JSON-ready", helper: "Seed data yang nanti diganti API/backend" },
];

const usePrototypeLocalState = <T,>(storageKey: string, initialValue: T) => {
  const [isReady, setIsReady] = React.useState(false);
  const [value, setValue] = React.useState<T>(initialValue);

  React.useEffect(() => {
    const storedValue = window.localStorage.getItem(storageKey);
    if (storedValue) {
      try {
        setValue(JSON.parse(storedValue) as T);
      } catch {
        window.localStorage.removeItem(storageKey);
      }
    }

    setIsReady(true);
  }, [storageKey]);

  React.useEffect(() => {
    if (!isReady) return;
    window.localStorage.setItem(storageKey, JSON.stringify(value));
  }, [isReady, storageKey, value]);

  return [value, setValue] as const;
};

export default function GymPrototypePage({ slug }: GymPrototypePageProps) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    activeBranch,
    currentRoleLabel,
    currentUser,
    hasAnyPermission,
    setRolePermissionOverride,
  } = useRole();
  const {
    members: memberRows,
    cashShifts: cashShiftRows,
    stockMovements,
    createMember,
    updateMember,
    renewMember: renewPrototypeMember,
    toggleFreezeMember: togglePrototypeFreezeMember,
    scanCheckInMember: scanPrototypeCheckInMember,
    checkoutMember,
    createStockMovement,
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
    classes: gymClassRows,
    createPtBooking,
    updatePtSessionStatus,
    createInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    getOperationalSnapshot,
    getInvoicesForBranch,
    promos: promoRows,
    rewards: rewardRows,
    challenges: challengeRows,
    whatsappMessages,
    membershipPackageSettings,
    ptPackageSettings,
    paymentMethodSettings,
    messageTemplateSettings,
    branchSettings,
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
  } = usePrototypeData();
  const branchSnapshot = React.useMemo(
    () => getOperationalSnapshot(activeBranch.id),
    [activeBranch.id, getOperationalSnapshot],
  );
  const invoiceRows = React.useMemo(
    () => getInvoicesForBranch(activeBranch.id),
    [activeBranch.id, getInvoicesForBranch],
  );
  const branchAuditLogs = React.useMemo(
    () => getAuditLogsForBranch(activeBranch.id),
    [activeBranch.id, getAuditLogsForBranch],
  );
  const navItem = findNavItemByPath(pathname);
  const moduleName = slug[0] ?? "dashboard";
  const title = navItem?.name ?? toTitle(slug.at(-1) ?? moduleName);
  const parent = navItem?.parent ?? toTitle(moduleName);
  const [selectedFlowId, setSelectedFlowId] = React.useState("member-journey");
  const [selectedFlowStep, setSelectedFlowStep] = React.useState(0);
  const [trainerRows, setTrainerRows] = usePrototypeLocalState<TrainerRow[]>(
    "seven-gym-prototype-trainers-v1",
    mockTrainers,
  );
  const [supplierRows, setSupplierRows] = usePrototypeLocalState<SupplierRow[]>(
    "seven-gym-prototype-suppliers-v1",
    initialSuppliers,
  );
  const [equipmentRows, setEquipmentRows] = usePrototypeLocalState<EquipmentRow[]>(
    "seven-gym-prototype-equipment-v1",
    equipmentInspections,
  );
  const [staffUserRows, setStaffUserRows] = usePrototypeLocalState<StaffUserRow[]>(
    "seven-gym-prototype-users-v1",
    initialStaffUsers,
  );
  const [roleRows, setRoleRows] = usePrototypeLocalState<RoleRow[]>(
    "seven-gym-prototype-roles-v1",
    initialRoleRows,
  );

  React.useEffect(() => {
    setStaffUserRows((currentRows) => {
      const normalizedRows = currentRows.map((user) => ({
        ...user,
        role: isAccessRoleKey(user.role) ? user.role : "staff",
        branchAccess: user.branchAccess.length ? user.branchAccess : ["branch-pusat"],
      }));
      const mergedRows = [
        ...initialStaffUsers.map((defaultUser) => {
          const storedUser = normalizedRows.find((user) => user.id === defaultUser.id);
          return storedUser ? { ...defaultUser, ...storedUser } : defaultUser;
        }),
        ...normalizedRows.filter((user) => !initialStaffUsers.some((defaultUser) => defaultUser.id === user.id)),
      ];

      return JSON.stringify(mergedRows) === JSON.stringify(currentRows)
        ? currentRows
        : mergedRows;
    });
    setRoleRows((currentRows) => {
      const normalizedRows = initialRoleRows.map((defaultRole) => {
        const storedRole = currentRows.find((role) => role.id === defaultRole.id);
        return storedRole ? { ...defaultRole, ...storedRole } : defaultRole;
      });

      return JSON.stringify(normalizedRows) === JSON.stringify(currentRows)
        ? currentRows
        : normalizedRows;
    });
  }, [setRoleRows, setStaffUserRows]);

  const [memberSearch, setMemberSearch] = React.useState("");
  const [memberStatusFilter, setMemberStatusFilter] = React.useState<MemberStatusFilter>("all");
  const [memberPage, setMemberPage] = React.useState(1);
  const [selectedMemberId, setSelectedMemberId] = React.useState(members[0]?.id ?? "");
  const [memberFormOpen, setMemberFormOpen] = React.useState(false);
  const [memberFormMode, setMemberFormMode] = React.useState<"create" | "edit">("create");
  const [memberForm, setMemberForm] = React.useState<MemberFormState>(defaultMemberForm);
  const [scanMemberId, setScanMemberId] = React.useState(members[0]?.id ?? "");
  const [checkInSearch, setCheckInSearch] = React.useState("");
  const [scanResult, setScanResult] = React.useState<{
    tone: StatCardProps["tone"];
    message: string;
  } | null>(null);
  const [stockForm, setStockForm] = React.useState<StockMovementFormState>(defaultStockMovementForm);
  const [classBookingForm, setClassBookingForm] = React.useState<ClassBookingFormState>(defaultClassBookingForm);
  const [ptBookingForm, setPtBookingForm] = React.useState<PtBookingFormState>(defaultPtBookingForm);
  const [trainerForm, setTrainerForm] = React.useState<TrainerFormState>(defaultTrainerForm);
  const [editingTrainerId, setEditingTrainerId] = React.useState<string | null>(null);
  const [gymClassForm, setGymClassForm] = React.useState<GymClassFormState>(defaultGymClassForm);
  const [editingGymClassId, setEditingGymClassId] = React.useState<string | null>(null);
  const [productForm, setProductForm] = React.useState<ProductFormState>(defaultProductForm);
  const [editingProductId, setEditingProductId] = React.useState<string | null>(null);
  const [supplierForm, setSupplierForm] = React.useState<SupplierFormState>(defaultSupplierForm);
  const [editingSupplierId, setEditingSupplierId] = React.useState<string | null>(null);
  const [equipmentForm, setEquipmentForm] = React.useState<EquipmentFormState>(defaultEquipmentForm);
  const [editingEquipmentId, setEditingEquipmentId] = React.useState<string | null>(null);
  const [rewardForm, setRewardForm] = React.useState<RewardFormState>(defaultRewardForm);
  const [editingRewardId, setEditingRewardId] = React.useState<string | null>(null);
  const [challengeForm, setChallengeForm] = React.useState<ChallengeFormState>(defaultChallengeForm);
  const [editingChallengeId, setEditingChallengeId] = React.useState<string | null>(null);
  const [staffUserForm, setStaffUserForm] = React.useState<StaffUserFormState>(defaultStaffUserForm);
  const [editingStaffUserId, setEditingStaffUserId] = React.useState<string | null>(null);
  const [roleForm, setRoleForm] = React.useState<RoleFormState>(defaultRoleForm);
  const [editingRoleId, setEditingRoleId] = React.useState<AccessRoleKey | null>(null);
  const [confirmDelete, setConfirmDelete] = React.useState<ConfirmDeleteState>(null);
  const [classBookingMessage, setClassBookingMessage] = React.useState<string | null>(null);
  const [ptBookingMessage, setPtBookingMessage] = React.useState<string | null>(null);
  const [trainerMessage, setTrainerMessage] = React.useState<string | null>(null);
  const [crudMessage, setCrudMessage] = React.useState<string | null>(null);
  const [promoForm, setPromoForm] = React.useState<PromoFormState>(defaultPromoForm);
  const [rewardRedemptionForm, setRewardRedemptionForm] = React.useState<RewardRedemptionFormState>(
    defaultRewardRedemptionForm,
  );
  const [broadcastForm, setBroadcastForm] = React.useState<BroadcastFormState>(defaultBroadcastForm);
  const [membershipPackageForm, setMembershipPackageForm] = React.useState<MembershipPackageFormState>(
    defaultMembershipPackageForm,
  );
  const [ptPackageForm, setPtPackageForm] = React.useState<PtPackageFormState>(defaultPtPackageForm);
  const [paymentMethodForm, setPaymentMethodForm] = React.useState<PaymentMethodFormState>(
    defaultPaymentMethodForm,
  );
  const [messageTemplateForm, setMessageTemplateForm] = React.useState<MessageTemplateFormState>(
    defaultMessageTemplateForm,
  );
  const [branchForm, setBranchForm] = React.useState<BranchFormState>(defaultBranchForm);
  const [closeShiftForm, setCloseShiftForm] = React.useState<CloseShiftFormState>(defaultCloseShiftForm);
  const [detailModal, setDetailModal] = React.useState<DetailModalState>(null);
  const [seedModal, setSeedModal] = React.useState<SeedModalState>(null);
  const [seedJson, setSeedJson] = React.useState("");
  const [reportSearch, setReportSearch] = React.useState("");
  const [reportStatusFilter, setReportStatusFilter] = React.useState("all");
  const [selectedBulkMembers, setSelectedBulkMembers] = React.useState<string[]>([]);
  const [loyaltyMessage, setLoyaltyMessage] = React.useState<{
    tone: StatCardProps["tone"];
    message: string;
  } | null>(null);
  const [notificationMessage, setNotificationMessage] = React.useState<string | null>(null);
  const [settingsMessage, setSettingsMessage] = React.useState<string | null>(null);
  const [accessMessage, setAccessMessage] = React.useState<string | null>(null);
  const [accessMatrixRows, setAccessMatrixRows] = React.useState<PermissionMatrixRow[]>(
    () => permissionMatrix,
  );
  const [settingsModal, setSettingsModal] = React.useState<SettingsModalState>(null);
  const [actionModal, setActionModal] = React.useState<ActionModalType | null>(null);
  const checkInRows = branchSnapshot.scopedCheckIns;
  const inventoryRows = branchSnapshot.scopedInventory;
  const canCreateMember = hasAnyPermission(["members.create"]);
  const canEditMember = hasAnyPermission(["members.edit"]);
  const canCreateCheckIn = hasAnyPermission(["checkin.create"]);
  const canManageClasses = hasAnyPermission(["classes.edit", "classes.create", "classes.bookings"]);
  const canManageTrainers = hasAnyPermission(["trainers.edit", "trainers.create", "pt.bookings", "trainer.schedule.edit"]);
  const canEditProduct = hasAnyPermission(["products.edit"]);
  const canCreateProduct = hasAnyPermission(["products.create"]);
  const canManagePromo = hasAnyPermission(["promos.create", "promos.edit"]);
  const canManageNotifications = hasAnyPermission(["notifications.manage"]);
  const canManageSettings = hasAnyPermission(["settings.view", "settings.manage"]);
  const canManageIam = hasAnyPermission(["iam.users", "iam.roles", "iam.permissions", "iam.logs"]);
  const activeMembershipPackageNames = React.useMemo(
    () => {
      const packageNames = membershipPackageSettings
        .filter((pkg) => pkg.status === "active")
        .map((pkg) => pkg.name);

      return packageNames.length ? packageNames : ["Basic", "Premium", "VIP"];
    },
    [membershipPackageSettings],
  );
  const memberPageSize = 6;
  const filteredMembers = React.useMemo(() => {
    const normalizedSearch = memberSearch.trim().toLowerCase();

    return memberRows.filter((member) => {
      const matchStatus =
        memberStatusFilter === "all" || member.membershipStatus === memberStatusFilter;
      const matchSearch =
        !normalizedSearch ||
        [member.name, member.email, member.phone, member.referralCode, member.membershipType]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);

      return matchStatus && matchSearch;
    });
  }, [memberRows, memberSearch, memberStatusFilter]);
  const totalMemberPages = Math.max(1, Math.ceil(filteredMembers.length / memberPageSize));
  const pagedMembers = filteredMembers.slice(
    (memberPage - 1) * memberPageSize,
    memberPage * memberPageSize,
  );
  const selectedMember =
    memberRows.find((member) => member.id === selectedMemberId) ??
    filteredMembers[0] ??
    memberRows[0];

  React.useEffect(() => {
    setMemberPage(1);
    setSelectedBulkMembers([]);
  }, [memberSearch, memberStatusFilter]);

  React.useEffect(() => {
    if (!memberRows.some((member) => member.id === selectedMemberId)) {
      setSelectedMemberId(memberRows[0]?.id ?? "");
    }
  }, [memberRows, selectedMemberId]);

  React.useEffect(() => {
    setStockForm((currentForm) => ({
      ...currentForm,
      productId: branchSnapshot.scopedInventory[0]?.id ?? "",
      date: prototypeToday,
    }));
    setClassBookingForm((currentForm) => ({
      ...currentForm,
      classId: branchSnapshot.scopedClasses[0]?.id ?? "",
      memberId: branchSnapshot.scopedMembers[0]?.id ?? "",
      date: prototypeToday,
    }));
    setPtBookingForm((currentForm) => ({
      ...currentForm,
      trainerId: trainerRows[0]?.id ?? "",
      memberId: branchSnapshot.scopedMembers[0]?.id ?? "",
      date: prototypeToday,
    }));
    setGymClassForm((currentForm) => ({
      ...currentForm,
      trainerId: currentForm.trainerId || trainerRows[0]?.id || "",
    }));
    setRewardRedemptionForm((currentForm) => ({
      ...currentForm,
      memberId: branchSnapshot.scopedMembers[0]?.id ?? memberRows[0]?.id ?? "",
      rewardId: rewardRows[0]?.id ?? "",
    }));
  }, [
    activeBranch.id,
    branchSnapshot.scopedClasses,
    branchSnapshot.scopedInventory,
    branchSnapshot.scopedMembers,
    memberRows,
    rewardRows,
    trainerRows,
  ]);

  React.useEffect(() => {
    setScanResult(null);
    setClassBookingMessage(null);
    setPtBookingMessage(null);
    setTrainerMessage(null);
    setCrudMessage(null);
    setLoyaltyMessage(null);
    setNotificationMessage(null);
    setSettingsMessage(null);
  }, [activeBranch.id]);

  React.useEffect(() => {
    const storedMatrix = window.localStorage.getItem(accessMatrixStorageKey);
    if (!storedMatrix) return;

    try {
      const parsedMatrix = JSON.parse(storedMatrix) as PermissionMatrixRow[];
      const normalizedMatrix = normalizeAccessMatrixRows(parsedMatrix);
      setAccessMatrixRows(normalizedMatrix);
      accessRoleKeys.forEach((roleKey) => {
        setRolePermissionOverride(
          roleKey,
          buildPermissionsFromMatrix(normalizedMatrix, roleKey),
        );
      });
    } catch {
      window.localStorage.removeItem(accessMatrixStorageKey);
    }
  }, [setRolePermissionOverride]);

  React.useEffect(() => {
    window.localStorage.setItem(accessMatrixStorageKey, JSON.stringify(accessMatrixRows));
  }, [accessMatrixRows]);

  const openCreateMemberForm = React.useCallback(() => {
    setMemberFormMode("create");
    setMemberForm(defaultMemberForm);
    setMemberFormOpen(true);
  }, []);

  const openEditMemberForm = React.useCallback((member: MemberRow) => {
    setMemberFormMode("edit");
    setSelectedMemberId(member.id);
    setMemberForm({
      name: member.name,
      email: member.email,
      phone: member.phone,
      membershipType: member.membershipType,
      membershipStatus: member.membershipStatus,
      membershipEnd: member.membershipEnd,
      weight: member.weight ? String(member.weight) : "",
      height: member.height ? String(member.height) : "",
    });
    setMemberFormOpen(true);
  }, []);

  const updateMemberForm = React.useCallback(
    (field: keyof MemberFormState, value: string) => {
      setMemberForm((currentForm) => ({ ...currentForm, [field]: value }));
    },
    [],
  );

  const submitMemberForm = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const weight = Number(memberForm.weight);
      const height = Number(memberForm.height);
      const nextBmi =
        weight > 0 && height > 0
          ? Number((weight / (height / 100) ** 2).toFixed(1))
          : undefined;

      if (memberFormMode === "create") {
        const nextMember = createMember({
          branchId: activeBranch.id,
          name: memberForm.name.trim() || "Member Baru",
          email: memberForm.email.trim() || `member${memberRows.length + 1}@email.com`,
          phone: memberForm.phone.trim() || "+62 800 0000 0000",
          membershipType: memberForm.membershipType,
          membershipStatus: memberForm.membershipStatus,
          membershipEnd: memberForm.membershipEnd || defaultMemberForm.membershipEnd,
          weight: weight > 0 ? weight : undefined,
          height: height > 0 ? height : undefined,
          bmi: nextBmi,
        });
        setSelectedMemberId(nextMember.id);
      } else if (selectedMember) {
        updateMember(selectedMember.id, {
          name: memberForm.name.trim() || selectedMember.name,
          email: memberForm.email.trim() || selectedMember.email,
          phone: memberForm.phone.trim() || selectedMember.phone,
          membershipType: memberForm.membershipType,
          membershipStatus: memberForm.membershipStatus,
          membershipEnd: memberForm.membershipEnd || selectedMember.membershipEnd,
          weight: weight > 0 ? weight : undefined,
          height: height > 0 ? height : undefined,
          bmi: nextBmi,
        });
      }

      setMemberFormOpen(false);
    },
    [activeBranch.id, createMember, memberForm, memberFormMode, memberRows.length, selectedMember, updateMember],
  );

  const renewMember = React.useCallback((memberId: string) => {
    renewPrototypeMember(memberId);
    setSelectedMemberId(memberId);
  }, [renewPrototypeMember]);

  const toggleFreezeMember = React.useCallback((memberId: string) => {
    togglePrototypeFreezeMember(memberId);
    setSelectedMemberId(memberId);
  }, [togglePrototypeFreezeMember]);

  const scanCheckInMember = React.useCallback(() => {
    setScanResult(scanPrototypeCheckInMember(scanMemberId, activeBranch.id));
  }, [activeBranch.id, scanMemberId, scanPrototypeCheckInMember]);

  const updateStockForm = React.useCallback(
    (field: keyof StockMovementFormState, value: string) => {
      setStockForm((currentForm) => ({ ...currentForm, [field]: value }));
    },
    [],
  );

  const submitStockMovement = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>, type: StockMovement["type"]) => {
      event.preventDefault();

      const qty = Math.max(1, Number(stockForm.qty) || 1);
      const nextMovement = createStockMovement({
        branchId: activeBranch.id,
        productId: stockForm.productId,
        type,
        qty,
        source: stockForm.source.trim() || (type === "Masuk" ? "Supplier" : "Adjustment"),
        date: stockForm.date || prototypeToday,
      });

      if (!nextMovement) return;

      setStockForm((currentForm) => ({
        ...currentForm,
        source: "",
        qty: "1",
        note: "",
        date: prototypeToday,
      }));
      setActionModal(null);
    },
    [activeBranch.id, createStockMovement, stockForm],
  );

  const updateClassBookingForm = React.useCallback(
    (field: keyof ClassBookingFormState, value: string) => {
      setClassBookingForm((currentForm) => ({ ...currentForm, [field]: value }));
    },
    [],
  );

  const submitClassBooking = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const booking = createClassBooking({
        branchId: activeBranch.id,
        classId: classBookingForm.classId,
        memberId: classBookingForm.memberId,
        date: classBookingForm.date || prototypeToday,
      });

      setClassBookingMessage(
        booking
          ? `${booking.memberName} masuk ${booking.status === "waitlist" ? "waiting list" : "booking confirmed"} untuk ${booking.className}.`
          : "Booking gagal. Cek kelas/member yang dipilih.",
      );
      if (booking) setActionModal(null);
    },
    [activeBranch.id, classBookingForm, createClassBooking],
  );

  const updatePtBookingForm = React.useCallback(
    (field: keyof PtBookingFormState, value: string) => {
      setPtBookingForm((currentForm) => ({ ...currentForm, [field]: value }));
    },
    [],
  );

  const submitPtBooking = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const session = createPtBooking({
        branchId: activeBranch.id,
        trainerId: ptBookingForm.trainerId,
        memberId: ptBookingForm.memberId,
        date: ptBookingForm.date || prototypeToday,
        time: ptBookingForm.time || "09:00",
        duration: Number(ptBookingForm.duration) || 60,
        focus: ptBookingForm.focus,
      });

      setPtBookingMessage(
        session
          ? `${session.memberName} berhasil booking PT ${session.date} ${session.time}.`
          : "Booking PT gagal. Jadwal trainer bentrok atau member tidak valid.",
      );
      if (session) setActionModal(null);
    },
    [activeBranch.id, createPtBooking, ptBookingForm],
  );

  const updateTrainerForm = React.useCallback(
    (field: keyof TrainerFormState, value: string) => {
      setTrainerForm((currentForm) => ({ ...currentForm, [field]: value }));
    },
    [],
  );

  const openCreateTrainerModal = React.useCallback(() => {
    setTrainerForm(defaultTrainerForm);
    setEditingTrainerId(null);
    setActionModal("trainer");
  }, []);

  const openEditTrainerModal = React.useCallback((trainer: TrainerRow) => {
    setTrainerForm({
      name: trainer.name,
      email: trainer.email,
      phone: trainer.phone,
      specializations: trainer.specializations.join(", "),
      hourlyRate: String(trainer.hourlyRate),
      status: trainer.status,
    });
    setEditingTrainerId(trainer.id);
    setActionModal("trainer");
  }, []);

  const submitTrainerForm = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const specializations = trainerForm.specializations
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      if (editingTrainerId) {
        const nextName = trainerForm.name.trim() || "Trainer";
        setTrainerRows((currentRows) =>
          currentRows.map((trainer) =>
            trainer.id === editingTrainerId
              ? {
                  ...trainer,
                  name: nextName,
                  email: trainerForm.email.trim() || trainer.email,
                  phone: trainerForm.phone.trim() || trainer.phone,
                  status: trainerForm.status,
                  specializations,
                  hourlyRate: Number(trainerForm.hourlyRate) || trainer.hourlyRate,
                }
              : trainer,
          ),
        );
        setTrainerMessage(`${nextName} berhasil diperbarui.`);
        addAuditLog({
          branchId: activeBranch.id,
          actor: currentUser.name,
          action: "trainers.update",
          target: nextName,
        });
        setEditingTrainerId(null);
        setTrainerForm(defaultTrainerForm);
        setActionModal(null);
        return;
      }

      const nextTrainer: TrainerRow = {
        id: `trainer-${trainerRows.length + 1}`,
        name: trainerForm.name.trim() || "Trainer Baru",
        email: trainerForm.email.trim() || `trainer${trainerRows.length + 1}@sevengym.id`,
        phone: trainerForm.phone.trim() || "+62 800 0000 0000",
        avatar: "/images/user/user-03.jpg",
        status: trainerForm.status,
        specializations,
        rating: 4.8,
        totalClients: 0,
        activeClients: 0,
        hourlyRate: Number(trainerForm.hourlyRate) || 0,
        monthlyTarget: 40,
        currentSessions: 0,
        commission: 0,
      };

      setTrainerRows((currentRows) => [nextTrainer, ...currentRows]);
      setTrainerMessage(`${nextTrainer.name} berhasil ditambahkan ke data trainer.`);
      addAuditLog({
        branchId: activeBranch.id,
        actor: currentUser.name,
        action: "trainers.create",
        target: nextTrainer.name,
      });
      setTrainerForm(defaultTrainerForm);
      setActionModal(null);
    },
    [
      activeBranch.id,
      addAuditLog,
      currentUser.name,
      editingTrainerId,
      setTrainerRows,
      trainerForm,
      trainerRows.length,
    ],
  );

  const deleteTrainerRow = React.useCallback(
    (trainer: TrainerRow) => {
      setTrainerRows((currentRows) => currentRows.filter((item) => item.id !== trainer.id));
      setTrainerMessage(`${trainer.name} dihapus dari data trainer.`);
      addAuditLog({
        branchId: activeBranch.id,
        actor: currentUser.name,
        action: "trainers.delete",
        target: trainer.name,
      });
    },
    [activeBranch.id, addAuditLog, currentUser.name, setTrainerRows],
  );

  const requestDelete = React.useCallback((payload: NonNullable<ConfirmDeleteState>) => {
    setConfirmDelete(payload);
  }, []);

  const confirmDeleteAction = React.useCallback(() => {
    confirmDelete?.onConfirm();
    setConfirmDelete(null);
  }, [confirmDelete]);

  const openProductDetail = React.useCallback(
    (item: PrototypeInventoryItem) => {
      router.push(`/inventory/products/${encodeURIComponent(item.id)}`);
    },
    [router],
  );

  const openClassDetail = React.useCallback(
    (gymClass: PrototypeGymClass) => {
      router.push(`/classes/schedule/${encodeURIComponent(gymClass.id)}`);
    },
    [router],
  );

  const openTrainerDetail = React.useCallback(
    (trainer: TrainerRow) => {
      router.push(`/trainers/data/${encodeURIComponent(trainer.id)}`);
    },
    [router],
  );

  const openInvoiceDetail = React.useCallback(
    (invoice: PrototypeInvoice) => {
      router.push(`/payments/invoices/${encodeURIComponent(invoice.id)}`);
    },
    [router],
  );

  const openTransactionDetail = React.useCallback(
    (transaction: PrototypeTransaction) => {
      router.push(`/payments/transactions/${encodeURIComponent(transaction.id)}`);
    },
    [router],
  );

  const downloadInvoice = React.useCallback((invoice: PrototypeInvoice) => {
    const transaction = branchSnapshot.scopedTransactions.find((item) => item.id === invoice.invoiceNo);
    downloadTextFile(
      `${invoice.invoiceNo}.txt`,
      [
        "Seven Gym",
        `Invoice: ${invoice.invoiceNo}`,
        `Penerima: ${invoice.recipient}`,
        `Channel: ${invoice.channel}`,
        `Tanggal: ${invoice.generatedAt}`,
        `Status: ${invoice.status}`,
        transaction ? `Nominal: ${formatCurrency(transaction.amount)}` : "",
        transaction ? `Deskripsi: ${transaction.description}` : "",
      ].filter(Boolean).join("\n"),
    );
  }, [branchSnapshot.scopedTransactions]);

  const exportRows = React.useCallback((filename: string, rows: unknown[]) => {
    downloadJsonFile(filename, rows);
  }, []);

  const openCloseShiftModal = React.useCallback((shift: PrototypeCashShift) => {
    setCloseShiftForm({
      shiftId: shift.id,
      countedCash: String(shift.expectedCash),
    });
    setActionModal("close-shift");
  }, []);

  const submitCloseShift = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      closeCashShift(closeShiftForm.shiftId, Number(closeShiftForm.countedCash) || 0);
      addAuditLog({
        branchId: activeBranch.id,
        actor: currentUser.name,
        action: "cash-shift.close",
        target: `${closeShiftForm.shiftId} / ${formatCurrency(Number(closeShiftForm.countedCash) || 0)}`,
      });
      setActionModal(null);
    },
    [activeBranch.id, addAuditLog, closeCashShift, closeShiftForm, currentUser.name],
  );

  const resetPrototypeSeed = React.useCallback(() => {
    prototypeLocalStorageKeys.forEach((key) => window.localStorage.removeItem(key));
    window.location.reload();
  }, []);

  const resetPrototypeSeedKeys = React.useCallback((keys: string[]) => {
    keys.forEach((key) => window.localStorage.removeItem(key));
    window.location.reload();
  }, []);

  const openExportSeedModal = React.useCallback(() => {
    const payload = prototypeLocalStorageKeys.reduce<Record<string, unknown>>((snapshot, key) => {
      const value = window.localStorage.getItem(key);
      if (!value) return snapshot;

      try {
        snapshot[key] = JSON.parse(value);
      } catch {
        snapshot[key] = value;
      }

      return snapshot;
    }, {});

    setSeedJson(JSON.stringify(payload, null, 2));
    setSeedModal({ mode: "export" });
  }, []);

  const openImportSeedModal = React.useCallback(() => {
    setSeedJson("");
    setSeedModal({ mode: "import" });
  }, []);

  const importPrototypeSeed = React.useCallback(() => {
    try {
      const parsed = JSON.parse(seedJson) as Record<string, unknown>;
      const unknownKeys = Object.keys(parsed).filter((key) => !prototypeLocalStorageKeys.includes(key));
      if (unknownKeys.length) {
        setSettingsMessage(`Import ditolak. Key tidak dikenal: ${unknownKeys.join(", ")}.`);
        return;
      }

      prototypeLocalStorageKeys.forEach((key) => {
        if (key in parsed) window.localStorage.setItem(key, JSON.stringify(parsed[key]));
      });
      window.location.reload();
    } catch {
      setSettingsMessage("Format JSON tidak valid.");
    }
  }, [seedJson]);

  const toggleBulkMember = React.useCallback((memberId: string) => {
    setSelectedBulkMembers((currentRows) =>
      currentRows.includes(memberId)
        ? currentRows.filter((id) => id !== memberId)
        : [...currentRows, memberId],
    );
  }, []);

  const toggleAllPagedMembers = React.useCallback(() => {
    const pageIds = pagedMembers.map((member) => member.id);
    const allSelected = pageIds.every((id) => selectedBulkMembers.includes(id));

    setSelectedBulkMembers((currentRows) =>
      allSelected
        ? currentRows.filter((id) => !pageIds.includes(id))
        : Array.from(new Set([...currentRows, ...pageIds])),
    );
  }, [pagedMembers, selectedBulkMembers]);

  const bulkFreezeMembers = React.useCallback(() => {
    selectedBulkMembers.forEach((memberId) => togglePrototypeFreezeMember(memberId));
    addAuditLog({
      branchId: activeBranch.id,
      actor: currentUser.name,
      action: "members.bulk-freeze",
      target: `${selectedBulkMembers.length} member`,
    });
    setSelectedBulkMembers([]);
  }, [activeBranch.id, addAuditLog, currentUser.name, selectedBulkMembers, togglePrototypeFreezeMember]);

  const updateGymClassForm = React.useCallback((field: keyof GymClassFormState, value: string) => {
    setGymClassForm((currentForm) => ({ ...currentForm, [field]: value }));
  }, []);

  const openCreateGymClassModal = React.useCallback(() => {
    setGymClassForm({
      ...defaultGymClassForm,
      trainerId: trainerRows[0]?.id ?? "",
    });
    setEditingGymClassId(null);
    setActionModal("gym-class");
  }, [trainerRows]);

  const openEditGymClassModal = React.useCallback((gymClass: PrototypeGymClass) => {
    setGymClassForm({
      name: gymClass.name,
      trainerId: gymClass.trainerId,
      description: gymClass.description,
      category: gymClass.category,
      scheduleDay: gymClass.schedule[0]?.day ?? "Senin",
      scheduleTime: gymClass.schedule[0]?.time ?? "08:00",
      duration: String(gymClass.duration),
      maxParticipants: String(gymClass.maxParticipants),
      status: gymClass.status,
    });
    setEditingGymClassId(gymClass.id);
    setActionModal("gym-class");
  }, []);

  const submitGymClassForm = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const payload = {
        branchId: activeBranch.id,
        name: gymClassForm.name,
        trainerId: gymClassForm.trainerId || trainerRows[0]?.id || "",
        description: gymClassForm.description,
        category: gymClassForm.category,
        scheduleDay: gymClassForm.scheduleDay,
        scheduleTime: gymClassForm.scheduleTime,
        duration: Number(gymClassForm.duration) || 60,
        maxParticipants: Number(gymClassForm.maxParticipants) || 20,
        status: gymClassForm.status,
      };

      if (editingGymClassId) {
        updateGymClass(editingGymClassId, payload);
        setCrudMessage(`${payload.name || "Kelas"} berhasil diperbarui.`);
        addAuditLog({
          branchId: activeBranch.id,
          actor: currentUser.name,
          action: "classes.update",
          target: payload.name || editingGymClassId,
        });
      } else {
        const gymClass = createGymClass(payload);
        setCrudMessage(`${gymClass.name} berhasil ditambahkan.`);
        addAuditLog({
          branchId: activeBranch.id,
          actor: currentUser.name,
          action: "classes.create",
          target: gymClass.name,
        });
      }

      setEditingGymClassId(null);
      setGymClassForm(defaultGymClassForm);
      setActionModal(null);
    },
    [
      activeBranch.id,
      addAuditLog,
      createGymClass,
      currentUser.name,
      editingGymClassId,
      gymClassForm,
      trainerRows,
      updateGymClass,
    ],
  );

  const updateProductForm = React.useCallback((field: keyof ProductFormState, value: string) => {
    setProductForm((currentForm) => ({ ...currentForm, [field]: value }));
  }, []);

  const openCreateProductModal = React.useCallback(() => {
    setProductForm(defaultProductForm);
    setEditingProductId(null);
    setActionModal("product");
  }, []);

  const openEditProductModal = React.useCallback((item: PrototypeInventoryItem) => {
    setProductForm({
      name: item.name,
      category: item.category,
      price: String(item.price),
      stock: String(item.stock),
      minStock: String(item.minStock),
      sku: item.sku,
    });
    setEditingProductId(item.id);
    setActionModal("product");
  }, []);

  const submitProductForm = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const payload = {
        branchId: activeBranch.id,
        name: productForm.name,
        category: productForm.category,
        price: Number(productForm.price) || 0,
        stock: Number(productForm.stock) || 0,
        minStock: Number(productForm.minStock) || 0,
        sku: productForm.sku,
      };

      if (editingProductId) {
        updateInventoryItem(editingProductId, payload);
        setCrudMessage(`${payload.name || "Produk"} berhasil diperbarui.`);
        addAuditLog({
          branchId: activeBranch.id,
          actor: currentUser.name,
          action: "products.update",
          target: payload.name || editingProductId,
        });
      } else {
        const product = createInventoryItem(payload);
        setCrudMessage(`${product.name} berhasil ditambahkan.`);
        addAuditLog({
          branchId: activeBranch.id,
          actor: currentUser.name,
          action: "products.create",
          target: product.name,
        });
      }

      setEditingProductId(null);
      setProductForm(defaultProductForm);
      setActionModal(null);
    },
    [
      activeBranch.id,
      addAuditLog,
      createInventoryItem,
      currentUser.name,
      editingProductId,
      productForm,
      updateInventoryItem,
    ],
  );

  const updateSupplierForm = React.useCallback((field: keyof SupplierFormState, value: string) => {
    setSupplierForm((currentForm) => ({ ...currentForm, [field]: value }));
  }, []);

  const openCreateSupplierModal = React.useCallback(() => {
    setSupplierForm(defaultSupplierForm);
    setEditingSupplierId(null);
    setActionModal("supplier");
  }, []);

  const openEditSupplierModal = React.useCallback((supplier: SupplierRow) => {
    setSupplierForm({
      name: supplier.name,
      category: supplier.category,
      sla: supplier.sla,
      status: supplier.status,
    });
    setEditingSupplierId(supplier.id);
    setActionModal("supplier");
  }, []);

  const submitSupplierForm = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const nextSupplier: SupplierRow = {
        id: editingSupplierId ?? `SUP-${String(supplierRows.length + 1).padStart(3, "0")}`,
        name: supplierForm.name.trim() || "Supplier Baru",
        category: supplierForm.category.trim() || "Produk & restock",
        sla: supplierForm.sla.trim() || "1 hari",
        status: supplierForm.status,
      };

      setSupplierRows((currentRows) =>
        editingSupplierId
          ? currentRows.map((supplier) => (supplier.id === editingSupplierId ? nextSupplier : supplier))
          : [nextSupplier, ...currentRows],
      );
      setCrudMessage(`${nextSupplier.name} berhasil ${editingSupplierId ? "diperbarui" : "ditambahkan"}.`);
      addAuditLog({
        branchId: activeBranch.id,
        actor: currentUser.name,
        action: editingSupplierId ? "suppliers.update" : "suppliers.create",
        target: nextSupplier.name,
      });
      setEditingSupplierId(null);
      setSupplierForm(defaultSupplierForm);
      setActionModal(null);
    },
    [
      activeBranch.id,
      addAuditLog,
      currentUser.name,
      editingSupplierId,
      setSupplierRows,
      supplierForm,
      supplierRows.length,
    ],
  );

  const updateEquipmentForm = React.useCallback((field: keyof EquipmentFormState, value: string) => {
    setEquipmentForm((currentForm) => ({ ...currentForm, [field]: value }));
  }, []);

  const openCreateEquipmentModal = React.useCallback(() => {
    setEquipmentForm(defaultEquipmentForm);
    setEditingEquipmentId(null);
    setActionModal("equipment");
  }, []);

  const openEditEquipmentModal = React.useCallback((equipment: EquipmentRow) => {
    setEquipmentForm({
      equipmentName: equipment.equipmentName,
      location: equipment.location,
      status: equipment.status,
      nextCheck: equipment.nextCheck,
    });
    setEditingEquipmentId(equipment.id);
    setActionModal("equipment");
  }, []);

  const submitEquipmentForm = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const nextEquipment: EquipmentRow = {
        id: editingEquipmentId ?? `EQ-${String(equipmentRows.length + 1).padStart(3, "0")}`,
        branchId: activeBranch.id,
        equipmentName: equipmentForm.equipmentName.trim() || "Alat Baru",
        location: equipmentForm.location.trim() || "Main Floor",
        status: equipmentForm.status,
        nextCheck: equipmentForm.nextCheck || prototypeToday,
      };

      setEquipmentRows((currentRows) =>
        editingEquipmentId
          ? currentRows.map((equipment) => (equipment.id === editingEquipmentId ? nextEquipment : equipment))
          : [nextEquipment, ...currentRows],
      );
      setCrudMessage(`${nextEquipment.equipmentName} berhasil ${editingEquipmentId ? "diperbarui" : "ditambahkan"}.`);
      addAuditLog({
        branchId: activeBranch.id,
        actor: currentUser.name,
        action: editingEquipmentId ? "equipment.update" : "equipment.create",
        target: nextEquipment.equipmentName,
      });
      setEditingEquipmentId(null);
      setEquipmentForm(defaultEquipmentForm);
      setActionModal(null);
    },
    [
      activeBranch.id,
      addAuditLog,
      currentUser.name,
      editingEquipmentId,
      equipmentForm,
      equipmentRows.length,
      setEquipmentRows,
    ],
  );

  const updateRewardForm = React.useCallback((field: keyof RewardFormState, value: string) => {
    setRewardForm((currentForm) => ({ ...currentForm, [field]: value }));
  }, []);

  const openCreateRewardModal = React.useCallback(() => {
    setRewardForm(defaultRewardForm);
    setEditingRewardId(null);
    setActionModal("reward");
  }, []);

  const openEditRewardModal = React.useCallback((reward: (typeof rewardRows)[number]) => {
    setRewardForm({
      name: reward.name,
      points: String(reward.points),
      stock: String(reward.stock),
    });
    setEditingRewardId(reward.id);
    setActionModal("reward");
  }, []);

  const submitRewardForm = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const payload = {
        name: rewardForm.name,
        points: Number(rewardForm.points) || 1,
        stock: Number(rewardForm.stock) || 0,
      };

      if (editingRewardId) {
        updateReward(editingRewardId, payload);
        setCrudMessage(`${payload.name || "Reward"} berhasil diperbarui.`);
        addAuditLog({
          branchId: activeBranch.id,
          actor: currentUser.name,
          action: "loyalty.reward.update",
          target: payload.name || editingRewardId,
        });
      } else {
        const reward = createReward(payload);
        setCrudMessage(`${reward.name} berhasil ditambahkan.`);
        addAuditLog({
          branchId: activeBranch.id,
          actor: currentUser.name,
          action: "loyalty.reward.create",
          target: reward.name,
        });
      }

      setEditingRewardId(null);
      setRewardForm(defaultRewardForm);
      setActionModal(null);
    },
    [activeBranch.id, addAuditLog, createReward, currentUser.name, editingRewardId, rewardForm, updateReward],
  );

  const updateChallengeForm = React.useCallback((field: keyof ChallengeFormState, value: string) => {
    setChallengeForm((currentForm) => ({ ...currentForm, [field]: value }));
  }, []);

  const openCreateChallengeModal = React.useCallback(() => {
    setChallengeForm(defaultChallengeForm);
    setEditingChallengeId(null);
    setActionModal("challenge");
  }, []);

  const openEditChallengeModal = React.useCallback((challenge: (typeof challengeRows)[number]) => {
    setChallengeForm({
      name: challenge.name,
      description: challenge.description,
      target: String(challenge.target),
      reward: String(challenge.reward),
      endDate: challenge.endDate,
    });
    setEditingChallengeId(challenge.id);
    setActionModal("challenge");
  }, []);

  const submitChallengeForm = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const payload = {
        name: challengeForm.name,
        description: challengeForm.description,
        target: Number(challengeForm.target) || 1,
        reward: Number(challengeForm.reward) || 1,
        endDate: challengeForm.endDate || prototypeToday,
      };

      if (editingChallengeId) {
        updateChallenge(editingChallengeId, payload);
        setCrudMessage(`${payload.name || "Challenge"} berhasil diperbarui.`);
        addAuditLog({
          branchId: activeBranch.id,
          actor: currentUser.name,
          action: "loyalty.challenge.update",
          target: payload.name || editingChallengeId,
        });
      } else {
        const challenge = createChallenge(payload);
        setCrudMessage(`${challenge.name} berhasil ditambahkan.`);
        addAuditLog({
          branchId: activeBranch.id,
          actor: currentUser.name,
          action: "loyalty.challenge.create",
          target: challenge.name,
        });
      }

      setEditingChallengeId(null);
      setChallengeForm(defaultChallengeForm);
      setActionModal(null);
    },
    [
      activeBranch.id,
      addAuditLog,
      challengeForm,
      createChallenge,
      currentUser.name,
      editingChallengeId,
      updateChallenge,
    ],
  );

  const updateStaffUserForm = React.useCallback((field: keyof StaffUserFormState, value: string) => {
    setStaffUserForm((currentForm) => ({ ...currentForm, [field]: value }));
  }, []);

  const openCreateStaffUserModal = React.useCallback(() => {
    setStaffUserForm(defaultStaffUserForm);
    setEditingStaffUserId(null);
    setActionModal("staff-user");
  }, []);

  const openEditStaffUserModal = React.useCallback((user: StaffUserRow) => {
    setStaffUserForm({
      name: user.name,
      email: user.email,
      role: user.role,
      branchAccess: user.branchAccess[0] ?? activeBranch.id,
      status: user.status,
    });
    setEditingStaffUserId(user.id);
    setActionModal("staff-user");
  }, [activeBranch.id]);

  const submitStaffUserForm = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const branchAccess = [staffUserForm.branchAccess || activeBranch.id];
      const nextUser: StaffUserRow = {
        id: editingStaffUserId ?? `${staffUserForm.role}-${String(staffUserRows.length + 1).padStart(3, "0")}`,
        name: staffUserForm.name.trim() || "User Baru",
        email: staffUserForm.email.trim() || `user${staffUserRows.length + 1}@sevengym.id`,
        avatar: "/images/user/user-01.jpg",
        role: staffUserForm.role,
        permissions: permissionsByRole[staffUserForm.role],
        branchAccess,
        defaultBranchId: branchAccess[0],
        status: staffUserForm.status,
      };

      setStaffUserRows((currentRows) =>
        editingStaffUserId
          ? currentRows.map((user) => (user.id === editingStaffUserId ? nextUser : user))
          : [nextUser, ...currentRows],
      );
      setCrudMessage(`${nextUser.name} berhasil ${editingStaffUserId ? "diperbarui" : "ditambahkan"}.`);
      addAuditLog({
        branchId: activeBranch.id,
        actor: currentUser.name,
        action: editingStaffUserId ? "iam.users.update" : "iam.users.create",
        target: nextUser.name,
      });
      setEditingStaffUserId(null);
      setStaffUserForm(defaultStaffUserForm);
      setActionModal(null);
    },
    [
      activeBranch.id,
      addAuditLog,
      currentUser.name,
      editingStaffUserId,
      setStaffUserRows,
      staffUserForm,
      staffUserRows.length,
    ],
  );

  const updateRoleForm = React.useCallback((field: keyof RoleFormState, value: string) => {
    setRoleForm((currentForm) => ({ ...currentForm, [field]: value }));
  }, []);

  const openCreateRoleModal = React.useCallback(() => {
    setRoleForm(defaultRoleForm);
    setEditingRoleId(null);
    setActionModal("role");
  }, []);

  const openEditRoleModal = React.useCallback((role: RoleRow) => {
    setRoleForm({
      id: role.id,
      name: role.name,
      users: String(role.users),
      scope: role.scope,
      color: role.color,
    });
    setEditingRoleId(role.id);
    setActionModal("role");
  }, []);

  const submitRoleForm = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const nextRole: RoleRow = {
        id: roleForm.id,
        name: roleForm.name.trim() || roleLabels[roleForm.id],
        users: Number(roleForm.users) || 0,
        scope: roleForm.scope.trim() || "Scope role belum diisi",
        color: roleForm.color,
      };

      setRoleRows((currentRows) => {
        const exists = currentRows.some((role) => role.id === nextRole.id);
        if (editingRoleId || exists) {
          return currentRows.map((role) => (role.id === nextRole.id ? nextRole : role));
        }
        return [nextRole, ...currentRows];
      });
      setCrudMessage(`${nextRole.name} berhasil ${editingRoleId ? "diperbarui" : "disimpan"}.`);
      addAuditLog({
        branchId: activeBranch.id,
        actor: currentUser.name,
        action: editingRoleId ? "iam.roles.update" : "iam.roles.create",
        target: nextRole.name,
      });
      setEditingRoleId(null);
      setRoleForm(defaultRoleForm);
      setActionModal(null);
    },
    [activeBranch.id, addAuditLog, currentUser.name, editingRoleId, roleForm, setRoleRows],
  );

  const submitPromoForm = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const payload = {
        name: promoForm.name,
        code: promoForm.code,
        description: promoForm.description,
        discount: Number(promoForm.discount) || 0,
        type: promoForm.type,
        maxUsage: Number(promoForm.maxUsage) || 1,
        validUntil: promoForm.validUntil || prototypeToday,
        status: "active",
      } as const;

      if (settingsModal?.type === "promo" && settingsModal.mode === "edit" && settingsModal.id) {
        updatePromo(settingsModal.id, payload);
        addAuditLog({
          branchId: activeBranch.id,
          actor: currentUser.name,
          action: "promos.update",
          target: payload.name || settingsModal.id,
        });
        setNotificationMessage(`${payload.name || "Promo"} berhasil diperbarui.`);
      } else {
        const promo = createPromo(payload);
        addAuditLog({
          branchId: activeBranch.id,
          actor: currentUser.name,
          action: "promos.create",
          target: promo.name,
        });
        setNotificationMessage(`${promo.name} berhasil ditambahkan ke promo aktif.`);
      }

      setPromoForm(defaultPromoForm);
      setSettingsModal(null);
    },
    [activeBranch.id, addAuditLog, createPromo, currentUser.name, promoForm, settingsModal, updatePromo],
  );

  const submitRewardRedemption = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const result = redeemReward(rewardRedemptionForm.memberId, rewardRedemptionForm.rewardId);
      setLoyaltyMessage(result);
      if (result.tone === "emerald") {
        addAuditLog({
          branchId: activeBranch.id,
          actor: currentUser.name,
          action: "loyalty.reward.redeem",
          target: result.message,
        });
        setActionModal(null);
      }
    },
    [activeBranch.id, addAuditLog, currentUser.name, redeemReward, rewardRedemptionForm],
  );

  const submitBroadcastForm = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const message = createWhatsappBroadcast({
        branchId: activeBranch.id,
        template: broadcastForm.template,
        recipient: broadcastForm.recipient,
        scheduledAt: broadcastForm.scheduledAt || `${prototypeToday} 15:00`,
      });

      setBroadcastForm(defaultBroadcastForm);
      addAuditLog({
        branchId: activeBranch.id,
        actor: currentUser.name,
        action: "notifications.broadcast.queue",
        target: `${message.id} / ${message.recipient}`,
      });
      setNotificationMessage(`${message.id} masuk WhatsApp queue untuk ${message.recipient}.`);
      setActionModal(null);
    },
    [activeBranch.id, addAuditLog, broadcastForm, createWhatsappBroadcast, currentUser.name],
  );

  const submitMembershipPackageForm = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const payload = {
        name: membershipPackageForm.name,
        duration: Number(membershipPackageForm.duration) || 1,
        price: Number(membershipPackageForm.price) || 0,
      };

      if (settingsModal?.type === "membership" && settingsModal.mode === "edit" && settingsModal.id) {
        updateMembershipPackage(settingsModal.id, payload);
        addAuditLog({
          branchId: activeBranch.id,
          actor: currentUser.name,
          action: "settings.membership-package.update",
          target: payload.name || settingsModal.id,
        });
        setSettingsMessage(`${payload.name || "Paket membership"} berhasil diperbarui.`);
      } else {
        const membershipPackage = createMembershipPackage(payload);
        addAuditLog({
          branchId: activeBranch.id,
          actor: currentUser.name,
          action: "settings.membership-package.create",
          target: membershipPackage.name,
        });
        setSettingsMessage(`${membershipPackage.name} berhasil ditambahkan.`);
      }

      setMembershipPackageForm(defaultMembershipPackageForm);
      setSettingsModal(null);
    },
    [
      activeBranch.id,
      addAuditLog,
      createMembershipPackage,
      currentUser.name,
      membershipPackageForm,
      settingsModal,
      updateMembershipPackage,
    ],
  );

  const submitPtPackageForm = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const payload = {
        name: ptPackageForm.name,
        sessions: Number(ptPackageForm.sessions) || 1,
        price: Number(ptPackageForm.price) || 0,
      };

      if (settingsModal?.type === "pt" && settingsModal.mode === "edit" && settingsModal.id) {
        updatePtPackage(settingsModal.id, payload);
        addAuditLog({
          branchId: activeBranch.id,
          actor: currentUser.name,
          action: "settings.pt-package.update",
          target: payload.name || settingsModal.id,
        });
        setSettingsMessage(`${payload.name || "Paket PT"} berhasil diperbarui.`);
      } else {
        const ptPackage = createPtPackage(payload);
        addAuditLog({
          branchId: activeBranch.id,
          actor: currentUser.name,
          action: "settings.pt-package.create",
          target: ptPackage.name,
        });
        setSettingsMessage(`${ptPackage.name} berhasil ditambahkan.`);
      }

      setPtPackageForm(defaultPtPackageForm);
      setSettingsModal(null);
    },
    [activeBranch.id, addAuditLog, createPtPackage, currentUser.name, ptPackageForm, settingsModal, updatePtPackage],
  );

  const submitPaymentMethodForm = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const payload = paymentMethodForm;

      if (settingsModal?.type === "payment" && settingsModal.mode === "edit" && settingsModal.id) {
        updatePaymentMethod(settingsModal.id, payload);
        addAuditLog({
          branchId: activeBranch.id,
          actor: currentUser.name,
          action: "settings.payment-method.update",
          target: payload.name || settingsModal.id,
        });
        setSettingsMessage(`${payload.name || "Metode pembayaran"} berhasil diperbarui.`);
      } else {
        const method = createPaymentMethod(payload);
        addAuditLog({
          branchId: activeBranch.id,
          actor: currentUser.name,
          action: "settings.payment-method.create",
          target: method.name,
        });
        setSettingsMessage(`${method.name} berhasil ditambahkan.`);
      }

      setPaymentMethodForm(defaultPaymentMethodForm);
      setSettingsModal(null);
    },
    [
      activeBranch.id,
      addAuditLog,
      createPaymentMethod,
      currentUser.name,
      paymentMethodForm,
      settingsModal,
      updatePaymentMethod,
    ],
  );

  const submitMessageTemplateForm = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const payload = messageTemplateForm;

      if (settingsModal?.type === "template" && settingsModal.mode === "edit" && settingsModal.id) {
        updateMessageTemplate(settingsModal.id, payload);
        addAuditLog({
          branchId: activeBranch.id,
          actor: currentUser.name,
          action: "settings.message-template.update",
          target: payload.name || settingsModal.id,
        });
        setSettingsMessage(`${payload.name || "Template pesan"} berhasil diperbarui.`);
      } else {
        const template = createMessageTemplate(payload);
        addAuditLog({
          branchId: activeBranch.id,
          actor: currentUser.name,
          action: "settings.message-template.create",
          target: template.name,
        });
        setSettingsMessage(`${template.name} berhasil ditambahkan.`);
      }

      setMessageTemplateForm(defaultMessageTemplateForm);
      setSettingsModal(null);
    },
    [
      activeBranch.id,
      addAuditLog,
      createMessageTemplate,
      currentUser.name,
      messageTemplateForm,
      settingsModal,
      updateMessageTemplate,
    ],
  );

  const submitBranchForm = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const payload = branchForm;

      if (settingsModal?.type === "branch" && settingsModal.mode === "edit" && settingsModal.id) {
        updateBranch(settingsModal.id, payload);
        addAuditLog({
          branchId: activeBranch.id,
          actor: currentUser.name,
          action: "settings.branch.update",
          target: payload.name || settingsModal.id,
        });
        setSettingsMessage(`${payload.name || "Cabang"} berhasil diperbarui.`);
      } else {
        const branch = createBranch(payload);
        addAuditLog({
          branchId: activeBranch.id,
          actor: currentUser.name,
          action: "settings.branch.create",
          target: branch.name,
        });
        setSettingsMessage(`${branch.name} berhasil ditambahkan.`);
      }

      setBranchForm(defaultBranchForm);
      setSettingsModal(null);
    },
    [activeBranch.id, addAuditLog, branchForm, createBranch, currentUser.name, settingsModal, updateBranch],
  );

  const openCreateModal = React.useCallback((type: SettingsModalType) => {
    if (type === "branch") setBranchForm(defaultBranchForm);
    if (type === "membership") setMembershipPackageForm(defaultMembershipPackageForm);
    if (type === "pt") setPtPackageForm(defaultPtPackageForm);
    if (type === "payment") setPaymentMethodForm(defaultPaymentMethodForm);
    if (type === "template") setMessageTemplateForm(defaultMessageTemplateForm);
    if (type === "promo") setPromoForm(defaultPromoForm);
    setSettingsModal({ type, mode: "create" });
  }, []);

  const openEditBranchModal = React.useCallback((branch: (typeof branchSettings)[number]) => {
    setBranchForm({
      name: branch.name,
      code: branch.code,
      city: branch.city,
      address: branch.address,
    });
    setSettingsModal({ type: "branch", mode: "edit", id: branch.id });
  }, []);

  const openEditMembershipModal = React.useCallback((pkg: (typeof membershipPackageSettings)[number]) => {
    setMembershipPackageForm({
      name: pkg.name,
      duration: String(pkg.duration),
      price: String(pkg.price),
    });
    setSettingsModal({ type: "membership", mode: "edit", id: pkg.id });
  }, []);

  const openEditPtModal = React.useCallback((pkg: (typeof ptPackageSettings)[number]) => {
    setPtPackageForm({
      name: pkg.name,
      sessions: String(pkg.sessions),
      price: String(pkg.price),
    });
    setSettingsModal({ type: "pt", mode: "edit", id: pkg.id });
  }, []);

  const openEditPaymentModal = React.useCallback((method: (typeof paymentMethodSettings)[number]) => {
    setPaymentMethodForm({
      name: method.name,
      settlement: method.settlement,
      fee: method.fee,
    });
    setSettingsModal({ type: "payment", mode: "edit", id: method.id });
  }, []);

  const openEditTemplateModal = React.useCallback((template: (typeof messageTemplateSettings)[number]) => {
    setMessageTemplateForm({
      name: template.name,
      trigger: template.trigger,
      audience: template.audience,
      channel: template.channel,
    });
    setSettingsModal({ type: "template", mode: "edit", id: template.id });
  }, []);

  const openEditPromoModal = React.useCallback((promo: (typeof promoRows)[number]) => {
    setPromoForm({
      name: promo.name,
      code: promo.code,
      description: promo.description,
      discount: String(promo.discount),
      type: promo.type,
      maxUsage: String(promo.maxUsage),
      validUntil: promo.validUntil,
    });
    setSettingsModal({ type: "promo", mode: "edit", id: promo.id });
  }, []);

  const toggleAccessCell = React.useCallback((module: string, roleKey: AccessRoleKey) => {
    const nextRows = accessMatrixRows.map((row) =>
      row.module === module ? { ...row, [roleKey]: getNextAccessLevel(row[roleKey]) } : row,
    );
    const nextPermissions = buildPermissionsFromMatrix(nextRows, roleKey);

    setAccessMatrixRows(nextRows);
    setRolePermissionOverride(roleKey, nextPermissions);
    addAuditLog({
      branchId: activeBranch.id,
      actor: currentUser.name,
      action: "iam.matrix.update",
      target: `${module} / ${roleLabels[roleKey]} / ${nextPermissions.length} permissions`,
    });
    setAccessMessage(`Akses ${module} untuk ${roleLabels[roleKey]} diperbarui dan langsung memengaruhi permission runtime.`);
  }, [accessMatrixRows, activeBranch.id, addAuditLog, currentUser.name, setRolePermissionOverride]);

  const pageStats = [
    {
      label: "Revenue Bulan Ini",
      value: formatCurrency(branchSnapshot.revenue),
      helper: `${activeBranch.code} / transaksi selesai`,
      icon: <TrendingUpIcon className="h-5 w-5" />,
      tone: "emerald" as const,
    },
    {
      label: "Member Aktif",
      value: branchSnapshot.activeMembers.toLocaleString("id-ID"),
      helper: `${branchSnapshot.totalMembers} total member cabang`,
      icon: <MemberIcon className="h-5 w-5" />,
      tone: "sky" as const,
    },
    {
      label: "Check-In Hari Ini",
      value: branchSnapshot.checkInsToday.toLocaleString("id-ID"),
      helper: `${branchSnapshot.activeInGym} masih di area gym`,
      icon: <QrCodeIcon className="h-5 w-5" />,
      tone: "amber" as const,
    },
    {
      label: "Sesi PT",
      value: branchSnapshot.ptSessions.toLocaleString("id-ID"),
      helper: `${branchSnapshot.waitlist} kelas waiting list`,
      icon: <TrainerIcon className="h-5 w-5" />,
      tone: "rose" as const,
    },
  ];

  const renderMasterData = () => {
    const masterKey = slug.at(-1);

    if (masterKey === "members") {
      return (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <SectionPanel title="Master Member" subtitle="Pusat data identitas member. Status aktif/habis/freeze menjadi filter, bukan submenu terpisah.">
            <DataTable
              data={memberRows}
              getKey={(member) => member.id}
              columns={[
                {
                  header: "Member",
                  cell: (member) => (
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{member.name}</p>
                      <p className="text-xs text-gray-500">{member.email}</p>
                    </div>
                  ),
                },
                { header: "Paket", cell: (member) => member.membershipType },
                {
                  header: "Status",
                  cell: (member) => (
                    <StatusPill tone={member.membershipStatus === "active" ? "emerald" : member.membershipStatus === "frozen" ? "amber" : "rose"}>
                      {member.membershipStatus}
                    </StatusPill>
                  ),
                },
                { header: "Expired", cell: (member) => member.membershipEnd },
                { header: "Visit", cell: (member) => `${member.checkins}x` },
                { header: "Point", cell: (member) => member.points.toLocaleString("id-ID") },
              ]}
            />
          </SectionPanel>
          <SectionPanel title="Acuan Member" subtitle="Master member dipakai oleh check-in, membership, POS, loyalty, dan laporan.">
            <div className="space-y-3">
              {["Data profil & kontak", "Status membership", "Branch access", "Referral code", "Body profile"].map((item) => (
                <div key={item} className="rounded-lg bg-gray-50 p-3 text-sm text-gray-700 dark:bg-gray-800/60 dark:text-gray-300">
                  {item}
                </div>
              ))}
            </div>
          </SectionPanel>
        </div>
      );
    }

    if (masterKey === "membership-packages") {
      return (
        <SectionPanel title="Master Paket Membership" subtitle="Acuan paket yang dipakai registrasi, renewal, upgrade, dan POS.">
          <DataTable
            data={membershipPackageSettings}
            getKey={(pkg) => pkg.id}
            columns={[
              { header: "Kode", cell: (pkg) => <span className="font-mono text-xs">{pkg.id}</span> },
              { header: "Nama Paket", cell: (pkg) => <span className="font-medium text-gray-900 dark:text-white">{pkg.name}</span> },
              { header: "Durasi", cell: (pkg) => `${pkg.duration} bulan` },
              { header: "Harga", cell: (pkg) => formatCurrency(pkg.price) },
              {
                header: "Status",
                cell: (pkg) => (
                  <StatusPill tone={pkg.status === "active" ? "emerald" : "slate"}>
                    {pkg.status}
                  </StatusPill>
                ),
              },
              { header: "Scope", cell: () => <StatusPill tone="sky">Branch scoped</StatusPill> },
            ]}
          />
        </SectionPanel>
      );
    }

    if (masterKey === "pt-packages") {
      return (
        <SectionPanel title="Master Paket PT" subtitle="Acuan paket personal trainer yang bisa dijual dari POS atau booking.">
          <DataTable
            data={ptPackageSettings}
            getKey={(pkg) => pkg.id}
            columns={[
              { header: "Kode", cell: (pkg) => <span className="font-mono text-xs">{pkg.id}</span> },
              { header: "Nama Paket", cell: (pkg) => <span className="font-medium text-gray-900 dark:text-white">{pkg.name}</span> },
              { header: "Jumlah Sesi", cell: (pkg) => `${pkg.sessions} sesi` },
              { header: "Harga", cell: (pkg) => formatCurrency(pkg.price) },
              {
                header: "Status",
                cell: (pkg) => (
                  <StatusPill tone={pkg.status === "active" ? "emerald" : "slate"}>
                    {pkg.status}
                  </StatusPill>
                ),
              },
            ]}
          />
        </SectionPanel>
      );
    }

    if (masterKey === "trainers") {
      return (
        <SectionPanel title="Master Personal Trainer" subtitle="Data trainer sebagai acuan booking PT, client handling, komisi, dan laporan.">
          <DataTable
            data={trainerRows}
            getKey={(trainer) => trainer.id}
            columns={[
              {
                header: "Trainer",
                cell: (trainer) => (
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{trainer.name}</p>
                    <p className="text-xs text-gray-500">{trainer.email}</p>
                  </div>
                ),
              },
              { header: "Spesialisasi", cell: (trainer) => trainer.specializations.slice(0, 2).join(", ") },
              { header: "Rate", cell: (trainer) => formatCurrency(trainer.hourlyRate) },
              { header: "Client", cell: (trainer) => `${trainer.activeClients}/${trainer.totalClients}` },
              { header: "Target", cell: (trainer) => `${trainer.currentSessions}/${trainer.monthlyTarget}` },
              { header: "Rating", cell: (trainer) => trainer.rating },
              {
                header: "Status",
                cell: (trainer) => (
                  <StatusPill tone={trainer.status === "active" ? "emerald" : "amber"}>
                    {trainer.status}
                  </StatusPill>
                ),
              },
            ]}
          />
        </SectionPanel>
      );
    }

    if (masterKey === "classes") {
      return (
        <SectionPanel title="Master Kelas" subtitle="Acuan kelas, jadwal dasar, kapasitas, dan trainer sebelum dipakai booking.">
          <DataTable
            data={gymClassRows}
            getKey={(gymClass) => gymClass.id}
            columns={[
              { header: "Kelas", cell: (gymClass) => <span className="font-medium text-gray-900 dark:text-white">{gymClass.name}</span> },
              { header: "Kategori", cell: (gymClass) => gymClass.category },
              { header: "Durasi", cell: (gymClass) => `${gymClass.duration} menit` },
              { header: "Jadwal", cell: (gymClass) => gymClass.schedule.map((item) => `${item.day} ${item.time}`).join(", ") },
              { header: "Kapasitas", cell: (gymClass) => `${gymClass.currentParticipants}/${gymClass.maxParticipants}` },
              {
                header: "Status",
                cell: (gymClass) => (
                  <StatusPill tone={gymClass.status === "full" ? "amber" : "emerald"}>
                    {gymClass.status}
                  </StatusPill>
                ),
              },
            ]}
          />
        </SectionPanel>
      );
    }

    if (masterKey === "products") {
      return (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <SectionPanel title="Master Produk" subtitle="Produk dan layanan yang dipakai POS serta stok cabang.">
            <DataTable
              data={branchSnapshot.scopedInventory}
              getKey={(item) => item.id}
              columns={[
                {
                  header: "Produk",
                  cell: (item) => (
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                      <p className="font-mono text-xs text-gray-500">{item.sku}</p>
                    </div>
                  ),
                },
                { header: "Kategori", cell: (item) => item.category },
                { header: "Harga", cell: (item) => formatCurrency(item.price) },
                { header: "Min. Stok", cell: (item) => item.minStock },
                {
                  header: "Status",
                  cell: (item) => (
                    <StatusPill tone={item.reorderStatus === "needs-restock" ? "amber" : "emerald"}>
                      {item.reorderStatus}
                    </StatusPill>
                  ),
                },
              ]}
            />
          </SectionPanel>
          <SectionPanel title="Kategori Acuan" subtitle="Kategori dipakai untuk filter POS, stok, dan laporan produk.">
            <div className="space-y-3">
              {["Supplement", "Merchandise", "Consumable", "Equipment", "Service / Layanan"].map((category) => (
                <div key={category} className="rounded-lg bg-gray-50 p-3 text-sm text-gray-700 dark:bg-gray-800/60 dark:text-gray-300">
                  {category}
                </div>
              ))}
            </div>
          </SectionPanel>
        </div>
      );
    }

    if (masterKey === "equipment") {
      return (
        <SectionPanel title="Master Alat Gym" subtitle="Data alat sebagai acuan tiket maintenance, histori kerusakan, dan reminder servis.">
          <DataTable
            data={equipmentRows}
            getKey={(item) => item.id}
            columns={[
              { header: "Kode", cell: (item) => <span className="font-mono text-xs">{item.id}</span> },
              { header: "Alat", cell: (item) => <span className="font-medium text-gray-900 dark:text-white">{item.equipmentName}</span> },
              { header: "Lokasi", cell: (item) => item.location },
              { header: "Next Check", cell: (item) => item.nextCheck },
              {
                header: "Status",
                cell: (item) => (
                  <StatusPill tone={item.status === "ok" ? "emerald" : "amber"}>{item.status}</StatusPill>
                ),
              },
            ]}
          />
        </SectionPanel>
      );
    }

    if (masterKey === "suppliers") {
      return (
        <SectionPanel title="Master Supplier" subtitle="Acuan supplier untuk restock produk dan service alat.">
          <DataTable
            data={supplierRows}
            getKey={(supplier) => supplier.id}
            columns={[
              { header: "Kode", cell: (supplier) => <span className="font-mono text-xs">{supplier.id}</span> },
              { header: "Supplier", cell: (supplier) => <span className="font-medium text-gray-900 dark:text-white">{supplier.name}</span> },
              { header: "Kategori", cell: (supplier) => supplier.category },
              { header: "SLA", cell: (supplier) => supplier.sla },
              {
                header: "Status",
                cell: (supplier) => (
                  <StatusPill tone={supplier.status === "aktif" ? "emerald" : supplier.status === "maintenance" ? "sky" : "slate"}>
                    {supplier.status}
                  </StatusPill>
                ),
              },
            ]}
          />
        </SectionPanel>
      );
    }

    if (masterKey === "branches") {
      return (
        <SectionPanel title="Master Cabang & Area" subtitle="Acuan branch untuk akses user, transaksi, laporan, dan stok cabang.">
          <DataTable
            data={branchSettings}
            getKey={(branch) => branch.id}
            columns={[
              { header: "Kode", cell: (branch) => <span className="font-mono text-xs">{branch.code}</span> },
              { header: "Cabang", cell: (branch) => <span className="font-medium text-gray-900 dark:text-white">{branch.name}</span> },
              { header: "Kota", cell: (branch) => branch.city },
              { header: "Alamat", cell: (branch) => branch.address },
              {
                header: "Status",
                cell: (branch) => (
                  <StatusPill tone={branch.status === "active" ? "emerald" : "amber"}>
                    {branch.status}
                  </StatusPill>
                ),
              },
            ]}
          />
        </SectionPanel>
      );
    }

    return (
      <div className="grid gap-6 xl:grid-cols-3">
        <SectionPanel title="Master Member" subtitle="Data utama member, membership, dan status akses cabang.">
          <div className="space-y-3">
            {branchSnapshot.scopedMembers.slice(0, 4).map((member) => (
              <div key={member.id} className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800/60">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{member.name}</p>
                  <p className="text-sm text-gray-500">{member.membershipType}</p>
                </div>
                <StatusPill tone={member.membershipStatus === "active" ? "emerald" : "amber"}>
                  {member.membershipStatus}
                </StatusPill>
              </div>
            ))}
          </div>
        </SectionPanel>
        <SectionPanel title="Master Kelas" subtitle="Definisi kelas, trainer, kapasitas, dan ruangan.">
          <div className="space-y-3">
            {branchSnapshot.scopedClasses.map((gymClass) => (
              <div key={gymClass.id} className="rounded-lg border border-gray-200 p-3 dark:border-gray-800">
                <p className="font-medium text-gray-900 dark:text-white">{gymClass.name}</p>
                <p className="mt-1 text-sm text-gray-500">
                  {gymClass.room} / {gymClass.currentParticipants}-{gymClass.maxParticipants} peserta
                </p>
              </div>
            ))}
          </div>
        </SectionPanel>
        <SectionPanel title="Master Produk" subtitle="Produk, layanan, SKU, dan harga dasar.">
          <div className="space-y-3">
            {branchSnapshot.scopedInventory.slice(0, 5).map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800/60">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.sku}</p>
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(item.price)}
                </p>
              </div>
            ))}
          </div>
        </SectionPanel>
      </div>
    );
  };

  const renderSettings = () => {
    const settingsKey = slug.at(-1);
    const renderSettingsTableToolbar = (label: string, onClick: () => void) => (
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {settingsMessage ? (
          <p className="text-sm text-emerald-600 dark:text-emerald-400">{settingsMessage}</p>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">Kelola data acuan prototype.</p>
        )}
        <PrimaryToolbarButton onClick={onClick} disabled={!canManageSettings}>{label}</PrimaryToolbarButton>
      </div>
    );

    const settingsBackButton = (path: string, label = "Kembali") => (
      <button
        type="button"
        onClick={() => router.push(path)}
        className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-200 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300"
      >
        {label}
      </button>
    );

    if (slug[1] === "branches" && slug[2]) {
      const branchId = decodeURIComponent(slug[2]);
      const branch = branchSettings.find((item) => item.id === branchId);
      const branchMembersForDetail = memberRows.filter((member) => {
        const access = memberBranchAccess.find((item) => item.memberId === member.id);
        return access?.homeBranchId === branchId;
      });
      const branchMemberCount = branchMembersForDetail.length;
      const branchStaffCount = staffUserRows.filter((user) => user.branchAccess.includes(branchId)).length;

      if (!branch) {
        return (
          <SectionPanel title="Cabang Tidak Ditemukan" subtitle="Data cabang tidak ada di prototype.">
            {settingsBackButton("/settings/branches", "Kembali ke Cabang")}
          </SectionPanel>
        );
      }

      return (
        <div className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {settingsBackButton("/settings/branches")}
            <button
              type="button"
              onClick={() => openEditBranchModal(branch)}
              disabled={!canManageSettings}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Edit Cabang
            </button>
          </div>
          <SectionPanel title={branch.name} subtitle={`${branch.code} / ${branch.city}`}>
            <div className="grid gap-4 md:grid-cols-4">
              <StatCard label="Status" value={branch.status} helper="Status operasional" icon={<SettingsIcon className="h-5 w-5" />} tone={branch.status === "active" ? "emerald" : "amber"} />
              <StatCard label="Member" value={String(branchMemberCount)} helper="Home branch member" icon={<MemberIcon className="h-5 w-5" />} tone="sky" />
              <StatCard label="Staff" value={String(branchStaffCount)} helper="Punya akses cabang" icon={<ShieldIcon className="h-5 w-5" />} tone="slate" />
              <StatCard label="Alamat" value={branch.city} helper={branch.address} icon={<ReportIcon className="h-5 w-5" />} tone="emerald" />
            </div>
          </SectionPanel>
          <div className="grid gap-6 xl:grid-cols-2">
            <SectionPanel title="Member Cabang" subtitle="Member dengan home branch ini.">
              <DataTable
                data={branchMembersForDetail.slice(0, 8)}
                getKey={(member) => member.id}
                columns={[
                  { header: "Member", cell: (member) => member.name },
                  { header: "Membership", cell: (member) => member.membershipType },
                  { header: "Status", cell: (member) => <StatusPill tone={member.membershipStatus === "active" ? "emerald" : "amber"}>{member.membershipStatus}</StatusPill> },
                ]}
              />
            </SectionPanel>
            <SectionPanel title="User Akses" subtitle="User/staff yang bisa melihat cabang ini.">
              <DataTable
                data={staffUserRows.filter((user) => user.branchAccess.includes(branchId))}
                getKey={(user) => user.id}
                columns={[
                  { header: "User", cell: (user) => user.name },
                  { header: "Role", cell: (user) => roleRows.find((role) => role.id === user.role)?.name ?? user.role },
                  { header: "Email", cell: (user) => user.email },
                ]}
              />
            </SectionPanel>
          </div>
        </div>
      );
    }

    if (slug[1] === "membership-packages" && slug[2]) {
      const packageId = decodeURIComponent(slug[2]);
      const pkg = membershipPackageSettings.find((item) => item.id === packageId);
      const relatedMembers = memberRows.filter((member) => pkg && member.membershipType === pkg.name.split(" - ")[0]);

      if (!pkg) {
        return (
          <SectionPanel title="Paket Tidak Ditemukan" subtitle="Paket membership tidak ada di prototype.">
            {settingsBackButton("/settings/membership-packages", "Kembali ke Paket")}
          </SectionPanel>
        );
      }

      return (
        <div className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {settingsBackButton("/settings/membership-packages")}
            <button
              type="button"
              onClick={() => openEditMembershipModal(pkg)}
              disabled={!canManageSettings}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Edit Paket
            </button>
          </div>
          <SectionPanel title={pkg.name} subtitle="Detail acuan membership untuk POS, renewal, dan tambah member.">
            <div className="grid gap-4 md:grid-cols-4">
              <StatCard label="Harga" value={formatCurrency(pkg.price)} helper="Nominal jual" icon={<CreditCardIcon className="h-5 w-5" />} tone="emerald" />
              <StatCard label="Durasi" value={`${pkg.duration} bulan`} helper="Masa aktif" icon={<ClockIcon className="h-5 w-5" />} tone="sky" />
              <StatCard label="Per Bulan" value={formatCurrency(Math.round(pkg.price / pkg.duration))} helper="Estimasi rata-rata" icon={<TrendingUpIcon className="h-5 w-5" />} tone="amber" />
              <StatCard label="Status" value={pkg.status} helper="Acuan aktif/nonaktif" icon={<CheckSmallIcon className="h-5 w-5" />} tone={pkg.status === "active" ? "emerald" : "slate"} />
            </div>
          </SectionPanel>
          <SectionPanel title="Member Terkait" subtitle="Simulasi member dengan tipe membership yang sama.">
            <DataTable
              data={relatedMembers.slice(0, 10)}
              getKey={(member) => member.id}
              columns={[
                { header: "Member", cell: (member) => member.name },
                { header: "Status", cell: (member) => <StatusPill tone={member.membershipStatus === "active" ? "emerald" : "amber"}>{member.membershipStatus}</StatusPill> },
                { header: "Expired", cell: (member) => member.membershipEnd },
              ]}
            />
          </SectionPanel>
        </div>
      );
    }

    if (slug[1] === "pt-packages" && slug[2]) {
      const packageId = decodeURIComponent(slug[2]);
      const pkg = ptPackageSettings.find((item) => item.id === packageId);
      const activeSessions = branchSnapshot.scopedPtSessions.filter((session) => session.status !== "cancelled");

      if (!pkg) {
        return (
          <SectionPanel title="Paket PT Tidak Ditemukan" subtitle="Paket PT tidak ada di prototype.">
            {settingsBackButton("/settings/pt-packages", "Kembali ke Paket PT")}
          </SectionPanel>
        );
      }

      return (
        <div className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {settingsBackButton("/settings/pt-packages")}
            <button
              type="button"
              onClick={() => openEditPtModal(pkg)}
              disabled={!canManageSettings}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Edit Paket PT
            </button>
          </div>
          <SectionPanel title={pkg.name} subtitle="Detail acuan paket PT untuk POS dan booking.">
            <div className="grid gap-4 md:grid-cols-4">
              <StatCard label="Harga" value={formatCurrency(pkg.price)} helper="Nominal jual" icon={<CreditCardIcon className="h-5 w-5" />} tone="emerald" />
              <StatCard label="Sesi" value={`${pkg.sessions}x`} helper="Jumlah sesi" icon={<TrainerIcon className="h-5 w-5" />} tone="sky" />
              <StatCard label="Harga/Sesi" value={formatCurrency(Math.round(pkg.price / pkg.sessions))} helper="Rata-rata sesi" icon={<TrendingUpIcon className="h-5 w-5" />} tone="amber" />
              <StatCard label="Status" value={pkg.status} helper="Acuan aktif/nonaktif" icon={<CheckSmallIcon className="h-5 w-5" />} tone={pkg.status === "active" ? "emerald" : "slate"} />
            </div>
          </SectionPanel>
          <SectionPanel title="Sesi PT Aktif" subtitle="Contoh sesi PT yang memakai acuan paket personal training.">
            <DataTable
              data={activeSessions.slice(0, 8)}
              getKey={(session) => session.id}
              columns={[
                { header: "Member", cell: (session) => session.memberName },
                { header: "Trainer", cell: (session) => trainerRows.find((trainer) => trainer.id === session.trainerId)?.name ?? session.trainerId },
                { header: "Jadwal", cell: (session) => `${session.date} ${session.time}` },
                { header: "Status", cell: (session) => <StatusPill tone={session.status === "completed" ? "emerald" : "sky"}>{session.status}</StatusPill> },
              ]}
            />
          </SectionPanel>
        </div>
      );
    }

    if (slug[1] === "payment-methods" && slug[2]) {
      const methodId = decodeURIComponent(slug[2]);
      const method = paymentMethodSettings.find((item) => item.id === methodId);

      if (!method) {
        return (
          <SectionPanel title="Metode Tidak Ditemukan" subtitle="Metode pembayaran tidak ada di prototype.">
            {settingsBackButton("/settings/payment-methods", "Kembali ke Metode")}
          </SectionPanel>
        );
      }

      const methodToken = method.id.includes("CASH")
        ? "cash"
        : method.id.includes("QRIS")
        ? "qris"
        : method.id.includes("TRF")
        ? "transfer"
        : method.name.toLowerCase().split(" ")[0] ?? "";
      const relatedTransactions = branchSnapshot.scopedTransactions.filter((transaction) =>
        transaction.paymentMethod.toLowerCase().includes(methodToken),
      );

      return (
        <div className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {settingsBackButton("/settings/payment-methods")}
            <button
              type="button"
              onClick={() => openEditPaymentModal(method)}
              disabled={!canManageSettings}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Edit Metode
            </button>
          </div>
          <SectionPanel title={method.name} subtitle="Detail metode pembayaran untuk invoice, POS, split payment, dan laporan.">
            <div className="grid gap-4 md:grid-cols-4">
              <StatCard label="Settlement" value={method.settlement} helper="Waktu rekonsiliasi" icon={<ClockIcon className="h-5 w-5" />} tone="sky" />
              <StatCard label="Fee" value={method.fee} helper="Biaya transaksi" icon={<CreditCardIcon className="h-5 w-5" />} tone="amber" />
              <StatCard label="Status" value={method.status} helper="Muncul di POS jika active" icon={<CheckSmallIcon className="h-5 w-5" />} tone={method.status === "active" ? "emerald" : "slate"} />
              <StatCard label="Transaksi" value={String(relatedTransactions.length)} helper="Match metode dummy" icon={<CashRegisterIcon className="h-5 w-5" />} tone="emerald" />
            </div>
          </SectionPanel>
          <SectionPanel title="Transaksi Terkait" subtitle="Contoh transaksi dengan metode pembayaran ini.">
            <DataTable
              data={relatedTransactions.slice(0, 10)}
              getKey={(transaction) => transaction.id}
              columns={[
                { header: "Invoice", cell: (transaction) => <span className="font-mono text-xs">{transaction.id}</span> },
                { header: "Member", cell: (transaction) => transaction.memberName },
                { header: "Nominal", cell: (transaction) => formatCurrency(transaction.amount) },
                { header: "Status", cell: (transaction) => <StatusPill tone={transaction.status === "completed" ? "emerald" : transaction.status === "pending" ? "amber" : "rose"}>{transaction.status}</StatusPill> },
              ]}
            />
          </SectionPanel>
        </div>
      );
    }

    if (slug[1] === "templates" && slug[2]) {
      const templateId = decodeURIComponent(slug[2]);
      const template = messageTemplateSettings.find((item) => item.id === templateId);
      const relatedMessages = whatsappMessages.filter((message) => message.template === template?.trigger || message.template === template?.id);

      if (!template) {
        return (
          <SectionPanel title="Template Tidak Ditemukan" subtitle="Template pesan tidak ada di prototype.">
            {settingsBackButton("/settings/templates", "Kembali ke Template")}
          </SectionPanel>
        );
      }

      return (
        <div className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {settingsBackButton("/settings/templates")}
            <button
              type="button"
              onClick={() => openEditTemplateModal(template)}
              disabled={!canManageSettings}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Edit Template
            </button>
          </div>
          <SectionPanel title={template.name} subtitle="Detail template pesan untuk automation dan broadcast.">
            <div className="grid gap-4 md:grid-cols-4">
              <StatCard label="Trigger" value={template.trigger} helper="Event pengirim" icon={<WhatsAppIcon className="h-5 w-5" />} tone="emerald" />
              <StatCard label="Audience" value={template.audience} helper="Target pesan" icon={<MemberIcon className="h-5 w-5" />} tone="sky" />
              <StatCard label="Channel" value={template.channel} helper="Media pengiriman" icon={<SendIcon className="h-5 w-5" />} tone="amber" />
              <StatCard label="Status" value={template.status} helper="Aktif/draft/nonaktif" icon={<CheckSmallIcon className="h-5 w-5" />} tone={template.status === "active" ? "emerald" : "slate"} />
            </div>
          </SectionPanel>
          <SectionPanel title="Queue Terkait" subtitle="Pesan WhatsApp yang memakai template ini.">
            <DataTable
              data={relatedMessages}
              getKey={(message) => message.id}
              columns={[
                { header: "Queue", cell: (message) => <span className="font-mono text-xs">{message.id}</span> },
                { header: "Penerima", cell: (message) => message.recipient },
                { header: "Jadwal", cell: (message) => message.scheduledAt },
                { header: "Status", cell: (message) => <StatusPill tone={message.status === "sent" ? "emerald" : message.status === "retrying" ? "amber" : "sky"}>{message.status}</StatusPill> },
              ]}
            />
          </SectionPanel>
        </div>
      );
    }

    if (settingsKey === "profile") {
      return (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <SectionPanel title="Identitas Gym" subtitle="Data brand utama yang dipakai invoice, kartu member, dan portal.">
            <div className="rounded-xl bg-gray-900 p-5 text-white">
              <div className="flex items-center justify-between">
                <DumbbellIcon className="h-8 w-8 text-emerald-400" />
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs">HQ</span>
              </div>
              <p className="mt-8 text-2xl font-semibold">Seven Gym</p>
              <p className="mt-1 text-sm text-gray-300">Gym management prototype / multi cabang</p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/60">
                <p className="text-xs text-gray-500">Cabang</p>
                <p className="font-semibold text-gray-900 dark:text-white">{branchSettings.length}</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/60">
                <p className="text-xs text-gray-500">Aktif</p>
                <p className="font-semibold text-gray-900 dark:text-white">{activeBranch.code}</p>
              </div>
            </div>
          </SectionPanel>
          <SectionPanel title="Kontak & Legal" subtitle="Informasi yang tampil di invoice dan pesan resmi.">
            <div className="space-y-3">
              {[
                ["Email", "hello@sevengym.id"],
                ["Telepon", "+62 811 7777 0001"],
                ["NPWP", "09.777.777.7-777.000"],
                ["Alamat HQ", "Jakarta Selatan"],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800/60">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{value}</span>
                </div>
              ))}
            </div>
          </SectionPanel>
          <SectionPanel title="Cabang Terhubung" subtitle="Company tetap satu, branch mengikuti akses user login.">
            <div className="space-y-3">
              {branchSettings.map((branch) => (
                <div key={branch.id} className="rounded-lg border border-gray-200 p-3 dark:border-gray-800">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{branch.name}</p>
                      <p className="text-sm text-gray-500">{branch.city}</p>
                    </div>
                    <StatusPill tone={branch.id === activeBranch.id ? "emerald" : "slate"}>
                      {branch.code}
                    </StatusPill>
                  </div>
                </div>
              ))}
            </div>
          </SectionPanel>
        </div>
      );
    }

    if (settingsKey === "branches") {
      return (
        <div className="space-y-4">
          <SectionPanel title="Cabang" subtitle="Cabang gym dalam satu company. Akses cabang mengikuti user yang login.">
            {renderSettingsTableToolbar("Tambah Cabang", () => openCreateModal("branch"))}
            <DataTable
              data={branchSettings}
              getKey={(branch) => branch.id}
              columns={[
                { header: "Kode", cell: (branch) => <span className="font-mono text-xs">{branch.code}</span> },
                { header: "Nama Cabang", cell: (branch) => <span className="font-medium text-gray-900 dark:text-white">{branch.name}</span> },
                { header: "Kota", cell: (branch) => branch.city },
                { header: "Alamat", cell: (branch) => branch.address },
                {
                  header: "Status",
                  cell: (branch) => (
                    <StatusPill tone={branch.status === "active" ? "emerald" : "amber"}>
                      {branch.status}
                    </StatusPill>
                  ),
                },
                {
                  header: "Akses",
                  cell: (branch) => (
                    <StatusPill tone={currentUser.branchAccess.includes(branch.id) ? "sky" : "slate"}>
                      {currentUser.branchAccess.includes(branch.id) ? "Diizinkan" : "Terkunci"}
                    </StatusPill>
                  ),
                },
                {
                  header: "Aksi",
                  cell: (branch) => (
                    <div className="flex gap-2">
                      <TableActionIconButton
                        label="Detail cabang"
                        icon={<EyeIcon />}
                        onClick={() => router.push(`/settings/branches/${encodeURIComponent(branch.id)}`)}
                        variant="info"
                      />
                      <TableActionIconButton
                        label="Edit cabang"
                        icon={<PencilIcon />}
                        onClick={() => openEditBranchModal(branch)}
                        disabled={!canManageSettings}
                        variant="edit"
                      />
                      <TableActionIconButton
                        label={branch.status === "active" ? "Ubah ke maintenance" : "Aktifkan cabang"}
                        icon={<PowerIcon />}
                        onClick={() => {
                          toggleBranchStatus(branch.id);
                          addAuditLog({
                            branchId: activeBranch.id,
                            actor: currentUser.name,
                            action: "settings.branch.status",
                            target: branch.name,
                          });
                        }}
                        disabled={!canManageSettings}
                        variant={branch.status === "active" ? "warning" : "success"}
                      />
                      <TableActionIconButton
                        label="Hapus cabang"
                        icon={<TrashIcon />}
                        onClick={() =>
                          requestDelete({
                            title: "Hapus Cabang",
                            message: "Cabang akan dihapus dari data prototype.",
                            target: branch.name,
                            onConfirm: () => {
                              deleteBranch(branch.id);
                              addAuditLog({
                                branchId: activeBranch.id,
                                actor: currentUser.name,
                                action: "settings.branch.delete",
                                target: branch.name,
                              });
                            },
                          })
                        }
                        disabled={!canManageSettings}
                        variant="delete"
                      />
                    </div>
                  ),
                },
              ]}
            />
          </SectionPanel>
        </div>
      );
    }

    if (settingsKey === "membership-packages") {
      return (
        <div className="space-y-4">
          <SectionPanel title="Paket Membership" subtitle="Acuan paket membership yang dipakai saat tambah member, renewal, upgrade, dan POS.">
            {renderSettingsTableToolbar("Tambah Paket", () => openCreateModal("membership"))}
            <DataTable
              data={membershipPackageSettings}
              getKey={(pkg) => pkg.id}
              columns={[
                { header: "Kode", cell: (pkg) => <span className="font-mono text-xs">{pkg.id}</span> },
                { header: "Nama Paket", cell: (pkg) => <span className="font-medium text-gray-900 dark:text-white">{pkg.name}</span> },
                { header: "Durasi", cell: (pkg) => `${pkg.duration} bulan` },
                { header: "Harga", cell: (pkg) => formatCurrency(pkg.price) },
                { header: "Status", cell: (pkg) => <StatusPill tone={pkg.status === "active" ? "emerald" : "slate"}>{pkg.status}</StatusPill> },
                {
                  header: "Aksi",
                  cell: (pkg) => (
                    <div className="flex gap-2">
                      <TableActionIconButton
                        label="Detail paket membership"
                        icon={<EyeIcon />}
                        onClick={() => router.push(`/settings/membership-packages/${encodeURIComponent(pkg.id)}`)}
                        variant="info"
                      />
                      <TableActionIconButton
                        label="Edit paket membership"
                        icon={<PencilIcon />}
                        onClick={() => openEditMembershipModal(pkg)}
                        disabled={!canManageSettings}
                        variant="edit"
                      />
                      <TableActionIconButton
                        label={pkg.status === "active" ? "Nonaktifkan paket" : "Aktifkan paket"}
                        icon={<PowerIcon />}
                        onClick={() => {
                          toggleMembershipPackageStatus(pkg.id);
                          addAuditLog({
                            branchId: activeBranch.id,
                            actor: currentUser.name,
                            action: "settings.membership-package.status",
                            target: pkg.name,
                          });
                        }}
                        disabled={!canManageSettings}
                        variant={pkg.status === "active" ? "warning" : "success"}
                      />
                      <TableActionIconButton
                        label="Hapus paket membership"
                        icon={<TrashIcon />}
                        onClick={() =>
                          requestDelete({
                            title: "Hapus Paket Membership",
                            message: "Paket membership akan dihapus dari acuan POS dan renewal prototype.",
                            target: pkg.name,
                            onConfirm: () => {
                              deleteMembershipPackage(pkg.id);
                              addAuditLog({
                                branchId: activeBranch.id,
                                actor: currentUser.name,
                                action: "settings.membership-package.delete",
                                target: pkg.name,
                              });
                            },
                          })
                        }
                        disabled={!canManageSettings}
                        variant="delete"
                      />
                    </div>
                  ),
                },
              ]}
            />
          </SectionPanel>
        </div>
      );
    }

    if (settingsKey === "pt-packages") {
      return (
        <div className="space-y-4">
          <SectionPanel title="Paket PT" subtitle="Acuan paket personal trainer yang dijual dari kasir dan booking PT.">
            {renderSettingsTableToolbar("Tambah Paket PT", () => openCreateModal("pt"))}
            <DataTable
              data={ptPackageSettings}
              getKey={(pkg) => pkg.id}
              columns={[
                { header: "Kode", cell: (pkg) => <span className="font-mono text-xs">{pkg.id}</span> },
                { header: "Nama Paket", cell: (pkg) => <span className="font-medium text-gray-900 dark:text-white">{pkg.name}</span> },
                { header: "Jumlah Sesi", cell: (pkg) => `${pkg.sessions} sesi` },
                { header: "Harga", cell: (pkg) => formatCurrency(pkg.price) },
                { header: "Harga / Sesi", cell: (pkg) => formatCurrency(Math.round(pkg.price / pkg.sessions)) },
                { header: "Status", cell: (pkg) => <StatusPill tone={pkg.status === "active" ? "emerald" : "slate"}>{pkg.status}</StatusPill> },
                {
                  header: "Aksi",
                  cell: (pkg) => (
                    <div className="flex gap-2">
                      <TableActionIconButton
                        label="Detail paket PT"
                        icon={<EyeIcon />}
                        onClick={() => router.push(`/settings/pt-packages/${encodeURIComponent(pkg.id)}`)}
                        variant="info"
                      />
                      <TableActionIconButton
                        label="Edit paket PT"
                        icon={<PencilIcon />}
                        onClick={() => openEditPtModal(pkg)}
                        disabled={!canManageSettings}
                        variant="edit"
                      />
                      <TableActionIconButton
                        label={pkg.status === "active" ? "Nonaktifkan paket PT" : "Aktifkan paket PT"}
                        icon={<PowerIcon />}
                        onClick={() => {
                          togglePtPackageStatus(pkg.id);
                          addAuditLog({
                            branchId: activeBranch.id,
                            actor: currentUser.name,
                            action: "settings.pt-package.status",
                            target: pkg.name,
                          });
                        }}
                        disabled={!canManageSettings}
                        variant={pkg.status === "active" ? "warning" : "success"}
                      />
                      <TableActionIconButton
                        label="Hapus paket PT"
                        icon={<TrashIcon />}
                        onClick={() =>
                          requestDelete({
                            title: "Hapus Paket PT",
                            message: "Paket PT akan dihapus dari acuan POS dan booking prototype.",
                            target: pkg.name,
                            onConfirm: () => {
                              deletePtPackage(pkg.id);
                              addAuditLog({
                                branchId: activeBranch.id,
                                actor: currentUser.name,
                                action: "settings.pt-package.delete",
                                target: pkg.name,
                              });
                            },
                          })
                        }
                        disabled={!canManageSettings}
                        variant="delete"
                      />
                    </div>
                  ),
                },
              ]}
            />
          </SectionPanel>
        </div>
      );
    }

    if (settingsKey === "payment-methods") {
      return (
        <div className="space-y-4">
          <SectionPanel title="Metode Pembayaran" subtitle="Acuan metode pembayaran untuk invoice, POS, dan laporan kas.">
            {renderSettingsTableToolbar("Tambah Metode", () => openCreateModal("payment"))}
            <DataTable
              data={paymentMethodSettings}
              getKey={(method) => method.id}
              columns={[
                { header: "Kode", cell: (method) => <span className="font-mono text-xs">{method.id}</span> },
                { header: "Metode", cell: (method) => <span className="font-medium text-gray-900 dark:text-white">{method.name}</span> },
                { header: "Settlement", cell: (method) => method.settlement },
                { header: "Biaya", cell: (method) => method.fee },
                { header: "Status", cell: (method) => <StatusPill tone={method.status === "active" ? "emerald" : method.status === "draft" ? "amber" : "slate"}>{method.status}</StatusPill> },
                {
                  header: "Aksi",
                  cell: (method) => (
                    <div className="flex gap-2">
                      <TableActionIconButton
                        label="Detail metode pembayaran"
                        icon={<EyeIcon />}
                        onClick={() => router.push(`/settings/payment-methods/${encodeURIComponent(method.id)}`)}
                        variant="info"
                      />
                      <TableActionIconButton
                        label="Edit metode pembayaran"
                        icon={<PencilIcon />}
                        onClick={() => openEditPaymentModal(method)}
                        disabled={!canManageSettings}
                        variant="edit"
                      />
                      <TableActionIconButton
                        label={method.status === "active" ? "Nonaktifkan metode" : "Aktifkan metode"}
                        icon={<PowerIcon />}
                        onClick={() => {
                          togglePaymentMethodStatus(method.id);
                          addAuditLog({
                            branchId: activeBranch.id,
                            actor: currentUser.name,
                            action: "settings.payment-method.status",
                            target: method.name,
                          });
                        }}
                        disabled={!canManageSettings}
                        variant={method.status === "active" ? "warning" : "success"}
                      />
                      <TableActionIconButton
                        label="Hapus metode pembayaran"
                        icon={<TrashIcon />}
                        onClick={() =>
                          requestDelete({
                            title: "Hapus Metode Pembayaran",
                            message: "Metode pembayaran akan dihapus dari konfigurasi prototype.",
                            target: method.name,
                            onConfirm: () => {
                              deletePaymentMethod(method.id);
                              addAuditLog({
                                branchId: activeBranch.id,
                                actor: currentUser.name,
                                action: "settings.payment-method.delete",
                                target: method.name,
                              });
                            },
                          })
                        }
                        disabled={!canManageSettings}
                        variant="delete"
                      />
                    </div>
                  ),
                },
              ]}
            />
          </SectionPanel>
        </div>
      );
    }

    if (settingsKey === "operations") {
      return (
        <div className="grid gap-6 xl:grid-cols-3">
          <SectionPanel title="Jam Operasional" subtitle={`Aturan buka tutup untuk ${activeBranch.name}.`}>
            <div className="space-y-3">
              {[
                ["Senin - Jumat", "05:00 - 23:00"],
                ["Sabtu", "06:00 - 22:00"],
                ["Minggu", "07:00 - 20:00"],
                ["Libur Nasional", "Custom per cabang"],
              ].map(([day, hour]) => (
                <div key={day} className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800/60">
                  <span className="font-medium text-gray-900 dark:text-white">{day}</span>
                  <span className="text-sm text-gray-500">{hour}</span>
                </div>
              ))}
            </div>
          </SectionPanel>
          <SectionPanel title="Rule Check-In" subtitle="Validasi gate sebelum member boleh masuk.">
            <div className="space-y-3">
              {[
                "Membership harus aktif",
                "Cabang harus ada di allowedBranchIds",
                "QR hanya berlaku satu kali per sesi",
                "Freeze dan expired otomatis ditolak",
              ].map((rule, index) => (
                <div key={rule} className="flex gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-800">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-sm font-semibold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                    {index + 1}
                  </span>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{rule}</p>
                </div>
              ))}
            </div>
          </SectionPanel>
          <SectionPanel title="Rule Booking" subtitle="Aturan kelas dan personal trainer.">
            <div className="space-y-4">
              {[
                ["Cancel window", 75, "Minimal 2 jam sebelum jadwal"],
                ["Waitlist auto promote", 60, "Jika peserta cancel, antrian naik"],
                ["PT conflict guard", 90, "Trainer tidak bisa double booking"],
              ].map(([label, value, helper]) => (
                <div key={label as string}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-900 dark:text-white">{label}</span>
                    <span className="text-gray-500">{helper}</span>
                  </div>
                  <ProgressBar value={value as number} tone={value === 60 ? "amber" : "emerald"} />
                </div>
              ))}
            </div>
          </SectionPanel>
        </div>
      );
    }

    if (settingsKey === "templates") {
      return (
        <div className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
            <SectionPanel title="Template Pesan" subtitle="Format pesan dummy yang nanti disimpan di database.">
              {renderSettingsTableToolbar("Tambah Template", () => openCreateModal("template"))}
              <DataTable
                data={messageTemplateSettings}
                getKey={(template) => template.id}
                columns={[
                  { header: "Kode", cell: (template) => <span className="font-mono text-xs">{template.id}</span> },
                  { header: "Template", cell: (template) => <span className="font-medium text-gray-900 dark:text-white">{template.name}</span> },
                  { header: "Trigger", cell: (template) => <span className="font-mono text-xs">{template.trigger}</span> },
                  { header: "Audience", cell: (template) => template.audience },
                  { header: "Channel", cell: (template) => template.channel },
                  { header: "Status", cell: (template) => <StatusPill tone={template.status === "active" ? "emerald" : template.status === "draft" ? "amber" : "slate"}>{template.status}</StatusPill> },
                  {
                    header: "Aksi",
                    cell: (template) => (
                      <div className="flex gap-2">
                        <TableActionIconButton
                          label="Detail template pesan"
                          icon={<EyeIcon />}
                          onClick={() => router.push(`/settings/templates/${encodeURIComponent(template.id)}`)}
                          variant="info"
                        />
                        <TableActionIconButton
                          label="Edit template pesan"
                          icon={<PencilIcon />}
                          onClick={() => openEditTemplateModal(template)}
                          disabled={!canManageSettings}
                          variant="edit"
                        />
                        <TableActionIconButton
                          label={template.status === "active" ? "Nonaktifkan template" : "Aktifkan template"}
                          icon={<PowerIcon />}
                          onClick={() => {
                            toggleMessageTemplateStatus(template.id);
                            addAuditLog({
                              branchId: activeBranch.id,
                              actor: currentUser.name,
                              action: "settings.message-template.status",
                              target: template.name,
                            });
                          }}
                          disabled={!canManageSettings}
                          variant={template.status === "active" ? "warning" : "success"}
                        />
                        <TableActionIconButton
                          label="Hapus template pesan"
                          icon={<TrashIcon />}
                          onClick={() =>
                            requestDelete({
                              title: "Hapus Template Pesan",
                              message: "Template pesan akan dihapus dari queue prototype.",
                              target: template.name,
                              onConfirm: () => {
                                deleteMessageTemplate(template.id);
                                addAuditLog({
                                  branchId: activeBranch.id,
                                  actor: currentUser.name,
                                  action: "settings.message-template.delete",
                                  target: template.name,
                                });
                              },
                            })
                          }
                          disabled={!canManageSettings}
                          variant="delete"
                        />
                      </div>
                    ),
                  },
                ]}
              />
            </SectionPanel>
            <SectionPanel title="Placeholder" subtitle="Field dinamis yang dipakai template.">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                {["{{memberName}}", "{{branchName}}", "{{invoiceNo}}", "{{bookingTime}}", "{{expiryDate}}", "{{paymentLink}}"].map((token) => (
                  <div key={token} className="rounded-lg bg-gray-50 p-3 font-mono text-sm text-gray-700 dark:bg-gray-800/60 dark:text-gray-300">
                    {token}
                  </div>
                ))}
              </div>
            </SectionPanel>
          </div>
          <SectionPanel title="Preview Queue" subtitle="Contoh pesan yang sedang menunggu dikirim.">
            <DataTable
              data={whatsappMessages.slice(0, 5)}
              getKey={(item) => item.id}
              columns={[
                { header: "Queue", cell: (item) => <span className="font-mono text-xs">{item.id}</span> },
                { header: "Template", cell: (item) => item.template },
                { header: "Penerima", cell: (item) => item.recipient },
                { header: "Jadwal", cell: (item) => item.scheduledAt },
                { header: "Status", cell: (item) => <StatusPill tone={item.status === "sent" ? "emerald" : item.status === "retrying" ? "amber" : item.status === "failed" ? "rose" : "sky"}>{item.status}</StatusPill> },
              ]}
            />
          </SectionPanel>
        </div>
      );
    }

    if (settingsKey === "dummy-data") {
      const sources = [
        { name: "members.json", count: memberRows.length, scope: "branch member access", tone: "emerald" as const, keys: ["seven-gym-prototype-state-v2"] },
        { name: "trainers.json", count: trainerRows.length, scope: "trainer branchIds", tone: "sky" as const, keys: ["seven-gym-prototype-trainers-v1"] },
        { name: "classes.json", count: gymClassRows.length, scope: "class schedule", tone: "amber" as const, keys: ["seven-gym-prototype-state-v2"] },
        { name: "inventory.json", count: branchSnapshot.scopedInventory.length, scope: "branch stock", tone: "rose" as const, keys: ["seven-gym-prototype-state-v2", "seven-gym-prototype-suppliers-v1", "seven-gym-prototype-equipment-v1"] },
        { name: "users.json", count: staffUserRows.length, scope: "auth + role", tone: "slate" as const, keys: ["seven-gym-prototype-users-v1", "seven-gym-prototype-roles-v1", "seven-gym-access-matrix-v1"] },
        { name: "branches.json", count: branchSettings.length, scope: "single company", tone: "emerald" as const, keys: ["seven-gym-prototype-state-v2"] },
      ];

      return (
        <div className="grid gap-6 xl:grid-cols-3">
          <SectionPanel title="JSON Seed" subtitle="Data dummy dibuat dekat dengan struktur backend nanti.">
            <div className="mb-4 grid gap-2 sm:grid-cols-3">
              <button
                type="button"
                onClick={openExportSeedModal}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300"
              >
                Export
              </button>
              <button
                type="button"
                onClick={openImportSeedModal}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300"
              >
                Import
              </button>
              <button
                type="button"
                onClick={() =>
                  requestDelete({
                    title: "Reset Dummy Data",
                    message: "Semua data prototype di localStorage akan dikembalikan ke seed awal.",
                    target: "Seven Gym Prototype",
                    confirmLabel: "Reset",
                    onConfirm: resetPrototypeSeed,
                  })
                }
                className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-300"
              >
                Reset
              </button>
            </div>
            <div className="space-y-3">
              {sources.map((source) => (
                <div key={source.name} className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-800">
                  <div>
                    <p className="font-mono text-sm font-medium text-gray-900 dark:text-white">{source.name}</p>
                    <p className="text-xs text-gray-500">{source.scope}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusPill tone={source.tone}>{source.count} rows</StatusPill>
                    <button
                      type="button"
                      onClick={() =>
                        requestDelete({
                          title: `Reset ${source.name}`,
                          message: "Data modul ini akan dikembalikan ke seed awal.",
                          target: source.name,
                          confirmLabel: "Reset Modul",
                          onConfirm: () => resetPrototypeSeedKeys(source.keys),
                        })
                      }
                      className="rounded-md border border-gray-200 px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </SectionPanel>
          <SectionPanel title="API Contract" subtitle="Endpoint dummy yang harus tetap dijaga saat masuk backend.">
            <div className="space-y-3">
              {apiContracts.map((contract) => (
                <div key={`${contract.method}-${contract.path}`} className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/60">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-gray-900 px-2 py-1 text-xs font-semibold text-white dark:bg-white dark:text-gray-900">
                      {contract.method}
                    </span>
                    <span className="truncate font-mono text-xs text-gray-700 dark:text-gray-300">
                      {contract.path}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{contract.guard}</p>
                </div>
              ))}
            </div>
          </SectionPanel>
          <SectionPanel title="Business Rules" subtitle="Rule dummy yang tidak boleh hilang saat migrasi real API.">
            <div className="space-y-3">
              {businessRules.map((rule) => (
                <div key={rule} className="flex gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-800/60">
                  <ShieldIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  <p className="text-sm text-gray-600 dark:text-gray-300">{rule}</p>
                </div>
              ))}
            </div>
          </SectionPanel>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {settingsItems.map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {item.title}
                  </p>
                  <p className="mt-3 text-xl font-semibold text-gray-900 dark:text-white">
                    {item.value}
                  </p>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {item.helper}
                  </p>
                </div>
                <SettingsIcon className="h-5 w-5 text-emerald-500" />
              </div>
            </div>
          ))}
        </div>
        <SectionPanel title="Preview Konfigurasi" subtitle="Tampilan ringkas pengaturan yang akan terhubung ke data JSON/API.">
          <div className="grid gap-4 lg:grid-cols-3">
            {["Membership renewal H-7", "Invoice prefix INV-YYMM", "Jam ramai otomatis"].map((item, index) => (
              <div key={item} className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800/60">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-white">
                    {index + 1}
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white">{item}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionPanel>
      </div>
    );
  };

  const renderAccess = () => {
    const accessKey = slug.at(-1);

    const matrixTable = (
      <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
        <div className="grid min-w-[560px] grid-cols-4 bg-gray-50 text-xs font-semibold text-gray-500 dark:bg-gray-800 dark:text-gray-400">
          {["Modul", "Owner / Admin", "Staff", "Trainer"].map((header) => (
            <div key={header} className="px-3 py-3">{header}</div>
          ))}
        </div>
        {accessMatrixRows.map((row) => (
          <div key={row.module} className="grid min-w-[560px] grid-cols-4 border-t border-gray-200 text-xs dark:border-gray-800">
            <div className="px-3 py-3 font-medium text-gray-900 dark:text-white">{row.module}</div>
            {accessRoleKeys.map((roleKey) => (
              <div key={`${row.module}-${roleKey}`} className="px-3 py-2 text-gray-700 dark:text-gray-300">
                <button
                  type="button"
                  onClick={() => toggleAccessCell(row.module, roleKey)}
                  className="min-w-20 rounded-lg border border-gray-200 px-2.5 py-1.5 text-left text-xs font-medium text-gray-700 transition hover:border-emerald-300 hover:bg-emerald-50 dark:border-gray-800 dark:text-gray-300 dark:hover:border-emerald-500/40 dark:hover:bg-emerald-500/10"
                >
                  {row[roleKey]}
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>
    );

    if (slug[1] === "users" && slug[2]) {
      const userId = decodeURIComponent(slug[2]);
      const user = staffUserRows.find((item) => item.id === userId);

      if (!user) {
        return (
          <SectionPanel title="User Tidak Ditemukan" subtitle="User tidak ada di login dummy prototype.">
            <button
              type="button"
              onClick={() => router.push("/iam/users")}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-200 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300"
            >
              Kembali ke User & Staff
            </button>
          </SectionPanel>
        );
      }

      return (
        <div className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => router.push("/iam/users")}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-200 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300"
            >
              Kembali
            </button>
            <PrimaryToolbarButton onClick={() => openEditStaffUserModal(user)} disabled={!canManageIam}>
              Edit User
            </PrimaryToolbarButton>
          </div>
          <SectionPanel title={user.name} subtitle="Detail user, role, cabang, dan permission runtime.">
            <div className="grid gap-4 md:grid-cols-4">
              <StatCard label="Role" value={roleLabels[user.role]} helper="Role aktif login" icon={<ShieldIcon className="h-5 w-5" />} tone={user.role === "owner" ? "emerald" : user.role === "staff" ? "amber" : "sky"} />
              <StatCard label="Cabang" value={String(user.branchAccess.length)} helper="Branch access" icon={<ReportIcon className="h-5 w-5" />} tone="sky" />
              <StatCard label="Permission" value={user.permissions.includes("*") ? "All" : String(user.permissions.length)} helper="Runtime permission" icon={<CheckSmallIcon className="h-5 w-5" />} tone="emerald" />
              <StatCard label="Status" value={user.status} helper={user.email} icon={<MemberIcon className="h-5 w-5" />} tone={user.status === "active" ? "emerald" : "slate"} />
            </div>
            <div className="mt-6 grid gap-6 xl:grid-cols-2">
              <DataTable
                data={user.branchAccess.map((branchId) => branchSettings.find((branch) => branch.id === branchId)).filter(Boolean)}
                getKey={(branch) => branch?.id ?? "unknown"}
                columns={[
                  { header: "Cabang", cell: (branch) => branch?.name ?? "-" },
                  { header: "Kode", cell: (branch) => branch?.code ?? "-" },
                  { header: "Kota", cell: (branch) => branch?.city ?? "-" },
                ]}
              />
              <DataTable
                data={(user.permissions.includes("*") ? ["*"] : user.permissions).map((permission) => ({ permission }))}
                getKey={(row) => row.permission}
                columns={[
                  { header: "Permission", cell: (row) => <span className="font-mono text-xs">{row.permission}</span> },
                  { header: "Source", cell: () => "role matrix" },
                ]}
              />
            </div>
          </SectionPanel>
        </div>
      );
    }

    if (slug[1] === "roles" && slug[2]) {
      const roleId = decodeURIComponent(slug[2]);
      const role = roleRows.find((item) => item.id === roleId);

      if (!role) {
        return (
          <SectionPanel title="Role Tidak Ditemukan" subtitle="Role tidak ada di konfigurasi prototype.">
            <button
              type="button"
              onClick={() => router.push("/iam/roles")}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-200 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300"
            >
              Kembali ke Role
            </button>
          </SectionPanel>
        );
      }

      const rolePermissions = buildPermissionsFromMatrix(accessMatrixRows, role.id);
      const roleUsers = staffUserRows.filter((user) => user.role === role.id);
      const roleTone = role.color ?? "slate";

      return (
        <div className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => router.push("/iam/roles")}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-200 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300"
            >
              Kembali
            </button>
            <PrimaryToolbarButton onClick={() => openEditRoleModal(role)} disabled={!canManageIam}>
              Edit Role
            </PrimaryToolbarButton>
          </div>
          <SectionPanel title={role.name} subtitle={role.scope}>
            <div className="grid gap-4 md:grid-cols-3">
              <StatCard label="User" value={String(roleUsers.length)} helper={`${role.users} tercatat di master`} icon={<MemberIcon className="h-5 w-5" />} tone={roleTone} />
              <StatCard label="Permission" value={rolePermissions.includes("*") ? "All" : String(rolePermissions.length)} helper="Dari matrix akses" icon={<ShieldIcon className="h-5 w-5" />} tone="emerald" />
              <StatCard label="Tone" value={roleTone} helper="Visual badge" icon={<SettingsIcon className="h-5 w-5" />} tone={roleTone} />
            </div>
          </SectionPanel>
          <div className="grid gap-6 xl:grid-cols-2">
            <SectionPanel title="User Role Ini" subtitle="User yang memakai role ini.">
              <DataTable
                data={roleUsers}
                getKey={(user) => user.id}
                columns={[
                  { header: "User", cell: (user) => user.name },
                  { header: "Email", cell: (user) => user.email },
                  { header: "Cabang", cell: (user) => user.branchAccess.length },
                ]}
              />
            </SectionPanel>
            <SectionPanel title="Permission" subtitle="Permission yang aktif dari matrix.">
              <DataTable
                data={rolePermissions.map((permission) => ({ permission }))}
                getKey={(row) => row.permission}
                columns={[
                  { header: "Permission", cell: (row) => <span className="font-mono text-xs">{row.permission}</span> },
                ]}
              />
            </SectionPanel>
          </div>
        </div>
      );
    }

    if (slug[1] === "activity-log" && slug[2]) {
      const logId = decodeURIComponent(slug[2]);
      const log = branchAuditLogs.find((item) => item.id === logId);

      if (!log) {
        return (
          <SectionPanel title="Audit Log Tidak Ditemukan" subtitle="Log tidak ada di cabang aktif.">
            <button
              type="button"
              onClick={() => router.push("/iam/activity-log")}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-200 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300"
            >
              Kembali ke Audit Log
            </button>
          </SectionPanel>
        );
      }

      return (
        <div className="space-y-6">
          <button
            type="button"
            onClick={() => router.push("/iam/activity-log")}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-200 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300"
          >
            Kembali
          </button>
          <SectionPanel title={log.action} subtitle="Detail audit log dinamis dari aktivitas prototype.">
            <DataTable
              data={[
                { label: "Log ID", value: log.id },
                { label: "Actor", value: log.actor },
                { label: "Action", value: log.action },
                { label: "Target", value: log.target },
                { label: "Time", value: log.time },
                { label: "Branch", value: branchSettings.find((branch) => branch.id === log.branchId)?.name ?? log.branchId },
              ]}
              getKey={(row) => row.label}
              columns={[
                { header: "Field", cell: (row) => row.label },
                { header: "Nilai", cell: (row) => <span className="font-medium text-gray-900 dark:text-white">{row.value}</span> },
              ]}
            />
          </SectionPanel>
        </div>
      );
    }

    if (accessKey === "users") {
      return (
        <div className="grid gap-6 xl:grid-cols-3">
          <SectionPanel title="User & Staff" subtitle="Login dummy menentukan role, cabang, dan menu otomatis.">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">{crudMessage ?? "Tambah/edit user lewat popup dan branch access."}</p>
              <PrimaryToolbarButton onClick={openCreateStaffUserModal}>Tambah User</PrimaryToolbarButton>
            </div>
            <DataTable
              data={staffUserRows}
              getKey={(user) => user.id}
              columns={[
                {
                  header: "User",
                  cell: (user) => (
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  ),
                },
                { header: "Role", cell: (user) => <StatusPill tone={user.role === "owner" ? "emerald" : user.role === "staff" ? "amber" : "sky"}>{roleLabels[user.role]}</StatusPill> },
                {
                  header: "Cabang",
                  cell: (user) => user.branchAccess.map((branchId) => branchSettings.find((branch) => branch.id === branchId)?.code ?? branchId).join(", "),
                },
                { header: "Status", cell: (user) => <StatusPill tone={user.status === "active" ? "emerald" : "slate"}>{user.status}</StatusPill> },
                {
                  header: "Aksi",
                  cell: (user) => (
                    <div className="flex gap-2">
                      <TableActionIconButton
                        label="Detail user"
                        icon={<EyeIcon />}
                        onClick={() => router.push(`/iam/users/${encodeURIComponent(user.id)}`)}
                        variant="info"
                      />
                      <TableActionIconButton
                        label="Edit user"
                        icon={<PencilIcon />}
                        onClick={() => openEditStaffUserModal(user)}
                        disabled={!canManageIam}
                        variant="edit"
                      />
                      <TableActionIconButton
                        label="Hapus user"
                        icon={<TrashIcon />}
                        onClick={() =>
                          requestDelete({
                            title: "Hapus User",
                            message: "User akan dihapus dari login dummy prototype.",
                            target: user.name,
                            onConfirm: () => {
                              setStaffUserRows((currentRows) => currentRows.filter((item) => item.id !== user.id));
                              setCrudMessage(`${user.name} dihapus.`);
                              addAuditLog({
                                branchId: activeBranch.id,
                                actor: currentUser.name,
                                action: "iam.users.delete",
                                target: user.name,
                              });
                            },
                          })
                        }
                        disabled={!canManageIam}
                        variant="delete"
                      />
                    </div>
                  ),
                },
              ]}
            />
          </SectionPanel>
          <SectionPanel title="Session Dummy" subtitle="Prototype login yang meniru auth real.">
            <div className="space-y-3">
              {[
                ["Current user", currentUser.name],
                ["Role aktif", currentRoleLabel],
                ["Branch aktif", activeBranch.name],
                ["Token", "demo-token tersimpan localStorage"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/60">
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{value}</p>
                </div>
              ))}
            </div>
          </SectionPanel>
          <SectionPanel title="Branch Access" subtitle="Owner bisa semua cabang, staff hanya cabang yang ditugaskan.">
            <div className="space-y-3">
              {branchSettings.map((branch) => (
                <div key={branch.id} className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-800">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{branch.name}</p>
                    <p className="text-xs text-gray-500">{branch.city}</p>
                  </div>
                  <StatusPill tone={currentUser.branchAccess.includes(branch.id) ? "emerald" : "slate"}>
                    {currentUser.branchAccess.includes(branch.id) ? "allowed" : "blocked"}
                  </StatusPill>
                </div>
              ))}
            </div>
          </SectionPanel>
        </div>
      );
    }

    if (accessKey === "roles") {
      return (
        <div className="space-y-6">
          <SectionPanel title="Role" subtitle="Kelola role dummy dan scope aksesnya.">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">{crudMessage ?? "Role tetap dipetakan ke matrix akses."}</p>
              <PrimaryToolbarButton onClick={openCreateRoleModal}>Tambah Role</PrimaryToolbarButton>
            </div>
            <DataTable
              data={roleRows}
              getKey={(role) => role.id}
              columns={[
                { header: "Role", cell: (role) => <span className="font-medium text-gray-900 dark:text-white">{role.name}</span> },
                { header: "User", cell: (role) => `${role.users} user` },
                { header: "Scope", cell: (role) => role.scope, className: "min-w-[260px]" },
                { header: "Tone", cell: (role) => <StatusPill tone={role.color}>{role.color}</StatusPill> },
                {
                  header: "Aksi",
                  cell: (role) => (
                    <div className="flex gap-2">
                      <TableActionIconButton
                        label="Preview akses"
                        icon={<EyeIcon />}
                        onClick={() => router.push(`/iam/roles/${encodeURIComponent(role.id)}`)}
                        variant="info"
                      />
                      <TableActionIconButton
                        label="Clone role"
                        icon={<RefreshIcon />}
                        onClick={() => {
                          setRoleForm({
                            id: role.id,
                            name: `${role.name} Copy`,
                            users: "0",
                            scope: `${role.scope} (copy)`,
                            color: role.color,
                          });
                          setEditingRoleId(null);
                          setActionModal("role");
                          setCrudMessage(`Draft clone ${role.name} siap disimpan ke role yang dipilih.`);
                        }}
                        variant="success"
                      />
                      <TableActionIconButton
                        label="Edit role"
                        icon={<PencilIcon />}
                        onClick={() => openEditRoleModal(role)}
                        disabled={!canManageIam}
                        variant="edit"
                      />
                      <TableActionIconButton
                        label="Hapus role"
                        icon={<TrashIcon />}
                        onClick={() =>
                          requestDelete({
                            title: "Hapus Role",
                            message: "Role akan dihapus dari daftar role prototype. Matrix akses tetap bisa disesuaikan.",
                            target: role.name,
                            onConfirm: () => {
                              setRoleRows((currentRows) => currentRows.filter((item) => item.id !== role.id));
                              setCrudMessage(`${role.name} dihapus.`);
                              addAuditLog({
                                branchId: activeBranch.id,
                                actor: currentUser.name,
                                action: "iam.roles.delete",
                                target: role.name,
                              });
                            },
                          })
                        }
                        disabled={!canManageIam}
                        variant="delete"
                      />
                    </div>
                  ),
                },
              ]}
            />
          </SectionPanel>
          <div className="grid gap-6 lg:grid-cols-3">
            {[
              { title: "Owner / Admin", helper: "Company wide, semua cabang, semua permission", tone: "emerald" as const },
              { title: "Staff", helper: "Operasional cabang dibatasi branchAccess", tone: "amber" as const },
              { title: "Personal Trainer", helper: "Portal trainer untuk jadwal, client, progress, dan komisi", tone: "sky" as const },
            ].map((role) => (
              <SectionPanel key={role.title} title={role.title}>
                <StatusPill tone={role.tone}>{role.helper}</StatusPill>
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                  Role ini mengubah sidebar, action button, dan guard API prototype.
                </p>
              </SectionPanel>
            ))}
          </div>
        </div>
      );
    }

    if (accessKey === "matrix") {
      return (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <SectionPanel title="Matrix Akses" subtitle="Tidak pakai checklist popup, role disajikan sebagai matrix yang gampang dibaca.">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">Klik cell untuk mengganti level akses.</p>
              <button
                type="button"
                onClick={() => {
                  setAccessMatrixRows(permissionMatrix);
                  accessRoleKeys.forEach((roleKey) => {
                    setRolePermissionOverride(roleKey, buildPermissionsFromMatrix(permissionMatrix, roleKey));
                  });
                  setAccessMessage("Matrix akses dikembalikan ke default seed.");
                }}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-200 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300"
              >
                Reset Matrix
              </button>
            </div>
            <div className="overflow-x-auto">{matrixTable}</div>
            {accessMessage && <p className="mt-3 text-sm text-emerald-600 dark:text-emerald-400">{accessMessage}</p>}
          </SectionPanel>
          <SectionPanel title="Enforcement" subtitle="Permission tidak berhenti di sidebar.">
            <div className="space-y-3">
              {[
                "Sidebar difilter dari requiredAny dan requiredRolesAny",
                "Tombol action disable kalau permission tidak ada",
                "API contract membawa guard permission + branchAccess",
                "Audit log wajib untuk perubahan role dan void transaksi",
              ].map((rule) => (
                <div key={rule} className="flex gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-800/60">
                  <ShieldIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  <p className="text-sm text-gray-600 dark:text-gray-300">{rule}</p>
                </div>
              ))}
            </div>
          </SectionPanel>
        </div>
      );
    }

    if (accessKey === "activity-log") {
      return (
        <div className="grid gap-6 xl:grid-cols-3">
          <SectionPanel title="Audit Log" subtitle={`Aktivitas penting untuk ${activeBranch.name}.`}>
            <div className="space-y-3">
              {branchAuditLogs.map((log) => (
                <div key={log.id} className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-gray-900 dark:text-white">{log.action}</p>
                    <span className="text-xs text-gray-500">{log.time}</span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {log.actor} / {log.target}
                  </p>
                  <button
                    type="button"
                    onClick={() => router.push(`/iam/activity-log/${encodeURIComponent(log.id)}`)}
                    className="mt-3 inline-flex h-8 items-center justify-center rounded-md border border-gray-200 px-3 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300"
                  >
                    Detail
                  </button>
                </div>
              ))}
            </div>
          </SectionPanel>
          <SectionPanel title="Event Type" subtitle="Kategori log yang harus ada di sistem real.">
            <div className="space-y-3">
              {["auth.login", "members.update", "roles.update", "pos.void", "inventory.restock"].map((event) => (
                <div key={event} className="rounded-lg bg-gray-50 p-3 font-mono text-sm text-gray-700 dark:bg-gray-800/60 dark:text-gray-300">
                  {event}
                </div>
              ))}
            </div>
          </SectionPanel>
          <SectionPanel title="Audit Policy" subtitle="Rule penyimpanan log.">
            <div className="space-y-3">
              {["Tidak bisa dihapus staff", "Menyimpan actor, target, branchId", "Diff data disimpan di backend", "Filter by date, user, dan modul"].map((policy) => (
                <div key={policy} className="flex gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-800/60">
                  <ClockIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                  <p className="text-sm text-gray-600 dark:text-gray-300">{policy}</p>
                </div>
              ))}
            </div>
          </SectionPanel>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {roleRows.map((row) => (
            <div
              key={row.id}
              className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]"
            >
              <div className="flex items-center justify-between gap-3">
                <ShieldIcon className="h-5 w-5 text-emerald-500" />
                <StatusPill tone={row.color}>{row.users} user</StatusPill>
              </div>
              <p className="mt-4 font-semibold text-gray-900 dark:text-white">{row.name}</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{row.scope}</p>
            </div>
          ))}
        </div>
        <SectionPanel title="User & Staff" subtitle="Login dummy, role, dan akses cabang yang nanti berasal dari database.">
          <div className="grid gap-3 lg:grid-cols-3">
            {staffUserRows.map((user) => (
              <div key={user.id} className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  <StatusPill tone={user.role === "owner" ? "emerald" : user.role === "staff" ? "amber" : "sky"}>
                    {roleLabels[user.role]}
                  </StatusPill>
                </div>
                <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                  {user.branchAccess.length} cabang / {user.permissions.includes("*") ? "all" : user.permissions.length} permission
                </p>
              </div>
            ))}
          </div>
        </SectionPanel>
        <SectionPanel title="Matrix Akses" subtitle="Ringkas dan tanpa checklist popup: tiap role punya level akses per modul.">
          <div className="overflow-x-auto">{matrixTable}</div>
          {accessMessage && <p className="mt-3 text-sm text-emerald-600 dark:text-emerald-400">{accessMessage}</p>}
        </SectionPanel>
      </div>
    );
  };

  const renderReports = () => {
    const reportKey = slug.at(-1);
    const completedRevenue = branchSnapshot.scopedTransactions
      .filter((transaction) => transaction.status === "completed")
      .reduce((total, transaction) => total + transaction.amount, 0);
    const reportToolbar = (
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            value={reportSearch}
            onChange={(event) => setReportSearch(event.target.value)}
            placeholder="Cari laporan"
            className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-emerald-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200"
          />
          <select
            value={reportStatusFilter}
            onChange={(event) => setReportStatusFilter(event.target.value)}
            className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-emerald-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200"
          >
            <option value="all">Semua Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="void">Void</option>
          </select>
        </div>
        <button
          type="button"
          onClick={() => exportRows(`seven-gym-report-${reportKey ?? "overview"}.json`, branchSnapshot.scopedTransactions)}
          className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-200 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300"
        >
          Export Report
        </button>
      </div>
    );

    if (reportKey === "revenue") {
      return (
        <div className="grid gap-6 xl:grid-cols-3">
          <SectionPanel title="Revenue Summary" subtitle={`Pendapatan selesai di ${activeBranch.name}.`}>
            {reportToolbar}
            <p className="text-3xl font-semibold text-gray-900 dark:text-white">
              {formatCurrency(completedRevenue)}
            </p>
            <div className="mt-5 space-y-4">
              {[
                ["Membership", 56, "emerald"],
                ["Personal Training", 28, "sky"],
                ["Produk", 11, "amber"],
                ["Kelas", 5, "emerald"],
              ].map(([label, value, tone]) => (
                <div key={label as string}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{label}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{value}%</span>
                  </div>
                  <ProgressBar value={value as number} tone={tone as string} />
                </div>
              ))}
            </div>
          </SectionPanel>
          <SectionPanel title="Ledger Transaksi" subtitle="Daftar transaksi cabang aktif, bukan tabel generik.">
            <div className="space-y-3">
              {branchSnapshot.scopedTransactions.map((transaction) => (
                <div key={transaction.id} className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-mono text-xs font-semibold text-gray-900 dark:text-white">{transaction.id}</p>
                    <StatusPill tone={transaction.status === "completed" ? "emerald" : transaction.status === "pending" ? "amber" : "rose"}>
                      {transaction.status}
                    </StatusPill>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">{transaction.description}</p>
                  <p className="mt-3 text-lg font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(transaction.amount)}
                  </p>
                </div>
              ))}
            </div>
          </SectionPanel>
          <SectionPanel title="Shift & Invoice" subtitle="Kontrol kas yang mempengaruhi laporan revenue.">
            <div className="space-y-3">
              {cashShiftRows
                .filter((shift) => shift.branchId === activeBranch.id || activeBranch.id === "branch-pusat")
                .map((shift) => (
                  <div key={shift.id} className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/60">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-gray-900 dark:text-white">{shift.id}</p>
                      <StatusPill tone={shift.status === "open" ? "emerald" : shift.status === "review" ? "amber" : "slate"}>
                        {shift.status}
                      </StatusPill>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">{shift.cashierName} / {formatCurrency(shift.expectedCash)}</p>
                  </div>
                ))}
            </div>
          </SectionPanel>
        </div>
      );
    }

    if (reportKey === "members") {
      const activeCount = branchSnapshot.scopedMembers.filter((member) => member.membershipStatus === "active").length;
      const frozenCount = branchSnapshot.scopedMembers.filter((member) => member.membershipStatus === "frozen").length;
      const expiredCount = branchSnapshot.scopedMembers.filter((member) => member.membershipStatus === "expired").length;

      return (
        <div className="grid gap-6 xl:grid-cols-3">
          <SectionPanel title="Membership Health" subtitle="Komposisi status member cabang.">
            <div className="space-y-4">
              {[
                ["Active", activeCount, "emerald"],
                ["Frozen", frozenCount, "amber"],
                ["Expired", expiredCount, "rose"],
              ].map(([label, value, tone]) => (
                <div key={label as string}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{label}</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{value}</span>
                  </div>
                  <ProgressBar
                    value={((value as number) / Math.max(branchSnapshot.scopedMembers.length, 1)) * 100}
                    tone={tone as string}
                  />
                </div>
              ))}
            </div>
          </SectionPanel>
          <SectionPanel title="Top Engagement" subtitle="Member dengan aktivitas dan point tertinggi.">
            <div className="space-y-3">
              {branchSnapshot.scopedMembers
                .slice()
                .sort((a, b) => b.checkins - a.checkins)
                .slice(0, 5)
                .map((member) => (
                  <div key={member.id} className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-800">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{member.name}</p>
                      <p className="text-sm text-gray-500">{member.membershipType} / {member.checkins} check-in</p>
                    </div>
                    <StatusPill tone={member.membershipStatus === "active" ? "emerald" : "amber"}>
                      {member.points} pts
                    </StatusPill>
                  </div>
                ))}
            </div>
          </SectionPanel>
          <SectionPanel title="Retention Action" subtitle="Follow-up yang harus muncul dari laporan member.">
            <div className="space-y-3">
              {[
                "Kirim reminder renewal untuk expired H-7",
                "Tawarkan freeze follow-up untuk member jarang check-in",
                "Berikan reward untuk referral aktif",
                "Segmentasi VIP untuk promo PT",
              ].map((action) => (
                <div key={action} className="flex gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-800/60">
                  <MemberIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  <p className="text-sm text-gray-600 dark:text-gray-300">{action}</p>
                </div>
              ))}
            </div>
          </SectionPanel>
        </div>
      );
    }

    if (reportKey === "operations") {
      return (
        <div className="grid gap-6 xl:grid-cols-3">
          <SectionPanel title="Check-In Flow" subtitle="Aktivitas gate hari ini.">
            <div className="space-y-3">
              {branchSnapshot.scopedCheckIns.map((checkIn) => (
                <div key={checkIn.id} className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800/60">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{checkIn.memberName}</p>
                    <p className="text-sm text-gray-500">{checkIn.time} / {checkIn.gate}</p>
                  </div>
                  <StatusPill tone={checkIn.checkoutTime ? "slate" : "emerald"}>
                    {checkIn.checkoutTime ? "Checkout" : "In Gym"}
                  </StatusPill>
                </div>
              ))}
            </div>
          </SectionPanel>
          <SectionPanel title="Booking Kelas" subtitle="Kapasitas kelas dan waiting list.">
            <div className="space-y-3">
              {classBookingQueue
                .filter((booking) => booking.branchId === activeBranch.id || activeBranch.id === "branch-pusat")
                .map((booking) => (
                  <div key={booking.id} className="rounded-lg border border-gray-200 p-3 dark:border-gray-800">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-gray-900 dark:text-white">{booking.className}</p>
                      <StatusPill tone={booking.status === "waitlist" ? "amber" : "emerald"}>{booking.status}</StatusPill>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">{booking.memberName} / {booking.capacity}</p>
                  </div>
                ))}
            </div>
          </SectionPanel>
          <SectionPanel title="Sesi PT" subtitle="Eksekusi personal training.">
            <div className="space-y-3">
              {branchSnapshot.scopedPtSessions.map((session) => (
                <div key={session.id} className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/60">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-gray-900 dark:text-white">{session.memberName}</p>
                    <StatusPill tone={session.status === "completed" ? "emerald" : "sky"}>{session.status}</StatusPill>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">{session.date} / {session.time} / {session.focus}</p>
                </div>
              ))}
            </div>
          </SectionPanel>
        </div>
      );
    }

    if (reportKey === "attendance") {
      return (
        <div className="grid gap-6 xl:grid-cols-3">
          <SectionPanel title="Laporan Kehadiran" subtitle="Statistik check-in dan jam ramai gym.">
            <div className="space-y-4">
              {[
                ["Pagi", 34, "06:00 - 10:00"],
                ["Siang", 18, "10:00 - 15:00"],
                ["Sore", 52, "15:00 - 19:00"],
                ["Malam", 41, "19:00 - 23:00"],
              ].map(([label, value, helper]) => (
                <div key={label as string}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-900 dark:text-white">{label}</span>
                    <span className="text-gray-500">{helper}</span>
                  </div>
                  <ProgressBar value={value as number} tone={value === 52 ? "amber" : "emerald"} />
                </div>
              ))}
            </div>
          </SectionPanel>
          <SectionPanel title="Attendance Detail" subtitle={`Check-in terakhir di ${activeBranch.name}.`}>
            <div className="space-y-3">
              {branchSnapshot.scopedCheckIns.map((checkIn) => (
                <div key={checkIn.id} className="rounded-lg border border-gray-200 p-3 dark:border-gray-800">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-gray-900 dark:text-white">{checkIn.memberName}</p>
                    <StatusPill tone={checkIn.checkoutTime ? "slate" : "emerald"}>{checkIn.checkoutTime ? "done" : "active"}</StatusPill>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">{checkIn.time} / {checkIn.gate}</p>
                </div>
              ))}
            </div>
          </SectionPanel>
          <SectionPanel title="Member Tidak Aktif" subtitle="Deteksi member pasif untuk follow-up.">
            <div className="space-y-3">
              {memberRows
                .filter((member) => member.checkins < 100)
                .map((member) => (
                  <div key={member.id} className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800/60">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{member.name}</p>
                      <p className="text-sm text-gray-500">{member.checkins} total visit</p>
                    </div>
                    <StatusPill tone="amber">follow-up</StatusPill>
                  </div>
                ))}
            </div>
          </SectionPanel>
        </div>
      );
    }

    if (reportKey === "classes") {
      return (
        <div className="grid gap-6 xl:grid-cols-3">
          <SectionPanel title="Kelas Favorit" subtitle="Performa kelas berdasarkan kapasitas dan waiting list.">
            <div className="space-y-4">
              {gymClassRows.map((gymClass) => (
                <div key={gymClass.id}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-900 dark:text-white">{gymClass.name}</span>
                    <span className="text-gray-500">{gymClass.currentParticipants}/{gymClass.maxParticipants}</span>
                  </div>
                  <ProgressBar value={(gymClass.currentParticipants / gymClass.maxParticipants) * 100} tone={gymClass.status === "full" ? "amber" : "emerald"} />
                </div>
              ))}
            </div>
          </SectionPanel>
          <SectionPanel title="Booking & Waiting List" subtitle="Kelas penuh dan antrean member.">
            <div className="space-y-3">
              {branchSnapshot.scopedClassBookings.map((booking) => (
                <div key={booking.id} className="rounded-lg border border-gray-200 p-3 dark:border-gray-800">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-gray-900 dark:text-white">{booking.className}</p>
                    <StatusPill tone={booking.status === "waitlist" ? "amber" : "emerald"}>{booking.status}</StatusPill>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">{booking.memberName} / {booking.capacity}</p>
                </div>
              ))}
            </div>
          </SectionPanel>
          <SectionPanel title="Insight Kelas" subtitle="Rekomendasi operasional dari laporan kelas.">
            <div className="space-y-3">
              {["Tambah slot HIIT sore", "Yoga pagi stabil untuk retention", "Boxing butuh kapasitas studio lebih besar", "Waiting list bisa dikonversi ke class pass"].map((insight) => (
                <div key={insight} className="flex gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-800/60">
                  <ClassIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  <p className="text-sm text-gray-600 dark:text-gray-300">{insight}</p>
                </div>
              ))}
            </div>
          </SectionPanel>
        </div>
      );
    }

    if (reportKey === "trainers") {
      return (
        <div className="grid gap-6 xl:grid-cols-4">
          {trainerRows.map((trainer) => (
            <SectionPanel key={trainer.id} title={trainer.name} subtitle="Performa trainer dan komisi.">
              <div className="flex items-center justify-between">
                <StatusPill tone={trainer.status === "active" ? "emerald" : "amber"}>{trainer.status}</StatusPill>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{trainer.rating} rating</span>
              </div>
              <p className="mt-5 text-2xl font-semibold text-gray-900 dark:text-white">
                {formatCurrency(trainer.commission)}
              </p>
              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-gray-500">Sesi</span>
                  <span className="font-medium text-gray-900 dark:text-white">{trainer.currentSessions}/{trainer.monthlyTarget}</span>
                </div>
                <ProgressBar value={(trainer.currentSessions / trainer.monthlyTarget) * 100} tone="sky" />
              </div>
            </SectionPanel>
          ))}
        </div>
      );
    }

    if (reportKey === "inventory") {
      return (
        <div className="grid gap-6 xl:grid-cols-3">
          <SectionPanel title="Stock Health" subtitle={`Stok dan reorder untuk ${activeBranch.name}.`}>
            <div className="space-y-4">
              {branchSnapshot.scopedInventory.slice(0, 6).map((item) => (
                <div key={item.id}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-900 dark:text-white">{item.name}</span>
                    <span className={item.stock <= item.minStock ? "text-amber-600" : "text-gray-500"}>{item.stock}</span>
                  </div>
                  <ProgressBar value={(item.stock / Math.max(item.minStock * 3, 1)) * 100} tone={item.stock <= item.minStock ? "amber" : "emerald"} />
                </div>
              ))}
            </div>
          </SectionPanel>
          <SectionPanel title="Low Stock Action" subtitle="Produk yang harus segera direstock.">
            <div className="space-y-3">
              {branchSnapshot.scopedInventory
                .filter((item) => item.stock <= item.minStock)
                .map((item) => (
                  <div key={item.id} className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-500/20 dark:bg-amber-500/10">
                    <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                    <p className="text-sm text-amber-700 dark:text-amber-400">
                      Stock {item.stock} / minimum {item.minStock}
                    </p>
                  </div>
                ))}
            </div>
          </SectionPanel>
          <SectionPanel title="Maintenance Alat" subtitle="Kondisi alat yang ikut masuk laporan stok.">
            <div className="space-y-3">
              {equipmentRows
                .filter((item) => item.branchId === activeBranch.id || activeBranch.id === "branch-pusat")
                .map((item) => (
                  <div key={item.id} className="rounded-lg border border-gray-200 p-3 dark:border-gray-800">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-gray-900 dark:text-white">{item.equipmentName}</p>
                      <StatusPill tone={item.status === "ok" ? "emerald" : "amber"}>{item.status}</StatusPill>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">{item.location} / next {item.nextCheck}</p>
                  </div>
                ))}
            </div>
          </SectionPanel>
        </div>
      );
    }

    if (reportKey === "branches") {
      return (
        <div className="grid gap-6 xl:grid-cols-4">
          {branchSettings.map((branch) => {
            const snapshot = getOperationalSnapshot(branch.id);

            return (
              <SectionPanel key={branch.id} title={branch.name} subtitle={`${branch.city} / ${branch.code}`}>
                <div className="flex items-center justify-between">
                  <StatusPill tone={branch.status === "active" ? "emerald" : "amber"}>{branch.status}</StatusPill>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(snapshot.revenue)}
                  </span>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/60">
                    <p className="text-xs text-gray-500">Member</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{snapshot.activeMembers}</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/60">
                    <p className="text-xs text-gray-500">Check-in</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{snapshot.checkInsToday}</p>
                  </div>
                </div>
              </SectionPanel>
            );
          })}
        </div>
      );
    }

    if (reportKey === "analysis") {
      const analysisRows = [
        { area: "Retention", insight: "Member aktif paling stabil datang 3-4x per minggu", impact: "+18% renewal", action: "Kirim promo PT ke member VIP aktif", priority: "Tinggi" },
        { area: "Kelas", insight: "HIIT sore sering penuh dan punya waiting list", impact: "+12 slot", action: "Tambah jadwal HIIT jam 19:00", priority: "Tinggi" },
        { area: "Produk", insight: "Protein ready stock cepat habis setelah jam pulang kantor", impact: "Reorder H-3", action: "Naikkan stok minimum kategori beverage", priority: "Sedang" },
        { area: "Trainer", insight: "Trainer dengan rating tinggi mendekati target sesi", impact: "+22% upsell", action: "Buka paket trial dengan trainer top", priority: "Sedang" },
      ];

      return (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard label="Retention Score" value="82%" helper="Stabil dibanding bulan lalu" icon={<ReportIcon className="h-5 w-5" />} tone="emerald" />
            <StatCard label="Jam Ramai" value="18:00" helper="Peak check-in harian" icon={<ClockIcon className="h-5 w-5" />} tone="amber" />
            <StatCard label="Class Demand" value="+12" helper="Slot tambahan disarankan" icon={<ClassIcon className="h-5 w-5" />} tone="sky" />
            <StatCard label="Revenue Risk" value="8%" helper="Member expired perlu follow-up" icon={<TrendingUpIcon className="h-5 w-5" />} tone="rose" />
          </div>
          <SectionPanel title="Analisa Gym" subtitle="Insight operasional yang bisa dipakai owner/admin untuk ambil keputusan.">
            <DataTable
              data={analysisRows}
              getKey={(row) => row.area}
              columns={[
                { header: "Area", cell: (row) => <span className="font-medium text-gray-900 dark:text-white">{row.area}</span> },
                { header: "Insight", cell: (row) => row.insight },
                { header: "Impact", cell: (row) => row.impact },
                { header: "Aksi", cell: (row) => row.action },
                { header: "Prioritas", cell: (row) => <StatusPill tone={row.priority === "Tinggi" ? "rose" : "amber"}>{row.priority}</StatusPill> },
              ]}
            />
          </SectionPanel>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="grid gap-4 lg:grid-cols-4">
          {pageStats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <SectionPanel title="Revenue Stream" subtitle="Komposisi pendapatan membership, PT, produk, dan kelas.">
            <div className="space-y-4">
              {[
                ["Membership", 56, "emerald"],
                ["Personal Training", 28, "sky"],
                ["Produk", 11, "amber"],
                ["Kelas", 5, "emerald"],
              ].map(([label, value, tone]) => (
                <div key={label as string}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{label}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{value}%</span>
                  </div>
                  <ProgressBar value={value as number} tone={tone as string} />
                </div>
              ))}
            </div>
          </SectionPanel>
          <SectionPanel title="Insight Operasional" subtitle="Ringkasan yang nanti bisa diisi AI analytics.">
            <div className="space-y-3">
              {[
                "Member VIP punya frekuensi check-in 2.1x lebih tinggi.",
                "Kelas HIIT penuh lebih cepat dibanding kelas lain.",
                "Produk protein ready stock perlu reorder minggu ini.",
                "Trainer Dimas sudah mencapai 80% target sesi bulanan.",
              ].map((insight) => (
                <div key={insight} className="flex gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-800/60">
                  <ReportIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  <p className="text-sm text-gray-600 dark:text-gray-300">{insight}</p>
                </div>
              ))}
            </div>
          </SectionPanel>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <SectionPanel title="Shift Kasir" subtitle="Kontrol opening, closing, dan review kas.">
            <div className="space-y-3">
              {cashShiftRows.map((shift) => (
                <div key={shift.id} className="rounded-lg border border-gray-200 p-3 dark:border-gray-800">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-gray-900 dark:text-white">{shift.id}</p>
                    <StatusPill tone={shift.status === "open" ? "emerald" : shift.status === "review" ? "amber" : "slate"}>
                      {shift.status}
                    </StatusPill>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">{shift.cashierName}</p>
                  <p className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(shift.expectedCash)}
                  </p>
                </div>
              ))}
            </div>
          </SectionPanel>
          <SectionPanel title="Invoice Queue" subtitle="Pengiriman invoice setelah pembayaran.">
            <div className="space-y-3">
              {invoiceRows.map((invoice) => (
                <div key={invoice.id} className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/60">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-mono text-xs font-medium text-gray-900 dark:text-white">{invoice.invoiceNo}</p>
                    <StatusPill tone={invoice.status === "sent" ? "emerald" : "amber"}>{invoice.status}</StatusPill>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">{invoice.recipient} / {invoice.channel}</p>
                </div>
              ))}
            </div>
          </SectionPanel>
          <SectionPanel title="Booking Queue" subtitle="Kapasitas kelas dan waiting list.">
            <div className="space-y-3">
              {classBookingQueue.map((booking) => (
                <div key={booking.id} className="rounded-lg border border-gray-200 p-3 dark:border-gray-800">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-gray-900 dark:text-white">{booking.className}</p>
                    <StatusPill tone={booking.status === "waitlist" ? "amber" : "emerald"}>{booking.status}</StatusPill>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">{booking.memberName} / {booking.capacity}</p>
                </div>
              ))}
            </div>
          </SectionPanel>
        </div>
      </div>
    );
  };

  const renderFinance = () => {
    const financeKey = slug.at(-1);

    if (slug[1] === "cash-shifts" && slug[2]) {
      const shiftId = decodeURIComponent(slug[2]);
      const shift = cashShiftRows.find((item) => item.id === shiftId);
      const transactions = branchSnapshot.scopedTransactions.filter((transaction) => transaction.cashierName === shift?.cashierName);

      if (!shift) {
        return (
          <SectionPanel title="Shift Tidak Ditemukan" subtitle="Shift kasir tidak ada di data cabang aktif.">
            <button
              type="button"
              onClick={() => router.push("/finance/cash-shifts")}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-200 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300"
            >
              Kembali ke Shift Kasir
            </button>
          </SectionPanel>
        );
      }

      return (
        <div className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => router.push("/finance/cash-shifts")}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-200 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300"
            >
              Kembali
            </button>
            {shift.status === "open" ? (
              <PrimaryToolbarButton onClick={() => openCloseShiftModal(shift)}>
                Close Shift
              </PrimaryToolbarButton>
            ) : (
              <button
                type="button"
                onClick={() => reopenCashShift(shift.id)}
                className="inline-flex h-10 items-center justify-center rounded-lg bg-amber-500 px-4 text-sm font-semibold text-white hover:bg-amber-600"
              >
                Reopen Shift
              </button>
            )}
          </div>
          <SectionPanel title={shift.id} subtitle="Detail opening, closing, expected cash, dan selisih kas.">
            <div className="grid gap-4 md:grid-cols-4">
              <StatCard label="Kasir" value={shift.cashierName} helper={shift.openedAt} icon={<CashRegisterIcon className="h-5 w-5" />} tone="emerald" />
              <StatCard label="Expected" value={formatCurrency(shift.expectedCash)} helper="Sistem" icon={<CreditCardIcon className="h-5 w-5" />} tone="sky" />
              <StatCard label="Counted" value={formatCurrency(shift.countedCash)} helper="Hitung fisik" icon={<CheckSmallIcon className="h-5 w-5" />} tone={shift.status === "review" ? "amber" : "slate"} />
              <StatCard label="Selisih" value={formatCurrency(shift.countedCash - shift.expectedCash)} helper={shift.status} icon={<ReportIcon className="h-5 w-5" />} tone={shift.countedCash === shift.expectedCash ? "emerald" : "amber"} />
            </div>
          </SectionPanel>
          <SectionPanel title="Transaksi Kasir" subtitle="Transaksi yang ditangani kasir pada cabang aktif.">
            <DataTable
              data={transactions}
              getKey={(transaction) => transaction.id}
              columns={[
                { header: "Invoice", cell: (transaction) => <span className="font-mono text-xs">{transaction.id}</span> },
                { header: "Member", cell: (transaction) => transaction.memberName },
                { header: "Nominal", cell: (transaction) => formatCurrency(transaction.amount) },
                { header: "Status", cell: (transaction) => <StatusPill tone={transaction.status === "completed" ? "emerald" : transaction.status === "pending" ? "amber" : "rose"}>{transaction.status}</StatusPill> },
              ]}
            />
          </SectionPanel>
        </div>
      );
    }

    if (financeKey === "cash-shifts") {
      return (
        <SectionPanel title="Shift Kasir" subtitle="Opening, closing, expected cash, dan review kasir per cabang.">
          <DataTable
            data={cashShiftRows.filter((shift) => shift.branchId === activeBranch.id || activeBranch.id === "branch-pusat")}
            getKey={(shift) => shift.id}
            columns={[
              { header: "Shift", cell: (shift) => <span className="font-mono text-xs">{shift.id}</span> },
              { header: "Kasir", cell: (shift) => <span className="font-medium text-gray-900 dark:text-white">{shift.cashierName}</span> },
              { header: "Opened", cell: (shift) => shift.openedAt },
              { header: "Closed", cell: (shift) => shift.closedAt || "-" },
              { header: "Opening Cash", cell: (shift) => formatCurrency(shift.openingCash) },
              { header: "Expected", cell: (shift) => formatCurrency(shift.expectedCash) },
              {
                header: "Status",
                cell: (shift) => (
                  <StatusPill tone={shift.status === "open" ? "emerald" : shift.status === "review" ? "amber" : "slate"}>
                    {shift.status}
                  </StatusPill>
                ),
              },
              {
                header: "Aksi",
                cell: (shift) => (
                  <div className="flex gap-2">
                    <TableActionIconButton
                      label="Detail shift"
                      icon={<EyeIcon />}
                      onClick={() => router.push(`/finance/cash-shifts/${encodeURIComponent(shift.id)}`)}
                      variant="info"
                    />
                    {shift.status === "open" ? (
                      <TableActionIconButton
                        label="Close shift"
                        icon={<CheckSmallIcon />}
                        onClick={() => openCloseShiftModal(shift)}
                        variant="success"
                      />
                    ) : (
                      <TableActionIconButton
                        label="Reopen shift"
                        icon={<RefreshIcon />}
                        onClick={() => {
                          reopenCashShift(shift.id);
                          addAuditLog({
                            branchId: activeBranch.id,
                            actor: currentUser.name,
                            action: "cash-shift.reopen",
                            target: shift.id,
                          });
                        }}
                        variant="warning"
                      />
                    )}
                  </div>
                ),
              },
            ]}
          />
        </SectionPanel>
      );
    }

    if (financeKey === "refunds") {
      return (
        <div className="grid gap-6 lg:grid-cols-2">
          <SectionPanel title="Request Refund / Void" subtitle="Semua pembatalan transaksi wajib approval dan masuk audit log.">
            <DataTable
              data={branchSnapshot.scopedTransactions}
              getKey={(transaction) => transaction.id}
              columns={[
                { header: "Invoice", cell: (transaction) => <span className="font-mono text-xs">{transaction.id}</span> },
                { header: "Member", cell: (transaction) => transaction.memberName },
                { header: "Deskripsi", cell: (transaction) => transaction.description },
                { header: "Nominal", cell: (transaction) => formatCurrency(transaction.amount) },
                {
                  header: "Status",
                  cell: (transaction) => (
                    <StatusPill tone={transaction.status === "completed" ? "emerald" : transaction.status === "pending" ? "amber" : "rose"}>
                      {transaction.status}
                    </StatusPill>
                  ),
                },
                {
                  header: "Aksi",
                  cell: (transaction) => (
                    <div className="flex gap-2">
                      <TableActionIconButton label="Detail" icon={<EyeIcon />} onClick={() => openTransactionDetail(transaction)} variant="info" />
                      <TableActionIconButton
                        label="Void"
                        icon={<XSmallIcon />}
                        disabled={transaction.status !== "completed"}
                        onClick={() =>
                          requestDelete({
                            title: "Void / Refund Transaksi",
                            message: "Transaksi akan masuk status void dan tercatat di audit log.",
                            target: transaction.id,
                            confirmLabel: "Void",
                            onConfirm: () => {
                              voidTransaction(transaction.id);
                              addAuditLog({
                                branchId: activeBranch.id,
                                actor: currentUser.name,
                                action: "pos.refund-void",
                                target: transaction.id,
                              });
                            },
                          })
                        }
                        variant="delete"
                      />
                    </div>
                  ),
                },
              ]}
            />
          </SectionPanel>
          <SectionPanel title="Approval Flow" subtitle="Flow yang nanti dipakai di backend.">
            <div className="space-y-3">
              {["Kasir membuat request", "Admin review nominal", "Owner approve jika di atas limit", "Stok dan ledger otomatis dikoreksi"].map((step, index) => (
                <div key={step} className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-800/60">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-sm font-semibold text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
                    {index + 1}
                  </span>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{step}</p>
                </div>
              ))}
            </div>
          </SectionPanel>
        </div>
      );
    }

    if (financeKey === "trainer-commission") {
      return (
        <SectionPanel title="Komisi Trainer" subtitle="Perhitungan komisi trainer dari sesi, rate, target, dan payout.">
          <DataTable
            data={trainerRows}
            getKey={(trainer) => trainer.id}
            columns={[
              { header: "Trainer", cell: (trainer) => <span className="font-medium text-gray-900 dark:text-white">{trainer.name}</span> },
              { header: "Rate", cell: (trainer) => formatCurrency(trainer.hourlyRate) },
              { header: "Sesi", cell: (trainer) => `${trainer.currentSessions}/${trainer.monthlyTarget}` },
              { header: "Client Aktif", cell: (trainer) => trainer.activeClients },
              { header: "Rating", cell: (trainer) => trainer.rating },
              { header: "Komisi", cell: (trainer) => <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(trainer.commission)}</span> },
              {
                header: "Status",
                cell: (trainer) => (
                  <StatusPill tone={trainer.status === "active" ? "emerald" : "amber"}>{trainer.status}</StatusPill>
                ),
              },
            ]}
          />
        </SectionPanel>
      );
    }

    if (financeKey === "cashflow") {
      return (
        <div className="grid gap-6 xl:grid-cols-3">
          <SectionPanel title="Cash In" subtitle="Pemasukan dari membership, PT, produk, dan kelas.">
            <p className="text-3xl font-semibold text-gray-900 dark:text-white">
              {formatCurrency(branchSnapshot.revenue)}
            </p>
            <div className="mt-5 space-y-3">
              {branchSnapshot.scopedTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between rounded-lg bg-gray-50 p-3 text-sm dark:bg-gray-800/60">
                  <span className="text-gray-600 dark:text-gray-300">{transaction.type}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(transaction.amount)}</span>
                </div>
              ))}
            </div>
          </SectionPanel>
          <SectionPanel title="Cash Out" subtitle="Biaya dummy untuk service alat, payroll, dan procurement.">
            <div className="space-y-3">
              {[
                ["Service alat", 1250000],
                ["Payroll trainer", 6200000],
                ["Restock produk", 3400000],
                ["Operasional cabang", 1800000],
              ].map(([label, amount]) => (
                <div key={label as string} className="flex items-center justify-between rounded-lg bg-rose-50 p-3 text-sm dark:bg-rose-500/10">
                  <span className="text-rose-700 dark:text-rose-400">{label}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(amount as number)}</span>
                </div>
              ))}
            </div>
          </SectionPanel>
          <SectionPanel title="Profit Snapshot" subtitle="Ringkas untuk owner sebelum masuk laporan detail.">
            <div className="space-y-4">
              {[
                ["Gross margin", 72, "emerald"],
                ["Payroll ratio", 18, "sky"],
                ["Inventory cost", 9, "amber"],
                ["Maintenance cost", 3, "rose"],
              ].map(([label, value, tone]) => (
                <div key={label as string}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-900 dark:text-white">{label}</span>
                    <span className="text-gray-500">{value}%</span>
                  </div>
                  <ProgressBar value={value as number} tone={tone as string} />
                </div>
              ))}
            </div>
          </SectionPanel>
        </div>
      );
    }

    return (
      <div className="grid gap-6 xl:grid-cols-3">
        <SectionPanel title="Invoice Queue" subtitle="Invoice yang siap dikirim ke member.">
          <DataTable
              data={invoiceRows}
            getKey={(invoice) => invoice.id}
            columns={[
              { header: "Invoice", cell: (invoice) => <span className="font-mono text-xs">{invoice.invoiceNo}</span> },
              { header: "Penerima", cell: (invoice) => invoice.recipient },
              { header: "Channel", cell: (invoice) => invoice.channel },
              { header: "Generated", cell: (invoice) => invoice.generatedAt },
              {
                header: "Status",
                cell: (invoice) => (
                  <StatusPill tone={invoice.status === "sent" ? "emerald" : "amber"}>{invoice.status}</StatusPill>
                ),
              },
            ]}
          />
        </SectionPanel>
        <SectionPanel title="Revenue Cabang" subtitle="Pendapatan dari transaksi selesai.">
          <p className="text-3xl font-semibold text-gray-900 dark:text-white">
            {formatCurrency(branchSnapshot.revenue)}
          </p>
          <div className="mt-5 space-y-3">
            {branchSnapshot.scopedTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">{transaction.type}</span>
                <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(transaction.amount)}</span>
              </div>
            ))}
          </div>
        </SectionPanel>
        <SectionPanel title="Payment Rules" subtitle="Aturan kasir sebelum transaksi valid.">
          <div className="space-y-3">
            {["Cash shift harus open", "Invoice number unik per cabang", "Void butuh approval", "Stok produk berkurang otomatis"].map((rule) => (
              <div key={rule} className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600 dark:bg-gray-800/60 dark:text-gray-300">
                {rule}
              </div>
            ))}
          </div>
        </SectionPanel>
      </div>
    );
  };

  const renderStockMaintenance = () => {
    const inventoryKey = slug.at(-1);

    if (inventoryKey === "maintenance") {
      return (
        <div className="grid gap-4 lg:grid-cols-3">
          {equipmentRows
            .filter((item) => item.branchId === activeBranch.id || activeBranch.id === "branch-pusat")
            .map((item) => (
              <SectionPanel key={item.id} title={item.equipmentName} subtitle={item.location}>
                <div className="flex items-center justify-between">
                  <StatusPill tone={item.status === "ok" ? "emerald" : "amber"}>{item.status}</StatusPill>
                  <span className="text-sm text-gray-500">{item.nextCheck}</span>
                </div>
              </SectionPanel>
            ))}
        </div>
      );
    }

    if (inventoryKey === "suppliers") {
      return (
        <div className="grid gap-4 lg:grid-cols-3">
          {["FitSupply Indonesia", "ProteinHub Jakarta", "GymTech Service"].map((supplier, index) => (
            <SectionPanel key={supplier} title={supplier} subtitle={index === 2 ? "Service alat" : "Produk & restock"}>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                SLA {index + 1} hari / PIC procurement pusat
              </p>
            </SectionPanel>
          ))}
        </div>
      );
    }

    return (
      <div className="grid gap-6 xl:grid-cols-3">
        <SectionPanel title="Stok Cabang" subtitle={`Snapshot stok ${activeBranch.name}.`}>
          <div className="space-y-3">
            {branchSnapshot.scopedInventory.slice(0, 6).map((item) => (
              <div key={item.id}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-900 dark:text-white">{item.name}</span>
                  <span className={item.stock <= item.minStock ? "text-amber-600" : "text-gray-500"}>{item.stock}</span>
                </div>
                <ProgressBar value={(item.stock / Math.max(item.minStock * 3, 1)) * 100} tone={item.stock <= item.minStock ? "amber" : "emerald"} />
              </div>
            ))}
          </div>
        </SectionPanel>
        <SectionPanel title="Mutasi Stok" subtitle="Dummy flow barang masuk dan keluar.">
          <div className="space-y-3">
            {["Restock Whey Protein +12", "Penjualan Protein Shake -8", "Transfer T-Shirt ke BSD -5", "Adjustment Gloves +2"].map((movement) => (
              <div key={movement} className="rounded-lg bg-gray-50 p-3 text-sm text-gray-700 dark:bg-gray-800/60 dark:text-gray-300">
                {movement}
              </div>
            ))}
          </div>
        </SectionPanel>
        <SectionPanel title="Reorder Rules" subtitle="Aturan reorder otomatis per cabang.">
          <div className="space-y-3">
            {businessRules.filter((rule) => rule.toLowerCase().includes("stok") || rule.toLowerCase().includes("branch")).map((rule) => (
              <div key={rule} className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600 dark:bg-gray-800/60 dark:text-gray-300">
                {rule}
              </div>
            ))}
          </div>
        </SectionPanel>
      </div>
    );
  };

  const renderMemberPortal = () => {
    const portalKey = slug.at(-1);
    const currentMember =
      memberRows.find((member) => member.email === currentUser.email) ?? memberRows[0]!;
    const memberVisits = checkInRows.filter((checkIn) => checkIn.memberId === currentMember.id);
    const memberBookings = branchSnapshot.scopedClassBookings.filter((booking) => booking.memberId === currentMember.id);
    const memberPtSessions = branchSnapshot.scopedPtSessions.filter((session) => session.memberId === currentMember.id);
    const memberTransactions = branchSnapshot.scopedTransactions.filter((transaction) => transaction.memberName === currentMember.name);
    const activeMemberPromos = promoRows.filter((promo) => promo.status === "active");
    const memberStatusTone = (status: MemberRow["membershipStatus"]): StatCardProps["tone"] =>
      status === "active" ? "emerald" : status === "frozen" ? "amber" : "rose";

    const renderMemberSummary = () => (
      <SectionPanel title="Membership Saya" subtitle="Status membership, point, QR, dan data dasar member.">
        <div className="rounded-xl bg-gray-900 p-5 text-white">
          <div className="flex items-center justify-between">
            <DumbbellIcon className="h-8 w-8 text-emerald-400" />
            <span className="text-xs uppercase tracking-[0.2em] text-gray-300">
              {currentMember.membershipType}
            </span>
          </div>
          <p className="mt-8 text-xl font-semibold">{currentMember.name}</p>
          <p className="mt-1 text-sm text-gray-300">{currentMember.id} / {currentMember.referralCode}</p>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/60">
            <p className="text-xs text-gray-500">Status</p>
            <StatusPill tone={memberStatusTone(currentMember.membershipStatus)}>{currentMember.membershipStatus}</StatusPill>
          </div>
          <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/60">
            <p className="text-xs text-gray-500">Expired</p>
            <p className="font-semibold text-gray-900 dark:text-white">{currentMember.membershipEnd}</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/60">
            <p className="text-xs text-gray-500">Point</p>
            <p className="font-semibold text-gray-900 dark:text-white">{currentMember.points.toLocaleString("id-ID")}</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/60">
            <p className="text-xs text-gray-500">Check-in</p>
            <p className="font-semibold text-gray-900 dark:text-white">{currentMember.checkins}x</p>
          </div>
        </div>
      </SectionPanel>
    );

    if (portalKey === "membership" || portalKey === "profile") {
      return (
        <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          {renderMemberSummary()}
          <SectionPanel title={portalKey === "profile" ? "Profile Saya" : "Detail Membership"} subtitle="Data member yang terlihat dari portal member.">
            <DataTable
              data={[
                { label: "Nama", value: currentMember.name },
                { label: "Email", value: currentMember.email },
                { label: "Telepon", value: currentMember.phone },
                { label: "Paket", value: currentMember.membershipType },
                { label: "Tanggal Join", value: currentMember.joinDate },
                { label: "Berakhir", value: currentMember.membershipEnd },
                { label: "Referral", value: currentMember.referralCode },
              ]}
              getKey={(row) => row.label}
              columns={[
                { header: "Field", cell: (row) => row.label },
                { header: "Data", cell: (row) => <span className="font-medium text-gray-900 dark:text-white">{row.value}</span> },
              ]}
            />
          </SectionPanel>
        </div>
      );
    }

    if (portalKey === "qr-check-in") {
      return (
        <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <SectionPanel title="QR Check-In" subtitle="QR digital untuk masuk gym sesuai membership dan akses cabang.">
            <div className="rounded-xl border border-dashed border-emerald-300 bg-emerald-50 p-8 text-center dark:border-emerald-500/30 dark:bg-emerald-500/10">
              <QrCodeIcon className="mx-auto h-28 w-28 text-emerald-600 dark:text-emerald-400" />
              <p className="mt-4 font-mono text-sm font-semibold text-gray-900 dark:text-white">
                QR-{currentMember.id}-{activeBranch.code}
              </p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Berlaku untuk {activeBranch.name}
              </p>
            </div>
          </SectionPanel>
          <SectionPanel title="Riwayat Check-In" subtitle="Aktivitas check-in saya.">
            <DataTable
              data={memberVisits}
              getKey={(checkIn) => checkIn.id}
              columns={[
                { header: "Tanggal", cell: (checkIn) => checkIn.date },
                { header: "Masuk", cell: (checkIn) => checkIn.time },
                { header: "Keluar", cell: (checkIn) => checkIn.checkoutTime || "-" },
                { header: "Gate", cell: (checkIn) => checkIn.gate },
              ]}
            />
          </SectionPanel>
        </div>
      );
    }

    if (portalKey === "today" || portalKey === "my-schedule") {
      return (
        <div className="grid gap-6 xl:grid-cols-2">
          <SectionPanel title={portalKey === "today" ? "Jadwal Hari Ini" : "Jadwal Saya"} subtitle="Kelas dan sesi PT yang terkait dengan member.">
            <DataTable
              data={[
                ...memberBookings.map((booking) => ({
                  id: booking.id,
                  type: "Kelas",
                  name: booking.className,
                  date: booking.date,
                  time: booking.time,
                  status: booking.status,
                })),
                ...memberPtSessions.map((session) => ({
                  id: session.id,
                  type: "PT",
                  name: session.focus,
                  date: session.date,
                  time: session.time,
                  status: session.status,
                })),
              ]}
              getKey={(item) => item.id}
              columns={[
                { header: "Tipe", cell: (item) => item.type },
                { header: "Jadwal", cell: (item) => <span className="font-medium text-gray-900 dark:text-white">{item.name}</span> },
                { header: "Tanggal", cell: (item) => item.date },
                { header: "Jam", cell: (item) => item.time },
                { header: "Status", cell: (item) => <StatusPill tone={item.status === "completed" || item.status === "attended" ? "emerald" : item.status === "cancelled" ? "rose" : "sky"}>{item.status}</StatusPill> },
              ]}
            />
          </SectionPanel>
          <SectionPanel title="Rekomendasi Kelas" subtitle="Jadwal kelas terdekat di cabang aktif.">
            <DataTable
              data={branchSnapshot.scopedClasses.slice(0, 6)}
              getKey={(gymClass) => gymClass.id}
              columns={[
                { header: "Kelas", cell: (gymClass) => gymClass.name },
                { header: "Jadwal", cell: (gymClass) => `${gymClass.schedule[0]?.day ?? "-"} ${gymClass.schedule[0]?.time ?? "-"}` },
                { header: "Slot", cell: (gymClass) => `${gymClass.currentParticipants}/${gymClass.maxParticipants}` },
              ]}
            />
          </SectionPanel>
        </div>
      );
    }

    if (portalKey === "promos") {
      return (
        <SectionPanel title="Promo Gym" subtitle="Promo terbaru yang bisa dipakai member.">
          <DataTable
            data={activeMemberPromos}
            getKey={(promo) => promo.id}
            columns={[
              { header: "Kode", cell: (promo) => <span className="font-mono text-xs">{promo.code}</span> },
              { header: "Promo", cell: (promo) => <span className="font-medium text-gray-900 dark:text-white">{promo.name}</span> },
              { header: "Diskon", cell: (promo) => promo.type === "percentage" ? `${promo.discount}%` : formatCurrency(promo.discount) },
              { header: "Berlaku", cell: (promo) => promo.validUntil },
              { header: "Status", cell: (promo) => <StatusPill tone="emerald">{promo.status}</StatusPill> },
            ]}
          />
        </SectionPanel>
      );
    }

    if (portalKey === "progress") {
      return (
        <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <SectionPanel title="Progress Saya" subtitle="Progress latihan dan profil tubuh member.">
            <div className="space-y-4">
              {[
                { label: "Berat", value: `${currentMember.weight ?? "-"} kg`, progress: 72 },
                { label: "Tinggi", value: `${currentMember.height ?? "-"} cm`, progress: 100 },
                { label: "BMI", value: String(currentMember.bmi ?? "-"), progress: 64 },
                { label: "Check-in", value: `${currentMember.checkins}x`, progress: 84 },
              ].map((item, index) => (
                <div key={item.label}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-900 dark:text-white">{item.label}</span>
                    <span className="text-gray-500">{item.value}</span>
                  </div>
                  <ProgressBar value={item.progress} tone={index % 2 ? "sky" : "emerald"} />
                </div>
              ))}
            </div>
          </SectionPanel>
          <SectionPanel title="Histori Latihan" subtitle="Check-in dan PT session saya.">
            <DataTable
              data={[
                ...memberVisits.map((visit) => ({ id: visit.id, activity: "Check-In", date: visit.date, note: visit.gate, status: visit.checkoutTime ? "Selesai" : "Aktif" })),
                ...memberPtSessions.map((session) => ({ id: session.id, activity: "PT Session", date: session.date, note: session.focus, status: session.status })),
              ]}
              getKey={(row) => row.id}
              columns={[
                { header: "Aktivitas", cell: (row) => row.activity },
                { header: "Tanggal", cell: (row) => row.date },
                { header: "Catatan", cell: (row) => row.note },
                { header: "Status", cell: (row) => row.status },
              ]}
            />
          </SectionPanel>
        </div>
      );
    }

    if (portalKey === "book-class" || portalKey === "classes") {
      return (
        <SectionPanel title={portalKey === "book-class" ? "Booking Kelas" : "Jadwal Kelas"} subtitle="Reservasi kelas gym dari portal member.">
          {classBookingMessage && <p className="mb-4 text-sm text-emerald-600 dark:text-emerald-400">{classBookingMessage}</p>}
          <DataTable
            data={branchSnapshot.scopedClasses}
            getKey={(gymClass) => gymClass.id}
            columns={[
              { header: "Kelas", cell: (gymClass) => <span className="font-medium text-gray-900 dark:text-white">{gymClass.name}</span> },
              { header: "Jadwal", cell: (gymClass) => `${gymClass.schedule[0]?.day ?? "-"} ${gymClass.schedule[0]?.time ?? "-"}` },
              { header: "Slot", cell: (gymClass) => `${gymClass.currentParticipants}/${gymClass.maxParticipants}` },
              { header: "Status", cell: (gymClass) => <StatusPill tone={gymClass.status === "full" ? "rose" : "emerald"}>{gymClass.status}</StatusPill> },
              {
                header: "Aksi",
                cell: (gymClass) => (
                  <button
                    type="button"
                    disabled={portalKey !== "book-class" || gymClass.status === "full"}
                    onClick={() => {
                      const result = createClassBooking({
                        branchId: activeBranch.id,
                        classId: gymClass.id,
                        memberId: currentMember.id,
                        date: prototypeToday,
                      });
                      setClassBookingMessage(result ? `${gymClass.name} berhasil dibooking.` : "Booking gagal. Slot penuh atau member tidak valid.");
                    }}
                    className={`rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-emerald-500/10 dark:text-emerald-400`}
                  >
                    Booking
                  </button>
                ),
              },
            ]}
          />
        </SectionPanel>
      );
    }

    if (portalKey === "book-trainer") {
      return (
        <SectionPanel title="Booking Trainer" subtitle="Booking personal trainer dari portal member.">
          {ptBookingMessage && <p className="mb-4 text-sm text-emerald-600 dark:text-emerald-400">{ptBookingMessage}</p>}
          <DataTable
            data={trainerRows.filter((trainer) => trainer.status === "active")}
            getKey={(trainer) => trainer.id}
            columns={[
              { header: "Trainer", cell: (trainer) => <span className="font-medium text-gray-900 dark:text-white">{trainer.name}</span> },
              { header: "Spesialisasi", cell: (trainer) => trainer.specializations.slice(0, 2).join(", ") },
              { header: "Rate", cell: (trainer) => formatCurrency(trainer.hourlyRate) },
              { header: "Rating", cell: (trainer) => trainer.rating },
              {
                header: "Aksi",
                cell: (trainer) => (
                  <button
                    type="button"
                    onClick={() => {
                      const result = createPtBooking({
                        branchId: activeBranch.id,
                        trainerId: trainer.id,
                        memberId: currentMember.id,
                        date: prototypeToday,
                        time: "18:00",
                        duration: 60,
                        focus: "Member Portal Booking",
                      });
                      setPtBookingMessage(result ? `Booking PT dengan ${trainer.name} berhasil dibuat.` : "Booking PT gagal. Jadwal trainer bentrok.");
                    }}
                    className="rounded-lg bg-sky-50 px-3 py-1.5 text-xs font-medium text-sky-700 hover:bg-sky-100 dark:bg-sky-500/10 dark:text-sky-400"
                  >
                    Booking PT
                  </button>
                ),
              },
            ]}
          />
        </SectionPanel>
      );
    }

    if (portalKey === "payments") {
      return (
        <SectionPanel title="Pembayaran Saya" subtitle="Histori transaksi member.">
          <DataTable
            data={memberTransactions}
            getKey={(transaction) => transaction.id}
            columns={[
              { header: "Invoice", cell: (transaction) => <span className="font-mono text-xs">{transaction.id}</span> },
              { header: "Deskripsi", cell: (transaction) => transaction.description },
              { header: "Nominal", cell: (transaction) => formatCurrency(transaction.amount) },
              { header: "Metode", cell: (transaction) => transaction.paymentMethod },
              { header: "Status", cell: (transaction) => <StatusPill tone={transaction.status === "completed" ? "emerald" : "amber"}>{transaction.status}</StatusPill> },
            ]}
          />
        </SectionPanel>
      );
    }

    if (portalKey === "points" || portalKey === "referrals") {
      return (
        <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
          <SectionPanel title={portalKey === "points" ? "Point Saya" : "Referral Saya"} subtitle="Point loyalty dan referral member.">
            <p className="text-4xl font-semibold text-gray-900 dark:text-white">{currentMember.points.toLocaleString("id-ID")}</p>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Kode referral: <span className="font-mono">{currentMember.referralCode}</span></p>
          </SectionPanel>
          <SectionPanel title="Reward" subtitle="Katalog reward yang bisa ditukar dengan point.">
            <DataTable
              data={rewardRows}
              getKey={(reward) => reward.id}
              columns={[
                { header: "Reward", cell: (reward) => reward.name },
                { header: "Point", cell: (reward) => `${reward.points.toLocaleString("id-ID")} pts` },
                { header: "Stok", cell: (reward) => reward.stock },
                { header: "Status", cell: (reward) => <StatusPill tone={currentMember.points >= reward.points ? "emerald" : "slate"}>{currentMember.points >= reward.points ? "Bisa ditukar" : "Kurang point"}</StatusPill> },
              ]}
            />
          </SectionPanel>
        </div>
      );
    }

    return (
      <div className="grid gap-6 xl:grid-cols-3">
        {renderMemberSummary()}
        <SectionPanel title="Booking Tersedia" subtitle="Kelas dan PT yang bisa dipilih member.">
          <div className="space-y-3">
            {branchSnapshot.scopedClasses.slice(0, 3).map((gymClass) => (
              <div key={gymClass.id} className="rounded-lg border border-gray-200 p-3 dark:border-gray-800">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{gymClass.name}</p>
                    <p className="text-sm text-gray-500">{gymClass.schedule[0]?.day} {gymClass.schedule[0]?.time}</p>
                  </div>
                  <StatusPill tone={gymClass.status === "full" ? "rose" : "emerald"}>
                    {gymClass.status === "full" ? "Penuh" : "Booking"}
                  </StatusPill>
                </div>
              </div>
            ))}
          </div>
        </SectionPanel>
        <SectionPanel title="Reward" subtitle="Tukar point langsung dari portal member.">
          <div className="space-y-3">
            {rewardRows.slice(0, 4).map((reward) => (
              <div key={reward.id} className="flex items-center justify-between rounded-lg bg-amber-50 p-3 dark:bg-amber-500/10">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{reward.name}</p>
                  <p className="text-xs text-amber-700 dark:text-amber-400">{reward.points.toLocaleString("id-ID")} pts</p>
                </div>
                <GiftIcon className="h-5 w-5 text-amber-500" />
              </div>
            ))}
          </div>
        </SectionPanel>
      </div>
    );
  };

  const renderTrainerPortal = () => (
    <div className="grid gap-6 xl:grid-cols-3">
      <SectionPanel title="Jadwal Hari Ini" subtitle="Sesi PT yang perlu dieksekusi.">
        <div className="space-y-3">
          {branchSnapshot.scopedPtSessions.slice(0, 4).map((session) => (
            <div key={session.id} className="rounded-lg border border-gray-200 p-3 dark:border-gray-800">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{session.memberName}</p>
                  <p className="text-sm text-gray-500">{session.time} / {session.focus}</p>
                </div>
                <StatusPill tone={session.status === "completed" ? "emerald" : "sky"}>
                  {session.status === "completed" ? "Selesai" : "Terjadwal"}
                </StatusPill>
              </div>
            </div>
          ))}
        </div>
      </SectionPanel>
      <SectionPanel title="Client Progress" subtitle="Ringkasan progres client aktif.">
        <div className="space-y-4">
          {memberRows.slice(0, 4).map((member, index) => (
            <div key={member.id}>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-gray-900 dark:text-white">{member.name}</span>
                <span className="text-gray-500">{65 + index * 7}%</span>
              </div>
              <ProgressBar value={65 + index * 7} tone={index % 2 ? "sky" : "emerald"} />
            </div>
          ))}
        </div>
      </SectionPanel>
      <SectionPanel title="Komisi" subtitle="Tracking target dan estimasi payout trainer.">
        <p className="text-3xl font-semibold text-gray-900 dark:text-white">Rp 4,8jt</p>
        <p className="mt-1 text-sm text-gray-500">80% target sesi bulan ini</p>
        <div className="mt-5">
          <ProgressBar value={80} />
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/60">
            <p className="text-xs text-gray-500">Sesi</p>
            <p className="font-semibold text-gray-900 dark:text-white">48/60</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/60">
            <p className="text-xs text-gray-500">Rating</p>
            <p className="font-semibold text-gray-900 dark:text-white">4.9</p>
          </div>
        </div>
      </SectionPanel>
    </div>
  );

  const renderSystemFlow = () => {
    const activeMembers = branchSnapshot.scopedMembers.filter(
      (member) => member.membershipStatus === "active",
    ).length;
    const pendingInvoices = invoiceRows.filter((invoice) => invoice.status !== "sent").length;
    const queuedMessages = whatsappMessages.filter(
      (message) => message.branchId === activeBranch.id && message.status === "queued",
    ).length;

    const systemFlows = [
      {
        id: "member-journey",
        title: "Member Journey",
        subtitle: "Dari daftar member sampai progress latihan.",
        icon: <MemberIcon className="h-5 w-5" />,
        tone: "emerald" as const,
        metric: `${activeMembers} aktif`,
        steps: [
          {
            title: "Registrasi",
            module: "Member / Data Member",
            actor: "Receptionist atau Owner",
            input: "Profil, kontak, cabang, referral",
            output: "Member ID, akses cabang, histori awal",
            detail: "Data member dibuat sekali, lalu dipakai oleh membership, check-in, kelas, PT, promo, dan laporan.",
          },
          {
            title: "Pilih Paket",
            module: "Paket Membership",
            actor: "Kasir atau Owner",
            input: "Paket, durasi, harga, promo",
            output: "Membership aktif atau pending bayar",
            detail: "Sistem membaca master paket dan promo aktif sebelum membuat invoice membership.",
          },
          {
            title: "Pembayaran",
            module: "Kasir & Invoice",
            actor: "Kasir",
            input: "Metode bayar, diskon, pajak",
            output: "Invoice paid, audit pembayaran",
            detail: "Setelah invoice lunas, status membership otomatis siap dipakai untuk QR check-in dan booking.",
          },
          {
            title: "Check-In",
            module: "Scan QR Check-In",
            actor: "Front desk",
            input: "QR member, cabang aktif",
            output: "Kunjungan live, attendance log",
            detail: "Validasi mengecek membership aktif, akses cabang, freeze, expired, dan duplikasi scan.",
          },
          {
            title: "Progress",
            module: "Progress Member",
            actor: "Trainer atau Staff",
            input: "Berat, BMI, catatan latihan",
            output: "Grafik progress dan insight retensi",
            detail: "Progress member tersambung ke jadwal PT, histori kunjungan, dan analisa member.",
          },
        ],
      },
      {
        id: "pos-payment",
        title: "POS & Pembayaran",
        subtitle: "Alur kasir dari cart sampai laporan pendapatan.",
        icon: <CashRegisterIcon className="h-5 w-5" />,
        tone: "amber" as const,
        metric: `${pendingInvoices} pending`,
        steps: [
          {
            title: "Pilih Item",
            module: "POS / Kasir",
            actor: "Kasir",
            input: "Membership, PT, produk",
            output: "Cart transaksi",
            detail: "Cart POS menggabungkan layanan gym dan produk stok dalam satu proses checkout.",
          },
          {
            title: "Promo",
            module: "Promo Gym",
            actor: "Kasir",
            input: "Kode promo, point, referral",
            output: "Diskon tervalidasi",
            detail: "Promo aktif dari modul Promo & Loyalty bisa dipakai sebelum pembayaran final.",
          },
          {
            title: "Bayar",
            module: "Metode Pembayaran",
            actor: "Kasir",
            input: "Cash, transfer, QRIS, kartu",
            output: "Invoice dan receipt",
            detail: "Popup bayar menjadi pusat input metode pembayaran, catatan, diskon, dan konfirmasi transaksi.",
          },
          {
            title: "Update Data",
            module: "Member, PT, Stok",
            actor: "Sistem",
            input: "Invoice paid",
            output: "Membership aktif, stok berkurang",
            detail: "Transaksi yang selesai otomatis memperbarui modul terkait sesuai tipe item yang dibayar.",
          },
          {
            title: "Laporan",
            module: "Laporan Pendapatan",
            actor: "Owner",
            input: "Transaksi dan shift kasir",
            output: "Omzet, margin, rekonsiliasi",
            detail: "Owner melihat pendapatan per cabang, metode pembayaran, kasir, promo, dan periode.",
          },
        ],
      },
      {
        id: "class-trainer",
        title: "Kelas & Trainer",
        subtitle: "Jadwal, booking, absensi, komisi, dan rating.",
        icon: <TrainerIcon className="h-5 w-5" />,
        tone: "sky" as const,
        metric: `${branchSnapshot.scopedClasses.length} kelas`,
        steps: [
          {
            title: "Buat Jadwal",
            module: "Jadwal Kelas / Trainer",
            actor: "Owner atau Staff",
            input: "Trainer, room, slot, kapasitas",
            output: "Slot tersedia",
            detail: "Jadwal menjadi acuan booking member, attendance kelas, dan kalender trainer.",
          },
          {
            title: "Booking",
            module: "Booking Kelas / PT",
            actor: "Member atau Staff",
            input: "Member, slot, paket aktif",
            output: "Booking confirmed atau waiting list",
            detail: "Sistem mengecek membership, kapasitas, bentrok jadwal, dan kuota paket PT.",
          },
          {
            title: "Absensi",
            module: "Absensi Kelas",
            actor: "Trainer",
            input: "Daftar booking hadir",
            output: "Attendance log",
            detail: "Absensi menjadi bukti kelas berjalan dan dasar performa trainer.",
          },
          {
            title: "Komisi",
            module: "Komisi Trainer",
            actor: "Owner",
            input: "Sesi selesai, paket PT",
            output: "Estimasi payout",
            detail: "Komisi dihitung dari sesi selesai, target trainer, paket, dan kebijakan cabang.",
          },
          {
            title: "Rating",
            module: "Rating Trainer",
            actor: "Member",
            input: "Review dan score",
            output: "Kualitas layanan",
            detail: "Rating membantu owner melihat trainer paling produktif dan area yang perlu ditingkatkan.",
          },
        ],
      },
      {
        id: "backoffice-control",
        title: "Backoffice Control",
        subtitle: "Master, cabang, akses, audit, dan insight owner.",
        icon: <ShieldIcon className="h-5 w-5" />,
        tone: "rose" as const,
        metric: `${queuedMessages} WA queue`,
        steps: [
          {
            title: "Master Data",
            module: "Pengaturan",
            actor: "Owner",
            input: "Paket, cabang, metode bayar",
            output: "Acuan transaksi",
            detail: "Master data adalah sumber aturan untuk transaksi, booking, POS, notifikasi, dan laporan.",
          },
          {
            title: "Role Akses",
            module: "Role & Akses",
            actor: "Owner",
            input: "User, role, matrix permission",
            output: "Menu dan action terkontrol",
            detail: "Akses tidak hanya mengatur sidebar, tapi juga aksi seperti edit, delete, export, dan approval.",
          },
          {
            title: "Cabang",
            module: "Branch Access",
            actor: "Owner",
            input: "Cabang aktif, user access",
            output: "Data scoped per cabang",
            detail: "Owner bisa pindah cabang, sedangkan staff hanya melihat cabang yang diberikan.",
          },
          {
            title: "Audit",
            module: "Audit Log",
            actor: "Sistem",
            input: "Aksi CRUD dan approval",
            output: "Jejak perubahan",
            detail: "Setiap aksi penting dicatat agar prototype siap diarahkan ke backend real.",
          },
          {
            title: "Analisa",
            module: "Analisa Gym",
            actor: "Owner",
            input: "Member, transaksi, attendance",
            output: "Insight operasional",
            detail: "Laporan menggabungkan performa member, pendapatan, kelas, trainer, stok, dan notifikasi.",
          },
        ],
      },
    ];

    const selectedFlow = systemFlows.find((flow) => flow.id === selectedFlowId) ?? systemFlows[0]!;
    const selectedStep = selectedFlow.steps[selectedFlowStep] ?? selectedFlow.steps[0]!;

    return (
      <div className="space-y-6">
        {/* ── Flow Category Tabs ── */}
        <div className="flex flex-wrap gap-2 rounded-xl border border-gray-200 bg-white/80 p-2 backdrop-blur dark:border-gray-800 dark:bg-white/[0.03]">
          {systemFlows.map((flow) => {
            const active = flow.id === selectedFlow.id;
            return (
              <button
                key={flow.id}
                type="button"
                onClick={() => { setSelectedFlowId(flow.id); setSelectedFlowStep(0); }}
                className={`flex items-center gap-2.5 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                  active
                    ? `${toneClass[flow.tone]} shadow-sm`
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-white/[0.05]"
                }`}
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-lg">{flow.icon}</span>
                <span className="hidden sm:inline">{flow.title}</span>
                <StatusPill tone={active ? flow.tone : "slate"}>{flow.metric}</StatusPill>
              </button>
            );
          })}
        </div>

        {/* ── Interactive Pipeline Timeline ── */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${toneClass[selectedFlow.tone]}`}>
                {selectedFlow.icon}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedFlow.title}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{selectedFlow.subtitle}</p>
              </div>
            </div>
            <StatusPill tone={selectedFlow.tone}>{selectedFlow.steps.length} langkah</StatusPill>
          </div>

          {/* Horizontal Timeline */}
          <div className="relative overflow-x-auto pb-2 -mx-2 px-2">
            <div className="flex items-start min-w-[700px]">
              {selectedFlow.steps.map((step, index) => {
                const isActive = index === selectedFlowStep;
                const isPast = index < selectedFlowStep;
                const isLast = index === selectedFlow.steps.length - 1;
                const glowMap = { emerald: "rgba(16,185,129,0.35)", amber: "rgba(245,158,11,0.35)", sky: "rgba(14,165,233,0.35)", rose: "rgba(244,63,94,0.35)" };
                const solidMap = { emerald: "bg-emerald-500", amber: "bg-amber-500", sky: "bg-sky-500", rose: "bg-rose-500" };
                const ringMap = { emerald: "ring-emerald-500/30", amber: "ring-amber-500/30", sky: "ring-sky-500/30", rose: "ring-rose-500/30" };
                const strokeMap = { emerald: "stroke-emerald-500", amber: "stroke-amber-500", sky: "stroke-sky-500", rose: "stroke-rose-500" };
                const fillMap = { emerald: "fill-emerald-500", amber: "fill-amber-500", sky: "fill-sky-500", rose: "fill-rose-500" };

                return (
                  <React.Fragment key={step.title}>
                    <button
                      type="button"
                      onClick={() => setSelectedFlowStep(index)}
                      className="group relative flex flex-1 flex-col items-center text-center"
                    >
                      <div
                        className={`relative z-10 flex h-14 w-14 items-center justify-center rounded-full border-2 font-bold text-lg transition-all duration-300 ${
                          isActive
                            ? `border-transparent ${solidMap[selectedFlow.tone]} text-white shadow-xl ring-4 ${ringMap[selectedFlow.tone]} sf-pulse`
                            : isPast
                            ? `border-transparent ${solidMap[selectedFlow.tone]} text-white opacity-70`
                            : "border-gray-200 bg-white text-gray-400 group-hover:border-gray-300 group-hover:shadow-md dark:border-gray-700 dark:bg-gray-900 dark:text-gray-500"
                        }`}
                        style={isActive ? { "--sf-glow": glowMap[selectedFlow.tone] } as React.CSSProperties : undefined}
                      >
                        {isPast ? (
                          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          String(index + 1).padStart(2, "0")
                        )}
                      </div>
                      <p className={`mt-3 text-sm font-semibold transition-colors ${isActive ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"}`}>
                        {step.title}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500 max-w-[120px] truncate">{step.module}</p>
                      {isActive && <div className={`mt-2 h-1.5 w-8 rounded-full ${solidMap[selectedFlow.tone]} sf-fade`} />}
                    </button>

                    {!isLast && (
                      <div className="relative flex-1 min-w-[40px] pt-6 px-1">
                        <svg className="w-full h-6 overflow-visible" viewBox="0 0 100 10" preserveAspectRatio="none">
                          <line x1="0" y1="5" x2="100" y2="5" stroke="currentColor" strokeWidth="2" className="text-gray-200 dark:text-gray-700" />
                          {(isPast || isActive) && (
                            <line x1="0" y1="5" x2="100" y2="5" strokeWidth="2.5"
                              className={strokeMap[selectedFlow.tone]}
                              strokeDasharray="6 4"
                              style={isActive ? { animation: "sf-flow-dash 0.8s linear infinite" } : undefined}
                            />
                          )}
                          <polygon points="95,1 100,5 95,9"
                            className={isPast || isActive ? fillMap[selectedFlow.tone] : "fill-gray-300 dark:fill-gray-600"}
                          />
                        </svg>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6 h-1.5 rounded-full bg-gray-100 dark:bg-gray-800">
            <div
              className={`h-1.5 rounded-full transition-all duration-500 ${
                selectedFlow.tone === "emerald" ? "bg-emerald-500" : selectedFlow.tone === "amber" ? "bg-amber-500" : selectedFlow.tone === "sky" ? "bg-sky-500" : "bg-rose-500"
              }`}
              style={{ width: `${((selectedFlowStep + 1) / selectedFlow.steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* ── Step Detail - Data Pipeline ── */}
        <div className="sf-fade grid gap-6 xl:grid-cols-[0.9fr_1.1fr]" key={`detail-${selectedFlow.id}-${selectedFlowStep}`}>
          {/* Left: Step Card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-start gap-4">
              <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white text-xl font-bold shadow-lg bg-gradient-to-br ${
                selectedFlow.tone === "emerald" ? "from-emerald-400 to-emerald-600" : selectedFlow.tone === "amber" ? "from-amber-400 to-amber-600" : selectedFlow.tone === "sky" ? "from-sky-400 to-sky-600" : "from-rose-400 to-rose-600"
              }`}>
                {String(selectedFlowStep + 1).padStart(2, "0")}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Step {selectedFlowStep + 1} / {selectedFlow.steps.length}</p>
                <h3 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">{selectedStep.title}</h3>
                <div className="mt-2"><StatusPill tone={selectedFlow.tone}>{selectedStep.actor}</StatusPill></div>
              </div>
            </div>
            <p className="mt-5 text-sm leading-relaxed text-gray-600 dark:text-gray-300">{selectedStep.detail}</p>
            <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/60">
              <p className="text-xs font-semibold uppercase text-gray-400">Modul Terkait</p>
              <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{selectedStep.module}</p>
            </div>
            <div className="mt-5 flex gap-2">
              <button type="button" disabled={selectedFlowStep === 0} onClick={() => setSelectedFlowStep(selectedFlowStep - 1)}
                className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
                <svg className="h-4 w-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" /></svg>
                Sebelumnya
              </button>
              <button type="button" disabled={selectedFlowStep === selectedFlow.steps.length - 1} onClick={() => setSelectedFlowStep(selectedFlowStep + 1)}
                className={`flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg text-sm font-semibold text-white transition disabled:opacity-30 disabled:cursor-not-allowed bg-gradient-to-r shadow-md ${
                  selectedFlow.tone === "emerald" ? "from-emerald-500 to-emerald-600 shadow-emerald-500/20" : selectedFlow.tone === "amber" ? "from-amber-500 to-amber-600 shadow-amber-500/20" : selectedFlow.tone === "sky" ? "from-sky-500 to-sky-600 shadow-sky-500/20" : "from-rose-500 to-rose-600 shadow-rose-500/20"
                }`}>
                Selanjutnya
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>

          {/* Right: Data Flow Pipeline */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">Alur Data</h4>
              {/* Input */}
              <div className="rounded-xl border border-sky-200 bg-sky-50/50 p-4 dark:border-sky-500/20 dark:bg-sky-500/[0.06]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">Data Masuk</span>
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedStep.input}</p>
              </div>
              {/* Arrow down */}
              <div className="flex justify-center py-1.5">
                <svg className={`h-7 w-7 ${selectedFlow.tone === "emerald" ? "text-emerald-500" : selectedFlow.tone === "amber" ? "text-amber-500" : selectedFlow.tone === "sky" ? "text-sky-500" : "text-rose-500"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12l7 7 7-7" /></svg>
              </div>
              {/* Module Process */}
              <div className={`rounded-xl border-2 p-4 ${
                selectedFlow.tone === "emerald" ? "border-emerald-300 bg-emerald-50/50 dark:border-emerald-500/30 dark:bg-emerald-500/[0.08]" : selectedFlow.tone === "amber" ? "border-amber-300 bg-amber-50/50 dark:border-amber-500/30 dark:bg-amber-500/[0.08]" : selectedFlow.tone === "sky" ? "border-sky-300 bg-sky-50/50 dark:border-sky-500/30 dark:bg-sky-500/[0.08]" : "border-rose-300 bg-rose-50/50 dark:border-rose-500/30 dark:bg-rose-500/[0.08]"
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${toneClass[selectedFlow.tone]}`}>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><circle cx="12" cy="12" r="3" /></svg>
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-wider ${selectedFlow.tone === "emerald" ? "text-emerald-700 dark:text-emerald-400" : selectedFlow.tone === "amber" ? "text-amber-700 dark:text-amber-400" : selectedFlow.tone === "sky" ? "text-sky-700 dark:text-sky-400" : "text-rose-700 dark:text-rose-400"}`}>Proses Modul</span>
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedStep.module}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Aktor:</span>
                  <StatusPill tone={selectedFlow.tone}>{selectedStep.actor}</StatusPill>
                </div>
              </div>
              {/* Arrow down */}
              <div className="flex justify-center py-1.5">
                <svg className={`h-7 w-7 ${selectedFlow.tone === "emerald" ? "text-emerald-500" : selectedFlow.tone === "amber" ? "text-amber-500" : selectedFlow.tone === "sky" ? "text-sky-500" : "text-rose-500"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12l7 7 7-7" /></svg>
              </div>
              {/* Output */}
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/[0.06]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Data Dihasilkan</span>
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedStep.output}</p>
              </div>
            </div>
            {/* System Impact */}
            <div className="rounded-2xl border border-brand-200 bg-brand-50 p-4 dark:border-brand-500/25 dark:bg-brand-500/[0.08]">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand-700 dark:bg-white/[0.08] dark:text-brand-300">
                  <TrendingUpIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Dampak ke sistem</p>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                    Step ini mengalir ke dashboard owner, audit log, dan laporan cabang
                    {activeBranch.name ? ` ${activeBranch.name}` : ""}.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Connection Summary ── */}
        <SectionPanel title="Ringkasan Koneksi Modul" subtitle="Pemetaan cepat supaya alur prototype mudah dibaca sebelum backend dibuat.">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Data pusat", value: "Member, cabang, paket, produk", icon: <PackageIcon className="h-5 w-5" />, tone: "emerald" as const },
              { label: "Transaksi", value: "POS, invoice, shift, refund", icon: <CreditCardIcon className="h-5 w-5" />, tone: "amber" as const },
              { label: "Operasional", value: "Check-in, kelas, PT, stok", icon: <DumbbellIcon className="h-5 w-5" />, tone: "sky" as const },
              { label: "Kontrol owner", value: "Role, audit, laporan, analisa", icon: <ReportIcon className="h-5 w-5" />, tone: "rose" as const },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${toneClass[item.tone]}`}>{item.icon}</div>
                <p className="mt-4 text-sm font-semibold text-gray-900 dark:text-white">{item.label}</p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{item.value}</p>
              </div>
            ))}
          </div>
        </SectionPanel>
      </div>
    );
  };



  const renderOperations = () => {
    const operationKey = slug.at(-1);

    if (operationKey === "check-in") {
      return (
        <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <SectionPanel title="Scan QR Check-In" subtitle="Workflow front desk untuk validasi member masuk gym.">
            <div className="rounded-xl border border-dashed border-emerald-300 bg-emerald-50 p-6 text-center dark:border-emerald-500/30 dark:bg-emerald-500/10">
              <QrCodeIcon className="mx-auto h-16 w-16 text-emerald-600 dark:text-emerald-400" />
              <p className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">Ready Scan</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Cek membership, branch access, dan status freeze/expired.
              </p>
            </div>
            <div className="mt-5 space-y-3">
              {["Membership aktif", "Cabang diizinkan", "QR belum dipakai", "Audit gate tersimpan"].map((rule) => (
                <div key={rule} className="rounded-lg bg-gray-50 p-3 text-sm text-gray-700 dark:bg-gray-800/60 dark:text-gray-300">
                  {rule}
                </div>
              ))}
            </div>
          </SectionPanel>
          <SectionPanel title="Member Sedang Gym" subtitle={`Live attendance untuk ${activeBranch.name}.`}>
            <DataTable
              data={branchSnapshot.scopedCheckIns}
              getKey={(checkIn) => checkIn.id}
              columns={[
                { header: "Member", cell: (checkIn) => <span className="font-medium text-gray-900 dark:text-white">{checkIn.memberName}</span> },
                { header: "Masuk", cell: (checkIn) => checkIn.time },
                { header: "Gate", cell: (checkIn) => checkIn.gate },
                { header: "Checkout", cell: (checkIn) => checkIn.checkoutTime || "-" },
                {
                  header: "Status",
                  cell: (checkIn) => (
                    <StatusPill tone={checkIn.checkoutTime ? "slate" : "emerald"}>
                      {checkIn.checkoutTime ? "Checkout" : "In Gym"}
                    </StatusPill>
                  ),
                },
              ]}
            />
          </SectionPanel>
        </div>
      );
    }

    if (operationKey === "class-booking") {
      return (
        <div className="grid gap-6 xl:grid-cols-3">
          <SectionPanel title="Booking Kelas" subtitle={`Queue booking kelas di ${activeBranch.name}.`}>
            <DataTable
              data={classBookingQueue.filter((booking) => booking.branchId === activeBranch.id)}
              getKey={(booking) => booking.id}
              columns={[
                { header: "Kelas", cell: (booking) => <span className="font-medium text-gray-900 dark:text-white">{booking.className}</span> },
                { header: "Member", cell: (booking) => booking.memberName },
                { header: "Tanggal", cell: (booking) => booking.date },
                { header: "Jam", cell: (booking) => booking.time },
                { header: "Kapasitas", cell: (booking) => booking.capacity },
                {
                  header: "Status",
                  cell: (booking) => (
                    <StatusPill tone={booking.status === "waitlist" ? "amber" : "emerald"}>{booking.status}</StatusPill>
                  ),
                },
              ]}
            />
          </SectionPanel>
          <SectionPanel title="Kapasitas Kelas" subtitle="Kapasitas dihitung dari master kelas dan attendance.">
            <div className="space-y-4">
              {branchSnapshot.scopedClasses.map((gymClass) => (
                <div key={gymClass.id}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-900 dark:text-white">{gymClass.name}</span>
                    <span className="text-gray-500">{gymClass.currentParticipants}/{gymClass.maxParticipants}</span>
                  </div>
                  <ProgressBar value={(gymClass.currentParticipants / gymClass.maxParticipants) * 100} tone={gymClass.currentParticipants >= gymClass.maxParticipants ? "amber" : "emerald"} />
                </div>
              ))}
            </div>
          </SectionPanel>
          <SectionPanel title="Rule Booking" subtitle="Validasi yang nanti ada di API.">
            <div className="space-y-3">
              {["Membership aktif", "Slot belum penuh", "Tidak bentrok jadwal", "Masuk waiting list jika penuh"].map((rule) => (
                <div key={rule} className="rounded-lg bg-gray-50 p-3 text-sm text-gray-700 dark:bg-gray-800/60 dark:text-gray-300">{rule}</div>
              ))}
            </div>
          </SectionPanel>
        </div>
      );
    }

    if (operationKey === "membership") {
      return (
        <div className="grid gap-6 xl:grid-cols-3">
          <SectionPanel title="Membership Board" subtitle="Satu halaman untuk aktif, expired, freeze, upgrade, dan renewal.">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              {[
                ["Aktif", branchSnapshot.scopedMembers.filter((member) => member.membershipStatus === "active").length, "emerald"],
                ["Expired", branchSnapshot.scopedMembers.filter((member) => member.membershipStatus === "expired").length, "rose"],
                ["Freeze", branchSnapshot.scopedMembers.filter((member) => member.membershipStatus === "frozen").length, "amber"],
                ["Renewal follow-up", 8, "sky"],
              ].map(([label, value, tone]) => (
                <div key={label as string} className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800/60">
                  <p className="text-sm text-gray-500">{label}</p>
                  <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
                  <div className="mt-3">
                    <ProgressBar value={Number(value) * 18} tone={tone as string} />
                  </div>
                </div>
              ))}
            </div>
          </SectionPanel>
          <SectionPanel title="Renewal Queue" subtitle="Member yang perlu ditindaklanjuti staff cabang.">
            <DataTable
              data={memberRows.slice(0, 5)}
              getKey={(member) => member.id}
              columns={[
                { header: "Member", cell: (member) => <span className="font-medium text-gray-900 dark:text-white">{member.name}</span> },
                { header: "Paket", cell: (member) => member.membershipType },
                { header: "Expired", cell: (member) => member.membershipEnd },
                { header: "Visit", cell: (member) => `${member.checkins}x` },
                {
                  header: "Status",
                  cell: (member) => (
                    <StatusPill tone={member.membershipStatus === "active" ? "emerald" : member.membershipStatus === "frozen" ? "amber" : "rose"}>
                      {member.membershipStatus}
                    </StatusPill>
                  ),
                },
              ]}
            />
          </SectionPanel>
          <SectionPanel title="Action Membership" subtitle="Aksi ada di halaman, bukan submenu.">
            <div className="space-y-3">
              {["Tambah member", "Renewal paket", "Freeze membership", "Upgrade membership", "Kirim reminder"].map((action) => (
                <button
                  key={action}
                  className="flex w-full items-center justify-between rounded-lg border border-gray-200 p-3 text-left text-sm font-medium text-gray-700 transition hover:border-emerald-300 hover:bg-emerald-50 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-emerald-500/10"
                >
                  {action}
                  <MemberIcon className="h-4 w-4 text-emerald-500" />
                </button>
              ))}
            </div>
          </SectionPanel>
        </div>
      );
    }

    if (operationKey === "pt-booking") {
      return (
        <div className="grid gap-6 xl:grid-cols-3">
          <SectionPanel title="Booking PT" subtitle="Sesi personal trainer per cabang.">
            <DataTable
              data={branchSnapshot.scopedPtSessions}
              getKey={(session) => session.id}
              columns={[
                { header: "Member", cell: (session) => <span className="font-medium text-gray-900 dark:text-white">{session.memberName}</span> },
                { header: "Tanggal", cell: (session) => session.date },
                { header: "Jam", cell: (session) => session.time },
                { header: "Durasi", cell: (session) => `${session.duration} menit` },
                { header: "Fokus", cell: (session) => session.focus },
                {
                  header: "Status",
                  cell: (session) => (
                    <StatusPill tone={session.status === "completed" ? "emerald" : "sky"}>{session.status}</StatusPill>
                  ),
                },
              ]}
            />
          </SectionPanel>
          <SectionPanel title="Trainer Availability" subtitle="Trainer yang bisa dipilih di cabang aktif.">
            <div className="space-y-3">
              {trainerRows.slice(0, 4).map((trainer) => (
                <div key={trainer.id} className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800/60">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{trainer.name}</p>
                    <p className="text-xs text-gray-500">{trainer.specializations.join(", ")}</p>
                  </div>
                  <StatusPill tone={trainer.status === "active" ? "emerald" : "amber"}>{trainer.status}</StatusPill>
                </div>
              ))}
            </div>
          </SectionPanel>
          <SectionPanel title="Paket PT" subtitle="Paket yang bisa dijual dari POS atau booking.">
            <div className="space-y-3">
              {ptPackageSettings.map((pkg) => (
                <div key={pkg.id} className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-800">
                  <span className="font-medium text-gray-900 dark:text-white">{pkg.name}</span>
                  <span className="text-sm text-gray-500">{formatCurrency(pkg.price)}</span>
                </div>
              ))}
            </div>
          </SectionPanel>
        </div>
      );
    }

    if (operationKey === "stock-movement") {
      const movements = stockMovements.filter(
        (movement) => movement.branchId === activeBranch.id || activeBranch.id === "branch-pusat",
      );

      return (
        <div className="grid gap-6 xl:grid-cols-3">
          <SectionPanel title="Mutasi Stok" subtitle="Input barang masuk, keluar, transfer, dan adjustment.">
            <DataTable
              data={movements}
              getKey={(movement) => movement.id}
              columns={[
                { header: "Kode", cell: (movement) => <span className="font-mono text-xs">{movement.id}</span> },
                { header: "Tipe", cell: (movement) => movement.type },
                { header: "Item", cell: (movement) => <span className="font-medium text-gray-900 dark:text-white">{movement.item}</span> },
                { header: "Qty", cell: (movement) => `${movement.type === "Masuk" ? "+" : "-"}${movement.qty}` },
                { header: "Sumber", cell: (movement) => movement.source },
                {
                  header: "Status",
                  cell: (movement) => (
                    <StatusPill tone={movement.status === "posted" ? "emerald" : movement.status === "review" ? "amber" : "slate"}>
                      {movement.status}
                    </StatusPill>
                  ),
                },
              ]}
            />
          </SectionPanel>
          <SectionPanel title="Reorder Watch" subtitle="Produk yang sudah menyentuh minimum stock.">
            <div className="space-y-4">
              {branchSnapshot.scopedInventory.slice(0, 5).map((item) => (
                <div key={item.id}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-900 dark:text-white">{item.name}</span>
                    <span className={item.stock <= item.minStock ? "text-amber-600" : "text-gray-500"}>{item.stock}</span>
                  </div>
                  <ProgressBar value={(item.stock / Math.max(item.minStock * 3, 1)) * 100} tone={item.stock <= item.minStock ? "amber" : "emerald"} />
                </div>
              ))}
            </div>
          </SectionPanel>
        </div>
      );
    }

    if (operationKey === "maintenance") {
      return (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <SectionPanel title="Maintenance Alat" subtitle="Workflow service alat, bukan master data alat.">
            <DataTable
              data={equipmentRows.filter((item) => item.branchId === activeBranch.id || activeBranch.id === "branch-pusat")}
              getKey={(item) => item.id}
              columns={[
                { header: "Tiket", cell: (item) => <span className="font-mono text-xs">{item.id}</span> },
                { header: "Alat", cell: (item) => <span className="font-medium text-gray-900 dark:text-white">{item.equipmentName}</span> },
                { header: "Lokasi", cell: (item) => item.location },
                { header: "Next Service", cell: (item) => item.nextCheck },
                {
                  header: "Status",
                  cell: (item) => (
                    <StatusPill tone={item.status === "ok" ? "emerald" : "amber"}>{item.status}</StatusPill>
                  ),
                },
              ]}
            />
          </SectionPanel>
          <SectionPanel title="Service Flow" subtitle="Alur kerja ketika alat rusak atau perlu servis.">
            <div className="space-y-3">
              {["Buat tiket maintenance", "Assign teknisi/supplier", "Update status alat", "Catat biaya service", "Buka alat kembali"].map((step, index) => (
                <div key={step} className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-800/60">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-sm font-semibold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                    {index + 1}
                  </span>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{step}</p>
                </div>
              ))}
            </div>
          </SectionPanel>
        </div>
      );
    }

    if (operationKey === "calendar") {
      return (
        <div className="grid gap-6 lg:grid-cols-7">
          {["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"].map((day) => (
            <SectionPanel key={day} title={day}>
              <div className="space-y-3">
                {branchSnapshot.scopedClasses.slice(0, 2).map((gymClass) => (
                  <div key={`${day}-${gymClass.id}`} className="rounded-lg bg-emerald-50 p-3 dark:bg-emerald-500/10">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{gymClass.name}</p>
                    <p className="text-xs text-gray-500">{gymClass.schedule[0]?.time ?? "08:00"}</p>
                  </div>
                ))}
              </div>
            </SectionPanel>
          ))}
        </div>
      );
    }

    return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {pageStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-3">
        <SectionPanel title="Aktivitas Live" subtitle="Monitoring operasional harian.">
          <div className="space-y-3">
            {branchSnapshot.scopedCheckIns.map((checkIn) => (
              <div key={checkIn.id} className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800/60">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{checkIn.memberName}</p>
                  <p className="text-sm text-gray-500">{checkIn.time} / {checkIn.gate}</p>
                </div>
                <StatusPill tone={checkIn.checkoutTime ? "slate" : "emerald"}>
                  {checkIn.checkoutTime ? "Checkout" : "In Gym"}
                </StatusPill>
              </div>
            ))}
          </div>
        </SectionPanel>
        <SectionPanel title="Action Board" subtitle="Shortcut workflow sesuai modul.">
          <div className="grid gap-3">
            {[
              { icon: <MemberIcon className="h-5 w-5" />, title: "Tambah member baru", helper: "Registrasi, foto, paket, invoice", required: ["members.create"] },
              { icon: <CashRegisterIcon className="h-5 w-5" />, title: "Buka transaksi POS", helper: "Membership, PT, produk, class pass", required: ["pos.create"] },
              { icon: <WhatsAppIcon className="h-5 w-5" />, title: "Kirim reminder", helper: "Renewal, booking, dan follow-up", required: ["notifications.manage"] },
              { icon: <PackageIcon className="h-5 w-5" />, title: "Cek stok menipis", helper: "Suplemen dan consumable", required: ["products.view"] },
            ].map((action) => (
              <button
                key={action.title}
                disabled={!hasAnyPermission(action.required)}
                className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 text-left transition hover:border-emerald-300 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-45 dark:border-gray-800 dark:hover:bg-emerald-500/10"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                  {action.icon}
                </span>
                <span>
                  <span className="block font-medium text-gray-900 dark:text-white">{action.title}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{action.helper}</span>
                </span>
              </button>
            ))}
          </div>
        </SectionPanel>
        <SectionPanel title="Pipeline" subtitle="Data dummy modul terkait.">
          <div className="space-y-4">
            {[
              { label: "Booking kelas", value: branchSnapshot.classBookings, icon: <ClassIcon className="h-5 w-5" /> },
              { label: "Trainer aktif", value: trainerRows.filter((trainer) => trainer.status === "active").length, icon: <TrainerIcon className="h-5 w-5" /> },
              { label: "Stok menipis", value: branchSnapshot.lowStock, icon: <PackageIcon className="h-5 w-5" /> },
              { label: "Transaksi", value: branchSnapshot.scopedTransactions.length, icon: <CreditCardIcon className="h-5 w-5" /> },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </SectionPanel>
      </div>
      <SectionPanel title="Equipment & Maintenance" subtitle="Monitoring alat gym per cabang sebelum dibuat modul maintenance real.">
        <div className="grid gap-3 lg:grid-cols-3">
          {equipmentRows
            .filter((item) => item.branchId === activeBranch.id || activeBranch.id === "branch-pusat")
            .map((item) => (
              <div key={item.id} className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-gray-900 dark:text-white">{item.equipmentName}</p>
                  <StatusPill tone={item.status === "ok" ? "emerald" : "amber"}>{item.status}</StatusPill>
                </div>
                <p className="mt-1 text-sm text-gray-500">{item.location}</p>
                <p className="mt-3 text-xs text-gray-500">Next check: {item.nextCheck}</p>
              </div>
            ))}
        </div>
      </SectionPanel>
      <div className="grid gap-6 xl:grid-cols-3">
        <SectionPanel title="API Contract" subtitle="Kontrak endpoint dummy yang nanti dipakai backend.">
          <div className="space-y-3">
            {apiContracts.map((contract) => (
              <div key={`${contract.method}-${contract.path}`} className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/60">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-gray-900 px-2 py-1 text-xs font-semibold text-white dark:bg-white dark:text-gray-900">
                    {contract.method}
                  </span>
                  <span className="truncate font-mono text-xs text-gray-700 dark:text-gray-300">
                    {contract.path}
                  </span>
                </div>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{contract.guard}</p>
              </div>
            ))}
          </div>
        </SectionPanel>
        <SectionPanel title="Business Rules" subtitle="Aturan yang harus sama di frontend dan backend.">
          <div className="space-y-3">
            {businessRules.slice(0, 6).map((rule) => (
              <div key={rule} className="flex gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-800/60">
                <ShieldIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                <p className="text-sm text-gray-600 dark:text-gray-300">{rule}</p>
              </div>
            ))}
          </div>
        </SectionPanel>
        <SectionPanel title="Audit Trail" subtitle={`Log aktivitas untuk ${activeBranch.name}.`}>
          <div className="space-y-3">
            {branchAuditLogs.map((log) => (
              <div key={log.id} className="rounded-lg border border-gray-200 p-3 dark:border-gray-800">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-gray-900 dark:text-white">{log.action}</p>
                  <span className="text-xs text-gray-500">{log.time}</span>
                </div>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {log.actor} / {log.target}
                </p>
              </div>
            ))}
          </div>
        </SectionPanel>
      </div>
    </div>
    );
  };

  const renderPromoNotifications = () => {
    const crmKey = moduleName === "notifications" ? "notifications" : slug.at(-1);
    const pointRules = [
      { rule: "Check-in harian", point: "+10 pts", trigger: "checkin.completed" },
      { rule: "Pembelian membership", point: "+1 pts / Rp 1.000", trigger: "payment.membership.paid" },
      { rule: "Referral aktif", point: "+500 pts", trigger: "referral.converted" },
      { rule: "Challenge selesai", point: "Bonus campaign", trigger: "challenge.completed" },
    ];
    const targetSegments = [
      { segment: "Expired member", campaign: "Renewal discount", channel: "WhatsApp", status: "ready" },
      { segment: "VIP active", campaign: "PT upsell", channel: "WhatsApp + Front desk", status: "ready" },
      { segment: "New member", campaign: "Starter pack", channel: "Invoice insert", status: "draft" },
      { segment: "Low visit", campaign: "Comeback campaign", channel: "WhatsApp", status: "ready" },
    ];

    if (slug[1] === "campaigns" && slug[2]) {
      const promoId = decodeURIComponent(slug[2]);
      const promo = promoRows.find((item) => item.id === promoId);

      if (!promo) {
        return (
          <SectionPanel title="Promo Tidak Ditemukan" subtitle="Campaign tidak ada di dummy data aktif.">
            <button
              type="button"
              onClick={() => router.push("/promo")}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-200 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300"
            >
              Kembali ke Promo
            </button>
          </SectionPanel>
        );
      }

      return (
        <div className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => router.push("/promo")}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-200 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300"
            >
              Kembali
            </button>
            <PrimaryToolbarButton onClick={() => openEditPromoModal(promo)} disabled={!canManagePromo}>
              Edit Promo
            </PrimaryToolbarButton>
          </div>
          <SectionPanel title={promo.name} subtitle="Detail campaign, benefit, pemakaian, dan keterhubungan ke POS.">
            <div className="grid gap-4 md:grid-cols-4">
              <StatCard label="Kode" value={promo.code} helper="Kode dipilih di POS" icon={<PromoIcon className="h-5 w-5" />} tone="amber" />
              <StatCard label="Diskon" value={promo.type === "percentage" ? `${promo.discount}%` : formatCurrency(promo.discount)} helper={promo.type} icon={<CreditCardIcon className="h-5 w-5" />} tone="emerald" />
              <StatCard label="Usage" value={`${promo.usageCount}/${promo.maxUsage}`} helper="Limit pemakaian" icon={<TrendingUpIcon className="h-5 w-5" />} tone="sky" />
              <StatCard label="Status" value={promo.status} helper={`Sampai ${promo.validUntil}`} icon={<CheckSmallIcon className="h-5 w-5" />} tone={promo.status === "active" ? "emerald" : promo.status === "upcoming" ? "sky" : "slate"} />
            </div>
            <div className="mt-6">
              <DataTable
                data={[
                  { label: "Benefit", value: promo.description },
                  { label: "POS", value: "Muncul otomatis di selector promo POS jika aktif dan kuota tersedia" },
                  { label: "Target", value: targetSegments.map((segment) => segment.segment).join(", ") },
                  { label: "Audit", value: "Status, pemakaian, dan edit campaign masuk audit log" },
                ]}
                getKey={(row) => row.label}
                columns={[
                  { header: "Field", cell: (row) => row.label },
                  { header: "Nilai", cell: (row) => <span className="font-medium text-gray-900 dark:text-white">{row.value}</span> },
                ]}
              />
            </div>
          </SectionPanel>
        </div>
      );
    }

    if (slug[1] === "rewards" && slug[2]) {
      const rewardId = decodeURIComponent(slug[2]);
      const reward = rewardRows.find((item) => item.id === rewardId);

      if (!reward) {
        return (
          <SectionPanel title="Reward Tidak Ditemukan" subtitle="Reward tidak ada di katalog loyalty.">
            <button
              type="button"
              onClick={() => router.push("/promo/rewards")}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-200 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300"
            >
              Kembali ke Reward
            </button>
          </SectionPanel>
        );
      }

      return (
        <div className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => router.push("/promo/rewards")}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-200 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300"
            >
              Kembali
            </button>
            <PrimaryToolbarButton onClick={() => openEditRewardModal(reward)} disabled={!canManagePromo}>
              Edit Reward
            </PrimaryToolbarButton>
          </div>
          <SectionPanel title={reward.name} subtitle="Detail reward, kebutuhan point, stok, dan simulasi redemption.">
            <div className="grid gap-4 md:grid-cols-3">
              <StatCard label="Point" value={`${reward.points.toLocaleString("id-ID")} pts`} helper="Point dibutuhkan" icon={<GiftIcon className="h-5 w-5" />} tone="amber" />
              <StatCard label="Stok" value={String(reward.stock)} helper="Stok reward" icon={<PackageIcon className="h-5 w-5" />} tone={reward.stock > 15 ? "emerald" : "amber"} />
              <StatCard label="Status" value={reward.stock > 0 ? "Ready" : "Habis"} helper="Ketersediaan katalog" icon={<CheckSmallIcon className="h-5 w-5" />} tone={reward.stock > 0 ? "emerald" : "rose"} />
            </div>
          </SectionPanel>
          <SectionPanel title="Member Eligible" subtitle="Member dengan point cukup untuk menukar reward ini.">
            <DataTable
              data={memberRows.filter((member) => member.points >= reward.points)}
              getKey={(member) => member.id}
              columns={[
                { header: "Member", cell: (member) => <span className="font-medium text-gray-900 dark:text-white">{member.name}</span> },
                { header: "Point", cell: (member) => `${member.points.toLocaleString("id-ID")} pts` },
                { header: "Membership", cell: (member) => member.membershipType },
              ]}
            />
          </SectionPanel>
        </div>
      );
    }

    if (slug[1] === "challenges" && slug[2]) {
      const challengeId = decodeURIComponent(slug[2]);
      const challenge = challengeRows.find((item) => item.id === challengeId);

      if (!challenge) {
        return (
          <SectionPanel title="Challenge Tidak Ditemukan" subtitle="Challenge tidak ada di campaign aktif.">
            <button
              type="button"
              onClick={() => router.push("/promo/challenges")}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-200 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300"
            >
              Kembali ke Challenge
            </button>
          </SectionPanel>
        );
      }

      return (
        <div className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => router.push("/promo/challenges")}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-200 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300"
            >
              Kembali
            </button>
            <PrimaryToolbarButton onClick={() => openEditChallengeModal(challenge)} disabled={!canManagePromo}>
              Edit Challenge
            </PrimaryToolbarButton>
          </div>
          <SectionPanel title={challenge.name} subtitle={challenge.description}>
            <div className="grid gap-4 md:grid-cols-4">
              <StatCard label="Target" value={`${challenge.target}x`} helper="Aksi member" icon={<TargetIcon className="h-5 w-5" />} tone="sky" />
              <StatCard label="Peserta" value={String(challenge.participants)} helper="Member ikut challenge" icon={<MemberIcon className="h-5 w-5" />} tone="emerald" />
              <StatCard label="Reward" value={`+${challenge.reward} pts`} helper="Bonus point" icon={<GiftIcon className="h-5 w-5" />} tone="amber" />
              <StatCard label="Berakhir" value={challenge.endDate} helper="Tanggal akhir" icon={<ClockIcon className="h-5 w-5" />} tone="slate" />
            </div>
          </SectionPanel>
          <SectionPanel title="Leaderboard Dummy" subtitle="Simulasi peserta challenge.">
            <DataTable
              data={memberRows.slice(0, 6)}
              getKey={(member) => member.id}
              columns={[
                { header: "Member", cell: (member) => member.name },
                { header: "Progress", cell: (member, index) => `${Math.max(1, challenge.target - index)} / ${challenge.target}` },
                { header: "Status", cell: (_member, index) => <StatusPill tone={index < 2 ? "emerald" : "amber"}>{index < 2 ? "eligible" : "progress"}</StatusPill> },
              ]}
            />
          </SectionPanel>
        </div>
      );
    }

    if (crmKey === "rewards") {
      return (
        <div className="space-y-6">
          <SectionPanel title="Reward Catalog" subtitle="Hadiah yang bisa ditukar point member.">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {loyaltyMessage ? (
                <p className={`text-sm ${loyaltyMessage.tone === "emerald" ? "text-emerald-600 dark:text-emerald-400" : loyaltyMessage.tone === "rose" ? "text-rose-600 dark:text-rose-400" : "text-amber-600 dark:text-amber-400"}`}>{loyaltyMessage.message}</p>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">Simulasi redemption point member, stok reward ikut berkurang.</p>
              )}
              <div className="flex flex-col gap-2 sm:flex-row">
              <PrimaryToolbarButton onClick={openCreateRewardModal} disabled={!canManagePromo}>Tambah Reward</PrimaryToolbarButton>
              <PrimaryToolbarButton onClick={() => setActionModal("reward-redemption")} disabled={!canManagePromo}>
                  Tukar Reward
                </PrimaryToolbarButton>
              </div>
            </div>
            <DataTable
              data={rewardRows}
              getKey={(reward) => reward.id}
              columns={[
                { header: "Kode", cell: (reward) => <span className="font-mono text-xs">{reward.id}</span> },
                { header: "Reward", cell: (reward) => <span className="font-medium text-gray-900 dark:text-white">{reward.name}</span> },
                { header: "Point", cell: (reward) => `${reward.points.toLocaleString("id-ID")} pts` },
                { header: "Stok", cell: (reward) => reward.stock },
                { header: "Status", cell: (reward) => <StatusPill tone={reward.stock > 15 ? "emerald" : "amber"}>{reward.stock > 15 ? "ready" : "low stock"}</StatusPill> },
                {
                  header: "Aksi",
                  cell: (reward) => (
                    <div className="flex gap-2">
                      <TableActionIconButton
                        label="Detail reward"
                        icon={<EyeIcon />}
                        onClick={() => router.push(`/promo/rewards/${encodeURIComponent(reward.id)}`)}
                        variant="info"
                      />
                      <TableActionIconButton
                        label="Tukar reward"
                        icon={<GiftIcon className="h-4 w-4" />}
                        disabled={!canManagePromo}
                        onClick={() => {
                          setRewardRedemptionForm((form) => ({ ...form, rewardId: reward.id }));
                          const result = redeemReward(rewardRedemptionForm.memberId, reward.id);
                          setLoyaltyMessage(result);
                          if (result.tone === "emerald") {
                            addAuditLog({
                              branchId: activeBranch.id,
                              actor: currentUser.name,
                              action: "loyalty.reward.redeem",
                              target: result.message,
                            });
                          }
                        }}
                        variant="success"
                      />
                      <TableActionIconButton
                        label="Edit reward"
                        icon={<PencilIcon />}
                        onClick={() => openEditRewardModal(reward)}
                        disabled={!canManagePromo}
                        variant="edit"
                      />
                      <TableActionIconButton
                        label="Hapus reward"
                        icon={<TrashIcon />}
                        onClick={() =>
                          requestDelete({
                            title: "Hapus Reward",
                            message: "Reward akan dihapus dari katalog loyalty.",
                            target: reward.name,
                            onConfirm: () => {
                              deleteReward(reward.id);
                              setCrudMessage(`${reward.name} dihapus.`);
                              addAuditLog({
                                branchId: activeBranch.id,
                                actor: currentUser.name,
                                action: "loyalty.reward.delete",
                                target: reward.name,
                              });
                            },
                          })
                        }
                        disabled={!canManagePromo}
                        variant="delete"
                      />
                    </div>
                  ),
                  className: "min-w-[140px]",
                },
              ]}
            />
          </SectionPanel>
          <div className="grid gap-6 xl:grid-cols-2">
            <SectionPanel title="Point Rules" subtitle="Cara member mendapatkan point.">
              <DataTable
                data={pointRules}
                getKey={(rule) => rule.trigger}
                columns={[
                  { header: "Rule", cell: (rule) => <span className="font-medium text-gray-900 dark:text-white">{rule.rule}</span> },
                  { header: "Point", cell: (rule) => rule.point },
                  { header: "Trigger", cell: (rule) => <span className="font-mono text-xs">{rule.trigger}</span> },
                ]}
              />
            </SectionPanel>
            <SectionPanel title="Challenge Aktif" subtitle="Gamification untuk menaikkan retention.">
              <DataTable
                data={challengeRows}
                getKey={(challenge) => challenge.id}
                columns={[
                  { header: "Challenge", cell: (challenge) => <span className="font-medium text-gray-900 dark:text-white">{challenge.name}</span> },
                  { header: "Target", cell: (challenge) => `${challenge.target} aksi` },
                  { header: "Peserta", cell: (challenge) => challenge.participants },
                  { header: "Reward", cell: (challenge) => `+${challenge.reward} pts` },
                ]}
              />
            </SectionPanel>
          </div>
        </div>
      );
    }

    if (crmKey === "referral") {
      const referralFunnel = [
        { stage: "Kode dibagikan", value: 72, owner: "Member", nextAction: "Monitor share link" },
        { stage: "Lead daftar trial", value: 38, owner: "Front desk", nextAction: "Follow-up trial" },
        { stage: "Convert membership", value: 21, owner: "Kasir", nextAction: "Invoice renewal" },
      ];
      const referralCampaigns = promoRows.filter((promo) => promo.name.toLowerCase().includes("referral") || promo.code.toLowerCase().includes("refer"));

      return (
        <div className="space-y-6">
          <SectionPanel title="Referral Funnel" subtitle="Flow ajak teman sampai member baru aktif.">
            <DataTable
              data={referralFunnel}
              getKey={(row) => row.stage}
              columns={[
                { header: "Tahap", cell: (row) => <span className="font-medium text-gray-900 dark:text-white">{row.stage}</span> },
                {
                  header: "Konversi",
                  cell: (row) => (
                    <div className="min-w-36">
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span>{row.value}%</span>
                      </div>
                      <ProgressBar value={row.value} tone={row.value < 30 ? "amber" : "emerald"} />
                    </div>
                  ),
                },
                { header: "Owner", cell: (row) => row.owner },
                { header: "Next Action", cell: (row) => row.nextAction },
              ]}
            />
          </SectionPanel>
          <div className="grid gap-6 xl:grid-cols-2">
            <SectionPanel title="Top Referrer" subtitle="Member dengan kode referral aktif.">
              <DataTable
                data={memberRows.slice(0, 5)}
                getKey={(member) => member.id}
                columns={[
                  { header: "Member", cell: (member) => <span className="font-medium text-gray-900 dark:text-white">{member.name}</span> },
                  { header: "Kode", cell: (member) => <span className="font-mono text-xs">{member.referralCode}</span> },
                  { header: "Lead", cell: (_member, index) => `${5 - index} lead` },
                  { header: "Point", cell: (member) => `${member.points.toLocaleString("id-ID")} pts` },
                ]}
              />
            </SectionPanel>
            <SectionPanel title="Referral Campaign" subtitle="Benefit yang sedang berjalan.">
              <DataTable
                data={referralCampaigns.length ? referralCampaigns : promoRows.slice(0, 2)}
                getKey={(promo) => promo.id}
                columns={[
                  { header: "Promo", cell: (promo) => <span className="font-medium text-gray-900 dark:text-white">{promo.name}</span> },
                  { header: "Kode", cell: (promo) => <StatusPill tone="amber">{promo.code}</StatusPill> },
                  { header: "Benefit", cell: (promo) => promo.description },
                  { header: "Usage", cell: (promo) => `${promo.usageCount}/${promo.maxUsage}` },
                  { header: "Status", cell: (promo) => <StatusPill tone={promo.status === "active" ? "emerald" : "slate"}>{promo.status}</StatusPill> },
                ]}
              />
            </SectionPanel>
          </div>
        </div>
      );
    }

    if (crmKey === "challenges") {
      const badges = ["Consistency", "Class Explorer", "Referral Master", "Strength Milestone", "Comeback"].map((badge, index) => ({
        id: `BADGE-${index + 1}`,
        name: badge,
        trigger: index === 0 ? "20x check-in" : index === 1 ? "5 kelas berbeda" : index === 2 ? "3 referral aktif" : index === 3 ? "Target body progress" : "Aktif lagi H+14",
        status: index < 3 ? "active" : "draft",
      }));
      const challengeRules = ["Satu member hanya boleh claim sekali", "Check-in dihitung dari branch access", "Reward masuk setelah target tercapai", "Challenge bisa dibatasi per cabang"].map((rule, index) => ({
        id: `RULE-${index + 1}`,
        rule,
        scope: index === 3 ? "Cabang" : "Global",
      }));

      return (
        <div className="space-y-6">
          <SectionPanel title="Challenge Bulanan" subtitle="Gamification untuk streak latihan dan retention member.">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">{crudMessage ?? "Tambah/edit challenge lewat popup."}</p>
              <PrimaryToolbarButton onClick={openCreateChallengeModal} disabled={!canManagePromo}>Tambah Challenge</PrimaryToolbarButton>
            </div>
            <DataTable
              data={challengeRows}
              getKey={(challenge) => challenge.id}
              columns={[
                { header: "Kode", cell: (challenge) => <span className="font-mono text-xs">{challenge.id}</span> },
                { header: "Challenge", cell: (challenge) => <span className="font-medium text-gray-900 dark:text-white">{challenge.name}</span> },
                { header: "Deskripsi", cell: (challenge) => challenge.description, className: "min-w-[260px]" },
                { header: "Target", cell: (challenge) => `${challenge.target} aksi` },
                {
                  header: "Progress",
                  cell: (challenge) => (
                    <div className="min-w-36">
                      <ProgressBar value={(challenge.participants / 180) * 100} tone="amber" />
                      <p className="mt-1 text-xs text-gray-500">{challenge.participants} peserta</p>
                    </div>
                  ),
                },
                { header: "Reward", cell: (challenge) => `+${challenge.reward} pts` },
                { header: "Berakhir", cell: (challenge) => challenge.endDate },
                {
                  header: "Aksi",
                  cell: (challenge) => (
                    <div className="flex gap-2">
                      <TableActionIconButton
                        label="Detail challenge"
                        icon={<EyeIcon />}
                        onClick={() => router.push(`/promo/challenges/${encodeURIComponent(challenge.id)}`)}
                        variant="info"
                      />
                      <TableActionIconButton
                        label="Tambah peserta"
                        icon={<PlusIcon />}
                        disabled={!canManagePromo}
                        onClick={() => {
                          boostChallenge(challenge.id);
                          addAuditLog({
                            branchId: activeBranch.id,
                            actor: currentUser.name,
                            action: "loyalty.challenge.boost",
                            target: challenge.name,
                          });
                        }}
                        variant="success"
                      />
                      <TableActionIconButton
                        label="Edit challenge"
                        icon={<PencilIcon />}
                        onClick={() => openEditChallengeModal(challenge)}
                        disabled={!canManagePromo}
                        variant="edit"
                      />
                      <TableActionIconButton
                        label="Hapus challenge"
                        icon={<TrashIcon />}
                        onClick={() =>
                          requestDelete({
                            title: "Hapus Challenge",
                            message: "Challenge akan dihapus dari campaign prototype.",
                            target: challenge.name,
                            onConfirm: () => {
                              deleteChallenge(challenge.id);
                              setCrudMessage(`${challenge.name} dihapus.`);
                              addAuditLog({
                                branchId: activeBranch.id,
                                actor: currentUser.name,
                                action: "loyalty.challenge.delete",
                                target: challenge.name,
                              });
                            },
                          })
                        }
                        disabled={!canManagePromo}
                        variant="delete"
                      />
                    </div>
                  ),
                  className: "min-w-[140px]",
                },
              ]}
            />
          </SectionPanel>
          <div className="grid gap-6 xl:grid-cols-2">
            <SectionPanel title="Achievement Badge" subtitle="Badge yang muncul di portal member.">
              <DataTable
                data={badges}
                getKey={(badge) => badge.id}
                columns={[
                  { header: "Badge", cell: (badge) => <span className="font-medium text-gray-900 dark:text-white">{badge.name}</span> },
                  { header: "Trigger", cell: (badge) => badge.trigger },
                  { header: "Status", cell: (badge) => <StatusPill tone={badge.status === "active" ? "emerald" : "amber"}>{badge.status}</StatusPill> },
                ]}
              />
            </SectionPanel>
            <SectionPanel title="Rule Challenge" subtitle="Aturan campaign supaya point tidak asal masuk.">
              <DataTable
                data={challengeRules}
                getKey={(rule) => rule.id}
                columns={[
                  { header: "Kode", cell: (rule) => <span className="font-mono text-xs">{rule.id}</span> },
                  { header: "Rule", cell: (rule) => rule.rule },
                  { header: "Scope", cell: (rule) => <StatusPill tone={rule.scope === "Cabang" ? "sky" : "slate"}>{rule.scope}</StatusPill> },
                ]}
              />
            </SectionPanel>
          </div>
        </div>
      );
    }

    if (crmKey === "notifications") {
      const triggers = ["membership_expiry_h7", "class_reminder_h2", "payment_pending", "birthday_reward", "pt_session_reschedule"].map((trigger, index) => ({
        id: `TRG-${index + 1}`,
        trigger,
        channel: index === 2 ? "Email + WhatsApp" : "WhatsApp",
        status: index < 4 ? "active" : "draft",
      }));
      const deliveryHealth = [
        { status: "Sent", value: 68, tone: "emerald" },
        { status: "Queued", value: 22, tone: "sky" },
        { status: "Retrying", value: 8, tone: "amber" },
        { status: "Failed", value: 2, tone: "rose" },
      ];

      return (
        <div className="space-y-6">
          <SectionPanel title="Automation Queue" subtitle="WhatsApp, push, dan email reminder per cabang.">
            <DataTable
              data={whatsappMessages.filter((item) => item.branchId === activeBranch.id || activeBranch.id === "branch-pusat")}
              getKey={(item) => item.id}
              columns={[
                { header: "Queue", cell: (item) => <span className="font-mono text-xs">{item.id}</span> },
                { header: "Template", cell: (item) => <span className="font-medium text-gray-900 dark:text-white">{item.template}</span> },
                { header: "Penerima", cell: (item) => item.recipient },
                { header: "Jadwal", cell: (item) => item.scheduledAt },
                { header: "Status", cell: (item) => <StatusPill tone={item.status === "sent" ? "emerald" : item.status === "retrying" ? "amber" : item.status === "failed" ? "rose" : "sky"}>{item.status}</StatusPill> },
                {
                  header: "Aksi",
                  cell: (item) => (
                    <div className="flex gap-2">
                      <TableActionIconButton
                        label="Detail queue"
                        icon={<EyeIcon />}
                        onClick={() => router.push(`/notifications/queue/${encodeURIComponent(item.id)}`)}
                        variant="info"
                      />
                      <TableActionIconButton
                        label="Tandai terkirim"
                        icon={<SendIcon />}
                        disabled={!canManageNotifications}
                        onClick={() => {
                          updateWhatsappStatus(item.id, "sent");
                          addAuditLog({
                            branchId: activeBranch.id,
                            actor: currentUser.name,
                            action: "notifications.whatsapp.sent",
                            target: item.id,
                          });
                        }}
                        variant="success"
                      />
                      <TableActionIconButton
                        label="Retry pesan"
                        icon={<RefreshIcon />}
                        disabled={!canManageNotifications}
                        onClick={() => {
                          updateWhatsappStatus(item.id, "retrying");
                          addAuditLog({
                            branchId: activeBranch.id,
                            actor: currentUser.name,
                            action: "notifications.whatsapp.retry",
                            target: item.id,
                          });
                        }}
                        variant="warning"
                      />
                    </div>
                  ),
                },
              ]}
            />
          </SectionPanel>
          <div className="grid gap-6 xl:grid-cols-2">
            <SectionPanel title="Trigger" subtitle="Event yang mengirim pesan otomatis.">
              <DataTable
                data={triggers}
                getKey={(trigger) => trigger.id}
                columns={[
                  { header: "Kode", cell: (trigger) => <span className="font-mono text-xs">{trigger.id}</span> },
                  { header: "Trigger", cell: (trigger) => <span className="font-mono text-xs">{trigger.trigger}</span> },
                  { header: "Channel", cell: (trigger) => trigger.channel },
                  { header: "Status", cell: (trigger) => <StatusPill tone={trigger.status === "active" ? "emerald" : "amber"}>{trigger.status}</StatusPill> },
                ]}
              />
            </SectionPanel>
            <SectionPanel title="Delivery Health" subtitle="Monitoring status pengiriman.">
              <DataTable
                data={deliveryHealth}
                getKey={(row) => row.status}
                columns={[
                  { header: "Status", cell: (row) => <span className="font-medium text-gray-900 dark:text-white">{row.status}</span> },
                  {
                    header: "Persentase",
                    cell: (row) => (
                      <div className="min-w-36">
                        <ProgressBar value={row.value} tone={row.tone} />
                        <p className="mt-1 text-xs text-gray-500">{row.value}%</p>
                      </div>
                    ),
                  },
                ]}
              />
            </SectionPanel>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <SectionPanel title="Promo Aktif" subtitle="Campaign loyalty dan diskon membership.">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {notificationMessage ? (
              <p className="text-sm text-emerald-600 dark:text-emerald-400">{notificationMessage}</p>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">Promo aktif otomatis muncul di POS.</p>
            )}
            <PrimaryToolbarButton onClick={() => openCreateModal("promo")} disabled={!canManagePromo}>
              Tambah Promo
            </PrimaryToolbarButton>
          </div>
          <DataTable
            data={promoRows}
            getKey={(promo) => promo.id}
            columns={[
              { header: "Promo", cell: (promo) => <span className="font-medium text-gray-900 dark:text-white">{promo.name}</span> },
              { header: "Kode", cell: (promo) => <StatusPill tone="amber">{promo.code}</StatusPill> },
              { header: "Benefit", cell: (promo) => promo.description, className: "min-w-[260px]" },
              { header: "Diskon", cell: (promo) => promo.type === "percentage" ? `${promo.discount}%` : formatCurrency(promo.discount) },
              {
                header: "Usage",
                cell: (promo) => (
                  <div className="min-w-36">
                    <ProgressBar value={(promo.usageCount / promo.maxUsage) * 100} tone="amber" />
                    <p className="mt-1 text-xs text-gray-500">{promo.usageCount}/{promo.maxUsage}</p>
                  </div>
                ),
              },
              { header: "Berlaku Sampai", cell: (promo) => promo.validUntil },
              { header: "Status", cell: (promo) => <StatusPill tone={promo.status === "active" ? "emerald" : promo.status === "upcoming" ? "sky" : "slate"}>{promo.status}</StatusPill> },
              {
                  header: "Aksi",
                  cell: (promo) => (
                    <div className="flex gap-2">
                    <TableActionIconButton
                      label="Detail promo"
                      icon={<EyeIcon />}
                      onClick={() => router.push(`/promo/campaigns/${encodeURIComponent(promo.id)}`)}
                      variant="info"
                    />
                    <TableActionIconButton
                      label="Edit promo"
                      icon={<PencilIcon />}
                      onClick={() => openEditPromoModal(promo)}
                      disabled={!canManagePromo}
                      variant="edit"
                    />
                    <TableActionIconButton
                      label={promo.status === "active" ? "Expire promo" : "Aktifkan promo"}
                      icon={<PowerIcon />}
                      disabled={!canManagePromo}
                      onClick={() => {
                        togglePromoStatus(promo.id);
                        addAuditLog({
                          branchId: activeBranch.id,
                          actor: currentUser.name,
                          action: "promos.status",
                          target: promo.name,
                        });
                      }}
                      variant={promo.status === "active" ? "warning" : "success"}
                    />
                  </div>
                ),
              },
            ]}
          />
        </SectionPanel>
        <SectionPanel title="Campaign Target" subtitle="Segmentasi campaign agar halaman promo tidak sekadar tabel.">
          <DataTable
            data={targetSegments}
            getKey={(segment) => segment.segment}
            columns={[
              { header: "Segment", cell: (segment) => <span className="font-medium text-gray-900 dark:text-white">{segment.segment}</span> },
              { header: "Campaign", cell: (segment) => segment.campaign },
              { header: "Channel", cell: (segment) => segment.channel },
              { header: "Status", cell: (segment) => <StatusPill tone={segment.status === "ready" ? "emerald" : "amber"}>{segment.status}</StatusPill> },
            ]}
          />
        </SectionPanel>
      </div>
    );
  };

  const renderMemberAdmin = () => {
    const memberKey = slug.at(-1);
    const statusOptions: Array<{ label: string; value: MemberStatusFilter }> = [
      { label: "Semua", value: "all" },
      { label: "Aktif", value: "active" },
      { label: "Habis", value: "expired" },
      { label: "Freeze", value: "frozen" },
    ];
    const statusTone = (status: MemberRow["membershipStatus"]): StatCardProps["tone"] =>
      status === "active" ? "emerald" : status === "frozen" ? "amber" : "rose";
    const disabledButtonClass = "disabled:cursor-not-allowed disabled:opacity-50";
    const canSubmitMemberForm = memberFormMode === "create" ? canCreateMember : canEditMember;

    const renderMemberToolbar = () => (
      <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row">
          <input
            value={memberSearch}
            onChange={(event) => setMemberSearch(event.target.value)}
            placeholder="Cari nama, email, telepon, kode referral"
            className="h-10 min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-emerald-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200"
          />
          <select
            value={memberStatusFilter}
            onChange={(event) => setMemberStatusFilter(event.target.value as MemberStatusFilter)}
            className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-emerald-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 sm:w-[180px]"
          >
            {statusOptions.map((filter) => (
              <option key={filter.value} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </select>
        </div>
        <PrimaryToolbarButton onClick={openCreateMemberForm} disabled={!canCreateMember}>
          Tambah Member
        </PrimaryToolbarButton>
        {pagedMembers.length > 0 && (
          <button
            type="button"
            onClick={toggleAllPagedMembers}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-200 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300"
          >
            Pilih Halaman
          </button>
        )}
        {selectedBulkMembers.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={bulkFreezeMembers}
              disabled={!canEditMember}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-amber-500 px-4 text-sm font-semibold text-white hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Freeze {selectedBulkMembers.length}
            </button>
            <button
              type="button"
              onClick={() => setSelectedBulkMembers([])}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-200 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300"
            >
              Clear
            </button>
          </div>
        )}
      </div>
    );

    const renderMemberActions = (member: MemberRow) => (
      <div className="flex gap-2">
        <TableActionIconButton
          label="Detail member"
          icon={<EyeIcon />}
          onClick={() => router.push(`/members/data/${encodeURIComponent(member.id)}`)}
          variant="info"
        />
        <TableActionIconButton
          label="Edit member"
          icon={<PencilIcon />}
          onClick={() => openEditMemberForm(member)}
          disabled={!canEditMember}
          variant="edit"
        />
        <button
          type="button"
          onClick={() =>
            requestDelete({
              title: "Renewal Membership",
              message: "Membership member akan diperpanjang 1 bulan dan point bertambah.",
              target: member.name,
              confirmLabel: "Proses Renewal",
              onConfirm: () => renewMember(member.id),
            })
          }
          disabled={!canEditMember}
          className={`rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 ${disabledButtonClass}`}
        >
          Renewal
        </button>
        <button
          type="button"
          onClick={() =>
            requestDelete({
              title: member.membershipStatus === "frozen" ? "Unfreeze Membership" : "Freeze Membership",
              message: "Status membership akan diperbarui di data prototype.",
              target: member.name,
              confirmLabel: member.membershipStatus === "frozen" ? "Unfreeze" : "Freeze",
              onConfirm: () => toggleFreezeMember(member.id),
            })
          }
          disabled={!canEditMember}
          className={`rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-400 ${disabledButtonClass}`}
        >
          {member.membershipStatus === "frozen" ? "Unfreeze" : "Freeze"}
        </button>
      </div>
    );

    const memberColumns: DataTableColumn<MemberRow>[] = [
      {
        header: "Pilih",
        cell: (member) => (
          <input
            type="checkbox"
            checked={selectedBulkMembers.includes(member.id)}
            onChange={() => toggleBulkMember(member.id)}
            className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
          />
        ),
      },
      {
        header: "Member",
        cell: (member) => (
          <div>
            <button
              type="button"
              onClick={() => router.push(`/members/data/${encodeURIComponent(member.id)}`)}
              className="font-medium text-gray-900 hover:text-emerald-600 dark:text-white dark:hover:text-emerald-400"
            >
              {member.name}
            </button>
            <p className="text-xs text-gray-500">{member.email}</p>
          </div>
        ),
      },
      { header: "Telepon", cell: (member) => member.phone },
      { header: "Paket", cell: (member) => member.membershipType },
      {
        header: "Status",
        cell: (member) => (
          <StatusPill tone={statusTone(member.membershipStatus)}>
            {member.membershipStatus}
          </StatusPill>
        ),
      },
      { header: "Berakhir", cell: (member) => member.membershipEnd },
      { header: "Visit", cell: (member) => `${member.checkins}x` },
      { header: "Aksi", cell: (member) => renderMemberActions(member), className: "min-w-[240px]" },
    ];

    const renderPagination = () => (
      <div className="mt-4 flex flex-col gap-3 border-t border-gray-100 pt-4 text-sm text-gray-500 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
        <span>
          Menampilkan {pagedMembers.length} dari {filteredMembers.length} member
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMemberPage((page) => Math.max(1, page - 1))}
            disabled={memberPage === 1}
            className={`rounded-lg border border-gray-200 px-3 py-1.5 font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300 ${disabledButtonClass}`}
          >
            Prev
          </button>
          <span className="px-2">
            {memberPage}/{totalMemberPages}
          </span>
          <button
            type="button"
            onClick={() => setMemberPage((page) => Math.min(totalMemberPages, page + 1))}
            disabled={memberPage === totalMemberPages}
            className={`rounded-lg border border-gray-200 px-3 py-1.5 font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300 ${disabledButtonClass}`}
          >
            Next
          </button>
        </div>
      </div>
    );

    const renderMemberFormPanel = () => {
      return (
        <Modal
          isOpen={memberFormOpen}
          onClose={() => setMemberFormOpen(false)}
          className="max-w-[720px] overflow-hidden p-0"
        >
          <form onSubmit={submitMemberForm} className="flex max-h-[calc(100vh-2rem)] flex-col">
            <div className="border-b border-gray-200 px-5 pb-5 pr-16 pt-6 dark:border-gray-800 sm:px-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {memberFormMode === "create" ? "Tambah Member" : "Edit Member"}
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Form dummy ini langsung mengubah data prototype di layar.
              </p>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto px-5 py-5 sm:px-6">
              {[
                ["Nama", "name", "text"],
                ["Email", "email", "email"],
                ["Telepon", "phone", "text"],
                ["Tanggal Expired", "membershipEnd", "date"],
                ["Berat (kg)", "weight", "number"],
                ["Tinggi (cm)", "height", "number"],
              ].map(([label, field, type]) => (
                <label key={field} className="block">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
                  <input
                    type={type}
                    value={memberForm[field as keyof MemberFormState]}
                    onChange={(event) => updateMemberForm(field as keyof MemberFormState, event.target.value)}
                    className="mt-1 h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-emerald-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200"
                  />
                </label>
              ))}
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Paket</span>
                  <select
                    value={memberForm.membershipType}
                    onChange={(event) => updateMemberForm("membershipType", event.target.value as MemberFormState["membershipType"])}
                    className="mt-1 h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-emerald-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200"
                  >
                    {activeMembershipPackageNames.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</span>
                  <select
                    value={memberForm.membershipStatus}
                    onChange={(event) => updateMemberForm("membershipStatus", event.target.value)}
                    className="mt-1 h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-emerald-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200"
                  >
                    {["active", "expired", "frozen"].map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-gray-200 bg-white px-5 py-4 dark:border-gray-800 dark:bg-gray-900 sm:flex-row sm:justify-end sm:px-6">
              <button
                type="button"
                onClick={() => setMemberFormOpen(false)}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-200 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={!canSubmitMemberForm}
                className={`inline-flex h-10 items-center justify-center rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700 ${disabledButtonClass}`}
              >
                Simpan
              </button>
            </div>
          </form>
        </Modal>
      );
    };

    if (slug[1] === "data" && slug[2]) {
      const memberId = decodeURIComponent(slug[2]);
      const detailMember = memberRows.find((member) => member.id === memberId);

      if (!detailMember) {
        return (
          <SectionPanel title="Member Tidak Ditemukan" subtitle="Data member tidak ada di dummy data aktif.">
            <button
              type="button"
              onClick={() => router.push("/members/data")}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-200 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300"
            >
              Kembali ke Data Member
            </button>
          </SectionPanel>
        );
      }

      const memberVisits = checkInRows.filter((checkIn) => checkIn.memberId === detailMember.id);
      const memberPtSessions = branchSnapshot.scopedPtSessions.filter((session) => session.memberId === detailMember.id);

      return (
        <div className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => router.push("/members/data")}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-200 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300"
            >
              Kembali
            </button>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => openEditMemberForm(detailMember)}
                disabled={!canEditMember}
                className={`inline-flex h-10 items-center justify-center rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700 ${disabledButtonClass}`}
              >
                Edit Member
              </button>
              <button
                type="button"
                onClick={() =>
                  requestDelete({
                    title: "Renewal Membership",
                    message: "Membership member akan diperpanjang 1 bulan dan point bertambah.",
                    target: detailMember.name,
                    confirmLabel: "Proses Renewal",
                    onConfirm: () => renewMember(detailMember.id),
                  })
                }
                disabled={!canEditMember}
                className={`inline-flex h-10 items-center justify-center rounded-lg bg-amber-500 px-4 text-sm font-semibold text-white hover:bg-amber-600 ${disabledButtonClass}`}
              >
                Renewal
              </button>
            </div>
          </div>

          <SectionPanel title={detailMember.name} subtitle="Detail profil, membership, progress, dan histori aktivitas member.">
            <div className="grid gap-4 lg:grid-cols-4">
              {[
                ["Paket", detailMember.membershipType, "emerald"],
                ["Status", detailMember.membershipStatus, statusTone(detailMember.membershipStatus)],
                ["Visit", `${detailMember.checkins}x`, "sky"],
                ["Point", `${detailMember.points.toLocaleString("id-ID")} pts`, "amber"],
              ].map(([label, value, tone]) => (
                <StatCard
                  key={label as string}
                  label={label as string}
                  value={String(value)}
                  helper="Data member"
                  icon={<MemberIcon className="h-5 w-5" />}
                  tone={tone as StatCardProps["tone"]}
                />
              ))}
            </div>
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <DataTable
                data={[
                  { label: "Email", value: detailMember.email },
                  { label: "Telepon", value: detailMember.phone },
                  { label: "Join", value: detailMember.joinDate },
                  { label: "Expired", value: detailMember.membershipEnd },
                  { label: "Referral", value: detailMember.referralCode },
                  { label: "BMI", value: detailMember.bmi ? String(detailMember.bmi) : "-" },
                ]}
                getKey={(row) => row.label}
                columns={[
                  { header: "Field", cell: (row) => row.label },
                  { header: "Nilai", cell: (row) => <span className="font-medium text-gray-900 dark:text-white">{row.value}</span> },
                ]}
              />
              <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
                <h3 className="font-semibold text-gray-900 dark:text-white">Body Profile</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Progress fisik terakhir.</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800/60">
                    <p className="text-sm text-gray-500">Berat</p>
                    <p className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">{detailMember.weight ?? "-"} kg</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800/60">
                    <p className="text-sm text-gray-500">Tinggi</p>
                    <p className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">{detailMember.height ?? "-"} cm</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800/60">
                    <p className="text-sm text-gray-500">Last Visit</p>
                    <p className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">{detailMember.lastCheckin ?? "-"}</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800/60">
                    <p className="text-sm text-gray-500">Membership</p>
                    <StatusPill tone={statusTone(detailMember.membershipStatus)}>{detailMember.membershipStatus}</StatusPill>
                  </div>
                </div>
              </div>
            </div>
          </SectionPanel>

          <div className="grid gap-6 xl:grid-cols-2">
            <SectionPanel title="Histori Check-In" subtitle="Aktivitas kunjungan member.">
              <DataTable
                data={memberVisits}
                getKey={(checkIn) => checkIn.id}
                columns={[
                  { header: "Tanggal", cell: (checkIn) => checkIn.date },
                  { header: "Masuk", cell: (checkIn) => checkIn.time },
                  { header: "Keluar", cell: (checkIn) => checkIn.checkoutTime || "-" },
                  { header: "Gate", cell: (checkIn) => checkIn.gate },
                ]}
              />
            </SectionPanel>
            <SectionPanel title="Sesi PT" subtitle="Sesi personal training terkait member.">
              <DataTable
                data={memberPtSessions}
                getKey={(session) => session.id}
                columns={[
                  { header: "Tanggal", cell: (session) => session.date },
                  { header: "Jam", cell: (session) => session.time },
                  { header: "Fokus", cell: (session) => session.focus },
                  { header: "Status", cell: (session) => <StatusPill tone={session.status === "completed" ? "emerald" : session.status === "cancelled" ? "rose" : "sky"}>{session.status}</StatusPill> },
                ]}
              />
            </SectionPanel>
          </div>
          {renderMemberFormPanel()}
        </div>
      );
    }

    if (memberKey === "membership") {
      return (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            {[
              ["Aktif", memberRows.filter((member) => member.membershipStatus === "active").length, "emerald"],
              ["Habis", memberRows.filter((member) => member.membershipStatus === "expired").length, "rose"],
              ["Freeze", memberRows.filter((member) => member.membershipStatus === "frozen").length, "amber"],
              ["Renewal", memberRows.filter((member) => member.membershipEnd <= prototypeToday).length, "sky"],
            ].map(([label, value, tone]) => (
              <StatCard
                key={label as string}
                label={label as string}
                value={String(value)}
                helper="Status membership dummy"
                icon={<MemberIcon className="h-5 w-5" />}
                tone={tone as StatCardProps["tone"]}
              />
            ))}
          </div>
          <div className="space-y-6">
            <SectionPanel title="Data Membership" subtitle="Status aktif, habis, freeze, dan renewal dalam satu tabel.">
              {renderMemberToolbar()}
              <DataTable
                data={filteredMembers}
                getKey={(member) => member.id}
                columns={[
                  { header: "Member", cell: (member) => <span className="font-medium text-gray-900 dark:text-white">{member.name}</span> },
                  { header: "Paket", cell: (member) => member.membershipType },
                  { header: "Mulai", cell: (member) => member.membershipStart },
                  { header: "Berakhir", cell: (member) => member.membershipEnd },
                  {
                    header: "Status",
                    cell: (member) => (
                      <StatusPill tone={statusTone(member.membershipStatus)}>
                        {member.membershipStatus}
                      </StatusPill>
                    ),
                  },
                  { header: "Aksi", cell: (member) => renderMemberActions(member), className: "min-w-[300px]" },
                ]}
              />
            </SectionPanel>
            {renderMemberFormPanel()}
          </div>
        </div>
      );
    }

    if (memberKey === "visits") {
      return (
        <SectionPanel title="Histori Kunjungan" subtitle={`Riwayat check-in member untuk ${activeBranch.name}.`}>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <input
              value={memberSearch}
              onChange={(event) => setMemberSearch(event.target.value)}
              placeholder="Cari member"
              className="h-10 min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-emerald-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200"
            />
            <StatusPill tone="sky">{branchSnapshot.scopedCheckIns.length} log</StatusPill>
          </div>
          <DataTable
            data={branchSnapshot.scopedCheckIns.filter((checkIn) =>
              checkIn.memberName.toLowerCase().includes(memberSearch.trim().toLowerCase()),
            )}
            getKey={(checkIn) => checkIn.id}
            columns={[
              { header: "Member", cell: (checkIn) => <span className="font-medium text-gray-900 dark:text-white">{checkIn.memberName}</span> },
              { header: "Tanggal", cell: (checkIn) => checkIn.date },
              { header: "Masuk", cell: (checkIn) => checkIn.time },
              { header: "Keluar", cell: (checkIn) => checkIn.checkoutTime || "-" },
              { header: "Gate", cell: (checkIn) => checkIn.gate },
              {
                header: "Status",
                cell: (checkIn) => (
                  <StatusPill tone={checkIn.checkoutTime ? "slate" : "emerald"}>
                    {checkIn.checkoutTime ? "Selesai" : "Di Gym"}
                  </StatusPill>
                ),
              },
            ]}
          />
        </SectionPanel>
      );
    }

    if (memberKey === "progress") {
      return (
        <div className="space-y-6">
          <SectionPanel title="Progress Member" subtitle="Tracking berat, BMI, check-in, dan target fitness member.">
            {renderMemberToolbar()}
            <DataTable
              data={filteredMembers}
              getKey={(member) => member.id}
              columns={[
                { header: "Member", cell: (member) => <span className="font-medium text-gray-900 dark:text-white">{member.name}</span> },
                { header: "Berat", cell: (member) => `${member.weight ?? "-"} kg` },
                { header: "Tinggi", cell: (member) => `${member.height ?? "-"} cm` },
                { header: "BMI", cell: (member) => member.bmi ?? "-" },
                { header: "Check-In", cell: (member) => `${member.checkins}x` },
                { header: "Last Visit", cell: (member) => member.lastCheckin ?? "-" },
                {
                  header: "Aksi",
                  cell: (member) => (
                    <div className="flex gap-2">
                      <TableActionIconButton
                        label="Detail progress"
                        icon={<EyeIcon />}
                        onClick={() => router.push(`/members/data/${encodeURIComponent(member.id)}`)}
                        variant="info"
                      />
                      <button
                        type="button"
                        onClick={() => openEditMemberForm(member)}
                        disabled={!canEditMember}
                        className={`rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 ${disabledButtonClass}`}
                      >
                        Update Progress
                      </button>
                    </div>
                  ),
                },
              ]}
            />
          </SectionPanel>
          {renderMemberFormPanel()}
        </div>
      );
    }

    if (memberKey === "referrals") {
      return (
        <SectionPanel title="Referral Member" subtitle="Kode referral, point, dan status follow-up member.">
          {renderMemberToolbar()}
          <DataTable
            data={filteredMembers}
            getKey={(member) => member.id}
            columns={[
              { header: "Member", cell: (member) => <span className="font-medium text-gray-900 dark:text-white">{member.name}</span> },
              { header: "Kode Referral", cell: (member) => <span className="font-mono text-xs">{member.referralCode}</span> },
              { header: "Point", cell: (member) => member.points.toLocaleString("id-ID") },
              { header: "Estimasi Lead", cell: (_member, index) => `${5 - Math.min(index, 4)} lead` },
              {
                header: "Status",
                cell: (member) => (
                  <StatusPill tone={member.points >= 2000 ? "emerald" : "sky"}>{member.points >= 2000 ? "top referrer" : "regular"}</StatusPill>
                ),
              },
            ]}
          />
        </SectionPanel>
      );
    }

    return (
      <div className="space-y-6">
        <SectionPanel title="Data Member" subtitle="Tabel member dengan search, filter, pagination, dan action dummy yang hidup.">
          {renderMemberToolbar()}
          <DataTable data={pagedMembers} getKey={(member) => member.id} columns={memberColumns} />
          {renderPagination()}
        </SectionPanel>
        {renderMemberFormPanel()}
      </div>
    );
  };

  const renderCheckInAdmin = () => {
    const checkInKey = slug.at(-1);
    const searchedCheckIns = checkInRows.filter((checkIn) =>
      checkIn.memberName.toLowerCase().includes(checkInSearch.trim().toLowerCase()),
    );
    const liveCheckIns = searchedCheckIns.filter((checkIn) => !checkIn.checkoutTime);
    const tableRows = checkInKey === "live" ? liveCheckIns : searchedCheckIns;
    const checkInColumns: DataTableColumn<(typeof checkInRows)[number]>[] = [
      { header: "Member", cell: (checkIn) => <span className="font-medium text-gray-900 dark:text-white">{checkIn.memberName}</span> },
      { header: "Tanggal", cell: (checkIn) => checkIn.date },
      { header: "Masuk", cell: (checkIn) => checkIn.time },
      { header: "Keluar", cell: (checkIn) => checkIn.checkoutTime || "-" },
      { header: "Gate", cell: (checkIn) => checkIn.gate },
      {
        header: "Status",
        cell: (checkIn) => (
          <StatusPill tone={checkIn.checkoutTime ? "slate" : "emerald"}>
            {checkIn.checkoutTime ? "Selesai" : "Di Gym"}
          </StatusPill>
        ),
      },
      {
        header: "Aksi",
        cell: (checkIn) =>
          checkIn.checkoutTime ? (
            <span className="text-xs text-gray-400">Done</span>
          ) : (
            <button
              type="button"
              onClick={() =>
                requestDelete({
                  title: "Checkout Member",
                  message: "Member akan ditandai keluar dari area gym.",
                  target: checkIn.memberName,
                  confirmLabel: "Checkout",
                  onConfirm: () => checkoutMember(checkIn.id),
                })
              }
              className="rounded-lg bg-sky-50 px-3 py-1.5 text-xs font-medium text-sky-700 hover:bg-sky-100 dark:bg-sky-500/10 dark:text-sky-300"
            >
              Checkout
            </button>
          ),
      },
    ];

    if (checkInKey === "scan") {
      return (
        <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
          <SectionPanel title="Scan QR Check-In" subtitle="Validasi membership dan akses cabang dari QR member.">
            <div className="space-y-4">
              <div className="rounded-xl border border-dashed border-emerald-300 bg-emerald-50 p-8 text-center dark:border-emerald-500/30 dark:bg-emerald-500/10">
                <QrCodeIcon className="mx-auto h-20 w-20 text-emerald-600 dark:text-emerald-400" />
                <p className="mt-4 text-sm font-medium text-emerald-800 dark:text-emerald-300">
                  Simulasi scan QR member
                </p>
              </div>
              <label className="block">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Member</span>
                <select
                  value={scanMemberId}
                  onChange={(event) => setScanMemberId(event.target.value)}
                  className="mt-1 h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-emerald-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200"
                >
                  {memberRows.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name} - {member.membershipStatus}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                onClick={scanCheckInMember}
                disabled={!canCreateCheckIn}
                className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Scan & Check-In
              </button>
              {scanResult && (
                <div className={`rounded-lg px-3 py-2 text-sm ${toneClass[scanResult.tone ?? "emerald"]}`}>
                  {scanResult.message}
                </div>
              )}
            </div>
          </SectionPanel>
          <SectionPanel title="Recent Check-In" subtitle="Hasil scan terbaru hari ini.">
            <DataTable data={checkInRows.slice(0, 8)} getKey={(checkIn) => checkIn.id} columns={checkInColumns} />
          </SectionPanel>
        </div>
      );
    }

    if (checkInKey === "inactive") {
      return (
        <SectionPanel title="Member Tidak Aktif" subtitle="Member jarang datang untuk follow-up retention.">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <input
              value={memberSearch}
              onChange={(event) => setMemberSearch(event.target.value)}
              placeholder="Cari member pasif"
              className="h-10 min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-emerald-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200"
            />
            <StatusPill tone="amber">
              {memberRows.filter((member) => member.checkins < 100).length} follow-up
            </StatusPill>
          </div>
          <DataTable
            data={memberRows.filter(
              (member) =>
                member.checkins < 100 &&
                member.name.toLowerCase().includes(memberSearch.trim().toLowerCase()),
            )}
            getKey={(member) => member.id}
            columns={[
              { header: "Member", cell: (member) => <span className="font-medium text-gray-900 dark:text-white">{member.name}</span> },
              { header: "Paket", cell: (member) => member.membershipType },
              { header: "Total Visit", cell: (member) => `${member.checkins}x` },
              { header: "Last Visit", cell: (member) => member.lastCheckin ?? "-" },
              {
                header: "Status",
                cell: (member) => (
                  <StatusPill tone={member.membershipStatus === "expired" ? "rose" : "amber"}>
                    {member.membershipStatus === "expired" ? "renewal" : "follow-up"}
                  </StatusPill>
                ),
              },
              {
                header: "Aksi",
                cell: (member) => (
                  <button
                    type="button"
                    onClick={() => router.push(`/members/data/${encodeURIComponent(member.id)}`)}
                    className="rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-300"
                  >
                    Follow-up
                  </button>
                ),
              },
            ]}
          />
        </SectionPanel>
      );
    }

    return (
      <SectionPanel title={checkInKey === "live" ? "Member Sedang Gym" : "Histori Check-In"} subtitle={`Monitoring check-in untuk ${activeBranch.name}.`}>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <input
            value={checkInSearch}
            onChange={(event) => setCheckInSearch(event.target.value)}
            placeholder="Cari member"
            className="h-10 min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-emerald-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200"
          />
          <div className="flex gap-2">
            <StatusPill tone="emerald">{liveCheckIns.length} sedang gym</StatusPill>
            <StatusPill tone="sky">{checkInRows.length} log</StatusPill>
          </div>
        </div>
        <DataTable data={tableRows} getKey={(checkIn) => checkIn.id} columns={checkInColumns} />
      </SectionPanel>
    );
  };

  const renderClassAdmin = () => {
    const classKey = slug.at(-1);
    const classBookingTone = (status: string): StatCardProps["tone"] =>
      status === "confirmed" || status === "attended"
        ? "emerald"
        : status === "cancelled"
        ? "rose"
        : "amber";
    const renderClassBookingForm = () => (
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {classBookingMessage && (
          <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
            {classBookingMessage}
          </p>
        )}
        {!classBookingMessage && <p className="text-sm text-gray-500 dark:text-gray-400">Booking baru masuk ke tabel kelas.</p>}
        <PrimaryToolbarButton onClick={() => setActionModal("class-booking")} disabled={!canManageClasses}>
          Buat Booking Kelas
        </PrimaryToolbarButton>
      </div>
    );
    const classBookingColumns = [
      { header: "Booking", cell: (booking) => <span className="font-mono text-xs">{booking.id}</span> },
      { header: "Kelas", cell: (booking) => <span className="font-medium text-gray-900 dark:text-white">{booking.className}</span> },
      { header: "Member", cell: (booking) => booking.memberName },
      { header: "Tanggal", cell: (booking) => booking.date },
      { header: "Jam", cell: (booking) => booking.time },
      { header: "Kapasitas", cell: (booking) => booking.capacity },
      { header: "Status", cell: (booking) => <StatusPill tone={classBookingTone(booking.status)}>{booking.status}</StatusPill> },
      {
        header: "Aksi",
        cell: (booking) => (
          <div className="flex gap-2">
            {booking.status === "waitlist" && (
              <TableActionIconButton
                label="Promote booking"
                icon={<RefreshIcon />}
                onClick={() => promoteClassWaitlist(booking.id)}
                disabled={!canManageClasses}
                variant="info"
              />
            )}
            {booking.status === "confirmed" && (
              <TableActionIconButton
                label="Tandai hadir"
                icon={<CheckSmallIcon />}
                onClick={() => markClassAttendance(booking.id)}
                disabled={!canManageClasses}
                variant="success"
              />
            )}
            {booking.status !== "cancelled" && booking.status !== "attended" && (
              <TableActionIconButton
                label="Cancel booking"
                icon={<XSmallIcon />}
                onClick={() => cancelClassBooking(booking.id)}
                disabled={!canManageClasses}
                variant="delete"
              />
            )}
          </div>
        ),
        className: "min-w-[140px]",
      },
    ] satisfies DataTableColumn<(typeof branchSnapshot.scopedClassBookings)[number]>[];

    if (slug[1] === "schedule" && slug[2]) {
      const classId = decodeURIComponent(slug[2]);
      const detailClass = branchSnapshot.scopedClasses.find((gymClass) => gymClass.id === classId);
      const trainer = trainerRows.find((item) => item.id === detailClass?.trainerId);
      const relatedBookings = branchSnapshot.scopedClassBookings.filter(
        (booking) => booking.className === detailClass?.name,
      );

      if (!detailClass) {
        return (
          <SectionPanel title="Kelas Tidak Ditemukan" subtitle="Jadwal kelas tidak ada di cabang aktif.">
            <button
              type="button"
              onClick={() => router.push("/classes/schedule")}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-200 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300"
            >
              Kembali ke Jadwal Kelas
            </button>
          </SectionPanel>
        );
      }

      return (
        <div className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => router.push("/classes/schedule")}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-200 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300"
            >
              Kembali
            </button>
            <PrimaryToolbarButton onClick={() => openEditGymClassModal(detailClass)} disabled={!canManageClasses}>
              Edit Kelas
            </PrimaryToolbarButton>
          </div>
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <SectionPanel title={detailClass.name} subtitle={detailClass.description}>
              <div className="grid gap-4 md:grid-cols-4">
                <StatCard label="Trainer" value={trainer?.name ?? detailClass.trainerId} helper="Penanggung jawab kelas" icon={<TrainerIcon className="h-5 w-5" />} tone="emerald" />
                <StatCard label="Kapasitas" value={`${detailClass.currentParticipants}/${detailClass.maxParticipants}`} helper="Peserta terdaftar" icon={<ClassIcon className="h-5 w-5" />} tone={detailClass.status === "full" ? "amber" : "sky"} />
                <StatCard label="Durasi" value={`${detailClass.duration}m`} helper="Durasi kelas" icon={<ClockIcon className="h-5 w-5" />} tone="slate" />
                <StatCard label="Status" value={detailClass.status} helper={detailClass.room} icon={<CheckSmallIcon className="h-5 w-5" />} tone={detailClass.status === "full" ? "amber" : "emerald"} />
              </div>
              <div className="mt-6">
                <DataTable
                  data={detailClass.schedule}
                  getKey={(row, index) => `${row.day}-${row.time}-${index}`}
                  columns={[
                    { header: "Hari", cell: (row) => row.day },
                    { header: "Jam", cell: (row) => row.time },
                    { header: "Ruangan", cell: () => detailClass.room },
                  ]}
                />
              </div>
            </SectionPanel>
            <SectionPanel title="Booking Terkait" subtitle="Booking dan waiting list untuk kelas ini.">
              <DataTable
                data={relatedBookings}
                getKey={(booking) => booking.id}
                columns={[
                  { header: "Member", cell: (booking) => booking.memberName },
                  { header: "Tanggal", cell: (booking) => booking.date },
                  { header: "Status", cell: (booking) => <StatusPill tone={classBookingTone(booking.status)}>{booking.status}</StatusPill> },
                ]}
              />
            </SectionPanel>
          </div>
        </div>
      );
    }

    if (classKey === "bookings") {
      return (
        <SectionPanel title="Booking Kelas" subtitle="Daftar booking, confirmation, dan waiting list kelas.">
          {renderClassBookingForm()}
          <DataTable
            data={branchSnapshot.scopedClassBookings}
            getKey={(booking) => booking.id}
            columns={classBookingColumns}
          />
        </SectionPanel>
      );
    }

    if (classKey === "capacity") {
      return (
        <SectionPanel title="Kapasitas & Waiting List" subtitle="Monitoring kuota kelas dan antrean kelas penuh.">
          <DataTable
            data={branchSnapshot.scopedClasses}
            getKey={(gymClass) => gymClass.id}
            columns={[
              { header: "Kelas", cell: (gymClass) => <span className="font-medium text-gray-900 dark:text-white">{gymClass.name}</span> },
              { header: "Kategori", cell: (gymClass) => gymClass.category },
              {
                header: "Kapasitas",
                cell: (gymClass) => {
                  const confirmed = branchSnapshot.scopedClassBookings.filter(
                    (booking) => booking.className === gymClass.name && ["confirmed", "attended"].includes(booking.status),
                  ).length;
                  return `${Math.min(gymClass.currentParticipants + confirmed, gymClass.maxParticipants)}/${gymClass.maxParticipants}`;
                },
              },
              {
                header: "Waiting List",
                cell: (gymClass) => {
                  const waitlist = branchSnapshot.scopedClassBookings.filter(
                    (booking) => booking.className === gymClass.name && booking.status === "waitlist",
                  ).length;
                  return waitlist ? `${waitlist} member` : "-";
                },
              },
              {
                header: "Occupancy",
                cell: (gymClass) => {
                  const confirmed = branchSnapshot.scopedClassBookings.filter(
                    (booking) => booking.className === gymClass.name && ["confirmed", "attended"].includes(booking.status),
                  ).length;
                  return (
                    <div className="min-w-36">
                      <ProgressBar value={((gymClass.currentParticipants + confirmed) / gymClass.maxParticipants) * 100} tone={gymClass.status === "full" ? "amber" : "emerald"} />
                    </div>
                  );
                },
              },
              { header: "Status", cell: (gymClass) => <StatusPill tone={gymClass.status === "full" ? "amber" : "emerald"}>{gymClass.status}</StatusPill> },
            ]}
          />
        </SectionPanel>
      );
    }

    if (classKey === "attendance") {
      return (
        <SectionPanel title="Absensi Kelas" subtitle="Kehadiran peserta per kelas.">
          <DataTable
            data={branchSnapshot.scopedClassBookings.filter((booking) => booking.status !== "waitlist")}
            getKey={(booking) => `ATT-${booking.id}`}
            columns={[
              { header: "Kelas", cell: (booking) => <span className="font-medium text-gray-900 dark:text-white">{booking.className}</span> },
              { header: "Member", cell: (booking) => booking.memberName },
              { header: "Tanggal", cell: (booking) => booking.date },
              { header: "Jam", cell: (booking) => booking.time },
              { header: "Absensi", cell: (booking) => <StatusPill tone={classBookingTone(booking.status)}>{booking.status === "attended" ? "Hadir" : booking.status}</StatusPill> },
              {
                header: "Aksi",
                cell: (booking) =>
                  booking.status === "confirmed" ? (
                    <TableActionIconButton
                      label="Tandai hadir"
                      icon={<CheckSmallIcon />}
                      onClick={() => markClassAttendance(booking.id)}
                      disabled={!canManageClasses}
                      variant="success"
                    />
                  ) : (
                    <span className="text-xs text-gray-400">Done</span>
                  ),
              },
            ]}
          />
        </SectionPanel>
      );
    }

    return (
      <SectionPanel title="Jadwal Kelas" subtitle="Jadwal kelas, durasi, trainer, dan status kelas.">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {crudMessage ? (
            <p className="text-sm text-emerald-600 dark:text-emerald-400">{crudMessage}</p>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">Kelola jadwal kelas dan booking dari toolbar.</p>
          )}
          <div className="flex flex-col gap-2 sm:flex-row">
            <PrimaryToolbarButton onClick={openCreateGymClassModal} disabled={!canManageClasses}>Tambah Kelas</PrimaryToolbarButton>
            <PrimaryToolbarButton onClick={() => setActionModal("class-booking")} disabled={!canManageClasses}>Buat Booking</PrimaryToolbarButton>
          </div>
        </div>
        <DataTable
          data={branchSnapshot.scopedClasses}
          getKey={(gymClass) => gymClass.id}
          columns={[
            { header: "Kelas", cell: (gymClass) => <span className="font-medium text-gray-900 dark:text-white">{gymClass.name}</span> },
            { header: "Kategori", cell: (gymClass) => gymClass.category },
            { header: "Durasi", cell: (gymClass) => `${gymClass.duration} menit` },
            { header: "Jadwal", cell: (gymClass) => gymClass.schedule.map((item) => `${item.day} ${item.time}`).join(", ") },
            { header: "Kapasitas", cell: (gymClass) => `${gymClass.currentParticipants}/${gymClass.maxParticipants}` },
            { header: "Status", cell: (gymClass) => <StatusPill tone={gymClass.status === "full" ? "amber" : "emerald"}>{gymClass.status}</StatusPill> },
            {
              header: "Aksi",
              cell: (gymClass) => (
                <div className="flex gap-2">
                  <TableActionIconButton
                    label="Detail kelas"
                    icon={<EyeIcon />}
                    onClick={() => openClassDetail(gymClass)}
                    variant="info"
                  />
                  <TableActionIconButton
                    label="Edit kelas"
                    icon={<PencilIcon />}
                    onClick={() => openEditGymClassModal(gymClass)}
                    disabled={!canManageClasses}
                    variant="edit"
                  />
                  <TableActionIconButton
                    label="Hapus kelas"
                    icon={<TrashIcon />}
                    onClick={() =>
                      requestDelete({
                        title: "Hapus Kelas",
                        message: "Data jadwal kelas dan booking terkait akan dihapus dari prototype.",
                        target: gymClass.name,
                        onConfirm: () => {
                          deleteGymClass(gymClass.id);
                          setCrudMessage(`${gymClass.name} dihapus.`);
                          addAuditLog({
                            branchId: activeBranch.id,
                            actor: currentUser.name,
                            action: "classes.delete",
                            target: gymClass.name,
                          });
                        },
                      })
                    }
                    disabled={!canManageClasses}
                    variant="delete"
                  />
                </div>
              ),
            },
          ]}
        />
      </SectionPanel>
    );
  };

  const renderTrainerAdmin = () => {
    const trainerKey = slug.at(-1);
    const ptStatusTone = (status: PrototypePTSession["status"]): StatCardProps["tone"] =>
      status === "completed" ? "emerald" : status === "cancelled" ? "rose" : "sky";
    const renderPtBookingForm = () => (
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {ptBookingMessage && (
          <p className="rounded-lg bg-sky-50 px-3 py-2 text-sm text-sky-700 dark:bg-sky-500/10 dark:text-sky-300">
            {ptBookingMessage}
          </p>
        )}
        {!ptBookingMessage && <p className="text-sm text-gray-500 dark:text-gray-400">Booking PT baru masuk ke jadwal trainer.</p>}
        <PrimaryToolbarButton onClick={() => setActionModal("pt-booking")} disabled={!canManageTrainers}>
          Buat Booking PT
        </PrimaryToolbarButton>
      </div>
    );
    const ptSessionColumns = [
      { header: "Sesi", cell: (session) => <span className="font-mono text-xs">{session.id}</span> },
      { header: "Member", cell: (session) => <span className="font-medium text-gray-900 dark:text-white">{session.memberName}</span> },
      { header: "Tanggal", cell: (session) => session.date },
      { header: "Jam", cell: (session) => session.time },
      { header: "Durasi", cell: (session) => `${session.duration} menit` },
      { header: "Fokus", cell: (session) => session.focus },
      { header: "Status", cell: (session) => <StatusPill tone={ptStatusTone(session.status)}>{session.status}</StatusPill> },
      {
        header: "Aksi",
        cell: (session) =>
          session.status === "scheduled" ? (
            <div className="flex gap-2">
              <TableActionIconButton
                label="Selesaikan sesi"
                icon={<CheckSmallIcon />}
                onClick={() => updatePtSessionStatus(session.id, "completed")}
                disabled={!canManageTrainers}
                variant="success"
              />
              <TableActionIconButton
                label="Cancel sesi"
                icon={<XSmallIcon />}
                onClick={() => updatePtSessionStatus(session.id, "cancelled")}
                disabled={!canManageTrainers}
                variant="delete"
              />
            </div>
          ) : (
            <span className="text-xs text-gray-400">Done</span>
          ),
        className: "min-w-[120px]",
      },
    ] satisfies DataTableColumn<PrototypePTSession>[];

    if (slug[1] === "data" && slug[2]) {
      const trainerId = decodeURIComponent(slug[2]);
      const detailTrainer = trainerRows.find((trainer) => trainer.id === trainerId);
      const sessions = branchSnapshot.scopedPtSessions.filter((session) => session.trainerId === trainerId);
      const clients = branchSnapshot.scopedMembers.filter((member) =>
        sessions.some((session) => session.memberId === member.id),
      );

      if (!detailTrainer) {
        return (
          <SectionPanel title="Trainer Tidak Ditemukan" subtitle="Data trainer tidak ada di dummy data aktif.">
            <button
              type="button"
              onClick={() => router.push("/trainers/data")}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-200 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300"
            >
              Kembali ke Data Trainer
            </button>
          </SectionPanel>
        );
      }

      return (
        <div className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => router.push("/trainers/data")}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-200 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300"
            >
              Kembali
            </button>
            <PrimaryToolbarButton onClick={() => openEditTrainerModal(detailTrainer)} disabled={!canManageTrainers}>
              Edit Trainer
            </PrimaryToolbarButton>
          </div>
          <SectionPanel title={detailTrainer.name} subtitle="Detail personal trainer, client, jadwal, target, dan komisi.">
            <div className="grid gap-4 md:grid-cols-4">
              <StatCard label="Client Aktif" value={String(clients.length || detailTrainer.activeClients)} helper={`${detailTrainer.totalClients} total client`} icon={<MemberIcon className="h-5 w-5" />} tone="emerald" />
              <StatCard label="Rate" value={formatCurrency(detailTrainer.hourlyRate)} helper="Tarif per sesi" icon={<CreditCardIcon className="h-5 w-5" />} tone="amber" />
              <StatCard label="Target" value={`${detailTrainer.currentSessions}/${detailTrainer.monthlyTarget}`} helper="Sesi bulan ini" icon={<TargetIcon className="h-5 w-5" />} tone="sky" />
              <StatCard label="Rating" value={String(detailTrainer.rating)} helper={detailTrainer.status} icon={<TrainerIcon className="h-5 w-5" />} tone={detailTrainer.status === "active" ? "emerald" : "slate"} />
            </div>
            <div className="mt-6 grid gap-6 xl:grid-cols-2">
              <DataTable
                data={[
                  { label: "Email", value: detailTrainer.email },
                  { label: "Telepon", value: detailTrainer.phone },
                  { label: "Spesialisasi", value: detailTrainer.specializations.join(", ") },
                  { label: "Komisi", value: formatCurrency(detailTrainer.commission) },
                ]}
                getKey={(row) => row.label}
                columns={[
                  { header: "Field", cell: (row) => row.label },
                  { header: "Nilai", cell: (row) => <span className="font-medium text-gray-900 dark:text-white">{row.value}</span> },
                ]}
              />
              <DataTable
                data={clients}
                getKey={(client) => client.id}
                columns={[
                  { header: "Client", cell: (client) => client.name },
                  { header: "Paket", cell: (client) => client.membershipType },
                  { header: "BMI", cell: (client) => client.bmi ?? "-" },
                ]}
              />
            </div>
          </SectionPanel>
          <SectionPanel title="Jadwal PT" subtitle="Sesi PT yang ditangani trainer ini.">
            <DataTable data={sessions} getKey={(session) => session.id} columns={ptSessionColumns} />
          </SectionPanel>
        </div>
      );
    }

    if (trainerKey === "schedule" || trainerKey === "bookings") {
      return (
        <SectionPanel title={trainerKey === "schedule" ? "Jadwal Trainer" : "Booking PT"} subtitle="Sesi personal trainer berdasarkan jadwal dan status booking.">
          {renderPtBookingForm()}
          <DataTable
            data={branchSnapshot.scopedPtSessions}
            getKey={(session) => session.id}
            columns={ptSessionColumns}
          />
        </SectionPanel>
      );
    }

    if (trainerKey === "clients") {
      return (
        <SectionPanel title="Client Trainer" subtitle="Member yang sedang ditangani personal trainer.">
          <DataTable
            data={branchSnapshot.scopedMembers}
            getKey={(member) => member.id}
            columns={[
              { header: "Client", cell: (member) => <span className="font-medium text-gray-900 dark:text-white">{member.name}</span> },
              { header: "Paket", cell: (member) => member.membershipType },
              { header: "Check-In", cell: (member) => `${member.checkins}x` },
              { header: "BMI", cell: (member) => member.bmi ?? "-" },
              { header: "Point", cell: (member) => member.points.toLocaleString("id-ID") },
              {
                header: "Trainer",
                cell: (member) => {
                  const session = branchSnapshot.scopedPtSessions.find((item) => item.memberId === member.id);
                  const trainer = trainerRows.find((item) => item.id === session?.trainerId);
                  return trainer?.name ?? "-";
                },
              },
              {
                header: "Status Sesi",
                cell: (member) => {
                  const session = branchSnapshot.scopedPtSessions.find((item) => item.memberId === member.id);
                  return session ? <StatusPill tone={ptStatusTone(session.status)}>{session.status}</StatusPill> : "-";
                },
              },
            ]}
          />
        </SectionPanel>
      );
    }

    if (trainerKey === "performance") {
      return (
        <SectionPanel title="Performa Trainer" subtitle="Komisi, rating, target, dan client aktif dalam satu tabel.">
          <DataTable
            data={trainerRows}
            getKey={(trainer) => trainer.id}
            columns={[
              { header: "Trainer", cell: (trainer) => <span className="font-medium text-gray-900 dark:text-white">{trainer.name}</span> },
              {
                header: "Client Aktif",
                cell: (trainer) => {
                  const activeClientIds = new Set(
                    branchSnapshot.scopedPtSessions
                      .filter((session) => session.trainerId === trainer.id && session.status !== "cancelled")
                      .map((session) => session.memberId),
                  );
                  return activeClientIds.size || trainer.activeClients;
                },
              },
              {
                header: "Sesi",
                cell: (trainer) => {
                  const completed = branchSnapshot.scopedPtSessions.filter(
                    (session) => session.trainerId === trainer.id && session.status === "completed",
                  ).length;
                  const scheduled = branchSnapshot.scopedPtSessions.filter(
                    (session) => session.trainerId === trainer.id && session.status === "scheduled",
                  ).length;
                  return `${completed} done / ${scheduled} upcoming`;
                },
              },
              { header: "Rating", cell: (trainer) => trainer.rating },
              {
                header: "Komisi",
                cell: (trainer) => {
                  const completed = branchSnapshot.scopedPtSessions.filter(
                    (session) => session.trainerId === trainer.id && session.status === "completed",
                  ).length;
                  return formatCurrency(trainer.commission + completed * 150000);
                },
              },
              { header: "Status", cell: (trainer) => <StatusPill tone={trainer.status === "active" ? "emerald" : "amber"}>{trainer.status}</StatusPill> },
            ]}
          />
        </SectionPanel>
      );
    }

    return (
      <SectionPanel title="Data Trainer" subtitle="Data personal trainer, spesialisasi, rate, dan status.">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {trainerMessage ? (
            <p className="text-sm text-emerald-600 dark:text-emerald-400">{trainerMessage}</p>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">Tambah dan kelola trainer lewat popup responsif.</p>
          )}
          <PrimaryToolbarButton onClick={openCreateTrainerModal} disabled={!canManageTrainers}>
            Tambah Trainer
          </PrimaryToolbarButton>
        </div>
        <DataTable
          data={trainerRows}
          getKey={(trainer) => trainer.id}
          columns={[
            { header: "Trainer", cell: (trainer) => <span className="font-medium text-gray-900 dark:text-white">{trainer.name}</span> },
            { header: "Email", cell: (trainer) => trainer.email },
            { header: "Spesialisasi", cell: (trainer) => trainer.specializations.slice(0, 2).join(", ") },
            { header: "Rate", cell: (trainer) => formatCurrency(trainer.hourlyRate) },
            { header: "Rating", cell: (trainer) => trainer.rating },
            { header: "Status", cell: (trainer) => <StatusPill tone={trainer.status === "active" ? "emerald" : "amber"}>{trainer.status}</StatusPill> },
            {
              header: "Aksi",
              cell: (trainer) => (
                <div className="flex gap-2">
                  <TableActionIconButton
                    label="Detail trainer"
                    icon={<EyeIcon />}
                    onClick={() => openTrainerDetail(trainer)}
                    variant="info"
                  />
                  <TableActionIconButton
                    label="Edit trainer"
                    icon={<PencilIcon />}
                    onClick={() => openEditTrainerModal(trainer)}
                    disabled={!canManageTrainers}
                    variant="edit"
                  />
                  <TableActionIconButton
                    label="Hapus trainer"
                    icon={<TrashIcon />}
                    onClick={() =>
                      requestDelete({
                        title: "Hapus Trainer",
                        message: "Trainer akan dihapus dari data prototype.",
                        target: trainer.name,
                        onConfirm: () => deleteTrainerRow(trainer),
                      })
                    }
                    disabled={!canManageTrainers}
                    variant="delete"
                  />
                </div>
              ),
            },
          ]}
        />
      </SectionPanel>
    );
  };

  const renderPaymentAdmin = () => {
    const paymentKey = slug.at(-1);

    if (slug[1] === "invoices" && slug[2]) {
      const invoiceId = decodeURIComponent(slug[2]);
      const invoice = invoiceRows.find((item) => item.id === invoiceId || item.invoiceNo === invoiceId);
      const transaction = branchSnapshot.scopedTransactions.find((item) => item.id === invoice?.invoiceNo);

      if (!invoice) {
        return (
          <SectionPanel title="Invoice Tidak Ditemukan" subtitle="Invoice tidak ada di queue cabang aktif.">
            <button
              type="button"
              onClick={() => router.push("/payments/invoices")}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-200 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300"
            >
              Kembali ke Invoice
            </button>
          </SectionPanel>
        );
      }

      return (
        <div className="space-y-6">
          <button
            type="button"
            onClick={() => router.push("/payments/invoices")}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-200 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300"
          >
            Kembali
          </button>
          <SectionPanel title={invoice.invoiceNo} subtitle="Detail invoice, status pengiriman, dan transaksi terkait.">
            <div className="grid gap-4 md:grid-cols-4">
              <StatCard label="Penerima" value={invoice.recipient} helper={invoice.channel} icon={<MemberIcon className="h-5 w-5" />} tone="emerald" />
              <StatCard label="Status" value={invoice.status} helper={invoice.generatedAt} icon={<SendIcon className="h-5 w-5" />} tone={invoice.status === "sent" ? "emerald" : invoice.status === "failed" ? "rose" : "amber"} />
              <StatCard label="Nominal" value={transaction ? formatCurrency(transaction.amount) : "-"} helper={transaction?.paymentMethod ?? "Belum terkait"} icon={<CreditCardIcon className="h-5 w-5" />} tone="sky" />
              <StatCard label="Tipe" value={transaction?.type ?? "-"} helper="Revenue stream" icon={<CashRegisterIcon className="h-5 w-5" />} tone="slate" />
            </div>
            <div className="mt-6">
              <DataTable
                data={[
                  { label: "Invoice", value: invoice.invoiceNo },
                  { label: "Queue ID", value: invoice.id },
                  { label: "Generated", value: invoice.generatedAt },
                  { label: "Deskripsi", value: transaction?.description ?? "-" },
                  { label: "Kasir", value: transaction?.cashierName ?? "-" },
                ]}
                getKey={(row) => row.label}
                columns={[
                  { header: "Field", cell: (row) => row.label },
                  { header: "Nilai", cell: (row) => <span className="font-medium text-gray-900 dark:text-white">{row.value}</span> },
                ]}
              />
            </div>
          </SectionPanel>
        </div>
      );
    }

    if (slug[1] === "transactions" && slug[2]) {
      const transactionId = decodeURIComponent(slug[2]);
      const transaction = branchSnapshot.scopedTransactions.find((item) => item.id === transactionId);
      const invoice = invoiceRows.find((item) => item.invoiceNo === transactionId);

      if (!transaction) {
        return (
          <SectionPanel title="Transaksi Tidak Ditemukan" subtitle="Transaksi tidak ada di cabang aktif.">
            <button
              type="button"
              onClick={() => router.push("/payments/transactions")}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-200 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300"
            >
              Kembali ke Transaksi
            </button>
          </SectionPanel>
        );
      }

      return (
        <div className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => router.push("/payments/transactions")}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-200 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300"
            >
              Kembali
            </button>
            <button
              type="button"
              disabled={transaction.status !== "completed"}
              onClick={() =>
                requestDelete({
                  title: "Void Transaksi",
                  message: "Transaksi akan dibatalkan dan invoice ditandai gagal.",
                  target: transaction.id,
                  confirmLabel: "Void",
                  onConfirm: () => voidTransaction(transaction.id),
                })
              }
              className="inline-flex h-10 items-center justify-center rounded-lg bg-rose-600 px-4 text-sm font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Void Transaksi
            </button>
          </div>
          <SectionPanel title={transaction.id} subtitle="Detail transaksi pembayaran.">
            <div className="grid gap-4 md:grid-cols-4">
              <StatCard label="Member" value={transaction.memberName} helper={transaction.type} icon={<MemberIcon className="h-5 w-5" />} tone="emerald" />
              <StatCard label="Nominal" value={formatCurrency(transaction.amount)} helper={transaction.paymentMethod} icon={<CreditCardIcon className="h-5 w-5" />} tone="sky" />
              <StatCard label="Status" value={transaction.status} helper={transaction.date} icon={<CheckSmallIcon className="h-5 w-5" />} tone={transaction.status === "completed" ? "emerald" : transaction.status === "pending" ? "amber" : "rose"} />
              <StatCard label="Invoice" value={invoice?.status ?? "-"} helper={invoice?.id ?? "Queue belum ada"} icon={<ReportIcon className="h-5 w-5" />} tone="slate" />
            </div>
            <div className="mt-6">
              <DataTable
                data={[
                  { label: "Kasir", value: transaction.cashierName },
                  { label: "Deskripsi", value: transaction.description },
                  { label: "Metode", value: transaction.paymentMethod },
                  { label: "Tanggal", value: transaction.date },
                ]}
                getKey={(row) => row.label}
                columns={[
                  { header: "Field", cell: (row) => row.label },
                  { header: "Nilai", cell: (row) => <span className="font-medium text-gray-900 dark:text-white">{row.value}</span> },
                ]}
              />
            </div>
          </SectionPanel>
        </div>
      );
    }

    if (paymentKey === "invoices") {
      return (
        <SectionPanel title="Invoice Pembayaran" subtitle="Invoice membership, PT, produk, dan class pass.">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">Invoice bisa dilihat, dikirim ulang, dicetak, dan diunduh.</p>
            <button
              type="button"
              onClick={() => exportRows("seven-gym-invoices.json", invoiceRows)}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-200 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300"
            >
              Export JSON
            </button>
          </div>
          <DataTable
            data={invoiceRows}
            getKey={(invoice) => invoice.id}
            columns={[
              { header: "Invoice", cell: (invoice) => <span className="font-mono text-xs">{invoice.invoiceNo}</span> },
              { header: "Penerima", cell: (invoice) => invoice.recipient },
              { header: "Channel", cell: (invoice) => invoice.channel },
              { header: "Generated", cell: (invoice) => invoice.generatedAt },
              { header: "Status", cell: (invoice) => <StatusPill tone={invoice.status === "sent" ? "emerald" : "amber"}>{invoice.status}</StatusPill> },
              {
                header: "Aksi",
                cell: (invoice) => (
                  <div className="flex gap-2">
                    <TableActionIconButton label="Detail invoice" icon={<EyeIcon />} onClick={() => openInvoiceDetail(invoice)} variant="info" />
                    <TableActionIconButton label="Download invoice" icon={<ReportIcon className="h-4 w-4" />} onClick={() => downloadInvoice(invoice)} />
                    <TableActionIconButton
                      label="Kirim ulang invoice"
                      icon={<SendIcon />}
                      onClick={() => {
                        updateInvoiceStatus(invoice.id, "queued");
                        addAuditLog({
                          branchId: activeBranch.id,
                          actor: currentUser.name,
                          action: "invoice.resend",
                          target: invoice.invoiceNo,
                        });
                      }}
                      variant="success"
                    />
                  </div>
                ),
              },
            ]}
          />
        </SectionPanel>
      );
    }

    return (
      <SectionPanel title="Histori Transaksi" subtitle="Semua transaksi kasir berdasarkan cabang aktif.">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={reportSearch}
              onChange={(event) => setReportSearch(event.target.value)}
              placeholder="Cari invoice/member/deskripsi"
              className="h-10 min-w-0 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-emerald-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 sm:w-72"
            />
            <select
              value={reportStatusFilter}
              onChange={(event) => setReportStatusFilter(event.target.value)}
              className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-emerald-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200"
            >
              <option value="all">Semua Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="void">Void</option>
            </select>
          </div>
          <button
            type="button"
            onClick={() => exportRows("seven-gym-transactions.json", branchSnapshot.scopedTransactions)}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-200 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300"
          >
            Export JSON
          </button>
        </div>
        <DataTable
          data={branchSnapshot.scopedTransactions.filter((transaction) => {
            const normalizedSearch = reportSearch.trim().toLowerCase();
            const matchesSearch =
              !normalizedSearch ||
              [transaction.id, transaction.memberName, transaction.description, transaction.cashierName]
                .join(" ")
                .toLowerCase()
                .includes(normalizedSearch);
            const matchesStatus = reportStatusFilter === "all" || transaction.status === reportStatusFilter;

            return matchesSearch && matchesStatus;
          })}
          getKey={(transaction) => transaction.id}
          columns={[
            { header: "Invoice", cell: (transaction) => <span className="font-mono text-xs">{transaction.id}</span> },
            { header: "Member", cell: (transaction) => <span className="font-medium text-gray-900 dark:text-white">{transaction.memberName}</span> },
            { header: "Tipe", cell: (transaction) => transaction.type },
            { header: "Deskripsi", cell: (transaction) => transaction.description },
            { header: "Metode", cell: (transaction) => transaction.paymentMethod },
            { header: "Nominal", cell: (transaction) => formatCurrency(transaction.amount) },
            { header: "Status", cell: (transaction) => <StatusPill tone={transaction.status === "completed" ? "emerald" : transaction.status === "pending" ? "amber" : "rose"}>{transaction.status}</StatusPill> },
            {
              header: "Aksi",
              cell: (transaction) => (
                <div className="flex gap-2">
                  <TableActionIconButton label="Detail transaksi" icon={<EyeIcon />} onClick={() => openTransactionDetail(transaction)} variant="info" />
                  <TableActionIconButton
                    label="Void transaksi"
                    icon={<XSmallIcon />}
                    disabled={transaction.status !== "completed"}
                    onClick={() =>
                      requestDelete({
                        title: "Void Transaksi",
                        message: "Transaksi akan dibatalkan dan invoice ditandai gagal.",
                        target: transaction.id,
                        confirmLabel: "Void",
                        onConfirm: () => {
                          voidTransaction(transaction.id);
                          addAuditLog({
                            branchId: activeBranch.id,
                            actor: currentUser.name,
                            action: "pos.void",
                            target: transaction.id,
                          });
                        },
                      })
                    }
                    variant="delete"
                  />
                </div>
              ),
            },
          ]}
        />
      </SectionPanel>
    );
  };

  const renderInventoryAdmin = () => {
    const inventoryKey = slug.at(-1);

    if (slug[1] === "products" && slug[2]) {
      const productId = decodeURIComponent(slug[2]);
      const product = inventoryRows.find((item) => item.id === productId);
      const movements = stockMovements.filter(
        (movement) => movement.branchId === activeBranch.id && movement.item === product?.name,
      );

      if (!product) {
        return (
          <SectionPanel title="Produk Tidak Ditemukan" subtitle="Produk tidak ada di stok cabang aktif.">
            <button
              type="button"
              onClick={() => router.push("/inventory/products")}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-200 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300"
            >
              Kembali ke Data Produk
            </button>
          </SectionPanel>
        );
      }

      return (
        <div className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => router.push("/inventory/products")}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-200 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300"
            >
              Kembali
            </button>
            <PrimaryToolbarButton onClick={() => openEditProductModal(product)}>
              Edit Produk
            </PrimaryToolbarButton>
          </div>
          <SectionPanel title={product.name} subtitle="Detail produk, harga POS, stok cabang, dan histori mutasi.">
            <div className="grid gap-4 md:grid-cols-4">
              <StatCard label="Harga" value={formatCurrency(product.price)} helper={product.sku} icon={<CreditCardIcon className="h-5 w-5" />} tone="emerald" />
              <StatCard label="Stok" value={String(product.stock)} helper={`Minimum ${product.minStock}`} icon={<PackageIcon className="h-5 w-5" />} tone={product.stock <= product.minStock ? "amber" : "sky"} />
              <StatCard label="Kategori" value={product.category} helper="Kategori produk" icon={<InventoryIcon className="h-5 w-5" />} tone="slate" />
              <StatCard label="Status" value={product.stock <= product.minStock ? "Reorder" : "Aman"} helper="Status persediaan" icon={<CheckSmallIcon className="h-5 w-5" />} tone={product.stock <= product.minStock ? "amber" : "emerald"} />
            </div>
          </SectionPanel>
          <SectionPanel title="Histori Mutasi" subtitle="Barang masuk/keluar untuk produk ini.">
            <DataTable
              data={movements}
              getKey={(movement) => movement.id}
              columns={[
                { header: "Kode", cell: (movement) => <span className="font-mono text-xs">{movement.id}</span> },
                { header: "Tipe", cell: (movement) => movement.type },
                { header: "Qty", cell: (movement) => movement.qty },
                { header: "Sumber", cell: (movement) => movement.source },
                { header: "Tanggal", cell: (movement) => movement.date },
                { header: "Status", cell: (movement) => <StatusPill tone={movement.status === "posted" ? "emerald" : "amber"}>{movement.status}</StatusPill> },
              ]}
            />
          </SectionPanel>
        </div>
      );
    }

    if (slug[1] === "suppliers" && slug[2]) {
      const supplierId = decodeURIComponent(slug[2]);
      const supplier = supplierRows.find((item) => item.id === supplierId);

      if (!supplier) {
        return (
          <SectionPanel title="Supplier Tidak Ditemukan" subtitle="Supplier tidak ada di data prototype.">
            <button
              type="button"
              onClick={() => router.push("/inventory/suppliers")}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-200 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300"
            >
              Kembali ke Supplier
            </button>
          </SectionPanel>
        );
      }

      return (
        <div className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => router.push("/inventory/suppliers")}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-200 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300"
            >
              Kembali
            </button>
            <PrimaryToolbarButton onClick={() => openEditSupplierModal(supplier)} disabled={!canCreateProduct}>
              Edit Supplier
            </PrimaryToolbarButton>
          </div>
          <SectionPanel title={supplier.name} subtitle="Detail supplier, kategori, SLA, dan histori restock terkait.">
            <div className="grid gap-4 md:grid-cols-3">
              <StatCard label="Kategori" value={supplier.category} helper="Jenis supply" icon={<PackageIcon className="h-5 w-5" />} tone="emerald" />
              <StatCard label="SLA" value={supplier.sla} helper="Estimasi pemenuhan" icon={<ClockIcon className="h-5 w-5" />} tone="sky" />
              <StatCard label="Status" value={supplier.status} helper="Status kerja sama" icon={<CheckSmallIcon className="h-5 w-5" />} tone={supplier.status === "aktif" ? "emerald" : "amber"} />
            </div>
          </SectionPanel>
          <SectionPanel title="Restock Terkait" subtitle="Mutasi barang masuk yang memakai supplier ini.">
            <DataTable
              data={stockMovements.filter((movement) => movement.source === supplier.name || movement.source.includes(supplier.name.split(" ")[0]))}
              getKey={(movement) => movement.id}
              columns={[
                { header: "Kode", cell: (movement) => <span className="font-mono text-xs">{movement.id}</span> },
                { header: "Produk", cell: (movement) => movement.item },
                { header: "Qty", cell: (movement) => movement.qty },
                { header: "Tanggal", cell: (movement) => movement.date },
              ]}
            />
          </SectionPanel>
        </div>
      );
    }

    if (slug[1] === "maintenance" && slug[2]) {
      const equipmentId = decodeURIComponent(slug[2]);
      const equipment = equipmentRows.find((item) => item.id === equipmentId);

      if (!equipment) {
        return (
          <SectionPanel title="Alat Tidak Ditemukan" subtitle="Data maintenance alat tidak ada di cabang aktif.">
            <button
              type="button"
              onClick={() => router.push("/inventory/maintenance")}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-200 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300"
            >
              Kembali ke Maintenance
            </button>
          </SectionPanel>
        );
      }

      return (
        <div className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => router.push("/inventory/maintenance")}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-200 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300"
            >
              Kembali
            </button>
            <PrimaryToolbarButton onClick={() => openEditEquipmentModal(equipment)} disabled={!canEditProduct}>
              Edit Alat
            </PrimaryToolbarButton>
          </div>
          <SectionPanel title={equipment.equipmentName} subtitle="Detail alat, lokasi, status service, dan jadwal pengecekan.">
            <div className="grid gap-4 md:grid-cols-4">
              <StatCard label="Lokasi" value={equipment.location} helper="Area alat" icon={<DumbbellIcon className="h-5 w-5" />} tone="emerald" />
              <StatCard label="Status" value={equipment.status} helper="Kondisi alat" icon={<SettingsIcon className="h-5 w-5" />} tone={equipment.status === "ok" ? "emerald" : "amber"} />
              <StatCard label="Next Check" value={equipment.nextCheck} helper="Jadwal inspeksi" icon={<ClockIcon className="h-5 w-5" />} tone="sky" />
              <StatCard label="Cabang" value={branchSettings.find((branch) => branch.id === equipment.branchId)?.code ?? equipment.branchId} helper="Lokasi cabang" icon={<ReportIcon className="h-5 w-5" />} tone="slate" />
            </div>
          </SectionPanel>
          <SectionPanel title="Checklist Service" subtitle="Checklist dummy yang nanti bisa jadi work order teknisi.">
            <DataTable
              data={[
                { step: "Inspeksi visual", status: "done" },
                { step: "Test beban/fungsi", status: equipment.status === "ok" ? "done" : "review" },
                { step: "Catat spare part", status: equipment.status === "needs-part" ? "open" : "done" },
                { step: "Jadwalkan pengecekan berikutnya", status: "scheduled" },
              ]}
              getKey={(row) => row.step}
              columns={[
                { header: "Checklist", cell: (row) => row.step },
                { header: "Status", cell: (row) => <StatusPill tone={row.status === "done" ? "emerald" : row.status === "open" ? "rose" : "amber"}>{row.status}</StatusPill> },
              ]}
            />
          </SectionPanel>
        </div>
      );
    }

    if (inventoryKey === "inbound" || inventoryKey === "outbound") {
      const type = inventoryKey === "inbound" ? "Masuk" : "Keluar";

      return (
        <SectionPanel title={`Histori Barang ${type}`} subtitle="Riwayat mutasi stok.">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">Form mutasi stok dibuka sebagai popup responsif.</p>
            <PrimaryToolbarButton
              onClick={() => setActionModal(type === "Masuk" ? "stock-masuk" : "stock-keluar")}
              disabled={!canEditProduct}
            >
              Input Barang {type}
            </PrimaryToolbarButton>
          </div>
          <DataTable
            data={stockMovements.filter((movement) => movement.type === type && movement.branchId === activeBranch.id)}
            getKey={(movement) => movement.id}
            columns={[
              { header: "Kode", cell: (movement) => <span className="font-mono text-xs">{movement.id}</span> },
              { header: "Produk", cell: (movement) => <span className="font-medium text-gray-900 dark:text-white">{movement.item}</span> },
              { header: "Qty", cell: (movement) => movement.qty },
              { header: "Sumber", cell: (movement) => movement.source },
              { header: "Tanggal", cell: (movement) => movement.date },
              { header: "Status", cell: (movement) => <StatusPill tone={movement.status === "posted" ? "emerald" : "amber"}>{movement.status}</StatusPill> },
            ]}
          />
        </SectionPanel>
      );
    }

    if (inventoryKey === "suppliers") {
      return (
        <SectionPanel title="Supplier" subtitle="Data supplier produk, restock, dan service alat.">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">{crudMessage ?? "Kelola supplier lewat popup CRUD."}</p>
            <PrimaryToolbarButton onClick={openCreateSupplierModal}>Tambah Supplier</PrimaryToolbarButton>
          </div>
          <DataTable
            data={supplierRows}
            getKey={(supplier) => supplier.id}
            columns={[
              { header: "Kode", cell: (supplier) => <span className="font-mono text-xs">{supplier.id}</span> },
              { header: "Supplier", cell: (supplier) => <span className="font-medium text-gray-900 dark:text-white">{supplier.name}</span> },
              { header: "Kategori", cell: (supplier) => supplier.category },
              { header: "SLA", cell: (supplier) => supplier.sla },
              { header: "Status", cell: (supplier) => <StatusPill tone={supplier.status === "aktif" ? "emerald" : "sky"}>{supplier.status}</StatusPill> },
              {
                header: "Aksi",
                cell: (supplier) => (
                  <div className="flex gap-2">
                    <TableActionIconButton
                      label="Detail supplier"
                      icon={<EyeIcon />}
                      onClick={() => router.push(`/inventory/suppliers/${encodeURIComponent(supplier.id)}`)}
                      variant="info"
                    />
                    <TableActionIconButton
                      label="Edit supplier"
                      icon={<PencilIcon />}
                      onClick={() => openEditSupplierModal(supplier)}
                      disabled={!canCreateProduct}
                      variant="edit"
                    />
                    <TableActionIconButton
                      label="Hapus supplier"
                      icon={<TrashIcon />}
                      onClick={() =>
                        requestDelete({
                          title: "Hapus Supplier",
                          message: "Supplier akan dihapus dari data prototype.",
                          target: supplier.name,
                          onConfirm: () => {
                            setSupplierRows((currentRows) => currentRows.filter((item) => item.id !== supplier.id));
                            setCrudMessage(`${supplier.name} dihapus.`);
                            addAuditLog({
                              branchId: activeBranch.id,
                              actor: currentUser.name,
                              action: "suppliers.delete",
                              target: supplier.name,
                            });
                          },
                        })
                        }
                        variant="delete"
                        disabled={!canCreateProduct}
                      />
                  </div>
                ),
              },
            ]}
          />
        </SectionPanel>
      );
    }

    if (inventoryKey === "maintenance") {
      return (
        <SectionPanel title="Maintenance Alat" subtitle="Tiket servis, jadwal pengecekan, dan status alat.">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">{crudMessage ?? "Kelola alat dan jadwal service lewat popup."}</p>
            <PrimaryToolbarButton onClick={openCreateEquipmentModal}>Tambah Alat</PrimaryToolbarButton>
          </div>
          <DataTable
            data={equipmentRows.filter((item) => item.branchId === activeBranch.id || activeBranch.id === "branch-pusat")}
            getKey={(item) => item.id}
            columns={[
              { header: "Tiket", cell: (item) => <span className="font-mono text-xs">{item.id}</span> },
              { header: "Alat", cell: (item) => <span className="font-medium text-gray-900 dark:text-white">{item.equipmentName}</span> },
              { header: "Lokasi", cell: (item) => item.location },
              { header: "Next Check", cell: (item) => item.nextCheck },
              { header: "Status", cell: (item) => <StatusPill tone={item.status === "ok" ? "emerald" : "amber"}>{item.status}</StatusPill> },
              {
                header: "Aksi",
                cell: (item) => (
                  <div className="flex gap-2">
                    <TableActionIconButton
                      label="Detail alat"
                      icon={<EyeIcon />}
                      onClick={() => router.push(`/inventory/maintenance/${encodeURIComponent(item.id)}`)}
                      variant="info"
                    />
                    <TableActionIconButton
                      label="Edit alat"
                      icon={<PencilIcon />}
                      onClick={() => openEditEquipmentModal(item)}
                      disabled={!canEditProduct}
                      variant="edit"
                    />
                    <TableActionIconButton
                      label="Hapus alat"
                      icon={<TrashIcon />}
                      onClick={() =>
                        requestDelete({
                          title: "Hapus Alat",
                          message: "Data maintenance alat akan dihapus dari prototype.",
                          target: item.equipmentName,
                          onConfirm: () => {
                            setEquipmentRows((currentRows) => currentRows.filter((equipment) => equipment.id !== item.id));
                            setCrudMessage(`${item.equipmentName} dihapus.`);
                            addAuditLog({
                              branchId: activeBranch.id,
                              actor: currentUser.name,
                              action: "equipment.delete",
                              target: item.equipmentName,
                            });
                          },
                        })
                        }
                        variant="delete"
                        disabled={!canEditProduct}
                      />
                  </div>
                ),
              },
            ]}
          />
        </SectionPanel>
      );
    }

    return (
      <SectionPanel title={inventoryKey === "stock" ? "Stok Produk" : "Data Produk"} subtitle="Data produk, harga, stok, dan status reorder.">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">{crudMessage ?? "Tambah/edit produk memakai popup; stok tetap bisa dimutasi dari Barang Masuk/Keluar."}</p>
          <PrimaryToolbarButton onClick={openCreateProductModal} disabled={!canCreateProduct}>Tambah Produk</PrimaryToolbarButton>
        </div>
        <DataTable
          data={inventoryRows}
          getKey={(item) => item.id}
          columns={[
            {
              header: "Produk",
              cell: (item) => (
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                  <p className="font-mono text-xs text-gray-500">{item.sku}</p>
                </div>
              ),
            },
            { header: "Kategori", cell: (item) => item.category },
            { header: "Harga", cell: (item) => formatCurrency(item.price) },
            { header: "Stok", cell: (item) => item.stock },
            { header: "Min", cell: (item) => item.minStock },
            { header: "Status", cell: (item) => <StatusPill tone={item.stock <= item.minStock ? "amber" : "emerald"}>{item.stock <= item.minStock ? "reorder" : "aman"}</StatusPill> },
            {
              header: "Aksi",
              cell: (item) => (
                <div className="flex gap-2">
                  <TableActionIconButton
                    label="Detail produk"
                    icon={<EyeIcon />}
                    onClick={() => openProductDetail(item)}
                    variant="info"
                  />
                  <TableActionIconButton
                    label="Edit produk"
                    icon={<PencilIcon />}
                    onClick={() => openEditProductModal(item)}
                    disabled={!canEditProduct}
                    variant="edit"
                  />
                  <TableActionIconButton
                    label="Hapus produk"
                    icon={<TrashIcon />}
                    onClick={() =>
                      requestDelete({
                        title: "Hapus Produk",
                        message: "Produk akan dihapus dari stok cabang aktif.",
                        target: item.name,
                        onConfirm: () => {
                          deleteInventoryItem(item.id);
                          setCrudMessage(`${item.name} dihapus.`);
                          addAuditLog({
                            branchId: activeBranch.id,
                            actor: currentUser.name,
                            action: "products.delete",
                            target: item.name,
                          });
                        },
                      })
                    }
                    disabled={!canEditProduct}
                    variant="delete"
                  />
                </div>
              ),
            },
          ]}
        />
      </SectionPanel>
    );
  };

  const renderNotificationAdmin = () => {
    const notificationKey = slug.at(-1);
    const selected = messageTemplateSettings.find((template) =>
      notificationKey === "membership"
        ? template.id === "REM-MEM"
        : notificationKey === "workout"
        ? template.id === "REM-WORK"
        : notificationKey === "classes"
        ? template.id === "REM-CLASS"
        : notificationKey === "broadcast"
        ? template.id === "BRD-PROMO"
        : notificationKey === "birthday"
        ? template.id === "BDAY"
        : false,
    );

    if (slug[1] === "queue" && slug[2]) {
      const queueId = decodeURIComponent(slug[2]);
      const message = whatsappMessages.find((item) => item.id === queueId);
      const template = messageTemplateSettings.find((item) => item.trigger === message?.template || item.id === message?.template);

      if (!message) {
        return (
          <SectionPanel title="Queue Tidak Ditemukan" subtitle="Pesan tidak ada di WhatsApp queue.">
            <button
              type="button"
              onClick={() => router.push("/notifications/broadcast")}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-200 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300"
            >
              Kembali ke Queue
            </button>
          </SectionPanel>
        );
      }

      return (
        <div className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => router.push("/notifications/broadcast")}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-200 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300"
            >
              Kembali
            </button>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => updateWhatsappStatus(message.id, "sent")}
                disabled={!canManageNotifications}
                className="inline-flex h-10 items-center justify-center rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Tandai Terkirim
              </button>
              <button
                type="button"
                onClick={() => updateWhatsappStatus(message.id, "retrying")}
                disabled={!canManageNotifications}
                className="inline-flex h-10 items-center justify-center rounded-lg bg-amber-500 px-4 text-sm font-semibold text-white hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Retry
              </button>
            </div>
          </div>
          <SectionPanel title={message.id} subtitle="Detail WhatsApp queue, template, recipient, dan status delivery.">
            <div className="grid gap-4 md:grid-cols-4">
              <StatCard label="Template" value={message.template} helper={template?.name ?? "Template trigger"} icon={<WhatsAppIcon className="h-5 w-5" />} tone="emerald" />
              <StatCard label="Penerima" value={message.recipient} helper="Target pesan" icon={<MemberIcon className="h-5 w-5" />} tone="sky" />
              <StatCard label="Jadwal" value={message.scheduledAt} helper="Scheduled send" icon={<ClockIcon className="h-5 w-5" />} tone="amber" />
              <StatCard label="Status" value={message.status} helper="Delivery state" icon={<SendIcon className="h-5 w-5" />} tone={message.status === "sent" ? "emerald" : message.status === "failed" ? "rose" : "amber"} />
            </div>
          </SectionPanel>
        </div>
      );
    }

    if (notificationKey === "broadcast") {
      return (
        <SectionPanel title="Queue Broadcast" subtitle="Antrian pesan promo.">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {notificationMessage ? (
              <p className="text-sm text-emerald-600 dark:text-emerald-400">{notificationMessage}</p>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">Form broadcast dibuka sebagai popup responsif.</p>
            )}
            <PrimaryToolbarButton onClick={() => setActionModal("broadcast")}>
              Jadwalkan Broadcast
            </PrimaryToolbarButton>
          </div>
          <DataTable
            data={whatsappMessages}
            getKey={(item) => item.id}
            columns={[
              { header: "Queue", cell: (item) => <span className="font-mono text-xs">{item.id}</span> },
              { header: "Template", cell: (item) => item.template },
              { header: "Penerima", cell: (item) => item.recipient },
              { header: "Jadwal", cell: (item) => item.scheduledAt },
              { header: "Status", cell: (item) => <StatusPill tone={item.status === "sent" ? "emerald" : item.status === "retrying" ? "amber" : item.status === "failed" ? "rose" : "sky"}>{item.status}</StatusPill> },
              {
                header: "Aksi",
                cell: (item) => (
                  <div className="flex gap-2">
                    <TableActionIconButton
                      label="Detail queue"
                      icon={<EyeIcon />}
                      onClick={() => router.push(`/notifications/queue/${encodeURIComponent(item.id)}`)}
                      variant="info"
                    />
                    <TableActionIconButton
                      label="Tandai terkirim"
                      icon={<SendIcon />}
                      disabled={!canManageNotifications}
                      onClick={() => {
                        updateWhatsappStatus(item.id, "sent");
                        addAuditLog({
                          branchId: activeBranch.id,
                          actor: currentUser.name,
                          action: "notifications.whatsapp.sent",
                          target: item.id,
                        });
                      }}
                      variant="success"
                    />
                    <TableActionIconButton
                      label="Retry pesan"
                      icon={<RefreshIcon />}
                      disabled={!canManageNotifications}
                      onClick={() => {
                        updateWhatsappStatus(item.id, "retrying");
                        addAuditLog({
                          branchId: activeBranch.id,
                          actor: currentUser.name,
                          action: "notifications.whatsapp.retry",
                          target: item.id,
                        });
                      }}
                      variant="warning"
                    />
                  </div>
                ),
              },
            ]}
          />
        </SectionPanel>
      );
    }

    return (
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <SectionPanel title={selected?.name ?? "WhatsApp & Notifikasi"} subtitle="Template otomasi, trigger, audience, dan status pengiriman.">
          <DataTable
            data={messageTemplateSettings.filter((template) => selected ? template.id === selected.id : true)}
            getKey={(template) => template.id}
            columns={[
            { header: "Kode", cell: (template) => <span className="font-mono text-xs">{template.id}</span> },
            { header: "Template", cell: (template) => <span className="font-medium text-gray-900 dark:text-white">{template.name}</span> },
            { header: "Trigger", cell: (template) => template.trigger },
            { header: "Audience", cell: (template) => template.audience },
            { header: "Channel", cell: (template) => template.channel },
            { header: "Status", cell: (template) => <StatusPill tone={template.status === "active" ? "emerald" : template.status === "draft" ? "amber" : "slate"}>{template.status}</StatusPill> },
            {
              header: "Aksi",
              cell: (template) => (
                <div className="flex gap-2">
                  <TableActionIconButton
                    label={template.status === "active" ? "Nonaktifkan template" : "Aktifkan template"}
                    icon={<PowerIcon />}
                    onClick={() => toggleMessageTemplateStatus(template.id)}
                    variant={template.status === "active" ? "warning" : "success"}
                  />
                  <TableActionIconButton
                    label="Hapus template"
                    icon={<TrashIcon />}
                    onClick={() =>
                      requestDelete({
                        title: "Hapus Template",
                        message: "Template notifikasi akan dihapus dari prototype.",
                        target: template.name,
                        onConfirm: () => {
                          deleteMessageTemplate(template.id);
                          addAuditLog({
                            branchId: activeBranch.id,
                            actor: currentUser.name,
                            action: "notifications.template.delete",
                            target: template.name,
                          });
                        },
                      })
                    }
                    variant="delete"
                  />
                </div>
              ),
            },
            ]}
          />
        </SectionPanel>
        <SectionPanel title="Preview Pesan" subtitle="Variable yang nanti diganti backend sebelum dikirim.">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              Halo {"{{memberName}}"},
            </p>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
              Reminder dari {"{{branchName}}"}: {selected?.name ?? "jadwal/notifikasi"} aktif untuk {"{{bookingTime}}"}.
              Invoice {"{{invoiceNo}}"} dapat dibayar lewat {"{{paymentLink}}"}.
            </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {["{{memberName}}", "{{branchName}}", "{{invoiceNo}}", "{{bookingTime}}", "{{expiryDate}}", "{{paymentLink}}"].map((token) => (
              <StatusPill key={token} tone="sky">{token}</StatusPill>
            ))}
          </div>
        </SectionPanel>
      </div>
    );
  };

  const renderActionModal = () => {
    const inputClass = "mt-1 h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-emerald-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200";
    const stockType: StockMovement["type"] = actionModal === "stock-keluar" ? "Keluar" : "Masuk";
    const title =
      actionModal === "class-booking"
        ? "Booking Kelas"
        : actionModal === "pt-booking"
        ? "Booking PT"
        : actionModal === "trainer"
        ? editingTrainerId
          ? "Edit Trainer"
          : "Tambah Trainer"
        : actionModal === "gym-class"
        ? editingGymClassId
          ? "Edit Kelas"
          : "Tambah Kelas"
        : actionModal === "product"
        ? editingProductId
          ? "Edit Produk"
          : "Tambah Produk"
        : actionModal === "supplier"
        ? editingSupplierId
          ? "Edit Supplier"
          : "Tambah Supplier"
        : actionModal === "equipment"
        ? editingEquipmentId
          ? "Edit Alat"
          : "Tambah Alat"
        : actionModal === "stock-masuk"
        ? "Barang Masuk"
        : actionModal === "stock-keluar"
        ? "Barang Keluar"
        : actionModal === "reward-redemption"
        ? "Tukar Reward"
        : actionModal === "reward"
        ? editingRewardId
          ? "Edit Reward"
          : "Tambah Reward"
        : actionModal === "challenge"
        ? editingChallengeId
          ? "Edit Challenge"
          : "Tambah Challenge"
        : actionModal === "staff-user"
        ? editingStaffUserId
          ? "Edit User"
          : "Tambah User"
        : actionModal === "role"
        ? editingRoleId
          ? "Edit Role"
          : "Tambah Role"
        : actionModal === "close-shift"
        ? "Close Shift Kasir"
        : actionModal === "broadcast"
        ? "Broadcast Promo"
        : "";

    const footer = (submitLabel: string, disabled = false) => (
      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={() => setActionModal(null)}
          className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300"
        >
          Batal
        </button>
        <button
          disabled={disabled}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitLabel}
        </button>
      </div>
    );

    return (
      <Modal
        isOpen={Boolean(actionModal)}
        onClose={() => setActionModal(null)}
        className="max-w-[720px] overflow-hidden p-0"
      >
        <div className="border-b border-gray-200 px-5 pb-5 pr-16 pt-6 dark:border-gray-800 sm:px-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Form aksi dibuat sebagai popup responsif, data tetap dummy dan tersimpan di prototype.
          </p>
        </div>

        <div className="max-h-[calc(100vh-9rem)] overflow-y-auto px-5 py-5 sm:px-6">
          {actionModal === "class-booking" && (
            <form onSubmit={submitClassBooking} className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Kelas</span>
              <select
                value={classBookingForm.classId}
                onChange={(event) => updateClassBookingForm("classId", event.target.value)}
                className={inputClass}
              >
                {branchSnapshot.scopedClasses.map((gymClass) => (
                  <option key={gymClass.id} value={gymClass.id}>
                    {gymClass.name} - {gymClass.currentParticipants}/{gymClass.maxParticipants}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Member</span>
              <select
                value={classBookingForm.memberId}
                onChange={(event) => updateClassBookingForm("memberId", event.target.value)}
                className={inputClass}
              >
                {branchSnapshot.scopedMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} - {member.membershipStatus}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tanggal</span>
              <input
                type="date"
                value={classBookingForm.date}
                onChange={(event) => updateClassBookingForm("date", event.target.value)}
                className={inputClass}
              />
            </label>
              {footer("Booking Kelas")}
            </form>
          )}

          {actionModal === "pt-booking" && (
            <form onSubmit={submitPtBooking} className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Trainer</span>
              <select
                value={ptBookingForm.trainerId}
                onChange={(event) => updatePtBookingForm("trainerId", event.target.value)}
                className={inputClass}
              >
                {trainerRows.map((trainer) => (
                  <option key={trainer.id} value={trainer.id}>
                    {trainer.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Member</span>
              <select
                value={ptBookingForm.memberId}
                onChange={(event) => updatePtBookingForm("memberId", event.target.value)}
                className={inputClass}
              >
                {branchSnapshot.scopedMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} - {member.membershipType}
                  </option>
                ))}
              </select>
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tanggal</span>
                <input
                  type="date"
                  value={ptBookingForm.date}
                  onChange={(event) => updatePtBookingForm("date", event.target.value)}
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Jam</span>
                <input
                  type="time"
                  value={ptBookingForm.time}
                  onChange={(event) => updatePtBookingForm("time", event.target.value)}
                  className={inputClass}
                />
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Durasi</span>
                <select
                  value={ptBookingForm.duration}
                  onChange={(event) => updatePtBookingForm("duration", event.target.value)}
                  className={inputClass}
                >
                  {["45", "60", "90"].map((duration) => (
                    <option key={duration} value={duration}>
                      {duration} menit
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Fokus</span>
                <input
                  value={ptBookingForm.focus}
                  onChange={(event) => updatePtBookingForm("focus", event.target.value)}
                  className={inputClass}
                />
              </label>
            </div>
              {footer("Booking PT")}
            </form>
          )}

          {actionModal === "trainer" && (
            <form onSubmit={submitTrainerForm} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Nama Trainer</span>
                  <input
                    value={trainerForm.name}
                    onChange={(event) => updateTrainerForm("name", event.target.value)}
                    className={inputClass}
                    placeholder="Nama trainer"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</span>
                  <select
                    value={trainerForm.status}
                    onChange={(event) => updateTrainerForm("status", event.target.value as TrainerFormState["status"])}
                    className={inputClass}
                  >
                    <option value="active">active</option>
                    <option value="on-leave">on-leave</option>
                  </select>
                </label>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</span>
                  <input
                    type="email"
                    value={trainerForm.email}
                    onChange={(event) => updateTrainerForm("email", event.target.value)}
                    className={inputClass}
                    placeholder="trainer@sevengym.id"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Telepon</span>
                  <input
                    value={trainerForm.phone}
                    onChange={(event) => updateTrainerForm("phone", event.target.value)}
                    className={inputClass}
                    placeholder="+62 ..."
                  />
                </label>
              </div>
              <label className="block">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Spesialisasi</span>
                <input
                  value={trainerForm.specializations}
                  onChange={(event) => updateTrainerForm("specializations", event.target.value)}
                  className={inputClass}
                  placeholder="Strength Training, Mobility"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Rate per Jam</span>
                <input
                  type="number"
                  min="0"
                  value={trainerForm.hourlyRate}
                  onChange={(event) => updateTrainerForm("hourlyRate", event.target.value)}
                  className={inputClass}
                />
              </label>
              {footer(editingTrainerId ? "Simpan Perubahan" : "Simpan Trainer")}
            </form>
          )}

          {actionModal === "gym-class" && (
            <form onSubmit={submitGymClassForm} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Nama Kelas</span>
                  <input value={gymClassForm.name} onChange={(event) => updateGymClassForm("name", event.target.value)} className={inputClass} />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Trainer</span>
                  <select value={gymClassForm.trainerId} onChange={(event) => updateGymClassForm("trainerId", event.target.value)} className={inputClass}>
                    {trainerRows.map((trainer) => (
                      <option key={trainer.id} value={trainer.id}>{trainer.name}</option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="block">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Deskripsi</span>
                <input value={gymClassForm.description} onChange={(event) => updateGymClassForm("description", event.target.value)} className={inputClass} />
              </label>
              <div className="grid gap-4 sm:grid-cols-3">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Kategori</span>
                  <input value={gymClassForm.category} onChange={(event) => updateGymClassForm("category", event.target.value)} className={inputClass} />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Hari</span>
                  <select value={gymClassForm.scheduleDay} onChange={(event) => updateGymClassForm("scheduleDay", event.target.value)} className={inputClass}>
                    {["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"].map((day) => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Jam</span>
                  <input type="time" value={gymClassForm.scheduleTime} onChange={(event) => updateGymClassForm("scheduleTime", event.target.value)} className={inputClass} />
                </label>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Durasi</span>
                  <input type="number" min="15" value={gymClassForm.duration} onChange={(event) => updateGymClassForm("duration", event.target.value)} className={inputClass} />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Kapasitas</span>
                  <input type="number" min="1" value={gymClassForm.maxParticipants} onChange={(event) => updateGymClassForm("maxParticipants", event.target.value)} className={inputClass} />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</span>
                  <select value={gymClassForm.status} onChange={(event) => updateGymClassForm("status", event.target.value)} className={inputClass}>
                    <option value="active">active</option>
                    <option value="full">full</option>
                  </select>
                </label>
              </div>
              {footer(editingGymClassId ? "Simpan Perubahan" : "Simpan Kelas")}
            </form>
          )}

          {actionModal === "product" && (
            <form onSubmit={submitProductForm} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Nama Produk</span>
                  <input value={productForm.name} onChange={(event) => updateProductForm("name", event.target.value)} className={inputClass} />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">SKU</span>
                  <input value={productForm.sku} onChange={(event) => updateProductForm("sku", event.target.value)} className={inputClass} />
                </label>
              </div>
              <div className="grid gap-4 sm:grid-cols-4">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Kategori</span>
                  <input value={productForm.category} onChange={(event) => updateProductForm("category", event.target.value)} className={inputClass} />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Harga</span>
                  <input type="number" min="0" value={productForm.price} onChange={(event) => updateProductForm("price", event.target.value)} className={inputClass} />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Stok</span>
                  <input type="number" min="0" value={productForm.stock} onChange={(event) => updateProductForm("stock", event.target.value)} className={inputClass} />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Min</span>
                  <input type="number" min="0" value={productForm.minStock} onChange={(event) => updateProductForm("minStock", event.target.value)} className={inputClass} />
                </label>
              </div>
              {footer(editingProductId ? "Simpan Perubahan" : "Simpan Produk")}
            </form>
          )}

          {actionModal === "supplier" && (
            <form onSubmit={submitSupplierForm} className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Nama Supplier</span>
                <input value={supplierForm.name} onChange={(event) => updateSupplierForm("name", event.target.value)} className={inputClass} />
              </label>
              <div className="grid gap-4 sm:grid-cols-3">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Kategori</span>
                  <input value={supplierForm.category} onChange={(event) => updateSupplierForm("category", event.target.value)} className={inputClass} />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">SLA</span>
                  <input value={supplierForm.sla} onChange={(event) => updateSupplierForm("sla", event.target.value)} className={inputClass} />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</span>
                  <select value={supplierForm.status} onChange={(event) => updateSupplierForm("status", event.target.value)} className={inputClass}>
                    <option value="aktif">aktif</option>
                    <option value="maintenance">maintenance</option>
                    <option value="nonaktif">nonaktif</option>
                  </select>
                </label>
              </div>
              {footer(editingSupplierId ? "Simpan Perubahan" : "Simpan Supplier")}
            </form>
          )}

          {actionModal === "equipment" && (
            <form onSubmit={submitEquipmentForm} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Nama Alat</span>
                  <input value={equipmentForm.equipmentName} onChange={(event) => updateEquipmentForm("equipmentName", event.target.value)} className={inputClass} />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Lokasi</span>
                  <input value={equipmentForm.location} onChange={(event) => updateEquipmentForm("location", event.target.value)} className={inputClass} />
                </label>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Next Check</span>
                  <input type="date" value={equipmentForm.nextCheck} onChange={(event) => updateEquipmentForm("nextCheck", event.target.value)} className={inputClass} />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</span>
                  <select value={equipmentForm.status} onChange={(event) => updateEquipmentForm("status", event.target.value)} className={inputClass}>
                    <option value="ok">ok</option>
                    <option value="maintenance">maintenance</option>
                    <option value="needs-part">needs-part</option>
                  </select>
                </label>
              </div>
              {footer(editingEquipmentId ? "Simpan Perubahan" : "Simpan Alat")}
            </form>
          )}

          {actionModal === "reward" && (
            <form onSubmit={submitRewardForm} className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Nama Reward</span>
                <input value={rewardForm.name} onChange={(event) => updateRewardForm("name", event.target.value)} className={inputClass} />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Point</span>
                  <input type="number" min="1" value={rewardForm.points} onChange={(event) => updateRewardForm("points", event.target.value)} className={inputClass} />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Stok</span>
                  <input type="number" min="0" value={rewardForm.stock} onChange={(event) => updateRewardForm("stock", event.target.value)} className={inputClass} />
                </label>
              </div>
              {footer(editingRewardId ? "Simpan Perubahan" : "Simpan Reward")}
            </form>
          )}

          {actionModal === "challenge" && (
            <form onSubmit={submitChallengeForm} className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Nama Challenge</span>
                <input value={challengeForm.name} onChange={(event) => updateChallengeForm("name", event.target.value)} className={inputClass} />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Deskripsi</span>
                <input value={challengeForm.description} onChange={(event) => updateChallengeForm("description", event.target.value)} className={inputClass} />
              </label>
              <div className="grid gap-4 sm:grid-cols-3">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Target</span>
                  <input type="number" min="1" value={challengeForm.target} onChange={(event) => updateChallengeForm("target", event.target.value)} className={inputClass} />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Reward Point</span>
                  <input type="number" min="1" value={challengeForm.reward} onChange={(event) => updateChallengeForm("reward", event.target.value)} className={inputClass} />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Berakhir</span>
                  <input type="date" value={challengeForm.endDate} onChange={(event) => updateChallengeForm("endDate", event.target.value)} className={inputClass} />
                </label>
              </div>
              {footer(editingChallengeId ? "Simpan Perubahan" : "Simpan Challenge")}
            </form>
          )}

          {actionModal === "staff-user" && (
            <form onSubmit={submitStaffUserForm} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Nama</span>
                  <input value={staffUserForm.name} onChange={(event) => updateStaffUserForm("name", event.target.value)} className={inputClass} />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</span>
                  <input type="email" value={staffUserForm.email} onChange={(event) => updateStaffUserForm("email", event.target.value)} className={inputClass} />
                </label>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Role</span>
                  <select value={staffUserForm.role} onChange={(event) => updateStaffUserForm("role", event.target.value)} className={inputClass}>
                    {Object.entries(roleLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Cabang</span>
                  <select value={staffUserForm.branchAccess} onChange={(event) => updateStaffUserForm("branchAccess", event.target.value)} className={inputClass}>
                    {branchSettings.map((branch) => (
                      <option key={branch.id} value={branch.id}>{branch.name}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</span>
                  <select value={staffUserForm.status} onChange={(event) => updateStaffUserForm("status", event.target.value)} className={inputClass}>
                    <option value="active">active</option>
                    <option value="inactive">inactive</option>
                  </select>
                </label>
              </div>
              {footer(editingStaffUserId ? "Simpan Perubahan" : "Simpan User")}
            </form>
          )}

          {actionModal === "role" && (
            <form onSubmit={submitRoleForm} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Kode Role</span>
                  <select value={roleForm.id} onChange={(event) => updateRoleForm("id", event.target.value)} className={inputClass}>
                    {accessRoleKeys.map((roleKey) => (
                      <option key={roleKey} value={roleKey}>{roleKey}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Nama Role</span>
                  <input value={roleForm.name} onChange={(event) => updateRoleForm("name", event.target.value)} className={inputClass} />
                </label>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Jumlah User</span>
                  <input type="number" min="0" value={roleForm.users} onChange={(event) => updateRoleForm("users", event.target.value)} className={inputClass} />
                </label>
                <label className="block sm:col-span-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Scope</span>
                  <input value={roleForm.scope} onChange={(event) => updateRoleForm("scope", event.target.value)} className={inputClass} />
                </label>
              </div>
              <label className="block">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tone</span>
                <select value={roleForm.color} onChange={(event) => updateRoleForm("color", event.target.value)} className={inputClass}>
                  {["emerald", "sky", "amber", "rose", "slate"].map((tone) => (
                    <option key={tone} value={tone}>{tone}</option>
                  ))}
                </select>
              </label>
              {footer(editingRoleId ? "Simpan Perubahan" : "Simpan Role")}
            </form>
          )}

          {actionModal === "close-shift" && (
            <form onSubmit={submitCloseShift} className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Shift</span>
                <input value={closeShiftForm.shiftId} readOnly className={`${inputClass} bg-gray-50 dark:bg-gray-800`} />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Cash Counted</span>
                <input
                  type="number"
                  min="0"
                  value={closeShiftForm.countedCash}
                  onChange={(event) => setCloseShiftForm((form) => ({ ...form, countedCash: event.target.value }))}
                  className={inputClass}
                />
              </label>
              <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600 dark:bg-gray-800/60 dark:text-gray-300">
                Selisih lebih dari Rp 10.000 otomatis masuk status review.
              </div>
              {footer("Close Shift")}
            </form>
          )}

          {(actionModal === "stock-masuk" || actionModal === "stock-keluar") && (
            <form onSubmit={(event) => submitStockMovement(event, stockType)} className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Produk</span>
              <select
                value={stockForm.productId}
                onChange={(event) => updateStockForm("productId", event.target.value)}
                className={inputClass}
              >
                {inventoryRows.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} - stok {item.stock}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Supplier / Sumber</span>
              <input
                value={stockForm.source}
                onChange={(event) => updateStockForm("source", event.target.value)}
                placeholder={stockType === "Masuk" ? "FitSupply Indonesia" : "POS / Adjustment"}
                className={inputClass}
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Jumlah</span>
                <input
                  type="number"
                  min={1}
                  value={stockForm.qty}
                  onChange={(event) => updateStockForm("qty", event.target.value)}
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tanggal</span>
                <input
                  type="date"
                  value={stockForm.date}
                  onChange={(event) => updateStockForm("date", event.target.value)}
                  className={inputClass}
                />
              </label>
            </div>
            <label className="block">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Catatan</span>
              <input
                value={stockForm.note}
                onChange={(event) => updateStockForm("note", event.target.value)}
                placeholder="Opsional"
                className={inputClass}
              />
            </label>
              {footer(`Simpan Barang ${stockType}`, !canEditProduct)}
            </form>
          )}

          {actionModal === "reward-redemption" && (
            <form onSubmit={submitRewardRedemption} className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Member</span>
              <select
                value={rewardRedemptionForm.memberId}
                onChange={(event) => setRewardRedemptionForm((form) => ({ ...form, memberId: event.target.value }))}
                className={inputClass}
              >
                {branchSnapshot.scopedMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} / {member.points.toLocaleString("id-ID")} pts
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Reward</span>
              <select
                value={rewardRedemptionForm.rewardId}
                onChange={(event) => setRewardRedemptionForm((form) => ({ ...form, rewardId: event.target.value }))}
                className={inputClass}
              >
                {rewardRows.map((reward) => (
                  <option key={reward.id} value={reward.id}>
                    {reward.name} / {reward.points.toLocaleString("id-ID")} pts
                  </option>
                ))}
              </select>
            </label>
              {footer("Tukar Reward")}
            </form>
          )}

          {actionModal === "broadcast" && (
            <form onSubmit={submitBroadcastForm} className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Template</span>
              <select
                value={broadcastForm.template}
                onChange={(event) => setBroadcastForm((form) => ({ ...form, template: event.target.value }))}
                className={inputClass}
              >
                {messageTemplateSettings.map((template) => (
                  <option key={template.id} value={template.trigger}>
                    {template.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Segment / Penerima</span>
              <input
                value={broadcastForm.recipient}
                onChange={(event) => setBroadcastForm((form) => ({ ...form, recipient: event.target.value }))}
                className={inputClass}
                placeholder="VIP active / Semua member"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Jadwal Kirim</span>
              <input
                value={broadcastForm.scheduledAt}
                onChange={(event) => setBroadcastForm((form) => ({ ...form, scheduledAt: event.target.value }))}
                className={inputClass}
                placeholder="2026-05-28 15:00"
              />
            </label>
              {footer("Jadwalkan Broadcast")}
            </form>
          )}
        </div>
      </Modal>
    );
  };

  const renderSettingsModal = () => {
    const inputClass = "mt-1 h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-emerald-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200";
    const modalTitle = settingsModal
      ? `${settingsModal.mode === "edit" ? "Edit" : "Tambah"} ${
          settingsModal.type === "branch"
            ? "Cabang"
            : settingsModal.type === "membership"
            ? "Paket Membership"
            : settingsModal.type === "pt"
            ? "Paket PT"
            : settingsModal.type === "payment"
            ? "Metode Pembayaran"
            : settingsModal.type === "template"
            ? "Template Pesan"
            : "Promo"
        }`
      : "";

    const renderFooter = () => (
      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={() => setSettingsModal(null)}
          className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300"
        >
          Batal
        </button>
        <button className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
          Simpan
        </button>
      </div>
    );

    const renderBranchForm = () => (
      <form onSubmit={submitBranchForm} className="space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Nama Cabang</span>
          <input
            value={branchForm.name}
            onChange={(event) => setBranchForm((form) => ({ ...form, name: event.target.value }))}
            className={inputClass}
            placeholder="Seven Gym Alam Sutera"
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Kode</span>
            <input
              value={branchForm.code}
              onChange={(event) => setBranchForm((form) => ({ ...form, code: event.target.value }))}
              className={inputClass}
              placeholder="ALS"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Kota</span>
            <input
              value={branchForm.city}
              onChange={(event) => setBranchForm((form) => ({ ...form, city: event.target.value }))}
              className={inputClass}
              placeholder="Tangerang"
            />
          </label>
        </div>
        <label className="block">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Alamat</span>
          <input
            value={branchForm.address}
            onChange={(event) => setBranchForm((form) => ({ ...form, address: event.target.value }))}
            className={inputClass}
            placeholder="Alamat cabang"
          />
        </label>
        {renderFooter()}
      </form>
    );

    const renderMembershipForm = () => (
      <form onSubmit={submitMembershipPackageForm} className="space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Nama Paket</span>
          <input
            value={membershipPackageForm.name}
            onChange={(event) => setMembershipPackageForm((form) => ({ ...form, name: event.target.value }))}
            className={inputClass}
            placeholder="Premium - 6 Bulan"
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Durasi Bulan</span>
            <input
              value={membershipPackageForm.duration}
              onChange={(event) => setMembershipPackageForm((form) => ({ ...form, duration: event.target.value }))}
              className={inputClass}
              type="number"
              min="1"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Harga</span>
            <input
              value={membershipPackageForm.price}
              onChange={(event) => setMembershipPackageForm((form) => ({ ...form, price: event.target.value }))}
              className={inputClass}
              type="number"
              min="0"
            />
          </label>
        </div>
        {renderFooter()}
      </form>
    );

    const renderPtForm = () => (
      <form onSubmit={submitPtPackageForm} className="space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Nama Paket</span>
          <input
            value={ptPackageForm.name}
            onChange={(event) => setPtPackageForm((form) => ({ ...form, name: event.target.value }))}
            className={inputClass}
            placeholder="PT Session - 16x"
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Jumlah Sesi</span>
            <input
              value={ptPackageForm.sessions}
              onChange={(event) => setPtPackageForm((form) => ({ ...form, sessions: event.target.value }))}
              className={inputClass}
              type="number"
              min="1"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Harga</span>
            <input
              value={ptPackageForm.price}
              onChange={(event) => setPtPackageForm((form) => ({ ...form, price: event.target.value }))}
              className={inputClass}
              type="number"
              min="0"
            />
          </label>
        </div>
        {renderFooter()}
      </form>
    );

    const renderPaymentForm = () => (
      <form onSubmit={submitPaymentMethodForm} className="space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Metode</span>
          <input
            value={paymentMethodForm.name}
            onChange={(event) => setPaymentMethodForm((form) => ({ ...form, name: event.target.value }))}
            className={inputClass}
            placeholder="Virtual Account"
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Settlement</span>
            <input
              value={paymentMethodForm.settlement}
              onChange={(event) => setPaymentMethodForm((form) => ({ ...form, settlement: event.target.value }))}
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Biaya</span>
            <input
              value={paymentMethodForm.fee}
              onChange={(event) => setPaymentMethodForm((form) => ({ ...form, fee: event.target.value }))}
              className={inputClass}
            />
          </label>
        </div>
        {renderFooter()}
      </form>
    );

    const renderTemplateForm = () => (
      <form onSubmit={submitMessageTemplateForm} className="space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Nama Template</span>
          <input
            value={messageTemplateForm.name}
            onChange={(event) => setMessageTemplateForm((form) => ({ ...form, name: event.target.value }))}
            className={inputClass}
            placeholder="Reminder Membership"
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Trigger</span>
            <input
              value={messageTemplateForm.trigger}
              onChange={(event) => setMessageTemplateForm((form) => ({ ...form, trigger: event.target.value }))}
              className={inputClass}
              placeholder="membership_expiry_h7"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Channel</span>
            <select
              value={messageTemplateForm.channel}
              onChange={(event) =>
                setMessageTemplateForm((form) => ({
                  ...form,
                  channel: event.target.value as MessageTemplateFormState["channel"],
                }))
              }
              className={inputClass}
            >
              {["WhatsApp", "Email", "Email + WhatsApp", "Push + WhatsApp"].map((channel) => (
                <option key={channel}>{channel}</option>
              ))}
            </select>
          </label>
        </div>
        <label className="block">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Audience</span>
          <input
            value={messageTemplateForm.audience}
            onChange={(event) => setMessageTemplateForm((form) => ({ ...form, audience: event.target.value }))}
            className={inputClass}
            placeholder="Member expired H-7"
          />
        </label>
        {renderFooter()}
      </form>
    );

    const renderPromoForm = () => (
      <form onSubmit={submitPromoForm} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Nama Promo</span>
            <input
              value={promoForm.name}
              onChange={(event) => setPromoForm((form) => ({ ...form, name: event.target.value }))}
              className={inputClass}
              placeholder="Flash Sale PT"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Kode</span>
            <input
              value={promoForm.code}
              onChange={(event) => setPromoForm((form) => ({ ...form, code: event.target.value }))}
              className={inputClass}
              placeholder="FLASHPT"
            />
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tipe</span>
            <select
              value={promoForm.type}
              onChange={(event) => setPromoForm((form) => ({ ...form, type: event.target.value as PromoFormState["type"] }))}
              className={inputClass}
            >
              <option value="percentage">Persen</option>
              <option value="fixed">Nominal</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Diskon</span>
            <input
              value={promoForm.discount}
              onChange={(event) => setPromoForm((form) => ({ ...form, discount: event.target.value }))}
              className={inputClass}
              type="number"
              min="0"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Limit</span>
            <input
              value={promoForm.maxUsage}
              onChange={(event) => setPromoForm((form) => ({ ...form, maxUsage: event.target.value }))}
              className={inputClass}
              type="number"
              min="1"
            />
          </label>
        </div>
        <label className="block">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Berlaku Sampai</span>
          <input
            value={promoForm.validUntil}
            onChange={(event) => setPromoForm((form) => ({ ...form, validUntil: event.target.value }))}
            className={inputClass}
            type="date"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Benefit</span>
          <input
            value={promoForm.description}
            onChange={(event) => setPromoForm((form) => ({ ...form, description: event.target.value }))}
            className={inputClass}
            placeholder="Diskon paket PT"
          />
        </label>
        {renderFooter()}
      </form>
    );

    return (
      <Modal
        isOpen={Boolean(settingsModal)}
        onClose={() => setSettingsModal(null)}
        className="max-w-[720px] overflow-hidden p-0"
      >
        <div className="border-b border-gray-200 px-5 pb-5 pr-16 pt-6 dark:border-gray-800 sm:px-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{modalTitle}</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Data disimpan ke dummy state dan localStorage prototype.
          </p>
        </div>
        <div className="max-h-[calc(100vh-9rem)] overflow-y-auto px-5 py-5 sm:px-6">
          {settingsModal?.type === "branch" && renderBranchForm()}
          {settingsModal?.type === "membership" && renderMembershipForm()}
          {settingsModal?.type === "pt" && renderPtForm()}
          {settingsModal?.type === "payment" && renderPaymentForm()}
          {settingsModal?.type === "template" && renderTemplateForm()}
          {settingsModal?.type === "promo" && renderPromoForm()}
        </div>
      </Modal>
    );
  };

  const renderConfirmDeleteModal = () => (
    <Modal
      isOpen={Boolean(confirmDelete)}
      onClose={() => setConfirmDelete(null)}
      className="max-w-[520px] overflow-hidden p-0"
    >
      <div className="border-b border-gray-200 px-5 pb-5 pr-16 pt-6 dark:border-gray-800 sm:px-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {confirmDelete?.title ?? "Konfirmasi Hapus"}
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {confirmDelete?.message ?? "Data akan dihapus dari prototype."}
        </p>
      </div>
      <div className="px-5 py-5 sm:px-6">
        <div className="rounded-lg bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
          {confirmDelete?.target}
        </div>
      </div>
      <div className="flex flex-col-reverse gap-2 border-t border-gray-200 bg-white px-5 py-4 dark:border-gray-800 dark:bg-gray-900 sm:flex-row sm:justify-end sm:px-6">
        <button
          type="button"
          onClick={() => setConfirmDelete(null)}
          className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-200 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300"
        >
          Batal
        </button>
        <button
          type="button"
          onClick={confirmDeleteAction}
          className="inline-flex h-10 items-center justify-center rounded-lg bg-rose-600 px-4 text-sm font-semibold text-white hover:bg-rose-700"
        >
          {confirmDelete?.confirmLabel ?? "Ya, Hapus"}
        </button>
      </div>
    </Modal>
  );

  const renderDetailModal = () => (
    <Modal
      isOpen={Boolean(detailModal)}
      onClose={() => setDetailModal(null)}
      className="max-w-[640px] overflow-hidden p-0"
    >
      <div className="border-b border-gray-200 px-5 pb-5 pr-16 pt-6 dark:border-gray-800 sm:px-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{detailModal?.title}</h3>
            {detailModal?.subtitle && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{detailModal.subtitle}</p>
            )}
          </div>
          <StatusPill tone={detailModal?.tone ?? "slate"}>detail</StatusPill>
        </div>
      </div>
      <div className="max-h-[calc(100vh-9rem)] overflow-y-auto px-5 py-5 sm:px-6">
        <div className="space-y-3">
          {detailModal?.rows.map((row) => (
            <div key={row.label} className="flex items-start justify-between gap-4 rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-800">
              <span className="text-sm text-gray-500 dark:text-gray-400">{row.label}</span>
              <span className="text-right text-sm font-medium text-gray-900 dark:text-white">{row.value}</span>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );

  const renderSeedModal = () => (
    <Modal
      isOpen={Boolean(seedModal)}
      onClose={() => setSeedModal(null)}
      className="max-w-[860px] overflow-hidden p-0"
    >
      <div className="border-b border-gray-200 px-5 pb-5 pr-16 pt-6 dark:border-gray-800 sm:px-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {seedModal?.mode === "export" ? "Export Dummy Data" : "Import Dummy Data"}
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Snapshot localStorage prototype untuk backup, reset, atau pindah seed.
        </p>
      </div>
      <div className="space-y-4 px-5 py-5 sm:px-6">
        <textarea
          value={seedJson}
          onChange={(event) => setSeedJson(event.target.value)}
          readOnly={seedModal?.mode === "export"}
          className="min-h-[360px] w-full rounded-lg border border-gray-200 bg-white p-3 font-mono text-xs text-gray-700 outline-none focus:border-emerald-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200"
        />
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => setSeedModal(null)}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-200 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300"
          >
            Tutup
          </button>
          {seedModal?.mode === "export" ? (
            <button
              type="button"
              onClick={() => downloadTextFile("seven-gym-prototype-seed.json", seedJson)}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Download JSON
            </button>
          ) : (
            <button
              type="button"
              onClick={importPrototypeSeed}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Import & Reload
            </button>
          )}
        </div>
      </div>
    </Modal>
  );

  const renderBody = () => {
    if (moduleName === "system-flow" || parent === "Alur Sistem") return renderSystemFlow();
    if (moduleName === "member") return renderMemberPortal();
    if (moduleName === "trainer") return renderTrainerPortal();
    if (moduleName === "members" || parent === "Member") return renderMemberAdmin();
    if (moduleName === "check-in" || parent === "Check-In") return renderCheckInAdmin();
    if (moduleName === "classes" || parent === "Kelas Gym") return renderClassAdmin();
    if (moduleName === "trainers" || parent === "Personal Trainer") return renderTrainerAdmin();
    if (moduleName === "finance") return renderFinance();
    if (moduleName === "payments" || moduleName === "cashier" || parent === "Kasir & Pembayaran") return renderPaymentAdmin();
    if (moduleName === "inventory" || parent === "Produk & Stok") return renderInventoryAdmin();
    if (moduleName === "promo" || parent === "Promo & Loyalty") return renderPromoNotifications();
    if (moduleName === "notifications" || parent === "WhatsApp & Notifikasi") return renderNotificationAdmin();
    if (moduleName === "reports" || parent === "Laporan") return renderReports();
    if (moduleName === "settings" || parent === "Pengaturan") return renderSettings();
    if (moduleName === "iam" || parent === "Role & Akses") return renderAccess();
    if (parent === "Master Data" || parent === "Data Master") return renderMasterData();
    if (parent === "Keuangan" || parent === "Kasir & Keuangan") return renderFinance();
    if (parent === "Stok & Maintenance") return renderStockMaintenance();
    if (parent === "CRM & Otomasi" || parent === "CRM & Loyalty") return renderPromoNotifications();
    return renderOperations();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill tone="emerald">Prototype</StatusPill>
            <StatusPill tone="sky">{parent}</StatusPill>
            <StatusPill tone="amber">{currentRoleLabel}</StatusPill>
          </div>
          <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
            {title}
          </h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Tampilan dummy dinamis untuk validasi flow Seven Gym sebelum backend API.
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
            <ClockIcon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {currentUser.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {activeBranch.name} / JSON-ready
            </p>
          </div>
        </div>
      </div>
      {renderBody()}
      {renderActionModal()}
      {renderSettingsModal()}
      {renderDetailModal()}
      {renderSeedModal()}
      {renderConfirmDeleteModal()}
    </div>
  );
}
