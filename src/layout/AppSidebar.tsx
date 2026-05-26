"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import { useRole, UserRole } from "../context/RoleContext";
import {
  ChevronDownIcon,
  HorizontaLDots,
  PieChartIcon,
} from "../icons/index";
import {
  DumbbellIcon,
  QrCodeIcon,
  MemberIcon,
  ClassIcon,
  TrainerIcon,
  CashRegisterIcon,
  InventoryIcon,
  PromoIcon,
  WhatsAppIcon,
  ReportIcon,
  HomeIcon,
  ProgressIcon,
  GiftIcon,
  WalletIcon,
  ClipboardIcon,
  TargetIcon,
} from "../icons/gym-icons";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

// Admin menu items
const adminNavItems: NavItem[] = [
  {
    icon: <DumbbellIcon className="w-5 h-5" />,
    name: "Dashboard",
    path: "/",
  },
  {
    icon: <MemberIcon className="w-5 h-5" />,
    name: "Member",
    subItems: [
      { name: "Daftar Member", path: "/members" },
      { name: "Tambah Member", path: "/members/add" },
      { name: "Membership Aktif", path: "/members/active" },
      { name: "Membership Habis", path: "/members/expired" },
      { name: "Progress Member", path: "/members/progress" },
    ],
  },
  {
    icon: <QrCodeIcon className="w-5 h-5" />,
    name: "Check-In",
    subItems: [
      { name: "Scan QR Check-In", path: "/checkin" },
      { name: "Member Sedang Gym", path: "/checkin/active" },
      { name: "Histori Check-In", path: "/checkin/history" },
    ],
  },
  {
    icon: <ClassIcon className="w-5 h-5" />,
    name: "Kelas Gym",
    subItems: [
      { name: "Jadwal Kelas", path: "/classes" },
      { name: "Booking Kelas", path: "/classes/bookings" },
      { name: "Kapasitas & Waiting", path: "/classes/capacity" },
    ],
  },
  {
    icon: <TrainerIcon className="w-5 h-5" />,
    name: "Personal Trainer",
    subItems: [
      { name: "Daftar Trainer", path: "/trainers" },
      { name: "Jadwal Trainer", path: "/trainers/schedule" },
      { name: "Booking PT", path: "/trainers/bookings" },
      { name: "Komisi Trainer", path: "/trainers/commission" },
    ],
  },
  {
    icon: <CashRegisterIcon className="w-5 h-5" />,
    name: "Kasir & Pembayaran",
    subItems: [
      { name: "POS / Kasir", path: "/pos", new: true },
      { name: "Transaksi Membership", path: "/transactions/membership" },
      { name: "Transaksi PT", path: "/transactions/pt" },
      { name: "Histori Transaksi", path: "/transactions/history" },
    ],
  },
  {
    icon: <InventoryIcon className="w-5 h-5" />,
    name: "Produk & Stok",
    subItems: [
      { name: "Data Produk", path: "/products" },
      { name: "Stok Produk", path: "/products/stock" },
      { name: "Stock Movement", path: "/products/movement" },
    ],
  },
  {
    icon: <PromoIcon className="w-5 h-5" />,
    name: "Promo & Loyalty",
    subItems: [
      { name: "Promo Gym", path: "/promo" },
      { name: "Point & Reward", path: "/promo/rewards" },
      { name: "Challenge", path: "/promo/challenge" },
    ],
  },
  {
    icon: <WhatsAppIcon className="w-5 h-5" />,
    name: "WhatsApp & Notif",
    subItems: [
      { name: "Automation Center", path: "/notifications" },
      { name: "Broadcast", path: "/notifications/broadcast" },
    ],
  },
  {
    icon: <ReportIcon className="w-5 h-5" />,
    name: "Laporan",
    subItems: [
      { name: "Laporan Pendapatan", path: "/reports/revenue" },
      { name: "Laporan Member", path: "/reports/members" },
      { name: "Laporan Trainer", path: "/reports/trainers" },
      { name: "Analisa Gym", path: "/reports/analytics" },
    ],
  },
];

