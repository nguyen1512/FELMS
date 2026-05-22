import Link from "next/link";
import AppShell from "@/components/lms/AppShell";
import ProgressBar from "@/components/lms/ProgressBar";
import SectionCard from "@/components/lms/SectionCard";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileQuestion,
  Send,
} from "lucide-react";

const questions = [
  {
    id: 1,
    question: "Mục tiêu chính của hệ thống LMS nội bộ AnU là gì?",
    options: [
      "Quản lý bán hàng và doanh thu",
      "Đào tạo, theo dõi tiến độ học tập và đánh giá năng lực nhân viên",
      "Quản lý kho và vận chuyển",
      "Thiết kế website giới thiệu doanh nghiệp",
    ],
    correctAnswer: 1,
  },
  {
    id: 2,
    question: "Sau khi hoàn thành video bài giảng, nhân viên cần làm gì tiếp theo?",
    options: [
      "Đăng xuất khỏi hệ thống",
      "Xóa lịch sử học tập",
      "Làm quiz hoặc bài kiểm tra theo yêu cầu khóa học",
      "Tạo phòng ban mới",
    ],
    correctAnswer: 2,
  },
  {
    id: 3,
    question: "Radar năng lực dùng để làm gì?",
    options: [
      "Hiển thị tổng quan năng lực theo từng nhóm kỹ năng",
      "Tải video lên hệ thống",
      "Tạo tài khoản admin",
      "Quản lý hóa đơn",
    ],
    correctAnswer: 0,
  },
  {
    id: 4,
    question: "Điều kiện thường dùng để cấp chứng chỉ là gì?",
    options: [
      "Chỉ cần đăng nhập hệ thống",
      "Hoàn thành bài học bắt buộc và đạt điểm kiểm tra tối thiểu",
      "Chỉ cần xem tên khóa học",
      "Chỉ cần có tài khoản nhân viên",
    ],
    correctAnswer: 1,
  },
  {
    id: 5,
    question: "Vai trò của trưởng phòng trong LMS là gì?",
    options: [
      "Chỉ xem chứng chỉ cá nhân",
      "Upload bài giảng, tạo câu hỏi và theo dõi nhân viên trong phòng ban",
      "Không được xem dữ liệu đào tạo",
      "Chỉ đổi màu giao diện",
    ],
    correctAnswer: 1,
  },
];

type QuizSearchParams = {
  q?: string;
  selected?: string;
  submitted?: string;
};

type Props = {
  searchParams?: Promise<QuizSearchParams>;
};

