"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/lms/AppShell";
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Eye,
  FileText,
  Filter,
  GraduationCap,
  GripVertical,
  Library,
  Lock,
  MoreHorizontal,
  PenTool,
  Plus,
  Rocket,
  Save,
  Search,
  Upload,
  UploadCloud,
  Video,
  X,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const BUILDER_API = `${API_URL}/builder`;
const FILE_BASE_URL = "http://localhost:5000";

type Status = "active" | "draft" | "review" | "published";

type LessonType =
  | "video"
  | "document"
  | "quiz"
  | "file"
  | "assignment"
  | "resource";

type Course = {
  id: string;
  title: string;
  code: string;
  category: string;
  lessons: number;
  completion: number;
  status: Status;
  level: string;
  owner: string;
};

type Lesson = {
  id: string;
  title: string;
  description?: string;
  content?: string;
  type: LessonType;
  lesson_type?: LessonType;
  time: string;
  duration_minutes?: number;
  required: boolean;
  is_required?: boolean;
  content_url?: string | null;
  video_url?: string | null;
  material_url?: string | null;
  quiz_id?: string | null;
  quiz_title?: string | null;
  quiz_pass_score?: number | string | null;
  quiz_time_limit_minutes?: number | string | null;
  quiz_max_attempts?: number | string | null;
  assignment_url?: string | null;
  library_resource_id?: string | null;
};

type Section = {
  id: string;
  title: string;
  sort_order?: number;
  lessons: Lesson[];
};

type LearningTargetType = "all" | "department" | "employee";

type LearningTarget = {
  id: string;
  name: string;
  email?: string | null;
  department_id?: string | null;
};

const libraryOptions = [
  {
    id: "video-onboarding",
    label: "Kho video đào tạo nội bộ",
    type: "video",
    url: "library://videos/internal-training",
  },
  {
    id: "crm-docs",
    label: "Kho tài liệu CRM",
    type: "document",
    url: "library://documents/crm",
  },
  {
    id: "quiz-bank",
    label: "Kho câu hỏi quiz",
    type: "quiz",
    url: "library://quiz-bank/general",
  },
  {
    id: "assignment-bank",
    label: "Kho bài tập tình huống",
    type: "assignment",
    url: "library://assignments/cases",
  },
];

const fallbackCourses: Course[] = [
  {
    id: "1",
    title: "Onboarding nhân sự mới",
    code: "ANU-ONB-01",
    category: "Đào tạo nội bộ",
    lessons: 16,
    completion: 74,
    status: "active",
    level: "Beginner",
    owner: "HR Team",
  },
];

const fallbackSections: Section[] = [
  {
    id: "s1",
    title: "Phần 1: Nội dung khóa học",
    lessons: [
      {
        id: "l1",
        title: "Giới thiệu hệ thống LMS",
        description: "Bài học giới thiệu tổng quan hệ thống LMS nội bộ.",
        type: "video",
        lesson_type: "video",
        time: "08:30",
        required: true,
      },
    ],
  },
];

function makeLocalId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function statusLabel(status: Status | string) {
  if (status === "active" || status === "published") return "Đang hoạt động";
  if (status === "draft") return "Nháp";
  if (status === "review") return "Chờ duyệt";
  return "Không rõ";
}

function lessonIcon(type: LessonType | string) {
  if (type === "video") return Video;
  if (type === "document") return FileText;
  if (type === "quiz") return ClipboardCheck;
  if (type === "file") return Upload;
  if (type === "assignment") return PenTool;
  return Library;
}

function getCourseHeaderStyle(course: Course) {
  if (course.status === "review") {
    return { background: "linear-gradient(135deg, #fb923c 0%, #fb7185 100%)" };
  }

  if (course.status === "draft") {
    return { background: "linear-gradient(135deg, #1e293b 0%, #475569 100%)" };
  }

  return { background: "linear-gradient(135deg, #f97316 0%, #f59e0b 100%)" };
}

function normalizeCourse(raw: any): Course {
  const id = String(raw.id || makeLocalId("course"));

  return {
    id,
    title: raw.title?.trim() || raw.name?.trim() || "Khóa học chưa đặt tên",
    code: raw.code || `COURSE-${id.slice(0, 8)}`,
    category: raw.category || raw.category_name || "Đào tạo nội bộ",
    lessons: Number(raw.lessons || raw.lesson_count || 0),
    completion: Number(raw.completion || raw.completion_rate || 0),
    status: raw.status || "draft",
    level: raw.level || "Cơ bản",
    owner: raw.owner || "Admin LMS",
  };
}

function normalizeLesson(raw: any): Lesson {
  const hasQuiz = Boolean(raw.quiz_id);
  const hasVideo = Boolean(raw.video_url);
  const hasMaterial = Boolean(raw.material_url || raw.assignment_url || raw.library_resource_id);

  let type = (raw.type || raw.lesson_type || raw.content_type || "video") as LessonType;

  if (hasQuiz) type = "quiz";
  else if (hasVideo) type = "video";
  else if (hasMaterial && type !== "video") type = "resource";

  const duration = Number(raw.duration_minutes || 15);

  return {
    id: String(raw.id || makeLocalId("lesson")),
    title: raw.title || "Bài học chưa đặt tên",
    description: raw.description || raw.content || "",
    content: raw.content || raw.description || "",
    type,
    lesson_type: type,
    time: raw.time || `${duration} phút`,
    duration_minutes: duration,
    required: raw.required ?? raw.is_required ?? true,
    is_required: raw.required ?? raw.is_required ?? true,

    video_url: raw.video_url || null,
    material_url: raw.material_url || null,
    content_url: raw.content_url || raw.video_url || raw.material_url || null,

    quiz_id: raw.quiz_id || null,
    quiz_title: raw.quiz_title || null,
    quiz_pass_score: raw.quiz_pass_score ?? null,
    quiz_time_limit_minutes: raw.quiz_time_limit_minutes ?? null,
    quiz_max_attempts: raw.quiz_max_attempts ?? null,

    assignment_url: raw.assignment_url || raw.material_url || null,
    library_resource_id: raw.library_resource_id || null,
  };
}

function normalizeSections(rawSections: any[]): Section[] {
  return rawSections.map((section) => ({
    id: String(section.id || makeLocalId("section")),
    title: section.title || "Phần nội dung",
    sort_order: Number(section.sort_order || 0),
    lessons: (section.lessons || []).map(normalizeLesson),
  }));
}

function buildFileUrl(url?: string | null) {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  if (url.startsWith("library://")) return url;
  return `${FILE_BASE_URL}${url}`;
}

function isUUID(value?: string | null) {
  if (!value) return false;

  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    String(value).trim()
  );
}

