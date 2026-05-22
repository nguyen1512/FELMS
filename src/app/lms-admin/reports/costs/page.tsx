"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/lms/AppShell";
import ProgressBar from "@/components/lms/ProgressBar";
import SectionCard from "@/components/lms/SectionCard";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  CreditCard,
  Download,
  PieChart,
  Search,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

type Summary = {
  totalBudget: number;
  totalUsed: number;
  costPerLearner: number;
  completionEfficiency: number;
};

type DepartmentCost = {
  departmentId: string | null;
  departmentName: string;
  budgetAmount: number;
  usedAmount: number;
  learnerCount: number;
  costPerLearner: number;
  budgetUsageRate: number;
  completionRate: number;
  status: string;
};

type MonthlyTrend = {
  month: string;
  monthNumber: number;
  value: number;
};

type CourseCost = {
  courseId: string | null;
  courseName: string;
  courseType: string;
  usedAmount: number;
  learnerCount: number;
  costPerLearner: number;
  completionRate: number;
  roi: string;
};

type TrainingCostReport = {
  summary: Summary;
  departments: DepartmentCost[];
  monthlyTrend: MonthlyTrend[];
  courseCosts: CourseCost[];
};

const defaultReport: TrainingCostReport = {
  summary: {
    totalBudget: 0,
    totalUsed: 0,
    costPerLearner: 0,
    completionEfficiency: 0,
  },
  departments: [],
  monthlyTrend: [],
  courseCosts: [],
};

