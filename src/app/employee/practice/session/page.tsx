"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import AppShell from "@/components/lms/AppShell";
import SectionCard from "@/components/lms/SectionCard";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  FileQuestion,
  Send,
  Target,
} from "lucide-react";

const questions = [
  {
    question:
      "Khi phụ huynh phản hồi rằng lịch học không phù hợp, bước xử lý đầu tiên nên là gì?",
    options: [
      "Giải thích ngay rằng lịch đã cố định",
      "Lắng nghe nhu cầu và xác nhận lại vấn đề của phụ huynh",
      "Chuyển ngay cho quản lý",
      "Yêu cầu phụ huynh tự chọn lịch khác",
    ],
  },
  {
    question:
      "Nếu phụ huynh yêu cầu đổi lớp vì học viên theo không kịp, CM nên ưu tiên kiểm tra điều gì?",
    options: [
      "Số buổi học còn lại",
      "Điểm danh, nhận xét giáo viên và kết quả học gần nhất",
      "Học phí đã thanh toán",
      "Số lượng học viên trong lớp",
    ],
  },
  {
    question:
      "Cách phản hồi nào phù hợp nhất khi phụ huynh đang bức xúc?",
    options: [
      "Tranh luận để bảo vệ trung tâm",
      "Ghi nhận cảm xúc, xin phép kiểm tra thông tin và hẹn phản hồi rõ ràng",
      "Im lặng và chờ phụ huynh bình tĩnh",
      "Yêu cầu phụ huynh gửi email",
    ],
  },
];

export default function PracticeSessionPage() {
  const searchParams = useSearchParams();

  const title =
    searchParams.get("title") || "Tình huống: Phụ huynh phản hồi về lịch học";

  const skill = searchParams.get("skill") || "Xử lý phụ huynh";

  return (
    <AppShell workspace="employee" title="Làm bài luyện tập">
      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <Link
            href="/employee/practice"
            className="inline-flex items-center gap-2 text-sm font-bold text-orange-600"
          >
            <ArrowLeft size={17} />
            Quay lại luyện tập
          </Link>

          <p className="mt-4 text-sm font-semibold text-orange-600">
            Practice Session
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-950">{title}</h1>

          <p className="mt-2 text-slate-500">
            Kỹ năng luyện tập: <b>{skill}</b>
          </p>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <FileQuestion className="text-orange-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">3</p>
            <p className="text-sm text-slate-500">Câu hỏi luyện tập</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Clock3 className="text-orange-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">12p</p>
            <p className="text-sm text-slate-500">Thời gian gợi ý</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Target className="text-orange-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">80</p>
            <p className="text-sm text-slate-500">Điểm mục tiêu</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <CheckCircle2 className="text-green-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">0/3</p>
            <p className="text-sm text-slate-500">Đã trả lời</p>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
          <SectionCard title="Câu hỏi tình huống">
            <div className="space-y-5">
              {questions.map((item, index) => (
                <div
                  key={item.question}
                  className="rounded-2xl border border-slate-200 p-5"
                >
                  <p className="text-sm font-bold text-orange-600">
                    Câu {index + 1}/{questions.length}
                  </p>

                  <h3 className="mt-2 font-bold text-slate-950">
                    {item.question}
                  </h3>

                  <div className="mt-4 space-y-3">
                    {item.options.map((option, optionIndex) => (
                      <label
                        key={option}
                        className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-4 hover:border-orange-300 hover:bg-orange-50"
                      >
                        <input
                          type="radio"
                          name={`question-${index}`}
                          className="h-4 w-4 accent-orange-500"
                        />

                        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-sm font-bold">
                          {String.fromCharCode(65 + optionIndex)}
                        </span>

                        <span className="text-sm font-medium text-slate-700">
                          {option}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Thông tin bài luyện">
            <div className="space-y-3">
              {[
                ["Kỹ năng", skill],
                ["Cấp độ", "Trung cấp"],
                ["Điểm đạt", "80/100"],
                ["Ghi nhận", "Cập nhật radar năng lực"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between rounded-xl bg-slate-50 p-3"
                >
                  <span className="text-sm text-slate-500">{label}</span>
                  <span className="text-sm font-bold text-slate-950">
                    {value}
                  </span>
                </div>
              ))}
            </div>

            <Link
              href="/employee/practice"
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-white hover:bg-orange-600"
            >
              <Send size={18} />
              Nộp bài luyện tập
            </Link>
          </SectionCard>
        </div>
      </div>
    </AppShell>
  );
}