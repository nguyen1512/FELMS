"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/lms/AppShell";
import SectionCard from "@/components/lms/SectionCard";
import {
  CheckCircle2,
  KeyRound,
  Save,
  Search,
  ShieldCheck,
  UserCog,
  Users,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type RoleItem = {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  created_at?: string;
};

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

function getRoleClass(code: string) {
  if (code === "SUPER_ADMIN") return "bg-red-100 text-red-700 border border-red-200";
  if (code === "LMS_ADMIN") return "bg-orange-100 text-orange-700 border border-orange-200";
  return "bg-slate-100 text-slate-700 border border-slate-200";
}

export default function AdminRolesPage() {
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [permissions, setPermissions] = useState<PermissionItem[]>([]);
  const [selectedRole, setSelectedRole] = useState<RoleItem | null>(null);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");

  const groupedPermissions = useMemo(() => {
    return permissions.reduce<Record<string, PermissionItem[]>>((groups, permission) => {
      const moduleName = permission.module || "Khác";
      if (!groups[moduleName]) groups[moduleName] = [];
      groups[moduleName].push(permission);
      return groups;
    }, {});
  }, [permissions]);

  async function fetchRoles() {
    const token = getToken();
    if (!token) throw new Error("Không tìm thấy token đăng nhập.");

    const response = await fetch(`${API_URL}/roles`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Không lấy được vai trò");

    setRoles(data.roles || []);

    if (!selectedRole && data.roles?.length) {
      setSelectedRole(data.roles[0]);
      await fetchRolePermissions(data.roles[0].id);
    }
  }

  async function fetchPermissions() {
    const token = getToken();
    if (!token) throw new Error("Không tìm thấy token đăng nhập.");

    const response = await fetch(`${API_URL}/roles/permissions`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Không lấy được quyền");

    setPermissions(data.permissions || []);
  }

  async function fetchRolePermissions(roleId: string) {
    const token = getToken();
    if (!token) throw new Error("Không tìm thấy token đăng nhập.");

    const response = await fetch(`${API_URL}/roles/${roleId}/permissions`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Không lấy được quyền của vai trò");
    }

    setSelectedPermissionIds(data.permissionIds || []);
  }

  async function handleSelectRole(role: RoleItem) {
    try {
      setSelectedRole(role);
      setMessage("");
      await fetchRolePermissions(role.id);
    } catch (error) {
      setMessageType("error");
      setMessage(error instanceof Error ? error.message : "Không lấy được quyền");
    }
  }

  function togglePermission(permissionId: string) {
    setSelectedPermissionIds((current) =>
      current.includes(permissionId)
        ? current.filter((id) => id !== permissionId)
        : [...current, permissionId]
    );
  }

  async function handleSavePermissions() {
    if (!selectedRole) return;

    try {
      setSaving(true);
      setMessage("");

      const token = getToken();
      if (!token) throw new Error("Không tìm thấy token đăng nhập.");

      const response = await fetch(`${API_URL}/roles/${selectedRole.id}/permissions`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          permissionIds: selectedPermissionIds,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Lưu phân quyền thất bại");
      }

      setMessageType("success");
      setMessage("Cập nhật phân quyền thành công.");
    } catch (error) {
      setMessageType("error");
      setMessage(error instanceof Error ? error.message : "Lưu phân quyền thất bại");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        await fetchPermissions();
        await fetchRoles();
      } catch (error) {
        setMessageType("error");
        setMessage(error instanceof Error ? error.message : "Không tải được dữ liệu phân quyền");
      } finally {
        setLoading(false);
      }
    }

    init();
  }, []);

  return (
    <AppShell workspace="admin" title="Quản lý vai trò">
      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-orange-600">Role & Permission</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            Quản lý vai trò và phân quyền
          </h1>
          <p className="mt-2 text-slate-500">
            Chọn vai trò, tick các quyền được phép sử dụng và lưu lại vào database.
          </p>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <UserCog className="text-orange-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">{roles.length}</p>
            <p className="text-sm text-slate-500">Vai trò hệ thống</p>
          </div>

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
              {selectedPermissionIds.length}
            </p>
            <p className="text-sm text-slate-500">Quyền đang chọn</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Users className="text-orange-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {loading ? "..." : "Active"}
            </p>
            <p className="text-sm text-slate-500">Trạng thái module</p>
          </div>
        </section>

        {message && (
          <div
            className={`rounded-xl px-4 py-3 text-sm font-semibold ${
              messageType === "success"
                ? "border border-green-200 bg-green-50 text-green-700"
                : "border border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[380px_1fr]">
          <SectionCard title="Danh sách vai trò">
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <Search size={18} className="text-slate-400" />
              <input
                placeholder="Tìm vai trò..."
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>

            <div className="space-y-3">
              {roles.map((role) => {
                const active = selectedRole?.id === role.id;

                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => handleSelectRole(role)}
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      active
                        ? "border-orange-400 bg-orange-50"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-slate-950">{role.name}</h3>
                        <p className="mt-1 text-xs text-slate-500">{role.code}</p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${getRoleClass(
                          role.code
                        )}`}
                      >
                        {active ? "Đang chọn" : "Role"}
                      </span>
                    </div>

                    <p className="mt-3 text-sm leading-6 text-slate-500">
                      {role.description || "Chưa có mô tả"}
                    </p>
                  </button>
                );
              })}
            </div>
          </SectionCard>

          <SectionCard
            title={
              selectedRole
                ? `Phân quyền cho: ${selectedRole.name}`
                : "Ma trận phân quyền"
            }
            action={loading ? "Đang tải..." : "Database"}
          >
            <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-sm text-slate-500">Vai trò đang cấu hình</p>
                <p className="text-xl font-bold text-slate-950">
                  {selectedRole?.name || "Chưa chọn vai trò"}
                </p>
              </div>

              <button
                type="button"
                onClick={handleSavePermissions}
                disabled={!selectedRole || saving}
                className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save size={18} />
                {saving ? "Đang lưu..." : "Lưu phân quyền"}
              </button>
            </div>

            <div className="space-y-5">
              {Object.entries(groupedPermissions).map(([moduleName, items]) => (
                <div
                  key={moduleName}
                  className="rounded-2xl border border-slate-200 bg-white p-5"
                >
                  <div className="mb-4 flex items-center gap-2">
                    <CheckCircle2 className="text-orange-600" size={20} />
                    <h3 className="font-bold text-slate-950">{moduleName}</h3>
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {items.map((permission) => {
                      const checked = selectedPermissionIds.includes(permission.id);

                      return (
                        <label
                          key={permission.id}
                          className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                            checked
                              ? "border-orange-300 bg-orange-50"
                              : "border-slate-200 bg-slate-50 hover:bg-white"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => togglePermission(permission.id)}
                            className="mt-1 h-4 w-4 accent-orange-500"
                          />

                          <div>
                            <p className="font-bold text-slate-950">
                              {permission.name}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {permission.code}
                            </p>
                            {permission.description && (
                              <p className="mt-2 text-sm leading-6 text-slate-500">
                                {permission.description}
                              </p>
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}

              {permissions.length === 0 && !loading && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
                  Chưa có quyền nào trong database.
                </div>
              )}
            </div>
          </SectionCard>
        </div>
      </div>
    </AppShell>
  );
}