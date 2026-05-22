"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/lms/AppShell";
import SectionCard from "@/components/lms/SectionCard";
import {
  BookOpen,
  FolderTree,
  GraduationCap,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  Tag,
  Trash2,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type Category = {
  id: string;
  name: string;
  code: string;
  group_name: string;
  description: string | null;
  priority: number;
  status: string;
  created_at: string;
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

function getStatusLabel(status: string) {
  if (status === "active") return "Đang hoạt động";
  if (status === "inactive") return "Tạm ẩn";
  return status || "Không rõ";
}

function getStatusClass(status: string) {
  if (status === "active") return "bg-green-100 text-green-700";
  return "bg-slate-100 text-slate-600";
}

export default function LMSAdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [keyword, setKeyword] = useState("");

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [groupName, setGroupName] = useState("GENERAL");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("0");

  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success"
  );

  const filteredCategories = useMemo(() => {
    const value = keyword.trim().toLowerCase();

    if (!value) return categories;

    return categories.filter((item) => {
      return (
        item.name?.toLowerCase().includes(value) ||
        item.code?.toLowerCase().includes(value) ||
        item.group_name?.toLowerCase().includes(value) ||
        item.description?.toLowerCase().includes(value)
      );
    });
  }, [categories, keyword]);

  const stats = useMemo(() => {
    return {
      total: categories.length,
      active: categories.filter((item) => item.status === "active").length,
      priority: categories.filter((item) => Number(item.priority || 0) > 0)
        .length,
      groups: new Set(categories.map((item) => item.group_name)).size,
    };
  }, [categories]);

  async function fetchCategories() {
    try {
      setLoading(true);
      setMessage("");

      const token = getToken();

      if (!token) {
        throw new Error("Không tìm thấy token đăng nhập.");
      }

      const response = await fetch(`${API_URL}/course-categories`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Không lấy được danh mục khóa học");
      }

      setCategories(data.categories || []);
    } catch (error) {
      setMessageType("error");
      setMessage(
        error instanceof Error ? error.message : "Không lấy được danh mục"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateCategory(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setCreating(true);
      setMessage("");

      const token = getToken();

      if (!token) {
        throw new Error("Không tìm thấy token đăng nhập.");
      }

      const response = await fetch(`${API_URL}/course-categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          code: code.trim(),
          group_name: groupName,
          description: description.trim(),
          priority: Number(priority || 0),
          status: "active",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Tạo danh mục thất bại");
      }

      setMessageType("success");
      setMessage("Tạo danh mục khóa học thành công.");

      setName("");
      setCode("");
      setGroupName("GENERAL");
      setDescription("");
      setPriority("0");

      await fetchCategories();
    } catch (error) {
      setMessageType("error");
      setMessage(error instanceof Error ? error.message : "Tạo danh mục thất bại");
    } finally {
      setCreating(false);
    }
  }

  async function handleDeleteCategory(id: string) {
    if (!window.confirm("Bạn có chắc muốn xóa danh mục này không?")) return;

    try {
      const token = getToken();

      if (!token) {
        throw new Error("Không tìm thấy token đăng nhập.");
      }

      const response = await fetch(`${API_URL}/course-categories/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Xóa danh mục thất bại");
      }

      setMessageType("success");
      setMessage("Xóa danh mục thành công.");

      await fetchCategories();
    } catch (error) {
      setMessageType("error");
      setMessage(error instanceof Error ? error.message : "Xóa danh mục thất bại");
    }
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <AppShell workspace="lms-admin" title="Danh mục khóa học">
      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
            <div>
              <p className="text-sm font-semibold text-orange-600">
                Course Categories
              </p>

              <h1 className="mt-2 text-3xl font-bold text-slate-950">
                Quản lý danh mục khóa học
              </h1>

              <p className="mt-2 text-slate-500">
                Phân loại khóa học theo nghiệp vụ, phòng ban và mục tiêu đào
                tạo.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchCategories}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-60"
            >
              <RefreshCw size={18} />
              {loading ? "Đang tải..." : "Làm mới"}
            </button>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <FolderTree className="text-orange-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {stats.total}
            </p>
            <p className="text-sm text-slate-500">Tổng danh mục</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <BookOpen className="text-orange-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {stats.active}
            </p>
            <p className="text-sm text-slate-500">Đang hoạt động</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Settings2 className="text-orange-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {stats.groups}
            </p>
            <p className="text-sm text-slate-500">Nhóm nghiệp vụ</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Tag className="text-orange-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {stats.priority}
            </p>
            <p className="text-sm text-slate-500">Danh mục ưu tiên</p>
          </div>
        </section>

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

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <SectionCard title="Tạo danh mục mới" action="Database">
            <form onSubmit={handleCreateCategory} className="space-y-4">
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                placeholder="Tên danh mục"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-400"
              />

              <input
                value={code}
                onChange={(event) => setCode(event.target.value)}
                required
                placeholder="Mã danh mục, ví dụ: CRM_CSKH"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-400"
              />

              <select
                value={groupName}
                onChange={(event) => setGroupName(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-400"
              >
                <option value="GENERAL">GENERAL</option>
                <option value="ONBOARDING">ONBOARDING</option>
                <option value="CRM">CRM</option>
                <option value="SALES">SALES</option>
                <option value="HR">HR</option>
                <option value="TRAINING">TRAINING</option>
                <option value="OPERATION">OPERATION</option>
              </select>

              <input
                type="number"
                min={0}
                value={priority}
                onChange={(event) => setPriority(event.target.value)}
                placeholder="Độ ưu tiên"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-400"
              />

              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={5}
                placeholder="Mô tả danh mục..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-400"
              />

              <button
                type="submit"
                disabled={creating}
                className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-60"
              >
                <Plus size={18} />
                {creating ? "Đang tạo..." : "Tạo danh mục"}
              </button>
            </form>
          </SectionCard>

          <SectionCard title="Danh sách danh mục" action="Dữ liệu thật">
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <Search size={18} className="text-slate-400" />
              <input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Tìm danh mục..."
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {filteredCategories.map((category) => (
                <div
                  key={category.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                      <GraduationCap size={22} />
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusClass(
                        category.status
                      )}`}
                    >
                      {getStatusLabel(category.status)}
                    </span>
                  </div>

                  <h3 className="mt-4 text-lg font-bold text-slate-950">
                    {category.name}
                  </h3>

                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                    {category.description || "Chưa có mô tả danh mục"}
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-xs text-slate-500">Mã</p>
                      <p className="mt-1 font-bold text-slate-950">
                        {category.code}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-xs text-slate-500">Nhóm</p>
                      <p className="mt-1 font-bold text-slate-950">
                        {category.group_name}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm font-semibold text-orange-600">
                      Ưu tiên: {category.priority || 0}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(category.id)}
                      className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}

              {filteredCategories.length === 0 && !loading && (
                <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
                  Chưa có danh mục khóa học nào.
                </div>
              )}
            </div>
          </SectionCard>
        </div>
      </div>
    </AppShell>
  );
}