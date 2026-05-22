"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/lms/AppShell";
import SectionCard from "@/components/lms/SectionCard";
import {
  Building2,
  Edit3,
  Plus,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type DepartmentItem = {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  user_count?: number;
  created_at?: string;
};

function getCookie(name: string) {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
}

function getToken() {
  return localStorage.getItem("token") || getCookie("token");
}

export default function AdminDepartmentsPage() {
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [editingDepartment, setEditingDepartment] =
    useState<DepartmentItem | null>(null);

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success"
  );

  const totalUsers = useMemo(() => {
    return departments.reduce(
      (sum, item) => sum + Number(item.user_count || 0),
      0
    );
  }, [departments]);

  async function fetchDepartments() {
    try {
      setLoading(true);

      const token = getToken();
      if (!token) throw new Error("Không tìm thấy token đăng nhập.");

      const response = await fetch(`${API_URL}/departments`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Không lấy được danh sách phòng ban");
      }

      setDepartments(data.departments || []);
    } catch (error) {
      setMessageType("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Không lấy được danh sách phòng ban"
      );
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setEditingDepartment(null);
    setName("");
    setCode("");
    setDescription("");
  }

  function handleEditDepartment(department: DepartmentItem) {
    setEditingDepartment(department);
    setName(department.name || "");
    setCode(department.code || "");
    setDescription(department.description || "");
    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (editingDepartment) {
      await handleUpdateDepartment();
      return;
    }

    await handleCreateDepartment();
  }

  async function handleCreateDepartment() {
    try {
      setLoading(true);
      setMessage("");

      const token = getToken();
      if (!token) throw new Error("Không tìm thấy token đăng nhập.");

      const response = await fetch(`${API_URL}/departments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          code: code.trim(),
          description: description.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Tạo phòng ban thất bại");
      }

      setMessageType("success");
      setMessage("Tạo phòng ban thành công.");

      resetForm();
      await fetchDepartments();
    } catch (error) {
      setMessageType("error");
      setMessage(
        error instanceof Error ? error.message : "Tạo phòng ban thất bại"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateDepartment() {
    if (!editingDepartment) return;

    try {
      setLoading(true);
      setMessage("");

      const token = getToken();
      if (!token) throw new Error("Không tìm thấy token đăng nhập.");

      const response = await fetch(
        `${API_URL}/departments/${editingDepartment.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: name.trim(),
            code: code.trim(),
            description: description.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Cập nhật phòng ban thất bại");
      }

      setMessageType("success");
      setMessage("Cập nhật phòng ban thành công.");

      resetForm();
      await fetchDepartments();
    } catch (error) {
      setMessageType("error");
      setMessage(
        error instanceof Error ? error.message : "Cập nhật phòng ban thất bại"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteDepartment(department: DepartmentItem) {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa phòng ban "${department.name}" không?`
    );

    if (!confirmed) return;

    try {
      setLoading(true);
      setMessage("");

      const token = getToken();
      if (!token) throw new Error("Không tìm thấy token đăng nhập.");

      const response = await fetch(`${API_URL}/departments/${department.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Xóa phòng ban thất bại");
      }

      setMessageType("success");
      setMessage("Xóa phòng ban thành công.");

      await fetchDepartments();
    } catch (error) {
      setMessageType("error");
      setMessage(
        error instanceof Error ? error.message : "Xóa phòng ban thất bại"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDepartments();
  }, []);

  return (
    <AppShell workspace="admin" title="Quản lý phòng ban">
      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
            <div>
              <p className="text-sm font-semibold text-orange-600">
                Department Management
              </p>

              <h1 className="mt-2 text-3xl font-bold text-slate-950">
                Quản lý phòng ban
              </h1>

              <p className="mt-2 text-slate-500">
                Tạo, chỉnh sửa và quản lý các phòng ban dùng cho phân quyền,
                gán khóa học và báo cáo nhân sự.
              </p>
            </div>

            <button
              type="button"
              onClick={resetForm}
              className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600"
            >
              <Plus size={18} />
              Thêm phòng ban
            </button>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Building2 className="text-orange-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {departments.length}
            </p>
            <p className="text-sm text-slate-500">Tổng phòng ban</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Users className="text-green-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {totalUsers}
            </p>
            <p className="text-sm text-slate-500">Tổng nhân sự đã gán</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Building2 className="text-blue-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {loading ? "..." : "Active"}
            </p>
            <p className="text-sm text-slate-500">Trạng thái module</p>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[420px_1fr]">
          <SectionCard
            title={editingDepartment ? "Cập nhật phòng ban" : "Tạo phòng ban"}
            action={editingDepartment ? "Đang chỉnh sửa" : "Biểu mẫu"}
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              {editingDepartment && (
                <div className="flex items-center justify-between rounded-xl border border-orange-200 bg-orange-50 px-4 py-3">
                  <div>
                    <p className="text-sm font-bold text-orange-700">
                      Đang sửa: {editingDepartment.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {editingDepartment.code}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-lg border border-orange-200 bg-white p-2 text-orange-600 hover:bg-orange-100"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              <input
                placeholder="Tên phòng ban"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-400"
                required
              />

              <input
                placeholder="Mã phòng ban, ví dụ: HR, IT, TRAINING"
                value={code}
                onChange={(event) => setCode(event.target.value.toUpperCase())}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm uppercase outline-none focus:border-orange-400"
                required
              />

              <textarea
                rows={5}
                placeholder="Mô tả phòng ban..."
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-400"
              />

              {message && (
                <div
                  className={`rounded-xl px-4 py-3 text-sm font-semibold ${
                    messageType === "success"
                      ? "border border-green-200 bg-green-50 text-green-700"
                      : "border border-red-200 bg-red-50 text-red-700"
                  }`}
                >
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Plus size={18} />
                {loading
                  ? "Đang xử lý..."
                  : editingDepartment
                  ? "Cập nhật phòng ban"
                  : "Tạo phòng ban"}
              </button>
            </form>
          </SectionCard>

          <SectionCard
            title={
              loading
                ? "Danh sách phòng ban - Đang tải..."
                : "Danh sách phòng ban"
            }
          >
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <Search size={18} className="text-slate-400" />
              <input
                placeholder="Tìm kiếm phòng ban..."
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-slate-500">
                  <tr>
                    <th className="p-4">Phòng ban</th>
                    <th className="p-4">Mã</th>
                    <th className="p-4 text-center">Nhân sự</th>
                    <th className="p-4">Mô tả</th>
                    <th className="p-4 text-right">Thao tác</th>
                  </tr>
                </thead>

                <tbody>
                  {departments.map((department) => (
                    <tr
                      key={department.id}
                      className="border-t border-slate-100"
                    >
                      <td className="p-4">
                        <p className="font-bold text-slate-950">
                          {department.name}
                        </p>
                      </td>

                      <td className="p-4">
                        <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
                          {department.code}
                        </span>
                      </td>

                      <td className="p-4 text-center font-bold text-slate-950">
                        {department.user_count || 0}
                      </td>

                      <td className="p-4 text-slate-600">
                        {department.description || "Chưa có mô tả"}
                      </td>

                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleEditDepartment(department)}
                            className="rounded-lg border border-orange-200 p-2 text-orange-600 hover:bg-orange-50"
                            title="Sửa phòng ban"
                          >
                            <Edit3 size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteDepartment(department)}
                            className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"
                            title="Xóa phòng ban"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {departments.length === 0 && !loading && (
                    <tr>
                      <td
                        className="p-6 text-center text-slate-500"
                        colSpan={5}
                      >
                        Chưa có phòng ban nào trong hệ thống.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </div>
      </div>
    </AppShell>
  );
}