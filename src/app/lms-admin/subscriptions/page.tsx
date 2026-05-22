"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/lms/AppShell";
import SectionCard from "@/components/lms/SectionCard";
import {
  BadgeCheck,
  CheckCircle2,
  Clock3,
  Eye,
  RefreshCw,
  Search,
  Wallet,
  XCircle,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type SubscriptionItem = {
  id: string;
  name: string;

  department_id?: string | null;
  department_name?: string | null;

  budget_amount?: number;
  max_learners?: number;

  start_date?: string | null;
  end_date?: string | null;

  status: string;
  note?: string | null;

  created_at?: string;
  updated_at?: string;
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

function getToken() {
  return localStorage.getItem("token") || getCookie("token");
}

function formatCurrency(value?: number) {
  return `${Number(value || 0).toLocaleString("vi-VN")} VNĐ`;
}

function formatDate(value?: string | null) {
  if (!value) return "Không giới hạn";

  return new Date(value).toLocaleDateString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
  });
}

function getStatusLabel(status: string) {
  if (status === "active") return "Đang hoạt động";
  if (status === "pending") return "Chờ duyệt";
  if (status === "rejected") return "Từ chối";

  return status || "Không rõ";
}

function getStatusClass(status: string) {
  if (status === "active") {
    return "bg-green-100 text-green-700 border border-green-200";
  }

  if (status === "rejected") {
    return "bg-red-100 text-red-700 border border-red-200";
  }

  return "bg-orange-100 text-orange-700 border border-orange-200";
}

