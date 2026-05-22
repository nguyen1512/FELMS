"use client";

import AppShell from "@/components/lms/AppShell";
import SectionCard from "@/components/lms/SectionCard";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Loader2,
  MapPin,
  MonitorPlay,
  Presentation,
  QrCode,
  RefreshCcw,
  UserCheck,
  Users,
  Video,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  data?: T;
};

type TrainingEvent = {
  id: string;
  title: string;
  description?: string | null;
  class_date?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  meeting_url?: string | null;
  meeting_link?: string | null;
  location?: string | null;
  room_name?: string | null;
  status?: string | null;
  training_type?: string | null;
  instructor_name?: string | null;
  instructor_display_name?: string | null;
  department_name?: string | null;
  registration_status?: string | null;
  checkin_status?: string | null;
  attended_at?: string | null;
};

type TrainingStats = {
  total_this_month: number;
  online_count: number;
  offline_count: number;
  registered_count: number;
  attended_count: number;
  attendance_rate: number;
};

const RAW_API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:5000/api";

const API_BASE = RAW_API_URL.replace(/\/+$/, "").endsWith("/api")
  ? RAW_API_URL.replace(/\/+$/, "")
  : `${RAW_API_URL.replace(/\/+$/, "")}/api`;

const TRAINING_API_PATHS = [
  "/employee-training-schedule",
  "/employee/training-schedule",
  "/training-schedule",
];

const DEFAULT_STATS: TrainingStats = {
  total_this_month: 0,
  online_count: 0,
  offline_count: 0,
  registered_count: 0,
  attended_count: 0,
  attendance_rate: 0,
};

const WEEK_DAYS = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "CN"];

function safeJsonParse<T = any>(value: string | null): T | null {
  if (!value) return null;

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function isUuidLike(value: any) {
  if (!value) return false;

  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(value)
  );
}

function decodeJwtPayload(token: string): any | null {
  try {
    if (!token || !token.includes(".")) return null;

    const payload = token.split(".")[1];
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");

    return JSON.parse(atob(normalized));
  } catch {
    return null;
  }
}

function findIdDeep(value: any): string {
  if (!value) return "";

  if (typeof value === "string") {
    if (isUuidLike(value)) return value;

    const parsed = safeJsonParse(value);
    return parsed ? findIdDeep(parsed) : "";
  }

  if (typeof value !== "object") return "";

  const keys = [
    "id",
    "user_id",
    "userId",
    "employee_id",
    "employeeId",
    "sub",
    "uid",
  ];

  for (const key of keys) {
    if (isUuidLike(value?.[key])) {
      return String(value[key]);
    }
  }

  for (const item of Object.values(value)) {
    const id = findIdDeep(item);

    if (id) return id;
  }

  return "";
}

function getAuthToken() {
  if (typeof window === "undefined") return "";

  const directKeys = [
    "token",
    "accessToken",
    "access_token",
    "authToken",
    "jwt",
    "lms_token",
  ];

  for (const key of directKeys) {
    const value = localStorage.getItem(key);

    if (value && value !== "undefined" && value !== "null") {
      return value.replace(/^Bearer\s+/i, "");
    }
  }

  for (const key of Object.keys(localStorage)) {
    const raw = localStorage.getItem(key);

    if (!raw) continue;

    if (raw.includes(".") && raw.split(".").length === 3) {
      return raw.replace(/^Bearer\s+/i, "");
    }

    const parsed = safeJsonParse<any>(raw);

    const token =
      parsed?.token ||
      parsed?.accessToken ||
      parsed?.access_token ||
      parsed?.authToken ||
      parsed?.data?.token ||
      parsed?.data?.accessToken ||
      parsed?.data?.access_token;

    if (token) {
      return String(token).replace(/^Bearer\s+/i, "");
    }
  }

  return "";
}

function getCurrentUserId() {
  if (typeof window === "undefined") return "";

  const directKeys = [
    "userId",
    "user_id",
    "id",
    "employee_id",
    "employeeId",
    "current_user_id",
    "lms_user_id",
  ];

  for (const key of directKeys) {
    const value = localStorage.getItem(key);

    if (isUuidLike(value)) return String(value);
  }

  const token = getAuthToken();
  const payload = decodeJwtPayload(token);
  const idFromToken = findIdDeep(payload);

  if (idFromToken) return idFromToken;

  for (const key of Object.keys(localStorage)) {
    const raw = localStorage.getItem(key);
    const parsed = safeJsonParse<any>(raw);
    const id = findIdDeep(parsed || raw);

    if (id) return id;
  }

  return "";
}

