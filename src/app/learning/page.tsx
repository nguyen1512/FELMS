"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import AppShell from "@/components/lms/AppShell";
import SectionCard from "@/components/lms/SectionCard";
import {
  BookOpen,
  CheckCircle2,
  Clock3,
  FileText,
  PlayCircle,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type Enrollment = {
  enrollment_id: string;
  progress_percent: number;
  enrollment_status: string;
  course_id: string;
  title: string;
  description?: string | null;
  level?: string | null;
  duration_minutes?: number | null;
};

type Lesson = {
  id: string;
  title: string;
  description?: string | null;
  content_type?: string | null;
  content_url?: string | null;
  duration_minutes?: number | null;
  sort_order?: number | null;
  lesson_status?: string | null;
  progress_status: string;
  completed_at?: string | null;
  quiz_id?: string | null;
  quiz_title?: string | null;
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

function getLessonIcon(type?: string | null) {
  if (type === "document") return FileText;
  return PlayCircle;
}

function getProgressLabel(status: string) {
  if (status === "completed") return "Đã hoàn thành";
  if (status === "learning") return "Đang học";
  return "Chưa học";
}

export default function LearningPage() {
  const searchParams = useSearchParams();
  const enrollmentId = searchParams.get("enrollmentId") || "";

  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  const [loading, setLoading] = useState(false);
  const [updatingLessonId, setUpdatingLessonId] = useState("");
  const [message, setMessage] = useState("");

  const completedCount = useMemo(() => {
    return lessons.filter((lesson) => lesson.progress_status === "completed")
      .length;
  }, [lessons]);

  async function fetchLearningDetail() {
    try {
      setLoading(true);
      setMessage("");

      const token = getToken();

      if (!token) {
        throw new Error("Không tìm thấy token đăng nhập.");
      }

      if (!enrollmentId) {
        throw new Error("Thiếu enrollmentId trên URL.");
      }

      const response = await fetch(`${API_URL}/my-learning/${enrollmentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Không lấy được chi tiết khóa học");
      }

      setEnrollment(data.enrollment);
      setLessons(data.lessons || []);

      if (!activeLesson) {
        setActiveLesson(data.lessons?.[0] || null);
      }
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Không lấy được chi tiết khóa học"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleCompleteLesson(lesson: Lesson) {
    try {
      setUpdatingLessonId(lesson.id);
      setMessage("");

      const token = getToken();

      if (!token) {
        throw new Error("Không tìm thấy token đăng nhập.");
      }

      const response = await fetch(
        `${API_URL}/my-learning/${enrollmentId}/lessons/${lesson.id}/complete`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Cập nhật tiến độ thất bại");
      }

      await fetchLearningDetail();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Cập nhật tiến độ thất bại"
      );
    } finally {
      setUpdatingLessonId("");
    }
  }

  useEffect(() => {
    fetchLearningDetail();
  }, [enrollmentId]);

  return (
    <AppShell workspace="employee" title="Học tập">
      <div className="space-y-6">
        {message && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {message}
          </div>
        )}

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-orange-600">
            Learning Workspace
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            {loading ? "Đang tải khóa học..." : enrollment?.title || "Khóa học"}
          </h1>

          <p className="mt-2 text-slate-500">
            {enrollment?.description || "Theo dõi bài học và tiến độ hoàn thành."}
          </p>

          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="rounded-2xl bg-orange-50 p-4">
              <BookOpen className="text-orange-600" size={22} />
              <p className="mt-2 text-2xl font-bold text-slate-950">
                {lessons.length}
              </p>
              <p className="text-sm text-slate-500">Tổng bài học</p>
            </div>

            <div className="rounded-2xl bg-green-50 p-4">
              <CheckCircle2 className="text-green-600" size={22} />
              <p className="mt-2 text-2xl font-bold text-slate-950">
                {completedCount}
              </p>
              <p className="text-sm text-slate-500">Đã hoàn thành</p>
            </div>

            <div className="rounded-2xl bg-blue-50 p-4">
              <Clock3 className="text-blue-600" size={22} />
              <p className="mt-2 text-2xl font-bold text-slate-950">
                {enrollment?.duration_minutes || 0}
              </p>
              <p className="text-sm text-slate-500">Phút học</p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-3xl font-bold text-orange-600">
                {enrollment?.progress_percent || 0}%
              </p>
              <p className="text-sm text-slate-500">Tiến độ</p>
            </div>
          </div>

          <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-orange-500 transition-all"
              style={{
                width: `${Math.min(
                  Number(enrollment?.progress_percent || 0),
                  100
                )}%`,
              }}
            />
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_420px]">
          <SectionCard title="Nội dung bài học">
            {activeLesson ? (
              <div className="space-y-5">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-orange-600">
                        Bài {activeLesson.sort_order || 1}
                      </p>

                      <h2 className="mt-2 text-2xl font-bold text-slate-950">
                        {activeLesson.title}
                      </h2>

                      <p className="mt-3 leading-7 text-slate-600">
                        {activeLesson.description || "Chưa có mô tả bài học."}
                      </p>
                    </div>

                    <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600">
                      {getProgressLabel(activeLesson.progress_status)}
                    </span>
                  </div>
                </div>

                {activeLesson.content_type === "video" && (
                  <div className="flex aspect-video items-center justify-center rounded-2xl bg-slate-900 text-white">
                    <div className="text-center">
                      <PlayCircle className="mx-auto mb-3" size={52} />
                      <p className="font-bold">Video bài học</p>
                      <p className="mt-1 text-sm text-slate-300">
                        {activeLesson.content_url || "Chưa gắn link video"}
                      </p>
                    </div>
                  </div>
                )}

                {activeLesson.content_type !== "video" && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    <FileText className="text-orange-600" size={28} />
                    <p className="mt-3 font-bold text-slate-950">
                      Tài liệu bài học
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                      {activeLesson.content_url || "Chưa gắn link tài liệu"}
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  disabled={
                    activeLesson.progress_status === "completed" ||
                    updatingLessonId === activeLesson.id
                  }
                  onClick={() => handleCompleteLesson(activeLesson)}
                  className="w-full rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {activeLesson.progress_status === "completed"
                    ? "Bài học đã hoàn thành"
                    : updatingLessonId === activeLesson.id
                    ? "Đang cập nhật..."
                    : "Đánh dấu hoàn thành bài học"}

                  {activeLesson.quiz_id && (
                    <a
                      href={`/quiz/${activeLesson.quiz_id}`}
                      className="block w-full rounded-xl bg-slate-900 px-5 py-3 text-center text-sm font-bold text-white hover:bg-slate-700"
                    >
                      Làm quiz: {activeLesson.quiz_title || "Bài kiểm tra"}
                    </a>
                  )}  
                </button>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
                Chưa có bài học nào trong khóa học này.
              </div>
            )}
          </SectionCard>

          <SectionCard title="Danh sách bài học">
            <div className="space-y-3">
              {lessons.map((lesson) => {
                const Icon = getLessonIcon(lesson.content_type);
                const active = activeLesson?.id === lesson.id;
                const completed = lesson.progress_status === "completed";

                return (
                  <button
                    key={lesson.id}
                    type="button"
                    onClick={() => setActiveLesson(lesson)}
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      active
                        ? "border-orange-400 bg-orange-50"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                          completed
                            ? "bg-green-100 text-green-600"
                            : "bg-orange-100 text-orange-600"
                        }`}
                      >
                        {completed ? <CheckCircle2 size={20} /> : <Icon size={20} />}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-slate-950">
                          {lesson.sort_order}. {lesson.title}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          {lesson.duration_minutes || 0} phút ·{" "}
                          {getProgressLabel(lesson.progress_status)}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}

              {lessons.length === 0 && !loading && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-slate-500">
                  Chưa có bài học.
                </div>
              )}
            </div>
          </SectionCard>
        </div>
      </div>
    </AppShell>
  );
}