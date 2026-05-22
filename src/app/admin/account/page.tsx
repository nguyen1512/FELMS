import AppShell from "@/components/lms/AppShell";
import SectionCard from "@/components/lms/SectionCard";
import {
  BadgeCheck,
  Bell,
  Clock3,
  KeyRound,
  Laptop,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  Smartphone,
  UserCircle2,
} from "lucide-react";

const loginHistory = [
  {
    device: "Windows Desktop - Chrome",
    ip: "192.168.10.62",
    time: "17/05/2026 08:42",
    status: "Tin cậy",
  },
  {
    device: "iPhone 15 Pro",
    ip: "192.168.10.88",
    time: "16/05/2026 21:10",
    status: "Tin cậy",
  },
  {
    device: "Macbook Air",
    ip: "192.168.10.41",
    time: "15/05/2026 14:25",
    status: "Đã xác minh",
  },
];

export default function AdminSettingsPage() {
  return (
    <AppShell workspace="admin" title="Thông tin tài khoản">
      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-orange-600">
            System Account
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            Thông tin tài khoản Admin
          </h1>

          <p className="mt-2 text-slate-500">
            Quản lý thông tin tài khoản, bảo mật hệ thống, lịch sử đăng nhập và
            các cài đặt xác thực dành cho quản trị viên.
          </p>
        </section>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_380px]">
          <SectionCard title="Thông tin cá nhân">
            <div className="flex flex-col gap-6 xl:flex-row">
              <div className="flex flex-col items-center">
                <div className="flex h-32 w-32 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                  <UserCircle2 size={72} />
                </div>

                <button className="mt-4 rounded-xl border border-orange-200 px-4 py-2 text-sm font-bold text-orange-600 hover:bg-orange-50">
                  Đổi ảnh đại diện
                </button>
              </div>

              <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Họ và tên</p>
                  <p className="mt-1 font-bold text-slate-950">
                    AnU System Admin
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Vai trò</p>
                  <p className="mt-1 font-bold text-orange-600">
                    Super Admin
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Mail size={14} />
                    Email
                  </div>

                  <p className="mt-1 font-bold text-slate-950">
                    admin@anuacademy.vn
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Phone size={14} />
                    Số điện thoại
                  </div>

                  <p className="mt-1 font-bold text-slate-950">
                    0988 888 888
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Ngày tạo tài khoản</p>
                  <p className="mt-1 font-bold text-slate-950">
                    02/01/2026
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Trạng thái</p>

                  <span className="mt-2 inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                    Đang hoạt động
                  </span>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Bảo mật tài khoản">
            <div className="space-y-4">
              <div className="rounded-2xl bg-orange-50 p-5">
                <ShieldCheck className="text-orange-600" size={28} />

                <h3 className="mt-3 font-bold text-slate-950">
                  Xác thực bảo mật 2 lớp
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Tài khoản hiện đang bật xác thực OTP qua email và thiết bị
                  đăng nhập tin cậy.
                </p>

                <button className="mt-4 rounded-xl bg-orange-500 px-4 py-2 text-sm font-bold text-white hover:bg-orange-600">
                  Quản lý bảo mật
                </button>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center gap-3">
                  <KeyRound className="text-orange-600" size={22} />

                  <div>
                    <p className="font-bold text-slate-950">Mật khẩu</p>
                    <p className="text-sm text-slate-500">
                      Cập nhật lần cuối 7 ngày trước
                    </p>
                  </div>
                </div>

                <button className="mt-4 rounded-xl border border-orange-200 px-4 py-2 text-sm font-bold text-orange-600 hover:bg-orange-50">
                  Đổi mật khẩu
                </button>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center gap-3">
                  <Bell className="text-orange-600" size={22} />

                  <div>
                    <p className="font-bold text-slate-950">
                      Thông báo bảo mật
                    </p>

                    <p className="text-sm text-slate-500">
                      Email cảnh báo khi có đăng nhập lạ
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                  <span className="text-sm font-medium text-slate-700">
                    Trạng thái
                  </span>

                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                    Đang bật
                  </span>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>

        <SectionCard title="Thiết bị & lịch sử đăng nhập">
          <div className="space-y-4">
            {loginHistory.map((item) => (
              <div
                key={`${item.device}-${item.time}`}
                className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 p-5 xl:flex-row xl:items-center"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
                    {item.device.includes("iPhone") ? (
                      <Smartphone size={22} />
                    ) : (
                      <Laptop size={22} />
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-950">
                      {item.device}
                    </h3>

                    <div className="mt-1 flex flex-wrap gap-4 text-sm text-slate-500">
                      <span>IP: {item.ip}</span>

                      <span className="flex items-center gap-1">
                        <Clock3 size={14} />
                        {item.time}
                      </span>
                    </div>
                  </div>
                </div>

                <span className="inline-flex min-w-[120px] items-center justify-center rounded-full bg-green-100 px-3 py-2 text-xs font-bold text-green-700">
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Quyền hệ thống hiện tại">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {[
              "Quản trị toàn bộ LMS",
              "Quản lý người dùng",
              "Phân quyền hệ thống",
              "Quản lý workflow automation",
              "Quản lý chứng chỉ",
              "Quản lý khóa học",
              "Xem toàn bộ báo cáo",
              "Cấu hình hệ thống",
            ].map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4"
              >
                <BadgeCheck
                  className="mt-0.5 shrink-0 text-orange-600"
                  size={18}
                />

                <p className="text-sm font-medium leading-6 text-slate-700">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Trạng thái hệ thống">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {[
              "Auth Service",
              "LMS Engine",
              "Certificate Service",
              "Notification Service",
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-slate-200 p-5"
              >
                <div className="flex items-center justify-between">
                  <Lock className="text-orange-600" size={20} />

                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                    Online
                  </span>
                </div>

                <h3 className="mt-4 font-bold text-slate-950">{item}</h3>

                <p className="mt-2 text-sm text-slate-500">
                  Hệ thống đang hoạt động ổn định.
                </p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}