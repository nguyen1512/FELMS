import AppShell from "@/components/lms/AppShell";
import ProgressBar from "@/components/lms/ProgressBar";
import SectionCard from "@/components/lms/SectionCard";
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  Clock3,
  Download,
  Moon,
  Search,
  Sun,
  Timer,
  TrendingUp,
  Users,
} from "lucide-react";

const departmentStudyTime = [
  {
    department: "Chăm sóc học viên",
    learners: 42,
    totalHours: 386,
    avgHours: 9.2,
    progress: 76,
  },
  {
    department: "Kinh doanh",
    learners: 55,
    totalHours: 452,
    avgHours: 8.2,
    progress: 68,
  },
  {
    department: "Đào tạo",
    learners: 24,
    totalHours: 318,
    avgHours: 13.2,
    progress: 88,
  },
  {
    department: "Nhân sự",
    learners: 18,
    totalHours: 142,
    avgHours: 7.9,
    progress: 62,
  },
];

const learnerStudyTime = [
  {
    name: "Nguyễn Thị Mai",
    department: "Chăm sóc học viên",
    hours: 42.5,
    lessons: 48,
    lastStudy: "Hôm nay",
    status: "Tích cực",
  },
  {
    name: "Trần Minh Anh",
    department: "Kinh doanh",
    hours: 38.2,
    lessons: 42,
    lastStudy: "Hôm qua",
    status: "Tích cực",
  },
  {
    name: "Lê Hoàng Nam",
    department: "Đào tạo",
    hours: 35.8,
    lessons: 39,
    lastStudy: "2 ngày trước",
    status: "Ổn định",
  },
  {
    name: "Đỗ Minh Quân",
    department: "Chăm sóc học viên",
    hours: 6.4,
    lessons: 8,
    lastStudy: "9 ngày trước",
    status: "Cần nhắc",
  },
];

const courseStudyTime = [
  {
    course: "Hướng dẫn sử dụng hệ thống AnU LMS",
    hours: 428,
    learners: 242,
    avg: 1.8,
    progress: 82,
  },
  {
    course: "Quy trình vận hành CRM cho đội CM",
    hours: 286,
    learners: 32,
    avg: 8.9,
    progress: 64,
  },
  {
    course: "Đào tạo hội nhập nhân viên mới",
    hours: 214,
    learners: 48,
    avg: 4.4,
    progress: 78,
  },
];

const timeFrames = [
  {
    label: "08:00 - 10:00",
    value: 42,
    note: "Khung giờ học cao nhất",
  },
  {
    label: "10:00 - 12:00",
    value: 36,
    note: "Tập trung học buổi sáng",
  },
  {
    label: "14:00 - 16:00",
    value: 28,
    note: "Học sau giờ vận hành chính",
  },
  {
    label: "20:00 - 22:00",
    value: 18,
    note: "Học ngoài giờ làm việc",
  },
];

function getStatusClass(status: string) {
  if (status === "Tích cực") {
    return "bg-green-100 text-green-700 border border-green-200";
  }

  if (status === "Ổn định") {
    return "bg-orange-100 text-orange-700 border border-orange-200";
  }

  return "bg-red-100 text-red-700 border border-red-200";
}

