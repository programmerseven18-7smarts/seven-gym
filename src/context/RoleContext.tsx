"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { allBranchIds, Branch, mockBranches } from "@/data/branches";

export type UserRole = "owner" | "staff" | "trainer" | "member";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  permissions: string[];
  branchAccess: string[];
  defaultBranchId: string;
  membershipType?: string;
  membershipExpiry?: string;
  phone?: string;
}

export const roleLabels: Record<UserRole, string> = {
  owner: "Owner / Admin",
  staff: "Staff",
  trainer: "Personal Trainer",
  member: "Member",
};

const ownerPermissions = ["*"];

const staffPermissions = [
  "dashboard.view",
  "members.view",
  "members.create",
  "members.edit",
  "checkin.view",
  "checkin.create",
  "classes.view",
  "classes.edit",
  "classes.bookings",
  "trainers.view",
  "pt.view",
  "pt.bookings",
  "pos.view",
  "pos.create",
  "payments.view",
  "payments.create",
  "payments.export",
  "products.view",
  "products.edit",
  "notifications.view",
];

const trainerPermissions = [
  "trainer.dashboard.view",
  "trainer.clients.view",
  "trainer.clients.edit",
  "trainer.schedule.view",
  "trainer.schedule.edit",
  "trainer.programs.view",
  "trainer.programs.edit",
  "trainer.earnings.view",
];

const memberPermissions = [
  "member.dashboard.view",
  "member.membership.view",
  "member.qr.view",
  "member.schedule.view",
  "member.promos.view",
  "member.progress.view",
  "member.bookings.view",
  "member.bookings.create",
  "member.trainer.book",
  "member.payments.view",
  "member.points.view",
  "member.referrals.view",
  "member.profile.view",
];

export const permissionsByRole: Record<UserRole, string[]> = {
  owner: ownerPermissions,
  staff: staffPermissions,
  trainer: trainerPermissions,
  member: memberPermissions,
};

export const mockLoginUsers: User[] = [
  {
    id: "owner-001",
    name: "Raka Pradana",
    email: "owner@sevengym.id",
    avatar: "/images/user/owner.jpg",
    role: "owner",
    phone: "+62 811 7777 0001",
    permissions: ownerPermissions,
    branchAccess: allBranchIds,
    defaultBranchId: "branch-pusat",
  },
  {
    id: "staff-001",
    name: "Budi Santoso",
    email: "staff@sevengym.id",
    avatar: "/images/user/user-01.jpg",
    role: "staff",
    phone: "+62 812 3456 7890",
    permissions: staffPermissions,
    branchAccess: ["branch-pusat", "branch-bsd"],
    defaultBranchId: "branch-pusat",
  },
  {
    id: "trainer-001",
    name: "Dimas Pratama",
    email: "dimas@sevengym.id",
    avatar: "/images/user/user-03.jpg",
    role: "trainer",
    phone: "+62 815 9876 5432",
    permissions: trainerPermissions,
    branchAccess: ["branch-pusat", "branch-bsd"],
    defaultBranchId: "branch-pusat",
  },
  {
    id: "member-001",
    name: "Andi Wijaya",
    email: "andi@email.com",
    avatar: "/images/user/user-02.jpg",
    role: "member",
    phone: "+62 813 1234 5678",
    permissions: memberPermissions,
    branchAccess: ["branch-pusat", "branch-bsd"],
    defaultBranchId: "branch-pusat",
    membershipType: "Premium",
    membershipExpiry: "2026-06-28",
  },
];

export const mockUsers = mockLoginUsers.reduce<Record<string, User>>(
  (users, user) => ({ ...users, [user.id]: user }),
  {},
);

const defaultUser = mockLoginUsers[0];
const storageKeys = {
  userId: "gym-session-user-id",
  token: "gym-session-token",
  branchId: "gym-active-branch-id",
  permissionOverrides: "gym-permission-overrides",
};

