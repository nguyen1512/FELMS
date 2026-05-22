"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/lms/AppShell";
import ProgressBar from "@/components/lms/ProgressBar";
import SectionCard from "@/components/lms/SectionCard";
import {
  AlertTriangle,
  Award,
  BookOpen,
  CheckCircle2,
  Clock3,
  Download,
  FileBadge,
  Loader2,
  RefreshCcw,
  Search,
  Target,
  Users,
  XCircle,
} from "lucide-react";

type SummaryData = {
  totalAssigned: number;
  completed: number;
  learning: number;
  overdue: number;
};

type CourseCompletion = {
  courseId: string;
  courseTitle: string;
  courseCode?: string;
  totalAssigned: number;
  completedCount: number;
  overdueCount: number;
  completionRate: number;
  statusLabel: string;
  statusType?: string;
};

type CertificateCondition = {
  id: string;
  title: string;
  description: string;
  value?: number;
  total?: number;
  type: string;
};

type CompletionDetail = {
  assignmentId: string;
  userId: string;
  fullName: string;
  email?: string;
  departmentName: string;
  courseId: string;
  courseTitle: string;
  courseCode?: string;
  assignedAt?: string;
  dueDate?: string;
  startedAt?: string;
  completedAt?: string;
  progressPercent: number;
  status: string;
  statusLabel: string;
  certificateCode?: string | null;
  certificateIssuedAt?: string | null;
  certificateStatus?: string | null;
  hasCertificate: boolean;
};

type DepartmentOption = {
  id: string;
  name: string;
  code?: string;
};

type PeriodOption = {
  value: string;
  label: string;
};

type StatusOption = {
  value: string;
  label: string;
};

type FiltersData = {
  departments: DepartmentOption[];
  periods: PeriodOption[];
  statuses: StatusOption[];
};

type OverviewResponse = {
  success: boolean;
  data?: {
    summary?: SummaryData;
    courses?: CourseCompletion[];
    certificateConditions?: CertificateCondition[];
  };
  message?: string;
};

