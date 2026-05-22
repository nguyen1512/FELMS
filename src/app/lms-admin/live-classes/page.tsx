"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/lms/AppShell";
import SectionCard from "@/components/lms/SectionCard";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Copy,
  ExternalLink,
  MapPin,
  Plus,
  Presentation,
  Trash2,
  UserCog,
  Video,
} from "lucide-react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type LiveClass = {
  id: string;
  title: string;
  course_id?: string | null;
  course_title?: string | null;
  instructor_id?: string | null;
  instructor_name?: string | null;
  training_type: "online" | "offline";
  class_date: string;
  start_time: string;
  end_time?: string | null;
  room_name?: string | null;
  meeting_link?: string | null;
  note?: string | null;
  status?: string | null;
  created_at?: string;
  updated_at?: string;
};

type LiveClassStats = {
  total_classes: number;
  online_classes: number;
  offline_classes: number;
  configured_percent: number;
};

type CourseOption = {
  id?: string;
  course_id?: string;
  title?: string;
  name?: string;
  course_title?: string;
  course_name?: string;
};

type InstructorOption = {
  id: string;
  full_name?: string;
  name?: string;
  email?: string;
  role?: string;
};

type FormState = {
  title: string;
  course_id: string;
  instructor_id: string;
  training_type: "" | "online" | "offline";
  class_date: string;
  start_time: string;
  end_time: string;
  room_name: string;
  meeting_link: string;
  note: string;
};

const initialForm: FormState = {
  title: "",
  course_id: "",
  instructor_id: "",
  training_type: "",
  class_date: "",
  start_time: "",
  end_time: "",
  room_name: "",
  meeting_link: "",
  note: "",
};

function getCourseId(course: CourseOption) {
  return course.id || course.course_id || "";
}

function getCourseName(course: CourseOption) {
  return (
    course.title ||
    course.name ||
    course.course_title ||
    course.course_name ||
    "Khóa học chưa có tên"
  );
}

function getStatusClass(item: LiveClass) {
  const configured =
    (item.training_type === "online" && item.meeting_link) ||
    (item.training_type === "offline" && item.room_name);

  if (configured) {
    return "bg-green-100 text-green-700 border border-green-200";
  }

  return "bg-orange-100 text-orange-700 border border-orange-200";
}

function getStatusText(item: LiveClass) {
  if (item.training_type === "online") {
    return item.meeting_link ? "Đã gắn link" : "Chưa có link";
  }

  return item.room_name ? "Phòng offline" : "Chưa có phòng";
}

function getTypeClass(type: string) {
  return type === "online"
    ? "bg-blue-100 text-blue-700"
    : "bg-orange-100 text-orange-700";
}

function formatType(type: string) {
  return type === "online" ? "Online" : "Offline";
}

function formatDate(dateValue?: string | null) {
  if (!dateValue) return "Chưa có ngày";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }

  return date.toLocaleDateString("vi-VN");
}

function formatTime(timeValue?: string | null) {
  if (!timeValue) return "";

  return timeValue.slice(0, 5);
}

