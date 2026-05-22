import AppShell from "@/components/lms/AppShell";
import SectionCard from "@/components/lms/SectionCard";
import {
  Award,
  BookOpen,
  CheckCircle2,
  Clock3,
  Flag,
  GraduationCap,
  Lock,
  PlayCircle,
  Route,
  Target,
} from "lucide-react";

const pathCourses = [
  {
    title: "Khóa 1: Hội nhập hệ thống AnU LMS",
    desc: "Làm quen hệ thống học tập, quy định và cách nhận chứng chỉ.",
    progress: 100,
    status: "Hoàn thành",
    lessons: 12,
  },
  {
    title: "Khóa 2: Quy trình vận hành CRM",
    desc: "Nắm luồng CRM, cập nhật thông tin học viên và xử lý dữ liệu.",
    progress: 72,
    status: "Đang học",
    lessons: 18,
  },
  {
    title: "Khóa 3: Tư vấn và chăm sóc học viên",
    desc: "Rèn luyện kỹ năng tư vấn, phản hồi và theo sát tiến độ học viên.",
    progress: 0,
    status: "Chưa mở",
    lessons: 15,
  },
  {
    title: "Khóa 4: Kiểm tra cuối lộ trình",
    desc: "Hoàn thành bài đánh giá tổng hợp để nhận chứng chỉ lộ trình.",
    progress: 0,
    status: "Khóa",
    lessons: 1,
  },
];

function getStatusClass(status: string) {
  if (status === "Hoàn thành") {
    return "bg-green-100 text-green-700 border border-green-200";
  }

  if (status === "Đang học") {
    return "bg-orange-100 text-orange-700 border border-orange-200";
  }

  return "bg-slate-100 text-slate-600 border border-slate-200";
}

function getIcon(status: string) {
  if (status === "Hoàn thành") return CheckCircle2;
  if (status === "Đang học") return PlayCircle;
  if (status === "Chưa mở") return Flag;
  return Lock;
}

export default function EmployeeLearningPathPage() {
  return (
    <AppShell workspace="employee" title="Lộ trình học tập">
      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-orange-600">
            Learning Path
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            Lộ trình học tập cá nhân
          </h1>

          <p className="mt-2 text-slate-500">
            Theo dõi các khóa học theo thứ tự, điều kiện mở khóa, tiến độ hoàn
            thành và mục tiêu chứng chỉ của bạn.
          </p>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Route className="text-orange-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">4</p>
            <p className="text-sm text-slate-500">Khóa trong lộ trình</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <CheckCircle2 className="text-green-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">1</p>
            <p className="text-sm text-slate-500">Đã hoàn thành</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Clock3 className="text-orange-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">72%</p>
            <p className="text-sm text-slate-500">Tiến độ hiện tại</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Award className="text-orange-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">1</p>
            <p className="text-sm text-slate-500">Chứng chỉ mục tiêu</p>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_380px]">
          <SectionCard title="Các bước trong lộ trình">
            <div className="relative ml-2 space-y-6 border-l-2 border-dashed border-slate-200 pl-8">
              {pathCourses.map((course, index) => {
                const Icon = getIcon(course.status);

                return (
                  <div key={course.title} className="relative">
                    <div className="absolute -left-[44px] top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">
                        {index + 1}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5">
                      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-start">
                        <div>
                          <span
                            className={`inline-flex min-w-[90px] items-center justify-center rounded-full px-3 py-1.5 text-xs font-bold whitespace-nowrap ${getStatusClass(
                              course.status
                            )}`}
                          >
                            {course.status}
                          </span>

                          <h3 className="mt-3 text-lg font-bold text-slate-950">
                            {course.title}
                          </h3>

                          <p className="mt-2 text-sm leading-6 text-slate-500">
                            {course.desc}
                          </p>
                        </div>

                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
                          <Icon size={22} />
                        </div>
                      </div>

                      <div className="mt-5">
                        <div className="mb-2 flex justify-between text-sm">
                          <span className="text-slate-500">
                            {course.lessons} bài học
                          </span>
                          <span className="font-bold text-orange-600">
                            {course.progress}%
                          </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-orange-500"
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                      </div>

                      <button
                        className={`mt-5 flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold ${
                          course.status === "Khóa" ||
                          course.status === "Chưa mở"
                            ? "bg-slate-100 text-slate-400"
                            : "bg-orange-500 text-white hover:bg-orange-600"
                        }`}
                      >
                        {course.status === "Hoàn thành"
                          ? "Xem lại khóa học"
                          : course.status === "Đang học"
                          ? "Tiếp tục học"
                          : "Chưa thể học"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>

          <SectionCard title="Mục tiêu lộ trình">
            <div className="rounded-2xl bg-orange-50 p-5">
              <Target className="text-orange-600" size={28} />

              <h3 className="mt-3 font-bold text-slate-950">
                Mục tiêu: Chứng chỉ vận hành LMS & CRM
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Hoàn thành đầy đủ các khóa học theo thứ tự để mở khóa bài kiểm
                tra cuối lộ trình và nhận chứng chỉ nội bộ.
              </p>

              <div className="mt-5 h-3 overflow-hidden rounded-full bg-white">
                <div className="h-full w-[43%] rounded-full bg-orange-500" />
              </div>

              <p className="mt-3 text-sm font-bold text-orange-700">
                Hoàn thành 43% toàn lộ trình
              </p>
            </div>

            <div className="mt-4 space-y-3">
              {[
                "Hoàn thành từng khóa theo đúng thứ tự",
                "Mỗi quiz cần đạt tối thiểu 80 điểm",
                "Khóa tiếp theo mở khi hoàn thành khóa trước",
                "Chứng chỉ cấp sau bài kiểm tra cuối lộ trình",
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

        <SectionCard title="Gợi ý học tập tiếp theo">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              {
                icon: BookOpen,
                title: "Hoàn thành khóa CRM",
                desc: "Bạn còn 28% nội dung cần hoàn thành.",
              },
              {
                icon: GraduationCap,
                title: "Làm quiz cuối khóa",
                desc: "Điểm quiz cần đạt tối thiểu 80/100.",
              },
              {
                icon: Award,
                title: "Nhận chứng chỉ",
                desc: "Chứng chỉ được cấp sau khi hoàn thành toàn bộ lộ trình.",
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