async function readJsonSafe(response: Response) {
  const text = await response.text();

  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);

  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [newCourseTitle, setNewCourseTitle] = useState("");
  const [newCourseCategory, setNewCourseCategory] = useState("Đào tạo nội bộ");
  const [newCourseLevel, setNewCourseLevel] = useState("Cơ bản");

  const [videoFile, setVideoFile] = useState<File | null>(null);

  const [quizTitle, setQuizTitle] = useState("");
  const [quizPassScore, setQuizPassScore] = useState("");
  const [quizQuestionCount, setQuizQuestionCount] = useState("");

  const [assignmentTitle, setAssignmentTitle] = useState("");
  const [assignmentFile, setAssignmentFile] = useState<File | null>(null);

  const [selectedLibraryId, setSelectedLibraryId] = useState("");

  const [courseStatus, setCourseStatus] = useState<"draft" | "active">("draft");
  const [learningTargetType, setLearningTargetType] = useState<LearningTargetType>("all");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [departments, setDepartments] = useState<LearningTarget[]>([]);
  const [employees, setEmployees] = useState<LearningTarget[]>([]);

  const [courseStats, setCourseStats] = useState({
    totalCourses: 0,
    activeLearners: 0,
    completionRate: 0,
    pendingCourses: 0,
  });

  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [editLessonTitle, setEditLessonTitle] = useState("");
  const [editLessonDescription, setEditLessonDescription] = useState("");

  const [showCreateLesson, setShowCreateLesson] = useState(false);
  const [creatingSectionId, setCreatingSectionId] = useState("");
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [newLessonType, setNewLessonType] = useState<LessonType>("video");
  const [newLessonDuration, setNewLessonDuration] = useState("15");
  const [newLessonRequired, setNewLessonRequired] = useState(true);

  const filteredCourses = useMemo(() => {
    const q = keyword.trim().toLowerCase();

    if (!q) return courses;

    return courses.filter(
      (course) =>
        course.title.toLowerCase().includes(q) ||
        course.code.toLowerCase().includes(q) ||
        course.category.toLowerCase().includes(q)
    );
  }, [keyword, courses]);

  const stats = useMemo(() => {
    const localCompletion =
      courses.length > 0
        ? Math.round(
            courses.reduce(
              (sum, course) => sum + Number(course.completion || 0),
              0
            ) / courses.length
          )
        : 0;

    return {
      total: Number(courseStats.totalCourses || courses.length || 0),
      activeLearners: Number(courseStats.activeLearners || 0),
      completion: Number(courseStats.completionRate || localCompletion || 0),
      review: Number(
        courseStats.pendingCourses ||
          courses.filter((course) => course.status === "review" || course.status === "draft").length ||
          0
      ),
    };
  }, [courses, courseStats]);

  async function fetchCourseStats() {
    try {
      const response = await fetch(`${BUILDER_API}/course-stats`, {
        method: "GET",
        cache: "no-store",
      });
      const data = await readJsonSafe(response);

      if (!response.ok) {
        console.warn("COURSE STATS API chưa sẵn sàng:", data);
        return;
      }

      setCourseStats({
        totalCourses: Number(data.totalCourses ?? data.data?.totalCourses ?? 0),
        activeLearners: Number(data.activeLearners ?? data.data?.activeLearners ?? 0),
        completionRate: Number(data.completionRate ?? data.data?.completionRate ?? 0),
        pendingCourses: Number(data.pendingCourses ?? data.data?.pendingCourses ?? 0),
      });
    } catch (error) {
      console.warn("Không tải được thống kê khóa học:", error);
    }
  }

  async function fetchLearningTargets() {
    try {
      const response = await fetch(`${BUILDER_API}/learning-targets`, {
        method: "GET",
        cache: "no-store",
      });
      const data = await readJsonSafe(response);

      if (!response.ok) {
        console.warn("LEARNING TARGETS API chưa sẵn sàng:", data);
        setDepartments([]);
        setEmployees([]);
        return;
      }

      const nextDepartments = (data.departments || data.data?.departments || []).map(
        (item: any) => ({
          id: String(item.id),
          name: item.name || item.department_name || item.title || "Phòng ban",
        })
      );

      const nextEmployees = (data.employees || data.data?.employees || []).map(
        (item: any) => ({
          id: String(item.id),
          name: item.full_name || item.name || item.username || item.email || "Nhân viên",
          email: item.email || null,
          department_id: item.department_id || null,
        })
      );

      setDepartments(nextDepartments);
      setEmployees(nextEmployees);
    } catch (error) {
      console.warn("Không tải được phòng ban/nhân viên:", error);
      setDepartments([]);
      setEmployees([]);
    }
  }

  async function fetchCourses() {
    try {
      setLoading(true);

      const response = await fetch(`${BUILDER_API}/courses`, {
        method: "GET",
        cache: "no-store",
      });
      const data = await readJsonSafe(response);

      if (!response.ok) {
        throw new Error(
          data.error || data.message || "Không tải được danh sách khóa học"
        );
      }

      const list = (data.courses || data.data || []).map(normalizeCourse);
      const dbCourses = list.filter((course: Course) => isUUID(course.id));

      setCourses(dbCourses);

      if (dbCourses.length > 0) {
        const firstCourse = dbCourses[0];

        setActiveCourse(firstCourse);
        setCourseStatus(
          firstCourse.status === "active" || firstCourse.status === "published"
            ? "active"
            : "draft"
        );

        await fetchCourseDetail(firstCourse.id, firstCourse);
      } else {
        setActiveCourse(null);
        setSections([]);
        setActiveLesson(null);
      }
    } catch (error: any) {
      console.error("FETCH COURSES ERROR:", error);
      alert(error.message || "Không tải được danh sách khóa học từ BE");
      setCourses([]);
      setActiveCourse(null);
      setSections([]);
      setActiveLesson(null);
    } finally {
      setLoading(false);
    }
  }

  function replaceLessonInSections(updatedLesson: Lesson) {
    setSections((prev) =>
      prev.map((section) => ({
        ...section,
        lessons: section.lessons.map((lesson) =>
          lesson.id === updatedLesson.id ? updatedLesson : lesson
        ),
      }))
    );

    setActiveLesson(updatedLesson);
  }

  async function fetchCourseDetail(courseId: string, courseFallback?: Course) {
    const realCourseId = String(courseId || "").trim();

    if (!isUUID(realCourseId)) {
      console.warn("Bỏ qua fetch detail vì courseId không phải UUID:", {
        courseId: realCourseId,
        courseFallback,
      });
      setSections([]);
      setActiveLesson(null);
      return;
    }

    try {
      const response = await fetch(`${BUILDER_API}/courses/${realCourseId}`, {
        method: "GET",
        cache: "no-store",
      });
      const data = await readJsonSafe(response);

      if (!response.ok) {
        console.error("FETCH COURSE DETAIL RESPONSE ERROR:", data);
        setSections([]);
        setActiveLesson(null);
        return;
      }

      const nextCourse = data.course || data.data?.course || data.data;
      const nextSections = normalizeSections(
        data.sections || data.data?.sections || []
      );

      const normalizedCourse = nextCourse
        ? normalizeCourse(nextCourse)
        : courseFallback;

      if (normalizedCourse) {
        setActiveCourse(normalizedCourse);
        setCourseStatus(
          normalizedCourse.status === "active" ||
            normalizedCourse.status === "published"
            ? "active"
            : "draft"
        );
      }

      setSections(nextSections);

      const firstLesson =
        nextSections.find((section) => section.lessons.length > 0)?.lessons?.[0] ||
        null;

      setActiveLesson(firstLesson);
    } catch (error: any) {
      console.error("FETCH COURSE DETAIL ERROR:", error);
      setSections([]);
      setActiveLesson(null);
    }
  }

  async function handleSelectCourse(course: Course) {
    setActiveCourse(course);
    setCourseStatus(
      course.status === "active" || course.status === "published"
        ? "active"
        : "draft"
    );
    setActiveLesson(null);
    setSections([]);

    if (!isUUID(course.id)) {
      console.warn("Không thể mở chi tiết vì course.id không phải UUID:", course);
      return;
    }

    await fetchCourseDetail(course.id, course);
  }

  async function createNewCourse() {
    if (!newCourseTitle.trim()) {
      alert("Vui lòng nhập tên khóa học.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${BUILDER_API}/courses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newCourseTitle.trim(),
          code: `COURSE-${Date.now().toString().slice(-8)}`,
          category: newCourseCategory,
          level: newCourseLevel,
          owner: "Admin LMS",
          status: "draft",
        }),
      });

      const data = await readJsonSafe(response);

      if (!response.ok) throw new Error(data.error || data.message || "Tạo khóa học lỗi");

      const createdCourse = normalizeCourse(data.course || data.data);
      const createdSections = data.sections?.length > 0 ? normalizeSections(data.sections) : [];

      setCourses((prev) => [createdCourse, ...prev]);
      setActiveCourse(createdCourse);
      setCourseStatus("draft");
      setSections(createdSections);
      setActiveLesson(createdSections.find((section) => section.lessons.length > 0)?.lessons?.[0] || null);

      await fetchCourseDetail(createdCourse.id, createdCourse);

      setShowCreateCourse(false);
      setNewCourseTitle("");
      setNewCourseCategory("Đào tạo nội bộ");
      setNewCourseLevel("Cơ bản");
    } catch (error: any) {
      alert(error.message || "Tạo khóa học thất bại");
    } finally {
      setLoading(false);
    }
  }

  async function addNewSection() {
    if (!activeCourse) return;

    if (!isUUID(activeCourse.id)) {
      alert("Khóa học chưa có ID thật từ database.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${BUILDER_API}/courses/${activeCourse.id}/sections`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `Phần ${sections.length + 1}: Nội dung mới`,
          sort_order: sections.length + 1,
        }),
      });

      const data = await readJsonSafe(res);

      if (!res.ok) {
        console.error("CREATE SECTION ERROR:", data);
        throw new Error(data.error || data.message || "Tạo section thất bại");
      }

      await fetchCourseDetail(activeCourse.id, activeCourse);
    } catch (error: any) {
      alert(error.message || "Tạo section thất bại");
    } finally {
      setLoading(false);
    }
  }

  async function addNewLesson(sectionId: string) {
    if (!activeCourse) return;

    if (!isUUID(sectionId)) {
      alert("Section chưa có ID thật từ DB. Hãy tải lại trang hoặc tạo section mới.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${BUILDER_API}/sections/${sectionId}/lessons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Bài học mới",
          content: "",
          lesson_type: "video",
          duration_minutes: 15,
          is_required: true,
        }),
      });

      const data = await readJsonSafe(response);

      if (!response.ok) {
        console.error("CREATE LESSON ERROR:", data);
        throw new Error(data.error || data.message || "Tạo bài học thất bại");
      }

      const createdLesson = normalizeLesson(data.lesson);
      setActiveLesson(createdLesson);
      await fetchCourseDetail(activeCourse.id, activeCourse);
    } catch (error: any) {
      alert(error.message || "Tạo bài học thất bại");
    } finally {
      setLoading(false);
    }
  }

  async function uploadVideoToLesson() {
    if (!activeLesson || !isUUID(activeLesson.id)) {
      alert("Vui lòng chọn bài học đã được lưu vào DB trước.");
      return;
    }

    if (!videoFile) {
      alert("Vui lòng chọn video.");
      return;
    }

    const formData = new FormData();
    formData.append("video", videoFile);

    try {
      setLoading(true);

      const response = await fetch(
        `${BUILDER_API}/lessons/${activeLesson.id}/video`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await readJsonSafe(response);

      if (!response.ok) {
        console.error("UPLOAD VIDEO ERROR:", data);
        throw new Error(data.error || data.message || "Upload video thất bại");
      }

      const updatedLesson = normalizeLesson(data.lesson || data.data?.lesson || data.data);
      replaceLessonInSections(updatedLesson);

      alert("Upload video thành công");
      setVideoFile(null);

      if (activeCourse?.id && isUUID(activeCourse.id)) {
        await fetchCourseDetail(activeCourse.id, activeCourse);
      }
    } catch (error: any) {
      alert(error.message || "Upload video thất bại");
    } finally {
      setLoading(false);
    }
  }

  async function createQuizForLesson() {
    if (!activeLesson || !isUUID(activeLesson.id)) {
      return alert("Vui lòng chọn bài học đã được lưu vào DB trước.");
    }
    if (!quizTitle.trim()) return alert("Vui lòng nhập tên quiz.");
    if (!quizPassScore.trim()) return alert("Vui lòng nhập điểm đạt.");
    if (!quizQuestionCount.trim()) return alert("Vui lòng nhập số câu hỏi.");

    try {
      setLoading(true);

      const response = await fetch(
        `${BUILDER_API}/lessons/${activeLesson.id}/quiz`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: quizTitle.trim(),
            pass_score: Number(quizPassScore) || 70,
            question_count: Number(quizQuestionCount) || 0,
            max_attempts: 1,
          }),
        }
      );

      const data = await readJsonSafe(response);

      if (!response.ok) {
        console.error("CREATE QUIZ ERROR:", data);
        throw new Error(data.error || data.message || "Tạo quiz thất bại");
      }

      const updatedLesson = normalizeLesson(data.lesson || data.data?.lesson || data.data);
      replaceLessonInSections(updatedLesson);

      alert("Đã gắn quiz vào bài học");
      setQuizTitle("");
      setQuizPassScore("");
      setQuizQuestionCount("");

      if (activeCourse?.id && isUUID(activeCourse.id)) {
        await fetchCourseDetail(activeCourse.id, activeCourse);
      }
    } catch (error: any) {
      alert(error.message || "Tạo quiz thất bại");
    } finally {
      setLoading(false);
    }
  }

  async function uploadAssignmentForLesson() {
    if (!activeLesson || !isUUID(activeLesson.id)) {
      return alert("Vui lòng chọn bài học đã được lưu vào DB trước.");
    }
    if (!assignmentTitle.trim() && !assignmentFile) {
      return alert("Vui lòng nhập tên bài tập hoặc chọn file.");
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("title", assignmentTitle);

      if (assignmentFile) {
        formData.append("file", assignmentFile);
      }

      const res = await fetch(`${BUILDER_API}/lessons/${activeLesson.id}/assignment`, {
        method: "POST",
        body: formData,
      });

      const data = await readJsonSafe(res);

      if (!res.ok) {
        console.error("UPLOAD ASSIGNMENT ERROR:", data);
        throw new Error(data.error || data.message || "Upload bài tập thất bại");
      }

      const updatedLesson = normalizeLesson(data.lesson || data.data?.lesson || data.data);
      replaceLessonInSections(updatedLesson);

      alert("Đã lưu bài tập vào DB");
      setAssignmentTitle("");
      setAssignmentFile(null);

      if (activeCourse?.id && isUUID(activeCourse.id)) {
        await fetchCourseDetail(activeCourse.id, activeCourse);
      }
    } catch (error: any) {
      alert(error.message || "Upload bài tập thất bại");
    } finally {
      setLoading(false);
    }
  }

  async function attachLibraryResourceToLesson() {
    if (!activeLesson || !isUUID(activeLesson.id)) {
      return alert("Vui lòng chọn bài học đã được lưu vào DB trước.");
    }
    if (!selectedLibraryId) return alert("Vui lòng chọn kho dữ liệu.");

    const selected = libraryOptions.find((item) => item.id === selectedLibraryId);
    if (!selected) return;

    try {
      setLoading(true);

      const res = await fetch(`${BUILDER_API}/lessons/${activeLesson.id}/library-resource`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          library_resource_id: selected.id,
          content_url: selected.url,
          file_type: selected.type,
          file_name: selected.label,
        }),
      });

      const data = await readJsonSafe(res);

      if (!res.ok) {
        console.error("ATTACH RESOURCE ERROR:", data);
        throw new Error(data.error || data.message || "Gắn tài nguyên thất bại");
      }

      const updatedLesson = normalizeLesson(data.lesson || data.data?.lesson || data.data);
      replaceLessonInSections(updatedLesson);

      alert("Đã gắn tài nguyên vào DB");
      setSelectedLibraryId("");

      if (activeCourse?.id && isUUID(activeCourse.id)) {
        await fetchCourseDetail(activeCourse.id, activeCourse);
      }
    } catch (error: any) {
      alert(error.message || "Gắn tài nguyên thất bại");
    } finally {
      setLoading(false);
    }
  }

  async function saveLessonInfo() {
    if (!editingLesson || !isUUID(editingLesson.id)) {
      alert("Bài học chưa có ID thật từ DB.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${BUILDER_API}/lessons/${editingLesson.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editLessonTitle.trim(),
          content: editLessonDescription ?? "",
          lesson_type: editingLesson.lesson_type || editingLesson.type || "video",
          duration_minutes: editingLesson.duration_minutes || 15,
          is_required: editingLesson.is_required ?? true,
        }),
      });

      const data = await readJsonSafe(response);

      if (!response.ok) {
        console.error("UPDATE LESSON ERROR:", data);
        throw new Error(data.error || data.message || "Cập nhật bài học thất bại");
      }

      const updatedLesson = normalizeLesson(data.lesson || data.data?.lesson || data.data);
      replaceLessonInSections(updatedLesson);

      alert("Đã cập nhật bài học");
      setEditingLesson(null);

      if (activeCourse?.id && isUUID(activeCourse.id)) {
        await fetchCourseDetail(activeCourse.id, activeCourse);
      }
    } catch (error: any) {
      alert(error.message || "Cập nhật bài học thất bại");
    } finally {
      setLoading(false);
    }
  }

  async function saveCourseConfig() {
    if (!activeCourse) return;

    if (!isUUID(activeCourse.id)) {
      alert("Khóa học chưa có ID thật từ database.");
      return;
    }

    try {
      setLoading(true);

      const nextStatus = courseStatus === "active" ? "published" : "draft";

      const response = await fetch(`${BUILDER_API}/courses/${activeCourse.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: nextStatus,
          learning_target_type: learningTargetType,
          department_id: learningTargetType === "department" ? selectedDepartmentId : null,
          employee_id: learningTargetType === "employee" ? selectedEmployeeId : null,
        }),
      });

      const data = await readJsonSafe(response);

      if (!response.ok) {
        console.error("UPDATE COURSE ERROR:", data);
        throw new Error(data.error || data.message || "Cập nhật trạng thái thất bại");
      }

      alert("Đã lưu cấu hình khóa học");

      const updatedCourse = normalizeCourse(data.course);

      setActiveCourse(updatedCourse);

      setCourses((prev) =>
        prev.map((item) => (item.id === updatedCourse.id ? updatedCourse : item))
      );
    } catch (error: any) {
      alert(error.message || "Cập nhật trạng thái thất bại");
    } finally {
      setLoading(false);
    }
  }

  async function renameSection(section: Section) {
    if (!isUUID(section.id)) {
      alert("Section chưa có ID thật từ DB.");
      return;
    }

    const title = window.prompt("Nhập tên phần học mới:", section.title);
    if (!title || title.trim() === section.title) return;

    try {
      setLoading(true);

      const response = await fetch(`${BUILDER_API}/sections/${section.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim() }),
      });

      const data = await readJsonSafe(response);

      if (!response.ok) {
        throw new Error(data.error || data.message || "Sửa tên phần học thất bại");
      }

      setSections((prev) =>
        prev.map((item) =>
          item.id === section.id
            ? { ...item, title: data.section?.title || title.trim() }
            : item
        )
      );
    } catch (error: any) {
      alert(error.message || "Sửa tên phần học thất bại");
    } finally {
      setLoading(false);
    }
  }

  async function deleteSection(section: Section) {
    if (!isUUID(section.id)) {
      alert("Section chưa có ID thật từ DB.");
      return;
    }

    const ok = window.confirm(
      `Xóa phần học "${section.title}"? Các bài học bên trong cũng sẽ bị xóa.`
    );
    if (!ok) return;

    try {
      setLoading(true);

      const response = await fetch(`${BUILDER_API}/sections/${section.id}`, {
        method: "DELETE",
      });

      const data = await readJsonSafe(response);

      if (!response.ok) {
        throw new Error(data.error || data.message || "Xóa phần học thất bại");
      }

      setSections((prev) => prev.filter((item) => item.id !== section.id));

      if (activeLesson && section.lessons.some((lesson) => lesson.id === activeLesson.id)) {
        setActiveLesson(null);
      }

      if (activeCourse?.id && isUUID(activeCourse.id)) {
        await fetchCourseDetail(activeCourse.id, activeCourse);
      }
    } catch (error: any) {
      alert(error.message || "Xóa phần học thất bại");
    } finally {
      setLoading(false);
    }
  }

  async function deleteLesson(lesson: Lesson) {
    if (!isUUID(lesson.id)) {
      alert("Bài học chưa có ID thật từ DB.");
      return;
    }

    const ok = window.confirm(`Xóa bài học "${lesson.title}"?`);
    if (!ok) return;

    try {
      setLoading(true);

      const response = await fetch(`${BUILDER_API}/lessons/${lesson.id}`, {
        method: "DELETE",
      });

      const data = await readJsonSafe(response);

      if (!response.ok) {
        throw new Error(data.error || data.message || "Xóa bài học thất bại");
      }

      setSections((prev) =>
        prev.map((section) => ({
          ...section,
          lessons: section.lessons.filter((item) => item.id !== lesson.id),
        }))
      );

      if (activeLesson?.id === lesson.id) {
        setActiveLesson(null);
      }

      if (activeCourse?.id && isUUID(activeCourse.id)) {
        await fetchCourseDetail(activeCourse.id, activeCourse);
      }
    } catch (error: any) {
      alert(error.message || "Xóa bài học thất bại");
    } finally {
      setLoading(false);
    }
  }

  async function openEditLesson(lesson: Lesson) {
    if (!isUUID(lesson.id)) {
      alert("Bài học chưa có ID thật từ DB.");
      return;
    }

    const nextTitle = window.prompt("Nhập tên bài học mới:", lesson.title || "");
    if (nextTitle === null) return;

    const cleanTitle = nextTitle.trim();
    if (!cleanTitle) {
      alert("Tên bài học không được để trống.");
      return;
    }

    const nextDescription = window.prompt(
      "Nhập mô tả bài học:",
      lesson.content || lesson.description || ""
    );
    if (nextDescription === null) return;

    try {
      setLoading(true);

      const response = await fetch(`${BUILDER_API}/lessons/${lesson.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: cleanTitle,
          content: nextDescription.trim(),
          lesson_type: lesson.lesson_type || lesson.type || "video",
          duration_minutes: lesson.duration_minutes || 15,
          is_required: lesson.is_required ?? lesson.required ?? true,
          video_url: lesson.video_url || null,
        }),
      });

      const data = await readJsonSafe(response);

      if (!response.ok) {
        console.error("UPDATE LESSON ERROR:", data);
        throw new Error(data.error || data.message || "Cập nhật bài học thất bại");
      }

      const updatedLesson = normalizeLesson(data.lesson || data.data?.lesson || data.data);
      replaceLessonInSections(updatedLesson);

      if (activeCourse?.id && isUUID(activeCourse.id)) {
        await fetchCourseDetail(activeCourse.id, activeCourse);
      }

      alert("Đã cập nhật bài học");
    } catch (error: any) {
      alert(error.message || "Cập nhật bài học thất bại");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCourses();
    fetchLearningTargets();
    fetchCourseStats();
  }, []);

  return (
    <AppShell workspace="lms-admin" title="Quản lý khóa học">
      <div style={{ minHeight: "100vh", background: "#f8fafc", padding: "18px 18px 40px" }}>
        <div style={{ width: "100%", maxWidth: "1420px", margin: "0 auto" }}>
          <section className="mb-5 flex justify-end gap-3">
            <button className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 shadow-sm">
              <Save size={16} />
              Lưu nháp
            </button>

            <button
              onClick={() => setShowCreateCourse(true)}
              className="flex h-11 items-center gap-2 rounded-xl bg-orange-500 px-5 text-sm font-bold text-white shadow-sm"
            >
              <Plus size={16} />
              Tạo khóa học mới
            </button>
          </section>

          {showCreateCourse && (
            <section className="mb-5 rounded-2xl border border-orange-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-black text-slate-950">Tạo khóa học mới</h2>
                <button onClick={() => setShowCreateCourse(false)}>
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <input
                  value={newCourseTitle ?? ""}
                  onChange={(event) => setNewCourseTitle(event.target.value)}
                  placeholder="Tên khóa học"
                  className="rounded-xl border border-slate-200 px-3 py-3 text-sm"
                />

                <select
                  value={newCourseCategory ?? ""}
                  onChange={(event) => setNewCourseCategory(event.target.value)}
                  className="rounded-xl border border-slate-200 px-3 py-3 text-sm"
                >
                  <option>Đào tạo nội bộ</option>
                  <option>CM Training</option>
                  <option>Soft Skills</option>
                  <option>Sales Training</option>
                </select>

                <select
                  value={newCourseLevel ?? ""}
                  onChange={(event) => setNewCourseLevel(event.target.value)}
                  className="rounded-xl border border-slate-200 px-3 py-3 text-sm"
                >
                  <option>Cơ bản</option>
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>

              <button
                onClick={createNewCourse}
                disabled={loading}
                className="mt-4 w-full rounded-xl bg-orange-500 px-4 py-3 text-sm font-black text-white disabled:opacity-60"
              >
                Tạo khóa học
              </button>
            </section>
          )}

          <section
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
              gap: 20,
              width: "100%",
              marginBottom: 20,
            }}
          >
            <StatCard icon={BookOpen} value={String(stats.total)} label="Tổng khóa học" note="+3 tháng này" />
            <StatCard icon={GraduationCap} value={stats.activeLearners.toLocaleString("vi-VN")} label="Nhân viên đang học" note="Active" />
            <StatCard icon={CheckCircle2} value={`${stats.completion}%`} label="Tỷ lệ hoàn thành" note="TB hệ thống" />
            <StatCard icon={AlertCircle} value={String(stats.review)} label="Khóa chờ duyệt" note="Cần xử lý" />
          </section>

          <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={keyword ?? ""}
                  onChange={(event) => setKeyword(event.target.value)}
                  placeholder="Tìm khóa học..."
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none"
                />
              </div>

              <button className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700">
                <Filter size={19} />
              </button>
            </div>
          </section>

          <section
            style={{
              display: "grid",
              gridTemplateColumns: "320px minmax(560px, 1fr) 360px",
              gap: 20,
              alignItems: "start",
              width: "100%",
            }}
          >
            <aside className="space-y-4">
              {filteredCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  active={activeCourse?.id === course.id}
                  onClick={() => handleSelectCourse(course)}
                />
              ))}
            </aside>

            <main className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Đang chỉnh sửa
                    </p>

                    <h2 className="mt-2 text-[22px] font-black leading-tight text-slate-950">
                      {activeCourse?.title || "Chưa chọn khóa học"}
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                      {activeCourse?.code} • {activeCourse?.level} • {activeCourse?.owner}
                    </p>
                  </div>

                  <span className="rounded-full bg-orange-50 px-4 py-2 text-xs font-bold text-orange-600">
                    {statusLabel(activeCourse?.status || "draft")}
                  </span>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-4">
                  <BuilderType active icon={Video} label="Video" />
                  <BuilderType icon={FileText} label="Tài liệu" />
                  <BuilderType icon={ClipboardCheck} label="Quiz" />
                </div>
              </div>

              <div className="border-t border-slate-100 p-6">
                <div className="space-y-7">
                  {sections.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-orange-200 bg-orange-50/30 p-6 text-center">
                      <p className="text-sm font-bold text-slate-700">Khóa học này chưa có section.</p>
                      <p className="mt-1 text-xs text-slate-500">Bấm “+ Thêm section mới” để tạo section trong DB trước, sau đó tạo bài học.</p>
                    </div>
                  )}

                  {sections.map((section) => (
                    <div key={section.id}>
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate text-base font-black text-slate-950">
                            {section.title}
                          </h3>
                          <p className="mt-1 text-xs text-slate-400">
                            Section ID: {section.id.slice(0, 8)}
                          </p>
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                          <button
                            type="button"
                            onClick={() => renameSection(section)}
                            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                          >
                            Sửa phần
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteSection(section)}
                            className="rounded-lg border border-red-100 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50"
                          >
                            Xóa phần
                          </button>

                          <button
                            onClick={() => addNewLesson(section.id)}
                            className="rounded-lg bg-orange-50 px-3 py-2 text-xs font-bold text-orange-600 hover:bg-orange-100"
                          >
                            + Thêm bài
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {section.lessons.map((lesson) => (
                          <LessonRow
                            key={lesson.id}
                            lesson={lesson}
                            active={activeLesson?.id === lesson.id}
                            onClick={() => setActiveLesson(lesson)}
                            onEdit={() => openEditLesson(lesson)}
                            onDelete={() => deleteLesson(lesson)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={addNewSection}
                  className="mt-7 flex h-14 w-full items-center justify-center rounded-xl border border-dashed border-orange-300 bg-orange-50/20 text-sm font-bold text-orange-600"
                >
                  + Thêm section mới
                </button>
              </div>
            </main>

            <aside className="space-y-5">
              <LessonContentPanel
                activeLesson={activeLesson}
                videoFile={videoFile}
                setVideoFile={setVideoFile}
                uploadVideoToLesson={uploadVideoToLesson}
                quizTitle={quizTitle}
                setQuizTitle={setQuizTitle}
                quizPassScore={quizPassScore}
                setQuizPassScore={setQuizPassScore}
                quizQuestionCount={quizQuestionCount}
                setQuizQuestionCount={setQuizQuestionCount}
                createQuizForLesson={createQuizForLesson}
                assignmentTitle={assignmentTitle}
                setAssignmentTitle={setAssignmentTitle}
                assignmentFile={assignmentFile}
                setAssignmentFile={setAssignmentFile}
                uploadAssignmentForLesson={uploadAssignmentForLesson}
                selectedLibraryId={selectedLibraryId}
                setSelectedLibraryId={setSelectedLibraryId}
                attachLibraryResourceToLesson={attachLibraryResourceToLesson}
                loading={loading}
              />

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-black text-slate-950">Cấu hình khóa học</h2>

                <div className="mt-5 space-y-5">
                  <div>
                    <label className="text-sm font-bold text-slate-600">Trạng thái</label>

                    <select
                      value={courseStatus ?? "draft"}
                      onChange={(event) =>
                        setCourseStatus(event.target.value as "draft" | "active")
                      }
                      className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none"
                    >
                      <option value="draft">Nháp</option>
                      <option value="active">Đang hoạt động</option>
                    </select>
                  </div>

                  <LearningTargetSelect
                    learningTargetType={learningTargetType}
                    setLearningTargetType={setLearningTargetType}
                    selectedDepartmentId={selectedDepartmentId}
                    setSelectedDepartmentId={setSelectedDepartmentId}
                    selectedEmployeeId={selectedEmployeeId}
                    setSelectedEmployeeId={setSelectedEmployeeId}
                    departments={departments}
                    employees={employees}
                  />

                  <div>
                    <label className="text-sm font-bold text-slate-600">
                      Điều kiện hoàn thành
                    </label>

                    <div className="mt-3 space-y-3">
                      <Requirement text="Xem 80% video" />
                      <Requirement text="Quiz đạt 70%" />
                    </div>
                  </div>

                  <button
                    onClick={saveCourseConfig}
                    disabled={loading}
                    className="w-full rounded-xl bg-orange-500 px-4 py-3 text-sm font-black text-white disabled:opacity-60"
                  >
                    Lưu cấu hình khóa học
                  </button>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-black text-slate-950">Publish</h2>

                <div className="mt-5 space-y-3 text-sm text-slate-600">
                  <PublishLine icon={Lock} text="Mở khóa tuần tự theo bài học" />
                  <PublishLine icon={Clock} text="Có thể lên lịch publish" />
                  <PublishLine icon={Eye} text="Preview trước khi công khai" />
                </div>

                <button
                  onClick={() => {
                    setCourseStatus("active");
                    saveCourseConfig();
                  }}
                  className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 text-sm font-black text-white"
                >
                  <Rocket size={17} />
                  Publish khóa học
                </button>
              </section>
            </aside>
          </section>
        </div>

        {editingLesson && (
          <LessonEditModal
            lesson={editingLesson}
            editLessonTitle={editLessonTitle}
            setEditLessonTitle={setEditLessonTitle}
            editLessonDescription={editLessonDescription}
            setEditLessonDescription={setEditLessonDescription}
            onClose={() => setEditingLesson(null)}
            onSave={saveLessonInfo}
            loading={loading}
          />
        )}
      </div>
    </AppShell>
  );
}

function StatCard({ icon: Icon, value, label, note }: any) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
          <Icon size={22} />
        </div>
        <span className="text-xs text-slate-400">{note}</span>
      </div>

      <p className="mt-7 text-3xl font-black text-slate-950">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{label}</p>
    </div>
  );
}

function CourseCard({ course, active, onClick }: any) {
  const title = course.title || "Khóa học chưa đặt tên";
  const code = course.code || `COURSE-${String(course.id).slice(0, 8)}`;
  const category = course.category || "Đào tạo nội bộ";
  const lessons = Number(course.lessons || 0);
  const completion = Number(course.completion || 0);

  return (
    <button
      onClick={onClick}
      className={`w-full rounded-2xl border bg-white p-3 text-left shadow-sm transition hover:shadow-md ${
        active ? "border-orange-400 ring-2 ring-orange-100" : "border-slate-200"
      }`}
    >
      <div
        className="min-h-[150px] rounded-xl p-4 text-white"
        style={getCourseHeaderStyle(course)}
      >
        <div className="flex items-start justify-between gap-3">
          <BookOpen size={21} className="shrink-0" />

          <span className="rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold">
            {statusLabel(course.status)}
          </span>
        </div>

        <h3 className="mt-8 line-clamp-2 min-h-[40px] text-base font-black leading-5">
          {title}
        </h3>

        <p className="mt-2 line-clamp-2 text-xs text-white/90">{code}</p>
      </div>

      <div className="mt-4 space-y-3 text-xs">
        <div className="flex justify-between gap-3">
          <span className="text-slate-500">Danh mục</span>
          <span className="font-black text-slate-950">{category}</span>
        </div>

        <div className="flex justify-between gap-3">
          <span className="text-slate-500">Bài học</span>
          <span className="font-black text-slate-950">{lessons}</span>
        </div>

        <div>
          <div className="mb-1 flex justify-between">
            <span className="text-slate-500">Hoàn thành</span>
            <span className="text-slate-500">{completion}%</span>
          </div>

          <div className="h-2 rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-orange-500"
              style={{ width: `${completion}%` }}
            />
          </div>
        </div>
      </div>
    </button>
  );
}

function BuilderType({ icon: Icon, label, active }: any) {
  return (
    <button
      className={`flex h-16 flex-col items-center justify-center rounded-xl text-sm font-black ${
        active ? "bg-orange-50 text-orange-600" : "bg-slate-50 text-slate-700"
      }`}
    >
      <Icon size={20} />
      <span className="mt-1">{label}</span>
    </button>
  );
}

function LessonRow({ lesson, active, onClick, onEdit, onDelete }: any) {
  const Icon = lessonIcon(lesson.type || lesson.lesson_type || "video");
  const videoUrl = buildFileUrl(lesson.video_url);
  const materialUrl = buildFileUrl(lesson.material_url || lesson.assignment_url);

  return (
    <div
      onClick={onClick}
      className={`w-full cursor-pointer rounded-xl border p-3 text-left transition ${
        active ? "border-orange-400 bg-orange-50" : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex items-center gap-3">
        <GripVertical size={16} className="text-slate-300" />

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          <Icon size={18} />
        </div>

        <div className="min-w-0 flex-1">
          <h4 className="truncate text-sm font-black text-slate-950">
            {lesson.title}
          </h4>

          <p className="mt-1 flex items-center gap-2 text-xs text-slate-500">
            <Clock size={13} />
            {lesson.time}
            <span className="rounded-full bg-slate-100 px-2 py-0.5 font-bold">
              {lesson.lesson_type || lesson.type}
            </span>
          </p>
        </div>

        <span className="shrink-0 rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600">
          {lesson.required ? "Bắt buộc" : "Tùy chọn"}
        </span>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onEdit();
          }}
          className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
        >
          Sửa
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete();
          }}
          className="rounded-lg border border-red-100 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50"
        >
          Xóa
        </button>
      </div>

      {(lesson.video_url || lesson.quiz_id || materialUrl) && (
        <div className="mt-3 grid gap-2 rounded-xl bg-slate-50 p-3 text-xs">
          {lesson.video_url && (
            <div className="text-orange-700">
              <span className="font-black">Video:</span>{" "}
              <a
                href={videoUrl}
                target="_blank"
                rel="noreferrer"
                className="break-all underline"
                onClick={(e) => e.stopPropagation()}
              >
                {lesson.video_url}
              </a>
            </div>
          )}

          {lesson.quiz_id && (
            <div className="text-blue-700">
              <span className="font-black">Quiz:</span>{" "}
              {lesson.quiz_title || "Quiz bài học"} | Điểm đạt:{" "}
              {lesson.quiz_pass_score || 70}%
            </div>
          )}

          {materialUrl && (
            <div className="text-slate-600">
              <span className="font-black">Tài liệu:</span>{" "}
              <a
                href={materialUrl}
                target="_blank"
                rel="noreferrer"
                className="break-all underline"
                onClick={(e) => e.stopPropagation()}
              >
                {lesson.material_url || lesson.assignment_url}
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function LessonContentPanel(props: any) {
  const {
    activeLesson,
    videoFile,
    setVideoFile,
    uploadVideoToLesson,
    quizTitle,
    setQuizTitle,
    quizPassScore,
    setQuizPassScore,
    quizQuestionCount,
    setQuizQuestionCount,
    createQuizForLesson,
    assignmentTitle,
    setAssignmentTitle,
    assignmentFile,
    setAssignmentFile,
    uploadAssignmentForLesson,
    selectedLibraryId,
    setSelectedLibraryId,
    attachLibraryResourceToLesson,
    loading,
  } = props;

  const videoUrl = buildFileUrl(activeLesson?.video_url);
  const materialUrl = buildFileUrl(activeLesson?.material_url || activeLesson?.assignment_url);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-black text-slate-950">Nội dung bài học</h2>

      {activeLesson ? (
        <div className="mt-4 space-y-5">
          <div className="rounded-xl bg-orange-50 p-3">
            <p className="text-xs font-bold text-orange-500">Đang chọn bài học</p>
            <p className="mt-1 text-sm font-black text-slate-900">
              {activeLesson.title}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Loại hiện tại: <b>{activeLesson.lesson_type || activeLesson.type}</b>
            </p>
          </div>

          {(activeLesson.video_url || activeLesson.quiz_id || materialUrl) && (
            <div className="space-y-3 rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs">
              <p className="text-sm font-black text-slate-800">Nội dung đã lưu</p>

          {activeLesson.video_url && (
            <div className="rounded-xl bg-white p-3">
              <p className="mb-2 text-xs font-bold text-orange-600">
                Video đã upload
              </p>

              <video
                controls
                className="w-full rounded-xl"
                src={activeLesson.video_url}
              />
            </div>
          )}

              {activeLesson.quiz_id && (
                <div className="rounded-lg bg-white p-3 text-blue-700">
                  <p className="font-black">Quiz đã gắn</p>
                  <p className="mt-1">
                    {activeLesson.quiz_title || "Quiz bài học"} | Điểm đạt:{" "}
                    {activeLesson.quiz_pass_score || 70}%
                  </p>
                </div>
              )}

              {materialUrl && (
                <div className="rounded-lg bg-white p-3 text-slate-700">
                  <p className="font-black">Tài liệu đã gắn</p>
                  <a
                    href={materialUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 block break-all underline"
                  >
                    {activeLesson.material_url || activeLesson.assignment_url}
                  </a>
                </div>
              )}
            </div>
          )}

          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-600">Upload video</label>

            <input
              type="file"
              accept="video/*"
              onChange={(event) => setVideoFile(event.target.files?.[0] || null)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            />

            {videoFile && (
              <p className="text-xs text-slate-500">Đã chọn: {videoFile.name}</p>
            )}

            <button
              onClick={uploadVideoToLesson}
              disabled={loading}
              className="w-full rounded-xl bg-orange-500 px-4 py-3 text-sm font-black text-white disabled:opacity-60"
            >
              <UploadCloud size={15} className="mr-1 inline-block" />
              Upload video
            </button>
          </div>

          <div className="space-y-3 border-t border-slate-100 pt-4">
            <label className="text-sm font-bold text-slate-600">Gắn quiz</label>

            <input
              value={quizTitle ?? ""}
              onChange={(event) => setQuizTitle(event.target.value)}
              placeholder="Tên quiz"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />

            <input
              value={quizPassScore ?? ""}
              onChange={(event) => setQuizPassScore(event.target.value)}
              type="number"
              placeholder="Điểm đạt (%)"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />

            <input
              value={quizQuestionCount ?? ""}
              onChange={(event) => setQuizQuestionCount(event.target.value)}
              type="number"
              placeholder="Số câu hỏi quiz"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />

            <button
              onClick={createQuizForLesson}
              disabled={loading}
              className="w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white disabled:opacity-60"
            >
              Tạo / cập nhật quiz
            </button>
          </div>

          <div className="space-y-3 border-t border-slate-100 pt-4">
            <label className="text-sm font-bold text-slate-600">
              Bài tập / tài liệu tải lên
            </label>

            <input
              value={assignmentTitle ?? ""}
              onChange={(event) => setAssignmentTitle(event.target.value)}
              placeholder="Tên bài tập"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />

            <input
              type="file"
              onChange={(event) =>
                setAssignmentFile(event.target.files?.[0] || null)
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            />

            {assignmentFile && (
              <p className="text-xs text-slate-500">
                Đã chọn: {assignmentFile.name}
              </p>
            )}

            <button
              onClick={uploadAssignmentForLesson}
              disabled={loading}
              className="w-full rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-black text-orange-600 disabled:opacity-60"
            >
              Upload bài tập
            </button>
          </div>

          <div className="space-y-3 border-t border-slate-100 pt-4">
            <label className="text-sm font-bold text-slate-600">Lấy từ kho dữ liệu</label>

            <select
              value={selectedLibraryId ?? ""}
              onChange={(event) => setSelectedLibraryId(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              <option value="">Chọn kho dữ liệu</option>
              {libraryOptions.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>

            <button
              onClick={attachLibraryResourceToLesson}
              disabled={loading}
              className="w-full rounded-xl bg-orange-500 px-4 py-3 text-sm font-black text-white disabled:opacity-60"
            >
              Gắn tài nguyên
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
          Chọn một bài học để thêm video, quiz hoặc tài liệu.
        </div>
      )}
    </section>
  );
}

function CreateLessonModal(props: any) {
  const {
    title,
    setTitle,
    type,
    setType,
    duration,
    setDuration,
    required,
    setRequired,
    onClose,
    onSave,
    loading,
  } = props;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-[540px] rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-950">Tạo bài học mới</h2>
          <button onClick={onClose}>
            <X size={22} />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label className="text-sm font-bold text-slate-600">Tên bài học</label>
            <input
              value={title ?? ""}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Ví dụ: Video giới thiệu quy trình CRM"
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-orange-400"
            />
          </div>

          <div>
            <label className="text-sm font-bold text-slate-600">Loại bài học</label>
            <select
              value={type ?? "video"}
              onChange={(event) => setType(event.target.value as LessonType)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-orange-400"
            >
              <option value="video">Video</option>
              <option value="document">Tài liệu</option>
              <option value="quiz">Quiz</option>
              <option value="assignment">Bài tập</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-bold text-slate-600">Thời lượng/phút</label>
            <input
              value={duration ?? ""}
              onChange={(event) => setDuration(event.target.value)}
              type="number"
              placeholder="15"
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-orange-400"
            />
          </div>

          <label className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 text-sm font-bold text-slate-700">
            <input
              type="checkbox"
              checked={required}
              onChange={(event) => setRequired(event.target.checked)}
            />
            Bài học bắt buộc
          </label>

          <button
            onClick={onSave}
            disabled={loading}
            className="w-full rounded-xl bg-orange-500 px-4 py-3 text-sm font-black text-white disabled:opacity-60"
          >
            Lưu bài học vào DB
          </button>
        </div>
      </div>
    </div>
  );
}

function LessonEditModal(props: any) {
  const {
    lesson,
    editLessonTitle,
    setEditLessonTitle,
    editLessonDescription,
    setEditLessonDescription,
    onClose,
    onSave,
    loading,
  } = props;

  const type = lesson.type || lesson.lesson_type;
  const fileUrl = buildFileUrl(lesson.video_url || lesson.content_url || lesson.material_url || lesson.assignment_url);

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-[640px] rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-950">Chỉnh sửa bài học</h2>

          <button onClick={onClose}>
            <X size={22} />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label className="text-sm font-bold text-slate-600">Tên bài học</label>
            <input
              value={editLessonTitle ?? ""}
              onChange={(event) => setEditLessonTitle(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm"
            />
          </div>

          <div>
            <label className="text-sm font-bold text-slate-600">Nội dung mô tả</label>
            <textarea
              value={editLessonDescription ?? ""}
              onChange={(event) => setEditLessonDescription(event.target.value)}
              rows={4}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm"
            />
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <p className="mb-2 text-sm font-bold text-slate-700">Tài nguyên hiện tại</p>

            {fileUrl && type === "video" ? (
              <video src={fileUrl} controls className="w-full rounded-xl" />
            ) : fileUrl ? (
              <a
                href={fileUrl}
                target="_blank"
                className="text-sm font-bold text-orange-600"
              >
                Mở tài liệu / tài nguyên
              </a>
            ) : (
              <p className="text-sm text-slate-500">
                Bài học này chưa có tài nguyên được gắn.
              </p>
            )}
          </div>

          <button
            onClick={onSave}
            disabled={loading}
            className="w-full rounded-xl bg-orange-500 px-4 py-3 text-sm font-black text-white disabled:opacity-60"
          >
            Lưu thông tin bài học
          </button>
        </div>
      </div>
    </div>
  );
}

function LearningTargetSelect(props: any) {
  const {
    learningTargetType,
    setLearningTargetType,
    selectedDepartmentId,
    setSelectedDepartmentId,
    selectedEmployeeId,
    setSelectedEmployeeId,
    departments,
    employees,
  } = props;

  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm font-bold text-slate-600">Đối tượng học</label>

        <select
          value={learningTargetType ?? "all"}
          onChange={(event) => {
            setLearningTargetType(event.target.value as LearningTargetType);
            setSelectedDepartmentId("");
            setSelectedEmployeeId("");
          }}
          className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none"
        >
          <option value="all">Toàn bộ nhân sự</option>
          <option value="department">Theo phòng ban</option>
          <option value="employee">Theo nhân viên</option>
        </select>
      </div>

      {learningTargetType === "department" && (
        <div>
          <label className="text-xs font-bold text-slate-500">Chọn phòng ban</label>
          <select
            value={selectedDepartmentId ?? ""}
            onChange={(event) => setSelectedDepartmentId(event.target.value)}
            className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none"
          >
            <option value="">Chọn phòng ban từ DB</option>
            {departments.map((department: LearningTarget) => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
          </select>
          {departments.length === 0 && (
            <p className="mt-2 text-xs text-orange-600">
              Chưa có dữ liệu phòng ban. Kiểm tra API GET /learning-targets ở BE.
            </p>
          )}
        </div>
      )}

      {learningTargetType === "employee" && (
        <div>
          <label className="text-xs font-bold text-slate-500">Chọn nhân viên</label>
          <select
            value={selectedEmployeeId ?? ""}
            onChange={(event) => setSelectedEmployeeId(event.target.value)}
            className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none"
          >
            <option value="">Chọn nhân viên từ DB</option>
            {employees.map((employee: LearningTarget) => (
              <option key={employee.id} value={employee.id}>
                {employee.name}{employee.email ? ` - ${employee.email}` : ""}
              </option>
            ))}
          </select>
          {employees.length === 0 && (
            <p className="mt-2 text-xs text-orange-600">
              Chưa có dữ liệu nhân viên. Kiểm tra API GET /learning-targets ở BE.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function Requirement({ text }: any) {
  return (
    <div className="flex h-11 items-center justify-between rounded-xl bg-slate-50 px-3 text-sm text-slate-950">
      <span>{text}</span>
      <CheckCircle2 size={17} className="text-orange-500" />
    </div>
  );
}

function PublishLine({ icon: Icon, text }: any) {
  return (
    <div className="flex items-center gap-3">
      <Icon size={16} className="text-slate-500" />
      <span>{text}</span>
    </div>
  );
}