"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/lms/AppShell";
import SectionCard from "@/components/lms/SectionCard";
import {
  Award,
  BookOpen,
  Edit3,
  GraduationCap,
  Plus,
  Search,
  Star,
  Trash2,
  UserCheck,
  Users,
} from "lucide-react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type Instructor = {
  id: string;
  name: string;
  full_name?: string;
  email?: string | null;
  phone?: string | null;
  position?: string | null;
  specialty?: string | null;
  expertise?: string | null;
  description?: string | null;
  bio?: string | null;
  rating?: number | string | null;
  status?: string | null;
  assigned_courses?: number;
  created_at?: string;
};

type Course = {
  id: string;
  title?: string;
  name?: string;
  course_name?: string;
  description?: string | null;
  status?: string | null;
};

type InstructorStats = {
  totalInstructors: number;
  totalAssignedCourses: number;
  averageRating: number;
  totalSpecialties: number;
};

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};

function getStatusLabel(status?: string | null) {
  if (!status) return "Đang hoạt động";

  const normalized = status.toLowerCase();

  if (normalized === "active" || normalized === "đang hoạt động") {
    return "Đang hoạt động";
  }

  if (normalized === "inactive" || normalized === "tạm nghỉ") {
    return "Tạm nghỉ";
  }

  return status;
}

function getStatusClass(status?: string | null) {
  const label = getStatusLabel(status);

  return label === "Đang hoạt động"
    ? "bg-green-100 text-green-700"
    : "bg-slate-100 text-slate-600";
}

function getCourseTitle(course: Course) {
  return (
    course.title ||
    course.name ||
    course.course_name ||
    "Khóa học chưa có tên"
  );
}

function normalizeListResponse<T>(payload: any): T[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.courses)) return payload.courses;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
}

