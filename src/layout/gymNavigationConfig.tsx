import type { ReactNode } from "react";
import type { UserRole } from "@/context/RoleContext";
import {
  CashRegisterIcon,
  ClassIcon,
  ClipboardIcon,
  DumbbellIcon,
  GiftIcon,
  InventoryIcon,
  MemberIcon,
  PromoIcon,
  QrCodeIcon,
  ReportIcon,
  SettingsIcon,
  ShieldIcon,
  TargetIcon,
  TrainerIcon,
  WhatsAppIcon,
} from "@/icons/gym-icons";
import { PieChartIcon } from "@/icons";

export type NavSubItem = {
  name: string;
  path: string;
  requiredAny?: string[];
  requiredRolesAny?: UserRole[];
  badge?: "new" | "soon" | "hot";
};

export type NavItem = {
  name: string;
  icon: ReactNode;
  path?: string;
  requiredAny?: string[];
  requiredRolesAny?: UserRole[];
  subItems?: NavSubItem[];
};

const ownerOnly: UserRole[] = ["owner"];
const backOfficeRoles: UserRole[] = ["owner", "staff"];
const memberOnly: UserRole[] = ["member"];
const allSystemRoles: UserRole[] = ["owner", "staff", "trainer", "member"];

export const mainNavItems: NavItem[] = [
  {
    icon: <DumbbellIcon className="h-5 w-5" />,
    name: "Dashboard",
    path: "/",
    requiredAny: ["dashboard.view"],
    requiredRolesAny: backOfficeRoles,
  },
  {
    icon: <MemberIcon className="h-5 w-5" />,
    name: "Member",
    requiredAny: ["members.view"],
    requiredRolesAny: backOfficeRoles,
    subItems: [
      { name: "Data Member", path: "/members/data", requiredAny: ["members.view"] },
      { name: "Membership", path: "/members/membership", requiredAny: ["members.view"] },
      { name: "Histori Kunjungan", path: "/members/visits", requiredAny: ["members.view"] },
      { name: "Progress Member", path: "/members/progress", requiredAny: ["members.view"] },
      { name: "Referral Member", path: "/members/referrals", requiredAny: ["members.view"] },
    ],
  },
  {
    icon: <QrCodeIcon className="h-5 w-5" />,
    name: "Check-In",
    requiredAny: ["checkin.view"],
    requiredRolesAny: backOfficeRoles,
    subItems: [
      { name: "Scan QR", path: "/check-in/scan", requiredAny: ["checkin.create"], badge: "hot" },
      { name: "Member Sedang Gym", path: "/check-in/live", requiredAny: ["checkin.view"] },
      { name: "Histori Check-In", path: "/check-in/history", requiredAny: ["checkin.view"] },
      { name: "Member Tidak Aktif", path: "/check-in/inactive", requiredAny: ["members.view"] },
    ],
  },
  {
    icon: <ClassIcon className="h-5 w-5" />,
    name: "Kelas Gym",
    requiredAny: ["classes.view"],
    requiredRolesAny: backOfficeRoles,
    subItems: [
      { name: "Jadwal Kelas", path: "/classes/schedule", requiredAny: ["classes.view"] },
      { name: "Booking Kelas", path: "/classes/bookings", requiredAny: ["classes.view"] },
      { name: "Kapasitas & Waiting List", path: "/classes/capacity", requiredAny: ["classes.view"] },
      { name: "Absensi Kelas", path: "/classes/attendance", requiredAny: ["classes.view"] },
    ],
  },
  {
    icon: <TrainerIcon className="h-5 w-5" />,
    name: "Personal Trainer",
    requiredAny: ["trainers.view"],
    requiredRolesAny: backOfficeRoles,
    subItems: [
      { name: "Data Trainer", path: "/trainers/data", requiredAny: ["trainers.view"], requiredRolesAny: ownerOnly },
      { name: "Jadwal Trainer", path: "/trainers/schedule", requiredAny: ["trainers.view"] },
      { name: "Booking PT", path: "/trainers/bookings", requiredAny: ["trainers.view"] },
      { name: "Client Trainer", path: "/trainers/clients", requiredAny: ["trainers.view"] },
      { name: "Performa / Komisi", path: "/trainers/performance", requiredAny: ["trainers.view"], requiredRolesAny: ownerOnly },
    ],
  },
  {
    icon: <CashRegisterIcon className="h-5 w-5" />,
    name: "Kasir & Pembayaran",
    requiredAny: ["pos.view", "payments.view"],
    requiredRolesAny: backOfficeRoles,
    subItems: [
      { name: "POS / Kasir", path: "/pos", requiredAny: ["pos.view"], badge: "new" },
      { name: "Invoice Pembayaran", path: "/payments/invoices", requiredAny: ["payments.view"] },
      { name: "Histori Transaksi", path: "/payments/transactions", requiredAny: ["payments.view"] },
      { name: "Shift Kasir", path: "/finance/cash-shifts", requiredAny: ["payments.view"] },
      { name: "Void / Refund", path: "/finance/refunds", requiredAny: ["payments.export"], requiredRolesAny: ownerOnly },
    ],
  },
  {
    icon: <InventoryIcon className="h-5 w-5" />,
    name: "Produk & Stok",
    requiredAny: ["products.view"],
    requiredRolesAny: backOfficeRoles,
    subItems: [
      { name: "Data Produk", path: "/inventory/products", requiredAny: ["products.view"] },
      { name: "Stok Produk", path: "/inventory/stock", requiredAny: ["products.view"] },
      { name: "Barang Masuk", path: "/inventory/inbound", requiredAny: ["products.edit"] },
      { name: "Barang Keluar", path: "/inventory/outbound", requiredAny: ["products.edit"] },
      { name: "Supplier", path: "/inventory/suppliers", requiredAny: ["products.view"], requiredRolesAny: ownerOnly },
      { name: "Maintenance Alat", path: "/inventory/maintenance", requiredAny: ["products.view"] },
    ],
  },
  {
    icon: <PromoIcon className="h-5 w-5" />,
    name: "Promo & Loyalty",
    requiredAny: ["promos.view"],
    requiredRolesAny: ownerOnly,
    subItems: [
      { name: "Promo Gym", path: "/promo", requiredAny: ["promos.view"] },
      { name: "Point & Reward", path: "/promo/rewards", requiredAny: ["promos.view"] },
      { name: "Referral Program", path: "/promo/referral", requiredAny: ["promos.view"] },
      { name: "Challenge Bulanan", path: "/promo/challenges", requiredAny: ["promos.view"] },
    ],
  },
  {
    icon: <WhatsAppIcon className="h-5 w-5" />,
    name: "WhatsApp & Notifikasi",
    requiredAny: ["notifications.view"],
    requiredRolesAny: backOfficeRoles,
    subItems: [
      { name: "Reminder Membership", path: "/notifications/membership", requiredAny: ["notifications.view"] },
      { name: "Reminder Latihan / PT", path: "/notifications/workout", requiredAny: ["notifications.view"] },
      { name: "Reminder Kelas", path: "/notifications/classes", requiredAny: ["notifications.view"] },
      { name: "Broadcast Promo", path: "/notifications/broadcast", requiredAny: ["notifications.manage"], requiredRolesAny: ownerOnly },
      { name: "Ulang Tahun", path: "/notifications/birthday", requiredAny: ["notifications.view"] },
    ],
  },
  {
    icon: <ReportIcon className="h-5 w-5" />,
    name: "Laporan",
    requiredAny: ["reports.view"],
    requiredRolesAny: ownerOnly,
    subItems: [
      { name: "Overview", path: "/reports/overview", requiredAny: ["reports.view"] },
      { name: "Pendapatan", path: "/reports/revenue", requiredAny: ["reports.view"] },
      { name: "Member", path: "/reports/members", requiredAny: ["reports.view"] },
      { name: "Trainer", path: "/reports/trainers", requiredAny: ["reports.view"] },
      { name: "Kelas", path: "/reports/classes", requiredAny: ["reports.view"] },
      { name: "Produk", path: "/reports/inventory", requiredAny: ["reports.view"] },
      { name: "Kehadiran", path: "/reports/attendance", requiredAny: ["reports.view"] },
      { name: "Analisa Gym", path: "/reports/analysis", requiredAny: ["reports.view"] },
    ],
  },
  {
    icon: <SettingsIcon className="h-5 w-5" />,
    name: "Pengaturan",
    requiredAny: ["settings.view"],
    requiredRolesAny: ownerOnly,
    subItems: [
      { name: "Profil Gym", path: "/settings/profile", requiredAny: ["settings.view"] },
      { name: "Cabang", path: "/settings/branches", requiredAny: ["settings.view"] },
      { name: "Paket Membership", path: "/settings/membership-packages", requiredAny: ["settings.view"] },
      { name: "Paket PT", path: "/settings/pt-packages", requiredAny: ["settings.view"] },
      { name: "Metode Pembayaran", path: "/settings/payment-methods", requiredAny: ["settings.view"] },
      { name: "Template Pesan", path: "/settings/templates", requiredAny: ["settings.view"] },
      { name: "Data Dummy", path: "/settings/dummy-data", requiredAny: ["settings.view"] },
    ],
  },
  {
    icon: <ShieldIcon className="h-5 w-5" />,
    name: "Role & Akses",
    requiredAny: ["iam.view"],
    requiredRolesAny: ownerOnly,
    subItems: [
      { name: "User & Staff", path: "/iam/users", requiredAny: ["iam.users"] },
      { name: "Role", path: "/iam/roles", requiredAny: ["iam.roles"] },
      { name: "Matrix Akses", path: "/iam/matrix", requiredAny: ["iam.permissions"] },
      { name: "Audit Log", path: "/iam/activity-log", requiredAny: ["iam.logs"] },
    ],
  },
  {
    icon: <PieChartIcon className="h-5 w-5" />,
    name: "Dashboard Trainer",
    path: "/",
    requiredAny: ["trainer.dashboard.view"],
    requiredRolesAny: ["trainer"],
  },
  {
    icon: <ClassIcon className="h-5 w-5" />,
    name: "Jadwal PT",
    path: "/my-schedule",
    requiredAny: ["trainer.schedule.view"],
    requiredRolesAny: ["trainer"],
  },
  {
    icon: <MemberIcon className="h-5 w-5" />,
    name: "Client Trainer",
    path: "/my-clients",
    requiredAny: ["trainer.clients.view"],
    requiredRolesAny: ["trainer"],
  },
  {
    icon: <ClipboardIcon className="h-5 w-5" />,
    name: "Progress Client",
    path: "/trainer/programs",
    requiredAny: ["trainer.programs.view"],
    requiredRolesAny: ["trainer"],
  },
  {
    icon: <TargetIcon className="h-5 w-5" />,
    name: "Target & Komisi",
    path: "/trainer/commission",
    requiredAny: ["trainer.earnings.view"],
    requiredRolesAny: ["trainer"],
  },
  {
    icon: <DumbbellIcon className="h-5 w-5" />,
    name: "Beranda Member",
    requiredAny: ["member.dashboard.view"],
    requiredRolesAny: memberOnly,
    subItems: [
      { name: "Beranda", path: "/member", requiredAny: ["member.dashboard.view"] },
      { name: "Membership Saya", path: "/member/membership", requiredAny: ["member.membership.view"] },
      { name: "QR Check-In", path: "/member/qr-check-in", requiredAny: ["member.qr.view"] },
      { name: "Jadwal Hari Ini", path: "/member/today", requiredAny: ["member.schedule.view"] },
      { name: "Promo Gym", path: "/member/promos", requiredAny: ["member.promos.view"] },
      { name: "Progress Saya", path: "/member/progress", requiredAny: ["member.progress.view"] },
    ],
  },
  {
    icon: <ClassIcon className="h-5 w-5" />,
    name: "Jadwal & Booking",
    requiredAny: ["member.bookings.view"],
    requiredRolesAny: memberOnly,
    subItems: [
      { name: "Booking Kelas", path: "/member/book-class", requiredAny: ["member.bookings.create"] },
      { name: "Booking Trainer", path: "/member/book-trainer", requiredAny: ["member.trainer.book"] },
      { name: "Jadwal Kelas", path: "/member/classes", requiredAny: ["member.bookings.view"] },
      { name: "Jadwal Saya", path: "/member/my-schedule", requiredAny: ["member.schedule.view"] },
    ],
  },
  {
    icon: <GiftIcon className="h-5 w-5" />,
    name: "Pembayaran & Loyalty",
    requiredAny: ["member.payments.view", "member.points.view"],
    requiredRolesAny: memberOnly,
    subItems: [
      { name: "Pembayaran Saya", path: "/member/payments", requiredAny: ["member.payments.view"] },
      { name: "Point & Reward", path: "/member/points", requiredAny: ["member.points.view"] },
      { name: "Referral Saya", path: "/member/referrals", requiredAny: ["member.referrals.view"] },
      { name: "Profile Saya", path: "/member/profile", requiredAny: ["member.profile.view"] },
    ],
  },
];

