"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import AppShell from "@/components/lms/AppShell";
import {
  Award,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Circle,
  ClipboardCheck,
  Loader2,
  PlayCircle,
  RefreshCw,
  Trophy,
  XCircle,
} from "lucide-react";

type QuizOption = {
  id: string;
  option_text: string;
};

type QuizQuestion = {
  id: string;
  question_text: string;
  question_type?: string;
  score?: number;
  options: QuizOption[];
};

type Quiz = {
  id: string;
  title: string;
  description?: string | null;
  passing_score?: number;
  questions?: QuizQuestion[];
};

type Lesson = {
  id: string;
  title: string;
  description?: string | null;
  video_url?: string | null;
  duration_seconds?: number;
  sort_order?: number;
  status?: string;
  completed_at?: string | null;
  quiz?: {
    id: string;
    title: string;
    passing_score?: number;
  } | null;
};

type Section = {
  id: string;
  title: string;
  description?: string | null;
  sort_order?: number;
  lessons: Lesson[];
};

type CourseContent = {
  course: {
    id: string;
    title: string;
    description?: string | null;
    thumbnail_url?: string | null;
    status?: string | null;
  };
  sections: Section[];
  progress: {
    total_lessons: number;
    completed_lessons: number;
    percent: number;
  };
};

type LessonDetail = {
  lesson: Lesson & {
    course_id: string;
    section_id?: string | null;
  };
  quiz: Quiz | null;
};

type QuizSubmitResult = {
  attempt_id: string;
  total_questions: number;
  correct_answers: number;
  score: number;
  passing_score: number;
  passed: boolean;
  results: {
    question_id: string;
    question_text: string | null;
    selected_option_id: string;
    selected_option_text: string | null;
    correct_option_id: string | null;
    correct_option_text: string | null;
    is_correct: boolean;
  }[];
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

    return (
      user?.id ||
      user?.user_id ||
      user?.user?.id ||
      user?.data?.id ||
      null
    );
  } catch {
    return null;
  }
}

function secondsToText(seconds?: number) {
  const value = Number(seconds || 0);

  if (value <= 0) return "Chưa cập nhật";

  const minutes = Math.floor(value / 60);
  const remainSeconds = value % 60;

  if (minutes <= 0) return `${remainSeconds} giây`;
  if (remainSeconds <= 0) return `${minutes} phút`;

  return `${minutes} phút ${remainSeconds} giây`;
}

function getFriendlyApiError(error: any) {
  const message = String(error?.message || error || "");

  if (message.includes("Failed to fetch")) {
    return "Không kết nối được BE. Hãy kiểm tra BE đang chạy và NEXT_PUBLIC_API_URL đúng port.";
  }

  if (message.includes("401")) {
    return "Thiếu quyền hoặc thiếu user_id. Hãy đăng nhập lại tài khoản học viên.";
  }

  if (message.includes("404")) {
    return "Không tìm thấy API hoặc không tìm thấy dữ liệu.";
  }

  if (message.includes("500")) {
    return "BE đang lỗi khi xử lý dữ liệu. Hãy xem lỗi chi tiết hoặc terminal BE.";
  }

  return message || "Có lỗi xảy ra khi gọi API.";
}

async function apiGet(path: string, userId?: string | null) {
  const API_BASE = getApiBase();

  const separator = path.includes("?") ? "&" : "?";
  const url = userId
    ? `${API_BASE}${path}${separator}user_id=${encodeURIComponent(userId)}`
    : `${API_BASE}${path}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(userId ? { "x-user-id": userId } : {}),
    },
    cache: "no-store",
  });

  const text = await res.text();

  let json: any = null;

  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }

  if (!res.ok || json?.success === false) {
    console.error("API GET ERROR:", {
      url,
      status: res.status,
      response: json || text,
    });

    throw new Error(
      json?.error ||
        json?.message ||
        text ||
        `API lỗi ${res.status}: ${url}`
    );
  }

  return json?.data ?? json;
}

async function apiPost(path: string, body: any, userId?: string | null) {
  const API_BASE = getApiBase();
  const url = `${API_BASE}${path}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(userId ? { "x-user-id": userId } : {}),
    },
    body: JSON.stringify({
      ...body,
      ...(userId ? { user_id: userId } : {}),
    }),
  });

  const text = await res.text();

  let json: any = null;

  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }

  if (!res.ok || json?.success === false) {
    console.error("API POST ERROR:", {
      url,
      status: res.status,
      response: json || text,
    });

    throw new Error(
      json?.error ||
        json?.message ||
        text ||
        `API lỗi ${res.status}: ${url}`
    );
  }

  return json?.data ?? json;
}

