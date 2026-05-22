"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/lms/AppShell";
import ProgressBar from "@/components/lms/ProgressBar";
import SectionCard from "@/components/lms/SectionCard";
import {
  BookOpen,
  CheckCircle2,
  Plus,
  Route,
  Search,
  Target,
  Trash2,
  Users,
  Building2,
  Layers3,
  RefreshCcw,
} from "lucide-react";

type Course = {
  id: string;
  title: string;
  category: string;
};

type Department = {
  id: string;
  name: string;
};

type LearningLevel = {
  id: string;
  level: number;
  position: string;
  competency: string;
  courseIds: string[];
};

type LearningPath = {
  id: string;
  title: string;
  department: string;
  type: string;
  courses: number;
  learners: number;
  progress: number;
  deadline: string;
  objective: string;
  levels: LearningLevel[];
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "http://localhost:5000/api";

const fallbackDepartments: Department[] = [
  { id: "all", name: "Toàn công ty" },
  { id: "it", name: "Chuyển đổi số" },
  { id: "crm", name: "Chăm sóc học viên" },
  { id: "sales", name: "Kinh doanh" },
  { id: "training", name: "Đào tạo" },
  { id: "hr", name: "Nhân sự" },
];

const defaultLevelsTemplate: LearningLevel[] = [
  {
    id: "level-1",
    level: 1,
    position: "",
    competency: "",
    courseIds: []
  },
  {
    id: "level-2",
    level: 2,
    position: "",
    competency: "",
    courseIds: []
  },
  {
    id: "level-3",
    level: 3,
    position: "",
    competency: "",
    courseIds: []
  },
];

function isValidUUID(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

function getCookie(name: string) {
  if (typeof document === "undefined") return "";

  const cookies = document.cookie.split(";");

  for (const cookie of cookies) {
    const [rawKey, ...rawValue] = cookie.trim().split("=");

    if (rawKey === name) {
      return decodeURIComponent(rawValue.join("="));
    }
  }

  return "";
}

function getTokenFromClient() {
  if (typeof window === "undefined") return "";

  const cookieToken = getCookie("token");

  if (
    cookieToken &&
    cookieToken !== "undefined" &&
    cookieToken !== "null"
  ) {
    return cookieToken.replace(/^Bearer\s+/i, "");
  }

  const directKeys = [
    "token",
    "accessToken",
    "authToken",
    "lms_token",
    "anu_lms_token",
    "adminToken",
    "jwt",
    "auth_token",
    "access_token",
    "userToken",
    "admin_token",
  ];

  for (const key of directKeys) {
    const value = localStorage.getItem(key);

    if (value && value !== "undefined" && value !== "null") {
      return value.replace(/^Bearer\s+/i, "");
    }
  }

  const jsonKeys = [
    "user",
    "auth",
    "authUser",
    "currentUser",
    "lms_user",
    "admin",
    "adminUser",
    "loginUser",
    "userInfo",
    "auth_raw",
  ];

  for (const key of jsonKeys) {
    const value = localStorage.getItem(key);
    if (!value) continue;

    try {
      const parsed = JSON.parse(value);

      const token =
        parsed?.token ||
        parsed?.accessToken ||
        parsed?.authToken ||
        parsed?.jwt ||
        parsed?.access_token ||
        parsed?.data?.token ||
        parsed?.data?.accessToken ||
        parsed?.data?.access_token ||
        parsed?.user?.token ||
        parsed?.user?.accessToken ||
        parsed?.user?.access_token ||
        parsed?.admin?.token ||
        parsed?.admin?.accessToken;

      if (token) {
        return String(token).replace(/^Bearer\s+/i, "");
      }
    } catch {
      continue;
    }
  }

  return "";
}

function getAuthHeaders(): HeadersInit {
  const token = getTokenFromClient();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

function cloneDefaultLevels(): LearningLevel[] {
  return defaultLevelsTemplate.map((level) => ({
    ...level,
    id: `level-${level.level}-${Date.now()}-${Math.random()}`,
    courseIds: [],
  }));
}

function normalizeApiList(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.courses)) return data.courses;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.learningPaths)) return data.learningPaths;
  return [];
}

