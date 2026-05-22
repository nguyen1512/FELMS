"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/lms/AppShell";
import SectionCard from "@/components/lms/SectionCard";
import {
  Archive,
  Database,
  FileText,
  Film,
  HardDrive,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UploadCloud,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type ResourceItem = {
  id: string;
  title: string;
  file_name?: string | null;
  file_type?: string | null;
  file_url?: string | null;
  size_mb?: number;
  storage_provider?: string | null;
  status: string;
  resource_type?: string | null;
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

function getFileIcon(type?: string | null) {
  if (type === "video") return Film;
  if (type === "pdf" || type === "document") return FileText;
  return Archive;
}

function getStatusLabel(status: string) {
  if (status === "ready") return "Sẵn sàng";
  if (status === "processing") return "Đang xử lý";
  if (status === "failed") return "Lỗi xử lý";
  return status || "Không rõ";
}

function getStatusClass(status: string) {
  if (status === "ready") return "bg-green-100 text-green-700";
  if (status === "processing") return "bg-orange-100 text-orange-700";
  if (status === "failed") return "bg-red-100 text-red-700";
  return "bg-slate-100 text-slate-600";
}

export default function LMSAdminStoragePage() {
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const [title, setTitle] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileType, setFileType] = useState("video");
  const [fileUrl, setFileUrl] = useState("");
  const [sizeMb, setSizeMb] = useState("0");
  const [status, setStatus] = useState("ready");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");

  const filteredResources = useMemo(() => {
    const value = keyword.trim().toLowerCase();
    if (!value) return resources;

    return resources.filter((item) => {
      return (
        item.title?.toLowerCase().includes(value) ||
        item.file_name?.toLowerCase().includes(value) ||
        item.file_type?.toLowerCase().includes(value) ||
        item.status?.toLowerCase().includes(value)
      );
    });
  }, [resources, keyword]);

  const stats = useMemo(() => {
    const totalMb = resources.reduce(
      (sum, item) => sum + Number(item.size_mb || 0),
      0
    );

    const videoCount = resources.filter(
      (item) => item.file_type === "video" || item.resource_type === "video"
    ).length;

    const processingCount = resources.filter(
      (item) => item.status === "processing"
    ).length;

    return {
      totalGb: 60,
      usedGb: Number((totalMb / 1024).toFixed(2)),
      videoCount,
      processingCount,
    };
  }, [resources]);

  async function fetchResources() {
    try {
      setLoading(true);
      setMessage("");

      const token = getToken();
      if (!token) throw new Error("Không tìm thấy token đăng nhập.");

      const response = await fetch(`${API_URL}/storage/resources`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Không lấy được tài nguyên");
      }

      setResources(data.resources || []);
    } catch (error) {
      setMessageType("error");
      setMessage(error instanceof Error ? error.message : "Không lấy được tài nguyên");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateResource(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setCreating(true);
      setMessage("");

      const token = getToken();
      if (!token) throw new Error("Không tìm thấy token đăng nhập.");

      const response = await fetch(`${API_URL}/storage/resources`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          file_name: fileName.trim(),
          file_type: fileType,
          file_url: fileUrl.trim(),
          size_mb: Number(sizeMb || 0),
          storage_provider: "cloudinary",
          status,
          resource_type: fileType === "video" ? "video" : "document",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Tạo tài nguyên thất bại");
      }

      setMessageType("success");
      setMessage("Tạo tài nguyên thành công.");

      setTitle("");
      setFileName("");
      setFileType("video");
      setFileUrl("");
      setSizeMb("0");
      setStatus("ready");

      await fetchResources();
    } catch (error) {
      setMessageType("error");
      setMessage(error instanceof Error ? error.message : "Tạo tài nguyên thất bại");
    } finally {
      setCreating(false);
    }
  }

  async function handleDeleteResource(id: string) {
    if (!window.confirm("Bạn có chắc muốn xóa tài nguyên này không?")) return;

    try {
      const token = getToken();
      if (!token) throw new Error("Không tìm thấy token đăng nhập.");

      const response = await fetch(`${API_URL}/storage/resources/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Xóa tài nguyên thất bại");
      }

      setMessageType("success");
      setMessage("Xóa tài nguyên thành công.");

      await fetchResources();
    } catch (error) {
      setMessageType("error");
      setMessage(error instanceof Error ? error.message : "Xóa tài nguyên thất bại");
    }
  }

  useEffect(() => {
    fetchResources();
  }, []);

  return (
    <AppShell workspace="lms-admin" title="Storage Driver">
      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
            <div>
              <p className="text-sm font-semibold text-orange-600">
                Resource & Streaming Storage
              </p>

              <h1 className="mt-2 text-3xl font-bold text-slate-950">
                Quản lý tài nguyên học tập
              </h1>

              <p className="mt-2 text-slate-500">
                Quản lý video bài giảng, tài liệu, file câu hỏi và trạng thái
                xử lý storage cho hệ thống LMS.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchResources}
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
            <HardDrive className="text-orange-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {stats.totalGb} GB
            </p>
            <p className="text-sm text-slate-500">Tổng dung lượng</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Database className="text-orange-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {stats.usedGb} GB
            </p>
            <p className="text-sm text-slate-500">Đã sử dụng</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Film className="text-orange-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {stats.videoCount}
            </p>
            <p className="text-sm text-slate-500">Video bài giảng</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Loader2 className="text-orange-600" size={24} />
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {stats.processingCount}
            </p>
            <p className="text-sm text-slate-500">Đang xử lý</p>
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

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <SectionCard title="Upload tài nguyên mới" action="Database">
            <form onSubmit={handleCreateResource} className="space-y-4">
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Tên tài nguyên"
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
              />

              <input
                value={fileName}
                onChange={(event) => setFileName(event.target.value)}
                placeholder="Tên file, ví dụ onboarding.mp4"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
              />

              <select
                value={fileType}
                onChange={(event) => setFileType(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
              >
                <option value="video">Video</option>
                <option value="pdf">PDF</option>
                <option value="excel">Excel</option>
                <option value="document">Document</option>
              </select>

              <input
                value={fileUrl}
                onChange={(event) => setFileUrl(event.target.value)}
                placeholder="URL file hoặc Cloudinary URL"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
              />

              <input
                type="number"
                min={0}
                value={sizeMb}
                onChange={(event) => setSizeMb(event.target.value)}
                placeholder="Dung lượng MB"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
              />

              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
              >
                <option value="ready">Sẵn sàng</option>
                <option value="processing">Đang xử lý</option>
                <option value="failed">Lỗi xử lý</option>
              </select>

              <button
                type="submit"
                disabled={creating}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-60"
              >
                <Plus size={18} />
                {creating ? "Đang tạo..." : "Thêm tài nguyên"}
              </button>
            </form>
          </SectionCard>

          <SectionCard title="Danh sách tài nguyên" action="Storage">
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <Search size={18} className="text-slate-400" />
              <input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Tìm tài nguyên..."
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>

            <div className="space-y-3">
              {filteredResources.map((item) => {
                const Icon = getFileIcon(item.file_type);

                return (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                          <Icon size={22} />
                        </div>

                        <div>
                          <h3 className="font-bold text-slate-950">
                            {item.title}
                          </h3>
                          <p className="mt-1 text-sm text-slate-500">
                            {item.file_name || "Chưa có tên file"} ·{" "}
                            {Number(item.size_mb || 0)} MB
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            Provider: {item.storage_provider || "cloudinary"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusClass(
                            item.status
                          )}`}
                        >
                          {getStatusLabel(item.status)}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleDeleteResource(item.id)}
                          className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredResources.length === 0 && !loading && (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
                  Chưa có tài nguyên nào.
                </div>
              )}
            </div>
          </SectionCard>
        </div>

        <SectionCard title="Luồng xử lý storage">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {[
              "Upload file gốc",
              "Lưu Cloudinary/S3",
              "Xử lý video",
              "Sẵn sàng phát",
            ].map((item, index) => (
              <div
                key={item}
                className="rounded-2xl border border-slate-200 bg-white p-5"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 font-bold text-orange-600">
                  {index + 1}
                </div>
                <p className="mt-4 font-bold text-slate-950">{item}</p>
                <p className="mt-2 text-sm text-slate-500">
                  Theo dõi trạng thái tài nguyên trong hệ thống LMS.
                </p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}