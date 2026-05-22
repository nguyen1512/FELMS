"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/lms/AppShell";
import SectionCard from "@/components/lms/SectionCard";
import {
  AlertCircle,
  ArrowRight,
  Award,
  BookOpen,
  Brain,
  CheckCircle2,
  Clock3,
  Flag,
  GraduationCap,
  Loader2,
  Rocket,
  Star,
  Target,
  TrendingUp,
} from "lucide-react";

type Summary = {
  currentLevel: string;
  nextLevel: string;
  relatedCourses: number;
  progressPercent: number;
};

type RoadmapItem = {
  id?: string;
  title: string;
  description?: string;
  desc?: string;
  status: string;
};

type CompetencyItem = {
  name?: string;
  label?: string;
  percent?: number;
  value?: number;
};

type RecommendedCourse = {
  id?: string;
  title: string;
  description?: string;
  level?: string;
  duration?: string;
  durationMinutes?: number;
  lessonCount?: number;
  progress?: number;
  status?: string;
};

type Achievement = {
  id?: string;
  title: string;
  description?: string;
  desc?: string;
  value?: string | number;
};

type DevelopmentPathData = {
  summary: Summary;
  roadmap: RoadmapItem[];
  competency: CompetencyItem[];
  recommendedCourses: RecommendedCourse[];
  achievements: Achievement[];
};

const defaultData: DevelopmentPathData = {
  summary: {
    currentLevel: "Level 1",
    nextLevel: "Level 2",
    relatedCourses: 0,
    progressPercent: 0,
  },
  roadmap: [],
  competency: [],
  recommendedCourses: [],
  achievements: [],
};

const BACKEND_URL = "http://localhost:5000";

function getStoredUserId() {
  if (typeof window === "undefined") return "";

  const directKeys = [
    "userId",
    "user_id",
    "lms_user_id",
    "currentUserId",
  ];

  for (const key of directKeys) {
    const value = localStorage.getItem(key);

    if (value && value !== "undefined" && value !== "null") {
      return value;
    }
  }

  const objectKeys = [
    "user",
    "currentUser",
    "authUser",
    "lms_user",
    "auth",
  ];

  for (const key of objectKeys) {
    const raw = localStorage.getItem(key);

    if (!raw) continue;

    try {
      const parsed = JSON.parse(raw);

      const id =
        parsed?.id ||
        parsed?.user_id ||
        parsed?.userId ||
        parsed?.user?.id ||
        parsed?.user?.user_id ||
        parsed?.data?.id ||
        parsed?.data?.user_id;

      if (id) return String(id);
    } catch {
      continue;
    }
  }

  return "";
}

async function fetchJsonSafe(url: string, userId?: string) {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      ...(userId ? { "x-user-id": userId } : {}),
    },
    cache: "no-store",
  });

  const text = await response.text();

  let result: any = null;

  try {
    result = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(
      `BE không trả về JSON hợp lệ. Status: ${response.status}`
    );
  }

  if (!response.ok) {
    throw new Error(
      result?.message ||
        result?.error ||
        `Lỗi API. Status: ${response.status}`
    );
  }

  if (!result?.success) {
    throw new Error(
      result?.message ||
        result?.error ||
        "Không thể lấy dữ liệu từ BE"
    );
  }

  return result;
}

function normalizeStatus(status: string) {
  if (status === "completed" || status === "done") return "done";

  if (
    status === "in_progress" ||
    status === "active" ||
    status === "learning"
  ) {
    return "active";
  }

  return "upcoming";
}

function getMilestoneClass(status: string) {
  const normalizedStatus = normalizeStatus(status);

  if (normalizedStatus === "done") {
    return "bg-green-100 border-green-200";
  }

  if (normalizedStatus === "active") {
    return "bg-orange-100 border-orange-200";
  }

  return "bg-slate-100 border-slate-200";
}

function getDotClass(status: string) {
  const normalizedStatus = normalizeStatus(status);

  if (normalizedStatus === "done") {
    return "bg-green-500";
  }

  if (normalizedStatus === "active") {
    return "bg-orange-500";
  }

  return "bg-slate-400";
}

function getProgressValue(value: unknown) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) return 0;
  if (numberValue < 0) return 0;
  if (numberValue > 100) return 100;

  return Math.round(numberValue);
}

