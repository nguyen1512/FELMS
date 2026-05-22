"use client";

import AppShell from "@/components/lms/AppShell";
import SectionCard from "@/components/lms/SectionCard";
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileQuestion,
  Flag,
  Loader2,
  Plus,
  Target,
  Trash2,
  Video,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type StudyEvent = {
  id: string;
  user_id?: string;
  course_id?: string | null;
  course_title?: string | null;
  title: string;
  description?: string | null;
  event_type: string;
  start_time?: string | null;
  end_time?: string | null;
  status?: string | null;
  priority?: string | null;
  source_type?: string | null;
  source_id?: string | null;
  origin?: string | null;
  meeting_url?: string | null;
  room_name?: string | null;
  location?: string | null;
  duration_minutes?: number | null;
  time_limit_minutes?: number | null;
  pass_score?: number | null;
};

type EnrolledCourse = {
  course_id: string;
  course_title: string;
  progress_percent?: number;
  enrollment_status?: string;
  duration_minutes?: number | null;
};

type StudyPlanData = {
  month: string;
  enrolled_courses: EnrolledCourse[];
  events: StudyEvent[];
  todos: StudyEvent[];
  summary: {
    total_events_in_month: number;
    total_lessons: number;
    total_quizzes: number;
    total_assessments: number;
    total_live_classes: number;
    estimated_hours: number;
    progress_percent: number;
  };
};

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
).replace(/\/$/, "");

const DEV_FALLBACK_USER_ID = "4282ce04-e412-4f3e-8198-5c66eb9b07dd";

function getStoredUserId() {
  if (typeof window === "undefined") return DEV_FALLBACK_USER_ID;

  const directKeys = [
    "userId",
    "user_id",
    "currentUserId",
    "lms_user_id",
    "auth_user_id",
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
    "loggedInUser",
    "employee",
  ];

  for (const key of objectKeys) {
    const raw = localStorage.getItem(key);
    if (!raw) continue;

    try {
      const parsed = JSON.parse(raw);

      const id =
        parsed?.id ||
        parsed?.user_id ||
        parsed?.user?.id ||
        parsed?.user?.user_id ||
        parsed?.data?.id ||
        parsed?.data?.user_id;

      if (id) return id;
    } catch {
      // Bỏ qua dữ liệu localStorage không phải JSON
    }
  }

  return DEV_FALLBACK_USER_ID;
}