function normalizeCourseContent(data: any, courseId: string): CourseContent {
  const sections = Array.isArray(data?.sections)
    ? data.sections.map((section: any) => ({
        id: String(section.id || section.section_id || ""),
        title: section.title || section.section_title || "Nội dung khóa học",
        description: section.description || section.section_description || null,
        sort_order: Number(section.sort_order || section.section_sort_order || 0),
        lessons: Array.isArray(section.lessons)
          ? section.lessons.map((lesson: any) => ({
              id: String(lesson.id || lesson.lesson_id || ""),
              title: lesson.title || lesson.lesson_title || "Bài học chưa có tên",
              description:
                lesson.description || lesson.lesson_description || null,
              video_url:
                lesson.video_url ||
                lesson.content_url ||
                lesson.video ||
                lesson.file_url ||
                null,
              duration_seconds: Number(lesson.duration_seconds || 0),
              sort_order: Number(lesson.sort_order || 0),
              status: lesson.status || lesson.lesson_status || "not_started",
              completed_at: lesson.completed_at || null,
              quiz: lesson.quiz || null,
            }))
          : [],
      }))
    : [];

  return {
    course: {
      id: data?.course?.id || courseId,
      title: data?.course?.title || "Chi tiết khóa học",
      description: data?.course?.description || null,
      thumbnail_url: data?.course?.thumbnail_url || null,
      status: data?.course?.status || null,
    },
    sections,
    progress: {
      total_lessons: Number(data?.progress?.total_lessons || 0),
      completed_lessons: Number(data?.progress?.completed_lessons || 0),
      percent: Number(data?.progress?.percent || 0),
    },
  };
}

