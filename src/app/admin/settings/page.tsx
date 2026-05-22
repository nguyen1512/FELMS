import AppShell from "@/components/lms/AppShell";
import SectionCard from "@/components/lms/SectionCard";
import {
  Bell,
  CheckCircle2,
  FileBadge,
  Globe,
  Image,
  Lock,
  Mail,
  Save,
  Server,
  Settings,
  ShieldCheck,
  UploadCloud,
  Video,
} from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <AppShell workspace="admin" title="Cấu hình hệ thống">
      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
            <div>
              <p className="text-sm font-semibold text-orange-600">
                System Settings
              </p>

              <h1 className="mt-2 text-3xl font-bold text-slate-950">
                Cấu hình hệ thống LMS
              </h1>

              <p className="mt-2 text-slate-500">
                Quản lý thông tin hệ thống, thương hiệu, email thông báo, chứng
                chỉ, bảo mật và cấu hình upload video.
              </p>
            </div>

            <button className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-600">
              <Save size={18} />
              Lưu cấu hình
            </button>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Settings className="text-orange-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">12</p>
            <p className="text-sm text-slate-500">Nhóm cấu hình</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Mail className="text-orange-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">8</p>
            <p className="text-sm text-slate-500">Mẫu email thông báo</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Video className="text-orange-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">HLS</p>
            <p className="text-sm text-slate-500">Chuẩn streaming video</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <ShieldCheck className="text-green-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">OK</p>
            <p className="text-sm text-slate-500">Bảo mật đăng nhập</p>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <SectionCard title="Thông tin hệ thống" action="Cập nhật">
            <div className="space-y-4">
              <input
                defaultValue="AnU Internal Learning System"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-400"
              />

              <input
                defaultValue="ANU LMS"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-400"
              />

              <input
                defaultValue="https://lms.anu.edu.vn"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-400"
              />

              <textarea
                defaultValue="Hệ thống đào tạo nội bộ dành cho nhân viên AnU, hỗ trợ khóa học, bài giảng video, quiz, đánh giá năng lực và cấp chứng chỉ."
                className="min-h-[120px] w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-400"
              />

              <button className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600">
                <Save size={18} />
                Lưu thông tin
              </button>
            </div>
          </SectionCard>

          <SectionCard title="Thương hiệu giao diện">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 p-4">
                <div className="flex h-20 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                  <Image size={34} />
                </div>

                <h3 className="mt-3 font-bold text-slate-950">
                  Logo hệ thống
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Sử dụng logo AnU trong sidebar, chứng chỉ và email.
                </p>

                <button className="mt-4 flex items-center gap-2 rounded-xl border border-orange-200 px-4 py-2 text-sm font-bold text-orange-600 hover:bg-orange-50">
                  <UploadCloud size={16} />
                  Upload logo
                </button>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4">
                <div className="flex h-20 items-center justify-center rounded-2xl bg-orange-500 text-white">
                  #F97316
                </div>

                <h3 className="mt-3 font-bold text-slate-950">
                  Màu chủ đạo
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Cam và trắng là màu chính của giao diện LMS.
                </p>

                <button className="mt-4 rounded-xl border border-orange-200 px-4 py-2 text-sm font-bold text-orange-600 hover:bg-orange-50">
                  Đổi màu
                </button>
              </div>
            </div>
          </SectionCard>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <SectionCard title="Cấu hình email thông báo">
            <div className="space-y-4">
              <input
                defaultValue="noreply@anu.edu.vn"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-400"
              />

              <select className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-400">
                <option>Email khi được gán khóa học</option>
                <option>Email nhắc học trước deadline</option>
                <option>Email cấp chứng chỉ</option>
                <option>Email cảnh báo quá hạn</option>
              </select>

              <textarea
                defaultValue="Xin chào {{employee_name}}, bạn vừa được gán khóa học {{course_name}}. Vui lòng hoàn thành trước {{deadline}}."
                className="min-h-[130px] w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-400"
              />

              <button className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-slate-700">
                <Mail size={18} />
                Lưu mẫu email
              </button>
            </div>
          </SectionCard>

          <SectionCard title="Cấu hình chứng chỉ">
            <div className="space-y-4">
              <input
                defaultValue="ANU-LMS-{YEAR}-{ID}"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-400"
              />

              <select className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-400">
                <option>Tự động cấp khi đạt điều kiện</option>
                <option>Cần quản trị LMS duyệt</option>
                <option>Chỉ cấp thủ công</option>
              </select>

              <div className="space-y-3">
                {[
                  "Hoàn thành 100% bài học bắt buộc",
                  "Đạt điểm quiz tối thiểu 80/100",
                  "Có mã QR xác thực chứng chỉ",
                  "Lưu chứng chỉ vào hồ sơ học viên",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 rounded-xl bg-slate-50 p-3"
                  >
                    <CheckCircle2
                      className="mt-0.5 shrink-0 text-green-600"
                      size={18}
                    />
                    <span className="text-sm font-medium text-slate-700">
                      {item}
                    </span>
                  </div>
                ))}
              </div>

              <button className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600">
                <FileBadge size={18} />
                Lưu cấu hình chứng chỉ
              </button>
            </div>
          </SectionCard>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <SectionCard title="Cấu hình upload video">
            <div className="space-y-4">
              <select className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-400">
                <option>Storage Driver: Cloud Object Storage</option>
                <option>Cloudflare R2</option>
                <option>AWS S3</option>
                <option>Supabase Storage</option>
              </select>

              <select className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-400">
                <option>Streaming: HLS .m3u8</option>
                <option>MP4 progressive</option>
                <option>DASH streaming</option>
              </select>

              <input
                defaultValue="2048 MB"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-400"
              />

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="rounded-xl bg-orange-50 p-4">
                  <Video size={20} className="text-orange-600" />
                  <p className="mt-2 font-bold text-slate-950">
                    Auto convert HLS
                  </p>
                  <p className="text-sm text-slate-500">Đang bật</p>
                </div>

                <div className="rounded-xl bg-orange-50 p-4">
                  <Server size={20} className="text-orange-600" />
                  <p className="mt-2 font-bold text-slate-950">
                    CDN Delivery
                  </p>
                  <p className="text-sm text-slate-500">Sẵn sàng</p>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Bảo mật đăng nhập">
            <div className="space-y-3">
              {[
                {
                  icon: Lock,
                  title: "Yêu cầu mật khẩu mạnh",
                  desc: "Tối thiểu 8 ký tự, có chữ hoa, số và ký tự đặc biệt.",
                },
                {
                  icon: ShieldCheck,
                  title: "Giới hạn đăng nhập sai",
                  desc: "Khóa tạm thời sau 5 lần đăng nhập thất bại.",
                },
                {
                  icon: Bell,
                  title: "Thông báo bảo mật",
                  desc: "Gửi email khi có đăng nhập bất thường.",
                },
                {
                  icon: Globe,
                  title: "Tên miền hệ thống",
                  desc: "Chỉ cho phép truy cập qua domain LMS chính thức.",
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                      <Icon size={19} />
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-950">
                        {item.title}
                      </h3>

                      <p className="mt-1 text-sm leading-6 text-slate-500">
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