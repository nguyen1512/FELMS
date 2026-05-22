import Link from "next/link";
import AppShell from "@/components/lms/AppShell";
import SectionCard from "@/components/lms/SectionCard";
import {
  AlertTriangle,
  Brain,
  CheckCircle2,
  PlayCircle,
  Target,
} from "lucide-react";

export default function WeakestSkillPage() {
  return (
    <AppShell workspace="employee" title="Kỹ năng cần rèn luyện">
      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-orange-600">
            Weakest Skill Focus
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            Kỹ năng yếu nhất cần rèn luyện
          </h1>

          <p className="mt-2 text-slate-500">
            Hệ thống xác định kỹ năng cần ưu tiên dựa trên điểm radar năng lực
            và kết quả luyện tập gần đây.
          </p>
        </section>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_380px]">
          <SectionCard title="Kỹ năng ưu tiên: Xử lý phụ huynh">
            <div className="rounded-2xl bg-red-50 p-6">
              <AlertTriangle className="text-red-600" size={30} />

              <h2 className="mt-4 text-2xl font-bold text-slate-950">
                Xử lý phụ huynh
              </h2>

              <p className="mt-2 text-slate-600">
                Đây là kỹ năng có điểm thấp nhất trong 4 nhóm năng lực hiện tại.
              </p>

              <div className="mt-5">
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-slate-600">Điểm hiện tại</span>
                  <span className="font-bold text-red-600">68%</span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-white">
                  <div className="h-full w-[68%] rounded-full bg-red-500" />
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
              {[
                "Phản hồi khi phụ huynh không hài lòng",
                "Giải thích lịch học và tiến độ học viên",
                "Xử lý tình huống học viên nghỉ nhiều",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-slate-200 p-4"
                >
                  <Target className="text-orange-600" size={22} />
                  <p className="mt-3 font-bold text-slate-950">{item}</p>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Kế hoạch cải thiện">
            <div className="space-y-3">
              {[
                "Làm 3 bài tình huống phụ huynh",
                "Đạt tối thiểu 80 điểm mỗi bài luyện",
                "Xem lại lỗi sai sau khi hoàn thành",
                "Cập nhật điểm vào radar năng lực",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-xl bg-slate-50 p-3"
                >
                  <CheckCircle2
                    className="mt-0.5 shrink-0 text-green-600"
                    size={18}
                  />
                  <p className="text-sm font-medium leading-6 text-slate-700">
                    {item}
                  </p>
                </div>
              ))}
            </div>

            <Link
              href="/employee/practice/session?title=Tình huống: Phụ huynh phản hồi về lịch học&skill=Xử lý phụ huynh"
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-white hover:bg-orange-600"
            >
              <PlayCircle size={18} />
              Bắt đầu bài luyện đầu tiên
            </Link>
          </SectionCard>
        </div>

        <SectionCard title="Bài luyện đề xuất theo kỹ năng yếu">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              "Phụ huynh phản hồi về lịch học",
              "Phụ huynh yêu cầu đổi giáo viên",
              "Phụ huynh thắc mắc tiến độ học viên",
            ].map((title) => (
              <Link
                key={title}
                href={`/employee/practice/session?title=${encodeURIComponent(
                  title
                )}&skill=${encodeURIComponent("Xử lý phụ huynh")}`}
                className="rounded-2xl border border-slate-200 p-5 hover:border-orange-300 hover:bg-orange-50"
              >
                <Brain className="text-orange-600" size={22} />
                <h3 className="mt-3 font-bold text-slate-950">{title}</h3>
                <p className="mt-2 text-sm text-slate-500">
                  Bài luyện tình huống thực tế dành cho đội CM.
                </p>
              </Link>
            ))}
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}