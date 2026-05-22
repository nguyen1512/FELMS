import Link from "next/link";
import AppShell from "@/components/lms/AppShell";
import SectionCard from "@/components/lms/SectionCard";
import ProgressBar from "@/components/lms/ProgressBar";
import {
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  FileText,
  PlayCircle,
  Star,
  Users,
  Video,
} from "lucide-react";

const sections = [
  {
    title: "Chương 1: Tổng quan hệ thống LMS",
    lessons: [
      "Giới thiệu mục tiêu khóa học",
      "Tổng quan luồng học tập nội bộ",
      "Vai trò của nhân viên trong hệ thống đào tạo",
    ],
  },
  {
    title: "Chương 2: Quy trình vận hành đào tạo",
    lessons: [
      "Cách tham gia khóa học được giao",
      "Cách xem video bài giảng và tài liệu",
      "Cách làm bài tập và bài kiểm tra",
      "Cách theo dõi tiến độ học tập",
    ],
  },
  {
    title: "Chương 3: Đánh giá và chứng chỉ",
    lessons: [
      "Cách tính điểm hoàn thành khóa học",
      "Radar năng lực cá nhân",
      "Điều kiện nhận chứng chỉ",
    ],
  },
];

const reviews = [
  {
    name: "Nguyễn Thị Mai",
    role: "Nhân viên CSKH",
    comment: "Nội dung dễ hiểu, phù hợp với công việc thực tế.",
    rating: 5,
  },
  {
    name: "Trần Minh Anh",
    role: "CM",
    comment: "Khóa học giúp nắm rõ quy trình vận hành hệ thống.",
    rating: 4,
  },
  {
    name: "Lê Hoàng Nam",
    role: "Tư vấn tuyển sinh",
    comment: "Bài học rõ ràng, phần kiểm tra giúp ghi nhớ tốt hơn.",
    rating: 5,
  },
];

