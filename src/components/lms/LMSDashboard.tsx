"use client";

import {
  BookOpen,
  BarChart3,
  Users,
  Award,
  Upload,
  Target,
  GraduationCap,
  PlayCircle,
  ShieldCheck,
} from "lucide-react";

const menuByRole = {
  admin: [
    { label: "Dashboard", icon: BarChart3 },
    { label: "Người dùng", icon: Users },
    { label: "Khóa học", icon: BookOpen },
    { label: "Báo cáo", icon: BarChart3 },
  ],

  "lms-admin": [
    { label: "Dashboard", icon: BarChart3 },
    { label: "Khóa học", icon: BookOpen },
    { label: "Lộ trình", icon: Target },
    { label: "Chứng chỉ", icon: Award },
  ],

  employee: [
    { label: "Khóa học", icon: GraduationCap },
    { label: "Video", icon: PlayCircle },
    { label: "Bài tập", icon: Upload },
    { label: "Chứng chỉ", icon: ShieldCheck },
  ],
};

const statsByRole = {
  admin: [
    {
      title: "Tổng người dùng",
      value: "248",
      color: "bg-blue-500",
    },
    {
      title: "Khóa học",
      value: "42",
      color: "bg-orange-500",
    },
    {
      title: "Phòng ban",
      value: "8",
      color: "bg-green-500",
    },
  ],

  "lms-admin": [
    {
      title: "Khóa học",
      value: "42",
      color: "bg-orange-500",
    },
    {
      title: "Video bài giảng",
      value: "320",
      color: "bg-red-500",
    },
    {
      title: "Lộ trình",
      value: "15",
      color: "bg-purple-500",
    },
  ],

  employee: [
    {
      title: "Khóa đang học",
      value: "4",
      color: "bg-orange-500",
    },
    {
      title: "Tiến độ",
      value: "76%",
      color: "bg-green-500",
    },
    {
      title: "Chứng chỉ",
      value: "2",
      color: "bg-blue-500",
    },
  ],
};

type RoleType = "admin" | "lms-admin" | "employee";

type Props = {
  role?: RoleType;
};

export default function LMSDashboard({
  role = "admin",
}: Props) {
  const menus = menuByRole[role];
  const stats = statsByRole[role];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {menus.map((item, index) => {
          const Icon = item.icon;

          return (
            <div
              key={index}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                <Icon size={22} />
              </div>

              <h3 className="font-bold text-slate-800">
                {item.label}
              </h3>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div
              className={`mb-4 h-3 w-20 rounded-full ${stat.color}`}
            />

            <p className="text-sm text-slate-500">
              {stat.title}
            </p>

            <h2 className="mt-2 text-3xl font-bold text-slate-900">
              {stat.value}
            </h2>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-bold text-slate-900">
          Tổng quan hệ thống LMS
        </h2>

        <div className="space-y-4">
          <div>
            <p className="mb-1 text-sm text-slate-500">
              Trạng thái hệ thống
            </p>

            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-[92%] rounded-full bg-green-500" />
            </div>
          </div>

          <div>
            <p className="mb-1 text-sm text-slate-500">
              Tiến độ học tập trung bình
            </p>

            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-[76%] rounded-full bg-orange-500" />
            </div>
          </div>

          <div>
            <p className="mb-1 text-sm text-slate-500">
              Tỷ lệ hoàn thành khóa học
            </p>

            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-[68%] rounded-full bg-blue-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}