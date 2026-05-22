"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/lms/AppShell";
import SectionCard from "@/components/lms/SectionCard";
import {
  CheckCircle2,
  Eye,
  RefreshCw,
  Search,
  UserCheck,
  UserRoundX,
  Users,
  XCircle,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type RegistrationItem = {
  id: string;
  user_id: string;
  course_id: string;
  request_type: string;
  status: string;
  note?: string | null;
  created_at?: string;
  updated_at?: string;

  full_name: string;
  email: string;
  position?: string | null;
  department_name?: string | null;

  course_title: string;
  course_level?: string | null;
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

function formatDate(value?: string) {
  if (!value) return "Không rõ";
  return new Date(value).toLocaleDateString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
  });
}

function getStatusLabel(status: string) {
  if (status === "pending") return "Chờ duyệt";
  if (status === "approved") return "Đã duyệt";
  if (status === "rejected") return "Từ chối";
  return status || "Không rõ";
}

function getStatusClass(status: string) {
  if (status === "approved") {
    return "bg-green-100 text-green-700 border border-green-200";
  }

  if (status === "rejected") {
    return "bg-red-100 text-red-700 border border-red-200";
  }

  return "bg-orange-100 text-orange-700 border border-orange-200";
}

function getRequestTypeLabel(type: string) {
  if (type === "required") return "Bắt buộc";
  if (type === "optional") return "Tự chọn";
  return type || "Tự chọn";
}