export default function LMSAdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>([]);

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
        subscriptions
          .map((item) => item.department_name)
          .filter(Boolean) as string[]
      )
    );
  }, [subscriptions]);

  const filteredSubscriptions = useMemo(() => {
    const value = keyword.trim().toLowerCase();

    return subscriptions.filter((item) => {
      const matchKeyword =
        !value ||
        item.name?.toLowerCase().includes(value) ||
        item.department_name?.toLowerCase().includes(value);

      const matchStatus =
        !statusFilter || item.status === statusFilter;

      const matchDepartment =
        !departmentFilter ||
        item.department_name === departmentFilter;

      return matchKeyword && matchStatus && matchDepartment;
    });
  }, [
    subscriptions,
    keyword,
    statusFilter,
    departmentFilter,
  ]);

  const stats = useMemo(() => {
    return {
      total: subscriptions.length,

      active: subscriptions.filter(
        (item) => item.status === "active"
      ).length,

      pending: subscriptions.filter(
        (item) => item.status === "pending"
      ).length,

      totalBudget: subscriptions.reduce(
        (sum, item) => sum + Number(item.budget_amount || 0),
        0
      ),
    };
  }, [subscriptions]);

  async function fetchSubscriptions() {
    try {
      setLoading(true);
      setMessage("");

      const token = getToken();

      if (!token) {
        throw new Error("Không tìm thấy token đăng nhập");
      }

      const response = await fetch(
        `${API_URL}/subscriptions`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Không lấy được danh sách subscription"
        );
      }

      setSubscriptions(data.subscriptions || []);
    } catch (error) {
      setMessageType("error");

      setMessage(
        error instanceof Error
          ? error.message
          : "Không lấy được subscription"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(item: SubscriptionItem) {
    try {
      setUpdatingId(item.id);
      setMessage("");

      const token = getToken();

      const response = await fetch(
        `${API_URL}/subscriptions/${item.id}/approve`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Duyệt subscription thất bại"
        );
      }

      setMessageType("success");
      setMessage("Duyệt subscription thành công");

      await fetchSubscriptions();
    } catch (error) {
      setMessageType("error");

      setMessage(
        error instanceof Error
          ? error.message
          : "Duyệt thất bại"
      );
    } finally {
      setUpdatingId("");
    }
  }

  async function handleReject(item: SubscriptionItem) {
    try {
      setUpdatingId(item.id);
      setMessage("");

      const token = getToken();

      const response = await fetch(
        `${API_URL}/subscriptions/${item.id}/reject`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Từ chối subscription thất bại"
        );
      }

      setMessageType("success");
      setMessage("Đã từ chối subscription");

      await fetchSubscriptions();
    } catch (error) {
      setMessageType("error");

      setMessage(
        error instanceof Error
          ? error.message
          : "Reject thất bại"
      );
    } finally {
      setUpdatingId("");
    }
  }

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  return (
    <AppShell workspace="lms-admin" title="Duyệt subscription">
      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
            <div>
              <p className="text-sm font-semibold text-orange-600">
                Subscription Approval
              </p>

              <h1 className="mt-2 text-3xl font-bold text-slate-950">
                Quản lý gói subscription đào tạo
              </h1>

              <p className="mt-2 text-slate-500">
                Theo dõi, phê duyệt và kiểm soát các gói
                đào tạo nội bộ trong hệ thống LMS.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchSubscriptions}
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
            <BadgeCheck
              className="text-orange-600"
              size={24}
            />

            <p className="mt-3 text-3xl font-bold text-slate-950">
              {stats.total}
            </p>

            <p className="text-sm text-slate-500">
              Tổng subscription
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <CheckCircle2
              className="text-green-600"
              size={24}
            />

            <p className="mt-3 text-3xl font-bold text-slate-950">
              {stats.active}
            </p>

            <p className="text-sm text-slate-500">
              Đang hoạt động
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Clock3
              className="text-orange-600"
              size={24}
            />

            <p className="mt-3 text-3xl font-bold text-slate-950">
              {stats.pending}
            </p>

            <p className="text-sm text-slate-500">
              Chờ duyệt
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Wallet
              className="text-orange-600"
              size={24}
            />

            <p className="mt-3 text-3xl font-bold text-slate-950">
              {(stats.totalBudget / 1000000).toFixed(0)}M
            </p>

            <p className="text-sm text-slate-500">
              Ngân sách đào tạo
            </p>
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

        <SectionCard title="Bộ lọc subscription">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_240px_240px]">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <Search
                size={18}
                className="text-slate-400"
              />

              <input
                value={keyword}
                onChange={(event) =>
                  setKeyword(event.target.value)
                }
                placeholder="Tìm subscription..."
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>

            <select
              value={departmentFilter}
              onChange={(event) =>
                setDepartmentFilter(event.target.value)
              }
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
            >
              <option value="">
                Tất cả phòng ban
              </option>

              {departments.map((department) => (
                <option
                  key={department}
                  value={department}
                >
                  {department}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
            >
              <option value="">
                Tất cả trạng thái
              </option>

              <option value="active">
                Đang hoạt động
              </option>

              <option value="pending">
                Chờ duyệt
              </option>

              <option value="rejected">
                Từ chối
              </option>
            </select>
          </div>
        </SectionCard>

        <SectionCard
          title="Danh sách subscription"
          action="Database"
        >
          <div className="space-y-4">
            {filteredSubscriptions.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-200 bg-white p-5"
              >
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${getStatusClass(
                        item.status
                      )}`}
                    >
                      {getStatusLabel(item.status)}
                    </span>

                    <h3 className="mt-3 text-2xl font-bold text-slate-950">
                      {item.name}
                    </h3>

                    <p className="mt-2 text-slate-500">
                      {item.department_name ||
                        "Toàn hệ thống LMS"}
                    </p>

                    <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                      <div>
                        <p className="text-xs text-slate-400">
                          Ngân sách
                        </p>

                        <p className="font-bold text-slate-900">
                          {formatCurrency(
                            item.budget_amount
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">
                          Học viên tối đa
                        </p>

                        <p className="font-bold text-slate-900">
                          {item.max_learners || 0}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">
                          Ngày bắt đầu
                        </p>

                        <p className="font-bold text-slate-900">
                          {formatDate(
                            item.start_date
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">
                          Ngày kết thúc
                        </p>

                        <p className="font-bold text-slate-900">
                          {formatDate(
                            item.end_date
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button className="rounded-xl border border-slate-200 p-3 text-slate-600 hover:bg-slate-50">
                      <Eye size={18} />
                    </button>

                    {item.status === "pending" && (
                      <>
                        <button
                          disabled={
                            updatingId === item.id
                          }
                          onClick={() =>
                            handleApprove(item)
                          }
                          className="rounded-xl border border-green-200 p-3 text-green-600 hover:bg-green-50 disabled:opacity-50"
                        >
                          <CheckCircle2 size={18} />
                        </button>

                        <button
                          disabled={
                            updatingId === item.id
                          }
                          onClick={() =>
                            handleReject(item)
                          }
                          className="rounded-xl border border-red-200 p-3 text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          <XCircle size={18} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {filteredSubscriptions.length === 0 &&
              !loading && (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-500">
                  Chưa có subscription nào.
                </div>
              )}
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}