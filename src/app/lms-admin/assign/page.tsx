"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/lms/AppShell";
import SectionCard from "@/components/lms/SectionCard";
import {
  Bell,
  BookOpen,
  ClipboardCheck,
  Plus,
  RefreshCw,
  Search,
  Send,
  Target,
  Users,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type UserItem = {
  id: string;
  full_name: string;
  email: string;
  department_name?: string | null;
  position?: string | null;
  status?: string | null;
};

type CourseItem = {
  id: string;
  title: string;
  level?: string | null;
  status?: string | null;
  duration_minutes?: number | null;
};

type EnrollmentItem = {
  id: string;
  progress_percent: number;
  status: string;
  enrolled_at?: string;
  user_id?: string;
  full_name: string;
  email: string;
  course_id?: string;
  course_title: string;
  level?: string | null;
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

function getStatusLabel(status: string) {
  if (status === "completed") return "Hoàn thành";
  if (status === "learning") return "Đang học";
  if (status === "active") return "Đang hoạt động";
  if (status === "published") return "Đã xuất bản";
  return status || "Không rõ";
}

function getStatusClass(status: string) {
  if (status === "completed" || status === "published" || status === "active") {
    return "bg-green-100 text-green-700 border border-green-200";
  }

  if (status === "learning") {
    return "bg-orange-100 text-orange-700 border border-orange-200";
  }

  return "bg-slate-100 text-slate-700 border border-slate-200";
}

export default function LMSAdminAssignPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [enrollments, setEnrollments] = useState<EnrollmentItem[]>([]);

  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [note, setNote] = useState("");

  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success"
  );

  const filteredUsers = useMemo(() => {
    const value = keyword.trim().toLowerCase();

    if (!value) return users;

    return users.filter((user) => {
      return (
        user.full_name?.toLowerCase().includes(value) ||
        user.email?.toLowerCase().includes(value) ||
        user.department_name?.toLowerCase().includes(value) ||
        user.position?.toLowerCase().includes(value)
      );
    });
  }, [users, keyword]);

  const stats = useMemo(() => {
    const totalEnrollments = enrollments.length;
    const completed = enrollments.filter(
      (item) => item.status === "completed"
    ).length;

    const avgProgress =
      totalEnrollments === 0
        ? 0
        : Math.round(
            enrollments.reduce(
              (sum, item) => sum + Number(item.progress_percent || 0),
              0
            ) / totalEnrollments
          );

    return {
      totalCourses: courses.length,
      totalUsers: users.length,
      totalEnrollments,
      completed,
      avgProgress,
    };
  }, [courses, users, enrollments]);

  async function fetchData() {
    try {
      setLoading(true);
      setMessage("");

      const token = getToken();

      if (!token) {
        throw new Error("Không tìm thấy token đăng nhập.");
      }

      const [usersResponse, coursesResponse, enrollmentsResponse] =
        await Promise.all([
          fetch(`${API_URL}/users`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${API_URL}/courses`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${API_URL}/enrollments`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

      const usersData = await usersResponse.json();
      const coursesData = await coursesResponse.json();
      const enrollmentsData = await enrollmentsResponse.json();

      if (!usersResponse.ok) {
        throw new Error(usersData.message || "Không lấy được danh sách nhân sự");
      }

      if (!coursesResponse.ok) {
        throw new Error(
          coursesData.message || "Không lấy được danh sách khóa học"
        );
      }

      if (!enrollmentsResponse.ok) {
        throw new Error(
          enrollmentsData.message || "Không lấy được danh sách ghi danh"
        );
      }

      setUsers(usersData.users || []);
      setCourses(coursesData.courses || []);
      setEnrollments(enrollmentsData.enrollments || []);
    } catch (error) {
      setMessageType("error");
      setMessage(
        error instanceof Error ? error.message : "Không tải được dữ liệu"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleAssignCourse() {
    try {
      setAssigning(true);
      setMessage("");

      const token = getToken();

      if (!token) {
        throw new Error("Không tìm thấy token đăng nhập.");
      }

      if (!selectedUserId) {
        throw new Error("Vui lòng chọn nhân sự cần gán khóa học.");
      }

      if (!selectedCourseId) {
        throw new Error("Vui lòng chọn khóa học cần gán.");
      }

      const response = await fetch(`${API_URL}/enrollments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: selectedUserId,
          course_id: selectedCourseId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gán khóa học thất bại");
      }

      setMessageType("success");
      setMessage("Gán khóa học cho nhân sự thành công.");

      setSelectedUserId("");
      setSelectedCourseId("");
      setNote("");

      await fetchData();
    } catch (error) {
      setMessageType("error");
      setMessage(error instanceof Error ? error.message : "Gán khóa học thất bại");
    } finally {
      setAssigning(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <AppShell workspace="lms-admin" title="Assign khóa học">
      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
            <div>
              <p className="text-sm font-semibold text-orange-600">
                Course Assignment
              </p>

              <h1 className="mt-2 text-3xl font-bold text-slate-950">
                Gán khóa học cho nhân viên
              </h1>

              <p className="mt-2 text-slate-500">
                Chọn nhân sự và khóa học để ghi danh trực tiếp vào hệ thống LMS.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchData}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-60"
            >
              <RefreshCw size={18} />
              {loading ? "Đang tải..." : "Làm mới dữ liệu"}
            </button>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <ClipboardCheck className="text-orange-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {stats.totalEnrollments}
            </p>
            <p className="text-sm text-slate-500">Tổng lượt ghi danh</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Users className="text-orange-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {stats.totalUsers}
            </p>
            <p className="text-sm text-slate-500">Nhân sự trong hệ thống</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <BookOpen className="text-orange-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {stats.totalCourses}
            </p>
            <p className="text-sm text-slate-500">Khóa học có thể gán</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Target className="text-orange-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {stats.avgProgress}%
            </p>
            <p className="text-sm text-slate-500">Tiến độ trung bình</p>
          </div>
        </section>

        {message && (
          <div
            className={`rounded-xl px-4 py-3 text-sm font-semibold ${
              messageType === "success"
                ? "border border-green-200 bg-green-50 text-green-700"
                : "border border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_0.9fr]">
          <SectionCard title="Thiết lập gán khóa học" action="Database">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <select
                value={selectedCourseId}
                onChange={(event) => setSelectedCourseId(event.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-400"
              >
                <option value="">Chọn khóa học</option>

                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>

              <select
                value={selectedUserId}
                onChange={(event) => setSelectedUserId(event.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-400"
              >
                <option value="">Chọn nhân sự</option>

                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.full_name} - {user.email}
                  </option>
                ))}
              </select>

              <select className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none">
                <option>Loại yêu cầu: Bắt buộc</option>
                <option>Tự chọn</option>
                <option>Đào tạo bổ sung</option>
              </select>

              <input
                type="date"
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
              />

              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Ghi chú nội bộ cho đợt gán khóa học..."
                className="min-h-[130px] rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none md:col-span-2"
              />
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleAssignCourse}
                disabled={assigning}
                className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-60"
              >
                <Send size={18} />
                {assigning ? "Đang gán..." : "Gán khóa học"}
              </button>

              <button
                type="button"
                className="flex items-center gap-2 rounded-xl border border-orange-200 bg-white px-5 py-3 text-sm font-bold text-orange-600 hover:bg-orange-50"
              >
                <Bell size={18} />
                Gửi thông báo
              </button>
            </div>
          </SectionCard>

          <SectionCard title="Danh sách nhân sự" action={`${users.length} người`}>
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <Search size={18} className="text-slate-400" />

              <input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Tìm nhân viên..."
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>

            <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
              {filteredUsers.map((user) => {
                const selected = selectedUserId === user.id;

                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => setSelectedUserId(user.id)}
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      selected
                        ? "border-orange-400 bg-orange-50"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 font-bold text-orange-600">
                        {user.full_name?.charAt(0) || "U"}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-slate-950">
                          {user.full_name}
                        </p>

                        <p className="truncate text-sm text-slate-500">
                          {user.email}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {user.position || "Nhân sự"} ·{" "}
                          {user.department_name || "Chưa có phòng ban"}
                        </p>
                      </div>

                      {selected && (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                          Đã chọn
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}

              {filteredUsers.length === 0 && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-slate-500">
                  Không tìm thấy nhân sự phù hợp.
                </div>
              )}
            </div>
          </SectionCard>
        </div>

        <SectionCard title="Lịch sử ghi danh gần đây" action="Enrollments">
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="p-4">Nhân sự</th>
                  <th className="p-4">Khóa học</th>
                  <th className="p-4 text-center">Tiến độ</th>
                  <th className="p-4 text-center">Trạng thái</th>
                  <th className="p-4">Ngày gán</th>
                </tr>
              </thead>

              <tbody>
                {enrollments.map((item) => (
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

                {enrollments.length === 0 && !loading && (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-500">
                      Chưa có lượt ghi danh nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}