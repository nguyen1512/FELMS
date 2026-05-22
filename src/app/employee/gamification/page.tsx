import AppShell from "@/components/lms/AppShell";
import SectionCard from "@/components/lms/SectionCard";
import {
  Award,
  BadgeCheck,
  Crown,
  Flame,
  Gift,
  Medal,
  Rocket,
  Star,
  Target,
  Trophy,
  Zap,
} from "lucide-react";

const badges = [
  {
    title: "Người học chăm chỉ",
    desc: "Duy trì học tập 7 ngày liên tục",
    status: "Đã đạt",
    icon: Flame,
  },
  {
    title: "Quiz Master",
    desc: "Đạt trên 90 điểm trong bài kiểm tra",
    status: "Đã đạt",
    icon: Star,
  },
  {
    title: "Hoàn thành khóa học",
    desc: "Hoàn thành 100% khóa học bắt buộc",
    status: "Đã đạt",
    icon: BadgeCheck,
  },
  {
    title: "Chuyên gia CRM",
    desc: "Hoàn thành toàn bộ lộ trình CRM",
    status: "Đang mở khóa",
    icon: Crown,
  },
];

const leaderboard = [
  { rank: 1, name: "Nguyễn Thị Mai", points: 1680, badge: "Xuất sắc" },
  { rank: 2, name: "Trần Minh Anh", points: 1520, badge: "Tích cực" },
  { rank: 3, name: "AnU Demo", points: 1280, badge: "Đang tiến bộ" },
  { rank: 4, name: "Lê Hoàng Nam", points: 1190, badge: "Ổn định" },
];

function getStatusClass(status: string) {
  if (status === "Đã đạt") {
    return "bg-green-100 text-green-700 border border-green-200";
  }

  return "bg-orange-100 text-orange-700 border border-orange-200";
}

export default function EmployeeGamificationPage() {
  return (
    <AppShell workspace="employee" title="Gamification">
      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-orange-600">
            Learning Gamification
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            Gamification học tập
          </h1>

          <p className="mt-2 text-slate-500">
            Theo dõi điểm thưởng, huy hiệu, chuỗi học tập, nhiệm vụ hằng tuần và
            bảng xếp hạng học viên trong hệ thống LMS.
          </p>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Trophy className="text-orange-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">1.280</p>
            <p className="text-sm text-slate-500">Điểm thưởng</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Award className="text-orange-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">8</p>
            <p className="text-sm text-slate-500">Huy hiệu</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Flame className="text-orange-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">7 ngày</p>
            <p className="text-sm text-slate-500">Chuỗi học tập</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Medal className="text-green-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">#3</p>
            <p className="text-sm text-slate-500">Xếp hạng cá nhân</p>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_380px]">
          <SectionCard title="Nhiệm vụ tuần này">
            <div className="space-y-4">
              {[
                {
                  title: "Hoàn thành 3 bài học",
                  progress: 66,
                  reward: "+80 điểm",
                },
                {
                  title: "Làm 2 bài quiz",
                  progress: 50,
                  reward: "+100 điểm",
                },
                {
                  title: "Duy trì học 5 ngày liên tục",
                  progress: 100,
                  reward: "+150 điểm",
                },
                {
                  title: "Đạt điểm quiz trên 90",
                  progress: 100,
                  reward: "+120 điểm",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-slate-200 p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-slate-950">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-sm text-orange-600">
                        Phần thưởng: {item.reward}
                      </p>
                    </div>

                    <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
                      {item.progress}%
                    </span>
                  </div>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-orange-500"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Cấp độ học viên">
            <div className="rounded-2xl bg-orange-50 p-5">
              <Rocket className="text-orange-600" size={32} />

              <h3 className="mt-3 text-2xl font-bold text-slate-950">
                Level 4 - Active Learner
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Bạn cần thêm 220 điểm để lên Level 5 và mở khóa huy hiệu
                “Learning Champion”.
              </p>

              <div className="mt-5">
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-slate-500">Tiến độ lên cấp</span>
                  <span className="font-bold text-orange-600">78%</span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-white">
                  <div className="h-full w-[78%] rounded-full bg-orange-500" />
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 p-5">
              <Gift className="text-orange-600" size={24} />

              <h3 className="mt-3 font-bold text-slate-950">
                Phần thưởng tiếp theo
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Hoàn thành thêm 1 quiz để nhận 100 điểm và 1 badge mới.
              </p>
            </div>
          </SectionCard>
        </div>

        <SectionCard title="Huy hiệu đã đạt">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
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
                      className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusClass(
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

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_380px]">
          <SectionCard title="Bảng xếp hạng học tập">
            <div className="space-y-3">
              {leaderboard.map((item) => (
                <div
                  key={item.name}
                  className={`flex items-center justify-between rounded-2xl border p-4 ${
                    item.name === "AnU Demo"
                      ? "border-orange-300 bg-orange-50"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 font-bold text-orange-600">
                      #{item.rank}
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-950">{item.name}</h3>
                      <p className="text-sm text-slate-500">{item.badge}</p>
                    </div>
                  </div>

                  <span className="font-bold text-orange-600">
                    {item.points}
                  </span>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Cách kiếm thêm điểm">
            <div className="space-y-3">
              {[
                {
                  icon: BookOpenIcon,
                  title: "Hoàn thành bài học",
                  desc: "+20 điểm mỗi bài",
                },
                {
                  icon: Target,
                  title: "Làm quiz đạt điểm cao",
                  desc: "+100 điểm nếu đạt từ 90",
                },
                {
                  icon: Zap,
                  title: "Duy trì streak",
                  desc: "+50 điểm mỗi mốc liên tục",
                },
                {
                  icon: Star,
                  title: "Nhận ghi nhận",
                  desc: "+80 điểm từ quản lý",
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="flex items-start gap-3 rounded-xl bg-slate-50 p-4"
                  >
                    <Icon className="mt-0.5 shrink-0 text-orange-600" size={20} />

                    <div>
                      <h3 className="font-bold text-slate-950">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>
        </div>
      </div>
    </AppShell>
  );
}

function BookOpenIcon({
  className,
  size,
}: {
  className?: string;
  size?: number;
}) {
  return <Award className={className} size={size} />;
}