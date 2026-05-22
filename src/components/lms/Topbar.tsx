"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, Grid3X3, LogOut, Search, UserCircle } from "lucide-react";
import { workspaceLabels } from "@/data/menu";
import type { Workspace } from "@/types/lms";

type Props = {
  workspace: Workspace;
  title: string;
};

type CurrentUser = {
  id?: string;
  fullName?: string;
  full_name?: string;
  email?: string;
  departmentName?: string | null;
  roles?: {
    code: string;
    name: string;
  }[];
};

function getCookie(name: string) {
  if (typeof document === "undefined") return null;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() || null;
  }

  return null;
}

function readCurrentUser(): CurrentUser | null {
  try {
    const localUser = localStorage.getItem("user");
    const cookieUser = getCookie("user");
    const rawUser = localUser || cookieUser;

    if (!rawUser) return null;

    return JSON.parse(decodeURIComponent(rawUser));
  } catch {
    return null;
  }
}

function getRoleLabel(roleCode?: string) {
  if (roleCode === "SUPER_ADMIN") return "Admin hệ thống";
  if (roleCode === "LMS_ADMIN") return "Quản trị LMS";
  if (roleCode === "EMPLOYEE") return "Nhân viên";
  return "Người dùng";
}

export default function Topbar({ workspace }: Props) {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    setMounted(true);
    setUser(readCurrentUser());
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    document.cookie = "token=; Max-Age=0; path=/";
    document.cookie = "user=; Max-Age=0; path=/";

    window.location.href = "/login";
  }

  const roleCode = user?.roles?.[0]?.code;
  const displayName =
    user?.fullName || user?.full_name || user?.email || "AnU User";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div className="flex items-center gap-4">
        <Link href="/" className="font-bold text-orange-600">
          {workspaceLabels[workspace]}
        </Link>

        <div className="hidden w-[360px] items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 md:flex">
          <Search size={17} className="text-slate-400" />

          <input
            placeholder="Tìm kiếm khóa học, nhân sự, báo cáo..."
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="rounded-xl border border-slate-200 p-2 hover:bg-slate-50">
          <Bell size={18} />
        </button>

        <button className="rounded-xl border border-slate-200 p-2 hover:bg-slate-50">
          <Grid3X3 size={18} />
        </button>

        <div className="flex items-center gap-2 rounded-xl bg-orange-50 px-3 py-2 text-sm font-semibold text-orange-700">
          <UserCircle size={18} />

          <div className="leading-tight">
            <p className="max-w-[160px] truncate">
              {mounted ? displayName : "Đang tải..."}
            </p>

            <p className="text-[11px] font-medium text-orange-500">
              {mounted ? getRoleLabel(roleCode) : ""}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-100"
        >
          <LogOut size={17} />
          Đăng xuất
        </button>
      </div>
    </header>
  );
}