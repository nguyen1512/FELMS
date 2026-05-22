import Link from "next/link";
import AppShell from "@/components/lms/AppShell";
import SectionCard from "@/components/lms/SectionCard";
import {
  Award,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileQuestion,
  PlayCircle,
  Search,
  Target,
  Timer,
} from "lucide-react";

const exams = [
  {
    title: "Bài kiểm tra cuối khóa AnU LMS",
    course: "Hướng dẫn sử dụng hệ thống AnU LMS",
    date: "24/05/2026",
    duration: "30 phút",
    questions: 20,
    passScore: 80,
    score: 90,
    status: "Đã hoàn thành",
  },
  {
    title: "Quiz quy trình CRM",
    course: "Quy trình vận hành CRM cho đội CM",
    date: "28/05/2026",
    duration: "20 phút",
    questions: 15,
    passScore: 80,
    score: null,
    status: "Đang mở",
  },
  {
    title: "Đánh giá xử lý tình huống phụ huynh",
    course: "Tư vấn phụ huynh và xử lý tình huống",
    date: "02/06/2026",
    duration: "45 phút",
    questions: 25,
    passScore: 75,
    score: null,
    status: "Sắp diễn ra",
  },
];

function getStatusClass(status: string) {
  if (status === "Đã hoàn thành") {
    return "bg-green-100 text-green-700 border border-green-200";
  }

  if (status === "Đang mở") {
    return "bg-orange-100 text-orange-700 border border-orange-200";
  }

  return "bg-blue-100 text-blue-700 border border-blue-200";
}

export default function EmployeeExamsPage() {
  return (
    <AppShell workspace="employee" title="Các kỳ thi tham dự">
      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-orange-600">
            Exams & Assessments
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            Các kỳ thi tham dự
          </h1>

          <p className="mt-2 text-slate-500">
            Theo dõi các bài kiểm tra, quiz cuối khóa, thời gian làm bài, điểm
            đạt và trạng thái tham dự.
          </p>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <FileQuestion className="text-orange-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">3</p>
            <p className="text-sm text-slate-500">Bài kiểm tra</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <CheckCircle2 className="text-green-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">1</p>
            <p className="text-sm text-slate-500">Đã hoàn thành</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Clock3 className="text-orange-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">1</p>
            <p className="text-sm text-slate-500">Đang mở</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Award className="text-orange-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">90</p>
            <p className="text-sm text-slate-500">Điểm cao nhất</p>
          </div>
        </section>

        <SectionCard title="Bộ lọc kỳ thi">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_220px_220px]">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <Search size={18} className="text-slate-400" />
              <input
                placeholder="Tìm bài kiểm tra hoặc khóa học..."
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>

            <select className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none">
              <option>Tất cả trạng thái</option>
              <option>Đang mở</option>
              <option>Sắp diễn ra</option>
              <option>Đã hoàn thành</option>
            </select>

            <select className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none">
              <option>Tất cả khóa học</option>
              <option>AnU LMS</option>
              <option>CRM cho CM</option>
              <option>Xử lý tình huống</option>
            </select>
          </div>
        </SectionCard>

        <SectionCard title="Danh sách bài kiểm tra">
          <div className="grid grid-cols-1 gap-4">
            {exams.map((exam) => (
              <div
                key={exam.title}
                className="rounded-2xl border border-slate-200 bg-white p-5"
              >
                <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-start">
                  <div>
                    <span
                      className={`inline-flex min-w-[110px] items-center justify-center rounded-full px-3 py-1.5 text-xs font-bold whitespace-nowrap ${getStatusClass(
                        exam.status
                      )}`}
                    >
                      {exam.status}
                    </span>

                    <h3 className="mt-3 text-lg font-bold text-slate-950">
                      {exam.title}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {exam.course}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {exam.status === "Đang mở" && (
                      <Link
                        href={`/employee/exams/session?title=${encodeURIComponent(
                          exam.title
                        )}&course=${encodeURIComponent(exam.course)}`}
                        className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-sm font-bold text-white hover:bg-orange-600"
                      >
                        <PlayCircle size={17} />
                        Vào thi
                      </Link>
                    )}

                    {exam.status === "Sắp diễn ra" && (
                      <Link
                        href={`/employee/training-schedule?exam=${encodeURIComponent(
                          exam.title
                        )}`}
                        className="flex items-center gap-2 rounded-xl border border-blue-200 px-4 py-2 text-sm font-bold text-blue-600 hover:bg-blue-50"
                      >
                        <CalendarDays size={17} />
                        Xem lịch
                      </Link>
                    )}

                    {exam.status === "Đã hoàn thành" && (
                      <Link
                        href={`/employee/exams/result?title=${encodeURIComponent(
                          exam.title
                        )}&score=${exam.score ?? ""}`}
                        className="flex items-center gap-2 rounded-xl border border-green-200 px-4 py-2 text-sm font-bold text-green-600 hover:bg-green-50"
                      >
                        <CheckCircle2 size={17} />
                        Xem kết quả
                      </Link>
                    )}
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-5">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <CalendarDays size={15} />
                      Ngày thi
                    </div>
                    <p className="mt-1 font-bold text-slate-950">
                      {exam.date}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Timer size={15} />
                      Thời lượng
                    </div>
                    <p className="mt-1 font-bold text-slate-950">
                      {exam.duration}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <FileQuestion size={15} />
                      Số câu
                    </div>
                    <p className="mt-1 font-bold text-slate-950">
                      {exam.questions}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Target size={15} />
                      Điểm đạt
                    </div>
                    <p className="mt-1 font-bold text-slate-950">
                      {exam.passScore}
                    </p>
                  </div>

                  <div className="rounded-xl bg-orange-50 p-3">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Award size={15} />
                      Điểm của bạn
                    </div>
                    <p className="mt-1 font-bold text-orange-600">
                      {exam.score ?? "Chưa có"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Quy định tham gia kiểm tra">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {[
              {
                icon: Clock3,
                title: "Đúng thời gian",
                desc: "Bài kiểm tra chỉ mở trong khung thời gian được quy định.",
              },
              {
                icon: FileQuestion,
                title: "Một lần nộp",
                desc: "Một số bài kiểm tra chỉ cho phép nộp một lần duy nhất.",
              },
              {
                icon: Target,
                title: "Điểm đạt",
                desc: "Cần đạt điểm tối thiểu để được ghi nhận hoàn thành.",
              },
              {
                icon: Award,
                title: "Chứng chỉ",
                desc: "Điểm kiểm tra được dùng để xét điều kiện cấp chứng chỉ.",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-2xl border border-slate-200 p-5"
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