export default function EmployeeCourseDetailPage() {
  const params = useParams();
  const courseId = String(params?.courseId || "");

  const [userId, setUserId] = useState<string | null>(null);
  const [content, setContent] = useState<CourseContent | null>(null);
  const [activeLessonId, setActiveLessonId] = useState("");
  const [lessonDetail, setLessonDetail] = useState<LessonDetail | null>(null);

  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>(
    {}
  );
  const [quizResult, setQuizResult] = useState<QuizSubmitResult | null>(null);

  const [awardMessage, setAwardMessage] = useState("");
  const [awardData, setAwardData] = useState<any>(null);

  const [loadingContent, setLoadingContent] = useState(true);
  const [loadingLesson, setLoadingLesson] = useState(false);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [completingLesson, setCompletingLesson] = useState(false);
  const [completingCourse, setCompletingCourse] = useState(false);
  const [error, setError] = useState("");
  const [debugError, setDebugError] = useState("");

  const allLessons = useMemo(() => {
    if (!content?.sections) return [];

    return content.sections.flatMap((section) =>
      (section.lessons || []).map((lesson) => ({
        ...lesson,
        section_title: section.title,
      }))
    );
  }, [content]);

  const activeLesson = useMemo(() => {
    return allLessons.find((lesson) => lesson.id === activeLessonId) || null;
  }, [allLessons, activeLessonId]);

  async function loadCourseContent(nextActiveLessonId?: string) {
    try {
      setLoadingContent(true);
      setError("");
      setDebugError("");

      const currentUserId = getCurrentUserId();
      setUserId(currentUserId);

      const data = await apiGet(
        `/employee-learning/courses/${courseId}/content`,
        currentUserId
      );

      const normalized = normalizeCourseContent(data, courseId);

      setContent(normalized);

      const firstLessonId =
        nextActiveLessonId ||
        activeLessonId ||
        normalized.sections.flatMap((section) => section.lessons || [])?.[0]
          ?.id ||
        "";

      setActiveLessonId(firstLessonId);
    } catch (err: any) {
      setError(getFriendlyApiError(err));
      setDebugError(err?.message || String(err));
      setContent(null);
    } finally {
      setLoadingContent(false);
    }
  }

  async function loadLessonDetail(lessonId: string) {
    if (!lessonId) return;

    try {
      setLoadingLesson(true);
      setError("");
      setDebugError("");
      setSelectedAnswers({});
      setQuizResult(null);
      setAwardMessage("");
      setAwardData(null);

      const currentUserId = userId || getCurrentUserId();

      const data = await apiGet(
        `/employee-learning/lessons/${lessonId}`,
        currentUserId
      );

      setLessonDetail({
        lesson: {
          id: data?.lesson?.id || lessonId,
          course_id: data?.lesson?.course_id || courseId,
          section_id: data?.lesson?.section_id || null,
          title: data?.lesson?.title || "Bài học",
          description: data?.lesson?.description || null,
          video_url:
            data?.lesson?.video_url ||
            data?.lesson?.content_url ||
            data?.lesson?.video ||
            data?.lesson?.file_url ||
            null,
          duration_seconds: Number(data?.lesson?.duration_seconds || 0),
          sort_order: Number(data?.lesson?.sort_order || 0),
          status: data?.lesson?.status || activeLesson?.status || "not_started",
          completed_at: data?.lesson?.completed_at || activeLesson?.completed_at,
        },
        quiz: data?.quiz || null,
      });
    } catch (err: any) {
      setError(getFriendlyApiError(err));
      setDebugError(err?.message || String(err));
      setLessonDetail(null);
    } finally {
      setLoadingLesson(false);
    }
  }

  async function handleCompleteLesson() {
    if (!activeLessonId) return;

    try {
      setCompletingLesson(true);
      setError("");
      setDebugError("");

      const currentUserId = userId || getCurrentUserId();

      if (!currentUserId) {
        setError("Không tìm thấy user_id. Hãy đăng nhập lại tài khoản học viên.");
        return;
      }

      await apiPost(
        `/employee-learning/lessons/${activeLessonId}/complete`,
        {},
        currentUserId
      );

      await loadCourseContent(activeLessonId);
      await loadLessonDetail(activeLessonId);
    } catch (err: any) {
      setError(getFriendlyApiError(err));
      setDebugError(err?.message || String(err));
    } finally {
      setCompletingLesson(false);
    }
  }

  async function handleSubmitQuiz() {
    const quiz = lessonDetail?.quiz;

    if (!quiz?.id || !quiz.questions) return;

    const answers = quiz.questions.map((question) => ({
      question_id: question.id,
      selected_option_id: selectedAnswers[question.id],
    }));

    const missingAnswer = answers.some((item) => !item.selected_option_id);

    if (missingAnswer) {
      setError("Bạn cần chọn đáp án cho toàn bộ câu hỏi trước khi nộp bài.");
      return;
    }

    try {
      setSubmittingQuiz(true);
      setError("");
      setDebugError("");
      setQuizResult(null);

      const currentUserId = userId || getCurrentUserId();

      if (!currentUserId) {
        setError("Không tìm thấy user_id. Hãy đăng nhập lại tài khoản học viên.");
        return;
      }

      const data = await apiPost(
        `/employee-learning/quizzes/${quiz.id}/submit`,
        { answers },
        currentUserId
      );

      setQuizResult(data);

      if (data?.passed) {
        await loadCourseContent(activeLessonId);
        await loadLessonDetail(activeLessonId);
      }
    } catch (err: any) {
      setError(getFriendlyApiError(err));
      setDebugError(err?.message || String(err));
    } finally {
      setSubmittingQuiz(false);
    }
  }

  async function handleCompleteCourse() {
    try {
      setCompletingCourse(true);
      setError("");
      setDebugError("");
      setAwardMessage("");
      setAwardData(null);

      const currentUserId = userId || getCurrentUserId();

      if (!currentUserId) {
        setError("Không tìm thấy user_id. Hãy đăng nhập lại tài khoản học viên.");
        return;
      }

      const data = await apiPost(
        `/employee-learning/courses/${courseId}/complete`,
        {},
        currentUserId
      );

      setAwardData(data);
      setAwardMessage("Chúc mừng! Bạn đã hoàn thành khóa học.");

      await loadCourseContent(activeLessonId);
    } catch (err: any) {
      setError(getFriendlyApiError(err));
      setDebugError(err?.message || String(err));
    } finally {
      setCompletingCourse(false);
    }
  }

  useEffect(() => {
    if (courseId) {
      loadCourseContent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  useEffect(() => {
    if (activeLessonId) {
      loadLessonDetail(activeLessonId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLessonId]);

  return (
    <AppShell workspace="employee" title="Chi tiết khóa học">
      <main className="min-h-screen bg-slate-50 p-6">
        {loadingContent ? (
          <div className="flex min-h-[520px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
            <div className="flex items-center gap-3 text-slate-500">
              <Loader2 className="animate-spin" size={22} />
              <span>Đang tải nội dung khóa học...</span>
            </div>
          </div>
        ) : !content ? (
          <div className="max-w-2xl rounded-2xl border border-red-100 bg-red-50 p-5 text-red-700">
            <p className="font-semibold">Không hiển thị được khóa học</p>
            <p className="mt-1 text-sm">
              {error || "Lỗi lấy nội dung khóa học"}
            </p>

            {debugError && (
              <details className="mt-3 rounded-xl bg-white/70 p-3 text-xs text-red-800">
                <summary className="cursor-pointer font-semibold">
                  Xem lỗi chi tiết
                </summary>
                <pre className="mt-2 whitespace-pre-wrap break-words">
                  {debugError}
                </pre>
              </details>
            )}

            <button
              type="button"
              onClick={() => loadCourseContent()}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              <RefreshCw size={16} />
              Tải lại
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm font-semibold text-orange-500">
                    Chi tiết khóa học
                  </p>

                  <h1 className="mt-1 text-2xl font-bold text-slate-900">
                    {content.course.title}
                  </h1>

                  <p className="mt-2 max-w-3xl text-sm text-slate-500">
                    {content.course.description ||
                      "Theo dõi từng phần, từng bài học, video và quiz của khóa học."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCompleteCourse}
                  disabled={completingCourse}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {completingCourse ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Trophy size={18} />
                  )}
                  Hoàn thành khóa học
                </button>
              </div>

              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-slate-500">Tiến độ khóa học</span>
                  <span className="font-semibold text-slate-900">
                    {content.progress.completed_lessons}/
                    {content.progress.total_lessons} bài học -{" "}
                    {content.progress.percent}%
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-orange-500"
                    style={{
                      width: `${Math.min(
                        Math.max(content.progress.percent, 0),
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {awardMessage && (
              <div className="mb-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-emerald-700">
                <div className="flex items-start gap-3">
                  <Award size={24} />

                  <div>
                    <p className="font-bold">{awardMessage}</p>

                    {awardData?.awarded_badge ? (
                      <p className="mt-1 text-sm">
                        Huy hiệu: {awardData.awarded_badge.name} | Điểm nhận
                        được: {awardData.points || 0}
                      </p>
                    ) : (
                      <p className="mt-1 text-sm">
                        Khóa học đã hoàn thành. Khóa này hiện chưa gắn huy hiệu.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
                <p>{error}</p>

                {debugError && (
                  <details className="mt-2 rounded-xl bg-white/70 p-3 text-xs">
                    <summary className="cursor-pointer font-semibold">
                      Xem lỗi chi tiết
                    </summary>
                    <pre className="mt-2 whitespace-pre-wrap break-words">
                      {debugError}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[380px_1fr]">
              <aside className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-slate-900">
                  <BookOpen size={18} />
                  Nội dung khóa học
                </h2>

                <div className="space-y-4">
                  {content.sections.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 p-5 text-center text-sm text-slate-500">
                      Khóa học chưa có phần hoặc bài học nào.
                    </div>
                  ) : (
                    content.sections.map((section, sectionIndex) => (
                      <div key={section.id || sectionIndex}>
                        <div className="mb-2 rounded-xl bg-slate-100 px-3 py-2">
                          <p className="text-xs font-semibold uppercase text-slate-500">
                            Phần {sectionIndex + 1}
                          </p>

                          <h3 className="text-sm font-bold text-slate-900">
                            {section.title}
                          </h3>
                        </div>

                        <div className="space-y-2">
                          {(section.lessons || []).map(
                            (lesson, lessonIndex) => {
                              const active = lesson.id === activeLessonId;
                              const completed = lesson.status === "completed";

                              return (
                                <button
                                  key={lesson.id || lessonIndex}
                                  type="button"
                                  onClick={() => setActiveLessonId(lesson.id)}
                                  className={`w-full rounded-xl border px-3 py-3 text-left transition ${
                                    active
                                      ? "border-orange-200 bg-orange-50"
                                      : "border-slate-200 bg-white hover:bg-slate-50"
                                  }`}
                                >
                                  <div className="flex items-start gap-3">
                                    <div className="mt-0.5">
                                      {completed ? (
                                        <CheckCircle2
                                          size={18}
                                          className="text-emerald-500"
                                        />
                                      ) : (
                                        <Circle
                                          size={18}
                                          className="text-slate-300"
                                        />
                                      )}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                      <p className="text-xs text-slate-400">
                                        Bài {lessonIndex + 1}
                                      </p>

                                      <p className="line-clamp-2 text-sm font-semibold text-slate-800">
                                        {lesson.title}
                                      </p>

                                      <p className="mt-1 text-xs text-slate-400">
                                        {secondsToText(
                                          lesson.duration_seconds
                                        )}
                                      </p>

                                      {lesson.video_url && (
                                        <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-orange-50 px-2 py-1 text-xs font-semibold text-orange-600">
                                          <PlayCircle size={12} />
                                          Có video
                                        </p>
                                      )}

                                      {lesson.quiz && (
                                        <p className="ml-1 mt-2 inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-600">
                                          <ClipboardCheck size={12} />
                                          Có quiz
                                        </p>
                                      )}
                                    </div>

                                    <ChevronRight
                                      size={16}
                                      className={
                                        active
                                          ? "text-orange-500"
                                          : "text-slate-300"
                                      }
                                    />
                                  </div>
                                </button>
                              );
                            }
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </aside>

              <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                {loadingLesson ? (
                  <div className="flex min-h-[480px] items-center justify-center">
                    <div className="flex items-center gap-3 text-slate-500">
                      <Loader2 className="animate-spin" size={22} />
                      <span>Đang tải bài học...</span>
                    </div>
                  </div>
                ) : !lessonDetail ? (
                  <div className="flex min-h-[480px] items-center justify-center text-center">
                    <div>
                      <PlayCircle className="mx-auto text-slate-300" size={48} />

                      <h3 className="mt-4 text-lg font-bold text-slate-900">
                        Chọn một bài học
                      </h3>

                      <p className="mt-2 text-sm text-slate-500">
                        Hãy chọn bài học bên trái để xem video và làm quiz.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-orange-500">
                          {(activeLesson as any)?.section_title || "Bài học"}
                        </p>

                        <h2 className="mt-1 text-xl font-bold text-slate-900">
                          {lessonDetail.lesson.title}
                        </h2>

                        <p className="mt-2 text-sm text-slate-500">
                          {lessonDetail.lesson.description ||
                            "Bài học này chưa có mô tả."}
                        </p>

                        <p className="mt-2 text-xs text-slate-400">
                          Thời lượng:{" "}
                          {secondsToText(lessonDetail.lesson.duration_seconds)}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleCompleteLesson}
                        disabled={
                          completingLesson ||
                          activeLesson?.status === "completed"
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-300"
                      >
                        {completingLesson ? (
                          <Loader2 className="animate-spin" size={18} />
                        ) : (
                          <CheckCircle2 size={18} />
                        )}
                        {activeLesson?.status === "completed"
                          ? "Đã hoàn thành"
                          : "Đánh dấu hoàn thành"}
                      </button>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-black">
                      {lessonDetail.lesson.video_url ? (
                        <video
                          src={lessonDetail.lesson.video_url}
                          controls
                          className="aspect-video w-full bg-black"
                        />
                      ) : (
                        <div className="flex aspect-video items-center justify-center text-center text-slate-300">
                          <div>
                            <PlayCircle className="mx-auto" size={48} />
                            <p className="mt-3 text-sm">
                              Bài học này chưa có video.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {lessonDetail.quiz ? (
                      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                        <div className="mb-5">
                          <p className="text-sm font-semibold text-blue-600">
                            Quiz bài học
                          </p>

                          <h3 className="text-lg font-bold text-slate-900">
                            {lessonDetail.quiz.title}
                          </h3>

                          <p className="mt-1 text-sm text-slate-500">
                            Điểm đạt: {lessonDetail.quiz.passing_score || 70}%
                          </p>
                        </div>

                        {lessonDetail.quiz.questions?.length ? (
                          <div className="space-y-5">
                            {lessonDetail.quiz.questions.map(
                              (question, index) => {
                                const result = quizResult?.results?.find(
                                  (item) => item.question_id === question.id
                                );

                                return (
                                  <div
                                    key={question.id}
                                    className="rounded-2xl border border-slate-200 bg-white p-4"
                                  >
                                    <div className="mb-3 flex items-start justify-between gap-3">
                                      <h4 className="font-semibold text-slate-900">
                                        Câu {index + 1}:{" "}
                                        {question.question_text}
                                      </h4>

                                      {result ? (
                                        result.is_correct ? (
                                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                                            <CheckCircle2 size={14} />
                                            Đúng
                                          </span>
                                        ) : (
                                          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                                            <XCircle size={14} />
                                            Sai
                                          </span>
                                        )
                                      ) : null}
                                    </div>

                                    <div className="space-y-2">
                                      {question.options.map((option) => {
                                        const checked =
                                          selectedAnswers[question.id] ===
                                          option.id;

                                        const isCorrectAfterSubmit =
                                          result?.correct_option_id ===
                                          option.id;

                                        const isWrongSelectedAfterSubmit =
                                          result &&
                                          result.selected_option_id ===
                                            option.id &&
                                          !result.is_correct;

                                        return (
                                          <label
                                            key={option.id}
                                            className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 text-sm transition ${
                                              isCorrectAfterSubmit
                                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                                : isWrongSelectedAfterSubmit
                                                ? "border-red-200 bg-red-50 text-red-700"
                                                : checked
                                                ? "border-orange-200 bg-orange-50 text-orange-700"
                                                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                                            }`}
                                          >
                                            <input
                                              type="radio"
                                              name={question.id}
                                              value={option.id}
                                              checked={checked}
                                              disabled={!!quizResult}
                                              onChange={() =>
                                                setSelectedAnswers((prev) => ({
                                                  ...prev,
                                                  [question.id]: option.id,
                                                }))
                                              }
                                            />

                                            <span>{option.option_text}</span>
                                          </label>
                                        );
                                      })}
                                    </div>

                                    {result && !result.is_correct && (
                                      <p className="mt-3 text-sm text-slate-600">
                                        Đáp án đúng:{" "}
                                        <span className="font-semibold text-emerald-600">
                                          {result.correct_option_text}
                                        </span>
                                      </p>
                                    )}
                                  </div>
                                );
                              }
                            )}

                            {quizResult && (
                              <div
                                className={`rounded-2xl border p-5 ${
                                  quizResult.passed
                                    ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                                    : "border-red-100 bg-red-50 text-red-700"
                                }`}
                              >
                                <p className="font-bold">
                                  Kết quả: {quizResult.correct_answers}/
                                  {quizResult.total_questions} câu đúng -{" "}
                                  {quizResult.score} điểm
                                </p>

                                <p className="mt-1 text-sm">
                                  {quizResult.passed
                                    ? "Bạn đã vượt qua bài quiz này."
                                    : "Bạn chưa đạt bài quiz này, hãy học lại và thử lại."}
                                </p>
                              </div>
                            )}

                            {!quizResult ? (
                              <button
                                type="button"
                                onClick={handleSubmitQuiz}
                                disabled={submittingQuiz}
                                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                              >
                                {submittingQuiz ? (
                                  <Loader2 className="animate-spin" size={18} />
                                ) : (
                                  <ClipboardCheck size={18} />
                                )}
                                Nộp bài quiz
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setQuizResult(null);
                                  setSelectedAnswers({});
                                }}
                                className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-900"
                              >
                                <RefreshCw size={18} />
                                Làm lại quiz
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-center text-sm text-slate-500">
                            Quiz này chưa có câu hỏi.
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center text-sm text-slate-500">
                        Bài học này không có quiz.
                      </div>
                    )}
                  </div>
                )}
              </section>
            </div>
          </>
        )}
      </main>
    </AppShell>
  );
}