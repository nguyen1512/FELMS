"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/lms/AppShell";
import CompetencyRadar from "@/components/lms/CompetencyRadar";
import SectionCard from "@/components/lms/SectionCard";
import StatCard from "@/components/lms/StatCard";
import {
  Award,
  BookOpen,
  CheckCircle2,
  Clock3,
  GraduationCap,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type MyCourse = {
  enrollment_id: string;
  progress_percent: number;
  enrollment_status: string;
  enrolled_at?: string;
  completed_at?: string | null;
  course_id: string;
  title: string;
  description?: string | null;
  level?: string | null;
  duration_minutes?: number | null;
  course_status?: string | null;
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

function getStatusLabel(status: string) {
  if (status === "completed") return "Đã hoàn thành";
  if (status === "learning") return "Đang học";
  return status || "Chưa bắt đầu";
}

function getStatusClass(status: string) {
  if (status === "completed") {
    return "bg-green-100 text-green-700 border border-green-200";
  }

  return "bg-orange-100 text-orange-700 border border-orange-200";
}

export default function EmployeePage() {
  const [courses, setCourses] = useState<MyCourse[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const stats = useMemo(() => {
    const total = courses.length;
    const completed = courses.filter(
      (item) => item.enrollment_status === "completed"
    ).length;
    const learning = courses.filter(
      (item) => item.enrollment_status === "learning"
    ).length;
    const avgProgress =
      total === 0
        ? 0
        : Math.round(
            courses.reduce(
              (sum, item) => sum + Number(item.progress_percent || 0),
              0
            ) / total
          );

    return [
      {
        title: "Khóa học",
        value: String(total),
        subtitle: "Đã được ghi danh",
        icon: BookOpen,
      },
      {
        title: "Đang học",
        value: String(learning),
        subtitle: "Khóa học đang thực hiện",
        icon: Clock3,
      },
      {
        title: "Hoàn thành",
        value: String(completed),
        subtitle: "Khóa học đã hoàn tất",
        icon: CheckCircle2,
      },
      {
        title: "Tiến độ TB",
        value: `${avgProgress}%`,
        subtitle: "Trung bình toàn bộ khóa",
        icon: Award,
      },
    ];
  }, [courses]);

  async function fetchMyLearning() {
    try {
      setLoading(true);
      setMessage("");

      const token = getToken();

      if (!token) {
        throw new Error("Không tìm thấy token đăng nhập.");
      }

      const response = await fetch(`${API_URL}/my-learning`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Không lấy được khóa học của tôi");
      }

      setCourses(data.courses || []);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Không lấy được khóa học"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMyLearning();
  }, []);

  return (
    <AppShell workspace="employee" title="Dashboard Học viên">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <StatCard key={item.title} {...item} />
        ))}
      </div>

      {message && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {message}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <SectionCard title="Kế hoạch học tập">
          <div className="flex items-center justify-center py-8">
            <div className="flex h-56 w-56 items-center justify-center rounded-full border-[28px] border-orange-400 bg-orange-50">
              <div className="text-center">
                <p className="text-5xl font-bold text-slate-900">
                  {courses.length}
                </p>
                <p className="text-sm text-slate-500">
                  Khóa học đang theo dõi
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-green-50 p-3 font-medium text-green-700">
              Đã hoàn thành:{" "}
              {
                courses.filter((item) => item.enrollment_status === "completed")
                  .length
              }
            </div>

            <div className="rounded-xl bg-blue-50 p-3 font-medium text-blue-700">
              Đang thực hiện:{" "}
              {
                courses.filter((item) => item.enrollment_status === "learning")
                  .length
              }
            </div>

            <div className="rounded-xl bg-yellow-50 p-3 font-medium text-yellow-700">
              Chưa bắt đầu:{" "}
              {
                courses.filter(
                  (item) => Number(item.progress_percent || 0) === 0
                ).length
              }
            </div>

            <div className="rounded-xl bg-red-50 p-3 font-medium text-red-700">
              Cần hoàn thành:{" "}
              {
                courses.filter(
                  (item) =>
                    item.enrollment_status !== "completed" &&
                    Number(item.progress_percent || 0) < 100
                ).length
              }
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Radar năng lực">
          <CompetencyRadar />
        </SectionCard>
      </div>

      <div className="mt-6">
        <SectionCard
          title={loading ? "Khóa học của tôi - Đang tải..." : "Khóa học của tôi"}
          action="Dữ liệu thật"
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) => (
              <div
                key={course.enrollment_id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                    <GraduationCap size={22} />
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusClass(
                      course.enrollment_status
                    )}`}
                  >
                    {getStatusLabel(course.enrollment_status)}
                  </span>
                </div>

                <h3 className="mt-4 text-lg font-bold text-slate-950">
                  {course.title}
                </h3>

                <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                  {course.description || "Chưa có mô tả khóa học"}
                </p>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">Trình độ</p>
                    <p className="mt-1 font-bold text-slate-950">
                      {course.level || "Cơ bản"}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">Thời lượng</p>
                    <p className="mt-1 font-bold text-slate-950">
                      {course.duration_minutes || 0} phút
                    </p>
                  </div>
                </div>

                <div className="mt-5">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-700">
                      Tiến độ học
                    </span>
                    <span className="font-bold text-orange-600">
                      {course.progress_percent || 0}%
                    </span>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-orange-500 transition-all"
                      style={{
                        width: `${Math.min(
                          Number(course.progress_percent || 0),
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                <Link
                  href={`/learning?enrollmentId=${course.enrollment_id}`}
                  className="mt-5 flex items-center justify-center rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-white hover:bg-orange-600"
                >
                  {course.progress_percent >= 100 ? "Xem lại khóa học" : "Vào học"}
                </Link>
              </div>
            ))}

            {courses.length === 0 && !loading && (
              <div className="col-span-full rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
                Bạn chưa được ghi danh vào khóa học nào.
              </div>
            )}
          </div>
        </SectionCard>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <SectionCard title="Đợt thi sắp tới">
          <div className="rounded-2xl border border-slate-200 p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-slate-900">
                  Kiểm tra sau khóa học
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Bài test sẽ mở khi hoàn thành 100% bài học.
                </p>
              </div>

              <button className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">
                Chi tiết
              </button>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Thành tích học tập">
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-2xl bg-orange-50 p-4">
              <div>
                <p className="text-sm text-slate-500">Khóa đã hoàn thành</p>
                <h3 className="mt-1 text-3xl font-bold text-orange-600">
                  {
                    courses.filter(
                      (item) => item.enrollment_status === "completed"
                    ).length
                  }
                </h3>
              </div>

              <div className="text-right">
                <p className="text-sm text-slate-500">Tổng tiến độ</p>
                <h3 className="mt-1 text-3xl font-bold text-slate-900">
                  {stats[3].value}
                </h3>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}