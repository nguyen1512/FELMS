import Link from "next/link";
import AppShell from "@/components/lms/AppShell";
import SectionCard from "@/components/lms/SectionCard";
import {
  Award,
  CheckCircle2,
  Download,
  RotateCcw,
  Trophy,
} from "lucide-react";

export default function EmployeeExamResultPage() {
  return (
    <AppShell workspace="employee" title="Kết quả bài thi">
      <div className="relative space-y-6 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 z-10">
          {Array.from({ length: 36 }).map((_, index) => (
            <span
              key={index}
              className="absolute top-[-20px] h-3 w-2 animate-[confetti_3s_ease-in-out_infinite] rounded-sm"
              style={{
                left: `${(index * 7) % 100}%`,
                animationDelay: `${index * 0.08}s`,
                backgroundColor:
                  index % 4 === 0
                    ? "#f97316"
                    : index % 4 === 1
                    ? "#22c55e"
                    : index % 4 === 2
                    ? "#3b82f6"
                    : "#eab308",
              }}
            />
          ))}
        </div>

        <style>
          {`
            @keyframes confetti {
              0% { transform: translateY(0) rotate(0deg); opacity: 1; }
              100% { transform: translateY(760px) rotate(720deg); opacity: 0; }
            }
          `}
        </style>

        <section className="relative rounded-2xl border border-green-200 bg-green-50 p-8 shadow-sm">
          <CheckCircle2 className="text-green-600" size={44} />

          <h1 className="mt-4 text-4xl font-bold text-slate-950">
            Chúc mừng! Bạn đã hoàn thành bài thi
          </h1>

          <p className="mt-3 text-lg text-slate-600">
            Kết quả đã được ghi nhận vào hồ sơ học tập và đủ điều kiện xét chứng
            chỉ.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="rounded-2xl bg-white p-5">
              <p className="text-sm text-slate-500">Điểm số</p>
              <p className="mt-2 text-4xl font-bold text-orange-600">90</p>
            </div>

            <div className="rounded-2xl bg-white p-5">
              <p className="text-sm text-slate-500">Kết quả</p>
              <p className="mt-2 text-2xl font-bold text-green-600">Đạt</p>
            </div>

            <div className="rounded-2xl bg-white p-5">
              <p className="text-sm text-slate-500">Số câu đúng</p>
              <p className="mt-2 text-2xl font-bold text-slate-950">13/15</p>
            </div>

            <div className="rounded-2xl bg-white p-5">
              <p className="text-sm text-slate-500">Thời gian</p>
              <p className="mt-2 text-2xl font-bold text-slate-950">
                16 phút
              </p>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_380px]">
          <SectionCard title="Bảng trả kết quả thi">
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-slate-500">
                  <tr>
                    <th className="p-4">Nội dung</th>
                    <th className="p-4">Kết quả</th>
                    <th className="p-4">Ghi nhận</th>
                  </tr>
                </thead>

                <tbody>
                  {[
                    ["Tổng số câu hỏi", "15 câu", "Hoàn thành"],
                    ["Số câu đúng", "13 câu", "Tốt"],
                    ["Số câu sai", "2 câu", "Cần xem lại"],
                    ["Điểm đạt yêu cầu", "80 điểm", "Đạt"],
                    ["Điểm của bạn", "90 điểm", "Xuất sắc"],
                    ["Trạng thái chứng chỉ", "Đủ điều kiện", "Có thể nhận"],
                  ].map(([label, value, note]) => (
                    <tr key={label} className="border-t border-slate-100">
                      <td className="p-4 font-bold text-slate-950">{label}</td>
                      <td className="p-4 text-orange-600 font-bold">{value}</td>
                      <td className="p-4 text-slate-600">{note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>

          <SectionCard title="Thao tác sau bài thi">
            <div className="space-y-3">
              <Link
                href="/certificate"
                className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-white hover:bg-orange-600"
              >
                <Award size={18} />
                Nhận chứng chỉ
              </Link>

              <button className="flex items-center justify-center gap-2 rounded-xl border border-orange-200 px-4 py-3 text-sm font-bold text-orange-600 hover:bg-orange-50">
                <Download size={18} />
                Tải kết quả PDF
              </button>

              <Link
                href="/employee/exams/session"
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                <RotateCcw size={18} />
                Làm lại bài thi
              </Link>

              <Link
                href="/employee/exams"
                className="flex items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white hover:bg-slate-700"
              >
                Quay lại danh sách bài thi
              </Link>
            </div>
          </SectionCard>
        </div>

        <SectionCard title="Thành tích đạt được">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              {
                title: "Đạt điều kiện chứng chỉ",
                desc: "Bạn đã đạt trên 80 điểm yêu cầu.",
                icon: Award,
              },
              {
                title: "Kết quả xuất sắc",
                desc: "Điểm số thuộc nhóm hoàn thành tốt.",
                icon: Trophy,
              },
              {
                title: "Cập nhật hồ sơ",
                desc: "Kết quả đã được lưu vào hồ sơ học tập.",
                icon: CheckCircle2,
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-2xl border border-slate-200 bg-white p-5"
                >
                  <Icon className="text-orange-600" size={24} />

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