export default function LMSAdminLiveClassesPage() {
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [stats, setStats] = useState<LiveClassStats>({
    total_classes: 0,
    online_classes: 0,
    offline_classes: 0,
    configured_percent: 0,
  });

  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [instructors, setInstructors] = useState<InstructorOption[]>([]);

  const [form, setForm] = useState<FormState>(initialForm);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function fetchLiveClasses() {
    const response = await fetch(`${API_BASE_URL}/live-classes`, {
      cache: "no-store",
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Không thể tải danh sách buổi đào tạo");
    }

    setLiveClasses(result.data || []);
  }

  async function fetchStats() {
    const response = await fetch(`${API_BASE_URL}/live-classes/stats`, {
      cache: "no-store",
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Không thể tải thống kê buổi đào tạo");
    }

    setStats({
      total_classes: Number(result.data?.total_classes || 0),
      online_classes: Number(result.data?.online_classes || 0),
      offline_classes: Number(result.data?.offline_classes || 0),
      configured_percent: Number(result.data?.configured_percent || 0),
    });
  }

  async function fetchCourses() {
    try {
      const response = await fetch(`${API_BASE_URL}/courses`, {
        cache: "no-store",
      });

      const result = await response.json();

      if (response.ok && result.success) {
        const rawCourses =
          result.data?.courses ||
          result.data?.items ||
          result.data ||
          result.courses ||
          [];

        setCourses(Array.isArray(rawCourses) ? rawCourses : []);
      }
    } catch {
      setCourses([]);
    }
  }

  async function fetchInstructors() {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        cache: "no-store",
      });

      const result = await response.json();

      if (response.ok && result.success) {
        const rawUsers =
          result.data?.users || result.data?.items || result.data || [];

        setInstructors(Array.isArray(rawUsers) ? rawUsers : []);
      }
    } catch {
      setInstructors([]);
    }
  }

  async function loadPageData() {
    try {
      setLoading(true);
      setError("");

      await Promise.all([
        fetchLiveClasses(),
        fetchStats(),
        fetchCourses(),
        fetchInstructors(),
      ]);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Có lỗi xảy ra khi tải dữ liệu";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPageData();
  }, []);

  function handleChange(field: keyof FormState, value: string) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function handleSubmit() {
    try {
      setSaving(true);
      setMessage("");
      setError("");

      if (!form.title.trim()) {
        setError("Vui lòng nhập tên buổi đào tạo");
        return;
      }

      if (!form.training_type) {
        setError("Vui lòng chọn hình thức đào tạo");
        return;
      }

      if (!form.class_date) {
        setError("Vui lòng chọn ngày học");
        return;
      }

      if (!form.start_time) {
        setError("Vui lòng chọn giờ bắt đầu");
        return;
      }

      if (form.training_type === "online" && !form.meeting_link.trim()) {
        setError("Buổi online cần có link Google Meet hoặc Zoom");
        return;
      }

      if (form.training_type === "offline" && !form.room_name.trim()) {
        setError("Buổi offline cần có phòng học");
        return;
      }

      const payload = {
        title: form.title.trim(),
        course_id: form.course_id || null,
        instructor_id: form.instructor_id || null,
        training_type: form.training_type,
        class_date: form.class_date,
        start_time: form.start_time,
        end_time: form.end_time || null,
        room_name: form.room_name.trim() || null,
        meeting_link: form.meeting_link.trim() || null,
        note: form.note.trim() || null,
        status: "scheduled",
      };

      const response = await fetch(`${API_BASE_URL}/live-classes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Không thể tạo buổi đào tạo");
      }

      setMessage("Tạo buổi đào tạo thành công");
      setForm(initialForm);

      await Promise.all([fetchLiveClasses(), fetchStats()]);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Có lỗi xảy ra khi tạo buổi đào tạo";
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteLiveClass(id: string, title: string) {
    const isConfirmed = window.confirm(
      `Bạn có chắc chắn muốn xóa buổi đào tạo "${title}" không?`
    );

    if (!isConfirmed) return;

    try {
      setDeletingId(id);
      setMessage("");
      setError("");

      const response = await fetch(`${API_BASE_URL}/live-classes/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Không thể xóa buổi đào tạo");
      }

      setMessage("Xóa buổi đào tạo thành công");

      await Promise.all([fetchLiveClasses(), fetchStats()]);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Có lỗi xảy ra khi xóa buổi đào tạo";
      setError(errorMessage);
    } finally {
      setDeletingId(null);
    }
  }

  async function handleCopyLink(link?: string | null) {
    try {
      setMessage("");
      setError("");

      if (!link) {
        setError("Buổi học này chưa có link để copy");
        return;
      }

      await navigator.clipboard.writeText(link);
      setMessage("Đã copy link phòng học");
    } catch {
      setError("Không thể copy link phòng học");
    }
  }

  const sortedLiveClasses = useMemo(() => {
    return [...liveClasses].sort((a, b) => {
      const dateA = `${a.class_date || ""} ${a.start_time || ""}`;
      const dateB = `${b.class_date || ""} ${b.start_time || ""}`;
      return dateB.localeCompare(dateA);
    });
  }, [liveClasses]);

  return (
    <AppShell workspace="lms-admin" title="Lớp đào tạo trực tiếp">
      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-sm font-semibold text-orange-600">
                Live Class Management
              </p>

              <h1 className="mt-2 text-3xl font-bold text-slate-950">
                Quản lý lớp đào tạo trực tiếp
              </h1>

              <p className="mt-2 max-w-3xl text-slate-500">
                Tạo buổi đào tạo online/offline, gắn giảng viên, phòng học,
                link Google Meet hoặc Zoom để nhân viên có thể vào lớp ngay.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                const el = document.getElementById("live-class-form");
                el?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600"
            >
              <Plus size={18} />
              Tạo buổi đào tạo
            </button>
          </div>
        </section>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
            {message}
          </div>
        )}

        <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <CalendarDays className="text-orange-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {stats.total_classes}
            </p>
            <p className="text-sm text-slate-500">Buổi đào tạo</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Video className="text-blue-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {stats.online_classes}
            </p>
            <p className="text-sm text-slate-500">Buổi online</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Presentation className="text-orange-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {stats.offline_classes}
            </p>
            <p className="text-sm text-slate-500">Buổi offline</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <CheckCircle2 className="text-green-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {stats.configured_percent}%
            </p>
            <p className="text-sm text-slate-500">Đã cấu hình phòng</p>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[420px_1fr]">
          <SectionCard title="Tạo / gắn link phòng học">
            <div id="live-class-form" className="space-y-4">
              <input
                value={form.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="Tên buổi đào tạo"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-400"
              />

              <select
                value={form.course_id}
                onChange={(e) => handleChange("course_id", e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-400"
              >
                <option value="">Gắn với khóa học/lớp học</option>

                {courses.map((course) => {
                  const courseId = getCourseId(course);

                  if (!courseId) return null;

                  return (
                    <option key={courseId} value={courseId}>
                      {getCourseName(course)}
                    </option>
                  );
                })}
              </select>

              <select
                value={form.instructor_id}
                onChange={(e) => handleChange("instructor_id", e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-400"
              >
                <option value="">Chọn giảng viên</option>

                {instructors.map((instructor) => (
                  <option key={instructor.id} value={instructor.id}>
                    {instructor.full_name ||
                      instructor.name ||
                      instructor.email ||
                      "Giảng viên chưa có tên"}
                  </option>
                ))}
              </select>

              <select
                value={form.training_type}
                onChange={(e) =>
                  handleChange(
                    "training_type",
                    e.target.value as FormState["training_type"]
                  )
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-400"
              >
                <option value="">Hình thức đào tạo</option>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
              </select>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <input
                    type="date"
                    value={form.class_date}
                    onChange={(e) =>
                      handleChange("class_date", e.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-400"
                  />

                  <p className="px-1 text-xs text-slate-400">
                    Ngày diễn ra buổi đào tạo.
                  </p>
                </div>

                <div className="space-y-1">
                  <input
                    type="time"
                    value={form.start_time}
                    onChange={(e) =>
                      handleChange("start_time", e.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-400"
                  />

                  <p className="px-1 text-xs text-slate-400">
                    Giờ bắt đầu buổi học, ví dụ: 08:30.
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <input
                  type="time"
                  value={form.end_time}
                  onChange={(e) => handleChange("end_time", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-400"
                />

                <p className="px-1 text-xs text-slate-400">
                  Giờ kết thúc buổi học, ví dụ: 10:00. Có thể bỏ trống nếu
                  chưa xác định.
                </p>
              </div>

              <input
                value={form.room_name}
                onChange={(e) => handleChange("room_name", e.target.value)}
                placeholder="Phòng học offline, ví dụ: A301"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-400"
              />

              <input
                value={form.meeting_link}
                onChange={(e) => handleChange("meeting_link", e.target.value)}
                placeholder="Link Google Meet / Zoom"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-400"
              />

              <textarea
                value={form.note}
                onChange={(e) => handleChange("note", e.target.value)}
                rows={4}
                placeholder="Ghi chú cho học viên..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-400"
              />

              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Plus size={18} />
                {saving ? "Đang lưu..." : "Lưu buổi đào tạo"}
              </button>
            </div>
          </SectionCard>

          <SectionCard title="Danh sách lớp đào tạo trực tiếp">
            {loading ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm font-semibold text-slate-500">
                Đang tải danh sách buổi đào tạo...
              </div>
            ) : sortedLiveClasses.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm font-semibold text-slate-500">
                Chưa có buổi đào tạo nào. Hãy tạo buổi đào tạo đầu tiên.
              </div>
            ) : (
              <div className="space-y-4">
                {sortedLiveClasses.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-slate-200 p-5"
                  >
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                      <div>
                        <div className="flex flex-wrap gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${getTypeClass(
                              item.training_type
                            )}`}
                          >
                            {formatType(item.training_type)}
                          </span>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusClass(
                              item
                            )}`}
                          >
                            {getStatusText(item)}
                          </span>
                        </div>

                        <h3 className="mt-3 text-xl font-bold text-slate-950">
                          {item.title}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          {item.course_title || "Chưa gắn khóa học/lớp học"}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {item.meeting_link && (
                          <a
                            href={item.meeting_link}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2 text-sm font-bold text-white hover:bg-blue-600"
                          >
                            <ExternalLink size={16} />
                            Mở phòng học
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => handleCopyLink(item.meeting_link)}
                          className="inline-flex items-center gap-2 rounded-xl border border-orange-200 px-4 py-2 text-sm font-bold text-orange-600 hover:bg-orange-50"
                        >
                          <Copy size={16} />
                          Copy link
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteLiveClass(item.id, item.title)
                          }
                          disabled={deletingId === item.id}
                          className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Trash2 size={16} />
                          {deletingId === item.id ? "Đang xóa..." : "Xóa"}
                        </button>
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                      <div className="rounded-xl bg-slate-50 p-3">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <UserCog size={15} />
                          Giảng viên
                        </div>

                        <p className="mt-1 font-bold text-slate-950">
                          {item.instructor_name || "Chưa gắn giảng viên"}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-3">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <CalendarDays size={15} />
                          Ngày học
                        </div>

                        <p className="mt-1 font-bold text-slate-950">
                          {formatDate(item.class_date)}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-3">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Clock3 size={15} />
                          Thời gian
                        </div>

                        <p className="mt-1 font-bold text-slate-950">
                          {formatTime(item.start_time)}
                          {item.end_time
                            ? ` - ${formatTime(item.end_time)}`
                            : ""}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-3">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <MapPin size={15} />
                          Phòng học
                        </div>

                        <p className="mt-1 font-bold text-slate-950">
                          {item.training_type === "online"
                            ? "Google Meet / Zoom"
                            : item.room_name || "Chưa có phòng"}
                        </p>
                      </div>
                    </div>

                    {item.meeting_link && (
                      <div className="mt-4 rounded-xl bg-blue-50 p-4">
                        <p className="text-xs font-semibold text-blue-600">
                          Link phòng học online
                        </p>

                        <p className="mt-1 break-all text-sm font-bold text-blue-700">
                          {item.meeting_link}
                        </p>
                      </div>
                    )}

                    {item.note && (
                      <div className="mt-4 rounded-xl bg-slate-50 p-4">
                        <p className="text-xs font-semibold text-slate-500">
                          Ghi chú
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-700">
                          {item.note}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        <SectionCard title="Quy tắc hiển thị cho học viên">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {[
              {
                title: "Online có nút vào phòng",
                desc: "Nếu có link Meet/Zoom, học viên bấm vào là join ngay.",
                icon: Video,
              },
              {
                title: "Offline hiện phòng học",
                desc: "Nếu không có link online, hệ thống hiển thị phòng học.",
                icon: MapPin,
              },
              {
                title: "Theo đúng lịch",
                desc: "Buổi học được hiển thị theo ngày giờ đã set.",
                icon: CalendarDays,
              },
              {
                title: "Gắn với khóa học",
                desc: "Mỗi buổi live class có thể liên kết với khóa học LMS.",
                icon: BookOpenIcon,
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-2xl border border-slate-200 bg-white p-5"
                >
                  <Icon className="text-orange-600" size={22} />

                  <h3 className="mt-3 font-bold text-slate-950">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
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

function BookOpenIcon({
  className,
  size,
}: {
  className?: string;
  size?: number;
}) {
  return <Presentation className={className} size={size} />;
}