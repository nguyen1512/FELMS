"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap } from "lucide-react";

import { menuByWorkspace, workspaceLabels } from "@/data/menu";
import type { Workspace } from "@/types/lms";

type Props = {
  workspace: Workspace;
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

function readRoleCode() {
  try {
    if (typeof window === "undefined") return null;

    const localUser = localStorage.getItem("user");
    const cookieUser = getCookie("user");
    const rawUser = localUser || cookieUser;

    if (!rawUser) return null;

    const user = JSON.parse(decodeURIComponent(rawUser));
    return user?.roles?.[0]?.code || null;
  } catch {
    return null;
  }
}

function canShowWorkspace(roleCode: string | null, workspace: Workspace) {
  if (roleCode === "SUPER_ADMIN") return true;

  if (roleCode === "LMS_ADMIN") {
    return workspace === "lms-admin" || workspace === "employee";
  }

  if (roleCode === "EMPLOYEE") {
    return workspace === "employee";
  }

  return false;
}

/**
 * Sửa riêng link "Khóa đang học" của học viên.
 * Tránh bị nhảy sang /courses của quản trị hoặc route chung.
 */
function getFixedHref(workspace: Workspace, label: string, href: string) {
  if (workspace === "employee" && label === "Khóa đang học") {
    return "/employee/courses";
  }

  return href;
}

export default function Sidebar({ workspace }: Props) {
  const pathname = usePathname();

  const [mounted, setMounted] = useState(false);
  const [roleCode, setRoleCode] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    setRoleCode(readRoleCode());
  }, []);

  if (!mounted) {
    return (
      <aside className="fixed left-0 top-0 h-screen w-[280px] bg-[#2f373f]" />
    );
  }

  if (!canShowWorkspace(roleCode, workspace)) {
    return null;
  }

  const menuGroups = menuByWorkspace[workspace] || [];

  function isActive(itemHref: string, itemLabel: string) {
    const fixedHref = getFixedHref(workspace, itemLabel, itemHref);

    if (workspace === "employee") {
      if (
        itemLabel === "Khóa đang học" &&
        [
          "/employee/courses",
          "/employee/course-detail",
          "/employee/learning",
          "/employee/quiz",
          "/employee/certificate",
        ].some((path) => pathname.startsWith(path))
      ) {
        return true;
      }

      if (pathname === "/employee") {
        return itemLabel === "Dashboard";
      }

      return pathname === fixedHref;
    }

    if (workspace === "lms-admin") {
      if (pathname === "/lms-admin") {
        return itemLabel === "Dashboard";
      }

      return pathname === fixedHref && fixedHref !== "/lms-admin";
    }

    if (workspace === "admin") {
      if (pathname === "/admin") {
        return itemLabel === "Dashboard";
      }

      return pathname === fixedHref && fixedHref !== "/admin";
    }

    return pathname === fixedHref;
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-[280px] overflow-y-auto bg-[#2f373f] px-4 py-5 text-white">
      <div className="mb-6 flex items-center gap-3 rounded-2xl bg-white/10 p-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500">
          <GraduationCap size={22} />
        </div>

        <div>
          <h2 className="text-lg font-bold">ANU LMS</h2>
          <p className="text-xs text-slate-300">
            {workspaceLabels[workspace]}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {menuGroups.map((group) => (
          <div key={group.title}>
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
              {group.title}
            </p>

            <div className="space-y-2">
              {group.items.map((item) => {
                const Icon = item.icon;
                const fixedHref = getFixedHref(
                  workspace,
                  item.label,
                  item.href
                );
                const active = isActive(item.href, item.label);

                return (
                  <Link
                    key={`${group.title}-${item.label}`}
                    href={fixedHref}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                      active
                        ? "bg-orange-500 text-white shadow-lg shadow-orange-950/20"
                        : "text-slate-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}