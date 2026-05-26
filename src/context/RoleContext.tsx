"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

export type UserRole = "admin" | "member" | "trainer";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  membershipType?: string;
  membershipExpiry?: string;
  phone?: string;
}

const mockUsers: Record<UserRole, User> = {
  admin: {
    id: "admin-001",
    name: "Budi Santoso",
    email: "budi@sevengym.id",
    avatar: "/images/user/user-01.jpg",
    role: "admin",
    phone: "+62 812 3456 7890",
  },
  member: {
    id: "member-001",
    name: "Andi Wijaya",
    email: "andi@email.com",
    avatar: "/images/user/user-02.jpg",
    role: "member",
    membershipType: "Premium",
    membershipExpiry: "2025-03-15",
    phone: "+62 813 1234 5678",
  },
  trainer: {
    id: "trainer-001",
    name: "Dimas Pratama",
    email: "dimas@sevengym.id",
    avatar: "/images/user/user-03.jpg",
    role: "trainer",
    phone: "+62 815 9876 5432",
  },
};

type RoleContextType = {
  currentRole: UserRole;
  currentUser: User;
  setRole: (role: UserRole) => void;
  isAdmin: boolean;
  isMember: boolean;
  isTrainer: boolean;
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
  const [currentRole, setCurrentRole] = useState<UserRole>("admin");
  const [currentUser, setCurrentUser] = useState<User>(mockUsers.admin);

  useEffect(() => {
    const savedRole = localStorage.getItem("gym-role") as UserRole | null;
    if (savedRole && mockUsers[savedRole]) {
      setCurrentRole(savedRole);
      setCurrentUser(mockUsers[savedRole]);
    }
  }, []);

  const setRole = (role: UserRole) => {
    setCurrentRole(role);
    setCurrentUser(mockUsers[role]);
    localStorage.setItem("gym-role", role);
  };

  return (
    <RoleContext.Provider
      value={{
        currentRole,
        currentUser,
        setRole,
        isAdmin: currentRole === "admin",
        isMember: currentRole === "member",
        isTrainer: currentRole === "trainer",
      }}
    >
      {children}
    </RoleContext.Provider>
  );
};