export default function LMSAdminRegistrationsPage() {
  const [registrations, setRegistrations] = useState<RegistrationItem[]>([]);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");

  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success"
  );

  const departments = useMemo(() => {
    return Array.from(
      new Set(
        registrations
          .map((item) => item.department_name)
          .filter(Boolean) as string[]
      )
    );
  }, [registrations]);

  const filteredRegistrations = useMemo(() => {
    const value = keyword.trim().toLowerCase();

    return registrations.filter((item) => {
      const matchKeyword =
        !value ||
        item.full_name?.toLowerCase().includes(value) ||
        item.email?.toLowerCase().includes(value) ||
        item.course_title?.toLowerCase().includes(value) ||
        item.department_name?.toLowerCase().includes(value);

      const matchStatus = !statusFilter || item.status === statusFilter;

      const matchDepartment =
        !departmentFilter || item.department_name === departmentFilter;

      return matchKeyword && matchStatus && matchDepartment;
    });
  }, [registrations, keyword, statusFilter, departmentFilter]);

  const stats = useMemo(() => {
    return {
      total: registrations.length,
      pending: registrations.filter((item) => item.status === "pending").length,
      approved: registrations.filter((item) => item.status === "approved")
        .length,
      rejected: registrations.filter((item) => item.status === "rejected")
        .length,
    };
  }, [registrations]);

  async function fetchRegistrations() {
    try {
      setLoading(true);
      setMessage("");

      const token = getToken();

      if (!token) {
        throw new Error("Không tìm thấy token đăng nhập.");
      }

      const response = await fetch(`${API_URL}/course-registrations`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Không lấy được danh sách đăng ký khóa học"
        );
      }

      setRegistrations(data.registrations || []);
    } catch (error) {
      setMessageType("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Không lấy được danh sách đăng ký khóa học"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(item: RegistrationItem) {
    try {
      setUpdatingId(item.id);
      setMessage("");

      const token = getToken();

      if (!token) {
        throw new Error("Không tìm thấy token đăng nhập.");
      }

      const response = await fetch(
        `${API_URL}/course-registrations/${item.id}/approve`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Duyệt đăng ký thất bại");
      }

      setMessageType("success");
      setMessage("Duyệt đăng ký và ghi danh khóa học thành công.");

      await fetchRegistrations();
    } catch (error) {
      setMessageType("error");
      setMessage(error instanceof Error ? error.message : "Duyệt đăng ký thất bại");
    } finally {
      setUpdatingId("");
    }
  }

  async function handleReject(item: RegistrationItem) {
    try {
      setUpdatingId(item.id);
      setMessage("");

      const token = getToken();

      if (!token) {
        throw new Error("Không tìm thấy token đăng nhập.");
      }

      const response = await fetch(
        `${API_URL}/course-registrations/${item.id}/reject`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            note: "Từ chối bởi quản trị LMS",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Từ chối đăng ký thất bại");
      }

      setMessageType("success");
      setMessage("Từ chối đăng ký khóa học thành công.");

      await fetchRegistrations();
    } catch (error) {
      setMessageType("error");
      setMessage(
        error instanceof Error ? error.message : "Từ chối đăng ký thất bại"
      );
    } finally {
      setUpdatingId("");
    }
  }

  useEffect(() => {
    fetchRegistrations();
  }, []);

  return (
    <AppShell workspace="lms-admin" title="Nhân sự đăng ký">
      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
            <div>
              <p className="text-sm font-semibold text-orange-600">
                Course Registration Approval
              </p>

              <h1 className="mt-2 text-3xl font-bold text-slate-950">
                Quản lý nhân sự đăng ký khóa học
              </h1>

              <p className="mt-2 text-slate-500">
                Theo dõi, duyệt hoặc từ chối các yêu cầu đăng ký khóa học từ
                nhân sự.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchRegistrations}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-60"
            >
              <RefreshCw size={18} />
              {loading ? "Đang tải..." : "Làm mới"}
            </button>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Users className="text-orange-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {stats.total}
            </p>
            <p className="text-sm text-slate-500">Tổng lượt đăng ký</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <UserCheck className="text-orange-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {stats.pending}
            </p>
            <p className="text-sm text-slate-500">Chờ duyệt</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <CheckCircle2 className="text-green-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {stats.approved}
            </p>
            <p className="text-sm text-slate-500">Đã duyệt</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <UserRoundX className="text-red-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {stats.rejected}
            </p>
            <p className="text-sm text-slate-500">Từ chối</p>
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

        <SectionCard title="Bộ lọc đăng ký">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_240px_240px]">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <Search size={18} className="text-slate-400" />

              <input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Tìm nhân viên hoặc khóa học..."
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>

            <select
              value={departmentFilter}
              onChange={(event) => setDepartmentFilter(event.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
            >
              <option value="">Tất cả phòng ban</option>
              {departments.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="pending">Chờ duyệt</option>
              <option value="approved">Đã duyệt</option>
              <option value="rejected">Từ chối</option>
            </select>
          </div>
        </SectionCard>

        <SectionCard
          title={
            loading
              ? "Danh sách yêu cầu đăng ký - Đang tải..."
              : "Danh sách yêu cầu đăng ký"
          }
          action="Database"
        >
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="p-4">Nhân sự</th>
                  <th className="p-4">Phòng ban</th>
                  <th className="p-4">Khóa học</th>
                  <th className="p-4 text-center">Loại</th>
                  <th className="p-4">Ngày đăng ký</th>
                  <th className="p-4 text-center">Trạng thái</th>
                  <th className="p-4 text-right">Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {filteredRegistrations.map((item) => (
                  <tr key={item.id} className="border-t border-slate-100">
                    <td className="p-4">
                      <p className="font-bold text-slate-950">
                        {item.full_name}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {item.email}
                      </p>
                    </td>

                    <td className="p-4 text-slate-600">
                      {item.department_name || "Chưa có"}
                    </td>

                    <td className="p-4">
                      <p className="font-semibold text-slate-800">
                        {item.course_title}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {item.course_level || "Cơ bản"}
                      </p>
                    </td>

                    <td className="p-4 text-center font-bold text-slate-700">
                      {getRequestTypeLabel(item.request_type)}
                    </td>

                    <td className="p-4 text-slate-500">
                      {formatDate(item.created_at)}
                    </td>

                    <td className="p-4 text-center">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${getStatusClass(
                          item.status
                        )}`}
                      >
                        {getStatusLabel(item.status)}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
                          title="Xem chi tiết"
                        >
                          <Eye size={16} />
                        </button>

                        {item.status === "pending" && (
                          <>
                            <button
                              type="button"
                              disabled={updatingId === item.id}
                              onClick={() => handleApprove(item)}
                              className="rounded-lg border border-green-200 p-2 text-green-600 hover:bg-green-50 disabled:opacity-50"
                              title="Duyệt"
                            >
                              <CheckCircle2 size={16} />
                            </button>

                            <button
                              type="button"
                              disabled={updatingId === item.id}
                              onClick={() => handleReject(item)}
                              className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
                              title="Từ chối"
                            >
                              <XCircle size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredRegistrations.length === 0 && !loading && (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-slate-500">
                      Chưa có yêu cầu đăng ký nào.
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