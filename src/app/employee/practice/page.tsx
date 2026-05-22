import Link from "next/link";
import AppShell from "@/components/lms/AppShell";
import SectionCard from "@/components/lms/SectionCard";
import {
  Brain,
  CheckCircle2,
  Clock3,
  FileQuestion,
  Flame,
  Lightbulb,
  PlayCircle,
  Star,
  Target,
  TrendingUp,
} from "lucide-react";

const practiceSkills = [
  {
    title: "CRM & vận hành",
    score: 82,
    status: "Tốt",
  },
  {
    title: "Tư vấn học viên",
    score: 74,
    status: "Cần luyện thêm",
  },
  {
    title: "Xử lý phụ huynh",
    score: 68,
    status: "Ưu tiên luyện",
  },
  {
    title: "Quản lý lớp học",
    score: 79,
    status: "Ổn định",
  },
];

const practiceTasks = [
  {
    title: "Tình huống: Phụ huynh phản hồi về lịch học",
    skill: "Xử lý phụ huynh",
    level: "Trung cấp",
    questions: 8,
    time: "12 phút",
    status: "Nên làm hôm nay",
  },
  {
    title: "Ôn tập quy trình cập nhật CRM",
    skill: "CRM & vận hành",
    level: "Cơ bản",
    questions: 10,
    time: "15 phút",
    status: "Đang mở",
  },
  {
    title: "Bài luyện tư vấn học viên mới",
    skill: "Tư vấn học viên",
    level: "Cơ bản",
    questions: 6,
    time: "10 phút",
    status: "Đang mở",
  },
];

function getStatusClass(status: string) {
  if (status === "Nên làm hôm nay") {
    return "bg-orange-100 text-orange-700";
  }

  return "bg-green-100 text-green-700";
}

export default function EmployeePracticePage() {
  return (
    <AppShell workspace="employee" title="Luyện tập có chủ đích">
      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-orange-600">
            Deliberate Practice
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            Luyện tập có chủ đích
          </h1>

          <p className="mt-2 text-slate-500">
            Tập trung luyện các kỹ năng còn yếu thông qua tình huống ngắn, câu
            hỏi thực hành và gợi ý cải thiện năng lực cá nhân.
          </p>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Brain className="text-orange-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">4</p>
            <p className="text-sm text-slate-500">Kỹ năng đang luyện</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <FileQuestion className="text-orange-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">24</p>
            <p className="text-sm text-slate-500">Câu hỏi thực hành</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Flame className="text-orange-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">5 ngày</p>
            <p className="text-sm text-slate-500">Chuỗi luyện tập</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <TrendingUp className="text-green-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">+12%</p>
            <p className="text-sm text-slate-500">Tiến bộ tuần này</p>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_380px]">
          <SectionCard title="Kỹ năng cần luyện">
            <div className="space-y-4">
              {practiceSkills.map((skill) => (
                <div
                  key={skill.title}
                  className="rounded-2xl border border-slate-200 p-5"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-slate-950">
                        {skill.title}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {skill.status}
                      </p>
                    </div>

                    <span className="font-bold text-orange-600">
                      {skill.score}%
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-orange-500"
                      style={{ width: `${skill.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Gợi ý luyện tập">
            <div className="rounded-2xl bg-orange-50 p-5">
              <Lightbulb className="text-orange-600" size={26} />

              <h3 className="mt-3 font-bold text-slate-950">
                Ưu tiên kỹ năng xử lý phụ huynh
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Radar năng lực cho thấy kỹ năng xử lý tình huống phụ huynh đang
                thấp hơn các nhóm kỹ năng khác. Hệ thống đề xuất luyện 3 bài
                tình huống trong tuần này.
              </p>

              <Link
                href="/employee/practice/weakest-skill"
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-white hover:bg-orange-600"
              >
                <PlayCircle size={18} />
                Bắt đầu luyện ngay
              </Link>
            </div>
          </SectionCard>
        </div>

        <SectionCard title="Bài luyện tập được đề xuất">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            {practiceTasks.map((task) => (
              <div
                key={task.title}
                className="rounded-2xl border border-slate-200 bg-white p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
                    <Target size={22} />
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusClass(
                      task.status
                    )}`}
                  >
                    {task.status}
                  </span>
                </div>

                <h3 className="mt-4 text-lg font-bold text-slate-950">
                  {task.title}
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Kỹ năng: {task.skill}
                </p>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">Cấp độ</p>
                    <p className="font-bold text-slate-950">{task.level}</p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">Thời gian</p>
                    <p className="font-bold text-slate-950">{task.time}</p>
                  </div>
                </div>

                <div className="mt-3 rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Số câu hỏi</p>
                  <p className="font-bold text-slate-950">
                    {task.questions} câu thực hành
                  </p>
                </div>

                <Link
                  href={`/employee/practice/session?title=${encodeURIComponent(
                    task.title
                  )}&skill=${encodeURIComponent(task.skill)}`}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-white hover:bg-orange-600"
                >
                  <PlayCircle size={18} />
                  Làm bài luyện tập
                </Link>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Kết quả luyện tập gần đây">
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="p-4">Bài luyện</th>
                  <th className="p-4">Kỹ năng</th>
                  <th className="p-4">Điểm</th>
                  <th className="p-4">Thời gian</th>
                  <th className="p-4">Trạng thái</th>
                </tr>
              </thead>

              <tbody>
                {[
                  {
                    title: "Ôn tập quy trình CRM",
                    skill: "CRM & vận hành",
                    score: 86,
                    time: "12 phút",
                    status: "Hoàn thành",
                  },
                  {
                    title: "Tư vấn học viên mới",
                    skill: "Tư vấn học viên",
                    score: 78,
                    time: "10 phút",
                    status: "Hoàn thành",
                  },
                  {
                    title: "Xử lý phản hồi phụ huynh",
                    skill: "Xử lý phụ huynh",
                    score: 68,
                    time: "15 phút",
                    status: "Cần luyện lại",
                  },
                ].map((item) => (
                  <tr key={item.title} className="border-t border-slate-100">
                    <td className="p-4 font-bold text-slate-950">
                      {item.title}
                    </td>

                    <td className="p-4 text-slate-600">{item.skill}</td>

                    <td className="p-4 font-bold text-orange-600">
                      {item.score}
                    </td>

                    <td className="p-4 text-slate-600">{item.time}</td>

                    <td className="p-4">
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard title="Nguyên tắc luyện tập hiệu quả">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {[
              {
                icon: Target,
                title: "Luyện đúng điểm yếu",
                desc: "Ưu tiên kỹ năng có điểm thấp trên radar năng lực.",
              },
              {
                icon: Clock3,
                title: "Luyện ngắn mỗi ngày",
                desc: "Mỗi bài chỉ 10-15 phút để duy trì đều đặn.",
              },
              {
                icon: Star,
                title: "Xem lại lỗi sai",
                desc: "Tập trung vào các câu trả lời chưa chính xác.",
              },
              {
                icon: CheckCircle2,
                title: "Cập nhật năng lực",
                desc: "Điểm luyện tập sẽ được ghi nhận vào hồ sơ học tập.",
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