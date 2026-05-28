"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import { useRole } from "../context/RoleContext";
import { ChevronDownIcon, HorizontaLDots } from "../icons";
import { DumbbellIcon } from "../icons/gym-icons";
import SidebarWidget from "./SidebarWidget";
import {
  mainNavItems,
  NavItem,
  NavSubItem,
  systemNavItems,
} from "./gymNavigationConfig";

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const { hasAnyPermission, hasRole } = useRole();
  const pathname = usePathname();
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  const canShowSubItem = (subItem: NavSubItem) =>
    hasRole(subItem.requiredRolesAny) && hasAnyPermission(subItem.requiredAny);

  const canShowNavItem = (navItem: NavItem) => {
    if (!hasRole(navItem.requiredRolesAny) || !hasAnyPermission(navItem.requiredAny)) {
      return false;
    }

    if (!navItem.subItems) return true;
    return navItem.subItems.some(canShowSubItem);
  };

  const filterNavItems = (items: NavItem[]) =>
    items
      .filter(canShowNavItem)
      .map((item) => ({
        ...item,
        subItems: item.subItems?.filter(canShowSubItem),
      }));

  const menuItems = filterNavItems(mainNavItems);
  const systemItems = filterNavItems(systemNavItems);

  const isPathActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  const activeSubItemPath =
    [...menuItems, ...systemItems]
      .flatMap((nav) => nav.subItems?.map((subItem) => subItem.path) ?? [])
      .filter(isPathActive)
      .sort((current, next) => next.length - current.length)[0] ?? null;

  const isSubItemActive = (path: string) => path === activeSubItemPath;

  const activeSubmenuKey = [...menuItems, ...systemItems].reduce<string | null>(
    (activeKey, nav, index) => {
      if (activeKey || !nav.subItems?.some((subItem) => isSubItemActive(subItem.path))) {
        return activeKey;
      }

      const section = index < menuItems.length ? "menu" : "system";
      const itemIndex = section === "menu" ? index : index - menuItems.length;
      return `${section}-${itemIndex}`;
    },
    null,
  );

  const handleSubmenuToggle = (key: string) => {
    setOpenSubmenu((prev) => (prev === key ? null : key));
  };

  const isSidebarOpen = isExpanded || isHovered || isMobileOpen;

  const renderBadge = (badge: NavSubItem["badge"], active: boolean) => {
    if (!badge) return null;

    const label = badge === "soon" ? "soon" : badge;
    return (
      <span
        className={`menu-dropdown-badge ${
          active ? "menu-dropdown-badge-active" : "menu-dropdown-badge-inactive"
        }`}
      >
        {label}
      </span>
    );
  };

  const renderMenuItems = (items: NavItem[], section: "menu" | "system") => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => {
        const key = `${section}-${index}`;
        const hasSubItems = Boolean(nav.subItems?.length);
        const isSubmenuOpen = openSubmenu
          ? openSubmenu === key
          : activeSubmenuKey === key;
        const isNavActive =
          (nav.path ? isPathActive(nav.path) : false) ||
          Boolean(nav.subItems?.some((subItem) => isSubItemActive(subItem.path)));

        return (
          <li key={`${section}-${nav.name}`}>
            {hasSubItems ? (
              <button
                onClick={() => handleSubmenuToggle(key)}
                className={`menu-item group cursor-pointer ${
                  isNavActive ? "menu-item-active" : "menu-item-inactive"
                } ${!isSidebarOpen ? "lg:justify-center" : "lg:justify-start"}`}
              >
                <span
                  className={
                    isNavActive ? "menu-item-icon-active" : "menu-item-icon-inactive"
                  }
                >
                  {nav.icon}
                </span>
                {isSidebarOpen && <span className="menu-item-text">{nav.name}</span>}
                {isSidebarOpen && (
                  <ChevronDownIcon
                    className={`ml-auto h-5 w-5 transition-transform duration-200 ${
                      isSubmenuOpen ? "rotate-180 text-brand-500" : ""
                    }`}
                  />
                )}
              </button>
            ) : (
              nav.path && (
                <Link
                  href={nav.path}
                  className={`menu-item group ${
                    isPathActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                  } ${!isSidebarOpen ? "lg:justify-center" : "lg:justify-start"}`}
                >
                  <span
                    className={
                      isPathActive(nav.path)
                        ? "menu-item-icon-active"
                        : "menu-item-icon-inactive"
                    }
                  >
                    {nav.icon}
                  </span>
                  {isSidebarOpen && <span className="menu-item-text">{nav.name}</span>}
                </Link>
              )
            )}

            {hasSubItems && isSidebarOpen && (
              <div
                className={`grid overflow-hidden transition-all duration-300 ${
                  isSubmenuOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="min-h-0">
                  <ul className="ml-9 mt-2 space-y-1">
                    {nav.subItems?.map((subItem) => {
                      const active = isSubItemActive(subItem.path);
                      return (
                        <li key={subItem.path}>
                          <Link
                            href={subItem.path}
                            className={`menu-dropdown-item ${
                              active
                                ? "menu-dropdown-item-active"
                                : "menu-dropdown-item-inactive"
                            }`}
                          >
                            <span className="truncate">{subItem.name}</span>
                            <span className="ml-auto flex items-center gap-1">
                              {renderBadge(subItem.badge, active)}
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );

  return (
    <aside
      className={`admin-sidebar fixed left-0 top-0 z-50 mt-16 flex h-screen flex-col border-r border-emerald-100/80 bg-[#fbfffd] px-5 text-gray-900 shadow-[18px_0_70px_rgba(0,230,118,0.05)] transition-all duration-300 ease-in-out dark:border-slate-700/70 dark:bg-[#0f172a] dark:shadow-[18px_0_80px_rgba(15,23,42,0.24)] lg:mt-0 ${
        isExpanded || isMobileOpen ? "w-[290px]" : isHovered ? "w-[290px]" : "w-[90px]"
      } ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`flex py-8 ${
          !isSidebarOpen ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link href="/" className="block">
          {isSidebarOpen ? (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 via-brand-500 to-blue-light-400 shadow-[0_12px_30px_rgba(0,230,118,0.32)]">
                <DumbbellIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-extrabold tracking-normal leading-none">
                <span className="text-brand-700 dark:text-brand-300">Seven</span>{" "}
                <span className="text-amber-500 drop-shadow-[0_1px_10px_rgba(255,159,28,0.35)]">
                  Gym
                </span>
              </span>
            </div>
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 via-brand-500 to-blue-light-400 shadow-[0_12px_30px_rgba(0,230,118,0.32)]">
              <DumbbellIcon className="h-6 w-6 text-white" />
            </div>
          )}
        </Link>
      </div>

      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 flex text-xs uppercase leading-[20px] text-gray-400 ${
                  !isSidebarOpen ? "lg:justify-center" : "justify-start"
                }`}
              >
                {isSidebarOpen ? "Menu" : <HorizontaLDots />}
              </h2>
            {renderMenuItems(menuItems, "menu")}
            </div>

            {systemItems.length > 0 && (
              <div>
                <h2
                  className={`mb-4 flex text-xs uppercase leading-[20px] text-gray-400 ${
                    !isSidebarOpen ? "lg:justify-center" : "justify-start"
                  }`}
                >
                  {isSidebarOpen ? "Others" : <HorizontaLDots />}
                </h2>
                {renderMenuItems(systemItems, "system")}
              </div>
            )}
          </div>
        </nav>
        {isSidebarOpen && <SidebarWidget />}
      </div>
    </aside>
  );
};

export default AppSidebar;
