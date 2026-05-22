"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/lms/AppShell";
import SectionCard from "@/components/lms/SectionCard";
import StatCard from "@/components/lms/StatCard";
import { BookOpen, Clock, Medal, Users } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type DashboardStats = {
  totalUsers: number;
  activeUsers: number;
  lockedUsers: number;
  totalDepartments: number;
  totalRoles: number;
};

function getCookie(name: string) {
  if (typeof document === "undefined") return null;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() || null;
  }

  return null;
}

function getToken() {
  return localStorage.getItem("token") || getCookie("token");
}

export default function AdminPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    lockedUsers: 0,
    totalDepartments: 0,
    totalRoles: 0,
  });

  const [loading, setLoading] = useState(true);

  async function fetchDashboardStats() {
    try {
      setLoading(true);

      const token = getToken();

      if (!token) {
        throw new Error("Không tìm thấy token đăng nhập.");
      }

      const response = await fetch(`${API_URL}/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Không lấy được dữ liệu dashboard");
      }

      setStats(data.stats);
    } catch (error) {
      console.error("Fetch dashboard stats error:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const adminStats = [
    {
      title: "Nhân sự",
      value: loading ? "..." : String(stats.totalUsers),
      subtitle: "Tổng tài khoản trong hệ thống",
      icon: Users,
    },
    {
      title: "Phòng ban",
      value: loading ? "..." : String(stats.totalDepartments),
      subtitle: "Phòng ban trong hệ thống",
      icon: BookOpen,
    },
    {
      title: "Không hoạt động",
      value: loading ? "..." : String(stats.lockedUsers),
      subtitle: "Tài khoản đang bị khóa",
      icon: Clock,
    },
    {
      title: "Vai trò",
      value: loading ? "..." : String(stats.totalRoles),
      subtitle: "Nhóm quyền đã cấu hình",
      icon: Medal,
    },
  ];

  return (
    <AppShell workspace="admin" title="Dashboard Admin hệ thống">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {adminStats.map((item) => (
          <StatCard key={item.title} {...item} />
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <SectionCard title="Thông tin doanh nghiệp">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-500">Tên hệ thống</p>
              <p className="text-lg font-bold">AnU Internal Learning System</p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Gói sử dụng</p>
              <p className="font-semibold text-orange-600">Enterprise LMS</p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Dung lượng video</p>
              <p className="font-semibold">1.1 / 60 GB</p>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Trạng thái hệ thống">
          <div className="space-y-3">
            {[
              "Auth Service",
              "Course Service",
              "Video Streaming",
              "Certificate Service",
            ].map((service) => (
              <div
                key={service}
                className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"
              >
                <span>{service}</span>
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                  Đang hoạt động
                </span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}