"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { AuthUser, LoginPayload } from "@/types/auth";

type LoginResult = {
  success: boolean;
  message?: string;
  user?: AuthUser | null;
  token?: string;
};

type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<LoginResult>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasRole: (roleCode: string) => boolean;
  hasPermission: (permissionCode: string) => boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  async function refreshUser() {
    try {
      setLoading(true);

      const res = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      if (!res.ok) {
        setUser(null);
        return;
      }

      const data = await res.json();

      const currentUser = data.user ?? null;

      setUser(currentUser);

      if (currentUser) {
        localStorage.setItem("user", JSON.stringify(currentUser));
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(payload: LoginPayload): Promise<LoginResult> {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        return {
          success: false,
          message: data.message || "Đăng nhập thất bại",
          user: null,
        };
      }

      const loggedInUser = data.user ?? null;
      const token = data.token ?? "";

      setUser(loggedInUser);

      if (token) {
        localStorage.setItem("token", token);
      }

      if (loggedInUser) {
        localStorage.setItem("user", JSON.stringify(loggedInUser));
      }

      return {
        success: true,
        user: loggedInUser,
        token,
      };
    } catch {
      return {
        success: false,
        message: "Không kết nối được server",
        user: null,
      };
    }
  }

  async function logout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } finally {
      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
  }

  function hasRole(roleCode: string) {
    return user?.roles?.some((role) => role.role_code === roleCode) ?? false;
  }

  function hasPermission(permissionCode: string) {
    return (
      user?.permissions?.some(
        (permission) => permission.permission_code === permissionCode
      ) ?? false
    );
  }

  useEffect(() => {
    const cachedUser = localStorage.getItem("user");

    if (cachedUser) {
      try {
        setUser(JSON.parse(cachedUser));
      } catch {
        localStorage.removeItem("user");
      }
    }

    refreshUser();
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      logout,
      refreshUser,
      hasRole,
      hasPermission,
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}