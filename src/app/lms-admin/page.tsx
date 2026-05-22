"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/lms/AppShell";
import SectionCard from "@/components/lms/SectionCard";
import StatCard from "@/components/lms/StatCard";
import {
  BookOpen,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Plus,
  RefreshCw,
  Trophy,
  Users,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type LmsStats = {
  totalUsers: number;
  totalCourses: number;
  learnedHours: number;
  completionRate: number;
};

type RecentCourse = {
  id: string;
  title: string;
  level?: string | null;
  status?: string | null;
  duration_minutes?: number | null;
  created_at?: string;
};

type RecentEnrollment = {
  id: string;
  progress_percent: number;
  status: string;
  enrolled_at?: string;
  full_name: string;
  email: string;
  course_title: string;
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
  return new Date(value).toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour12: false,
  });
}

function getStatusLabel(status?: string | null) {
  if (status === "published") return "Đã xuất bản";
  if (status === "draft") return "Bản nháp";
  if (status === "completed") return "Hoàn thành";
  if (status === "learning") return "Đang học";
  return status || "Không rõ";
}

function getStatusClass(status?: string | null) {
  if (status === "published" || status === "completed") {
    return "bg-green-100 text-green-700 border border-green-200";
  }

  if (status === "learning") {
    return "bg-orange-100 text-orange-700 border border-orange-200";
  }

  return "bg-slate-100 text-slate-700 border border-slate-200";
}

