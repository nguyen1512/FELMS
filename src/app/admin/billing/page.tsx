import AppShell from "@/components/lms/AppShell";
import SectionCard from "@/components/lms/SectionCard";
import {
  CreditCard,
  Download,
  Eye,
  FileText,
  Plus,
  Receipt,
  Search,
  Wallet,
  CheckCircle2,
  Clock3,
  AlertTriangle,
} from "lucide-react";

const invoices = [
  {
    code: "INV-ANU-0001",
    customer: "AnU Academy",
    packageName: "Enterprise LMS",
    amount: "60.000.000đ",
    date: "17/05/2026",
    dueDate: "30/05/2026",
    status: "Đã thanh toán",
  },
  {
    code: "INV-ANU-0002",
    customer: "AnU Academy",
    packageName: "Video Storage 60GB",
    amount: "12.000.000đ",
    date: "12/05/2026",
    dueDate: "25/05/2026",
    status: "Chờ thanh toán",
  },
  {
    code: "INV-ANU-0003",
    customer: "AnU Academy",
    packageName: "Certificate Service",
    amount: "8.000.000đ",
    date: "01/05/2026",
    dueDate: "15/05/2026",
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
          <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
            <div>
              <p className="text-sm font-semibold text-orange-600">
                Billing Management
              </p>

              <h1 className="mt-2 text-3xl font-bold text-slate-950">
                Quản lý hóa đơn
              </h1>

              <p className="mt-2 text-slate-500">
                Theo dõi hóa đơn dịch vụ LMS, gói sử dụng, trạng thái thanh toán
                và lịch sử chi phí hệ thống.
              </p>
            </div>

            <button className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600">
              <Plus size={18} />
              Tạo hóa đơn
            </button>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Receipt className="text-orange-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">36</p>
            <p className="text-sm text-slate-500">Tổng hóa đơn</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Wallet className="text-orange-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">80M</p>
            <p className="text-sm text-slate-500">Tổng giá trị</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <CheckCircle2 className="text-green-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">28</p>
            <p className="text-sm text-slate-500">Đã thanh toán</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <AlertTriangle className="text-red-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">3</p>
            <p className="text-sm text-slate-500">Quá hạn</p>
          </div>
        </section>

        <SectionCard title="Bộ lọc hóa đơn">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_220px_220px_220px]">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <Search size={18} className="text-slate-400" />
              <input
                placeholder="Tìm mã hóa đơn, gói dịch vụ..."
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>

            <select className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none">
              <option>Tháng này</option>
              <option>Quý này</option>
              <option>Năm nay</option>
            </select>

            <select className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none">
              <option>Tất cả gói dịch vụ</option>
              <option>Enterprise LMS</option>
              <option>Video Storage</option>
              <option>Certificate Service</option>
            </select>

            <select className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none">
              <option>Tất cả trạng thái</option>
              <option>Đã thanh toán</option>
              <option>Chờ thanh toán</option>
              <option>Quá hạn</option>
            </select>
          </div>
        </SectionCard>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
          <SectionCard title="Danh sách hóa đơn">
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-slate-500">
                  <tr>
                    <th className="p-4">Mã hóa đơn</th>
                    <th className="p-4">Gói dịch vụ</th>
                    <th className="p-4">Ngày tạo</th>
                    <th className="p-4">Hạn thanh toán</th>
                    <th className="p-4">Giá trị</th>
                    <th className="w-[150px] p-4 text-center">Trạng thái</th>
                    <th className="p-4 text-right">Thao tác</th>
                  </tr>
                </thead>

                <tbody>
                  {invoices.map((invoice) => (
                    <tr key={invoice.code} className="border-t border-slate-100">
                      <td className="p-4">
                        <p className="font-bold text-slate-950">
                          {invoice.code}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {invoice.customer}
                        </p>
                      </td>

                      <td className="p-4 text-slate-600">
                        {invoice.packageName}
                      </td>

                      <td className="p-4 text-slate-600">{invoice.date}</td>

                      <td className="p-4 text-slate-600">{invoice.dueDate}</td>

                      <td className="p-4 font-bold text-orange-600">
                        {invoice.amount}
                      </td>

                      <td className="p-4">
                        <div className="flex justify-center">
                          <span
                            className={`inline-flex min-w-[120px] items-center justify-center rounded-full px-3 py-1.5 text-xs font-bold whitespace-nowrap ${getStatusClass(
                              invoice.status
                            )}`}
                          >
                            {invoice.status}
                          </span>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          <button className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50">
                            <Eye size={16} />
                          </button>

                          <button className="rounded-lg border border-orange-200 p-2 text-orange-600 hover:bg-orange-50">
                            <Download size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>

          <SectionCard title="Tạo hóa đơn nhanh">
            <div className="space-y-4">
              <input
                placeholder="Tên khách hàng / doanh nghiệp"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-400"
              />

              <select className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-400">
                <option>Chọn gói dịch vụ</option>
                <option>Enterprise LMS</option>
                <option>Video Storage 60GB</option>
                <option>Certificate Service</option>
              </select>

              <input
                placeholder="Giá trị hóa đơn"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-400"
              />

              <input
                placeholder="Hạn thanh toán"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-400"
              />

              <textarea
                placeholder="Ghi chú hóa đơn..."
                className="min-h-[110px] w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-400"
              />

              <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600">
                <FileText size={18} />
                Tạo hóa đơn
              </button>
            </div>
          </SectionCard>
        </div>

        <SectionCard title="Luồng xử lý hóa đơn">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {[
              {
                icon: FileText,
                title: "Tạo hóa đơn",
                desc: "Admin tạo hóa đơn theo gói dịch vụ LMS.",
              },
              {
                icon: CreditCard,
                title: "Gửi thanh toán",
                desc: "Hệ thống gửi thông báo thanh toán cho doanh nghiệp.",
              },
              {
                icon: Clock3,
                title: "Theo dõi hạn",
                desc: "Tự động cảnh báo hóa đơn gần đến hạn hoặc quá hạn.",
              },
              {
                icon: CheckCircle2,
                title: "Xác nhận",
                desc: "Cập nhật trạng thái sau khi thanh toán thành công.",
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