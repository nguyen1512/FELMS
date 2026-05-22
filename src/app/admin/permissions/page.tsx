"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/lms/AppShell";
import SectionCard from "@/components/lms/SectionCard";
import {
  CheckCircle2,
  KeyRound,
  Lock,
  Search,
  ShieldCheck,
  UserCog,
  Users,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type PermissionItem = {
  id: string;
  code: string;
  name: string;
  module: string;
  description?: string | null;
};

function getCookie(name: string) {
  if (typeof document === "undefined") return null;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;

  return null;
}

function getToken() {
  return localStorage.getItem("token") || getCookie("token");
}

function getModuleClass(module: string) {
  if (module === "USERS") return "bg-blue-100 text-blue-700 border border-blue-200";
  if (module === "DEPARTMENTS") return "bg-green-100 text-green-700 border border-green-200";
  if (module === "ROLES") return "bg-orange-100 text-orange-700 border border-orange-200";
  if (module === "AUDIT") return "bg-purple-100 text-purple-700 border border-purple-200";

  return "bg-slate-100 text-slate-700 border border-slate-200";
}

function getModuleIcon(module: string) {
  if (module === "USERS") return Users;
  if (module === "DEPARTMENTS") return UserCog;
  if (module === "ROLES") return ShieldCheck;
  if (module === "AUDIT") return Lock;

  return KeyRound;
}

export default function AdminPermissionsPage() {
  const [permissions, setPermissions] = useState<PermissionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [message, setMessage] = useState("");

  const filteredPermissions = useMemo(() => {
    const value = keyword.trim().toLowerCase();

    if (!value) return permissions;

    return permissions.filter((item) => {
      return (
        item.code?.toLowerCase().includes(value) ||
        item.name?.toLowerCase().includes(value) ||
        item.module?.toLowerCase().includes(value) ||
        item.description?.toLowerCase().includes(value)
      );
    });
  }, [permissions, keyword]);

  const groupedModules = useMemo(() => {
    return permissions.reduce<Record<string, PermissionItem[]>>((groups, item) => {
      const moduleName = item.module || "SYSTEM";

      if (!groups[moduleName]) groups[moduleName] = [];

      groups[moduleName].push(item);

      return groups;
    }, {});
  }, [permissions]);

  async function fetchPermissions() {
    try {
      setLoading(true);
      setMessage("");

      const token = getToken();

      if (!token) {
        throw new Error("Không tìm thấy token đăng nhập.");
      }

      const response = await fetch(`${API_URL}/roles/permissions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Không lấy được danh sách quyền");
      }

      setPermissions(data.permissions || []);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Không lấy được danh sách quyền"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPermissions();
  }, []);

  return (
    <AppShell workspace="admin" title="Quản lý quyền">
      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
            <div>
              <p className="text-sm font-semibold text-orange-600">
                Permission Management
              </p>

              <h1 className="mt-2 text-3xl font-bold text-slate-950">
                Quản lý quyền hệ thống
              </h1>

              <p className="mt-2 text-slate-500">
                Xem toàn bộ quyền trong hệ thống, phân nhóm theo module và dùng
                làm dữ liệu để gán quyền cho từng vai trò.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchPermissions}
              disabled={loading}
              className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-60"
            >
              {loading ? "Đang tải..." : "Làm mới"}
            </button>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <KeyRound className="text-orange-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {permissions.length}
            </p>
            <p className="text-sm text-slate-500">Tổng quyền</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <ShieldCheck className="text-green-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {Object.keys(groupedModules).length}
            </p>
            <p className="text-sm text-slate-500">Module quyền</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Users className="text-blue-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {permissions.filter((item) => item.module === "USERS").length}
            </p>
            <p className="text-sm text-slate-500">Quyền nhân sự</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Lock className="text-red-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {permissions.filter((item) => item.module === "ROLES").length}
            </p>
            <p className="text-sm text-slate-500">Quyền phân quyền</p>
          </div>
        </section>

        {message && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {message}
          </div>
        )}

        <SectionCard title="Nhóm quyền theo module">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {Object.entries(groupedModules).map(([moduleName, items]) => {
              const Icon = getModuleIcon(moduleName);

              return (
                <div
                  key={moduleName}
                  className="rounded-2xl border border-slate-200 bg-white p-5"
                >
                  <Icon size={24} className="text-orange-600" />

                  <h3 className="mt-3 font-bold text-slate-950">
                    {moduleName}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    {items.length} quyền trong module
                  </p>
                </div>
              );
            })}
          </div>
        </SectionCard>

        <SectionCard title="Bộ lọc quyền">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <Search size={18} className="text-slate-400" />

            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Tìm theo tên quyền, mã quyền, module hoặc mô tả..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
        </SectionCard>

        <SectionCard
          title={
            loading
              ? "Danh sách quyền - Đang tải..."
              : "Danh sách quyền hệ thống"
          }
        >
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="p-4">Tên quyền</th>
                  <th className="p-4">Mã quyền</th>
                  <th className="p-4">Module</th>
                  <th className="p-4">Mô tả</th>
                  <th className="p-4 text-center">Trạng thái</th>
                </tr>
              </thead>

              <tbody>
                {filteredPermissions.map((permission) => (
                  <tr key={permission.id} className="border-t border-slate-100">
                    <td className="p-4">
                      <p className="font-bold text-slate-950">
                        {permission.name}
                      </p>
                    </td>

                    <td className="p-4">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                        {permission.code}
                      </span>
                    </td>

                    <td className="p-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${getModuleClass(
                          permission.module
                        )}`}
                      >
                        {permission.module}
                      </span>
                    </td>

                    <td className="p-4 text-slate-600">
                      {permission.description || "Chưa có mô tả"}
                    </td>

                    <td className="p-4 text-center">
                      <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                        <CheckCircle2 size={14} />
                        Đang dùng
                      </span>
                    </td>
                  </tr>
                ))}

                {filteredPermissions.length === 0 && !loading && (
                  <tr>
                    <td className="p-6 text-center text-slate-500" colSpan={5}>
                      Chưa có quyền nào trong hệ thống.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}