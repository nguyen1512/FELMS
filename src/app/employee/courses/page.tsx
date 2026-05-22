"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/lms/AppShell";
import {
  AlertCircle,
  BookOpen,
  Clock,
  Loader2,
  PlayCircle,
  Search,
  Star,
  TrendingUp,
} from "lucide-react";

type CourseItem = {
  id: string;
  title: string;
  description?: string | null;
  thumbnail_url?: string | null;
  category?: string | null;
  progress?: number;
  lessons?: number;
  duration?: string | null;
  status?: string | null;
};

function getApiBase() {
  const raw =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "http://localhost:5000/api";

  const base = raw.replace(/\/$/, "");
  return base.endsWith("/api") ? base : `${base}/api`;
}

function getCookie(name: string) {
  if (typeof document === "undefined") return null;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() || null;
  }

  return null;
}

function getCurrentUserId() {
  try {
    if (typeof window === "undefined") return null;

    const localUser = localStorage.getItem("user");
    const cookieUser = getCookie("user");
    const rawUser = localUser || cookieUser;

    if (!rawUser) return null;

    const user = JSON.parse(decodeURIComponent(rawUser));
    return user?.id || user?.user_id || null;
  } catch {
    return null;
  }
}

function normalizeCourses(json: any): CourseItem[] {
  const raw =
    json?.data?.courses ||
    json?.data?.items ||
    json?.data ||
    json?.courses ||
    json?.items ||
    json;

  if (!Array.isArray(raw)) return [];

  return raw
    .map((item: any) => {
      const id = item.id || item.course_id;

      if (!id) return null;

      return {
        id: String(id),
        title: item.title || item.name || "Khóa học chưa có tên",
        description: item.description || item.short_description || null,
        thumbnail_url: item.thumbnail_url || item.image_url || null,
        category:
          item.category ||
          item.category_name ||
          item.type ||
          item.level ||
          "Khóa học",
        progress: Number(item.progress || item.progress_percent || 0),
        lessons: Number(
          item.lessons || item.total_lessons || item.lesson_count || 0
        ),
        duration: item.duration || item.total_duration || null,
        status: item.status || "Đang học",
      };
    })
    .filter(Boolean) as CourseItem[];
}

async function fetchCourses(userId: string | null) {
  const API_BASE = getApiBase();

  const urls = [
    userId
      ? `${API_BASE}/employee-learning/my-courses?user_id=${encodeURIComponent(
          userId
        )}`
      : `${API_BASE}/employee-learning/my-courses`,
    `${API_BASE}/courses`,
    `${API_BASE}/lms-admin/courses`,
  ];

  let lastError = "";

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(userId ? { "x-user-id": userId } : {}),
        },
        cache: "no-store",
      });

      if (!res.ok) {
        lastError = `API lỗi ${res.status}: ${url}`;
        continue;
      }

      const json = await res.json();
      return normalizeCourses(json);
    } catch {
      lastError = `Không gọi được API: ${url}`;
    }
  }

  throw new Error(lastError || "Không lấy được danh sách khóa học");
}

export default function EmployeeCoursesPage() {
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadCourses() {
    try {
      setLoading(true);
      setError("");

      const userId = getCurrentUserId();
      const data = await fetchCourses(userId);

      setCourses(data);
    } catch (err: any) {
      setError(err?.message || "Không lấy được danh sách khóa học");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCourses();
  }, []);

  const filteredCourses = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return courses;

    return courses.filter((course) =>
      `${course.title} ${course.description || ""} ${course.category || ""}`
        .toLowerCase()
        .includes(keyword)
    );
  }, [courses, search]);

  const averageProgress = useMemo(() => {
    if (courses.length === 0) return 0;

    const total = courses.reduce(
      (sum, course) => sum + Number(course.progress || 0),
      0
    );

    return Math.round(total / courses.length);
  }, [courses]);

  return (
    <AppShell workspace="employee" title="Khóa đang học">
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-orange-500">
              Quản lý khóa học
            </p>

            <h1 className="mt-1 text-2xl font-bold text-slate-900">
              Khóa đang học
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Theo dõi các khóa học bạn đang tham gia và tiếp tục học tập.
            </p>
          </div>

          <div className="flex w-full items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm lg:w-[360px]">
            <Search size={18} className="text-slate-400" />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm kiếm khóa học..."
              className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Khóa đang học</p>
                <h2 className="mt-1 text-2xl font-bold text-slate-900">
                  {courses.length}
                </h2>
              </div>

              <div className="rounded-xl bg-orange-50 p-3 text-orange-500">
                <BookOpen size={22} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Tiến độ trung bình</p>
                <h2 className="mt-1 text-2xl font-bold text-slate-900">
                  {averageProgress}%
                </h2>
              </div>

              <div className="rounded-xl bg-blue-50 p-3 text-blue-500">
                <TrendingUp size={22} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Đánh giá học tập</p>
                <h2 className="mt-1 text-2xl font-bold text-slate-900">4.8</h2>
              </div>

              <div className="rounded-xl bg-yellow-50 p-3 text-yellow-500">
                <Star size={22} />
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
            <div className="flex items-center gap-3 text-slate-500">
              <Loader2 className="animate-spin" size={22} />
              <span>Đang tải danh sách khóa học...</span>
            </div>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-red-700">
            <div className="flex items-start gap-3">
              <AlertCircle size={22} />

              <div>
                <p className="font-semibold">Chưa lấy được dữ liệu khóa học</p>
                <p className="mt-1 text-sm">{error}</p>

                <button
                  type="button"
                  onClick={loadCourses}
                  className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                >
                  Tải lại
                </button>
              </div>
            </div>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <div>
              <BookOpen className="mx-auto text-slate-300" size={42} />

              <h3 className="mt-4 text-lg font-bold text-slate-900">
                Chưa có khóa học
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Hiện chưa tìm thấy khóa học phù hợp để hiển thị.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex h-36 items-center justify-center bg-gradient-to-br from-orange-400 to-orange-600 text-white">
                  {course.thumbnail_url ? (
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <BookOpen size={42} />
                  )}
                </div>

                <div className="p-5">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600">
                      {course.category || "Khóa học"}
                    </span>

                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                      {course.status || "Đang học"}
                    </span>
                  </div>

                  <h3 className="line-clamp-2 text-base font-bold text-slate-900">
                    {course.title}
                  </h3>

                  <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                    {course.description || "Chưa có mô tả cho khóa học này."}
                  </p>

                  <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
                    <div className="flex items-center gap-1">
                      <BookOpen size={15} />
                      <span>{course.lessons || 0} bài học</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Clock size={15} />
                      <span>{course.duration || "Chưa rõ"}</span>
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-slate-500">Tiến độ</span>
                      <span className="font-semibold text-slate-800">
                        {course.progress || 0}%
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-orange-500"
                        style={{ width: `${course.progress || 0}%` }}
                      />
                    </div>
                  </div>

                  <Link
                    href={`/employee/courses/${course.id}`}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
                  >
                    <PlayCircle size={18} />
                    Vào học
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </AppShell>
  );
}