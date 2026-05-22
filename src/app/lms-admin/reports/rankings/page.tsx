"use client";

import AppShell from "@/components/lms/AppShell";
import ProgressBar from "@/components/lms/ProgressBar";
import SectionCard from "@/components/lms/SectionCard";
import {
  Award,
  BarChart3,
  BookOpen,
  Clock3,
  Download,
  Loader2,
  Medal,
  Search,
  Star,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:5000/api";

type RankingPeriod =
  | "this_month"
  | "last_month"
  | "this_quarter"
  | "this_year"
  | "all";

type RankingSort =
  | "score_desc"
  | "score_asc"
  | "hours_desc"
  | "certificates_desc"
  | "completion_desc"
  | "progress_desc";

type RankingSummary = {
  rankedEmployees: number;
  averageScore: number;
  issuedCertificates: number;
  averageCompletion: number;
  totalLearningHours?: number;
};

type RankingEmployee = {
  rank: number;
  userId: string;
  employeeName: string;
  email?: string;
  departmentId?: string;
  departmentName: string;
  learningScore: number;
  averageQuizScore?: number;
  averageProgress?: number;
  completionRate: number;
  learningHours: number;
  totalCourses?: number;
  completedCourses?: number;
  certificatesCount: number;
  totalQuizAttempts?: number;
  passedQuizzes?: number;
  status: string;
};

type Department = {
  id: string;
  name: string;
  code?: string;
  status?: string;
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

const defaultSummary: RankingSummary = {
  rankedEmployees: 0,
  averageScore: 0,
  issuedCertificates: 0,
  averageCompletion: 0,
  totalLearningHours: 0,
};

function getRankBadge(rank: number) {
  if (rank === 1) return "bg-yellow-100 text-yellow-700";
  if (rank === 2) return "bg-slate-200 text-slate-700";
  if (rank === 3) return "bg-orange-100 text-orange-700";
  return "bg-slate-100 text-slate-600";
}

function getStatusClass(status: string) {
  if (status === "Xuất sắc") {
    return "bg-green-100 text-green-700 border border-green-200";
  }

  if (status === "Tốt") {
    return "bg-orange-100 text-orange-700 border border-orange-200";
  }

  if (status === "Đang học") {
    return "bg-blue-100 text-blue-700 border border-blue-200";
  }

  return "bg-red-100 text-red-700 border border-red-200";
}

function formatNumber(value: number | string | undefined | null) {
  const num = Number(value || 0);
  return new Intl.NumberFormat("vi-VN").format(num);
}

function formatDecimal(value: number | string | undefined | null, digits = 1) {
  const num = Number(value || 0);
  return num.toLocaleString("vi-VN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  });
}

async function fetchJson<T>(url: string): Promise<T> {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token") ||
        localStorage.getItem("accessToken") ||
        localStorage.getItem("authToken")
      : null;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }

  return res.json();
}

export default function LMSAdminReportRankingsPage() {
  const [summary, setSummary] = useState<RankingSummary>(defaultSummary);
  const [employees, setEmployees] = useState<RankingEmployee[]>([]);
  const [topEmployees, setTopEmployees] = useState<RankingEmployee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [period, setPeriod] = useState<RankingPeriod>("this_month");
  const [departmentId, setDepartmentId] = useState("all");
  const [sort, setSort] = useState<RankingSort>("score_desc");

  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 400);

    return () => window.clearTimeout(timer);
  }, [search]);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();

    params.set("period", period);
    params.set("department_id", departmentId);
    params.set("sort", sort);
    params.set("page", "1");
    params.set("limit", "50");

    if (debouncedSearch) {
      params.set("search", debouncedSearch);
    }

    return params.toString();
  }, [period, departmentId, sort, debouncedSearch]);

  async function loadDepartments() {
    try {
      const res = await fetchJson<any>(`${API_BASE}/departments`);

      const rawData = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.departments)
        ? res.departments
        : [];

      setDepartments(rawData);
    } catch (err) {
      console.warn("Không thể tải danh sách phòng ban:", err);
      setDepartments([]);
    }
  }

  async function loadRankingData() {
    try {
      setLoading(true);
      setError("");

      const summaryParams = new URLSearchParams();
      summaryParams.set("period", period);
      summaryParams.set("department_id", departmentId);

      const [summaryRes, employeesRes, topRes] = await Promise.all([
        fetchJson<ApiResponse<RankingSummary>>(
          `${API_BASE}/reports/rankings/summary?${summaryParams.toString()}`
        ),
        fetchJson<ApiResponse<RankingEmployee[]>>(
          `${API_BASE}/reports/rankings/employees?${queryString}`
        ),
        fetchJson<ApiResponse<RankingEmployee[]>>(
          `${API_BASE}/reports/rankings/top?period=${period}&department_id=${departmentId}&limit=3`
        ),
      ]);

      setSummary(summaryRes.data || defaultSummary);
      setEmployees(Array.isArray(employeesRes.data) ? employeesRes.data : []);
      setTopEmployees(Array.isArray(topRes.data) ? topRes.data : []);
    } catch (err: any) {
      console.error("Load ranking data error:", err);
      setError(
        "Không thể tải dữ liệu xếp hạng. Vui lòng kiểm tra lại BE hoặc API URL."
      );
      setSummary(defaultSummary);
      setEmployees([]);
      setTopEmployees([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleExport() {
    try {
      setExporting(true);

      const params = new URLSearchParams();
      params.set("period", period);
      params.set("department_id", departmentId);

      if (debouncedSearch) {
        params.set("search", debouncedSearch);
      }

      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken") ||
        localStorage.getItem("authToken");

      const res = await fetch(
        `${API_BASE}/reports/rankings/export?${params.toString()}`,
        {
          method: "GET",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      if (!res.ok) {
        throw new Error("Export failed");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `bang-xep-hang-hoc-tap-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export ranking error:", err);
      alert("Không thể xuất bảng xếp hạng. Vui lòng thử lại.");
    } finally {
      setExporting(false);
    }
  }

  useEffect(() => {
    loadDepartments();
  }, []);

  useEffect(() => {
    loadRankingData();
  }, [queryString, period, departmentId]);

  const departmentRanking = useMemo(() => {
    const map = new Map<
      string,
      {
        name: string;
        learners: number;
        totalScore: number;
        totalCompletion: number;
      }
    >();

    employees.forEach((item) => {
      const key = item.departmentName || "Chưa có phòng ban";

      if (!map.has(key)) {
        map.set(key, {
          name: key,
          learners: 0,
          totalScore: 0,
          totalCompletion: 0,
        });
      }

      const current = map.get(key)!;
      current.learners += 1;
      current.totalScore += Number(item.learningScore || 0);
      current.totalCompletion += Number(item.completionRate || 0);
    });

    return Array.from(map.values())
      .map((item) => ({
        name: item.name,
        learners: item.learners,
        avgScore:
          item.learners > 0 ? Math.round(item.totalScore / item.learners) : 0,
        completion:
          item.learners > 0
            ? Math.round(item.totalCompletion / item.learners)
            : 0,
      }))
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, 5)
      .map((item, index) => ({
        ...item,
        rank: index + 1,
      }));
  }, [employees]);

  const analytics = useMemo(() => {
    const excellent = employees.filter((item) => item.learningScore >= 85);
    const stable = employees.filter(
      (item) => item.learningScore >= 70 && item.learningScore < 85
    );
    const needImprove = employees.filter(
      (item) =>
        item.learningScore < 50 || Number(item.averageProgress || 0) < 40
    );

    const maxHours = employees.reduce(
      (max, item) => Math.max(max, Number(item.learningHours || 0)),
      0
    );

    return [
      {
        icon: Medal,
        title: "Nhóm xuất sắc",
        value: formatNumber(excellent.length),
        desc: "Điểm từ 85 trở lên",
      },
      {
        icon: Users,
        title: "Nhóm ổn định",
        value: formatNumber(stable.length),
        desc: "Điểm từ 70 đến dưới 85",
      },
      {
        icon: BarChart3,
        title: "Cần cải thiện",
        value: formatNumber(needImprove.length),
        desc: "Điểm thấp hoặc tiến độ dưới 40%",
      },
      {
        icon: Clock3,
        title: "Giờ học cao nhất",
        value: `${formatDecimal(maxHours)}h`,
        desc: "Nhân sự có thời lượng học cao nhất",
      },
    ];
  }, [employees]);

  return (
    <AppShell workspace="lms-admin" title="Xếp hạng học tập">
      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
            <div>
              <p className="text-sm font-semibold text-orange-600">
                Learning Ranking
              </p>

              <h1 className="mt-2 text-3xl font-bold text-slate-950">
                Báo cáo xếp hạng học tập
              </h1>

              <p className="mt-2 text-slate-500">
                Theo dõi bảng xếp hạng nhân viên, phòng ban, chứng chỉ và kết
                quả học tập trong hệ thống LMS.
              </p>
            </div>

            <button
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {exporting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Download size={18} />
              )}
              {exporting ? "Đang xuất..." : "Xuất bảng xếp hạng"}
            </button>
          </div>
        </section>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
            {error}
          </div>
        ) : null}

        <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Trophy className="text-orange-600" size={24} />

            <p className="mt-3 text-3xl font-bold text-slate-950">
              {loading ? "..." : formatNumber(summary.rankedEmployees)}
            </p>

            <p className="text-sm text-slate-500">Nhân sự được xếp hạng</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Star className="text-orange-600" size={24} />

            <p className="mt-3 text-3xl font-bold text-slate-950">
              {loading ? "..." : formatNumber(summary.averageScore)}
            </p>

            <p className="text-sm text-slate-500">Điểm trung bình</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Award className="text-orange-600" size={24} />

            <p className="mt-3 text-3xl font-bold text-slate-950">
              {loading ? "..." : formatNumber(summary.issuedCertificates)}
            </p>

            <p className="text-sm text-slate-500">Chứng chỉ đã cấp</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Target className="text-orange-600" size={24} />

            <p className="mt-3 text-3xl font-bold text-slate-950">
              {loading ? "..." : `${formatNumber(summary.averageCompletion)}%`}
            </p>

            <p className="text-sm text-slate-500">Hoàn thành trung bình</p>
          </div>
        </section>

        <SectionCard title="Bộ lọc xếp hạng">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_200px_220px_220px]">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <Search size={18} className="text-slate-400" />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tìm nhân viên, phòng ban hoặc email..."
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>

            <select
              value={period}
              onChange={(event) => setPeriod(event.target.value as RankingPeriod)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
            >
              <option value="this_month">Tháng này</option>
              <option value="last_month">Tháng trước</option>
              <option value="this_quarter">Quý này</option>
              <option value="this_year">Năm nay</option>
              <option value="all">Tất cả thời gian</option>
            </select>

            <select
              value={departmentId}
              onChange={(event) => setDepartmentId(event.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
            >
              <option value="all">Tất cả phòng ban</option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>

            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as RankingSort)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
            >
              <option value="score_desc">Xếp theo điểm cao nhất</option>
              <option value="score_asc">Xếp theo điểm thấp nhất</option>
              <option value="hours_desc">Xếp theo giờ học</option>
              <option value="certificates_desc">Xếp theo chứng chỉ</option>
              <option value="completion_desc">Xếp theo hoàn thành</option>
              <option value="progress_desc">Xếp theo tiến độ</option>
            </select>
          </div>
        </SectionCard>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <SectionCard title="Bảng xếp hạng nhân viên">
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <div className="max-h-[520px] overflow-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 z-10 bg-slate-50 text-left text-slate-500">
                    <tr>
                      <th className="p-4">Hạng</th>
                      <th className="p-4">Nhân viên</th>
                      <th className="p-4">Phòng ban</th>
                      <th className="p-4">Điểm</th>
                      <th className="p-4">Giờ học</th>
                      <th className="p-4">Chứng chỉ</th>
                      <th className="w-[150px] p-4 text-center">Trạng thái</th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center">
                          <div className="flex items-center justify-center gap-2 text-slate-500">
                            <Loader2 className="animate-spin" size={18} />
                            Đang tải dữ liệu xếp hạng...
                          </div>
                        </td>
                      </tr>
                    ) : employees.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="p-8 text-center text-sm text-slate-500"
                        >
                          Chưa có dữ liệu xếp hạng phù hợp với bộ lọc hiện tại.
                        </td>
                      </tr>
                    ) : (
                      employees.map((item) => (
                        <tr
                          key={item.userId}
                          className="border-t border-slate-100"
                        >
                          <td className="p-4">
                            <span
                              className={`inline-flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold ${getRankBadge(
                                item.rank
                              )}`}
                            >
                              #{item.rank}
                            </span>
                          </td>

                          <td className="p-4">
                            <p className="font-bold text-slate-950">
                              {item.employeeName}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              Hoàn thành {formatNumber(item.completionRate)}% ·
                              Tiến độ {formatDecimal(item.averageProgress)}%
                            </p>
                          </td>

                          <td className="p-4 text-slate-600">
                            {item.departmentName}
                          </td>

                          <td className="p-4 font-bold text-orange-600">
                            {formatNumber(item.learningScore)}
                          </td>

                          <td className="p-4 font-semibold">
                            {formatDecimal(item.learningHours)}h
                          </td>

                          <td className="p-4 font-semibold">
                            {formatNumber(item.certificatesCount)}
                          </td>

                          <td className="p-4">
                            <div className="flex justify-center">
                              <span
                                className={`inline-flex min-w-[110px] items-center justify-center rounded-full px-4 py-2 text-center text-xs font-bold leading-none whitespace-nowrap ${getStatusClass(
                                  item.status
                                )}`}
                              >
                                {item.status}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Top 3 nhân viên nổi bật">
            <div className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 p-8 text-sm text-slate-500">
                  <Loader2 className="animate-spin" size={18} />
                  Đang tải top nhân viên...
                </div>
              ) : topEmployees.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 p-8 text-center text-sm text-slate-500">
                  Chưa có dữ liệu top nhân viên.
                </div>
              ) : (
                topEmployees.map((item) => (
                  <div
                    key={item.userId}
                    className="rounded-2xl border border-slate-200 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-xl font-bold ${getRankBadge(
                          item.rank
                        )}`}
                      >
                        #{item.rank}
                      </div>

                      <div>
                        <h3 className="font-bold text-slate-950">
                          {item.employeeName}
                        </h3>

                        <p className="text-sm text-slate-500">
                          {item.departmentName}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="mb-2 flex justify-between text-sm">
                        <span className="text-slate-500">Điểm học tập</span>

                        <span className="font-bold text-orange-600">
                          {formatNumber(item.learningScore)}
                        </span>
                      </div>

                      <ProgressBar value={Number(item.learningScore || 0)} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </SectionCard>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <SectionCard title="Xếp hạng phòng ban">
            <div className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 p-8 text-sm text-slate-500">
                  <Loader2 className="animate-spin" size={18} />
                  Đang tổng hợp phòng ban...
                </div>
              ) : departmentRanking.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 p-8 text-center text-sm text-slate-500">
                  Chưa có dữ liệu xếp hạng phòng ban.
                </div>
              ) : (
                departmentRanking.map((item) => (
                  <div
                    key={item.name}
                    className="rounded-2xl border border-slate-200 p-5"
                  >
                    <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold ${getRankBadge(
                            item.rank
                          )}`}
                        >
                          #{item.rank}
                        </div>

                        <div>
                          <h3 className="font-bold text-slate-950">
                            {item.name}
                          </h3>

                          <p className="text-sm text-slate-500">
                            {formatNumber(item.learners)} nhân sự · Điểm TB{" "}
                            {formatNumber(item.avgScore)}
                          </p>
                        </div>
                      </div>

                      <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-bold text-orange-700">
                        {formatNumber(item.completion)}%
                      </span>
                    </div>

                    <div className="mt-4">
                      <ProgressBar value={item.completion} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </SectionCard>

          <SectionCard title="Phân tích xếp hạng">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {analytics.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-slate-200 p-4"
                  >
                    <Icon className="text-orange-600" size={22} />

                    <p className="mt-3 text-2xl font-bold text-slate-950">
                      {loading ? "..." : item.value}
                    </p>

                    <h3 className="mt-1 font-bold text-slate-900">
                      {item.title}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </SectionCard>
        </div>
      </div>
    </AppShell>
  );
}