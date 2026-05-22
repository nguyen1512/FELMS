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
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const BUILDER_API = `${API_URL}/builder`;

type Status = "active" | "draft" | "review" | "published";
type LessonType = "video" | "document" | "quiz" | "file" | "assignment" | "resource";

type Course = {
  id: string;
  title: string;
  code: string;
  category: string;
  lessons: number;
  completion: number;
  status: Status;
  gradient?: string;
  level: string;
  owner: string;
};

type Lesson = {
  id: string;
  title: string;
  type: LessonType;
  lesson_type?: LessonType;
  time: string;
  required: boolean;
  content_url?: string | null;
  quiz_id?: string | null;
};

type Section = {
  id: string;
  title: string;
  lessons: Lesson[];
};

const fallbackCourses: Course[] = [
  {
    id: "1",
    title: "Onboarding nhân sự mới",
    code: "ANU-ONB-01",
    category: "Đào tạo nội bộ",
    lessons: 16,
    completion: 74,
    status: "active",
    gradient: "from-orange-500 to-amber-400",
    level: "Beginner",
    owner: "HR Team",
  },
  {
    id: "2",
    title: "Quy trình vận hành CRM",
    code: "CRM-CM-02",
    category: "CM Training",
    lessons: 11,
    completion: 38,
    status: "draft",
    gradient: "from-slate-800 to-slate-600",
    level: "Core",
    owner: "Admin LMS",
  },
  {
    id: "3",
    title: "Kỹ năng tư vấn khách hàng",
    code: "SALE-SKILL-03",
    category: "Soft Skills",
    lessons: 20,
    completion: 61,
    status: "review",
    gradient: "from-orange-400 to-rose-400",
    level: "Intermediate",
    owner: "Training Team",
  },
];

const fallbackSections: Section[] = [
  {
    id: "s1",
    title: "Phần 1: Tổng quan khóa học",
    lessons: [
      {
        id: "l1",
        title: "Giới thiệu hệ thống LMS",
        type: "video",
        time: "08:30",
        required: true,
      },
      {
        id: "l2",
        title: "Quy định học tập nội bộ",
        type: "document",
        time: "05 phút",
        required: true,
      },
      {
        id: "l3",
        title: "Quiz kiểm tra đầu vào",
        type: "quiz",
        time: "10 câu",
        required: true,
      },
    ],
  },
  {
    id: "s2",
    title: "Phần 2: Quy trình thực hành",
    lessons: [
      {
        id: "l4",
        title: "Hướng dẫn thao tác trên CRM",
        type: "video",
        time: "14:20",
        required: true,
      },
      {
        id: "l5",
        title: "Tài liệu quy trình chuẩn",
        type: "file",
        time: "PDF",
        required: false,
      },
      {
        id: "l6",
        title: "Bài tập tình huống",
        type: "assignment",
        time: "Deadline",
        required: true,
      },
    ],
  },
];

function statusLabel(status: Status | string) {
  if (status === "active" || status === "published") return "Đang hoạt động";
  if (status === "draft") return "Nháp";
  if (status === "review") return "Chờ duyệt";
  return "Không rõ";
}

function getCourseGradient(course: Course) {
  if (course.gradient) return course.gradient;
  if (course.status === "active" || course.status === "published") {
    return "from-orange-500 to-amber-400";
  }
  if (course.status === "review") return "from-orange-400 to-rose-400";
  return "from-slate-800 to-slate-600";
}