export default function LMSAdminInstructorsPage() {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState<InstructorStats>({
    totalInstructors: 0,
    totalAssignedCourses: 0,
    averageRating: 0,
    totalSpecialties: 0,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [search, setSearch] = useState("");
  const [filterSpecialty, setFilterSpecialty] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const [newInstructor, setNewInstructor] = useState({
    name: "",
    position: "",
    specialty: "",
    description: "",
  });

  const [assignForm, setAssignForm] = useState({
    instructor_id: "",
    course_id: "",
    start_date: "",
    role_in_course: "",
  });

  const specialtyOptions = useMemo(() => {
    const values = instructors
      .map((item) => item.specialty || item.expertise)
      .filter(Boolean) as string[];

    return Array.from(new Set(values));
  }, [instructors]);

  const filteredInstructors = useMemo(() => {
    return instructors.filter((item) => {
      const keyword = search.trim().toLowerCase();

      const name = item.name || item.full_name || "";
      const position = item.position || "";
      const specialty = item.specialty || item.expertise || "";
      const description = item.description || item.bio || "";
      const statusLabel = getStatusLabel(item.status);

      const matchSearch =
        !keyword ||
        name.toLowerCase().includes(keyword) ||
        position.toLowerCase().includes(keyword) ||
        specialty.toLowerCase().includes(keyword) ||
        description.toLowerCase().includes(keyword);

      const matchSpecialty =
        filterSpecialty === "all" || specialty === filterSpecialty;

      const matchStatus =
        filterStatus === "all" ||
        statusLabel === filterStatus ||
        item.status === filterStatus;

      return matchSearch && matchSpecialty && matchStatus;
    });
  }, [instructors, search, filterSpecialty, filterStatus]);

  async function fetchStats() {
    try {
      const res = await fetch(`${API_BASE_URL}/instructors/stats`, {
        cache: "no-store",
      });

      const payload: ApiResponse<InstructorStats> = await res.json();

      if (!res.ok || !payload.success) {
        throw new Error(payload.message || "Không thể lấy thống kê giảng viên");
      }

      setStats(payload.data);
    } catch (error) {
      console.error("FETCH INSTRUCTOR STATS ERROR:", error);
    }
  }

  async function fetchInstructors() {
    try {
      const res = await fetch(`${API_BASE_URL}/instructors`, {
        cache: "no-store",
      });

      const payload = await res.json();

      if (!res.ok) {
        throw new Error(payload.message || "Không thể lấy danh sách giảng viên");
      }

      setInstructors(normalizeListResponse<Instructor>(payload));
    } catch (error) {
      console.error("FETCH INSTRUCTORS ERROR:", error);
      setMessage("Không thể tải danh sách giảng viên");
    }
  }

  async function fetchCourses() {
    try {
      const res = await fetch(`${API_BASE_URL}/instructors/course-options`, {
        cache: "no-store",
      });

      const payload = await res.json();

      if (!res.ok || !payload.success) {
        throw new Error(payload.message || "Không thể lấy danh sách khóa học");
      }

      const courseList = Array.isArray(payload.data) ? payload.data : [];

      setCourses(courseList);
    } catch (error) {
      console.error("FETCH COURSES ERROR:", error);
      setCourses([]);
      setMessage("Không thể tải danh sách khóa học");
    }
  }

  async function refreshData() {
    setLoading(true);
    try {
      await Promise.all([fetchStats(), fetchInstructors(), fetchCourses()]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshData();
  }, []);

  async function handleCreateInstructor() {
    setMessage("");

    if (
      !newInstructor.name.trim() ||
      !newInstructor.position.trim() ||
      !newInstructor.specialty.trim()
    ) {
      setMessage("Vui lòng nhập đầy đủ tên, chức danh và chuyên môn giảng viên");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE_URL}/instructors`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newInstructor.name.trim(),
          position: newInstructor.position.trim(),
          specialty: newInstructor.specialty.trim(),
          description: newInstructor.description.trim(),
        }),
      });

      const payload = await res.json();

      if (!res.ok || !payload.success) {
        throw new Error(payload.message || "Thêm giảng viên thất bại");
      }

      setNewInstructor({
        name: "",
        position: "",
        specialty: "",
        description: "",
      });

      setMessage("Thêm giảng viên thành công");
      await Promise.all([fetchStats(), fetchInstructors()]);
    } catch (error: any) {
      console.error("CREATE INSTRUCTOR ERROR:", error);
      setMessage(error.message || "Lỗi khi thêm giảng viên");
    } finally {
      setLoading(false);
    }
  }

  async function handleAssignInstructor() {
    setMessage("");

    if (!assignForm.instructor_id || !assignForm.course_id) {
      setMessage("Vui lòng chọn giảng viên và khóa học cần gán");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE_URL}/instructors/assign-course`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          instructor_id: assignForm.instructor_id,
          course_id: assignForm.course_id,
          start_date: assignForm.start_date || null,
          role_in_course:
            assignForm.role_in_course || "Giảng viên phụ trách",
        }),
      });

      const payload = await res.json();

      if (!res.ok || !payload.success) {
        throw new Error(payload.message || "Gán giảng viên thất bại");
      }

      setAssignForm({
        instructor_id: "",
        course_id: "",
        start_date: "",
        role_in_course: "",
      });

      setMessage("Gán giảng viên vào khóa học thành công");
      await Promise.all([fetchStats(), fetchInstructors()]);
    } catch (error: any) {
      console.error("ASSIGN INSTRUCTOR ERROR:", error);
      setMessage(error.message || "Lỗi khi gán giảng viên vào khóa học");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteInstructor(id: string) {
    const confirmed = window.confirm(
      "Bạn có chắc chắn muốn xóa giảng viên này không?"
    );

    if (!confirmed) return;

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE_URL}/instructors/${id}`, {
        method: "DELETE",
      });

      const payload = await res.json();

      if (!res.ok || !payload.success) {
        throw new Error(payload.message || "Xóa giảng viên thất bại");
      }

      setMessage("Xóa giảng viên thành công");
      await Promise.all([fetchStats(), fetchInstructors()]);
    } catch (error: any) {
      console.error("DELETE INSTRUCTOR ERROR:", error);
      setMessage(error.message || "Lỗi khi xóa giảng viên");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell workspace="lms-admin" title="Quản lý giảng viên">
      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
            <div>
              <p className="text-sm font-semibold text-orange-600">
                Instructor Management
              </p>
              <h1 className="mt-2 text-3xl font-bold text-slate-950">
                Quản lý giảng viên nội bộ
              </h1>
              <p className="mt-2 text-slate-500">
                Quản lý người phụ trách đào tạo, chuyên môn giảng dạy và các
                khóa học đang phụ trách.
              </p>
            </div>

            <button
              onClick={() => {
                const target = document.getElementById("create-instructor");
                target?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600"
            >
              <Plus size={18} />
              Thêm giảng viên
            </button>
          </div>
        </section>

        {message && (
          <div className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-700">
            {message}
          </div>
        )}

        <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Users className="text-orange-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {stats.totalInstructors}
            </p>
            <p className="text-sm text-slate-500">Giảng viên nội bộ</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <BookOpen className="text-orange-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {stats.totalAssignedCourses}
            </p>
            <p className="text-sm text-slate-500">Khóa đang phụ trách</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Star className="text-orange-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {Number(stats.averageRating || 0).toFixed(1)}
            </p>
            <p className="text-sm text-slate-500">Đánh giá trung bình</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Award className="text-orange-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {stats.totalSpecialties}
            </p>
            <p className="text-sm text-slate-500">Nhóm chuyên môn</p>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div id="create-instructor">
            <SectionCard title="Thêm giảng viên mới" action="Lưu nháp">
              <div className="space-y-4">
                <input
                  value={newInstructor.name}
                  onChange={(e) =>
                    setNewInstructor((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder="Tên giảng viên"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-400"
                />

                <input
                  value={newInstructor.position}
                  onChange={(e) =>
                    setNewInstructor((prev) => ({
                      ...prev,
                      position: e.target.value,
                    }))
                  }
                  placeholder="Chức danh"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-400"
                />

                <select
                  value={newInstructor.specialty}
                  onChange={(e) =>
                    setNewInstructor((prev) => ({
                      ...prev,
                      specialty: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-400"
                >
                  <option value="">Chuyên môn đào tạo</option>
                  <option value="Đào tạo hội nhập">Đào tạo hội nhập</option>
                  <option value="CRM & CSKH">CRM & CSKH</option>
                  <option value="Quản lý lớp học">Quản lý lớp học</option>
                  <option value="Tư vấn tuyển sinh">Tư vấn tuyển sinh</option>
                  <option value="Công nghệ thông tin">
                    Công nghệ thông tin
                  </option>
                </select>

                <textarea
                  value={newInstructor.description}
                  onChange={(e) =>
                    setNewInstructor((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Mô tả kinh nghiệm, chuyên môn, phạm vi phụ trách..."
                  className="min-h-[110px] w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-400"
                />

                <button
                  onClick={handleCreateInstructor}
                  disabled={loading}
                  className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Plus size={18} />
                  {loading ? "Đang lưu..." : "Thêm giảng viên"}
                </button>
              </div>
            </SectionCard>
          </div>

          <SectionCard title="Gán giảng viên vào khóa học">
            <div className="space-y-4">
              <select
                value={assignForm.instructor_id}
                onChange={(e) =>
                  setAssignForm((prev) => ({
                    ...prev,
                    instructor_id: e.target.value,
                  }))
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
              >
                <option value="">Chọn giảng viên</option>
                {instructors.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name || item.full_name}
                  </option>
                ))}
              </select>

              <select
                value={assignForm.course_id}
                onChange={(e) =>
                  setAssignForm((prev) => ({
                    ...prev,
                    course_id: e.target.value,
                  }))
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
              >
                <option value="">Chọn khóa học phụ trách</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {getCourseTitle(course)}
                  </option>
                ))}
              </select>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <input
                  type="date"
                  value={assignForm.start_date}
                  onChange={(e) =>
                    setAssignForm((prev) => ({
                      ...prev,
                      start_date: e.target.value,
                    }))
                  }
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
                />

                <select
                  value={assignForm.role_in_course}
                  onChange={(e) =>
                    setAssignForm((prev) => ({
                      ...prev,
                      role_in_course: e.target.value,
                    }))
                  }
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
                >
                  <option value="">Vai trò trong khóa</option>
                  <option value="Giảng viên chính">Giảng viên chính</option>
                  <option value="Người duyệt nội dung">
                    Người duyệt nội dung
                  </option>
                  <option value="Người chấm bài">Người chấm bài</option>
                </select>
              </div>

              <button
                onClick={handleAssignInstructor}
                disabled={loading}
                className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <UserCheck size={18} />
                {loading ? "Đang gán..." : "Gán giảng viên"}
              </button>
            </div>
          </SectionCard>
        </div>

        <SectionCard title="Bộ lọc giảng viên">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_220px_220px]">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <Search size={18} className="text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm kiếm giảng viên..."
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>

            <select
              value={filterSpecialty}
              onChange={(e) => setFilterSpecialty(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
            >
              <option value="all">Tất cả chuyên môn</option>
              {specialtyOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="Đang hoạt động">Đang hoạt động</option>
              <option value="Tạm nghỉ">Tạm nghỉ</option>
            </select>
          </div>
        </SectionCard>

        <SectionCard title="Danh sách giảng viên">
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="p-4">Giảng viên</th>
                  <th className="p-4">Chuyên môn</th>
                  <th className="p-4">Khóa phụ trách</th>
                  <th className="p-4">Học viên</th>
                  <th className="p-4">Đánh giá</th>
                  <th className="p-4">Trạng thái</th>
                  <th className="p-4 text-right">Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {filteredInstructors.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="p-6 text-center text-sm text-slate-500"
                    >
                      {loading
                        ? "Đang tải dữ liệu..."
                        : "Chưa có giảng viên phù hợp"}
                    </td>
                  </tr>
                ) : (
                  filteredInstructors.map((item) => {
                    const displayName =
                      item.name || item.full_name || "Chưa có tên";
                    const displaySpecialty =
                      item.specialty || item.expertise || "Chưa cập nhật";
                    const displayPosition =
                      item.position || "Chưa cập nhật chức danh";
                    const rating = Number(item.rating || 0);

                    return (
                      <tr key={item.id} className="border-t border-slate-100">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 font-bold text-orange-600">
                              {displayName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-slate-950">
                                {displayName}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {displayPosition}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="p-4 text-slate-600">
                          {displaySpecialty}
                        </td>

                        <td className="p-4 font-semibold">
                          {item.assigned_courses || 0}
                        </td>

                        <td className="p-4 font-semibold">0</td>

                        <td className="p-4">
                          <div className="flex items-center gap-1 font-bold text-orange-600">
                            <Star size={15} fill="currentColor" />
                            {rating.toFixed(1)}
                          </div>
                        </td>

                        <td className="p-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusClass(
                              item.status
                            )}`}
                          >
                            {getStatusLabel(item.status)}
                          </span>
                        </td>

                        <td className="p-4">
                          <div className="flex justify-end gap-2">
                            <button className="rounded-lg border border-orange-200 p-2 text-orange-600 hover:bg-orange-50">
                              <Edit3 size={16} />
                            </button>

                            <button
                              onClick={() => handleDeleteInstructor(item.id)}
                              className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard title="Quy tắc quản lý giảng viên">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              {
                title: "Mỗi khóa có giảng viên phụ trách",
                desc: "Giảng viên chịu trách nhiệm nội dung, tài liệu và câu hỏi.",
              },
              {
                title: "Đánh giá dựa trên phản hồi học viên",
                desc: "Điểm đánh giá giúp theo dõi chất lượng đào tạo.",
              },
              {
                title: "Phân quyền theo vai trò",
                desc: "Có thể là giảng viên chính, người duyệt hoặc người chấm bài.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-200 p-4"
              >
                <GraduationCap className="text-orange-600" size={22} />
                <h3 className="mt-3 font-bold text-slate-950">
                  {item.title}
                </h3>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}