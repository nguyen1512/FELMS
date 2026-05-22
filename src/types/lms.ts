import type { LucideIcon } from "lucide-react";

export type Workspace = "admin" | "lms-admin" | "employee";

export type MenuItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export type MenuGroup = {
  title: string;
  items: MenuItem[];
};

export type StatItem = {
  title: string;
  value: string;
  description: string;
};

export type CourseItem = {
  id: number;
  title: string;
  category: string;
  progress: number;
  learners: number;
  lessons: number;
  status: "Đang học" | "Hoàn thành" | "Chưa bắt đầu" | "Quá hạn";
  thumbnail: string;
};