export default function CourseDetailPage() {
  return (
    <AppShell workspace="employee" title="Chi tiết khóa học">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_340px]">
        <main className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-slate-500">
              <span className="rounded-full bg-orange-100 px-3 py-1 font-semibold text-orange-700">
                Đào tạo nội bộ
              </span>
              <span>48 bài giảng</span>
              <span>3.5 giờ học</span>
              <span>Cập nhật mới nhất 05/2026</span>
            </div>

            <h1 className="text-3xl font-bold text-slate-950">
              Hướng dẫn sử dụng hệ thống AnU Internal Learning System
            </h1>

            <p className="mt-4 max-w-3xl text-slate-600">
              Khóa học giúp nhân viên hiểu rõ cách sử dụng hệ thống LMS nội bộ,
              theo dõi tiến độ học tập, làm bài kiểm tra, xem radar năng lực và
              nhận chứng chỉ sau khi hoàn thành.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-2xl bg-orange-50 p-4">
                <Users className="text-orange-600" size={22} />
                <p className="mt-2 text-2xl font-bold">242</p>
                <p className="text-sm text-slate-500">Nhân viên</p>
              </div>

              <div className="rounded-2xl bg-orange-50 p-4">
                <BookOpen className="text-orange-600" size={22} />
                <p className="mt-2 text-2xl font-bold">48</p>
                <p className="text-sm text-slate-500">Bài học</p>
              </div>

              <div className="rounded-2xl bg-orange-50 p-4">
                <Clock className="text-orange-600" size={22} />
                <p className="mt-2 text-2xl font-bold">3.5h</p>
                <p className="text-sm text-slate-500">Thời lượng</p>
              </div>

              <div className="rounded-2xl bg-orange-50 p-4">
                <Award className="text-orange-600" size={22} />
                <p className="mt-2 text-2xl font-bold">80%</p>
                <p className="text-sm text-slate-500">Điểm đạt</p>
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex h-[360px] items-center justify-center bg-gradient-to-br from-orange-500 to-orange-700 text-white">
              <div className="text-center">
                <PlayCircle size={76} className="mx-auto mb-4" />
                <h2 className="text-2xl font-bold">Video giới thiệu khóa học</h2>
                <p className="mt-2 text-orange-100">
                  Preview bài học trước khi vào học chính thức
                </p>
              </div>
            </div>
          </section>

          <SectionCard title="Mô tả khóa học">
            <div className="space-y-4 text-slate-600">
              <p>
                Khóa học này được thiết kế dành cho nhân viên mới, nhân viên
                đang tham gia đào tạo nội bộ và các phòng ban cần chuẩn hóa quy
                trình học tập trên hệ thống LMS.
              </p>

              <p>
                Người học sẽ được hướng dẫn cách truy cập khóa học, xem bài
                giảng video, đọc tài liệu, làm quiz, theo dõi điểm số, xem radar
                năng lực và nhận chứng chỉ hoàn thành.
              </p>

              <ul className="list-disc space-y-2 pl-5">
                <li>Nắm được cách sử dụng hệ thống LMS nội bộ AnU.</li>
                <li>Biết cách theo dõi tiến độ và kết quả học tập cá nhân.</li>
                <li>Hiểu điều kiện hoàn thành khóa học và nhận chứng chỉ.</li>
                <li>Ứng dụng kiến thức đào tạo vào công việc thực tế.</li>
              </ul>
            </div>
          </SectionCard>

          <SectionCard title="Nội dung khóa học">
            <div className="space-y-4">
              {sections.map((section, sectionIndex) => (
                <div
                  key={section.title}
                  className="overflow-hidden rounded-2xl border border-slate-200"
                >
                  <div className="flex items-center justify-between bg-slate-50 px-4 py-3">
                    <div>
                      <h3 className="font-bold text-slate-900">
                        {section.title}
                      </h3>
                      <p className="text-sm text-slate-500">
                        {section.lessons.length} bài học
                      </p>
                    </div>

                    <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
                      Chương {sectionIndex + 1}
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {section.lessons.map((lesson, index) => (
                      <div
                        key={lesson}
                        className="flex items-center justify-between px-4 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                            <Video size={17} />
                          </div>

                          <div>
                            <p className="font-medium text-slate-800">
                              {index + 1}. {lesson}
                            </p>
                            <p className="text-xs text-slate-400">
                              Video bài giảng · 8 phút
                            </p>
                          </div>
                        </div>

                        <Link
                          href="/learning"
                          className="rounded-xl border border-orange-200 px-3 py-1.5 text-xs font-semibold text-orange-600 transition hover:bg-orange-50"
                        >
                          Học thử
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Đánh giá của nhân viên">
            <div className="mb-5 rounded-2xl bg-slate-50 p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-4xl font-bold text-slate-950">4.7/5</p>
                  <div className="mt-2 flex text-yellow-400">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star key={index} size={18} fill="currentColor" />
                    ))}
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    1.506 đánh giá
                  </p>
                </div>

                <div className="w-full max-w-md space-y-2">
                  {[53, 35, 12, 0, 0].map((value, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <span className="w-10 text-sm text-slate-500">
                        {5 - index} sao
                      </span>
                      <div className="flex-1">
                        <ProgressBar value={value} />
                      </div>
                      <span className="w-10 text-right text-sm text-slate-500">
                        {value}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.name}
                  className="rounded-2xl border border-slate-200 p-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900">
                        {review.name}
                      </h3>
                      <p className="text-sm text-slate-500">{review.role}</p>
                    </div>

                    <div className="flex text-yellow-400">
                      {Array.from({ length: review.rating }).map((_, index) => (
                        <Star key={index} size={15} fill="currentColor" />
                      ))}
                    </div>
                  </div>

                  <p className="mt-3 text-sm text-slate-600">
                    {review.comment}
                  </p>
                </div>
              ))}
            </div>
          </SectionCard>
        </main>

        <aside className="space-y-6">
          <section className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex h-44 items-center justify-center rounded-2xl bg-orange-100 text-center text-orange-700">
              <div>
                <PlayCircle size={52} className="mx-auto mb-2" />
                <p className="font-bold">AnU Course Preview</p>
              </div>
            </div>

            <h2 className="text-xl font-bold text-slate-950">
              Học với AnU Academy
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Khóa học online mọi lúc, mọi nơi. Phù hợp cho nhân viên mới và
              nhân viên cần chuẩn hóa quy trình.
            </p>

            <div className="mt-5 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <CheckCircle2 size={18} className="text-green-600" />
                <span>Hoàn thành 100% bài học bắt buộc</span>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <CheckCircle2 size={18} className="text-green-600" />
                <span>Đạt tối thiểu 80 điểm bài kiểm tra</span>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <FileText size={18} className="text-orange-600" />
                <span>Có tài liệu và câu hỏi ôn tập</span>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <Award size={18} className="text-orange-600" />
                <span>Cấp chứng chỉ sau hoàn thành</span>
              </div>
            </div>

            <Link
              href="/learning"
              className="mt-6 flex w-full items-center justify-center rounded-xl bg-orange-500 py-3 text-sm font-bold text-white transition hover:bg-orange-600"
            >
              Vào học ngay
            </Link>

            <button className="mt-3 w-full rounded-xl border border-orange-200 py-3 text-sm font-bold text-orange-600 hover:bg-orange-50">
              Giao khóa học cho nhân viên
            </button>
          </section>
        </aside>
      </div>
    </AppShell>
  );
}