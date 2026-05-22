"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/lms/AppShell";
import SectionCard from "@/components/lms/SectionCard";
import {
  AlarmClock,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Database,
  FileQuestion,
  Plus,
  RefreshCw,
  ShieldCheck,
  Target,
  UploadCloud,
  Trash2,
  X,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type Course = {
  id: string;
  title: string;
  code?: string | null;
  status?: string | null;
};

type Lesson = {
  id: string;
  course_id: string;
  title: string;
  description?: string | null;
  content?: string | null;
  lesson_type?: string | null;
  video_url?: string | null;
  duration_minutes?: number | null;
  sort_order?: number | null;
  is_required?: boolean | null;
  status?: string | null;
};

type Assessment = {
  id: string;
  course_id: string;
  lesson_id?: string | null;
  title: string;
  description?: string | null;
  assessment_type?: string | null;
  pass_score?: number | string | null;
  time_limit_minutes?: number | null;
  max_attempts?: number | null;
  status?: string | null;
  course_title?: string | null;
  lesson_title?: string | null;
  question_count?: number | null;
  questions?: AssessmentQuestion[];
};

type AssessmentOption = {
  id: string;
  option_text: string;
  is_correct?: boolean | null;
  sort_order?: number | null;
};

type AssessmentQuestion = {
  id: string;
  question_text: string;
  question_type?: string | null;
  score?: number | string | null;
  explanation?: string | null;
  sort_order?: number | null;
  options?: AssessmentOption[];
};

type QuestionBankCategory = {
  id: string;
  name: string;
  code: string;
  description?: string | null;
};

type QuestionBank = {
  id: string;
  category_id?: string | null;
  title: string;
  description?: string | null;
  bank_type?: string | null;
  status?: string | null;
  category_name?: string | null;
  question_count?: number | null;
};

type BankQuestion = {
  id: string;
  question_text: string;
  option_a?: string | null;
  option_b?: string | null;
  option_c?: string | null;
  option_d?: string | null;
  correct_option?: string | null;
};

function getCookie(name: string) {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
}

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token") || getCookie("token");
}

function getStatusClass(status?: string | null) {
  if (status === "published") return "bg-green-100 text-green-700 border border-green-200";
  if (status === "draft") return "bg-orange-100 text-orange-700 border border-orange-200";
  if (status === "scheduled") return "bg-blue-100 text-blue-700 border border-blue-200";
  return "bg-slate-100 text-slate-700 border border-slate-200";
}

function getStatusLabel(status?: string | null) {
  if (status === "published") return "Đang hoạt động";
  if (status === "draft") return "Bản nháp";
  if (status === "scheduled") return "Đã lên lịch";
  return status || "Không rõ";
}

function getAssessmentTypeLabel(type?: string | null) {
  if (type === "lesson_quiz") return "Quiz bài học";
  if (type === "course_test") return "Bài test sau khóa học";
  if (type === "final_exam") return "Bài thi cuối khóa";
  if (type === "case_study") return "Case Study";
  if (type === "practice") return "Thực hành tình huống";
  return type || "Khác";
}

function getBankTypeLabel(type?: string | null) {
  if (type === "test") return "Kho bài test";
  if (type === "exam") return "Kho bài thi";
  if (type === "soft_skill") return "Kho kỹ năng mềm";
  if (type === "quiz") return "Kho quiz";
  return type || "Khác";
}

export default function LMSAdminAssessmentsPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [categories, setCategories] = useState<QuestionBankCategory[]>([]);
  const [banks, setBanks] = useState<QuestionBank[]>([]);
  const [randomQuestions, setRandomQuestions] = useState<BankQuestion[]>([]);

  const [title, setTitle] = useState("");
  const [courseId, setCourseId] = useState("");
  const [lessonId, setLessonId] = useState("");
  const [assessmentType, setAssessmentType] = useState("lesson_quiz");
  const [passScore, setPassScore] = useState("80");
  const [timeLimit, setTimeLimit] = useState("20");
  const [maxAttempts, setMaxAttempts] = useState("1");
  const [status, setStatus] = useState("published");
  const [description, setDescription] = useState("");

  const [bankTitle, setBankTitle] = useState("");
  const [bankDescription, setBankDescription] = useState("");
  const [bankCategoryId, setBankCategoryId] = useState("");
  const [bankType, setBankType] = useState("test");

  const [uploadBankId, setUploadBankId] = useState("");
  const [questionFile, setQuestionFile] = useState<File | null>(null);
  const [selectedBankIds, setSelectedBankIds] = useState<string[]>([]);
  const [randomLimit, setRandomLimit] = useState("10");

  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [deletingAssessmentId, setDeletingAssessmentId] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [creatingAssessment, setCreatingAssessment] = useState(false);
  const [creatingBank, setCreatingBank] = useState(false);
  const [uploadingBankFile, setUploadingBankFile] = useState(false);
  const [randomLoading, setRandomLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");

  const stats = useMemo(() => {
    return {
      total: assessments.length,
      active: assessments.filter((a) => a.status === "published").length,
      scheduled: assessments.filter((a) => a.status === "scheduled").length,
      questions: assessments.reduce((sum, item) => sum + Number(item.question_count || 0), 0),
      banks: banks.length,
    };
  }, [assessments, banks]);

  async function fetchLessonsByCourse(nextCourseId: string) {
    if (!nextCourseId) {
      setLessons([]);
      setLessonId("");
      return;
    }

    const token = getToken();
    const response = await fetch(`${API_URL}/assessments/courses/${nextCourseId}/lessons`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();

    if (!response.ok) throw new Error(data.message || "Không lấy được danh sách bài học");

    setLessons(data.lessons || data.data || []);
  }

  async function handleChangeCourse(nextCourseId: string) {
    try {
      setCourseId(nextCourseId);
      setLessonId("");
      await fetchLessonsByCourse(nextCourseId);
    } catch (error) {
      setMessageType("error");
      setMessage(error instanceof Error ? error.message : "Không tải được bài học của khóa");
    }
  }

  async function fetchData() {
    try {
      setLoading(true);
      setMessage("");

      const token = getToken();

      const [coursesRes, assessmentsRes, categoriesRes, banksRes] = await Promise.all([
        fetch(`${API_URL}/assessments/courses/list`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/assessments`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/question-banks/categories`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/question-banks`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const coursesData = await coursesRes.json();
      const assessmentsData = await assessmentsRes.json();
      const categoriesData = await categoriesRes.json();
      const banksData = await banksRes.json();

      if (!coursesRes.ok) throw new Error(coursesData.message || "Không lấy được khóa học");
      if (!assessmentsRes.ok) throw new Error(assessmentsData.message || "Không lấy được bài thi");
      if (!categoriesRes.ok) throw new Error(categoriesData.message || "Không lấy được danh mục kho");
      if (!banksRes.ok) throw new Error(banksData.message || "Không lấy được kho câu hỏi");

      setCourses(coursesData.courses || coursesData.data || []);
      setAssessments(assessmentsData.assessments || assessmentsData.data || []);
      setCategories(categoriesData.categories || categoriesData.data || []);
      setBanks(banksData.banks || banksData.data || []);
    } catch (error) {
      setMessageType("error");
      setMessage(error instanceof Error ? error.message : "Không tải được dữ liệu");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateBank() {
    if (!bankTitle.trim()) {
      setMessageType("error");
      setMessage("Vui lòng nhập tên kho câu hỏi.");
      return;
    }

    try {
      setCreatingBank(true);
      setMessage("");

      const token = getToken();

      const response = await fetch(`${API_URL}/question-banks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          category_id: bankCategoryId || null,
          title: bankTitle.trim(),
          description: bankDescription.trim(),
          bank_type: bankType,
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Tạo kho câu hỏi thất bại");

      setMessageType("success");
      setMessage("Tạo kho câu hỏi thành công.");
      setBankTitle("");
      setBankDescription("");
      setBankCategoryId("");
      setBankType("test");
      await fetchData();
    } catch (error) {
      setMessageType("error");
      setMessage(error instanceof Error ? error.message : "Tạo kho câu hỏi thất bại");
    } finally {
      setCreatingBank(false);
    }
  }

  async function handleUploadQuestionFile() {
    if (!uploadBankId || !questionFile) {
      setMessageType("error");
      setMessage("Vui lòng chọn kho câu hỏi và file câu hỏi.");
      return;
    }

    try {
      setUploadingBankFile(true);
      setMessage("");

      const token = getToken();
      const formData = new FormData();
      formData.append("file", questionFile);

      const response = await fetch(`${API_URL}/question-banks/${uploadBankId}/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Upload bộ câu hỏi thất bại");

      setMessageType("success");
      setMessage(`Upload bộ câu hỏi thành công. Đã import ${data.inserted || 0} câu.`);
      setQuestionFile(null);
      await fetchData();
    } catch (error) {
      setMessageType("error");
      setMessage(error instanceof Error ? error.message : "Upload bộ câu hỏi thất bại");
    } finally {
      setUploadingBankFile(false);
    }
  }

  function toggleBank(bankId: string) {
    setSelectedBankIds((prev) => {
      if (prev.includes(bankId)) return prev.filter((id) => id !== bankId);
      return [...prev, bankId];
    });
  }

  async function handlePreviewRandomQuestions() {
    if (selectedBankIds.length === 0) {
      setMessageType("error");
      setMessage("Vui lòng chọn ít nhất một kho câu hỏi.");
      return;
    }

    try {
      setRandomLoading(true);
      setMessage("");

      const token = getToken();

      const response = await fetch(
        `${API_URL}/question-banks/random/questions?bankIds=${selectedBankIds.join(",")}&limit=${Number(randomLimit || 10)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Random câu hỏi thất bại");

      setRandomQuestions(data.questions || data.data || []);
      setMessageType("success");
      setMessage(`Đã random ${(data.questions || data.data || []).length || 0} câu hỏi từ kho đã chọn.`);
    } catch (error) {
      setMessageType("error");
      setMessage(error instanceof Error ? error.message : "Random câu hỏi thất bại");
    } finally {
      setRandomLoading(false);
    }
  }

  async function handleCreateAssessment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim() || !courseId) {
      setMessageType("error");
      setMessage("Vui lòng nhập tên bài thi và chọn khóa học.");
      return;
    }

    if (assessmentType === "lesson_quiz" && !lessonId) {
      setMessageType("error");
      setMessage("Quiz bài học cần chọn bài học cụ thể trong khóa học.");
      return;
    }

    try {
      setCreatingAssessment(true);
      setMessage("");

      const token = getToken();

      const response = await fetch(`${API_URL}/assessments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          course_id: courseId,
          lesson_id: lessonId || null,
          title: title.trim(),
          description: description.trim(),
          assessment_type: assessmentType,
          pass_score: Number(passScore || 80),
          time_limit_minutes: Number(timeLimit || 20),
          max_attempts: Number(maxAttempts || 1),
          status,
          selected_bank_ids: selectedBankIds,
          random_question_limit: Number(randomLimit || 10),
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Tạo bài thi thất bại");

      setMessageType("success");
      setMessage(`Tạo bài thi thành công. Đã gán ${data.inserted_question_count || 0} câu hỏi.`);

      setTitle("");
      setDescription("");
      setPassScore("80");
      setTimeLimit("20");
      setMaxAttempts("1");
      setStatus("published");
      setAssessmentType("lesson_quiz");
      setCourseId("");
      setLessonId("");
      setLessons([]);
      setRandomQuestions([]);

      await fetchData();
    } catch (error) {
      setMessageType("error");
      setMessage(error instanceof Error ? error.message : "Tạo bài thi thất bại");
    } finally {
      setCreatingAssessment(false);
    }
  }

  async function handleOpenAssessmentDetail(assessmentId: string) {
    try {
      setDetailLoading(true);
      setDetailOpen(true);
      setSelectedAssessment(null);
      setMessage("");

      const token = getToken();
      const response = await fetch(`${API_URL}/assessments/${assessmentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Không lấy được chi tiết bài thi");

      setSelectedAssessment(data.assessment || data.data);
    } catch (error) {
      setMessageType("error");
      setMessage(error instanceof Error ? error.message : "Không lấy được chi tiết bài thi");
      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  }


  async function handleDeleteAssessment(assessmentId: string, assessmentTitle: string) {
    const ok = window.confirm(`Bạn chắc chắn muốn xóa bài thi/bài test: "${assessmentTitle}"?`);
    if (!ok) return;

    try {
      setDeletingAssessmentId(assessmentId);
      setMessage("");

      const token = getToken();
      const response = await fetch(`${API_URL}/assessments/${assessmentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Xóa bài thi thất bại");

      setMessageType("success");
      setMessage("Đã xóa bài thi / bài test thành công.");
      if (selectedAssessment?.id === assessmentId) {
        setSelectedAssessment(null);
        setDetailOpen(false);
      }
      await fetchData();
    } catch (error) {
      setMessageType("error");
      setMessage(error instanceof Error ? error.message : "Xóa bài thi thất bại");
    } finally {
      setDeletingAssessmentId(null);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <AppShell workspace="lms-admin" title="Quản lý bài thi">
      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-sm font-semibold text-orange-600">Assessment Management</p>
              <h1 className="mt-2 text-3xl font-bold text-slate-950">
                Quản lý bài thi & bài test
              </h1>
              <p className="mt-2 max-w-3xl text-slate-500">
                Tạo kho câu hỏi, chọn khóa học, chọn bài học, random bộ đề và xem chi tiết đáp án đúng.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchData}
              disabled={loading}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-50"
            >
              <RefreshCw size={18} />
              {loading ? "Đang tải..." : "Làm mới"}
            </button>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <ClipboardCheck className="text-orange-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">{stats.total}</p>
            <p className="text-sm text-slate-500">Tổng bài thi</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <CheckCircle2 className="text-green-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">{stats.active}</p>
            <p className="text-sm text-slate-500">Đang hoạt động</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <CalendarDays className="text-blue-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">{stats.scheduled}</p>
            <p className="text-sm text-slate-500">Đã lên lịch</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Database className="text-orange-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">{stats.banks}</p>
            <p className="text-sm text-slate-500">Kho câu hỏi</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <FileQuestion className="text-orange-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">{stats.questions}</p>
            <p className="text-sm text-slate-500">Câu hỏi đã gán</p>
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

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[430px_1fr]">
          <SectionCard title="Tạo kho câu hỏi">
            <div className="space-y-4">
              <input
                value={bankTitle}
                onChange={(e) => setBankTitle(e.target.value)}
                placeholder="Tên kho câu hỏi"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
              />

              <select
                value={bankCategoryId}
                onChange={(e) => setBankCategoryId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
              >
                <option value="">Chọn nhóm kho</option>
                {categories.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>

              <select
                value={bankType}
                onChange={(e) => setBankType(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
              >
                <option value="test">Kho bài test</option>
                <option value="exam">Kho bài thi</option>
                <option value="soft_skill">Kho kỹ năng mềm</option>
                <option value="quiz">Kho quiz bài học</option>
              </select>

              <textarea
                value={bankDescription}
                onChange={(e) => setBankDescription(e.target.value)}
                rows={4}
                placeholder="Mô tả kho câu hỏi"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
              />

              <button
                type="button"
                onClick={handleCreateBank}
                disabled={creatingBank}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-50"
              >
                <Plus size={18} />
                {creatingBank ? "Đang tạo..." : "Tạo kho câu hỏi"}
              </button>
            </div>
          </SectionCard>

          <SectionCard title="Danh sách kho câu hỏi">
            <div className="max-h-[420px] overflow-y-auto pr-2">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {banks.map((bank) => (
                  <button
                    key={bank.id}
                    type="button"
                    onClick={() => toggleBank(bank.id)}
                    className={`rounded-2xl border p-4 text-left transition ${
                      selectedBankIds.includes(bank.id)
                        ? "border-orange-400 bg-orange-50"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-slate-950">{bank.title}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {bank.category_name || "Chưa phân nhóm"} · {getBankTypeLabel(bank.bank_type)}
                        </p>
                      </div>

                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                        {bank.question_count || 0} câu
                      </span>
                    </div>

                    {bank.description && (
                      <p className="mt-3 line-clamp-2 text-sm text-slate-500">{bank.description}</p>
                    )}
                  </button>
                ))}

                {banks.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500 md:col-span-2">
                    Chưa có kho câu hỏi nào.
                  </div>
                )}
              </div>
            </div>
          </SectionCard>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[430px_1fr]">
          <SectionCard title="Upload bộ câu hỏi vào kho">
            <div className="space-y-4">
              <select
                value={uploadBankId}
                onChange={(e) => setUploadBankId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
              >
                <option value="">Chọn kho để upload</option>
                {banks.map((bank) => (
                  <option key={bank.id} value={bank.id}>
                    {bank.title} ({bank.question_count || 0} câu)
                  </option>
                ))}
              </select>

              <input
                type="file"
                accept=".txt,.csv"
                onChange={(e) => setQuestionFile(e.target.files?.[0] || null)}
                className="w-full rounded-xl border border-orange-300 bg-orange-50 px-4 py-3 text-sm"
              />

              {questionFile && (
                <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
                  Đã chọn file: {questionFile.name}
                </div>
              )}

              <button
                type="button"
                onClick={handleUploadQuestionFile}
                disabled={!uploadBankId || !questionFile || uploadingBankFile}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-bold text-white hover:bg-slate-700 disabled:opacity-50"
              >
                <UploadCloud size={18} />
                {uploadingBankFile ? "Đang upload..." : "Upload bộ câu hỏi"}
              </button>

              <div className="rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                Format file hiện tại:
                <br />
                <b>Câu hỏi|A|B|C|D|Đáp án</b>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Preview random câu hỏi từ kho đã chọn">
            <div className="space-y-4">
              <div className="flex flex-col gap-3 md:flex-row">
                <input
                  type="number"
                  min={1}
                  value={randomLimit}
                  onChange={(e) => setRandomLimit(e.target.value)}
                  placeholder="Số câu cần random"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none md:max-w-[220px]"
                />

                <button
                  type="button"
                  onClick={handlePreviewRandomQuestions}
                  disabled={selectedBankIds.length === 0 || randomLoading}
                  className="flex h-12 items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-50"
                >
                  <FileQuestion size={18} />
                  {randomLoading ? "Đang random..." : "Preview random đề"}
                </button>
              </div>

              <div className="max-h-[420px] space-y-3 overflow-y-auto pr-2">
                {randomQuestions.map((q, index) => (
                  <div key={q.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="font-bold text-slate-950">
                      {index + 1}. {q.question_text}
                    </p>
                    <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-slate-600 md:grid-cols-2">
                      <p>A. {q.option_a}</p>
                      <p>B. {q.option_b}</p>
                      <p>C. {q.option_c}</p>
                      <p>D. {q.option_d}</p>
                    </div>
                    <p className="mt-3 text-sm font-bold text-green-700">
                      Đáp án đúng: {q.correct_option}
                    </p>
                  </div>
                ))}

                {randomQuestions.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
                    Chọn một hoặc nhiều kho câu hỏi rồi bấm preview random đề.
                  </div>
                )}
              </div>
            </div>
          </SectionCard>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[430px_1fr]">
          <SectionCard title="Tạo bài thi / bài test">
            <form onSubmit={handleCreateAssessment} className="space-y-4">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Tên bài thi / bài test / quiz"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
              />

              <select
                value={assessmentType}
                onChange={(e) => setAssessmentType(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
              >
                <option value="lesson_quiz">Quiz bài học</option>
                <option value="course_test">Bài test sau khóa học</option>
                <option value="final_exam">Bài thi cuối khóa</option>
                <option value="case_study">Case Study</option>
                <option value="practice">Thực hành tình huống</option>
              </select>

              <select
                value={courseId}
                onChange={(e) => handleChangeCourse(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
              >
                <option value="">Gán vào khóa học</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>

              <select
                value={lessonId}
                onChange={(e) => setLessonId(e.target.value)}
                disabled={!courseId}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="">
                  {courseId ? "Chọn bài học trong khóa" : "Chọn khóa học trước"}
                </option>
                {lessons.map((lesson) => (
                  <option key={lesson.id} value={lesson.id}>
                    {lesson.sort_order ? `${lesson.sort_order}. ` : ""}{lesson.title}
                  </option>
                ))}
              </select>

              <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-700">
                Đã chọn {selectedBankIds.length} kho câu hỏi. Khi tạo bài, hệ thống sẽ random {Number(randomLimit || 10)} câu từ các kho này và lưu vào bộ đề.
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-500">
                    Điểm đạt
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    placeholder="Ví dụ: 80"
                    value={passScore}
                    onChange={(e) => setPassScore(e.target.value)}
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-500">
                    Số lần làm bài
                  </label>
                  <input
                    type="number"
                    min={1}
                    placeholder="Ví dụ: 1"
                    value={maxAttempts}
                    onChange={(e) => setMaxAttempts(e.target.value)}
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-500">
                    Thời lượng làm bài
                  </label>
                  <input
                    type="number"
                    min={1}
                    placeholder="Ví dụ: 20 phút"
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(e.target.value)}
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:bg-white"
                  />
                </div>
              </div>

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
              >
                <option value="published">Đang hoạt động</option>
                <option value="draft">Bản nháp</option>
                <option value="scheduled">Đã lên lịch</option>
              </select>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Mô tả bài thi..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
              />

              <button
                type="submit"
                disabled={creatingAssessment}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-50"
              >
                <Plus size={18} />
                {creatingAssessment ? "Đang tạo..." : "Tạo bài thi"}
              </button>
            </form>
          </SectionCard>

          <SectionCard title="Danh sách bài thi / bài test / quiz">
            <div className="max-h-[620px] space-y-4 overflow-y-auto pr-2">
              {assessments.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleOpenAssessmentDetail(item.id)}
                  className="w-full cursor-pointer rounded-2xl border border-slate-200 p-5 text-left transition hover:border-orange-400 hover:bg-orange-50"
                >
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                    <div>
                      <span
                        className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-bold ${getStatusClass(
                          item.status
                        )}`}
                      >
                        {getStatusLabel(item.status)}
                      </span>

                      <h3 className="mt-3 text-xl font-bold text-slate-950">{item.title}</h3>

                      <p className="mt-1 text-sm text-slate-500">
                        {item.course_title || "Chưa xác định khóa học"}
                        {item.lesson_title ? ` · ${item.lesson_title}` : ""}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAssessment(item.id, item.title);
                      }}
                      disabled={deletingAssessmentId === item.id}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 text-sm font-bold text-red-600 hover:bg-red-100 disabled:opacity-50"
                    >
                      <Trash2 size={16} />
                      {deletingAssessmentId === item.id ? "Đang xóa..." : "Xóa"}
                    </button>
                  </div>

                  <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <BookOpen size={15} />
                        Khóa học
                      </div>
                      <p className="mt-1 line-clamp-1 font-bold text-slate-950">{item.course_title || "N/A"}</p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <ClipboardCheck size={15} />
                        Loại
                      </div>
                      <p className="mt-1 font-bold text-slate-950">
                        {getAssessmentTypeLabel(item.assessment_type)}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <FileQuestion size={15} />
                        Số câu hỏi
                      </div>
                      <p className="mt-1 font-bold text-slate-950">{item.question_count || 0}</p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <AlarmClock size={15} />
                        Thời lượng
                      </div>
                      <p className="mt-1 font-bold text-slate-950">
                        {item.time_limit_minutes || 0} phút
                      </p>
                    </div>

                    <div className="rounded-xl bg-orange-50 p-3">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Target size={15} />
                        Điểm đạt
                      </div>
                      <p className="mt-1 font-bold text-orange-600">{item.pass_score || 0}</p>
                    </div>
                  </div>
                </div>
              ))}

              {assessments.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
                  Chưa có bài thi nào.
                </div>
              )}
            </div>
          </SectionCard>
        </div>

        <SectionCard title="Chức năng hệ thống bài thi">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              {
                title: "Kho bài test",
                desc: "Lưu các bộ câu hỏi dùng cho kiểm tra ngắn.",
                icon: ClipboardCheck,
              },
              {
                title: "Kho bài thi",
                desc: "Lưu đề thi cuối khóa và bài đánh giá chính thức.",
                icon: CalendarDays,
              },
              {
                title: "Kho kỹ năng mềm",
                desc: "Lưu câu hỏi về giao tiếp, tư vấn, xử lý tình huống.",
                icon: FileQuestion,
              },
              {
                title: "Random câu hỏi",
                desc: "Bốc đề tự động từ một hoặc nhiều kho câu hỏi.",
                icon: ShieldCheck,
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-5">
                  <Icon className="text-orange-600" size={22} />
                  <h3 className="mt-3 font-bold text-slate-950">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </SectionCard>
      </div>

      {detailOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
              <div>
                <p className="text-sm font-semibold text-orange-600">Chi tiết bài thi / bài test / quiz</p>
                <h2 className="mt-1 text-2xl font-bold text-slate-950">
                  {detailLoading ? "Đang tải..." : selectedAssessment?.title}
                </h2>
                {selectedAssessment && (
                  <p className="mt-1 text-sm text-slate-500">
                    {selectedAssessment.course_title || "Không rõ khóa học"}
                    {selectedAssessment.lesson_title ? ` · ${selectedAssessment.lesson_title}` : ""}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => setDetailOpen(false)}
                className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            {detailLoading && (
              <div className="p-8 text-center font-semibold text-slate-500">Đang tải chi tiết...</div>
            )}

            {!detailLoading && selectedAssessment && (
              <div className="max-h-[78vh] overflow-y-auto p-5">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">Loại</p>
                    <p className="mt-1 font-bold text-slate-950">{getAssessmentTypeLabel(selectedAssessment.assessment_type)}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">Trạng thái</p>
                    <p className="mt-1 font-bold text-slate-950">{getStatusLabel(selectedAssessment.status)}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">Điểm đạt</p>
                    <p className="mt-1 font-bold text-slate-950">{selectedAssessment.pass_score}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">Thời lượng</p>
                    <p className="mt-1 font-bold text-slate-950">{selectedAssessment.time_limit_minutes || 0} phút</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">Số lần làm</p>
                    <p className="mt-1 font-bold text-slate-950">{selectedAssessment.max_attempts || 1}</p>
                  </div>
                </div>

                {selectedAssessment.description && (
                  <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-600">
                    {selectedAssessment.description}
                  </div>
                )}

                <div className="mt-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-950">Bộ đề và đáp án đúng</h3>
                    <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
                      {selectedAssessment.questions?.length || 0} câu
                    </span>
                  </div>

                  <div className="space-y-4">
                    {selectedAssessment.questions?.map((question, index) => (
                      <div key={question.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                        <div className="flex items-start justify-between gap-4">
                          <p className="font-bold text-slate-950">
                            Câu {index + 1}. {question.question_text}
                          </p>
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                            {question.score || 1} điểm
                          </span>
                        </div>

                        <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-2">
                          {question.options?.map((option, optionIndex) => (
                            <div
                              key={option.id}
                              className={`rounded-xl border px-4 py-3 text-sm ${
                                option.is_correct
                                  ? "border-green-300 bg-green-50 font-bold text-green-700"
                                  : "border-slate-200 bg-slate-50 text-slate-600"
                              }`}
                            >
                              {String.fromCharCode(65 + optionIndex)}. {option.option_text}
                              {option.is_correct ? "  ✓" : ""}
                            </div>
                          ))}
                        </div>

                        {question.explanation && (
                          <div className="mt-3 rounded-xl bg-blue-50 p-3 text-sm text-blue-700">
                            Giải thích: {question.explanation}
                          </div>
                        )}
                      </div>
                    ))}

                    {(selectedAssessment.questions?.length || 0) === 0 && (
                      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
                        Bài này chưa có câu hỏi. Hãy chọn kho câu hỏi rồi tạo lại hoặc bổ sung chức năng gán thêm câu hỏi.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}