async function fetchWithFallback<T>(
  paths: string[],
  endpoint: string,
  options?: RequestInit
): Promise<{ json: ApiResponse<T>; usedUrl: string }> {
  let lastError = "";

  for (const path of paths) {
    const url = `${API_BASE}${path}${endpoint}`;

    try {
      const res = await fetch(url, {
        ...options,
        cache: "no-store",
      });

      const json = await res.json().catch(() => null);

      if (res.status === 404) {
        lastError = `API không tồn tại: ${url}`;
        continue;
      }

      if (!res.ok || json?.success === false) {
        throw new Error(
          json?.message || `Không lấy được lịch đào tạo. Status: ${res.status}`
        );
      }

      return {
        json,
        usedUrl: url,
      };
    } catch (error: any) {
      lastError = error?.message || `Không gọi được API: ${url}`;

      if (!lastError.includes("API không tồn tại")) {
        throw new Error(lastError);
      }
    }
  }

  throw new Error(lastError || "Không tìm thấy API phù hợp.");
}

function normalizeTime(value?: string | null) {
  if (!value) return "--:--";

  return String(value).slice(0, 5);
}

function formatTimeRange(start?: string | null, end?: string | null) {
  return `${normalizeTime(start)} - ${normalizeTime(end)}`;
}

function formatDateVN(value?: string | null) {
  if (!value) return "Chưa có ngày";

  const parts = value.split("-");

  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  return value;
}

function getDateNumber(value?: string | null) {
  if (!value) return null;

  const parts = value.split("-");

  if (parts.length === 3) {
    const day = Number(parts[2]);

    return Number.isFinite(day) ? day : null;
  }

  return null;
}

function getMonthTitle(events: TrainingEvent[]) {
  const first = events.find((item) => item.class_date);

  if (first?.class_date) {
    const parts = first.class_date.split("-");

    if (parts.length === 3) {
      return `Calendar đào tạo tháng ${parts[1]}/${parts[0]}`;
    }
  }

  const now = new Date();

  return `Calendar đào tạo tháng ${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}/${now.getFullYear()}`;
}

function getEventClass(type?: string | null) {
  return String(type || "").toLowerCase() === "online"
    ? "bg-blue-100 text-blue-700"
    : "bg-orange-100 text-orange-700";
}

function isOnlineClass(type?: string | null) {
  return String(type || "").toLowerCase() === "online";
}

function getTrainingTypeText(type?: string | null) {
  return isOnlineClass(type) ? "Online" : "Offline";
}

function getStatusText(event: TrainingEvent) {
  if (event.checkin_status === "checked_in" || event.attended_at) {
    return "Đã check-in";
  }

  if (event.registration_status === "registered") {
    return "Đã đăng ký";
  }

  return "Sắp diễn ra";
}

function getStatusClass(status: string) {
  if (status === "Đã check-in") {
    return "bg-emerald-100 text-emerald-700 border border-emerald-200";
  }

  if (status === "Đã đăng ký") {
    return "bg-green-100 text-green-700 border border-green-200";
  }

  return "bg-blue-100 text-blue-700 border border-blue-200";
}

function getMeetingUrl(event: TrainingEvent) {
  return event.meeting_url || event.meeting_link || "";
}

function getLocationText(event: TrainingEvent) {
  if (isOnlineClass(event.training_type)) {
    return getMeetingUrl(event) ? "Google Meet / Online" : "Online";
  }

  return event.room_name || event.location || "Chưa có phòng học";
}

function getInstructorText(event: TrainingEvent) {
  return (
    event.instructor_name ||
    event.instructor_display_name ||
    "Chưa gán giảng viên"
  );
}

function normalizeStats(data: any): TrainingStats {
  return {
    total_this_month: Number(data?.total_this_month || 0),
    online_count: Number(data?.online_count || 0),
    offline_count: Number(data?.offline_count || 0),
    registered_count: Number(data?.registered_count || 0),
    attended_count: Number(data?.attended_count || 0),
    attendance_rate: Number(data?.attendance_rate || 0),
  };
}

