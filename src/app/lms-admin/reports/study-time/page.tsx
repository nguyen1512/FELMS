"use client";

import AppShell from "@/components/lms/AppShell";
import ProgressBar from "@/components/lms/ProgressBar";
import SectionCard from "@/components/lms/SectionCard";
import { apiUrl } from "@/lib/api";
import {
  AlertCircle,
  BarChart3,
  BookOpen,
  Clock3,
  Download,
  Moon,
  RefreshCcw,
  Search,
  Sun,
  Timer,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Option = {
  value: string;
  label: string;
};

type Department = {
  id: string;
  name: string;
};

type DepartmentStudyTimeItem = {
  departmentId: string | null;
  departmentName: string;
  employeeCount: number;
  totalHours: number;
  avgHours: number;
  percent: number;
};

type TimeSlotItem = {
  rank: number;
  timeSlot: string;
  description: string;
  totalHours: number;
  percent: number;
};

type CourseStudyTimeItem = {
  courseId: string | null;
  course: string;
  hours: number;
  learners: number;
  avg: number;
  progress: number;
};

type LearnerStudyTimeItem = {
  userId: string | null;
  name: string;
  department: string;
  hours: number;
  lessons: number;
  lastStudy: string;
  status: string;
};

type StudyTimeData = {
  summary: {
    totalStudyHours: number;
    activeLearners: number;
    avgHoursPerUser: number;
    growthPercent: number;
  };
  departmentStudyTime: DepartmentStudyTimeItem[];
  topStudyTimeSlots: TimeSlotItem[];
  courseStudyTime: CourseStudyTimeItem[];
  learnerStudyTime: LearnerStudyTimeItem[];
  statusBreakdown: {
    status: string;
    total: number;
  }[];
  filters: {
    departments: Department[];
    ranges: Option[];
    statuses: Option[];
  };
};

const defaultStudyTimeData: StudyTimeData = {
  summary: {
    totalStudyHours: 0,
    activeLearners: 0,
    avgHoursPerUser: 0,
    growthPercent: 0,
  },
  departmentStudyTime: [],
  topStudyTimeSlots: [],
  courseStudyTime: [],
  learnerStudyTime: [],
  statusBreakdown: [],
  filters: {
    departments: [],
    ranges: [
      { value: "7d", label: "7 ngày gần đây" },
      { value: "30d", label: "30 ngày gần đây" },
      { value: "90d", label: "90 ngày gần đây" },
      { value: "month", label: "Tháng này" },
      { value: "quarter", label: "Quý này" },
      { value: "year", label: "Năm nay" },
      { value: "all", label: "Tất cả thời gian" },
    ],
    statuses: [
      { value: "all", label: "Tất cả trạng thái" },
      { value: "not_started", label: "Chưa bắt đầu" },
      { value: "learning", label: "Đang học" },
      { value: "in_progress", label: "Đang tiến hành" },
      { value: "completed", label: "Hoàn thành" },
    ],
  },
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("vi-VN").format(Number(value || 0));
}

function formatHour(value: number) {
  const numberValue = Number(value || 0);

  return numberValue.toLocaleString("vi-VN", {
    minimumFractionDigits: numberValue % 1 === 0 ? 0 : 1,
    maximumFractionDigits: 1,
  });
}

function getStatusClass(status: string) {
  if (status === "Tích cực") {
    return "bg-green-100 text-green-700 border border-green-200";
  }

  if (status === "Ổn định") {
    return "bg-orange-100 text-orange-700 border border-orange-200";
  }

  return "bg-red-100 text-red-700 border border-red-200";
}

export default function LMSAdminReportStudyTimePage() {
  const [studyTimeData, setStudyTimeData] =
    useState<StudyTimeData>(defaultStudyTimeData);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedRange, setSelectedRange] = useState("7d");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const rangeOptions = useMemo(() => {
    return studyTimeData.filters?.ranges?.length
      ? studyTimeData.filters.ranges
      : defaultStudyTimeData.filters.ranges;
  }, [studyTimeData.filters?.ranges]);

  const departmentOptions = useMemo(() => {
    return studyTimeData.filters?.departments || [];
  }, [studyTimeData.filters?.departments]);

  const statusOptions = useMemo(() => {
    return studyTimeData.filters?.statuses?.length
      ? studyTimeData.filters.statuses
      : defaultStudyTimeData.filters.statuses;
  }, [studyTimeData.filters?.statuses]);

  const fetchStudyTimeReport = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const params = new URLSearchParams();

      params.append("range", selectedRange);

      if (searchTerm.trim()) {
        params.append("search", searchTerm.trim());
      }

      if (selectedDepartment !== "all") {
        params.append("department_id", selectedDepartment);
      }

      if (selectedStatus !== "all") {
        params.append("status", selectedStatus);
      }

      const requestUrl = apiUrl(`/study-time-report?${params.toString()}`);

      console.log("CALL STUDY TIME API:", requestUrl);

      const response = await fetch(requestUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      const result = await response.json();

      console.log("STUDY TIME RESULT:", result);

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Không thể lấy báo cáo thời gian học");
      }

      setStudyTimeData({
        ...defaultStudyTimeData,
        ...result.data,
        summary: {
          ...defaultStudyTimeData.summary,
          ...(result.data?.summary || {}),
        },
        departmentStudyTime: result.data?.departmentStudyTime || [],
        topStudyTimeSlots: result.data?.topStudyTimeSlots || [],
        courseStudyTime: result.data?.courseStudyTime || [],
        learnerStudyTime: result.data?.learnerStudyTime || [],
        statusBreakdown: result.data?.statusBreakdown || [],
        filters: {
          departments:
            result.data?.filters?.departments ||
            defaultStudyTimeData.filters.departments,
          ranges:
            result.data?.filters?.ranges || defaultStudyTimeData.filters.ranges,
          statuses:
            result.data?.filters?.statuses ||
            defaultStudyTimeData.filters.statuses,
        },
      });
    } catch (error: any) {
      console.error("fetchStudyTimeReport error:", error);
      setErrorMessage(error.message || "Không thể kết nối tới BE");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudyTimeReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRange, selectedDepartment, selectedStatus, searchTerm]);

  const handleSearch = () => {
    setSearchTerm(searchInput.trim());
  };

  const handleReset = () => {
    setSearchInput("");
    setSearchTerm("");
    setSelectedRange("7d");
    setSelectedDepartment("all");
    setSelectedStatus("all");
  };

  const handleExport = () => {
    const rows = [
      ["Báo cáo thời gian học tập"],
      [],
      ["Tổng thời gian học", `${studyTimeData.summary.totalStudyHours} giờ`],
      [
        "Nhân sự có hoạt động học",
        `${studyTimeData.summary.activeLearners}`,
      ],
      [
        "Giờ học trung bình/người",
        `${studyTimeData.summary.avgHoursPerUser} giờ`,
      ],
      ["Tăng trưởng", `${studyTimeData.summary.growthPercent}%`],
      [],
      ["Thời gian học theo phòng ban"],
      ["Phòng ban", "Nhân sự", "Tổng giờ", "TB giờ/người", "Tỷ lệ"],
      ...studyTimeData.departmentStudyTime.map((item) => [
        item.departmentName,
        item.employeeCount,
        item.totalHours,
        item.avgHours,
        `${item.percent}%`,
      ]),
      [],
      ["Khung giờ học nhiều nhất"],
      ["Thứ hạng", "Khung giờ", "Mô tả", "Tổng giờ", "Tỷ lệ"],
      ...studyTimeData.topStudyTimeSlots.map((item) => [
        item.rank,
        item.timeSlot,
        item.description,
        item.totalHours,
        `${item.percent}%`,
      ]),
      [],
      ["Thời gian học theo khóa học"],
      ["Khóa học", "Học viên", "Tổng giờ", "TB giờ/người", "Tỷ lệ"],
      ...studyTimeData.courseStudyTime.map((item) => [
        item.course,
        item.learners,
        item.hours,
        item.avg,
        `${item.progress}%`,
      ]),
      [],
      ["Nhân sự theo thời gian học"],
      ["Nhân sự", "Phòng ban", "Giờ học", "Bài học", "Học gần nhất", "Trạng thái"],
      ...studyTimeData.learnerStudyTime.map((item) => [
        item.name,
        item.department,
        item.hours,
        item.lessons,
        item.lastStudy,
        item.status,
      ]),
    ];

    const csvContent = rows
      .map((row) =>
        row
          .map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "bao-cao-thoi-gian-hoc-tap.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <AppShell workspace="lms-admin" title="Thời gian học tập">
      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
            <div>
              <p className="text-sm font-semibold text-orange-600">
                Study Time Analytics
              </p>

              <h1 className="mt-2 text-3xl font-bold text-slate-950">
                Báo cáo thời gian học tập
              </h1>

              <p className="mt-2 text-slate-500">
                Theo dõi thời lượng học của nhân viên theo phòng ban, khóa học,
                khung giờ và mức độ duy trì học tập.
              </p>
            </div>

            <button
              onClick={handleExport}
              className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-600"
            >
              <Download size={18} />
              Xuất báo cáo
            </button>
          </div>
        </section>

        {errorMessage && (
          <section className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle className="mt-0.5" size={18} />
            <div>
              <p className="font-bold">Không thể tải dữ liệu từ BE</p>
              <p>{errorMessage}</p>
            </div>
          </section>
        )}

        <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Clock3 className="text-orange-600" size={24} />

            <p className="mt-3 text-3xl font-bold text-slate-950">
              {loading
                ? "..."
                : `${formatHour(studyTimeData.summary.totalStudyHours)}h`}
            </p>

            <p className="text-sm text-slate-500">Tổng thời gian học</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Users className="text-orange-600" size={24} />

            <p className="mt-3 text-3xl font-bold text-slate-950">
              {loading
                ? "..."
                : formatNumber(studyTimeData.summary.activeLearners)}
            </p>

            <p className="text-sm text-slate-500">Nhân sự có hoạt động học</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Timer className="text-orange-600" size={24} />

            <p className="mt-3 text-3xl font-bold text-slate-950">
              {loading
                ? "..."
                : `${formatHour(studyTimeData.summary.avgHoursPerUser)}h`}
            </p>

            <p className="text-sm text-slate-500">Giờ học trung bình/người</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <TrendingUp className="text-orange-600" size={24} />

            <p className="mt-3 text-3xl font-bold text-slate-950">
              {loading
                ? "..."
                : `${
                    studyTimeData.summary.growthPercent > 0 ? "+" : ""
                  }${formatHour(studyTimeData.summary.growthPercent)}%`}
            </p>

            <p className="text-sm text-slate-500">Tăng so với tháng trước</p>
          </div>
        </section>

        <SectionCard title="Bộ lọc thời gian học">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_200px_200px_200px_120px]">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <Search size={18} className="text-slate-400" />

              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleSearch();
                  }
                }}
                placeholder="Tìm nhân viên, phòng ban hoặc khóa học..."
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>

            <select
              value={selectedRange}
              onChange={(event) => setSelectedRange(event.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
            >
              {rangeOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>

            <select
              value={selectedDepartment}
              onChange={(event) => setSelectedDepartment(event.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
            >
              <option value="all">Tất cả phòng ban</option>

              {departmentOptions.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(event) => setSelectedStatus(event.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
            >
              {statusOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>

            <div className="flex gap-2">
              <button
                onClick={handleSearch}
                className="flex flex-1 items-center justify-center rounded-xl bg-slate-950 px-3 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
                title="Tìm kiếm"
              >
                <Search size={17} />
              </button>

              <button
                onClick={handleReset}
                className="flex flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                title="Làm mới"
              >
                <RefreshCcw size={17} />
              </button>
            </div>
          </div>
        </SectionCard>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <SectionCard title="Thời gian học theo phòng ban">
            <div className="space-y-4">
              {loading && (
                <div className="rounded-2xl border border-slate-200 p-5 text-sm text-slate-500">
                  Đang tải dữ liệu phòng ban...
                </div>
              )}

              {!loading && studyTimeData.departmentStudyTime.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-200 p-5 text-center text-sm text-slate-500">
                  Chưa có dữ liệu thời gian học theo phòng ban.
                </div>
              )}

              {!loading &&
                studyTimeData.departmentStudyTime.map((item) => (
                  <div
                    key={item.departmentId || item.departmentName}
                    className="rounded-2xl border border-slate-200 p-5"
                  >
                    <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                      <div>
                        <h3 className="font-bold text-slate-950">
                          {item.departmentName}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          {formatNumber(item.employeeCount)} nhân sự · Tổng{" "}
                          {formatHour(item.totalHours)} giờ · TB{" "}
                          {formatHour(item.avgHours)} giờ/người
                        </p>
                      </div>

                      <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-bold text-orange-700">
                        {item.percent}%
                      </span>
                    </div>

                    <div className="mt-4">
                      <ProgressBar
                        value={Math.min(Math.max(item.percent, 0), 100)}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </SectionCard>

          <SectionCard title="Khung giờ học nhiều nhất">
            <div className="space-y-4">
              {loading && (
                <div className="rounded-2xl border border-slate-200 p-5 text-sm text-slate-500">
                  Đang tải dữ liệu khung giờ...
                </div>
              )}

              {!loading && studyTimeData.topStudyTimeSlots.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-200 p-5 text-center text-sm text-slate-500">
                  Chưa có dữ liệu khung giờ học.
                </div>
              )}

              {!loading &&
                studyTimeData.topStudyTimeSlots.map((item) => (
                  <div
                    key={`${item.rank}-${item.timeSlot}`}
                    className="rounded-2xl border border-slate-200 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-sm font-bold text-orange-600">
                        #{item.rank}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="font-bold text-slate-950">
                            {item.timeSlot}
                          </h3>

                          <span className="font-bold text-orange-600">
                            {item.percent}%
                          </span>
                        </div>

                        <p className="mt-1 text-sm text-slate-500">
                          {item.description}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Tổng {formatHour(item.totalHours)} giờ học
                        </p>

                        <div className="mt-3">
                          <ProgressBar
                            value={Math.min(Math.max(item.percent, 0), 100)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </SectionCard>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_1fr]">
          <SectionCard title="Thời gian học theo khóa học">
            <div className="space-y-4">
              {loading && (
                <div className="rounded-2xl border border-slate-200 p-5 text-sm text-slate-500">
                  Đang tải dữ liệu khóa học...
                </div>
              )}

              {!loading && studyTimeData.courseStudyTime.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-200 p-5 text-center text-sm text-slate-500">
                  Chưa có dữ liệu thời gian học theo khóa học.
                </div>
              )}

              {!loading &&
                studyTimeData.courseStudyTime.map((item) => (
                  <div
                    key={item.courseId || item.course}
                    className="rounded-2xl border border-slate-200 p-5"
                  >
                    <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                      <div>
                        <h3 className="font-bold text-slate-950">
                          {item.course}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          {formatNumber(item.learners)} học viên · Tổng{" "}
                          {formatHour(item.hours)} giờ · TB{" "}
                          {formatHour(item.avg)} giờ/người
                        </p>
                      </div>

                      <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-bold text-orange-700">
                        {item.progress}%
                      </span>
                    </div>

                    <div className="mt-4">
                      <ProgressBar
                        value={Math.min(Math.max(item.progress, 0), 100)}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </SectionCard>

          <SectionCard title="Nhân sự theo thời gian học">
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-slate-500">
                  <tr>
                    <th className="p-4">Nhân sự</th>
                    <th className="p-4">Phòng ban</th>
                    <th className="p-4">Giờ học</th>
                    <th className="p-4">Bài học</th>
                    <th className="p-4">Trạng thái</th>
                  </tr>
                </thead>

                <tbody>
                  {loading && (
                    <tr>
                      <td
                        colSpan={5}
                        className="border-t border-slate-100 p-5 text-center text-sm text-slate-500"
                      >
                        Đang tải dữ liệu nhân sự...
                      </td>
                    </tr>
                  )}

                  {!loading && studyTimeData.learnerStudyTime.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="border-t border-slate-100 p-5 text-center text-sm text-slate-500"
                      >
                        Chưa có dữ liệu nhân sự theo thời gian học.
                      </td>
                    </tr>
                  )}

                  {!loading &&
                    studyTimeData.learnerStudyTime.map((item) => (
                      <tr
                        key={item.userId || item.name}
                        className="border-t border-slate-100"
                      >
                        <td className="p-4">
                          <p className="font-bold text-slate-950">
                            {item.name}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            Học gần nhất: {item.lastStudy}
                          </p>
                        </td>

                        <td className="p-4 text-slate-600">
                          {item.department}
                        </td>

                        <td className="p-4 font-bold text-orange-600">
                          {formatHour(item.hours)}h
                        </td>

                        <td className="p-4 font-semibold">{item.lessons}</td>

                        <td className="p-4">
                          <span
                            className={`inline-flex min-w-[90px] items-center justify-center whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold ${getStatusClass(
                              item.status
                            )}`}
                          >
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </div>

        <SectionCard title="Gợi ý vận hành từ dữ liệu thời gian học">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {[
              {
                icon: Sun,
                title: "Ưu tiên khung giờ cao điểm",
                desc: studyTimeData.topStudyTimeSlots[0]?.timeSlot
                  ? `Khung ${studyTimeData.topStudyTimeSlots[0].timeSlot} đang có tỷ lệ học cao nhất.`
                  : "Chưa có đủ dữ liệu để xác định khung giờ học cao nhất.",
              },
              {
                icon: Moon,
                title: "Theo dõi học ngoài giờ",
                desc: "Có thể dùng dữ liệu khung giờ để đánh giá nhu cầu học ngoài giờ.",
              },
              {
                icon: BookOpen,
                title: "Tối ưu khóa học",
                desc:
                  studyTimeData.courseStudyTime[0]?.course
                    ? `Khóa "${studyTimeData.courseStudyTime[0].course}" đang có thời lượng học cao nhất.`
                    : "Cần thêm dữ liệu khóa học để phân tích mức độ tham gia.",
              },
              {
                icon: BarChart3,
                title: "Nhắc học tự động",
                desc: "Nhân sự có trạng thái Cần nhắc nên được gửi thông báo học tập định kỳ.",
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