function normalizeCourse(item: any): Course {
  return {
    id: String(item.id || item.course_id || item.courseId || ""),
    title:
      item.title ||
      item.name ||
      item.course_name ||
      item.courseTitle ||
      item.course_title ||
      "Khóa học chưa có tên",
    category:
      item.category ||
      item.category_name ||
      item.course_category ||
      item.type ||
      item.level ||
      item.status ||
      "Khóa học",
  };
}

function normalizeCourseId(rawValue: any): string {
  if (typeof rawValue === "string") return rawValue;

  if (rawValue && typeof rawValue === "object") {
    return String(
      rawValue.id ||
        rawValue.course_id ||
        rawValue.courseId ||
        rawValue.value ||
        ""
    );
  }

  return "";
}

function formatDeadlineForDisplay(dateValue: string) {
  if (!dateValue) return "Chưa có";
  if (dateValue.includes("/")) return dateValue;

  const onlyDate = dateValue.split("T")[0];
  const [year, month, day] = onlyDate.split("-");

  if (!year || !month || !day) return dateValue;

  return `${day}/${month}/${year}`;
}

function normalizeLearningPath(item: any): LearningPath {
  const rawLevels: any[] = Array.isArray(item.levels) ? item.levels : [];

  const levels: LearningLevel[] = rawLevels
    .map((level: any, index: number): LearningLevel => {
      const rawCourseIds =
        level.courseIds ||
        level.course_ids ||
        level.courseids ||
        level.courseIdsJson ||
        level.courses ||
        [];

      return {
        id: String(level.id || `level-${item.id}-${index}`),
        level: Number(level.level || level.level_number || index + 1),
        position: level.position || level.title || "",
        competency: level.competency || level.description || "",
        courseIds: Array.isArray(rawCourseIds)
          ? rawCourseIds
              .map((courseId: any) => normalizeCourseId(courseId))
              .filter((courseId: string) => isValidUUID(courseId))
          : [],
      };
    })
    .sort((a: LearningLevel, b: LearningLevel) => a.level - b.level);

  return {
    id: String(item.id),
    title: item.title || item.name || "Lộ trình chưa có tên",
    department: item.department || item.department_name || "Chưa xác định",
    type: item.type || item.path_type || "Chưa phân loại",
    courses: Number(item.courses || item.total_courses || 0),
    learners: Number(item.learners || item.total_learners || 0),
    progress: Number(item.progress || 0),
    deadline: formatDeadlineForDisplay(item.deadline || ""),
    objective: item.objective || item.description || "",
    levels,
  };
}

async function parseResponse(res: Response) {
  const text = await res.text();

  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text;
  }
}