export default async function QuizPage({ searchParams }: Props) {
  const params = await searchParams;

  const submitted = params?.submitted === "true";
  const currentQuestionNumber = Number(params?.q || "1");
  const selected = params?.selected;

  const currentIndex = Math.min(
    Math.max(currentQuestionNumber - 1, 0),
    questions.length - 1
  );

  const currentQuestion = questions[currentIndex];

  const progress = submitted
    ? 100
    : Math.round(((currentIndex + 1) / questions.length) * 100);

  const prevQuestion = Math.max(currentIndex, 1);
  const nextQuestion = Math.min(currentIndex + 2, questions.length);

  return (
    <AppShell workspace="employee" title="Bài kiểm tra sau bài học">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
        <main className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-start">
              <div>
                <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-semibold text-orange-700">
                  Quiz sau bài học
                </span>

                <h1 className="mt-4 text-3xl font-bold text-slate-950">
                  Ôn tập: Tổng quan luồng học tập nội bộ
                </h1>

                <p className="mt-2 text-slate-500">
                  Làm bài kiểm tra theo từng câu hỏi. Sau khi nộp bài, hệ thống
                  sẽ chuyển sang kết quả và cấp chứng chỉ.
                </p>
              </div>

              <div className="rounded-2xl bg-orange-50 px-5 py-4 text-orange-700">
                <div className="flex items-center gap-2 font-bold">
                  <Clock3 size={18} />
                  15:00
                </div>
                <p className="mt-1 text-xs">Thời gian làm bài</p>
              </div>
            </div>

            <div className="mt-5">
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-slate-500">
                  Tiến độ câu hỏi{" "}
                  {submitted ? questions.length : currentIndex + 1}/
                  {questions.length}
                </span>

                <span className="font-bold text-orange-600">{progress}%</span>
              </div>

              <ProgressBar value={progress} />
            </div>
          </section>

          {!submitted && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                  <FileQuestion size={22} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-orange-600">
                    Câu {currentIndex + 1}/{questions.length}
                  </p>

                  <h2 className="text-xl font-bold text-slate-950">
                    {currentQuestion.question}
                  </h2>
                </div>
              </div>

              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = selected === String(index);

                  return (
                    <Link
                      key={option}
                      href={`/quiz?q=${currentIndex + 1}&selected=${index}`}
                      className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition ${
                        isSelected
                          ? "border-orange-500 bg-orange-50"
                          : "border-slate-200 bg-white hover:border-orange-400 hover:bg-orange-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full border text-sm font-bold ${
                            isSelected
                              ? "border-orange-500 bg-orange-500 text-white"
                              : "border-slate-300 text-slate-500"
                          }`}
                        >
                          {String.fromCharCode(65 + index)}
                        </div>

                        <span className="font-medium text-slate-800">
                          {option}
                        </span>
                      </div>

                      {isSelected && (
                        <CheckCircle2 size={20} className="text-orange-600" />
                      )}
                    </Link>
                  );
                })}
              </div>

              <div className="mt-6 flex flex-col justify-between gap-3 md:flex-row">
                <Link
                  href={`/quiz?q=${prevQuestion}`}
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                  <ChevronLeft size={18} />
                  Câu trước
                </Link>

                <div className="flex gap-3">
                  <Link
                    href={`/quiz?q=${nextQuestion}`}
                    className="flex items-center justify-center gap-2 rounded-xl border border-orange-200 px-5 py-3 text-sm font-bold text-orange-600 hover:bg-orange-50"
                  >
                    Câu tiếp
                    <ChevronRight size={18} />
                  </Link>

                  <Link
                    href="/quiz?submitted=true"
                    className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600"
                  >
                    <Send size={18} />
                    Nộp bài
                  </Link>
                </div>
              </div>
            </section>
          )}

          {submitted && (
            <section className="rounded-2xl border border-green-200 bg-green-50 p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-green-800">
                Kết quả bài kiểm tra
              </h2>

              <p className="mt-2 text-green-700">
                Bạn đã hoàn thành bài kiểm tra sau bài học.
              </p>

              <p className="mt-2 text-sm text-green-700">
                Kết quả này sẽ được ghi nhận vào tiến độ học tập và đủ điều kiện
                nhận chứng chỉ hoàn thành khóa học.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/certificate"
                  className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-600"
                >
                  Nhận chứng chỉ
                </Link>

                <Link
                  href="/learning"
                  className="inline-flex items-center justify-center rounded-xl border border-orange-200 bg-white px-5 py-3 text-sm font-bold text-orange-600 transition hover:bg-orange-50"
                >
                  Quay lại bài học
                </Link>

                <Link
                  href="/quiz?q=1"
                  className="inline-flex items-center justify-center rounded-xl border border-green-300 bg-white px-5 py-3 text-sm font-bold text-green-700 transition hover:bg-green-100"
                >
                  Làm lại bài kiểm tra
                </Link>
              </div>
            </section>
          )}
        </main>

        <aside className="space-y-6">
          <SectionCard title="Danh sách câu hỏi">
            <div className="grid grid-cols-5 gap-2">
              {questions.map((question, index) => (
                <Link
                  key={question.id}
                  href={`/quiz?q=${index + 1}`}
                  className={`flex h-11 items-center justify-center rounded-xl text-sm font-bold transition ${
                    index === currentIndex && !submitted
                      ? "bg-orange-500 text-white"
                      : "bg-slate-100 text-slate-500 hover:bg-orange-100 hover:text-orange-700"
                  }`}
                >
                  {index + 1}
                </Link>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Thông tin bài kiểm tra">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between rounded-xl bg-slate-50 p-3">
                <span className="text-slate-500">Số câu hỏi</span>
                <span className="font-bold">{questions.length}</span>
              </div>

              <div className="flex justify-between rounded-xl bg-slate-50 p-3">
                <span className="text-slate-500">Điểm đạt</span>
                <span className="font-bold">80%</span>
              </div>

              <div className="flex justify-between rounded-xl bg-slate-50 p-3">
                <span className="text-slate-500">Số lần làm</span>
                <span className="font-bold">1/3</span>
              </div>

              <div className="flex justify-between rounded-xl bg-slate-50 p-3">
                <span className="text-slate-500">Trạng thái</span>
                <span className="font-bold text-orange-600">
                  {submitted ? "Đã nộp" : "Đang làm"}
                </span>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Ghi chú">
            <p className="text-sm leading-6 text-slate-600">
              Trang quiz đang dùng điều hướng bằng URL để chuyển câu hỏi và
              chuyển sang chứng chỉ sau khi hoàn thành.
            </p>
          </SectionCard>
        </aside>
      </div>
    </AppShell>
  );
}