"use client";

import Link from "next/link";
import AppShell from "@/components/lms/AppShell";
import SectionCard from "@/components/lms/SectionCard";
import {
  AlarmClock,
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
  Send,
} from "lucide-react";

const questions = [
  {
    question: "Mục tiêu chính của hệ thống LMS nội bộ là gì?",
    options: [
      "Quản lý bán hàng",
      "Theo dõi học tập và đào tạo nhân sự",
      "Quản lý kho",
      "Thiết kế website",
    ],
  },
  {
    question: "Điều kiện để nhận chứng chỉ là gì?",
    options: [
      "Đăng nhập đủ 7 ngày",
      "Hoàn thành khóa học và đạt điểm yêu cầu",
      "Chỉ cần xem video",
      "Không cần quiz",
    ],
  },
  {
    question: "CRM dùng để làm gì?",
    options: [
      "Quản lý khách hàng",
      "Thiết kế hình ảnh",
      "Lưu video",
      "Quản lý wifi",
    ],
  },
];

export default function ExamSessionPage() {
  return (
    <AppShell workspace="employee" title="Làm bài thi">
      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <Link
            href="/employee/exams"
            className="inline-flex items-center gap-2 text-sm font-bold text-orange-600"
          >
            <ArrowLeft size={16} />
            Quay lại danh sách bài thi
          </Link>

          <p className="mt-4 text-sm font-semibold text-orange-600">
            Examination Session
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            Quiz quy trình CRM
          </h1>

          <p className="mt-2 text-slate-500">
            Hoàn thành toàn bộ câu hỏi để hệ thống ghi nhận kết quả bài thi.
          </p>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <ClipboardCheck className="text-orange-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">15</p>
            <p className="text-sm text-slate-500">Số câu hỏi</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <AlarmClock className="text-orange-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">20 phút</p>
            <p className="text-sm text-slate-500">Thời gian thi</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <CheckCircle2 className="text-green-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">80</p>
            <p className="text-sm text-slate-500">Điểm đạt</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Send className="text-orange-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">0/15</p>
            <p className="text-sm text-slate-500">Đã trả lời</p>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
          <SectionCard title="Nội dung bài thi">
            <div className="space-y-6">
              {questions.map((item, index) => (
                <div
                  key={item.question}
                  className="rounded-2xl border border-slate-200 p-5"
                >
                  <p className="text-sm font-bold text-orange-600">
                    Câu {index + 1}
                  </p>

                  <h3 className="mt-2 text-lg font-bold text-slate-950">
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

          <SectionCard title="Thông tin bài thi">
            <div className="space-y-3">
              {[
                ["Môn thi", "Quy trình CRM"],
                ["Số câu", "15 câu"],
                ["Điểm đạt", "80 điểm"],
                ["Hình thức", "Trắc nghiệm"],
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
              href="/employee/exams/result"
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-white hover:bg-orange-600"
            >
              <Send size={18} />
              Nộp bài thi
            </Link>
          </SectionCard>
        </div>
      </div>
    </AppShell>
  );
}