// Member menu items
const memberNavItems: NavItem[] = [
  {
    icon: <HomeIcon className="w-5 h-5" />,
    name: "Beranda",
    path: "/",
  },
  {
    icon: <ClassIcon className="w-5 h-5" />,
    name: "Jadwal & Booking",
    subItems: [
      { name: "Booking Kelas", path: "/member/booking/class" },
      { name: "Booking Trainer", path: "/member/booking/trainer" },
      { name: "Jadwal Saya", path: "/member/schedule" },
    ],
  },
  {
    icon: <ProgressIcon className="w-5 h-5" />,
    name: "Progress Saya",
    subItems: [
      { name: "Berat & BMI", path: "/member/progress" },
      { name: "Before After", path: "/member/progress/photos" },
      { name: "Target Fitness", path: "/member/progress/target" },
    ],
  },
  {
    icon: <GiftIcon className="w-5 h-5" />,
    name: "Reward & Point",
    subItems: [
      { name: "Point Saya", path: "/member/points" },
      { name: "Reward", path: "/member/rewards" },
      { name: "Referral", path: "/member/referral" },
      { name: "Challenge", path: "/member/challenge" },
    ],
  },
  {
    icon: <WalletIcon className="w-5 h-5" />,
    name: "Pembayaran",
    subItems: [
      { name: "Membership Saya", path: "/member/membership" },
      { name: "Histori Pembayaran", path: "/member/payments" },
      { name: "Perpanjang", path: "/member/renew" },
    ],
  },
];

// Trainer menu items
const trainerNavItems: NavItem[] = [
  {
    icon: <PieChartIcon className="w-5 h-5" />,
    name: "Dashboard PT",
    path: "/",
  },
  {
    icon: <MemberIcon className="w-5 h-5" />,
    name: "Client Saya",
    subItems: [
      { name: "Daftar Client", path: "/trainer/clients" },
      { name: "Progress Client", path: "/trainer/clients/progress" },
      { name: "Histori Latihan", path: "/trainer/clients/history" },
    ],
  },
  {
    icon: <ClassIcon className="w-5 h-5" />,
    name: "Jadwal Latihan",
    subItems: [
      { name: "Jadwal Hari Ini", path: "/trainer/schedule" },
      { name: "Booking Baru", path: "/trainer/bookings" },
      { name: "Kalender PT", path: "/trainer/calendar" },
    ],
  },
  {
    icon: <ClipboardIcon className="w-5 h-5" />,
    name: "Program Latihan",
    subItems: [
      { name: "Program Saya", path: "/trainer/programs" },
      { name: "Catatan Latihan", path: "/trainer/notes" },
    ],
  },
  {
    icon: <TargetIcon className="w-5 h-5" />,
    name: "Komisi & Target",
    subItems: [
      { name: "Komisi Saya", path: "/trainer/commission" },
      { name: "Target Bulanan", path: "/trainer/target" },
      { name: "Histori Pendapatan", path: "/trainer/earnings" },
    ],
  },
];

const getNavItemsByRole = (role: UserRole): NavItem[] => {
  switch (role) {
    case "admin":
      return adminNavItems;
    case "member":
      return memberNavItems;
    case "trainer":
      return trainerNavItems;
    default:
      return adminNavItems;
  }
};

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const { currentRole } = useRole();
  const pathname = usePathname();

  const navItems = getNavItemsByRole(currentRole);

  const [openSubmenu, setOpenSubmenu] = useState<number | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  useEffect(() => {
    let submenuMatched = false;
    navItems.forEach((nav, index) => {
      if (nav.subItems) {
        nav.subItems.forEach((subItem) => {
          if (isActive(subItem.path)) {
            setOpenSubmenu(index);
            submenuMatched = true;
          }
        });
      }
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [pathname, isActive, navItems]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `main-${openSubmenu}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number) => {
    setOpenSubmenu((prev) => (prev === index ? null : index));
  };

  const renderMenuItems = (items: NavItem[]) => (
    <ul className="flex flex-col gap-1">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index)}
              className={`menu-item group ${
                openSubmenu === index ? "menu-item-active" : "menu-item-inactive"
              } cursor-pointer ${
                !isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"
              }`}
            >
              <span
                className={`${
                  openSubmenu === index
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                    openSubmenu === index ? "rotate-180 text-brand-500" : ""
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                href={nav.path}
                className={`menu-item group ${
                  isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                }`}
              >
                <span
                  className={`${
                    isActive(nav.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`main-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height: openSubmenu === index ? `${subMenuHeight[`main-${index}`]}px` : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      href={subItem.path}
                      className={`menu-dropdown-item ${
                        isActive(subItem.path)
                          ? "menu-dropdown-item-active"
                          : "menu-dropdown-item-inactive"
                      }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge`}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge`}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case "admin":
        return "Admin Panel";
      case "member":
        return "Member Area";
      case "trainer":
        return "Trainer Portal";
      default:
        return "Menu";
    }
  };

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link href="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500">
                <DumbbellIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">Seven Gym</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Management System</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500">
              <DumbbellIcon className="w-6 h-6 text-white" />
            </div>
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  getRoleLabel(currentRole)
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(navItems)}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