export default function EmployeeTrainingSchedulePage() {
  const [events, setEvents] = useState<TrainingEvent[]>([]);
  const [stats, setStats] = useState<TrainingStats>(DEFAULT_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const [authInfo, setAuthInfo] = useState({
    userId: "",
    token: "",
  });

  useEffect(() => {
    setAuthInfo({
      userId: getCurrentUserId(),
      token: getAuthToken(),
    });
  }, []);

  const headers = useMemo(() => {
    const h: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (authInfo.userId) {
      h["x-user-id"] = authInfo.userId;
    }

    if (authInfo.token) {
      h.Authorization = `Bearer ${authInfo.token}`;
    }

    return h;
  }, [authInfo]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const userId = authInfo.userId || getCurrentUserId();
      const token = authInfo.token || getAuthToken();

      if (!userId) {
        throw new Error(
          "Không tìm thấy userId trong localStorage. Hãy đăng nhập lại để FE lấy được user."
        );
      }

      const finalHeaders: Record<string, string> = {
        "Content-Type": "application/json",
        "x-user-id": userId,
      };

      if (token) {
        finalHeaders.Authorization = `Bearer ${token}`;
      }

      const query = `?userId=${encodeURIComponent(userId)}`;

      const [scheduleResult, statsResult] = await Promise.all([
        fetchWithFallback<TrainingEvent[]>(TRAINING_API_PATHS, query, {
          method: "GET",
          headers: finalHeaders,
        }),
        fetchWithFallback<TrainingStats>(TRAINING_API_PATHS, `/stats${query}`, {
          method: "GET",
          headers: finalHeaders,
        }),
      ]);

      setEvents(
        Array.isArray(scheduleResult.json.data) ? scheduleResult.json.data : []
      );

      setStats(normalizeStats(statsResult.json.data));
    } catch (err: any) {
      console.error("[browser] Load employee training schedule error:", err);
      setError(err?.message || "Không thể kết nối API lịch đào tạo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authInfo.userId && !authInfo.token) {
      const timer = setTimeout(() => {
        setAuthInfo({
          userId: getCurrentUserId(),
          token: getAuthToken(),
        });
      }, 300);

      return () => clearTimeout(timer);
    }

    loadData();
  }, [authInfo.userId, authInfo.token]);

  const handleRegister = async (eventId: string) => {
    try {
      setActionLoadingId(eventId);
      setError("");

      const userId = authInfo.userId || getCurrentUserId();

      if (!userId) {
        throw new Error("Không tìm thấy userId để đăng ký lớp.");
      }

      await fetchWithFallback(
        TRAINING_API_PATHS,
        `/${eventId}/register?userId=${encodeURIComponent(userId)}`,
        {
          method: "POST",
          headers: {
            ...headers,
            "x-user-id": userId,
          },
        }
      );

      await loadData();
    } catch (err: any) {
      setError(err?.message || "Không thể đăng ký lớp đào tạo.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCheckIn = async (eventId: string) => {
    try {
      setActionLoadingId(eventId);
      setError("");

      const userId = authInfo.userId || getCurrentUserId();

      if (!userId) {
        throw new Error("Không tìm thấy userId để check-in.");
      }

      await fetchWithFallback(
        TRAINING_API_PATHS,
        `/${eventId}/check-in?userId=${encodeURIComponent(userId)}`,
        {
          method: "POST",
          headers: {
            ...headers,
            "x-user-id": userId,
          },
        }
      );

      await loadData();
    } catch (err: any) {
      setError(err?.message || "Không thể check-in lớp đào tạo.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const eventsByDate = useMemo(() => {
    const map = new Map<number, TrainingEvent[]>();

    events.forEach((event) => {
      const day = getDateNumber(event.class_date);

      if (!day) return;

      if (!map.has(day)) {
        map.set(day, []);
      }

      map.get(day)?.push(event);
    });

    return map;
  }, [events]);

  const upcomingSessions = useMemo(() => {
    return [...events].sort((a, b) => {
      const aKey = `${a.class_date || "9999-12-31"} ${a.start_time || ""}`;
      const bKey = `${b.class_date || "9999-12-31"} ${b.start_time || ""}`;

      return aKey.localeCompare(bKey);
    });
  }, [events]);

  return (
    <AppShell workspace="employee" title="Lịch đào tạo trực tiếp">
      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-orange-600">
            Live Training Schedule
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            Lịch đào tạo trực tiếp
          </h1>

          <p className="mt-2 text-slate-500">
            Theo dõi các buổi đào tạo offline, online, workshop nội bộ, thông
            tin giảng viên, phòng học và trạng thái check-in.
          </p>
        </section>

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            <AlertCircle className="mt-0.5 shrink-0" size={20} />

            <div className="flex-1">
              <p className="font-bold">Không lấy được dữ liệu</p>
              <p className="mt-1 text-sm">{error}</p>
              <p className="mt-2 text-xs text-red-500">
                API FE đang thử:{" "}
                {TRAINING_API_PATHS.map((p) => `${API_BASE}${p}`).join(" | ")}
              </p>
            </div>

            <button
              onClick={loadData}
              className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-bold text-red-600 shadow-sm hover:bg-red-100"
            >
              <RefreshCcw size={16} />
              Tải lại
            </button>
          </div>
        )}

        <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <CalendarDays className="text-orange-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {loading ? "-" : stats.total_this_month}
            </p>
            <p className="text-sm text-slate-500">Buổi đào tạo tháng này</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <MonitorPlay className="text-blue-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {loading ? "-" : stats.online_count}
            </p>
            <p className="text-sm text-slate-500">Buổi online</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Presentation className="text-orange-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {loading ? "-" : stats.offline_count}
            </p>
            <p className="text-sm text-slate-500">Buổi offline</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <UserCheck className="text-green-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {loading ? "-" : `${stats.attendance_rate || 0}%`}
            </p>
            <p className="text-sm text-slate-500">Tỷ lệ tham dự</p>
          </div>
        </section>

        <SectionCard title={getMonthTitle(events)}>
          <div className="mb-4 flex flex-wrap items-center gap-3 text-xs font-bold">
            <span className="rounded-full bg-orange-100 px-3 py-1 text-orange-700">
              Offline
            </span>
            <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-700">
              Online
            </span>
            <span className="rounded-full bg-green-100 px-3 py-1 text-green-700">
              Đã đăng ký
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
              Check-in
            </span>
          </div>

          {loading ? (
            <div className="flex min-h-[260px] items-center justify-center rounded-2xl border border-slate-200">
              <div className="flex items-center gap-3 text-slate-500">
                <Loader2 className="animate-spin" size={22} />
                Đang tải lịch đào tạo...
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[1100px] overflow-hidden rounded-2xl border border-slate-200">
                <div className="grid grid-cols-7 bg-slate-50">
                  {WEEK_DAYS.map((day) => (
                    <div
                      key={day}
                      className="border-r border-slate-200 p-4 text-center font-bold text-slate-700 last:border-r-0"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7">
                  {Array.from({ length: 35 }, (_, index) => index + 1).map(
                    (day) => {
                      const dayEvents = eventsByDate.get(day) || [];
                      const isToday = day === new Date().getDate();

                      return (
                        <div
                          key={day}
                          className="min-h-[155px] border-r border-t border-slate-200 bg-white p-3 last:border-r-0"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-slate-700">
                              {day <= 31 ? day : ""}
                            </span>

                            {isToday && (
                              <span className="rounded-full bg-orange-100 px-2 py-1 text-[10px] font-bold text-orange-700">
                                Hôm nay
                              </span>
                            )}
                          </div>

                          <div className="mt-3 space-y-2">
                            {dayEvents.map((event) => (
                              <div
                                key={event.id}
                                className={`rounded-lg px-2 py-2 text-xs font-bold leading-4 ${getEventClass(
                                  event.training_type
                                )}`}
                              >
                                <p className="line-clamp-2">{event.title}</p>
                                <p className="mt-1 opacity-70">
                                  {formatTimeRange(
                                    event.start_time,
                                    event.end_time
                                  )}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            </div>
          )}
        </SectionCard>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_380px]">
          <SectionCard title="Buổi đào tạo sắp tới">
            {loading ? (
              <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-slate-200">
                <div className="flex items-center gap-3 text-slate-500">
                  <Loader2 className="animate-spin" size={22} />
                  Đang tải buổi đào tạo...
                </div>
              </div>
            ) : upcomingSessions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <p className="font-bold text-slate-700">
                  Chưa có buổi đào tạo nào
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Khi quản trị LMS tạo lớp và gán phòng ban của bạn, lịch sẽ
                  hiển thị tại đây.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingSessions.map((session) => {
                  const statusText = getStatusText(session);
                  const registered =
                    session.registration_status === "registered";
                  const checkedIn =
                    session.checkin_status === "checked_in" ||
                    Boolean(session.attended_at);
                  const actionLoading = actionLoadingId === session.id;

                  return (
                    <div
                      key={session.id}
                      className="rounded-2xl border border-slate-200 p-5"
                    >
                      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                        <div>
                          <span
                            className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold ${getStatusClass(
                              statusText
                            )}`}
                          >
                            {statusText}
                          </span>

                          <h3 className="mt-3 font-bold text-slate-950">
                            {session.title}
                          </h3>

                          <p className="mt-1 text-sm text-slate-500">
                            {formatDateVN(session.class_date)} ·{" "}
                            {formatTimeRange(
                              session.start_time,
                              session.end_time
                            )}
                          </p>
                        </div>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${getEventClass(
                            session.training_type
                          )}`}
                        >
                          {getTrainingTypeText(session.training_type)}
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div className="rounded-xl bg-slate-50 p-3">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Users size={16} className="text-orange-600" />
                            Giảng viên
                          </div>

                          <p className="mt-1 font-bold text-slate-950">
                            {getInstructorText(session)}
                          </p>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-3">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <MapPin size={16} className="text-orange-600" />
                            Địa điểm
                          </div>

                          <p className="mt-1 font-bold text-slate-950">
                            {getLocationText(session)}
                          </p>
                        </div>
                      </div>

                      {session.description && (
                        <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-600">
                          {session.description}
                        </p>
                      )}

                      <div className="mt-4 flex flex-wrap gap-3">
                        {!registered && (
                          <button
                            disabled={actionLoading}
                            onClick={() => handleRegister(session.id)}
                            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {actionLoading ? (
                              <Loader2 size={17} className="animate-spin" />
                            ) : (
                              <CheckCircle2 size={17} />
                            )}
                            Đăng ký
                          </button>
                        )}

                        {registered && !checkedIn && (
                          <button
                            disabled={actionLoading}
                            onClick={() => handleCheckIn(session.id)}
                            className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-sm font-bold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {actionLoading ? (
                              <Loader2 size={17} className="animate-spin" />
                            ) : (
                              <QrCode size={17} />
                            )}
                            Check-in
                          </button>
                        )}

                        {checkedIn && (
                          <button
                            disabled
                            className="flex items-center gap-2 rounded-xl bg-green-100 px-4 py-2 text-sm font-bold text-green-700"
                          >
                            <CheckCircle2 size={17} />
                            Đã check-in
                          </button>
                        )}

                        {isOnlineClass(session.training_type) &&
                          getMeetingUrl(session) && (
                            <a
                              href={getMeetingUrl(session)}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-2 rounded-xl border border-blue-200 px-4 py-2 text-sm font-bold text-blue-600 hover:bg-blue-50"
                            >
                              <Video size={17} />
                              Vào phòng học
                            </a>
                          )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>

          <SectionCard title="Trạng thái tham dự">
            <div className="rounded-2xl bg-orange-50 p-5">
              <p className="text-sm text-slate-500">Tỷ lệ tham dự tháng này</p>

              <p className="mt-2 text-4xl font-bold text-slate-950">
                {stats.attendance_rate || 0}%
              </p>

              <div className="mt-4 h-3 overflow-hidden rounded-full bg-white">
                <div
                  className="h-full rounded-full bg-orange-500"
                  style={{
                    width: `${Math.min(
                      Math.max(stats.attendance_rate || 0, 0),
                      100
                    )}%`,
                  }}
                />
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-600">
                Bạn đã đăng ký {stats.registered_count || 0} buổi đào tạo, đã
                tham dự {stats.attended_count || 0} buổi. Còn{" "}
                {Math.max(
                  (stats.registered_count || 0) - (stats.attended_count || 0),
                  0
                )}{" "}
                buổi cần check-in trong tháng này.
              </p>
            </div>

            <div className="mt-4 space-y-3">
              {[
                "Check-in bằng QR tại phòng học",
                "Buổi online cần tham gia đúng giờ",
                "Vắng mặt cần gửi lý do cho quản lý",
                "Kết quả tham dự được lưu vào hồ sơ học tập",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-xl bg-slate-50 p-3"
                >
                  <CheckCircle2
                    className="mt-0.5 shrink-0 text-green-600"
                    size={18}
                  />

                  <p className="text-sm font-medium leading-6 text-slate-700">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </AppShell>
  );
}