export default function LMSAdminLearningPathsPage() {
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [departments, setDepartments] =
    useState<Department[]>(fallbackDepartments);

  const [pathTitle, setPathTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [pathType, setPathType] = useState("");
  const [deadline, setDeadline] = useState("");
  const [objective, setObjective] = useState("");
  const [levels, setLevels] = useState<LearningLevel[]>(cloneDefaultLevels());

  const [searchText, setSearchText] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("Tất cả phòng ban");
  const [filterType, setFilterType] = useState("Tất cả loại lộ trình");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [coursesError, setCoursesError] = useState("");
  const [learningPathsError, setLearningPathsError] = useState("");

  useEffect(() => {
    fetchInitialData();
  }, []);

  async function fetchInitialData() {
    setLoading(true);

    try {
      await Promise.all([
        fetchCourses(),
        fetchDepartments(),
        fetchLearningPaths(),
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function fetchCourses() {
    setCoursesError("");

    try {
      const url = `${API_BASE}/courses`;
      const token = getTokenFromClient();

      console.log("Đang gọi API khóa học:", url);
      console.log("Token gửi lên BE:", token ? "Có token" : "Không có token");

      const res = await fetch(url, {
        method: "GET",
        headers: getAuthHeaders(),
        cache: "no-store",
      });

      const data = await parseResponse(res);

      if (!res.ok) {
        console.log("GET courses failed:", {
          url,
          status: res.status,
          statusText: res.statusText,
          response: data,
        });

        setCourses([]);

        if (res.status === 401) {
          setCoursesError(
            "Không thể tải khóa học vì thiếu token đăng nhập. Hãy đăng xuất, đăng nhập lại tài khoản admin, sau đó quay lại trang này và bấm Tải lại."
          );
          return;
        }

        setCoursesError(
          `Không thể tải danh sách khóa học. API ${url} trả status ${res.status}.`
        );
        return;
      }

      const list: Course[] = normalizeApiList(data).map((item: any) =>
        normalizeCourse(item)
      );

      console.log("Danh sách khóa học từ DB:", list);

      setCourses(list);

      if (list.length === 0) {
        setCoursesError("API courses đã chạy nhưng chưa trả về khóa học nào.");
      }
    } catch (error) {
      console.log("Lỗi tải khóa học:", error);
      setCourses([]);
      setCoursesError(
        `Không thể kết nối tới ${API_BASE}/courses. Hãy kiểm tra BE hoặc biến NEXT_PUBLIC_API_URL.`
      );
    }
  }

  async function fetchDepartments() {
    try {
      const res = await fetch(`${API_BASE}/departments`, {
        method: "GET",
        headers: getAuthHeaders(),
        cache: "no-store",
      });

      const data = await parseResponse(res);

      if (!res.ok) {
        setDepartments(fallbackDepartments);
        return;
      }

      const list = normalizeApiList(data);

      if (list.length === 0) {
        setDepartments(fallbackDepartments);
        return;
      }

      setDepartments(
        list.map((item: any) => ({
          id: String(item.id || item.name || Math.random()),
          name:
            item.name ||
            item.department_name ||
            item.title ||
            "Phòng ban chưa có tên",
        }))
      );
    } catch (error) {
      console.log("Lỗi tải phòng ban:", error);
      setDepartments(fallbackDepartments);
    }
  }

  async function fetchLearningPaths() {
    setLearningPathsError("");

    try {
      const res = await fetch(`${API_BASE}/learning-paths`, {
        method: "GET",
        headers: getAuthHeaders(),
        cache: "no-store",
      });

      const data = await parseResponse(res);

      if (!res.ok) {
        console.log("GET learning-paths failed:", {
          url: `${API_BASE}/learning-paths`,
          status: res.status,
          statusText: res.statusText,
          response: data,
        });

        setLearningPaths([]);
        setLearningPathsError(
          `Không thể tải danh sách lộ trình. API ${API_BASE}/learning-paths trả status ${res.status}.`
        );
        return;
      }

      const list: LearningPath[] = normalizeApiList(data).map((item: any) =>
        normalizeLearningPath(item)
      );

      setLearningPaths(list);
    } catch (error) {
      console.log("Lỗi tải lộ trình học tập:", error);
      setLearningPaths([]);
      setLearningPathsError(
        `Không thể kết nối tới ${API_BASE}/learning-paths. Hãy kiểm tra BE hoặc biến NEXT_PUBLIC_API_URL.`
      );
    }
  }

  const totalLearners = learningPaths.reduce(
    (total, path) => total + path.learners,
    0
  );

  const averageProgress =
    learningPaths.length > 0
      ? Math.round(
          learningPaths.reduce((total, path) => total + path.progress, 0) /
            learningPaths.length
        )
      : 0;

  const filteredLearningPaths = useMemo(() => {
    return learningPaths.filter((path) => {
      const matchSearch = path.title
        .toLowerCase()
        .includes(searchText.toLowerCase());

      const matchDepartment =
        filterDepartment === "Tất cả phòng ban" ||
        path.department === filterDepartment;

      const matchType =
        filterType === "Tất cả loại lộ trình" || path.type === filterType;

      return matchSearch && matchDepartment && matchType;
    });
  }, [learningPaths, searchText, filterDepartment, filterType]);

  const pathsByDepartment = useMemo(() => {
    const departmentNames = Array.from(
      new Set([
        ...departments.map((dept) => dept.name),
        ...filteredLearningPaths.map((path) => path.department),
      ])
    );

    return departmentNames.map((departmentName) => ({
      department: departmentName,
      paths: filteredLearningPaths.filter(
        (path) => path.department === departmentName
      ),
    }));
  }, [departments, filteredLearningPaths]);

  function handleChangeLevel(
    levelId: string,
    field: keyof LearningLevel,
    value: string | number | string[]
  ) {
    setLevels((prev) =>
      prev.map((level) =>
        level.id === levelId
          ? {
              ...level,
              [field]: value,
            }
          : level
      )
    );
  }

  function handleToggleCourse(levelId: string, courseId: string) {
    if (!isValidUUID(courseId)) {
      alert(
        "Khóa học này có ID không hợp lệ nên không thể gán vào lộ trình. Hãy kiểm tra lại bảng courses trong database."
      );
      return;
    }

    setLevels((prev) =>
      prev.map((level) => {
        if (level.id !== levelId) return level;

        const existed = level.courseIds.includes(courseId);

        return {
          ...level,
          courseIds: existed
            ? level.courseIds.filter((id) => id !== courseId)
            : [...level.courseIds, courseId],
        };
      })
    );
  }

  function handleAddLevel() {
    setLevels((prev) => [
      ...prev,
      {
        id: `level-${Date.now()}`,
        level: prev.length + 1,
        position: "",
        competency: "",
        courseIds: [],
      },
    ]);
  }

  function handleRemoveLevel(levelId: string) {
    setLevels((prev) =>
      prev
        .filter((level) => level.id !== levelId)
        .map((level, index) => ({
          ...level,
          level: index + 1,
        }))
    );
  }

  function handleResetForm() {
    setPathTitle("");
    setDepartment("");
    setPathType("");
    setDeadline("");
    setObjective("");
    setLevels(cloneDefaultLevels());
  }

  async function handleCreateLearningPath() {
    if (!pathTitle.trim()) {
      alert("Vui lòng nhập tên lộ trình.");
      return;
    }

    if (!department) {
      alert("Vui lòng chọn phòng ban áp dụng.");
      return;
    }

    if (!pathType) {
      alert("Vui lòng chọn loại lộ trình.");
      return;
    }

    if (!deadline) {
      alert("Vui lòng chọn deadline hoàn thành.");
      return;
    }

    if (courses.length === 0) {
      alert(
        `Chưa có khóa học nào được tải từ database. Kiểm tra ${API_BASE}/courses.`
      );
      return;
    }

    const invalidLevel = levels.find(
      (level) =>
        !level.position.trim() ||
        !level.competency.trim() ||
        level.courseIds.filter((courseId) => isValidUUID(courseId)).length === 0
    );

    if (invalidLevel) {
      alert(
        `Bậc ${invalidLevel.level} chưa đủ chức danh, yêu cầu năng lực hoặc chưa tick khóa học hợp lệ.`
      );
      return;
    }

    const payload = {
      title: pathTitle.trim(),
      department,
      type: pathType,
      deadline,
      objective: objective.trim(),
      levels: levels.map((level) => ({
        level: level.level,
        position: level.position.trim(),
        competency: level.competency.trim(),
        courseIds: level.courseIds.filter((courseId) => isValidUUID(courseId)),
      })),
    };

    const invalidPayloadLevel = payload.levels.find(
      (level) => level.courseIds.length === 0
    );

    if (invalidPayloadLevel) {
      alert(
        `Bậc ${invalidPayloadLevel.level} chưa có khóa học hợp lệ để gửi xuống backend.`
      );
      return;
    }

    console.log("Payload gửi xuống BE:", payload);

    setSaving(true);

    try {
      const res = await fetch(`${API_BASE}/learning-paths`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await parseResponse(res);

      if (!res.ok || data?.success === false) {
        throw new Error(data?.message || "Tạo lộ trình học tập thất bại");
      }

      alert("Tạo lộ trình học tập thành công.");
      handleResetForm();
      await fetchLearningPaths();
    } catch (error: any) {
      console.log("Lỗi tạo lộ trình:", error);
      alert(error.message || "Không thể tạo lộ trình học tập.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteLearningPath(pathId: string) {
    const confirmed = window.confirm(
      "Bạn có chắc chắn muốn xóa lộ trình này không?"
    );

    if (!confirmed) return;

    setDeletingId(pathId);

    try {
      const res = await fetch(`${API_BASE}/learning-paths/${pathId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      const data = await parseResponse(res);

      if (!res.ok || data?.success === false) {
        throw new Error(data?.message || "Xóa lộ trình thất bại");
      }

      setLearningPaths((prev) => prev.filter((path) => path.id !== pathId));
      alert("Xóa lộ trình học tập thành công.");
    } catch (error: any) {
      console.log("Lỗi xóa lộ trình:", error);
      alert(error.message || "Không thể xóa lộ trình học tập.");
    } finally {
      setDeletingId(null);
    }
  }

  function getCourseTitle(courseId: string) {
    return (
      courses.find((course) => course.id === courseId)?.title ||
      "Khóa học không tồn tại"
    );
  }

  return (
    <AppShell workspace="lms-admin" title="Quản trị lộ trình học tập">
      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
            <div>
              <p className="text-sm font-semibold text-orange-600">
                Learning Path Management
              </p>

              <h1 className="mt-2 text-3xl font-bold text-slate-950">
                Quản trị lộ trình học tập
              </h1>

              <p className="mt-2 text-slate-500">
                Xây dựng lộ trình đào tạo riêng cho từng phòng ban, từng chức
                danh và từng level năng lực của nhân viên.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={fetchInitialData}
                disabled={loading}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCcw size={18} />
                {loading ? "Đang tải..." : "Tải lại"}
              </button>

              <button
                type="button"
                onClick={handleResetForm}
                className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600"
              >
                <Plus size={18} />
                Tạo lộ trình mới
              </button>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Route className="text-orange-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {learningPaths.length}
            </p>
            <p className="text-sm text-slate-500">Tổng lộ trình</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <BookOpen className="text-orange-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {courses.length}
            </p>
            <p className="text-sm text-slate-500">Khóa học trong DB</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Users className="text-orange-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {totalLearners}
            </p>
            <p className="text-sm text-slate-500">Nhân sự được gán</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Target className="text-orange-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {averageProgress}%
            </p>
            <p className="text-sm text-slate-500">Hoàn thành trung bình</p>
          </div>
        </section>

        <SectionCard
          title="Tạo lộ trình học tập theo phòng ban"
          action="Lưu nháp"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <input
              value={pathTitle}
              onChange={(e) => setPathTitle(e.target.value)}
              placeholder="Tên lộ trình"
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-400"
            />

            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-400"
            >
              <option value="">Phòng ban áp dụng</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.name}>
                  {dept.name}
                </option>
              ))}
            </select>

            <select
              value={pathType}
              onChange={(e) => setPathType(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-400"
            >
              <option value="">Loại lộ trình</option>
              <option value="Bắt buộc">Bắt buộc</option>
              <option value="Tự chọn">Tự chọn</option>
              <option value="Theo chức danh">Theo chức danh</option>
              <option value="Nâng cấp năng lực">Nâng cấp năng lực</option>
              <option value="Onboarding">Onboarding</option>
            </select>

            <div>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-400"
              />
              <p className="mt-2 text-xs text-slate-500">
                Deadline là hạn cuối nhân viên của phòng ban này cần hoàn thành
                toàn bộ khóa học trong lộ trình.
              </p>
            </div>
          </div>

          <textarea
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            placeholder="Mô tả mục tiêu năng lực sau khi hoàn thành lộ trình..."
            className="mt-4 min-h-[110px] w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-400"
          />

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-center">
              <div>
                <h3 className="font-bold text-slate-950">
                  Gán level và khóa học cho lộ trình
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Toàn bộ khóa học bên dưới được lấy trực tiếp từ database. Tick
                  vào khóa học để gán cho từng bậc.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddLevel}
                className="flex items-center justify-center gap-2 rounded-xl border border-orange-200 bg-white px-4 py-2 text-sm font-bold text-orange-600 hover:bg-orange-50"
              >
                <Plus size={16} />
                Thêm bậc
              </button>
            </div>

            {coursesError && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <p className="font-bold">Lỗi tải khóa học</p>
                <p className="mt-1">{coursesError}</p>
                <p className="mt-2 text-xs">API hiện tại: {API_BASE}/courses</p>
              </div>
            )}

            {!coursesError && courses.length === 0 && (
              <div className="mb-4 rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
                Chưa có khóa học nào trong database.
              </div>
            )}

            <div className="space-y-4">
              {levels.map((level) => (
                <div
                  key={level.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-sm font-bold text-orange-600">
                        {level.level}
                      </div>

                      <div>
                        <p className="font-bold text-slate-950">
                          Bậc {level.level}
                        </p>
                        <p className="text-xs text-slate-500">
                          Dành cho phòng ban: {department || "Chưa chọn"}
                        </p>
                      </div>
                    </div>

                    {levels.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveLevel(level.id)}
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                        Xóa
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-[0.4fr_0.6fr]">
                    <input
                      value={level.position}
                      onChange={(e) =>
                        handleChangeLevel(level.id, "position", e.target.value)
                      }
                      placeholder="Chức danh, ví dụ: Developer – Fresher"
                      className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-400"
                    />

                    <textarea
                      value={level.competency}
                      onChange={(e) =>
                        handleChangeLevel(
                          level.id,
                          "competency",
                          e.target.value
                        )
                      }
                      placeholder="Yêu cầu năng lực của bậc này..."
                      className="min-h-[95px] resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-400"
                    />
                  </div>

                  <div className="mt-4">
                    <p className="mb-3 text-sm font-bold text-slate-700">
                      Chọn khóa học cho bậc {level.level}
                    </p>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      {courses.map((course) => {
                        const checked = level.courseIds.includes(course.id);
                        const validCourseId = isValidUUID(course.id);

                        return (
                          <label
                            key={course.id}
                            className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm transition ${
                              checked
                                ? "border-orange-300 bg-orange-50 text-orange-800"
                                : "border-slate-200 bg-white text-slate-700 hover:border-orange-200"
                            } ${
                              !validCourseId
                                ? "cursor-not-allowed opacity-60"
                                : ""
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              disabled={!validCourseId}
                              onChange={() =>
                                handleToggleCourse(level.id, course.id)
                              }
                              className="mt-1 accent-orange-500 disabled:cursor-not-allowed"
                            />

                            <span>
                              <span className="block font-bold">
                                {course.title}
                              </span>

                              <span className="mt-1 block text-xs text-slate-500">
                                {course.category}
                              </span>

                              {!validCourseId && (
                                <span className="mt-1 block text-xs font-semibold text-red-500">
                                  ID khóa học không hợp lệ, không thể gán vào lộ
                                  trình
                                </span>
                              )}
                            </span>
                          </label>
                        );
                      })}
                    </div>

                    <p className="mt-3 text-xs text-slate-500">
                      Đã chọn {level.courseIds.length} khóa học cho bậc{" "}
                      {level.level}.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleCreateLearningPath}
            disabled={saving}
            className="mt-4 flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Plus size={18} />
            {saving ? "Đang tạo..." : "Tạo lộ trình cho phòng ban"}
          </button>
        </SectionCard>

        <SectionCard title="Bộ lọc lộ trình">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_220px_220px]">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <Search size={18} className="text-slate-400" />
              <input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Tìm kiếm lộ trình..."
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>

            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
            >
              <option>Tất cả phòng ban</option>
              {departments.map((dept) => (
                <option key={dept.id}>{dept.name}</option>
              ))}
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
            >
              <option>Tất cả loại lộ trình</option>
              <option>Bắt buộc</option>
              <option>Tự chọn</option>
              <option>Theo chức danh</option>
              <option>Nâng cấp năng lực</option>
              <option>Onboarding</option>
            </select>
          </div>
        </SectionCard>

        <SectionCard title="Danh sách lộ trình theo từng phòng ban">
          {learningPathsError && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <p className="font-bold">Lỗi tải lộ trình</p>
              <p className="mt-1">{learningPathsError}</p>
            </div>
          )}

          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">
              <p className="font-bold text-slate-700">
                Đang tải danh sách lộ trình...
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {pathsByDepartment.map((group) => {
                if (group.paths.length === 0) return null;

                return (
                  <div
                    key={group.department}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                          <Building2 size={20} />
                        </div>

                        <div>
                          <h3 className="font-bold text-slate-950">
                            {group.department}
                          </h3>
                          <p className="text-sm text-slate-500">
                            {group.paths.length} lộ trình đang triển khai
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {group.paths.map((path) => (
                        <div
                          key={path.id}
                          className="rounded-2xl border border-slate-200 bg-white p-5"
                        >
                          <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-start">
                            <div>
                              <div className="mb-2 flex flex-wrap items-center gap-2">
                                <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
                                  {path.type}
                                </span>

                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                                  {path.department}
                                </span>
                              </div>

                              <h3 className="text-lg font-bold text-slate-950">
                                {path.title}
                              </h3>

                              <p className="mt-1 text-sm text-slate-500">
                                {path.courses} khóa học · {path.learners} học
                                viên · Hạn: {path.deadline}
                              </p>

                              {path.objective && (
                                <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-600">
                                  {path.objective}
                                </p>
                              )}
                            </div>

                            <div className="flex gap-2">
                              <button className="rounded-xl border border-orange-200 px-4 py-2 text-sm font-bold text-orange-600 hover:bg-orange-50">
                                Cấu hình
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteLearningPath(path.id)
                                }
                                disabled={deletingId === path.id}
                                className="rounded-xl border border-red-200 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {deletingId === path.id ? "Đang xóa..." : "Xóa"}
                              </button>
                            </div>
                          </div>

                          {path.levels && path.levels.length > 0 && (
                            <div className="mt-5 space-y-3">
                              <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                <Layers3
                                  size={18}
                                  className="text-orange-600"
                                />
                                Level trong lộ trình
                              </div>

                              {path.levels.map((level) => (
                                <div
                                  key={level.id}
                                  className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                                >
                                  <div className="flex items-start gap-3">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-sm font-bold text-orange-600">
                                      {level.level}
                                    </div>

                                    <div className="flex-1">
                                      <p className="font-bold text-slate-950">
                                        {level.position}
                                      </p>

                                      <p className="mt-1 whitespace-pre-line text-sm leading-6 text-slate-500">
                                        {level.competency}
                                      </p>

                                      <div className="mt-3 flex flex-wrap gap-2">
                                        {level.courseIds.map((courseId) => (
                                          <span
                                            key={courseId}
                                            className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600"
                                          >
                                            {getCourseTitle(courseId)}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="mt-5">
                            <div className="mb-2 flex justify-between text-sm">
                              <span className="text-slate-500">
                                Tiến độ hoàn thành
                              </span>
                              <span className="font-bold text-orange-600">
                                {path.progress}%
                              </span>
                            </div>
                            <ProgressBar value={path.progress} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {filteredLearningPaths.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                  <BookOpen className="mx-auto text-slate-400" size={34} />
                  <p className="mt-3 font-bold text-slate-700">
                    Không tìm thấy lộ trình phù hợp
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Hãy thử thay đổi từ khóa tìm kiếm hoặc bộ lọc.
                  </p>
                </div>
              )}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Quy tắc hoàn thành lộ trình">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              {
                title: "Hoàn thành tuần tự",
                desc: "Nhân viên cần hoàn thành khóa trước để mở khóa bước tiếp theo.",
              },
              {
                title: "Đạt điểm tối thiểu",
                desc: "Mỗi quiz cuối khóa phải đạt từ 80 điểm trở lên.",
              },
              {
                title: "Cấp chứng chỉ",
                desc: "Chứng chỉ lộ trình được cấp sau khi hoàn thành toàn bộ khóa.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-200 p-4"
              >
                <CheckCircle2 className="text-green-600" size={22} />
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