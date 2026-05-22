"use client";

import AppShell from "@/components/lms/AppShell";
import ProgressBar from "@/components/lms/ProgressBar";
import SectionCard from "@/components/lms/SectionCard";
import { apiGet } from "@/lib/api";
import {
  Award,
  BarChart3,
  BookOpen,
  Clock3,
  Download,
  Medal,
  Search,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type ReportCards = {
  totalLearners: number;
  totalCourses: number;
  completionRate: number;
  certificatesIssued: number;
};

type DepartmentPerformance = {
  departmentId: string;
  departmentName: string;
  totalUsers: number;
  completedUsers: number;
  avgScore: number;
  completionRate: number;
};

type ReportIndicators = {
  totalLearningHours: number;
  averageScore: number;
  completedCourses: number;
  activeLearners: number;
};

type TopCourse = {
  courseId?: string;
  name: string;
  learners: number;
  completion: number;
  score: number;
};

type ReminderItem = {
  userId?: string;
  name: string;
  department: string;
  courseId?: string;
  course: string;
  progress: number;
  deadline: string;
};

type OverviewData = {
  cards: ReportCards;
  departmentPerformance: DepartmentPerformance[];
  indicators: ReportIndicators;
  topCourses: TopCourse[];
  reminders: ReminderItem[];
};

type FilterOption = {
  value?: string;
  label?: string;
  id?: string;
  name?: string;
  title?: string;
};

type FilterData = {
  periods: FilterOption[];
  statuses: FilterOption[];
  departments: FilterOption[];
  courses: FilterOption[];
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

const defaultOverviewData: OverviewData = {
  cards: {
    totalLearners: 0,
    totalCourses: 0,
    completionRate: 0,
    certificatesIssued: 0,
  },
  departmentPerformance: [],
  indicators: {
    totalLearningHours: 0,
    averageScore: 0,
    completedCourses: 0,
    activeLearners: 0,
  },
  topCourses: [],
  reminders: [],
};

const defaultFilters: FilterData = {
  periods: [
    { value: "month", label: "Tháng này" },
    { value: "quarter", label: "Quý này" },
    { value: "year", label: "Năm nay" },
    { value: "all", label: "Tất cả thời gian" },
  ],
  statuses: [
    { value: "all", label: "Tất cả trạng thái" },
    { value: "learning", label: "Đang học" },
    { value: "completed", label: "Hoàn thành" },
    { value: "not_started", label: "Chưa bắt đầu" },
  ],
  departments: [],
  courses: [],
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("vi-VN").format(Number(value || 0));
}

function formatPercent(value: number) {
  const safeValue = Number(value || 0);

  if (Number.isInteger(safeValue)) {
    return `${safeValue}%`;
  }

  return `${safeValue.toFixed(1)}%`;
}

export default function LMSAdminReportOverviewPage() {
  const [overviewData, setOverviewData] =
    useState<OverviewData>(defaultOverviewData);

  const [filters, setFilters] = useState<FilterData>(defaultFilters);

  const [period, setPeriod] = useState("month");
  const [departmentId, setDepartmentId] = useState("all");
  const [status, setStatus] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false);
  const [error, setError] = useState("");

  const queryString = useMemo(() => {
    const params = new URLSearchParams();

    params.set("period", period || "month");
    params.set("department_id", departmentId || "all");
    params.set("status", status || "all");

    if (search.trim()) {
      params.set("search", search.trim());
    }

    return params.toString();
  }, [period, departmentId, status, search]);

  const fetchFilters = async () => {
    try {
      setFilterLoading(true);

      const result = await apiGet<ApiResponse<FilterData>>(
        "lms-admin/reports/filters"
      );

      setFilters({
        periods: result.data?.periods?.length
          ? result.data.periods
          : defaultFilters.periods,
        statuses: result.data?.statuses?.length
          ? result.data.statuses
          : defaultFilters.statuses,
        departments: result.data?.departments || [],
        courses: result.data?.courses || [],
      });
    } catch (err) {
      console.error("fetchFilters error:", err);
      setFilters(defaultFilters);
    } finally {
      setFilterLoading(false);
    }
  };

  const fetchOverview = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await apiGet<ApiResponse<OverviewData>>(
        `lms-admin/reports/overview?${queryString}`
      );

      setOverviewData({
        cards: result.data?.cards || defaultOverviewData.cards,
        departmentPerformance:
          result.data?.departmentPerformance ||
          defaultOverviewData.departmentPerformance,
        indicators: result.data?.indicators || defaultOverviewData.indicators,
        topCourses: result.data?.topCourses || [],
        reminders: result.data?.reminders || [],
      });
    } catch (err: any) {
      console.error("fetchOverview error:", err);
      setError(err.message || "Đã có lỗi xảy ra khi tải báo cáo");
      setOverviewData(defaultOverviewData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [queryString]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const cards = overviewData.cards;
  const indicators = overviewData.indicators;
  const departmentReports = overviewData.departmentPerformance;
  const topCourses = overviewData.topCourses;
  const reminders = overviewData.reminders;

  return (
    <AppShell workspace="lms-admin" title="Tổng quan học tập">
      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
            <div>
              <p className="text-sm font-semibold text-orange-600">
                Learning Analytics
              </p>

              <h1 className="mt-2 text-3xl font-bold text-slate-950">
                Báo cáo tổng quan học tập
              </h1>

              <p className="mt-2 text-slate-500">
                Theo dõi hiệu quả đào tạo nội bộ theo phòng ban, khóa học, điểm
                số, tiến độ và chứng chỉ đã cấp.
              </p>
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600"
            >
              <Download size={18} />
              Xuất báo cáo
            </button>
          </div>
        </section>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-600">
            {error}
          </div>
        )}

        <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Users className="text-orange-600" size={24} />

            <p className="mt-3 text-3xl font-bold text-slate-950">
              {loading ? "..." : formatNumber(cards.totalLearners)}
            </p>

            <p className="text-sm text-slate-500">Tổng người học</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <BookOpen className="text-orange-600" size={24} />

            <p className="mt-3 text-3xl font-bold text-slate-950">
              {loading ? "..." : formatNumber(cards.totalCourses)}
            </p>

            <p className="text-sm text-slate-500">Khóa học nội bộ</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Target className="text-orange-600" size={24} />

            <p className="mt-3 text-3xl font-bold text-slate-950">
              {loading ? "..." : formatPercent(cards.completionRate)}
            </p>

            <p className="text-sm text-slate-500">Tỷ lệ hoàn thành</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Award className="text-orange-600" size={24} />

            <p className="mt-3 text-3xl font-bold text-slate-950">
              {loading ? "..." : formatNumber(cards.certificatesIssued)}
            </p>

            <p className="text-sm text-slate-500">Chứng chỉ đã cấp</p>
          </div>
        </section>

        <SectionCard title="Bộ lọc báo cáo">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_200px_200px_200px]">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <Search size={18} className="text-slate-400" />

              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Tìm phòng ban, khóa học hoặc nhân viên..."
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>

            <select
              value={period}
              onChange={(event) => setPeriod(event.target.value)}
              disabled={filterLoading}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-60"
            >
              {filters.periods.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>

            <select
              value={departmentId}
              onChange={(event) => setDepartmentId(event.target.value)}
              disabled={filterLoading}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-60"
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
              onChange={(event) => setStatus(event.target.value)}
              disabled={filterLoading}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-60"
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
          <SectionCard title="Hiệu quả học tập theo phòng ban">
            <div className="space-y-4">
              {loading ? (
                <div className="rounded-2xl border border-slate-200 p-5 text-sm text-slate-500">
                  Đang tải dữ liệu phòng ban...
                </div>
              ) : departmentReports.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 p-5 text-sm text-slate-500">
                  Chưa có dữ liệu hiệu quả học tập theo phòng ban.
                </div>
              ) : (
                departmentReports.map((item) => (
                  <div
                    key={item.departmentId}
                    className="rounded-2xl border border-slate-200 p-5"
                  >
                    <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                      <div>
                        <h3 className="font-bold text-slate-950">
                          {item.departmentName}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          {formatNumber(item.completedUsers)}/
                          {formatNumber(item.totalUsers)} nhân sự hoàn thành ·
                          Điểm TB: {Number(item.avgScore || 0).toFixed(0)}
                        </p>
                      </div>

                      <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-bold text-orange-700">
                        {formatPercent(item.completionRate)}
                      </span>
                    </div>

                    <div className="mt-4">
                      <ProgressBar value={Number(item.completionRate || 0)} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </SectionCard>

          <SectionCard title="Tổng hợp chỉ số">
            <div className="space-y-4">
              {[
                {
                  icon: Clock3,
                  label: "Tổng giờ học",
                  value: `${formatNumber(indicators.totalLearningHours)} giờ`,
                  desc: "Toàn hệ thống",
                },
                {
                  icon: BarChart3,
                  label: "Điểm trung bình",
                  value: `${Number(indicators.averageScore || 0).toFixed(
                    0
                  )}/100`,
                  desc: "Tất cả bài kiểm tra",
                },
                {
                  icon: TrendingUp,
                  label: "Khóa đã hoàn thành",
                  value: formatNumber(indicators.completedCourses),
                  desc: "Theo dữ liệu ghi danh",
                },
                {
                  icon: Medal,
                  label: "Người đang học",
                  value: formatNumber(indicators.activeLearners),
                  desc: "Có tiến độ học tập",
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                        <Icon size={19} />
                      </div>

                      <div>
                        <p className="font-bold text-slate-950">
                          {item.label}
                        </p>

                        <p className="text-sm text-slate-500">{item.desc}</p>
                      </div>
                    </div>

                    <p className="text-lg font-bold text-orange-600">
                      {loading ? "..." : item.value}
                    </p>
                  </div>
                );
              })}
            </div>
          </SectionCard>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <SectionCard title="Top khóa học hiệu quả">
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-slate-500">
                  <tr>
                    <th className="p-4">Khóa học</th>
                    <th className="p-4">Học viên</th>
                    <th className="p-4">Hoàn thành</th>
                    <th className="p-4">Điểm TB</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="p-4 text-slate-500">
                        Đang tải dữ liệu khóa học...
                      </td>
                    </tr>
                  ) : topCourses.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-4 text-slate-500">
                        Chưa có dữ liệu khóa học hiệu quả.
                      </td>
                    </tr>
                  ) : (
                    topCourses.map((course) => (
                      <tr
                        key={course.courseId || course.name}
                        className="border-t border-slate-100"
                      >
                        <td className="max-w-[260px] p-4 font-bold text-slate-950">
                          {course.name}
                        </td>

                        <td className="p-4 font-semibold">
                          {formatNumber(course.learners)}
                        </td>

                        <td className="p-4 text-orange-600">
                          {formatPercent(course.completion)}
                        </td>

                        <td className="p-4 font-semibold">
                          {Number(course.score || 0).toFixed(0)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </SectionCard>

          <SectionCard title="Nhân viên cần nhắc học">
            <div className="space-y-3">
              {loading ? (
                <div className="rounded-2xl border border-slate-200 p-5 text-sm text-slate-500">
                  Đang tải danh sách nhân viên cần nhắc học...
                </div>
              ) : reminders.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 p-5 text-sm text-slate-500">
                  Hiện chưa có nhân viên cần nhắc học.
                </div>
              ) : (
                reminders.map((item) => (
                  <div
                    key={`${item.userId || item.name}-${
                      item.courseId || item.course
                    }`}
                    className="rounded-2xl border border-slate-200 p-4"
                  >
                    <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                      <div>
                        <h3 className="font-bold text-slate-950">
                          {item.name}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          {item.department} · {item.course}
                        </p>

                        <p className="mt-1 text-xs text-red-500">
                          Deadline: {item.deadline}
                        </p>
                      </div>

                      <button
                        type="button"
                        className="rounded-xl border border-orange-200 px-4 py-2 text-sm font-bold text-orange-600 hover:bg-orange-50"
                        onClick={() => {
                          alert(`Đã ghi nhận nhắc học cho ${item.name}`);
                        }}
                      >
                        Nhắc học
                      </button>
                    </div>

                    <div className="mt-4">
                      <div className="mb-2 flex justify-between text-sm">
                        <span className="text-slate-500">Tiến độ</span>

                        <span className="font-bold text-orange-600">
                          {formatPercent(item.progress)}
                        </span>
                      </div>

                      <ProgressBar value={Number(item.progress || 0)} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </SectionCard>
        </div>
      </div>
    </AppShell>
  );
}