export default function LMSAdminReportStudyTimePage() {
  return (
    <AppShell workspace="lms-admin" title="Thời gian học tập">
      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
            <div>
              <p className="text-sm font-semibold text-orange-600">
                Study Time Analytics
              </p>

              <h1 className="mt-2 text-3xl font-bold text-slate-950">
                Báo cáo thời gian học tập
              </h1>

              <p className="mt-2 text-slate-500">
                Theo dõi thời lượng học của nhân viên theo phòng ban, khóa học,
                khung giờ và mức độ duy trì học tập.
              </p>
            </div>

            <button className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-600">
              <Download size={18} />
              Xuất báo cáo
            </button>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Clock3 className="text-orange-600" size={24} />

            <p className="mt-3 text-3xl font-bold text-slate-950">
              1.248h
            </p>

            <p className="text-sm text-slate-500">Tổng thời gian học</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Users className="text-orange-600" size={24} />

            <p className="mt-3 text-3xl font-bold text-slate-950">242</p>

            <p className="text-sm text-slate-500">Nhân sự có hoạt động học</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Timer className="text-orange-600" size={24} />

            <p className="mt-3 text-3xl font-bold text-slate-950">8.6h</p>

            <p className="text-sm text-slate-500">Giờ học trung bình/người</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <TrendingUp className="text-orange-600" size={24} />

            <p className="mt-3 text-3xl font-bold text-slate-950">+18%</p>

            <p className="text-sm text-slate-500">Tăng so với tháng trước</p>
          </div>
        </section>

        <SectionCard title="Bộ lọc thời gian học">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_200px_200px_200px]">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <Search size={18} className="text-slate-400" />

              <input
                placeholder="Tìm nhân viên, phòng ban hoặc khóa học..."
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>

            <select className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none">
              <option>7 ngày gần đây</option>
              <option>Tháng này</option>
              <option>Quý này</option>
              <option>Năm nay</option>
            </select>

            <select className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none">
              <option>Tất cả phòng ban</option>
              <option>Chăm sóc học viên</option>
              <option>Kinh doanh</option>
              <option>Đào tạo</option>
              <option>Nhân sự</option>
            </select>

            <select className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none">
              <option>Tất cả trạng thái</option>
              <option>Tích cực</option>
              <option>Ổn định</option>
              <option>Cần nhắc</option>
            </select>
          </div>
        </SectionCard>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <SectionCard title="Thời gian học theo phòng ban">
            <div className="space-y-4">
              {departmentStudyTime.map((item) => (
                <div
                  key={item.department}
                  className="rounded-2xl border border-slate-200 p-5"
                >
                  <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                    <div>
                      <h3 className="font-bold text-slate-950">
                        {item.department}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        {item.learners} nhân sự · Tổng {item.totalHours} giờ ·
                        TB {item.avgHours} giờ/người
                      </p>
                    </div>

                    <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-bold text-orange-700">
                      {item.progress}%
                    </span>
                  </div>

                  <div className="mt-4">
                    <ProgressBar value={item.progress} />
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Khung giờ học nhiều nhất">
            <div className="space-y-4">
              {timeFrames.map((item, index) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-slate-200 p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-sm font-bold text-orange-600">
                      #{index + 1}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="font-bold text-slate-950">
                          {item.label}
                        </h3>

                        <span className="font-bold text-orange-600">
                          {item.value}%
                        </span>
                      </div>

                      <p className="mt-1 text-sm text-slate-500">
                        {item.note}
                      </p>

                      <div className="mt-3">
                        <ProgressBar value={item.value} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_1fr]">
          <SectionCard title="Thời gian học theo khóa học">
            <div className="space-y-4">
              {courseStudyTime.map((item) => (
                <div
                  key={item.course}
                  className="rounded-2xl border border-slate-200 p-5"
                >
                  <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                    <div>
                      <h3 className="font-bold text-slate-950">
                        {item.course}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        {item.learners} học viên · Tổng {item.hours} giờ · TB{" "}
                        {item.avg} giờ/người
                      </p>
                    </div>

                    <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-bold text-orange-700">
                      {item.progress}%
                    </span>
                  </div>

                  <div className="mt-4">
                    <ProgressBar value={item.progress} />
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Nhân sự theo thời gian học">
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-slate-500">
                  <tr>
                    <th className="p-4">Nhân sự</th>
                    <th className="p-4">Phòng ban</th>
                    <th className="p-4">Giờ học</th>
                    <th className="p-4">Bài học</th>
                    <th className="p-4">Trạng thái</th>
                  </tr>
                </thead>

                <tbody>
                  {learnerStudyTime.map((item) => (
                    <tr
                      key={item.name}
                      className="border-t border-slate-100"
                    >
                      <td className="p-4">
                        <p className="font-bold text-slate-950">
                          {item.name}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Học gần nhất: {item.lastStudy}
                        </p>
                      </td>

                      <td className="p-4 text-slate-600">
                        {item.department}
                      </td>

                      <td className="p-4 font-bold text-orange-600">
                        {item.hours}h
                      </td>

                      <td className="p-4 font-semibold">
                        {item.lessons}
                      </td>

                      <td className="p-4">
                        <span
                          className={`inline-flex min-w-[90px] items-center justify-center rounded-full px-3 py-1.5 text-xs font-bold whitespace-nowrap ${getStatusClass(
                            item.status
                          )}`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </div>

        <SectionCard title="Gợi ý vận hành từ dữ liệu thời gian học">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {[
              {
                icon: Sun,
                title: "Ưu tiên buổi sáng",
                desc: "Khung 08:00 - 10:00 có tỷ lệ học cao nhất.",
              },
              {
                icon: Moon,
                title: "Học ngoài giờ",
                desc: "Một nhóm nhân viên học vào 20:00 - 22:00.",
              },
              {
                icon: BookOpen,
                title: "Khóa cần rút gọn",
                desc: "Khóa có thời lượng cao nhưng hoàn thành thấp cần tối ưu.",
              },
              {
                icon: BarChart3,
                title: "Nhắc học tự động",
                desc: "Nhân sự không học trong 7 ngày nên được nhắc lại.",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-2xl border border-slate-200 p-4"
                >
                  <Icon className="text-orange-600" size={22} />

                  <h3 className="mt-3 font-bold text-slate-950">
                    {item.title}
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
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