function lessonIcon(type: LessonType | string) {
  if (type === "video") return Video;
  if (type === "document") return FileText;
  if (type === "quiz") return ClipboardCheck;
  if (type === "file") return Upload;
  if (type === "assignment") return PenTool;
  return Library;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>(fallbackCourses);
  const [sections, setSections] = useState<Section[]>(fallbackSections);
  const [activeCourse, setActiveCourse] = useState<Course | null>(fallbackCourses[0]);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(
    fallbackSections[0].lessons[0]
  );

  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [quizTitle, setQuizTitle] = useState("");
  const [quizPassScore, setQuizPassScore] = useState("70");

  const [assignmentTitle, setAssignmentTitle] = useState("");
  const [assignmentFile, setAssignmentFile] = useState<File | null>(null);

  const [libraryUrl, setLibraryUrl] = useState("");

  const filteredCourses = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return courses;

    return courses.filter(
      (course) =>
        course.title?.toLowerCase().includes(q) ||
        course.code?.toLowerCase().includes(q) ||
        course.category?.toLowerCase().includes(q)
    );
  }, [keyword, courses]);

  const stats = useMemo(() => {
    return {
      total: courses.length || 0,
      active: courses.filter(
        (course) => course.status === "active" || course.status === "published"
      ).length,
      completion:
        courses.length > 0
          ? Math.round(
              courses.reduce((sum, course) => sum + Number(course.completion || 0), 0) /
                courses.length
            )
          : 0,
      review: courses.filter((course) => course.status === "review").length,
    };
  }, [courses]);

  async function fetchCourses() {
    try {
      setLoading(true);

      const response = await fetch(`${BUILDER_API}/courses`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Không lấy được danh sách khóa học");
      }

      const list = data.courses || data.data || [];

      if (list.length > 0) {
        setCourses(list);
        setActiveCourse(list[0]);
        await fetchCourseDetail(list[0].id);
      }
    } catch (error) {
      console.warn("FE đang dùng fallback data do BE chưa kết nối được:", error);
      setCourses(fallbackCourses);
      setActiveCourse(fallbackCourses[0]);
      setSections(fallbackSections);
      setActiveLesson(fallbackSections[0].lessons[0]);
    } finally {
      setLoading(false);
    }
  }

  async function fetchCourseDetail(courseId: string) {
    try {
      const response = await fetch(`${BUILDER_API}/courses/${courseId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Không lấy được chi tiết khóa học");
      }

      const nextCourse = data.course || data.data?.course || data.data;
      const nextSections = data.sections || data.data?.sections || [];

      if (nextCourse) setActiveCourse(nextCourse);
      setSections(nextSections);

      const firstLesson = nextSections?.[0]?.lessons?.[0] || null;
      setActiveLesson(firstLesson);
    } catch (error) {
      console.warn("Không lấy được course detail:", error);
      setSections(fallbackSections);
      setActiveLesson(fallbackSections[0].lessons[0]);
    }
  }

  async function handleSelectCourse(course: Course) {
    setActiveCourse(course);
    setActiveLesson(null);
    setSections([]);
    await fetchCourseDetail(course.id);
  }

  async function uploadVideoToLesson() {
    if (!activeLesson || !videoFile) {
      alert("Vui lòng chọn bài học và chọn video.");
      return;
    }

    const formData = new FormData();
    formData.append("video", videoFile);

    try {
      setLoading(true);

      const response = await fetch(`${BUILDER_API}/lessons/${activeLesson.id}/video`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Upload video thất bại");
      }

      alert("Upload video thành công");
      setVideoFile(null);

      if (activeCourse) await fetchCourseDetail(activeCourse.id);
    } catch (error: any) {
      alert(error.message || "Upload video thất bại");
    } finally {
      setLoading(false);
    }
  }

  async function createQuizForLesson() {
    if (!activeLesson) {
      alert("Vui lòng chọn bài học.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${BUILDER_API}/lessons/${activeLesson.id}/quiz`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: quizTitle || `Quiz - ${activeLesson.title}`,
          pass_score: Number(quizPassScore || 70),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Tạo quiz thất bại");
      }

      alert("Tạo quiz thành công");
      setQuizTitle("");
      setQuizPassScore("70");

      if (activeCourse) await fetchCourseDetail(activeCourse.id);
    } catch (error: any) {
      alert(error.message || "Tạo quiz thất bại");
    } finally {
      setLoading(false);
    }
  }

  async function attachLibraryResourceToLesson() {
    if (!activeLesson || !libraryUrl.trim()) {
      alert("Vui lòng chọn bài học và nhập URL tài nguyên.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${BUILDER_API}/lessons/${activeLesson.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content_url: libraryUrl.trim(),
          content_type: "resource",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gắn tài nguyên thất bại");
      }

      alert("Gắn tài nguyên thành công");
      setLibraryUrl("");

      if (activeCourse) await fetchCourseDetail(activeCourse.id);
    } catch (error: any) {
      alert(error.message || "Gắn tài nguyên thất bại");
    } finally {
      setLoading(false);
    }
  }

  async function uploadAssignmentForLesson() {
    if (!activeLesson) {
      alert("Vui lòng chọn bài học.");
      return;
    }

    if (!assignmentTitle.trim() && !assignmentFile) {
      alert("Vui lòng nhập tên bài tập hoặc chọn file.");
      return;
    }

    alert("FE đã sẵn sàng upload bài tập. BE sẽ bổ sung API ở bước tiếp theo.");
  }

  useEffect(() => {
    fetchCourses();
  }, []);

  return (
    <AppShell workspace="lms-admin" title="Quản lý khóa học">
      <div
        style={{
          minHeight: "100vh",
          background: "#f8fafc",
          padding: "18px 18px 40px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "1420px",
            margin: "0 auto",
          }}
        >
          <section
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
              gap: 20,
              width: "100%",
              marginBottom: 20,
            }}
          >
            <StatCard
              icon={BookOpen}
              value={String(stats.total || 24)}
              label="Tổng khóa học"
              note="+3 tháng này"
            />
            <StatCard
              icon={GraduationCap}
              value="1,286"
              label="Học viên đang học"
              note="Active"
            />
            <StatCard
              icon={CheckCircle2}
              value={`${stats.completion || 76}%`}
              label="Tỷ lệ hoàn thành"
              note="TB hệ thống"
            />
            <StatCard
              icon={AlertCircle}
              value={String(stats.review || 5)}
              label="Khóa chờ duyệt"
              note="Cần xử lý"
            />
          </section>

          <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  value={keyword}
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
                      {activeCourse?.code} • {activeCourse?.level} •{" "}
                      {activeCourse?.owner}
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
                  {sections.map((section) => (
                    <div key={section.id}>
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-base font-black text-slate-950">
                          {section.title}
                        </h3>

                        <button className="text-sm font-bold text-orange-600">
                          + Thêm bài
                        </button>
                      </div>

                      <div className="space-y-3">
                        {section.lessons.map((lesson) => (
                          <LessonRow
                            key={lesson.id}
                            lesson={lesson}
                            active={activeLesson?.id === lesson.id}
                            onClick={() => setActiveLesson(lesson)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <button className="mt-7 flex h-14 w-full items-center justify-center rounded-xl border border-dashed border-orange-300 bg-orange-50/20 text-sm font-bold text-orange-600">
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
                createQuizForLesson={createQuizForLesson}
                assignmentTitle={assignmentTitle}
                setAssignmentTitle={setAssignmentTitle}
                setAssignmentFile={setAssignmentFile}
                uploadAssignmentForLesson={uploadAssignmentForLesson}
                libraryUrl={libraryUrl}
                setLibraryUrl={setLibraryUrl}
                attachLibraryResourceToLesson={attachLibraryResourceToLesson}
                loading={loading}
              />

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-black text-slate-950">
                  Cấu hình khóa học
                </h2>

                <div className="mt-5 space-y-5">
                  <FormSelect label="Trạng thái" value="Đang hoạt động" />
                  <FormSelect label="Đối tượng học" value="Toàn bộ nhân sự" />

                  <div>
                    <label className="text-sm font-bold text-slate-600">
                      Điều kiện hoàn thành
                    </label>

                    <div className="mt-3 space-y-3">
                      <Requirement text="Xem 80% video" />
                      <Requirement text="Quiz đạt 70%" />
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-black text-slate-950">Publish</h2>

                <div className="mt-5 space-y-3 text-sm text-slate-600">
                  <PublishLine icon={Lock} text="Mở khóa tuần tự theo bài học" />
                  <PublishLine icon={Clock} text="Có thể lên lịch publish" />
                  <PublishLine icon={Eye} text="Preview trước khi công khai" />
                </div>

                <button className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 text-sm font-black text-white">
                  <Rocket size={17} />
                  Publish khóa học
                </button>
              </section>
            </aside>
          </section>
        </div>
      </div>
    </AppShell>
  );
}

function StatCard({
  icon: Icon,
  value,
  label,
  note,
}: {
  icon: any;
  value: string;
  label: string;
  note: string;
}) {
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

function CourseCard({
  course,
  active,
  onClick,
}: {
  course: Course;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-2xl border bg-white p-3 text-left shadow-sm transition ${
        active ? "border-orange-400 ring-2 ring-orange-100" : "border-slate-200"
      }`}
    >
      <div
        className={`rounded-xl bg-gradient-to-br ${getCourseGradient(course)} p-4 text-white`}
      >
        <div className="flex items-start justify-between">
          <BookOpen size={21} />

          <span className="rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold">
            {statusLabel(course.status)}
          </span>
        </div>

        <h3 className="mt-5 text-base font-black">{course.title}</h3>
        <p className="mt-1 text-xs">{course.code}</p>
      </div>

      <div className="mt-4 space-y-3 text-xs">
        <div className="flex justify-between gap-3">
          <span className="text-slate-500">Danh mục</span>
          <span className="font-black text-slate-950">{course.category}</span>
        </div>

        <div className="flex justify-between gap-3">
          <span className="text-slate-500">Bài học</span>
          <span className="font-black text-slate-950">{course.lessons}</span>
        </div>

        <div>
          <div className="mb-1 flex justify-between">
            <span className="text-slate-500">Hoàn thành</span>
            <span className="text-slate-500">{course.completion}%</span>
          </div>

          <div className="h-2 rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-orange-500"
              style={{ width: `${course.completion}%` }}
            />
          </div>
        </div>
      </div>
    </button>
  );
}

function BuilderType({
  icon: Icon,
  label,
  active,
}: {
  icon: any;
  label: string;
  active?: boolean;
}) {
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

function LessonRow({
  lesson,
  active,
  onClick,
}: {
  lesson: Lesson;
  active?: boolean;
  onClick?: () => void;
}) {
  const Icon = lessonIcon(lesson.type || lesson.lesson_type || "video");

  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
        active ? "border-orange-400 bg-orange-50" : "border-slate-200 bg-white"
      }`}
    >
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
        </p>
      </div>

      <span
        className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
          lesson.required
            ? "bg-orange-50 text-orange-600"
            : "bg-slate-100 text-slate-500"
        }`}
      >
        {lesson.required ? "Bắt buộc" : "Tùy chọn"}
      </span>

      <MoreHorizontal size={18} className="shrink-0 text-slate-400" />
    </button>
  );
}

function LessonContentPanel(props: {
  activeLesson: Lesson | null;
  videoFile: File | null;
  setVideoFile: (file: File | null) => void;
  uploadVideoToLesson: () => void;
  quizTitle: string;
  setQuizTitle: (value: string) => void;
  quizPassScore: string;
  setQuizPassScore: (value: string) => void;
  createQuizForLesson: () => void;
  assignmentTitle: string;
  setAssignmentTitle: (value: string) => void;
  setAssignmentFile: (file: File | null) => void;
  uploadAssignmentForLesson: () => void;
  libraryUrl: string;
  setLibraryUrl: (value: string) => void;
  attachLibraryResourceToLesson: () => void;
  loading: boolean;
}) {
  const {
    activeLesson,
    videoFile,
    setVideoFile,
    uploadVideoToLesson,
    quizTitle,
    setQuizTitle,
    quizPassScore,
    setQuizPassScore,
    createQuizForLesson,
    assignmentTitle,
    setAssignmentTitle,
    setAssignmentFile,
    uploadAssignmentForLesson,
    libraryUrl,
    setLibraryUrl,
    attachLibraryResourceToLesson,
    loading,
  } = props;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-black text-slate-950">Nội dung bài học</h2>

      {activeLesson ? (
        <div className="mt-4 space-y-5">
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-xs font-bold text-slate-400">Đang chọn bài học</p>
            <p className="mt-1 text-sm font-black text-slate-900">
              {activeLesson.title}
            </p>
          </div>

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
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-black text-white disabled:opacity-60"
            >
              <UploadCloud size={16} />
              Upload video
            </button>
          </div>

          <div className="space-y-3 border-t border-slate-100 pt-4">
            <label className="text-sm font-bold text-slate-600">Gắn quiz</label>

            <input
              value={quizTitle}
              onChange={(event) => setQuizTitle(event.target.value)}
              placeholder="Tên quiz"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />

            <input
              value={quizPassScore}
              onChange={(event) => setQuizPassScore(event.target.value)}
              type="number"
              placeholder="Điểm đạt"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />

            <button
              onClick={createQuizForLesson}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white disabled:opacity-60"
            >
              <ClipboardCheck size={16} />
              Tạo quiz
            </button>
          </div>

          <div className="space-y-3 border-t border-slate-100 pt-4">
            <label className="text-sm font-bold text-slate-600">
              Bài tập / tài liệu tải lên
            </label>

            <input
              value={assignmentTitle}
              onChange={(event) => setAssignmentTitle(event.target.value)}
              placeholder="Tên bài tập"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />

            <input
              type="file"
              onChange={(event) => setAssignmentFile(event.target.files?.[0] || null)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            />

            <button
              onClick={uploadAssignmentForLesson}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-black text-orange-600 disabled:opacity-60"
            >
              <PenTool size={16} />
              Upload bài tập
            </button>
          </div>

          <div className="space-y-3 border-t border-slate-100 pt-4">
            <label className="text-sm font-bold text-slate-600">
              Lấy từ kho dữ liệu
            </label>

            <input
              value={libraryUrl}
              onChange={(event) => setLibraryUrl(event.target.value)}
              placeholder="Dán URL video/tài liệu từ kho"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />

            <button
              onClick={attachLibraryResourceToLesson}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 disabled:opacity-60"
            >
              <Library size={16} />
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

function FormSelect({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="text-sm font-bold text-slate-600">{label}</label>

      <select className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none">
        <option>{value}</option>
      </select>
    </div>
  );
}

function Requirement({ text }: { text: string }) {
  return (
    <div className="flex h-11 items-center justify-between rounded-xl bg-slate-50 px-3 text-sm text-slate-950">
      <span>{text}</span>
      <CheckCircle2 size={17} className="text-orange-500" />
    </div>
  );
}

function PublishLine({
  icon: Icon,
  text,
}: {
  icon: any;
  text: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <Icon size={16} className="text-slate-500" />
      <span>{text}</span>
    </div>
  );
}