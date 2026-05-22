import Link from "next/link";
import AppShell from "@/components/lms/AppShell";
import {
  Award,
  BadgeCheck,
  CalendarDays,
  Download,
  FileBadge,
  GraduationCap,
  IdCard,
  Printer,
  RotateCcw,
} from "lucide-react";

export default function CertificatePage() {
  return (
    <AppShell workspace="employee" title="Chứng chỉ hoàn thành">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_340px]">
        <main>
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="rounded-3xl border-4 border-orange-200 bg-orange-50 p-6">
              <div className="rounded-3xl border border-orange-300 bg-white px-8 py-10 text-center font-sans">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-orange-500 text-white">
                  <GraduationCap size={42} />
                </div>

                <p className="mt-6 text-xs font-bold tracking-[0.45em] text-orange-600">
                  CERTIFICATE OF COMPLETION
                </p>

                <h1 className="mx-auto mt-5 max-w-[760px] text-[34px] font-extrabold leading-[1.25] text-slate-950">
                  Chứng chỉ hoàn thành khóa học
                </h1>

                <p className="mt-6 text-base text-slate-500">
                  Chứng nhận Nhân viên
                </p>

                <h2 className="mt-2 text-3xl font-bold text-orange-600">
                  AnU Demo
                </h2>

                <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                  đã hoàn thành khóa học{" "}
                  <span className="font-bold text-slate-950">
                    “Hướng dẫn sử dụng hệ thống AnU Internal Learning System”
                  </span>{" "}
                  và đạt đầy đủ các tiêu chí đánh giá của chương trình đào tạo
                  nội bộ.
                </p>

                <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-2xl bg-orange-50 p-4">
                    <p className="text-sm text-slate-500">Điểm hoàn thành</p>
                    <p className="mt-1 text-2xl font-bold text-slate-950">
                      90/100
                    </p>
                  </div>

                  <div className="rounded-2xl bg-orange-50 p-4">
                    <p className="text-sm text-slate-500">Ngày cấp</p>
                    <p className="mt-1 text-2xl font-bold text-slate-950">
                      17/05/2026
                    </p>
                  </div>

                  <div className="rounded-2xl bg-orange-50 p-4">
                    <p className="text-sm text-slate-500">Mã chứng chỉ</p>
                    <p className="mt-1 text-xl font-bold leading-tight text-slate-950">
                      ANU-LMS-0001
                    </p>
                  </div>
                </div>

                <div className="mt-10 flex items-center justify-between border-t border-orange-100 pt-8">
                  <div className="text-left">
                    <p className="font-bold text-slate-950">AnU Academy</p>
                    <p className="text-sm text-slate-500">
                      Đơn vị đào tạo nội bộ
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-semibold text-slate-600">
                    QR xác thực
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        <aside className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950">
              Thông tin chứng chỉ
            </h2>

            <div className="mt-5 space-y-3">
              <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                <FileBadge className="text-orange-600" size={20} />
                <div>
                  <p className="text-sm text-slate-500">Loại chứng chỉ</p>
                  <p className="font-bold">Hoàn thành khóa học</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                <CalendarDays className="text-orange-600" size={20} />
                <div>
                  <p className="text-sm text-slate-500">Ngày cấp</p>
                  <p className="font-bold">17/05/2026</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                <IdCard className="text-orange-600" size={20} />
                <div>
                  <p className="text-sm text-slate-500">Mã chứng chỉ</p>
                  <p className="font-bold">ANU-LMS-0001</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-green-50 p-4">
                <BadgeCheck className="text-green-600" size={20} />
                <div>
                  <p className="text-sm text-green-700">Trạng thái</p>
                  <p className="font-bold text-green-700">Hợp lệ</p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950">Thao tác</h2>

            <div className="mt-5 space-y-3">
              <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600">
                <Download size={18} />
                Tải chứng chỉ PDF
              </button>

              <button className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">
                <Printer size={18} />
                In chứng chỉ
              </button>

              <Link
                href="/learning"
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-orange-200 px-5 py-3 text-sm font-bold text-orange-600 hover:bg-orange-50"
              >
                <RotateCcw size={18} />
                Quay lại bài học
              </Link>

              <Link
                href="/employee"
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-slate-700"
              >
                <Award size={18} />
                Về Dashboard
              </Link>
            </div>
          </section>
        </aside>
      </div>
    </AppShell>
  );
}