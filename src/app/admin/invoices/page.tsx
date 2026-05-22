import AppShell from "@/components/lms/AppShell";
import SectionCard from "@/components/lms/SectionCard";
import {
  Banknote,
  CheckCircle2,
  Clock3,
  CreditCard,
  Download,
  Eye,
  FileText,
  Plus,
  ReceiptText,
  Search,
  XCircle,
} from "lucide-react";

const invoices = [
  {
    code: "INV-2026-001",
    customer: "AnU Academy",
    plan: "Enterprise LMS",
    amount: "18.000.000đ",
    date: "18/05/2026",
    dueDate: "25/05/2026",
    status: "Đã thanh toán",
  },
  {
    code: "INV-2026-002",
    customer: "AnU Academy",
    plan: "Video Storage Add-on",
    amount: "4.500.000đ",
    date: "15/05/2026",
    dueDate: "22/05/2026",
    status: "Chờ thanh toán",
  },
  {
    code: "INV-2026-003",
    customer: "AnU Academy",
    plan: "Certificate Service",
    amount: "2.800.000đ",
    date: "10/05/2026",
    dueDate: "17/05/2026",
    status: "Quá hạn",
  },
];

function getStatusClass(status: string) {
  if (status === "Đã thanh toán") {
    return "bg-green-100 text-green-700 border border-green-200";
  }

  if (status === "Chờ thanh toán") {
    return "bg-orange-100 text-orange-700 border border-orange-200";
  }

  return "bg-red-100 text-red-700 border border-red-200";
}

export default function AdminInvoicesPage() {
  return (
    <AppShell workspace="admin" title="Hóa đơn">
      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-sm font-semibold text-orange-600">
                Invoice Management
              </p>

              <h1 className="mt-2 text-3xl font-bold text-slate-950">
                Quản lý hóa đơn
              </h1>

              <p className="mt-2 max-w-3xl text-slate-500">
                Theo dõi hóa đơn gói LMS, phí lưu trữ, dịch vụ chứng chỉ, trạng
                thái thanh toán và lịch sử giao dịch của hệ thống.
              </p>
            </div>

            <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600">
              <Plus size={18} />
              Tạo hóa đơn
            </button>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <ReceiptText className="text-orange-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">36</p>
            <p className="text-sm text-slate-500">Tổng hóa đơn</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Banknote className="text-green-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">
              128.5M
            </p>
            <p className="text-sm text-slate-500">Doanh thu đã thu</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Clock3 className="text-orange-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">4</p>
            <p className="text-sm text-slate-500">Chờ thanh toán</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <XCircle className="text-red-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">2</p>
            <p className="text-sm text-slate-500">Quá hạn</p>
          </div>
        </section>

        <SectionCard title="Bộ lọc hóa đơn">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_220px_220px]">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <Search size={18} className="text-slate-400" />
              <input
                placeholder="Tìm mã hóa đơn, khách hàng, gói dịch vụ..."
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>

            <select className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none">
              <option>Tất cả trạng thái</option>
              <option>Đã thanh toán</option>
              <option>Chờ thanh toán</option>
              <option>Quá hạn</option>
            </select>

            <select className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none">
              <option>Tất cả dịch vụ</option>
              <option>Enterprise LMS</option>
              <option>Video Storage</option>
              <option>Certificate Service</option>
            </select>
          </div>
        </SectionCard>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
          <SectionCard title="Danh sách hóa đơn">
            <div className="space-y-4">
              {invoices.map((invoice) => (
                <div
                  key={invoice.code}
                  className="rounded-2xl border border-slate-200 bg-white p-5"
                >
                  <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-start">
                    <div>
                      <span
                        className={`inline-flex min-w-[120px] items-center justify-center rounded-full px-3 py-1.5 text-xs font-bold ${getStatusClass(
                          invoice.status
                        )}`}
                      >
                        {invoice.status}
                      </span>

                      <h3 className="mt-3 text-lg font-bold text-slate-950">
                        {invoice.code}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        {invoice.customer} · {invoice.plan}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50">
                        <Eye size={17} />
                      </button>

                      <button className="rounded-xl border border-orange-200 p-2 text-orange-600 hover:bg-orange-50">
                        <Download size={17} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-4">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-xs text-slate-500">Số tiền</p>
                      <p className="mt-1 font-bold text-orange-600">
                        {invoice.amount}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-xs text-slate-500">Ngày tạo</p>
                      <p className="mt-1 font-bold text-slate-950">
                        {invoice.date}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-xs text-slate-500">Hạn thanh toán</p>
                      <p className="mt-1 font-bold text-slate-950">
                        {invoice.dueDate}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-xs text-slate-500">Phương thức</p>
                      <p className="mt-1 font-bold text-slate-950">
                        Chuyển khoản
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Thanh toán gần nhất">
            <div className="rounded-2xl bg-orange-50 p-5">
              <CreditCard className="text-orange-600" size={30} />

              <h3 className="mt-3 font-bold text-slate-950">
                Gói Enterprise LMS
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Hóa đơn gần nhất đã được thanh toán thành công ngày
                18/05/2026.
              </p>

              <div className="mt-5 rounded-xl bg-white p-4">
                <p className="text-xs text-slate-500">Số tiền</p>
                <p className="mt-1 text-2xl font-bold text-orange-600">
                  18.000.000đ
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {[
                "Tự động nhắc hóa đơn đến hạn",
                "Tải hóa đơn PDF",
                "Theo dõi trạng thái thanh toán",
                "Ghi nhận lịch sử giao dịch",
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

        <SectionCard title="Lịch sử giao dịch">
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="p-4">Mã giao dịch</th>
                  <th className="p-4">Dịch vụ</th>
                  <th className="p-4">Số tiền</th>
                  <th className="p-4">Ngày thanh toán</th>
                  <th className="p-4">Trạng thái</th>
                </tr>
              </thead>

              <tbody>
                {[
                  ["TXN-001", "Enterprise LMS", "18.000.000đ", "18/05/2026"],
                  ["TXN-002", "Storage Add-on", "4.500.000đ", "12/05/2026"],
                  ["TXN-003", "Certificate Service", "2.800.000đ", "08/05/2026"],
                ].map(([code, service, amount, date]) => (
                  <tr key={code} className="border-t border-slate-100">
                    <td className="p-4 font-bold text-slate-950">{code}</td>
                    <td className="p-4 text-slate-600">{service}</td>
                    <td className="p-4 font-bold text-orange-600">
                      {amount}
                    </td>
                    <td className="p-4 text-slate-600">{date}</td>
                    <td className="p-4">
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                        Thành công
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard title="Quy trình quản lý hóa đơn">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {[
              {
                icon: FileText,
                title: "Tạo hóa đơn",
                desc: "Ghi nhận gói dịch vụ và phí phát sinh.",
              },
              {
                icon: Clock3,
                title: "Theo dõi hạn",
                desc: "Kiểm tra hóa đơn sắp đến hạn thanh toán.",
              },
              {
                icon: CreditCard,
                title: "Thanh toán",
                desc: "Cập nhật trạng thái thanh toán thực tế.",
              },
              {
                icon: Download,
                title: "Xuất PDF",
                desc: "Tải hóa đơn phục vụ đối soát và lưu trữ.",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-2xl border border-slate-200 bg-white p-5"
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