export default function EmployeeDevelopmentPathPage() {
  const [data, setData] = useState<DevelopmentPathData>(defaultData);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchDevelopmentPath = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const userId = getStoredUserId();

      const url = new URL(`${BACKEND_URL}/api/employee/development-path`);

      if (userId) {
        url.searchParams.set("userId", userId);
      }

      const result = await fetchJsonSafe(url.toString(), userId);

      setData({
        summary: {
          ...defaultData.summary,
          ...(result?.data?.summary || {}),
        },
        roadmap: Array.isArray(result?.data?.roadmap)
          ? result.data.roadmap
          : [],
        competency: Array.isArray(result?.data?.competency)
          ? result.data.competency
          : [],
        recommendedCourses: Array.isArray(result?.data?.recommendedCourses)
          ? result.data.recommendedCourses
          : [],
        achievements: Array.isArray(result?.data?.achievements)
          ? result.data.achievements
          : [],
      });
    } catch (error: any) {
      console.error("Fetch development path error:", error);

      setErrorMessage(
        error?.message || "Không thể kết nối dữ liệu lộ trình."
      );

      setData(defaultData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevelopmentPath();
  }, []);

  const summary = data.summary;

  const competency = useMemo(() => {
    if (data.competency.length > 0) return data.competency;

    return [
      { name: "CRM & vận hành", percent: 0 },
      { name: "Tư vấn học viên", percent: 0 },
      { name: "Xử lý phụ huynh", percent: 0 },
      { name: "Quản lý lớp học", percent: 0 },
    ];
  }, [data.competency]);

  const achievements = useMemo(() => {
    if (data.achievements.length > 0) return data.achievements;

    return [
      {
        id: "empty-1",
        title: "Chưa có thành tích",
        description: "Hoàn thành thêm khóa học để ghi nhận thành tích.",
      },
      {
        id: "empty-2",
        title: "0 chứng chỉ",
        description: "Chưa có chứng chỉ được ghi nhận.",
      },
      {
        id: "empty-3",
        title: "Mục tiêu đang cập nhật",
        description: "Hệ thống sẽ cập nhật khi có dữ liệu học tập.",
      },
      {
        id: "empty-4",
        title: "Năng lực đang cập nhật",
        description: "Chưa đủ dữ liệu để xác định năng lực nổi bật.",
      },
    ];
  }, [data.achievements]);

  return (
    <AppShell workspace="employee" title="Lộ trình phát triển">
      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
            <div>
              <p className="text-sm font-semibold text-orange-600">
                Personal Development
              </p>

              <h1 className="mt-2 text-3xl font-bold text-slate-950">
                Lộ trình phát triển cá nhân
              </h1>

              <p className="mt-2 max-w-3xl text-slate-500">
                Theo dõi năng lực hiện tại, mục tiêu phát triển và các khóa học
                cần hoàn thành để nâng cấp kỹ năng chuyên môn trong hệ thống
                AnU LMS.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchDevelopmentPath}
              className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Rocket size={18} />
              )}
              Cập nhật mục tiêu
            </button>
          </div>
        </section>

        {errorMessage && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle className="mt-0.5 shrink-0" size={18} />
            <div>
              <p className="font-bold">Không tải được dữ liệu từ BE</p>
              <p className="mt-1">{errorMessage}</p>
            </div>
          </div>
        )}

        <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Award className="text-orange-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {loading ? "..." : summary.currentLevel}
            </p>
            <p className="text-sm text-slate-500">Năng lực hiện tại</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Target className="text-orange-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {loading ? "..." : summary.nextLevel}
            </p>
            <p className="text-sm text-slate-500">Mục tiêu tiếp theo</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <BookOpen className="text-orange-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {loading ? "..." : summary.relatedCourses}
            </p>
            <p className="text-sm text-slate-500">Khóa học liên quan</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <TrendingUp className="text-green-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {loading
                ? "..."
                : `+${getProgressValue(summary.progressPercent)}%`}
            </p>
            <p className="text-sm text-slate-500">Tiến bộ năng lực</p>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_380px]">
          <SectionCard title="Lộ trình phát triển">
            {loading ? (
              <div className="flex items-center justify-center rounded-2xl border border-dashed border-slate-200 p-10 text-slate-500">
                <Loader2 className="mr-2 animate-spin" size={18} />
                Đang tải lộ trình phát triển...
              </div>
            ) : data.roadmap.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
                Chưa có dữ liệu lộ trình phát triển.
              </div>
            ) : (
              <div className="relative ml-2 space-y-6 border-l-2 border-dashed border-slate-200 pl-8">
                {data.roadmap.map((item, index) => {
                  const normalizedStatus = normalizeStatus(item.status);

                  return (
                    <div
                      key={item.id || `${item.title}-${index}`}
                      className="relative"
                    >
                      <div
                        className={`absolute -left-[42px] top-2 h-4 w-4 rounded-full ${getDotClass(
                          item.status
                        )}`}
                      />

                      <div
                        className={`rounded-2xl border p-5 ${getMilestoneClass(
                          item.status
                        )}`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-bold text-slate-950">
                              {item.title}
                            </h3>

                            <p className="mt-2 text-sm leading-6 text-slate-600">
                              {item.description ||
                                item.desc ||
                                "Chưa cập nhật mô tả."}
                            </p>
                          </div>

                          {normalizedStatus === "done" && (
                            <CheckCircle2
                              className="shrink-0 text-green-600"
                              size={22}
                            />
                          )}

                          {normalizedStatus === "active" && (
                            <Clock3
                              className="shrink-0 text-orange-600"
                              size={22}
                            />
                          )}

                          {normalizedStatus === "upcoming" && (
                            <Flag
                              className="shrink-0 text-slate-500"
                              size={22}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>

          <SectionCard title="Thông tin phát triển">
            <div className="space-y-4">
              <div className="rounded-2xl bg-orange-50 p-5">
                <div className="flex items-center gap-3">
                  <Brain className="text-orange-600" size={22} />
                  <h3 className="font-bold text-slate-950">
                    Radar năng lực
                  </h3>
                </div>

                <div className="mt-5 space-y-4">
                  {competency.map((item, index) => {
                    const label =
                      item.name || item.label || `Năng lực ${index + 1}`;

                    const value = getProgressValue(
                      item.percent ?? item.value
                    );

                    return (
                      <div key={label}>
                        <div className="mb-2 flex justify-between text-sm">
                          <span className="font-medium text-slate-700">
                            {label}
                          </span>

                          <span className="font-bold text-orange-600">
                            {loading ? "..." : `${value}%`}
                          </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-white">
                          <div
                            className="h-full rounded-full bg-orange-500"
                            style={{ width: `${loading ? 0 : value}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 p-5">
                <div className="flex items-center gap-3">
                  <GraduationCap className="text-orange-600" size={22} />

                  <h3 className="font-bold text-slate-950">
                    Định hướng nghề nghiệp
                  </h3>
                </div>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Hệ thống đề xuất bạn tiếp tục phát triển theo hướng:
                </p>

                <div className="mt-4 flex items-center gap-3 rounded-xl bg-slate-50 p-4">
                  <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
                    Hiện tại
                  </span>

                  <ArrowRight className="text-slate-400" size={18} />

                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                    Senior CM
                  </span>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>

        <SectionCard title="Khóa học đề xuất cho bạn">
          {loading ? (
            <div className="flex items-center justify-center rounded-2xl border border-dashed border-slate-200 p-10 text-slate-500">
              <Loader2 className="mr-2 animate-spin" size={18} />
              Đang tải khóa học đề xuất...
            </div>
          ) : data.recommendedCourses.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
              Chưa có khóa học đề xuất. Hãy kiểm tra lại dữ liệu khóa học trong
              trang quản trị LMS.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
              {data.recommendedCourses.map((course, index) => {
                const progress = getProgressValue(course.progress);

                return (
                  <div
                    key={course.id || `${course.title}-${index}`}
                    className="rounded-2xl border border-slate-200 bg-white p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
                        <BookOpen size={22} />
                      </div>

                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                        {course.level || "Cơ bản"}
                      </span>
                    </div>

                    <h3 className="mt-4 text-lg font-bold text-slate-950">
                      {course.title}
                    </h3>

                    {course.description && (
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                        {course.description}
                      </p>
                    )}

                    <div className="mt-4">
                      <div className="mb-2 flex justify-between text-sm">
                        <span className="text-slate-500">Tiến độ</span>

                        <span className="font-bold text-orange-600">
                          {progress}%
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-orange-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
                      <span>{course.duration || "Chưa cập nhật"}</span>

                      <span>{course.lessonCount || 0} bài học</span>
                    </div>

                    <button
                      type="button"
                      className="mt-5 w-full rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-white hover:bg-orange-600"
                    >
                      Tiếp tục học
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Thành tích phát triển">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {achievements.map((item, index) => {
              const icons = [Star, Award, Rocket, Brain];
              const Icon = icons[index % icons.length];

              return (
                <div
                  key={item.id || `${item.title}-${index}`}
                  className="rounded-2xl border border-slate-200 p-5"
                >
                  <Icon className="text-orange-600" size={22} />

                  <h3 className="mt-3 font-bold text-slate-950">
                    {loading ? "Đang tải..." : item.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {item.description || item.desc || "Chưa cập nhật mô tả."}
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