type DetailsResponse = {
  success: boolean;
  data?: CompletionDetail[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message?: string;
};

type FiltersResponse = {
  success: boolean;
  data?: FiltersData;
  message?: string;
};

const defaultSummary: SummaryData = {
  totalAssigned: 0,
  completed: 0,
  learning: 0,
  overdue: 0,
};

const defaultFilters: FiltersData = {
  departments: [],
  periods: [
    { value: "today", label: "Hôm nay" },
    { value: "week", label: "Tuần này" },
    { value: "month", label: "Tháng này" },
    { value: "quarter", label: "Quý này" },
    { value: "year", label: "Năm nay" },
    { value: "all", label: "Tất cả thời gian" },
  ],
  statuses: [
    { value: "all", label: "Tất cả trạng thái" },
    { value: "assigned", label: "Được giao" },
    { value: "learning", label: "Đang học" },
    { value: "completed", label: "Đã hoàn thành" },
    { value: "overdue", label: "Quá hạn" },
  ],
};

const RAW_API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:5000";

function getApiRoot() {
  const cleanUrl = RAW_API_URL.replace(/\/$/, "");
  return cleanUrl.endsWith("/api") ? cleanUrl : `${cleanUrl}/api`;
}

function apiUrl(path: string) {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${getApiRoot()}${cleanPath}`;
}

function buildQuery(params: Record<string, string | number | undefined>) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      searchParams.append(key, String(value));
    }
  });

  return searchParams.toString();
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const text = await response.text();

  let json: any = null;

  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(`API trả về dữ liệu không phải JSON: ${text.slice(0, 120)}`);
  }

  if (!response.ok) {
    throw new Error(
      json?.message || `API lỗi ${response.status}: ${response.statusText}`
    );
  }

  return json as T;
}

function formatDate(value?: string | null) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("vi-VN");
}

function getCourseStatusClass(statusType?: string, statusLabel?: string) {
  if (statusType === "danger" || statusLabel === "Cần nhắc") {
    return "bg-red-100 text-red-700 border border-red-200";
  }

  if (statusType === "warning" || statusLabel === "Cảnh báo") {
    return "bg-red-100 text-red-700 border border-red-200";
  }

  if (statusLabel === "Tốt") {
    return "bg-green-100 text-green-700 border border-green-200";
  }

  return "bg-orange-100 text-orange-700 border border-orange-200";
}

function getLearnerStatusClass(status: string) {
  if (status === "completed" || status === "Đã hoàn thành") {
    return "bg-green-100 text-green-700 border border-green-200";
  }

  if (status === "learning" || status === "Đang học") {
    return "bg-orange-100 text-orange-700 border border-orange-200";
  }

  if (status === "overdue" || status === "Quá hạn") {
    return "bg-red-100 text-red-700 border border-red-200";
  }

  return "bg-slate-100 text-slate-600 border border-slate-200";
}

function getConditionIcon(type: string) {
  if (type === "lesson") return BookOpen;
  if (type === "quiz") return Target;
  return FileBadge;
}

export default function LMSAdminReportCompletionsPage() {
  const [summary, setSummary] = useState<SummaryData>(defaultSummary);
  const [courses, setCourses] = useState<CourseCompletion[]>([]);
  const [certificateConditions, setCertificateConditions] = useState<
    CertificateCondition[]
  >([]);
  const [details, setDetails] = useState<CompletionDetail[]>([]);
  const [filters, setFilters] = useState<FiltersData>(defaultFilters);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState("month");
  const [departmentId, setDepartmentId] = useState("all");
  const [status, setStatus] = useState("all");

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDetails, setTotalDetails] = useState(0);

  const [loadingOverview, setLoadingOverview] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [loadingFilters, setLoadingFilters] = useState(true);
  const [error, setError] = useState("");

  const queryString = useMemo(() => {
    return buildQuery({
      period,
      departmentId,
      status,
      search,
    });
  }, [period, departmentId, status, search]);

  async function fetchFilters() {
    try {
      setLoadingFilters(true);

      const result = await fetchJson<FiltersResponse>(
        apiUrl("/reports/completions/filters")
      );

      if (!result.success) {
        throw new Error(result.message || "Không thể tải bộ lọc");
      }

      setFilters({
        departments: result.data?.departments || [],
        periods: result.data?.periods?.length
          ? result.data.periods
          : defaultFilters.periods,
        statuses: result.data?.statuses?.length
          ? result.data.statuses
          : defaultFilters.statuses,
      });
    } catch (err) {
      console.error("fetchFilters error:", err);
      setFilters(defaultFilters);
    } finally {
      setLoadingFilters(false);
    }
  }

  async function fetchOverview() {
    try {
      setLoadingOverview(true);
      setError("");

      const result = await fetchJson<OverviewResponse>(
        apiUrl(`/reports/completions?${queryString}`)
      );

      if (!result.success) {
        throw new Error(
          result.message || "Không thể tải báo cáo hoàn thành khóa học"
        );
      }

      setSummary(result.data?.summary || defaultSummary);
      setCourses(result.data?.courses || []);
      setCertificateConditions(result.data?.certificateConditions || []);
    } catch (err) {
      console.error("fetchOverview error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Không thể tải báo cáo hoàn thành khóa học"
      );

      setSummary(defaultSummary);
      setCourses([]);
      setCertificateConditions([]);
    } finally {
      setLoadingOverview(false);
    }
  }

  async function fetchDetails() {
    try {
      setLoadingDetails(true);

      const detailQuery = buildQuery({
        period,
        departmentId,
        status,
        search,
        page,
        limit,
      });

      const result = await fetchJson<DetailsResponse>(
        apiUrl(`/reports/completions/details?${detailQuery}`)
      );

      if (!result.success) {
        throw new Error(result.message || "Không thể tải danh sách hoàn thành");
      }

      setDetails(result.data || []);
      setTotalPages(result.pagination?.totalPages || 1);
      setTotalDetails(result.pagination?.total || 0);
    } catch (err) {
      console.error("fetchDetails error:", err);
      setDetails([]);
      setTotalPages(1);
      setTotalDetails(0);
    } finally {
      setLoadingDetails(false);
    }
  }

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [queryString]);

  useEffect(() => {
    fetchDetails();
  }, [period, departmentId, status, search, page, limit]);

  function handleApplySearch() {
    setPage(1);
    setSearch(searchInput.trim());
  }

  function handleChangePeriod(value: string) {
    setPage(1);
    setPeriod(value);
  }

  function handleChangeDepartment(value: string) {
    setPage(1);
    setDepartmentId(value);
  }

  function handleChangeStatus(value: string) {
    setPage(1);
    setStatus(value);
  }

  function handleRefresh() {
    fetchOverview();
    fetchDetails();
    fetchFilters();
  }

  function handleExportCsv() {
    const rows = details.map((item) => ({
      "Nhân sự": item.fullName,
      Email: item.email || "",
      "Phòng ban": item.departmentName,
      "Khóa học": item.courseTitle,
      "Tiến độ": `${item.progressPercent}%`,
      "Trạng thái": item.statusLabel,
      "Ngày giao": formatDate(item.assignedAt),
      "Hạn hoàn thành": formatDate(item.dueDate),
      "Ngày hoàn thành": formatDate(item.completedAt),
      "Chứng chỉ": item.hasCertificate
        ? item.certificateCode || "Đã cấp"
        : "Chưa cấp",
    }));

    const headers = [
      "Nhân sự",
      "Email",
      "Phòng ban",
      "Khóa học",
      "Tiến độ",
      "Trạng thái",
      "Ngày giao",
      "Hạn hoàn thành",
      "Ngày hoàn thành",
      "Chứng chỉ",
    ];

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        headers
          .map((header) => {
            const value = String(row[header as keyof typeof row] ?? "");
            return `"${value.replace(/"/g, '""')}"`;
          })
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `bao-cao-hoan-thanh-khoa-hoc-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  const topOverdueCourse = courses
    .filter((item) => item.overdueCount > 0)
    .sort((a, b) => b.overdueCount - a.overdueCount)[0];

  const lowCompletionCourse = courses
    .filter((item) => item.completionRate < 70)
    .sort((a, b) => a.completionRate - b.completionRate)[0];

  const bestCourse = courses
    .filter((item) => item.totalAssigned > 0)
    .sort((a, b) => b.completionRate - a.completionRate)[0];

  return (
    <AppShell workspace="lms-admin" title="Hoàn thành khóa học">
      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
            <div>
              <p className="text-sm font-semibold text-orange-600">
                Course Completion Analytics
              </p>

              <h1 className="mt-2 text-3xl font-bold text-slate-950">
                Báo cáo hoàn thành khóa học
              </h1>

              <p className="mt-2 text-slate-500">
                Theo dõi tỷ lệ hoàn thành, tình trạng quá hạn, điểm đạt và điều
                kiện cấp chứng chỉ cho từng khóa học.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleRefresh}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                <RefreshCcw size={18} />
                Làm mới
              </button>

              <button
                type="button"
                onClick={handleExportCsv}
                className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-600"
              >
                <Download size={18} />
                Xuất báo cáo
              </button>
            </div>
          </div>
        </section>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            {error}
          </div>
        ) : null}

        <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Users className="text-orange-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {loadingOverview ? (
                <Loader2 className="animate-spin text-slate-400" size={28} />
              ) : (
                summary.totalAssigned
              )}
            </p>
            <p className="text-sm text-slate-500">Lượt học được giao</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <CheckCircle2 className="text-green-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {loadingOverview ? (
                <Loader2 className="animate-spin text-slate-400" size={28} />
              ) : (
                summary.completed
              )}
            </p>
            <p className="text-sm text-slate-500">Đã hoàn thành</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Clock3 className="text-orange-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {loadingOverview ? (
                <Loader2 className="animate-spin text-slate-400" size={28} />
              ) : (
                summary.learning
              )}
            </p>
            <p className="text-sm text-slate-500">Đang học</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <AlertTriangle className="text-red-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {loadingOverview ? (
                <Loader2 className="animate-spin text-slate-400" size={28} />
              ) : (
                summary.overdue
              )}
            </p>
            <p className="text-sm text-slate-500">Quá hạn</p>
          </div>
        </section>

        <SectionCard title="Bộ lọc hoàn thành khóa học">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_200px_200px_200px]">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <Search size={18} className="text-slate-400" />

              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") handleApplySearch();
                }}
                placeholder="Tìm nhân viên, phòng ban hoặc khóa học..."
                className="w-full bg-transparent text-sm outline-none"
              />

              <button
                type="button"
                onClick={handleApplySearch}
                className="rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-orange-600"
              >
                Tìm
              </button>
            </div>

            <select
              value={period}
              onChange={(event) => handleChangePeriod(event.target.value)}
              disabled={loadingFilters}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
            >
              {filters.periods.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>

            <select
              value={departmentId}
              onChange={(event) => handleChangeDepartment(event.target.value)}
              disabled={loadingFilters}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
            >
              <option value="all">Tất cả phòng ban</option>
              {filters.departments.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>

            <select
              value={status}
              onChange={(event) => handleChangeStatus(event.target.value)}
              disabled={loadingFilters}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
            >
              {filters.statuses.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </SectionCard>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <SectionCard title="Tỷ lệ hoàn thành theo khóa học">
            {loadingOverview ? (
              <div className="flex items-center justify-center rounded-2xl border border-dashed border-slate-200 p-10 text-slate-500">
                <Loader2 className="mr-2 animate-spin" size={20} />
                Đang tải dữ liệu khóa học...
              </div>
            ) : courses.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-500">
                Chưa có dữ liệu hoàn thành khóa học phù hợp với bộ lọc.
              </div>
            ) : (
              <div className="space-y-4">
                {courses.map((item) => (
                  <div
                    key={item.courseId || item.courseTitle}
                    className="rounded-2xl border border-slate-200 p-5"
                  >
                    <div className="flex flex-col justify-between gap-3 xl:flex-row xl:items-start">
                      <div>
                        <span
                          className={`inline-flex min-w-[90px] items-center justify-center rounded-full px-3 py-1.5 text-xs font-bold whitespace-nowrap ${getCourseStatusClass(
                            item.statusType,
                            item.statusLabel
                          )}`}
                        >
                          {item.statusLabel}
                        </span>

                        <h3 className="mt-3 font-bold text-slate-950">
                          {item.courseTitle}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          Tổng công ty · {item.completedCount}/
                          {item.totalAssigned} đã hoàn thành ·{" "}
                          {item.overdueCount} quá hạn
                        </p>
                      </div>

                      <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-bold text-orange-700">
                        {item.completionRate}%
                      </span>
                    </div>

                    <div className="mt-4">
                      <ProgressBar value={item.completionRate} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard title="Điều kiện cấp chứng chỉ">
            <div className="space-y-4">
              {loadingOverview ? (
                <div className="flex items-center justify-center rounded-2xl border border-dashed border-slate-200 p-10 text-slate-500">
                  <Loader2 className="mr-2 animate-spin" size={20} />
                  Đang tải điều kiện...
                </div>
              ) : (
                <>
                  {certificateConditions.map((item) => {
                    const Icon = getConditionIcon(item.type);

                    return (
                      <div
                        key={item.id}
                        className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                          <Icon size={19} />
                        </div>

                        <div>
                          <h3 className="font-bold text-slate-950">
                            {item.title}
                          </h3>
                          <p className="mt-1 text-sm leading-6 text-slate-500">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}

                  <div className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                      <FileBadge size={19} />
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-950">
                        Cấp chứng chỉ
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        Chứng chỉ được ghi nhận khi người học đạt đủ điều kiện
                        hoàn thành khóa học.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                      <Award size={19} />
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-950">
                        Ghi nhận thành tích
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        Kết quả học tập được lưu vào hồ sơ đào tạo của nhân sự.
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </SectionCard>
        </div>

        <SectionCard title="Danh sách hoàn thành của nhân viên">
          <div className="mb-4 flex flex-col justify-between gap-2 text-sm text-slate-500 sm:flex-row sm:items-center">
            <span>
              Tổng số bản ghi: <b className="text-slate-900">{totalDetails}</b>
            </span>

            <span>
              Trang <b className="text-slate-900">{page}</b> /{" "}
              <b className="text-slate-900">{totalPages}</b>
            </span>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="p-4">Nhân sự</th>
                  <th className="p-4">Phòng ban</th>
                  <th className="p-4">Khóa học</th>
                  <th className="p-4">Tiến độ</th>
                  <th className="p-4">Hạn</th>
                  <th className="w-[150px] p-4 text-center">Trạng thái</th>
                  <th className="w-[140px] p-4 text-center">Chứng chỉ</th>
                </tr>
              </thead>

              <tbody>
                {loadingDetails ? (
                  <tr>
                    <td colSpan={7} className="p-10 text-center text-slate-500">
                      <div className="flex items-center justify-center">
                        <Loader2 className="mr-2 animate-spin" size={20} />
                        Đang tải danh sách nhân viên...
                      </div>
                    </td>
                  </tr>
                ) : details.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-10 text-center text-slate-500">
                      Không có dữ liệu phù hợp với bộ lọc hiện tại.
                    </td>
                  </tr>
                ) : (
                  details.map((item) => (
                    <tr
                      key={item.assignmentId}
                      className="border-t border-slate-100"
                    >
                      <td className="p-4">
                        <p className="font-bold text-slate-950">
                          {item.fullName}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {item.email || "-"}
                        </p>
                      </td>

                      <td className="p-4 text-slate-600">
                        {item.departmentName}
                      </td>

                      <td className="max-w-[280px] p-4 text-slate-600">
                        <p className="font-medium text-slate-700">
                          {item.courseTitle}
                        </p>
                        {item.courseCode ? (
                          <p className="mt-1 text-xs text-slate-400">
                            {item.courseCode}
                          </p>
                        ) : null}
                      </td>

                      <td className="p-4">
                        <div className="min-w-[120px]">
                          <div className="mb-2 flex justify-between text-xs">
                            <span className="text-slate-500">
                              {item.progressPercent}%
                            </span>
                          </div>
                          <ProgressBar value={item.progressPercent} />
                        </div>
                      </td>

                      <td className="p-4 text-slate-600">
                        <p>{formatDate(item.dueDate)}</p>
                        {item.completedAt ? (
                          <p className="mt-1 text-xs text-green-600">
                            HT: {formatDate(item.completedAt)}
                          </p>
                        ) : null}
                      </td>

                      <td className="p-4">
                        <div className="flex justify-center">
                          <span
                            className={`inline-flex min-w-[120px] items-center justify-center rounded-full px-3 py-1.5 text-center text-xs font-bold whitespace-nowrap ${getLearnerStatusClass(
                              item.status
                            )}`}
                          >
                            {item.statusLabel}
                          </span>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="flex justify-center">
                          <span
                            title={item.certificateCode || ""}
                            className={`inline-flex min-w-[90px] items-center justify-center rounded-full px-3 py-1.5 text-xs font-bold whitespace-nowrap ${
                              item.hasCertificate
                                ? "bg-green-100 text-green-700 border border-green-200"
                                : "bg-slate-100 text-slate-600 border border-slate-200"
                            }`}
                          >
                            {item.hasCertificate ? "Đã cấp" : "Chưa cấp"}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-end gap-2">
            <button
              type="button"
              disabled={page <= 1 || loadingDetails}
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Trước
            </button>

            <button
              type="button"
              disabled={page >= totalPages || loadingDetails}
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        </SectionCard>

        <SectionCard title="Cảnh báo vận hành">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 p-4">
              <AlertTriangle className="text-orange-600" size={22} />

              <h3 className="mt-3 font-bold text-slate-950">
                Khóa có nhiều quá hạn
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                {topOverdueCourse
                  ? `${topOverdueCourse.courseTitle} đang có ${topOverdueCourse.overdueCount} lượt quá hạn.`
                  : "Hiện chưa ghi nhận khóa học có lượt quá hạn trong bộ lọc này."}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4">
              <XCircle className="text-orange-600" size={22} />

              <h3 className="mt-3 font-bold text-slate-950">
                Tỷ lệ hoàn thành thấp
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                {lowCompletionCourse
                  ? `${lowCompletionCourse.courseTitle} có tỷ lệ hoàn thành ${lowCompletionCourse.completionRate}%, cần nhắc học viên hoàn thành.`
                  : "Các khóa học hiện có tỷ lệ hoàn thành tương đối ổn định."}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4">
              <CheckCircle2 className="text-orange-600" size={22} />

              <h3 className="mt-3 font-bold text-slate-950">
                Khóa hoàn thành tốt
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                {bestCourse
                  ? `${bestCourse.courseTitle} đang có tỷ lệ hoàn thành ${bestCourse.completionRate}%.`
                  : "Chưa có dữ liệu để xác định khóa học hoàn thành tốt."}
              </p>
            </div>
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}