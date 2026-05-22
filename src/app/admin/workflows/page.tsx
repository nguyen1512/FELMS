"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/lms/AppShell";
import SectionCard from "@/components/lms/SectionCard";
import {
  Activity,
  Clock3,
  Database,
  FileText,
  RefreshCw,
  Search,
  ShieldCheck,
  UserCircle,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type AuditLog = {
  id: string;
  user_id?: string | null;
  user_name?: string | null;
  user_email?: string | null;
  action: string;
  module: string;
  target_id?: string | null;
  target_type?: string | null;
  description?: string | null;
  created_at: string;
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

function formatDate(value: string) {
  if (!value) return "Không rõ";

  return new Date(value).toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour12: false,
  });
}

function getActionLabel(action: string) {
  const labels: Record<string, string> = {
    CREATE_USER: "Tạo tài khoản",
    UPDATE_USER: "Cập nhật tài khoản",
    LOCK_USER: "Khóa tài khoản",
    UNLOCK_USER: "Mở khóa tài khoản",
    CREATE_DEPARTMENT: "Tạo phòng ban",
    UPDATE_DEPARTMENT: "Cập nhật phòng ban",
    DELETE_DEPARTMENT: "Xóa phòng ban",
    UPDATE_ROLE_PERMISSIONS: "Cập nhật phân quyền",
  };

  return labels[action] || action;
}

function getModuleClass(module: string) {
  if (module === "USERS") return "bg-blue-100 text-blue-700 border border-blue-200";
  if (module === "DEPARTMENTS") return "bg-green-100 text-green-700 border border-green-200";
  if (module === "ROLES") return "bg-orange-100 text-orange-700 border border-orange-200";
  return "bg-slate-100 text-slate-700 border border-slate-200";
}

export default function AdminWorkflowsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [message, setMessage] = useState("");

  const filteredLogs = useMemo(() => {
    const value = keyword.trim().toLowerCase();

    if (!value) return logs;

    return logs.filter((log) => {
      return (
        log.action?.toLowerCase().includes(value) ||
        log.module?.toLowerCase().includes(value) ||
        log.description?.toLowerCase().includes(value) ||
        log.user_name?.toLowerCase().includes(value) ||
        log.user_email?.toLowerCase().includes(value)
      );
    });
  }, [logs, keyword]);

  const stats = useMemo(() => {
    return {
      total: logs.length,
      users: logs.filter((item) => item.module === "USERS").length,
      departments: logs.filter((item) => item.module === "DEPARTMENTS").length,
      roles: logs.filter((item) => item.module === "ROLES").length,
    };
  }, [logs]);

  async function fetchAuditLogs() {
    try {
      setLoading(true);
      setMessage("");

      const token = getToken();

      if (!token) {
        throw new Error("Không tìm thấy token đăng nhập.");
      }

      const response = await fetch(`${API_URL}/audit-logs`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Không lấy được lịch sử thao tác");
      }

      setLogs(data.logs || []);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Không lấy được lịch sử thao tác"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  return (
    <AppShell workspace="admin" title="Lịch sử thao tác">
      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
            <div>
              <p className="text-sm font-semibold text-orange-600">
                Audit Logs
              </p>

              <h1 className="mt-2 text-3xl font-bold text-slate-950">
                Lịch sử thao tác hệ thống
              </h1>

              <p className="mt-2 text-slate-500">
                Theo dõi các thao tác quản trị: tạo tài khoản, chỉnh sửa nhân sự,
                khóa tài khoản, phòng ban và phân quyền.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchAuditLogs}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-60"
            >
              <RefreshCw size={18} />
              {loading ? "Đang tải..." : "Làm mới"}
            </button>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Activity className="text-orange-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {stats.total}
            </p>
            <p className="text-sm text-slate-500">Tổng thao tác</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <UserCircle className="text-blue-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {stats.users}
            </p>
            <p className="text-sm text-slate-500">Thao tác nhân sự</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Database className="text-green-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {stats.departments}
            </p>
            <p className="text-sm text-slate-500">Thao tác phòng ban</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <ShieldCheck className="text-orange-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {stats.roles}
            </p>
            <p className="text-sm text-slate-500">Thao tác phân quyền</p>
          </div>
        </section>

        {message && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {message}
          </div>
        )}

        <SectionCard title="Bộ lọc lịch sử">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <Search size={18} className="text-slate-400" />

            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Tìm theo hành động, module, người thao tác hoặc mô tả..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
        </SectionCard>

        <SectionCard
          title={
            loading
              ? "Danh sách lịch sử - Đang tải..."
              : "Danh sách lịch sử thao tác"
          }
        >
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="p-4">Thời gian</th>
                  <th className="p-4">Người thao tác</th>
                  <th className="p-4">Module</th>
                  <th className="p-4">Hành động</th>
                  <th className="p-4">Mô tả</th>
                </tr>
              </thead>

              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="border-t border-slate-100">
                    <td className="p-4 text-slate-600">
                      <div className="flex items-center gap-2">
                        <Clock3 size={16} className="text-slate-400" />
                        {formatDate(log.created_at)}
                      </div>
                    </td>

                    <td className="p-4">
                      <p className="font-bold text-slate-950">
                        {log.user_name || "System"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {log.user_email || "Không có email"}
                      </p>
                    </td>

                    <td className="p-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${getModuleClass(
                          log.module
                        )}`}
                      >
                        {log.module}
                      </span>
                    </td>

                    <td className="p-4 font-semibold text-slate-700">
                      {getActionLabel(log.action)}
                    </td>

                    <td className="p-4 text-slate-600">
                      <div className="flex items-start gap-2">
                        <FileText
                          size={16}
                          className="mt-0.5 shrink-0 text-slate-400"
                        />
                        <span>{log.description || "Không có mô tả"}</span>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredLogs.length === 0 && !loading && (
                  <tr>
                    <td className="p-6 text-center text-slate-500" colSpan={5}>
                      Chưa có lịch sử thao tác nào.
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