export default function LmsAdminDashboardPage() {
  const [stats, setStats] = useState<LmsStats>({
    totalUsers: 0,
    totalCourses: 0,
    learnedHours: 0,
    completionRate: 0,
  });

  const [recentCourses, setRecentCourses] = useState<RecentCourse[]>([]);
  const [recentEnrollments, setRecentEnrollments] = useState<RecentEnrollment[]>(
    []
  );

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const statCards = useMemo(
    () => [
      {
        title: "Nhân sự",
        value: String(stats.totalUsers),
        subtitle: "Người học trong LMS",
        icon: Users,
      },
      {
        title: "Khóa học",
        value: String(stats.totalCourses),
        subtitle: "Khóa học đã tạo",
        icon: BookOpen,
      },
      {
        title: "Giờ đã học",
        value: String(stats.learnedHours),
        subtitle: "Tổng thời lượng học",
        icon: Clock3,
      },
      {
        title: "Tỷ lệ hoàn thành",
        value: `${stats.completionRate}%`,
        subtitle: "Toàn hệ thống LMS",
        icon: Trophy,
      },
    ],
    [stats]
  );

  async function fetchDashboard() {
    try {
      setLoading(true);
      setMessage("");

      const token = getToken();

      if (!token) {
        throw new Error("Không tìm thấy token đăng nhập.");
      }

      const response = await fetch(`${API_URL}/lms-dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Không lấy được dashboard LMS");
      }

      setStats(data.stats || {});
      setRecentCourses(data.recentCourses || []);
      setRecentEnrollments(data.recentEnrollments || []);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Không lấy được dashboard LMS"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDashboard();
  }, []);

  return (
    <AppShell workspace="lms-admin" title="Dashboard Quản trị LMS">
      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
            <div>
              <p className="text-sm font-semibold text-orange-600">Dashboard</p>

              <h1 className="mt-2 text-3xl font-bold text-slate-950">
                Dashboard Quản trị LMS
              </h1>

              <p className="mt-2 text-slate-500">
                Theo dõi tổng quan người học, khóa học, ghi danh và tiến độ hoàn
                thành trong hệ thống.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchDashboard}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-60"
            >
              <RefreshCw size={18} />
              {loading ? "Đang tải..." : "Làm mới"}
            </button>
          </div>
        </section>

        {message && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {message}
          </div>
        )}

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {statCards.map((item) => (
            <StatCard key={item.title} {...item} />
          ))}
        </section>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <SectionCard title="Khóa học gần đây" action="Dữ liệu thật">
            <div className="space-y-3">
              {recentCourses.map((course) => (
                <div
                  key={course.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                        <GraduationCap size={22} />
                      </div>

                      <div>
                        <h3 className="font-bold text-slate-950">
                          {course.title}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          {course.level || "Cơ bản"} ·{" "}
                          {course.duration_minutes || 0} phút
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Tạo lúc: {formatDate(course.created_at)}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${getStatusClass(
                        course.status
                      )}`}
                    >
                      {getStatusLabel(course.status)}
                    </span>
                  </div>
                </div>
              ))}

              {recentCourses.length === 0 && !loading && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-slate-500">
                  Chưa có khóa học nào.
                </div>
              )}
            </div>
          </SectionCard>

          <SectionCard title="Hiệu suất hoàn thành">
            <div className="rounded-2xl bg-orange-50 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-orange-700">
                    Tỷ lệ hoàn thành toàn hệ thống
                  </p>

                  <h2 className="mt-3 text-5xl font-bold text-orange-600">
                    {stats.completionRate}%
                  </h2>
                </div>

                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-orange-600">
                  <Trophy size={32} />
                </div>
              </div>

              <div className="mt-5 h-4 overflow-hidden rounded-full bg-white">
                <div
                  className="h-full rounded-full bg-orange-500 transition-all"
                  style={{
                    width: `${Math.min(Number(stats.completionRate || 0), 100)}%`,
                  }}
                />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-slate-200 p-4">
                <Clock3 className="text-blue-600" size={22} />
                <p className="mt-2 text-2xl font-bold text-slate-950">
                  {stats.learnedHours}
                </p>
                <p className="text-sm text-slate-500">Giờ học hoàn thành</p>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4">
                <CheckCircle2 className="text-green-600" size={22} />
                <p className="mt-2 text-2xl font-bold text-slate-950">
                  {recentEnrollments.filter((e) => e.status === "completed").length}
                </p>
                <p className="text-sm text-slate-500">Ghi danh hoàn thành gần đây</p>
              </div>
            </div>
          </SectionCard>
        </div>

        <SectionCard title="Ghi danh gần đây" action="Enrollments">
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="p-4">Nhân sự</th>
                  <th className="p-4">Khóa học</th>
                  <th className="p-4 text-center">Tiến độ</th>
                  <th className="p-4 text-center">Trạng thái</th>
                  <th className="p-4">Ngày ghi danh</th>
                </tr>
              </thead>

              <tbody>
                {recentEnrollments.map((item) => (
                  <tr key={item.id} className="border-t border-slate-100">
                    <td className="p-4">
                      <p className="font-bold text-slate-950">
                        {item.full_name}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {item.email}
                      </p>
                    </td>

                    <td className="p-4 font-semibold text-slate-700">
                      {item.course_title}
                    </td>

                    <td className="p-4 text-center">
                      <span className="font-bold text-orange-600">
                        {item.progress_percent || 0}%
                      </span>
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

                    <td className="p-4 text-slate-500">
                      {formatDate(item.enrolled_at)}
                    </td>
                  </tr>
                ))}

                {recentEnrollments.length === 0 && !loading && (
                  <tr>
                    <td className="p-6 text-center text-slate-500" colSpan={5}>
                      Chưa có ghi danh nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <SectionCard title="Tạo nhanh khóa học">
            <div className="space-y-3">
              <input
                placeholder="Tên khóa học"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
              />

              <select className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none">
                <option>Phòng ban áp dụng</option>
                <option>Nhân sự</option>
                <option>Đào tạo</option>
                <option>Kinh doanh</option>
              </select>

              <textarea
                rows={4}
                placeholder="Mô tả khóa học..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
              />

              <button className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600">
                <Plus size={18} />
                Tạo khóa học
              </button>
            </div>
          </SectionCard>

          <SectionCard title="Upload tài nguyên">
            <div className="rounded-2xl border border-dashed border-orange-300 bg-orange-50 p-8 text-center">
              <BookOpen className="mx-auto text-orange-600" size={36} />

              <p className="mt-3 font-bold text-slate-950">
                Kéo thả video hoặc tài liệu
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Hỗ trợ video bài giảng, PDF, Excel câu hỏi và tài liệu nội bộ.
              </p>

              <button className="mt-5 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600">
                Chọn file upload
              </button>
            </div>
          </SectionCard>

          <SectionCard title="Phân quyền nội dung">
            <div className="space-y-3">
              {[
                "Admin xem toàn bộ hệ thống",
                "Trưởng phòng upload bài giảng",
                "Nhân viên xem khóa được giao",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-xl bg-slate-50 p-4"
                >
                  <CheckCircle2 className="text-green-600" size={18} />
                  <span className="text-sm font-medium text-slate-700">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </AppShell>
  );
}