function getAuthHeaders() {
  if (typeof window === "undefined") {
    return {
      "Content-Type": "application/json",
    };
  }

  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("authToken");

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function getDaysInMonth(month: string) {
  const [year, monthIndex] = month.split("-").map(Number);
  return new Date(year, monthIndex, 0).getDate();
}

function getFirstDayOffset(month: string) {
  const [year, monthIndex] = month.split("-").map(Number);
  const jsDay = new Date(year, monthIndex - 1, 1).getDay();

  return jsDay === 0 ? 6 : jsDay - 1;
}

function getCalendarCells(month: string) {
  const totalDays = getDaysInMonth(month);
  const offset = getFirstDayOffset(month);
  const cells: Array<number | null> = [];

  for (let i = 0; i < offset; i += 1) cells.push(null);
  for (let day = 1; day <= totalDays; day += 1) cells.push(day);
  while (cells.length % 7 !== 0) cells.push(null);

  return cells;
}

function toDateKey(value?: string | null) {
  if (!value) return "";
  return value.slice(0, 10);
}

function formatTime(value?: string | null) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getTypeLabel(type?: string | null) {
  const normalized = String(type || "").toLowerCase();

  if (normalized === "video") return "Video";
  if (normalized === "quiz") return "Quiz";

  if (
    normalized === "assessment" ||
    normalized === "exam" ||
    normalized === "test" ||
    normalized === "thi"
  ) {
    return "Thi";
  }

  if (normalized === "deadline") return "Deadline";
  if (normalized === "live_class") return "Online";
  if (normalized === "lesson") return "Bài học";

  return "Kế hoạch";
}

function getTaskClass(type?: string | null) {
  const normalized = String(type || "").toLowerCase();

  if (normalized === "deadline") return "bg-red-100 text-red-700";
  if (normalized === "quiz") return "bg-orange-100 text-orange-700";

  if (
    normalized === "assessment" ||
    normalized === "exam" ||
    normalized === "test" ||
    normalized === "thi"
  ) {
    return "bg-purple-100 text-purple-700";
  }

  if (normalized === "video") return "bg-blue-100 text-blue-700";
  if (normalized === "live_class") return "bg-cyan-100 text-cyan-700";
  if (normalized === "lesson") return "bg-green-100 text-green-700";

  return "bg-slate-100 text-slate-700";
}

function getTypeIcon(type?: string | null) {
  const normalized = String(type || "").toLowerCase();

  if (normalized === "video") return <Video size={18} />;
  if (normalized === "quiz") return <FileQuestion size={18} />;

  if (
    normalized === "assessment" ||
    normalized === "exam" ||
    normalized === "test" ||
    normalized === "thi"
  ) {
    return <Flag size={18} />;
  }

  if (normalized === "deadline") return <Clock3 size={18} />;
  if (normalized === "live_class") return <Video size={18} />;

  return <BookOpen size={18} />;
}

export default function EmployeeStudyPlanPage() {
  const [userId, setUserId] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [data, setData] = useState<StudyPlanData | null>(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    course_id: "",
    event_type: "custom",
    date: "",
    start_time: "08:00",
    end_time: "09:00",
    priority: "normal",
  });

  const todayKey = new Date().toISOString().slice(0, 10);

  async function fetchStudyPlan(month = selectedMonth) {
    try {
      setLoading(true);

      const currentUserId = getStoredUserId();
      setUserId(currentUserId);

      const url = `${API_BASE}/employee/study-plan/calendar?userId=${currentUserId}&month=${month}`;

      const response = await fetch(url, {
        method: "GET",
        headers: getAuthHeaders(),
        cache: "no-store",
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.message || "Không thể tải kế hoạch học tập");
      }

      setData(json.data);
    } catch (error) {
      console.error("fetchStudyPlan error:", error);
      alert(
        "Không lấy được API kế hoạch học tập. Kiểm tra BE route /api/employee/study-plan/calendar."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStudyPlan(selectedMonth);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth]);

  function openCreateModalByDate(dateKey?: string) {
    const selectedDate = dateKey || todayKey;

    setForm({
      title: "",
      description: "",
      course_id: "",
      event_type: "custom",
      date: selectedDate,
      start_time: "08:00",
      end_time: "09:00",
      priority: "normal",
    });

    setShowCreateModal(true);
  }

  async function handleCreateEvent() {
    if (!form.title.trim()) {
      alert("Vui lòng nhập tiêu đề kế hoạch.");
      return;
    }

    if (!form.date) {
      alert("Vui lòng chọn ngày học.");
      return;
    }

    try {
      setSaving(true);

      const currentUserId = userId || getStoredUserId();

      const startTime = `${form.date}T${form.start_time}:00`;
      const endTime = form.end_time ? `${form.date}T${form.end_time}:00` : null;

      const response = await fetch(`${API_BASE}/employee/study-plan/events`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          user_id: currentUserId,
          course_id: form.course_id || null,
          title: form.title.trim(),
          description: form.description.trim() || null,
          event_type: form.event_type,
          start_time: startTime,
          end_time: endTime,
          priority: form.priority,
        }),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.message || "Không thể tạo kế hoạch học tập");
      }

      setShowCreateModal(false);

      setForm({
        title: "",
        description: "",
        course_id: "",
        event_type: "custom",
        date: "",
        start_time: "08:00",
        end_time: "09:00",
        priority: "normal",
      });

      await fetchStudyPlan(selectedMonth);
    } catch (error) {
      console.error("handleCreateEvent error:", error);
      alert("Không thể tạo kế hoạch học tập.");
    } finally {
      setSaving(false);
    }
  }

  async function handleCompleteEvent(event: StudyEvent) {
    if (event.origin !== "manual") {
      alert("Chỉ kế hoạch tự tạo mới có thể đánh dấu hoàn thành tại đây.");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE}/employee/study-plan/events/${event.id}/complete`,
        {
          method: "PATCH",
          headers: getAuthHeaders(),
        }
      );

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.message || "Không thể hoàn thành kế hoạch");
      }

      await fetchStudyPlan(selectedMonth);
    } catch (error) {
      console.error("handleCompleteEvent error:", error);
      alert("Không thể đánh dấu hoàn thành.");
    }
  }

  async function handleDeleteEvent(event: StudyEvent) {
    if (event.origin !== "manual") {
      alert("Chỉ kế hoạch tự tạo mới có thể xóa. Lịch hệ thống không xóa ở đây.");
      return;
    }

    const ok = confirm(`Bạn có chắc muốn xóa "${event.title}" không?`);
    if (!ok) return;

    try {
      const response = await fetch(
        `${API_BASE}/employee/study-plan/events/${event.id}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      );

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.message || "Không thể xóa kế hoạch");
      }

      await fetchStudyPlan(selectedMonth);
    } catch (error) {
      console.error("handleDeleteEvent error:", error);
      alert("Không thể xóa kế hoạch.");
    }
  }

  const eventsByDate = useMemo(() => {
    const result: Record<string, StudyEvent[]> = {};

    for (const event of data?.events || []) {
      const dateKey = toDateKey(event.start_time);
      if (!dateKey) continue;

      if (!result[dateKey]) result[dateKey] = [];
      result[dateKey].push(event);
    }

    return result;
  }, [data?.events]);

  const calendarCells = useMemo(() => {
    return getCalendarCells(selectedMonth);
  }, [selectedMonth]);

  const summary = data?.summary || {
    total_events_in_month: 0,
    total_lessons: 0,
    total_quizzes: 0,
    total_assessments: 0,
    total_live_classes: 0,
    estimated_hours: 0,
    progress_percent: 0,
  };

  const monthLabel = selectedMonth.split("-").reverse().join("/");

  return (
    <AppShell workspace="employee" title="Kế hoạch học tập">
      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-orange-600">
                Personal Study Calendar
              </p>

              <h1 className="mt-2 text-3xl font-bold text-slate-950">
                Kế hoạch học tập
              </h1>

              <p className="mt-2 text-slate-500">
                Theo dõi lịch học cá nhân, deadline, quiz, bài học, bài thi và
                lịch học online.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <input
                type="month"
                value={selectedMonth}
                onChange={(event) => setSelectedMonth(event.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-orange-500"
              />

              <button
                type="button"
                onClick={() => openCreateModalByDate()}
                className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-700"
              >
                <Plus size={18} />
                Tạo kế hoạch
              </button>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <CalendarDays className="text-orange-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {summary.total_events_in_month}
            </p>
            <p className="text-sm text-slate-500">Lịch học trong tháng</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <BookOpen className="text-orange-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {summary.total_lessons}
            </p>
            <p className="text-sm text-slate-500">Bài học cần hoàn thành</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Clock3 className="text-orange-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {summary.estimated_hours}h
            </p>
            <p className="text-sm text-slate-500">Thời lượng dự kiến</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Target className="text-green-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {summary.progress_percent}%
            </p>
            <p className="text-sm text-slate-500">Mục tiêu tháng</p>
          </div>
        </section>

        <SectionCard title={`Lịch học tháng ${monthLabel}`}>
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-3 text-xs font-bold">
              <span className="rounded-full bg-green-100 px-3 py-1 text-green-700">
                Bài học
              </span>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-700">
                Video
              </span>
              <span className="rounded-full bg-orange-100 px-3 py-1 text-orange-700">
                Quiz
              </span>
              <span className="rounded-full bg-purple-100 px-3 py-1 text-purple-700">
                Thi
              </span>
              <span className="rounded-full bg-red-100 px-3 py-1 text-red-700">
                Deadline
              </span>
              <span className="rounded-full bg-cyan-100 px-3 py-1 text-cyan-700">
                Online
              </span>
            </div>

            {loading && (
              <div className="flex items-center gap-2 text-sm font-semibold text-orange-600">
                <Loader2 className="animate-spin" size={16} />
                Đang tải dữ liệu...
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[1100px] overflow-hidden rounded-2xl border border-slate-200">
              <div className="grid grid-cols-7 bg-slate-50">
                {["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "CN"].map(
                  (day) => (
                    <div
                      key={day}
                      className="border-r border-slate-200 p-4 text-center font-bold text-slate-700 last:border-r-0"
                    >
                      {day}
                    </div>
                  )
                )}
              </div>

              <div className="grid grid-cols-7">
                {calendarCells.map((day, index) => {
                  const dateKey = day
                    ? `${selectedMonth}-${String(day).padStart(2, "0")}`
                    : "";

                  const tasks = dateKey ? eventsByDate[dateKey] || [] : [];

                  return (
                    <div
                      key={`${selectedMonth}-${day || "empty"}-${index}`}
                      className="min-h-[165px] border-r border-t border-slate-200 bg-white p-3 last:border-r-0"
                    >
                      {day ? (
                        <>
                          <div className="mb-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-700">
                                {day}
                              </span>

                              {dateKey === todayKey && (
                                <span className="rounded-full bg-orange-100 px-2 py-1 text-[11px] font-bold text-orange-700">
                                  Hôm nay
                                </span>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                openCreateModalByDate(dateKey);
                              }}
                              className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-600 transition hover:bg-orange-600 hover:text-white"
                              title={`Thêm kế hoạch ngày ${dateKey}`}
                            >
                              <Plus size={17} />
                            </button>
                          </div>

                          <div className="space-y-2">
                            {tasks.slice(0, 3).map((task) => (
                              <div
                                key={`${task.source_type}-${task.id}`}
                                className={`rounded-lg px-3 py-2 text-xs font-bold ${getTaskClass(
                                  task.event_type
                                )}`}
                                title={task.title}
                              >
                                <p className="line-clamp-1">{task.title}</p>

                                <p className="mt-1 text-[11px] font-semibold opacity-80">
                                  {getTypeLabel(task.event_type)}
                                  {formatTime(task.start_time)
                                    ? ` · ${formatTime(task.start_time)}`
                                    : ""}
                                </p>
                              </div>
                            ))}

                            {tasks.length > 3 && (
                              <p className="text-xs font-semibold text-slate-400">
                                +{tasks.length - 3} lịch khác
                              </p>
                            )}
                          </div>
                        </>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </SectionCard>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
          <SectionCard title="Việc cần làm">
            <div className="space-y-3">
              {data?.todos?.length ? (
                data.todos.map((todo) => {
                  const isManual = todo.origin === "manual";

                  return (
                    <div
                      key={`${todo.source_type}-${todo.id}`}
                      className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 md:flex-row md:items-center md:justify-between"
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${getTaskClass(
                            todo.event_type
                          )}`}
                        >
                          {getTypeIcon(todo.event_type)}
                        </div>

                        <div>
                          <p className="font-bold text-slate-950">
                            {todo.title}
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            {todo.course_title || "Kế hoạch cá nhân"}
                            {todo.pass_score
                              ? ` · Đạt tối thiểu ${todo.pass_score} điểm`
                              : ""}
                            {todo.duration_minutes
                              ? ` · ${todo.duration_minutes} phút`
                              : ""}
                            {todo.time_limit_minutes
                              ? ` · ${todo.time_limit_minutes} phút`
                              : ""}
                          </p>

                          {todo.start_time && (
                            <p className="mt-1 text-sm text-slate-400">
                              {toDateKey(todo.start_time)}{" "}
                              {formatTime(todo.start_time)}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${getTaskClass(
                            todo.event_type
                          )}`}
                        >
                          {getTypeLabel(todo.event_type)}
                        </span>

                        {isManual && todo.status !== "completed" && (
                          <button
                            type="button"
                            onClick={() => handleCompleteEvent(todo)}
                            className="rounded-lg p-2 text-green-600 hover:bg-green-50"
                            title="Đánh dấu hoàn thành"
                          >
                            <CheckCircle2 size={18} />
                          </button>
                        )}

                        {isManual && (
                          <button
                            type="button"
                            onClick={() => handleDeleteEvent(todo)}
                            className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                            title="Xóa kế hoạch"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
                  <p className="font-bold text-slate-700">
                    Chưa có việc cần làm
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    Bấm dấu + trên calendar để tự thêm kế hoạch học tập.
                  </p>
                </div>
              )}
            </div>
          </SectionCard>

          <SectionCard title="Mục tiêu tháng">
            <div className="rounded-2xl bg-orange-50 p-5">
              <p className="text-sm text-slate-500">Tiến độ mục tiêu</p>

              <p className="mt-3 text-4xl font-bold text-slate-950">
                {summary.progress_percent}%
              </p>

              <div className="mt-5 h-3 overflow-hidden rounded-full bg-white">
                <div
                  className="h-full rounded-full bg-orange-600 transition-all"
                  style={{
                    width: `${Math.min(summary.progress_percent, 100)}%`,
                  }}
                />
              </div>

              <p className="mt-5 leading-7 text-slate-600">
                Bạn có{" "}
                <b className="text-slate-900">{summary.total_lessons}</b> bài
                học, <b className="text-slate-900">{summary.total_quizzes}</b>{" "}
                quiz,{" "}
                <b className="text-slate-900">
                  {summary.total_assessments}
                </b>{" "}
                bài thi/bài test và{" "}
                <b className="text-slate-900">
                  {summary.total_live_classes}
                </b>{" "}
                lịch học online trong tháng này.
              </p>
            </div>
          </SectionCard>
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-950">
                  Tạo kế hoạch học tập
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Ngày đã chọn:{" "}
                  <b className="text-orange-600">{form.date || "Chưa chọn"}</b>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={22} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Tiêu đề
                </label>
                <input
                  value={form.title}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      title: event.target.value,
                    }))
                  }
                  placeholder="Ví dụ: Ôn tập bài 1, làm quiz, xem video..."
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-orange-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Mô tả
                </label>
                <textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                  placeholder="Ghi chú thêm cho kế hoạch..."
                  rows={3}
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Khóa học
                </label>
                <select
                  value={form.course_id}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      course_id: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-orange-500"
                >
                  <option value="">Không gán khóa học</option>
                  {data?.enrolled_courses?.map((course) => (
                    <option key={course.course_id} value={course.course_id}>
                      {course.course_title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Loại kế hoạch
                </label>
                <select
                  value={form.event_type}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      event_type: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-orange-500"
                >
                  <option value="custom">Kế hoạch cá nhân</option>
                  <option value="lesson">Bài học</option>
                  <option value="video">Video</option>
                  <option value="quiz">Quiz</option>
                  <option value="assessment">Bài test / bài thi</option>
                  <option value="deadline">Deadline</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Ngày
                </label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      date: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Mức ưu tiên
                </label>
                <select
                  value={form.priority}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      priority: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-orange-500"
                >
                  <option value="low">Thấp</option>
                  <option value="normal">Bình thường</option>
                  <option value="high">Cao</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Giờ bắt đầu
                </label>
                <input
                  type="time"
                  value={form.start_time}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      start_time: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Giờ kết thúc
                </label>
                <input
                  type="time"
                  value={form.end_time}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      end_time: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                Hủy
              </button>

              <button
                type="button"
                onClick={handleCreateEvent}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-bold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving && <Loader2 className="animate-spin" size={16} />}
                Lưu kế hoạch
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}