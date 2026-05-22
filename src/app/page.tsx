import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f6f7fb] p-10">
      <h1 className="text-3xl font-bold text-slate-900">
        AnU Internal Learning System
      </h1>

      <p className="mt-2 text-slate-500">
        Chọn khu vực quản trị để bắt đầu.
      </p>

      <div className="mt-8 grid max-w-5xl grid-cols-1 gap-5 md:grid-cols-3">
        <Link
          href="/admin"
          className="rounded-2xl border bg-white p-6 shadow-sm hover:border-orange-400"
        >
          <h2 className="text-xl font-bold text-orange-600">Admin hệ thống</h2>
          <p className="mt-2 text-sm text-slate-500">
            Quản lý nhân sự, phòng ban, vai trò, quyền và cấu hình.
          </p>
        </Link>

        <Link
          href="/lms-admin"
          className="rounded-2xl border bg-white p-6 shadow-sm hover:border-orange-400"
        >
          <h2 className="text-xl font-bold text-orange-600">Quản trị LMS</h2>
          <p className="mt-2 text-sm text-slate-500">
            Quản lý khóa học, giảng viên, báo cáo và tài nguyên học tập.
          </p>
        </Link>

        <Link
          href="/employee"
          className="rounded-2xl border bg-white p-6 shadow-sm hover:border-orange-400"
        >
          <h2 className="text-xl font-bold text-orange-600">Nhân viên</h2>
          <p className="mt-2 text-sm text-slate-500">
            Xem khóa học, tiến độ, chứng chỉ và radar năng lực.
          </p>
        </Link>
      </div>

      <div className="mt-5 max-w-5xl">
        <Link
          href="/login?redirect=/lms-student/entrance-test"
          className="block rounded-2xl border bg-white p-6 shadow-sm hover:border-orange-400"
        >
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-xl font-bold text-orange-600">Test đầu vào</h2>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
              10 câu
            </span>
          </div>

          <p className="mt-2 text-sm text-slate-500">
            Làm bài test đầu vào để đánh giá năng lực ban đầu.
          </p>
        </Link>
      </div>
    </main>
  );
}