type RoleContextType = {
  currentRole: UserRole;
  currentUser: User;
  currentRoleLabel: string;
  permissions: string[];
  isAuthenticated: boolean;
  isSessionReady: boolean;
  sessionToken: string | null;
  activeBranch: Branch;
  accessibleBranches: Branch[];
  branchAccess: string[];
  loginAsUser: (userId: string) => void;
  logout: () => void;
  refreshSession: () => void;
  setActiveBranch: (branchId: string) => void;
  setRole: (role: UserRole) => void;
  setRolePermissionOverride: (role: UserRole, permissions: string[]) => void;
  clearPermissionOverrides: () => void;
  hasAnyPermission: (required?: string[]) => boolean;
  hasRole: (roles?: UserRole[]) => boolean;
  hasBranchAccess: (branchId?: string) => boolean;
  isAdmin: boolean;
  isTrainer: boolean;
  isMember: boolean;
};

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
};

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isSessionReady, setIsSessionReady] = useState(false);
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [activeBranchId, setActiveBranchId] = useState<string>(
    defaultUser.defaultBranchId,
  );
  const [permissionOverrides, setPermissionOverrides] = useState<Partial<Record<UserRole, string[]>>>({});

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const storedUserId = window.localStorage.getItem(storageKeys.userId);
      const storedToken = window.localStorage.getItem(storageKeys.token);
      const storedBranchId = window.localStorage.getItem(storageKeys.branchId);
      const storedPermissionOverrides = window.localStorage.getItem(storageKeys.permissionOverrides);
      const storedUser = storedUserId ? mockUsers[storedUserId] : undefined;

      if (storedUser && storedToken) {
        setSessionUserId(storedUser.id);
        setSessionToken(storedToken);
        setActiveBranchId(
          storedBranchId && storedUser.branchAccess.includes(storedBranchId)
            ? storedBranchId
            : storedUser.defaultBranchId,
        );
      }

      if (storedPermissionOverrides) {
        try {
          const parsedOverrides = JSON.parse(storedPermissionOverrides) as Partial<Record<UserRole, string[]>>;
          setPermissionOverrides({
            owner: ["*"],
            ...(Array.isArray(parsedOverrides.staff) ? { staff: parsedOverrides.staff } : {}),
            ...(Array.isArray(parsedOverrides.trainer) ? { trainer: parsedOverrides.trainer } : {}),
            ...(Array.isArray(parsedOverrides.member) ? { member: parsedOverrides.member } : {}),
          });
        } catch {
          window.localStorage.removeItem(storageKeys.permissionOverrides);
        }
      }

      setIsSessionReady(true);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const isAuthenticated = Boolean(sessionUserId && sessionToken);
  const currentUser = sessionUserId ? mockUsers[sessionUserId] ?? defaultUser : defaultUser;
  const currentRole = currentUser.role;
  const permissions = useMemo(
    () => (isAuthenticated ? permissionOverrides[currentRole] ?? currentUser.permissions : []),
    [currentRole, currentUser.permissions, isAuthenticated, permissionOverrides],
  );
  const branchAccess = useMemo(
    () => (isAuthenticated ? currentUser.branchAccess : []),
    [currentUser, isAuthenticated],
  );
  const accessibleBranches = useMemo(
    () => mockBranches.filter((branch) => branchAccess.includes(branch.id)),
    [branchAccess],
  );
  const normalizedBranchId = currentUser.branchAccess.includes(activeBranchId)
    ? activeBranchId
    : currentUser.defaultBranchId;
  const activeBranch =
    mockBranches.find((branch) => branch.id === normalizedBranchId) ?? mockBranches[0];

  const loginAsUser = useCallback((userId: string) => {
    const nextUser = mockUsers[userId];
    if (!nextUser) return;

    const nextToken = `demo-token-${nextUser.id}`;
    setSessionUserId(nextUser.id);
    setSessionToken(nextToken);
    setActiveBranchId(nextUser.defaultBranchId);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(storageKeys.userId, nextUser.id);
      window.localStorage.setItem(storageKeys.token, nextToken);
      window.localStorage.setItem(storageKeys.branchId, nextUser.defaultBranchId);
    }
  }, []);

  const logout = useCallback(() => {
    setSessionUserId(null);
    setSessionToken(null);
    setActiveBranchId(defaultUser.defaultBranchId);

    if (typeof window !== "undefined") {
      window.localStorage.removeItem(storageKeys.userId);
      window.localStorage.removeItem(storageKeys.token);
      window.localStorage.removeItem(storageKeys.branchId);
    }
  }, []);

  const refreshSession = useCallback(() => {
    if (!sessionUserId) return;

    const nextToken = `demo-token-${sessionUserId}-refreshed`;
    setSessionToken(nextToken);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(storageKeys.token, nextToken);
    }
  }, [sessionUserId]);

  const setActiveBranch = useCallback((branchId: string) => {
    setActiveBranchId((currentBranchId) => {
      const nextBranchId = currentUser.branchAccess.includes(branchId)
        ? branchId
        : currentBranchId;

      if (typeof window !== "undefined") {
        window.localStorage.setItem(storageKeys.branchId, nextBranchId);
      }

      return nextBranchId;
    });
  }, [currentUser.branchAccess]);

  const setRole = useCallback((role: UserRole) => {
    const nextUser = mockLoginUsers.find((user) => user.role === role);
    if (nextUser) loginAsUser(nextUser.id);
  }, [loginAsUser]);

  const setRolePermissionOverride = useCallback((role: UserRole, nextPermissions: string[]) => {
    setPermissionOverrides((currentOverrides) => {
      const nextOverrides = {
        ...currentOverrides,
        [role]: Array.from(new Set(nextPermissions)),
      };

      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          storageKeys.permissionOverrides,
          JSON.stringify(nextOverrides),
        );
      }

      return nextOverrides;
    });
  }, []);

  const clearPermissionOverrides = useCallback(() => {
    setPermissionOverrides({});
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(storageKeys.permissionOverrides);
    }
  }, []);

  const hasAnyPermission = useCallback((required?: string[]) => {
    if (!isAuthenticated) return false;
    if (!required || required.length === 0) return true;
    if (permissions.includes("*")) return true;
    return required.some((permission) => permissions.includes(permission));
  }, [isAuthenticated, permissions]);

  const hasRole = useCallback((roles?: UserRole[]) => {
    if (!isAuthenticated) return false;
    if (!roles || roles.length === 0) return true;
    return roles.includes(currentRole);
  }, [currentRole, isAuthenticated]);

  const hasBranchAccess = useCallback((branchId?: string) => {
    if (!isAuthenticated) return false;
    if (!branchId) return true;
    return currentUser.branchAccess.includes(branchId);
  }, [currentUser.branchAccess, isAuthenticated]);

  const value = useMemo(
    () => ({
      currentRole,
      currentUser,
      currentRoleLabel: roleLabels[currentRole],
      permissions,
      isAuthenticated,
      isSessionReady,
      sessionToken,
      activeBranch,
      accessibleBranches,
      branchAccess,
      loginAsUser,
      logout,
      refreshSession,
      setActiveBranch,
      setRole,
      setRolePermissionOverride,
      clearPermissionOverrides,
      hasAnyPermission,
      hasRole,
      hasBranchAccess,
      isAdmin: currentRole === "owner" || currentRole === "staff",
      isTrainer: currentRole === "trainer",
      isMember: currentRole === "member",
    }),
    [
      currentRole,
      currentUser,
      permissions,
      isAuthenticated,
      isSessionReady,
      sessionToken,
      activeBranch,
      accessibleBranches,
      branchAccess,
      loginAsUser,
      logout,
      refreshSession,
      setActiveBranch,
      setRole,
      setRolePermissionOverride,
      clearPermissionOverrides,
      hasAnyPermission,
      hasRole,
      hasBranchAccess,
    ],
  );

  return (
    <RoleContext.Provider value={value}>
      {children}
    </RoleContext.Provider>
  );
};
