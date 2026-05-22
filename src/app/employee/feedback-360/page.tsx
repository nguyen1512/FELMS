import AppShell from "@/components/lms/AppShell";
import SectionCard from "@/components/lms/SectionCard";
import {
  Brain,
  CheckCircle2,
  MessageSquareText,
  Star,
  Target,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";

const skillFeedback = [
  { skill: "CRM & vận hành", score: 86 },
  { skill: "Tư vấn học viên", score: 78 },
  { skill: "Xử lý phụ huynh", score: 72 },
  { skill: "Phối hợp nội bộ", score: 84 },
  { skill: "Kỷ luật học tập", score: 90 },
];

const feedbackSources = [
  {
    source: "Quản lý trực tiếp",
    score: 86,
    comment: "Nắm quy trình tốt, cần cải thiện tốc độ xử lý tình huống khó.",
  },
  {
    source: "Đồng nghiệp",
    score: 82,
    comment: "Phối hợp tốt, phản hồi nhanh và hỗ trợ nhóm tích cực.",
  },
  {
    source: "Tự đánh giá",
    score: 78,
    comment: "Cần luyện thêm kỹ năng xử lý phụ huynh và quản lý áp lực.",
  },
];

export default function EmployeeFeedback360Page() {
  return (
    <AppShell workspace="employee" title="Đánh giá 360">
      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-orange-600">
            360 Feedback
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            Đánh giá 360 cá nhân
          </h1>

          <p className="mt-2 text-slate-500">
            Tổng hợp đánh giá từ quản lý, đồng nghiệp và tự đánh giá để xác định
            điểm mạnh, điểm cần cải thiện và mục tiêu phát triển tiếp theo.
          </p>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Star className="text-orange-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">83</p>
            <p className="text-sm text-slate-500">Điểm đánh giá TB</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <UserCheck className="text-green-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">86</p>
            <p className="text-sm text-slate-500">Quản lý đánh giá</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Users className="text-orange-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">82</p>
            <p className="text-sm text-slate-500">Đồng nghiệp đánh giá</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <TrendingUp className="text-green-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">+9%</p>
            <p className="text-sm text-slate-500">Cải thiện quý này</p>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_380px]">
          <SectionCard title="Điểm theo từng kỹ năng">
            <div className="space-y-4">
              {skillFeedback.map((item) => (
                <div
                  key={item.skill}
                  className="rounded-2xl border border-slate-200 p-5"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-bold text-slate-950">{item.skill}</h3>

                    <span className="font-bold text-orange-600">
                      {item.score}/100
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-orange-500"
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Tổng quan đánh giá">
            <div className="rounded-2xl bg-orange-50 p-5">
              <Brain className="text-orange-600" size={28} />

              <h3 className="mt-3 font-bold text-slate-950">
                Năng lực nổi bật
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Bạn đang có điểm mạnh ở kỷ luật học tập, CRM & vận hành và phối
                hợp nội bộ. Kỹ năng cần ưu tiên cải thiện là xử lý phụ huynh.
              </p>
            </div>

            <div className="mt-4 space-y-3">
              {[
                "Tiếp tục duy trì thói quen học đều",
                "Luyện thêm tình huống phụ huynh khó",
                "Hoàn thành khóa CRM nâng cao",
                "Trao đổi định kỳ với quản lý trực tiếp",
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
          </SectionCard>
        </div>

        <SectionCard title="Nguồn đánh giá">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            {feedbackSources.map((item) => (
              <div
                key={item.source}
                className="rounded-2xl border border-slate-200 bg-white p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
                    <MessageSquareText size={22} />
                  </div>

                  <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
                    {item.score}/100
                  </span>
                </div>

                <h3 className="mt-4 text-lg font-bold text-slate-950">
                  {item.source}
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  {item.comment}
                </p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Mục tiêu sau đánh giá">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {[
              {
                icon: Target,
                title: "Xử lý phụ huynh",
                desc: "Tăng từ 72 lên 82 điểm trong quý tới.",
              },
              {
                icon: Brain,
                title: "CRM nâng cao",
                desc: "Hoàn thành khóa vận hành CRM nâng cao.",
              },
              {
                icon: Users,
                title: "Phối hợp nhóm",
                desc: "Chủ động hỗ trợ các tình huống trong team.",
              },
              {
                icon: TrendingUp,
                title: "Tiến bộ liên tục",
                desc: "Duy trì tối thiểu 2 bài luyện tập mỗi tuần.",
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