export const systemNavItems: NavItem[] = [];

export const allNavItems = [...mainNavItems, ...systemNavItems];

export const flattenNavItems = (items: NavItem[] = allNavItems) =>
  items.flatMap((item) => [
    ...(item.path ? [{ name: item.name, path: item.path, parent: item.name }] : []),
    ...(item.subItems?.map((subItem) => ({
      name: subItem.name,
      path: subItem.path,
      parent: item.name,
    })) ?? []),
  ]);

export const findNavItemByPath = (path: string) => {
  const flattenedItems = flattenNavItems();
  return (
    flattenedItems.find((item) => item.path === path) ??
    flattenedItems
      .filter((item) => item.path !== "/" && path.startsWith(`${item.path}/`))
      .sort((a, b) => b.path.length - a.path.length)[0]
  );
};

export const findNavAccessByPath = (path: string, role?: UserRole) => {
  const accessItems = allNavItems.flatMap((item) => [
    ...(item.path
      ? [
          {
            name: item.name,
            path: item.path,
            parent: item.name,
            requiredAny: item.requiredAny,
            requiredRolesAny: item.requiredRolesAny,
          },
        ]
      : []),
    ...(item.subItems?.map((subItem) => ({
      name: subItem.name,
      path: subItem.path,
      parent: item.name,
      requiredAny: subItem.requiredAny ?? item.requiredAny,
      requiredRolesAny: subItem.requiredRolesAny ?? item.requiredRolesAny,
    })) ?? []),
  ]);

  const matchingItems = accessItems
    .filter((item) => item.path === path || (item.path !== "/" && path.startsWith(`${item.path}/`)))
    .sort((a, b) => b.path.length - a.path.length);

  if (role) {
    const roleMatch = matchingItems.find((item) => item.requiredRolesAny?.includes(role));
    if (roleMatch) return roleMatch;
  }

  return matchingItems[0];
};

export const menuRoles: UserRole[] = allSystemRoles;