function formatMoney(value: number) {
  if (!Number.isFinite(value)) return "0đ";

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatCompactMoney(value: number) {
  if (!Number.isFinite(value) || value === 0) return "0";

  if (Math.abs(value) >= 1_000_000_000) {
    return `${Number((value / 1_000_000_000).toFixed(1))}B`;
  }

  if (Math.abs(value) >= 1_000_000) {
    return `${Number((value / 1_000_000).toFixed(1))}M`;
  }

  if (Math.abs(value) >= 1_000) {
    return `${Number((value / 1_000).toFixed(1))}K`;
  }

  return String(value);
}

function normalizeStatus(
  status?: string
): "Hiệu quả" | "Ổn định" | "Cần theo dõi" {
  const value = String(status || "").toLowerCase();

  if (
    value === "cao" ||
    value === "high" ||
    value === "good" ||
    value === "efficient" ||
    value === "effective" ||
    value === "success" ||
    value.includes("hiệu quả") ||
    value.includes("hieu qua")
  ) {
    return "Hiệu quả";
  }

  if (
    value === "trung bình" ||
    value === "trung binh" ||
    value === "medium" ||
    value === "normal" ||
    value === "stable" ||
    value === "ổn định" ||
    value === "on dinh" ||
    value.includes("ổn định") ||
    value.includes("on dinh")
  ) {
    return "Ổn định";
  }

  if (
    value === "thấp" ||
    value === "thap" ||
    value === "low" ||
    value === "warning" ||
    value === "risk" ||
    value === "watch" ||
    value.includes("theo dõi") ||
    value.includes("theo doi")
  ) {
    return "Cần theo dõi";
  }

  return "Ổn định";
}

function getStatusClass(status: string) {
  const label = normalizeStatus(status);

  if (label === "Hiệu quả") {
    return "bg-green-100 text-green-700 border border-green-200";
  }

  if (label === "Ổn định") {
    return "bg-orange-100 text-orange-700 border border-orange-200";
  }

  return "bg-red-100 text-red-700 border border-red-200";
}

function buildApiUrls(queryString: string) {
  const query = queryString ? `?${queryString}` : "";

  return [
    `${API_BASE_URL}/api/reports/costs${query}`,
    `${API_BASE_URL}/api/training-costs${query}`,
    `${API_BASE_URL}/api/reports/training-costs${query}`,
    `${API_BASE_URL}/reports/costs${query}`,
    `${API_BASE_URL}/training-costs${query}`,
  ];
}

function normalizeApiData(json: any): TrainingCostReport {
  const root = json?.data || json || {};
  const summary = root.summary || root;

  return {
    summary: {
      totalBudget: Number(summary.totalBudget || summary.total_budget || 0),
      totalUsed: Number(summary.totalUsed || summary.total_used || 0),
      costPerLearner: Number(
        summary.costPerLearner || summary.cost_per_learner || 0
      ),
      completionEfficiency: Number(
        summary.completionEfficiency ||
          summary.completion_efficiency ||
          summary.avgCompletionRate ||
          summary.avg_completion_rate ||
          0
      ),
    },

    departments: Array.isArray(root.departments)
      ? root.departments.map((item: any) => ({
          departmentId:
            item.departmentId || item.department_id || item.id || null,
          departmentName: String(
            item.departmentName ||
              item.department_name ||
              item.department ||
              "Chưa xác định"
          ),
          budgetAmount: Number(
            item.budgetAmount || item.budget_amount || item.budget || 0
          ),
          usedAmount: Number(
            item.usedAmount || item.used_amount || item.used || 0
          ),
          learnerCount: Number(
            item.learnerCount || item.learner_count || item.learners || 0
          ),
          costPerLearner: Number(
            item.costPerLearner || item.cost_per_learner || 0
          ),
          budgetUsageRate: Number(
            item.budgetUsageRate || item.budget_usage_rate || item.usage || 0
          ),
          completionRate: Number(
            item.completionRate || item.completion_rate || item.completion || 0
          ),
          status: String(item.status || "stable"),
        }))
      : [],

    monthlyTrend: Array.isArray(root.monthlyTrend)
      ? root.monthlyTrend.map((item: any) => ({
          month: String(item.month || item.month_label || ""),
          monthNumber: Number(item.monthNumber || item.month_number || 0),
          value: Number(item.value || item.usedAmount || item.used_amount || 0),
        }))
      : [],

    courseCosts: Array.isArray(root.courseCosts)
      ? root.courseCosts.map((item: any) => ({
          courseId: item.courseId || item.course_id || item.id || null,
          courseName: String(
            item.courseName ||
              item.course_name ||
              item.course ||
              item.title ||
              "Chưa xác định"
          ),
          courseType: String(
            item.courseType ||
              item.course_type ||
              item.type ||
              item.category ||
              "Nội bộ"
          ),
          usedAmount: Number(
            item.usedAmount || item.used_amount || item.cost || item.amount || 0
          ),
          learnerCount: Number(
            item.learnerCount || item.learner_count || item.learners || 0
          ),
          costPerLearner: Number(
            item.costPerLearner || item.cost_per_learner || 0
          ),
          completionRate: Number(
            item.completionRate || item.completion_rate || item.completion || 0
          ),
          roi: String(item.roi || item.status || "Trung bình"),
        }))
      : [],
  };
}

export default function LMSAdminReportCostsPage() {
  const [report, setReport] = useState<TrainingCostReport>(defaultReport);
  const [keyword, setKeyword] = useState("");
  const [period, setPeriod] = useState("this_year");
  const [departmentId, setDepartmentId] = useState("all");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (keyword.trim()) params.set("keyword", keyword.trim());
      if (period) params.set("period", period);
      if (departmentId) params.set("departmentId", departmentId);
      if (status) params.set("status", status);

      const queryString = params.toString();
      const apiUrls = buildApiUrls(queryString);

      let successJson: any = null;
      let successUrl = "";
      const failedUrls: string[] = [];

      for (const url of apiUrls) {
        try {
          console.log("Đang thử API chi phí đào tạo:", url);

          const response = await fetch(url, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            cache: "no-store",
          });

          if (!response.ok) {
            failedUrls.push(`${url} => ${response.status}`);
            continue;
          }

          const json = await response.json();

          if (json?.success === false) {
            failedUrls.push(`${url} => success false`);
            continue;
          }

          successJson = json;
          successUrl = url;
          break;
        } catch {
          failedUrls.push(`${url} => không gọi được`);
        }
      }

      if (!successJson) {
        console.error("Danh sách API đã thử nhưng chưa đúng:", failedUrls);
        throw new Error(
          "API lỗi 404: FE chưa tìm thấy đúng endpoint BE của trang Chi phí đào tạo"
        );
      }

      console.log("API chi phí đào tạo kết nối thành công:", successUrl);

      setReport(normalizeApiData(successJson));
    } catch (err) {
      console.error("Fetch training cost report error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Không thể kết nối tới BE chi phí đào tạo"
      );

      setReport(defaultReport);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchReport();
    }, 350);

    return () => clearTimeout(timer);
  }, [keyword, period, departmentId, status]);

  const departmentOptions = useMemo(() => {
    const map = new Map<string, string>();

    report.departments.forEach((item) => {
      if (item.departmentId) {
        map.set(item.departmentId, item.departmentName);
      }
    });

    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [report.departments]);

  const maxMonthlyValue = useMemo(() => {
    const values = report.monthlyTrend.map((item) => Number(item.value || 0));
    return Math.max(...values, 1);
  }, [report.monthlyTrend]);

  const handleExportReport = () => {
    const rows = [
      [
        "Loại dữ liệu",
        "Tên",
        "Ngân sách / Chi phí",
        "Đã sử dụng",
        "Học viên",
        "Chi phí / học viên",
        "Hoàn thành",
        "Trạng thái / Hiệu quả",
      ],

      ...report.departments.map((item) => [
        "Phòng ban",
        item.departmentName,
        item.budgetAmount,
        item.usedAmount,
        item.learnerCount,
        item.costPerLearner,
        `${item.completionRate}%`,
        normalizeStatus(item.status),
      ]),

      ...report.courseCosts.map((item) => [
        "Khóa học",
        item.courseName,
        item.usedAmount,
        item.usedAmount,
        item.learnerCount,
        item.costPerLearner,
        `${item.completionRate}%`,
        item.roi,
      ]),
    ];

    const csv = rows
      .map((row) =>
        row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "bao-cao-chi-phi-dao-tao.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <AppShell workspace="lms-admin" title="Chi phí đào tạo">
      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
            <div>
              <p className="text-sm font-semibold text-orange-600">
                Training Cost Analytics
              </p>

              <h1 className="mt-2 text-3xl font-bold text-slate-950">
                Báo cáo chi phí đào tạo
              </h1>

              <p className="mt-2 text-slate-500">
                Theo dõi ngân sách đào tạo, chi phí theo phòng ban, chi phí trên
                mỗi học viên và hiệu quả đầu tư đào tạo nội bộ.
              </p>
            </div>

            <button
              onClick={handleExportReport}
              className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-600"
            >
              <Download size={18} />
              Xuất báo cáo
            </button>
          </div>
        </section>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Wallet className="text-orange-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {loading ? "..." : formatCompactMoney(report.summary.totalBudget)}
            </p>
            <p className="text-sm text-slate-500">Tổng ngân sách</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <CreditCard className="text-orange-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {loading ? "..." : formatCompactMoney(report.summary.totalUsed)}
            </p>
            <p className="text-sm text-slate-500">Đã sử dụng</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Users className="text-orange-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {loading
                ? "..."
                : formatCompactMoney(report.summary.costPerLearner)}
            </p>
            <p className="text-sm text-slate-500">Chi phí / học viên</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <TrendingUp className="text-green-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {loading
                ? "..."
                : `${Math.round(report.summary.completionEfficiency)}%`}
            </p>
            <p className="text-sm text-slate-500">Hiệu quả hoàn thành</p>
          </div>
        </section>

        <SectionCard title="Bộ lọc chi phí đào tạo">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_200px_200px_200px]">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <Search size={18} className="text-slate-400" />

              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Tìm phòng ban, khóa học hoặc khoản chi..."
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>

            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
            >
              <option value="this_year">Năm nay</option>
              <option value="this_quarter">Quý này</option>
              <option value="this_month">Tháng này</option>
              <option value="last_year">Năm trước</option>
            </select>

            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
            >
              <option value="all">Tất cả phòng ban</option>
              {departmentOptions.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="efficient">Hiệu quả</option>
              <option value="stable">Ổn định</option>
              <option value="warning">Cần theo dõi</option>
            </select>
          </div>
        </SectionCard>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <SectionCard title="Chi phí theo phòng ban">
            {loading ? (
              <div className="rounded-2xl border border-slate-200 p-6 text-sm text-slate-500">
                Đang tải dữ liệu chi phí theo phòng ban...
              </div>
            ) : report.departments.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 p-6 text-sm text-slate-500">
                Chưa có dữ liệu chi phí theo phòng ban.
              </div>
            ) : (
              <div className="space-y-4">
                {report.departments.map((item) => {
                  const statusLabel = normalizeStatus(item.status);

                  return (
                    <div
                      key={`${item.departmentId || item.departmentName}`}
                      className="rounded-2xl border border-slate-200 p-5"
                    >
                      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-start">
                        <div>
                          <span
                            className={`inline-flex min-w-[110px] items-center justify-center rounded-full px-3 py-1.5 text-xs font-bold whitespace-nowrap ${getStatusClass(
                              item.status
                            )}`}
                          >
                            {statusLabel}
                          </span>

                          <h3 className="mt-3 font-bold text-slate-950">
                            {item.departmentName}
                          </h3>

                          <p className="mt-1 text-sm text-slate-500">
                            {item.learnerCount} học viên · Chi phí / học viên:{" "}
                            {formatMoney(item.costPerLearner)}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-sm text-slate-500">Đã dùng</p>
                          <p className="font-bold text-orange-600">
                            {formatMoney(item.usedAmount)}
                          </p>
                          <p className="text-xs text-slate-400">
                            / {formatMoney(item.budgetAmount)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5">
                        <div className="mb-2 flex justify-between text-sm">
                          <span className="text-slate-500">
                            Sử dụng ngân sách
                          </span>
                          <span className="font-bold text-orange-600">
                            {Math.round(item.budgetUsageRate || 0)}%
                          </span>
                        </div>
                        <ProgressBar
                          value={Math.min(
                            Math.max(Number(item.budgetUsageRate || 0), 0),
                            100
                          )}
                        />
                      </div>

                      <div className="mt-4">
                        <div className="mb-2 flex justify-between text-sm">
                          <span className="text-slate-500">
                            Hiệu quả hoàn thành
                          </span>
                          <span className="font-bold text-green-600">
                            {Math.round(item.completionRate || 0)}%
                          </span>
                        </div>
                        <ProgressBar
                          value={Math.min(
                            Math.max(Number(item.completionRate || 0), 0),
                            100
                          )}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>

          <SectionCard title="Xu hướng chi phí theo tháng">
            {loading ? (
              <div className="rounded-2xl border border-slate-200 p-6 text-sm text-slate-500">
                Đang tải xu hướng chi phí...
              </div>
            ) : report.monthlyTrend.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 p-6 text-sm text-slate-500">
                Chưa có dữ liệu xu hướng chi phí theo tháng.
              </div>
            ) : (
              <div className="space-y-4">
                {report.monthlyTrend.map((item) => {
                  const percent =
                    maxMonthlyValue > 0
                      ? Math.round(
                          (Number(item.value || 0) / maxMonthlyValue) * 100
                        )
                      : 0;

                  return (
                    <div key={`${item.month}-${item.monthNumber}`}>
                      <div className="mb-2 flex justify-between text-sm">
                        <span className="font-medium text-slate-700">
                          {item.month}
                        </span>
                        <span className="font-bold text-orange-600">
                          {formatCompactMoney(item.value)}
                        </span>
                      </div>
                      <ProgressBar value={Math.min(Math.max(percent, 0), 100)} />
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-6 rounded-2xl bg-orange-50 p-5">
              <div className="flex items-start gap-3">
                <PieChart className="mt-1 text-orange-600" size={22} />
                <div>
                  <h3 className="font-bold text-slate-950">
                    Nhận định chi phí
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Dữ liệu đang được tổng hợp từ BE theo thời gian, phòng ban
                    và trạng thái. Các tháng có chi phí cao nên được đối chiếu
                    với số học viên và tỷ lệ hoàn thành để đánh giá hiệu quả.
                  </p>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>

        <SectionCard title="Chi phí theo khóa học">
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="p-4">Khóa học</th>
                  <th className="p-4">Loại</th>
                  <th className="p-4">Chi phí</th>
                  <th className="p-4">Học viên</th>
                  <th className="p-4">Chi phí / HV</th>
                  <th className="p-4">Hoàn thành</th>
                  <th className="w-[140px] p-4 text-center">Hiệu quả</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="p-6 text-center text-sm text-slate-500"
                    >
                      Đang tải dữ liệu chi phí theo khóa học...
                    </td>
                  </tr>
                ) : report.courseCosts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="p-6 text-center text-sm text-slate-500"
                    >
                      Chưa có dữ liệu chi phí theo khóa học.
                    </td>
                  </tr>
                ) : (
                  report.courseCosts.map((item) => (
                    <tr
                      key={`${item.courseId || item.courseName}`}
                      className="border-t border-slate-100"
                    >
                      <td className="max-w-[280px] p-4">
                        <p className="font-bold text-slate-950">
                          {item.courseName}
                        </p>
                      </td>

                      <td className="p-4 text-slate-600">
                        {item.courseType}
                      </td>

                      <td className="p-4 font-bold text-orange-600">
                        {formatMoney(item.usedAmount)}
                      </td>

                      <td className="p-4 font-semibold">
                        {item.learnerCount}
                      </td>

                      <td className="p-4 font-semibold">
                        {formatMoney(item.costPerLearner)}
                      </td>

                      <td className="p-4">
                        <div className="min-w-[120px]">
                          <div className="mb-2 flex justify-between text-xs">
                            <span className="text-slate-500">
                              {Math.round(item.completionRate || 0)}%
                            </span>
                          </div>
                          <ProgressBar
                            value={Math.min(
                              Math.max(Number(item.completionRate || 0), 0),
                              100
                            )}
                          />
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="flex justify-center">
                          <span
                            className={`inline-flex min-w-[100px] items-center justify-center rounded-full px-3 py-1.5 text-xs font-bold whitespace-nowrap ${getStatusClass(
                              item.roi
                            )}`}
                          >
                            {item.roi}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard title="Cảnh báo và đề xuất tối ưu chi phí">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {[
              {
                icon: AlertTriangle,
                title: "Khoản chi cần theo dõi",
                desc: "Các phòng ban có tỷ lệ dùng ngân sách cao cần được kiểm tra lại hiệu quả hoàn thành.",
              },
              {
                icon: TrendingDown,
                title: "Cần tối ưu nội dung",
                desc: "Nên rút gọn thời lượng hoặc chia nhỏ bài học để tăng tỷ lệ hoàn thành.",
              },
              {
                icon: CheckCircle2,
                title: "Phòng ban hiệu quả",
                desc: "Ưu tiên nhân rộng các chương trình có chi phí hợp lý và tỷ lệ hoàn thành cao.",
              },
              {
                icon: BookOpen,
                title: "Tái sử dụng khóa học",
                desc: "Các khóa nội bộ nên được tái sử dụng để giảm chi phí đào tạo cho các kỳ sau.",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-2xl border border-slate-200 p-4"
                >
                  <Icon className="text-orange-600" size={22} />

                  <h3 className="mt-3 font-bold text-slate-950">
                    {item.title}
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}