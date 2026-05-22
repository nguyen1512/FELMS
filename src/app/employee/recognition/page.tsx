import AppShell from "@/components/lms/AppShell";
import SectionCard from "@/components/lms/SectionCard";
import {
  Award,
  BadgeCheck,
  BookOpen,
  CheckCircle2,
  Flame,
  Gift,
  Medal,
  MessageSquareText,
  Sparkles,
  Star,
  Trophy,
  Zap,
} from "lucide-react";

const badges = [
  {
    title: "Hoàn thành Onboarding",
    desc: "Hoàn thành khóa hội nhập nội bộ",
    status: "Đã đạt",
    icon: BadgeCheck,
  },
  {
    title: "Học tập liên tục",
    desc: "Duy trì chuỗi học 7 ngày",
    status: "Đã đạt",
    icon: Flame,
  },
  {
    title: "Điểm Quiz xuất sắc",
    desc: "Đạt trên 90 điểm trong bài kiểm tra",
    status: "Đã đạt",
    icon: Star,
  },
  {
    title: "Chuyên gia CRM",
    desc: "Hoàn thành nhóm kỹ năng CRM nâng cao",
    status: "Đang mở khóa",
    icon: Zap,
  },
];

const recognitionHistory = [
  {
    title: "Được ghi nhận hoàn thành khóa AnU LMS",
    source: "Hệ thống LMS",
    date: "17/05/2026",
    points: "+120 điểm",
  },
  {
    title: "Quản lý khen thưởng tiến độ học tập tốt",
    source: "Trưởng phòng",
    date: "15/05/2026",
    points: "+80 điểm",
  },
  {
    title: "Đạt điểm cao trong bài kiểm tra CRM",
    source: "Quiz hệ thống",
    date: "12/05/2026",
    points: "+100 điểm",
  },
  {
    title: "Duy trì chuỗi học tập 5 ngày",
    source: "Gamification",
    date: "10/05/2026",
    points: "+50 điểm",
  },
];

function getBadgeStatusClass(status: string) {
  if (status === "Đã đạt") {
    return "bg-green-100 text-green-700 border border-green-200";
  }

  return "bg-orange-100 text-orange-700 border border-orange-200";
}

export default function EmployeeRecognitionPage() {
  return (
    <AppShell workspace="employee" title="Ghi nhận học tập">
      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-orange-600">
            Learning Recognition
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            Ghi nhận học tập
          </h1>

          <p className="mt-2 text-slate-500">
            Theo dõi thành tích, badge, điểm thưởng học tập và các ghi nhận từ
            hệ thống hoặc quản lý trong quá trình đào tạo nội bộ.
          </p>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Trophy className="text-orange-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">1.280</p>
            <p className="text-sm text-slate-500">Điểm học tập</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Award className="text-orange-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">8</p>
            <p className="text-sm text-slate-500">Badge đã đạt</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Flame className="text-orange-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">7 ngày</p>
            <p className="text-sm text-slate-500">Chuỗi học liên tục</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Medal className="text-green-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">Top 10</p>
            <p className="text-sm text-slate-500">Xếp hạng tháng</p>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_380px]">
          <SectionCard title="Badge học tập">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {badges.map((badge) => {
                const Icon = badge.icon;

                return (
                  <div
                    key={badge.title}
                    className="rounded-2xl border border-slate-200 bg-white p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
                        <Icon size={22} />
                      </div>

                      <span
                        className={`inline-flex min-w-[90px] items-center justify-center rounded-full px-3 py-1.5 text-xs font-bold whitespace-nowrap ${getBadgeStatusClass(
                          badge.status
                        )}`}
                      >
                        {badge.status}
                      </span>
                    </div>

                    <h3 className="mt-4 font-bold text-slate-950">
                      {badge.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {badge.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </SectionCard>

          <SectionCard title="Ghi nhận nổi bật">
            <div className="rounded-2xl bg-orange-50 p-5">
              <Sparkles className="text-orange-600" size={28} />

              <h3 className="mt-3 font-bold text-slate-950">
                Bạn đang duy trì phong độ học tập tốt
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Bạn đã duy trì chuỗi học tập 7 ngày và hoàn thành các khóa học
                bắt buộc đúng hạn. Hãy tiếp tục luyện tập để mở khóa badge
                Chuyên gia CRM.
              </p>
            </div>

            <div className="mt-4 space-y-3">
              {[
                "Hoàn thành 100% khóa hội nhập",
                "Đạt điểm quiz trên 90",
                "Duy trì học tập liên tục",
                "Được quản lý ghi nhận tiến độ tốt",
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

        <SectionCard title="Lịch sử ghi nhận">
          <div className="space-y-4">
            {recognitionHistory.map((item) => (
              <div
                key={`${item.title}-${item.date}`}
                className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 p-5 md:flex-row md:items-center"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                    <MessageSquareText size={20} />
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-950">{item.title}</h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {item.source} · {item.date}
                    </p>
                  </div>
                </div>

                <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-bold text-green-700">
                  {item.points}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Cách tăng điểm ghi nhận">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {[
              {
                icon: BookOpen,
                title: "Hoàn thành bài học",
                desc: "Hoàn thành mỗi bài học sẽ nhận điểm học tập.",
              },
              {
                icon: Star,
                title: "Đạt điểm cao",
                desc: "Quiz trên 90 điểm được ghi nhận thành tích xuất sắc.",
              },
              {
                icon: Flame,
                title: "Học liên tục",
                desc: "Duy trì chuỗi học mỗi ngày để mở khóa badge.",
              },
              {
                icon: Gift,
                title: "Nhận khen thưởng",
                desc: "Quản lý có thể ghi nhận nỗ lực học tập của bạn.",
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