import AppShell from "@/components/lms/AppShell";
import SectionCard from "@/components/lms/SectionCard";
import {
  Award,
  CheckCircle2,
  Clock3,
  Download,
  Eye,
  FileBadge,
  QrCode,
  ShieldCheck,
  Star,
  Target,
} from "lucide-react";

const certificates = [
  {
    title: "Chứng chỉ hoàn thành AnU LMS",
    course: "Hướng dẫn sử dụng hệ thống AnU LMS",
    code: "ANU-LMS-2026-001",
    issueDate: "17/05/2026",
    score: 90,
    status: "Đã cấp",
  },
  {
    title: "Chứng chỉ CRM nội bộ",
    course: "Quy trình vận hành CRM cho đội CM",
    code: "ANU-CRM-2026-014",
    issueDate: "Chờ hoàn thành",
    score: 78,
    status: "Chờ cấp",
  },
  {
    title: "Chứng chỉ xử lý tình huống phụ huynh",
    course: "Tư vấn phụ huynh và xử lý tình huống",
    code: "ANU-CSKH-2026-021",
    issueDate: "Chưa đủ điều kiện",
    score: 68,
    status: "Chưa đạt",
  },
];

function getStatusClass(status: string) {
  if (status === "Đã cấp") {
    return "bg-green-100 text-green-700 border border-green-200";
  }

  if (status === "Chờ cấp") {
    return "bg-orange-100 text-orange-700 border border-orange-200";
  }

  return "bg-red-100 text-red-700 border border-red-200";
}

export default function EmployeeCertificatesPage() {
  return (
    <AppShell workspace="employee" title="Văn bằng - chứng chỉ">
      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-orange-600">
            Certificates
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            Văn bằng - chứng chỉ
          </h1>

          <p className="mt-2 text-slate-500">
            Quản lý chứng chỉ đã đạt, chứng chỉ đang chờ cấp, mã xác thực và
            điều kiện hoàn thành từng khóa học.
          </p>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <FileBadge className="text-orange-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">3</p>
            <p className="text-sm text-slate-500">Tổng chứng chỉ</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <CheckCircle2 className="text-green-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">1</p>
            <p className="text-sm text-slate-500">Đã được cấp</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Clock3 className="text-orange-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">1</p>
            <p className="text-sm text-slate-500">Đang chờ cấp</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Award className="text-orange-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">90</p>
            <p className="text-sm text-slate-500">Điểm chứng chỉ cao nhất</p>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_380px]">
          <SectionCard title="Danh sách chứng chỉ">
            <div className="space-y-4">
              {certificates.map((item) => (
                <div
                  key={item.code}
                  className="rounded-2xl border border-slate-200 p-5"
                >
                  <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-start">
                    <div>
                      <span
                        className={`inline-flex min-w-[100px] items-center justify-center rounded-full px-3 py-1.5 text-xs font-bold whitespace-nowrap ${getStatusClass(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>

                      <h3 className="mt-3 text-lg font-bold text-slate-950">
                        {item.title}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        {item.course}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50">
                        <Eye size={16} />
                      </button>

                      <button className="rounded-lg border border-orange-200 p-2 text-orange-600 hover:bg-orange-50">
                        <Download size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-xs text-slate-500">Mã xác thực</p>
                      <p className="mt-1 font-bold text-slate-950">
                        {item.code}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-xs text-slate-500">Ngày cấp</p>
                      <p className="mt-1 font-bold text-slate-950">
                        {item.issueDate}
                      </p>
                    </div>

                    <div className="rounded-xl bg-orange-50 p-3">
                      <p className="text-xs text-slate-500">Điểm</p>
                      <p className="mt-1 font-bold text-orange-600">
                        {item.score}/100
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Xác thực chứng chỉ">
            <div className="rounded-2xl bg-orange-50 p-5">
              <QrCode className="text-orange-600" size={32} />

              <h3 className="mt-3 font-bold text-slate-950">
                Mã xác thực điện tử
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Mỗi chứng chỉ được cấp sẽ có mã xác thực riêng để kiểm tra tính
                hợp lệ trên hệ thống AnU LMS.
              </p>

              <div className="mt-5 rounded-xl bg-white p-4 text-center">
                <p className="text-xs text-slate-500">Mã chứng chỉ mới nhất</p>
                <p className="mt-1 font-bold text-slate-950">
                  ANU-LMS-2026-001
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {[
                "Chứng chỉ chỉ được cấp khi hoàn thành 100% khóa học",
                "Điểm kiểm tra cuối khóa cần đạt tối thiểu 80/100",
                "Chứng chỉ có thể tải xuống dưới dạng PDF",
                "Mã QR dùng để xác thực chứng chỉ",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-xl bg-slate-50 p-3"
                >
                  <ShieldCheck
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

        <SectionCard title="Điều kiện nhận chứng chỉ">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {[
              {
                icon: Target,
                title: "Hoàn thành khóa học",
                desc: "Cần hoàn thành toàn bộ bài học bắt buộc.",
              },
              {
                icon: Star,
                title: "Đạt điểm kiểm tra",
                desc: "Điểm quiz hoặc bài thi cuối khóa cần đạt chuẩn.",
              },
              {
                icon: CheckCircle2,
                title: "Được hệ thống ghi nhận",
                desc: "Tiến độ và điểm số phải được lưu trong hồ sơ học tập.",
              },
              {
                icon: Download,
                title: "Tải chứng chỉ",
                desc: "Có thể tải PDF sau khi chứng chỉ được cấp.",
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