import {
  Award,
  BarChart3,
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  CreditCard,
  FileBadge,
  FileText,
  FolderOpen,
  Gauge,
  GraduationCap,
  Landmark,
  LayoutDashboard,
  Medal,
  PackageCheck,
  Settings,
  ShieldCheck,
  Star,
  Trophy,
  UserCog,
  Users,
  Workflow,
} from "lucide-react";

import type { MenuGroup, Workspace } from "@/types/lms";

export const workspaceLabels: Record<Workspace, string> = {
  admin: "Admin hệ thống",
  "lms-admin": "Quản trị LMS",
  employee: "Học viên",
};

export const menuByWorkspace: Record<Workspace, MenuGroup[]> = {
  admin: [
    {
      title: "Nhân sự",
      items: [
        { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
        { label: "Nhân sự", href: "/admin/users", icon: Users },
        { label: "Phòng ban", href: "/admin/departments", icon: Landmark },
      ],
    },
    {
      title: "Hóa đơn",
      items: [
        { label: "Hóa đơn", href: "/admin/invoices", icon: CreditCard },
      ],
    },
    {
      title: "Vai trò và quyền",
      items: [
        { label: "Vai trò", href: "/admin/roles", icon: UserCog },
        { label: "Quyền", href: "/admin/permissions", icon: ShieldCheck },
      ],
    },
    {
      title: "Cài đặt",
      items: [
        {
          label: "Thông tin tài khoản",
          href: "/admin/account",
          icon: Settings,
        },
        {
          label: "Cấu hình hệ thống",
          href: "/admin/settings",
          icon: Settings,
        },
        {
          label: "Workflow Automation",
          href: "/admin/workflows",
          icon: Workflow,
        },
      ],
    },
  ],

  "lms-admin": [
    {
      title: "Quản lý yêu cầu",
      items: [
        { label: "Dashboard", href: "/lms-admin", icon: LayoutDashboard },
        {
          label: "Assign khóa học",
          href: "/lms-admin/assign",
          icon: ClipboardCheck,
        },
        {
          label: "Nhân sự đăng ký",
          href: "/lms-admin/registrations",
          icon: Users,
        },
        {
          label: "Duyệt subscription",
          href: "/lms-admin/subscriptions",
          icon: PackageCheck,
        },
      ],
    },
    {
      title: "Tài nguyên",
      items: [
        {
          label: "Storage Driver",
          href: "/lms-admin/storage",
          icon: FolderOpen,
        },
        {
          label: "Danh mục khóa học",
          href: "/lms-admin/categories",
          icon: BookOpen,
        },
        {
          label: "Khóa học",
          href: "/lms-admin/courses",
          icon: GraduationCap,
        },
        {
          label: "Bài thi & bài test",
          href: "/lms-admin/assessments",
          icon: ClipboardCheck,
        },
        {
          label: "Lớp đào tạo trực tiếp",
          href: "/lms-admin/live-classes",
          icon: CalendarDays,
        },
        {
          label: "Lộ trình học tập",
          href: "/lms-admin/learning-paths",
          icon: Workflow,
        },
        {
          label: "Quản lý giảng viên",
          href: "/lms-admin/instructors",
          icon: UserCog,
        },
        {
          label: "Kho huy hiệu",
          href: "/lms-admin/badges",
          icon: Award,
        },
      ],
    },
    {
      title: "Báo cáo",
      items: [
        {
          label: "Tổng quan học tập",
          href: "/lms-admin/reports/overview",
          icon: Gauge,
        },
        {
          label: "Xếp hạng học tập",
          href: "/lms-admin/reports/rankings",
          icon: Trophy,
        },
        {
          label: "Thời gian học tập",
          href: "/lms-admin/reports/study-time",
          icon: BarChart3,
        },
        {
          label: "Hoàn thành khóa học",
          href: "/lms-admin/reports/completions",
          icon: ClipboardCheck,
        },
        {
          label: "Chi phí đào tạo",
          href: "/lms-admin/reports/costs",
          icon: CreditCard,
        },
      ],
    },
  ],

  employee: [
    {
      title: "Kế hoạch học tập",
      items: [
        { label: "Dashboard", href: "/employee", icon: LayoutDashboard },
        {
          label: "Lộ trình phát triển",
          href: "/employee/development-path",
          icon: Workflow,
        },
        {
          label: "Kế hoạch học tập",
          href: "/employee/study-plan",
          icon: CalendarDays,
        },
        {
          label: "Lịch đào tạo trực tiếp",
          href: "/employee/training-schedule",
          icon: CalendarDays,
        },
      ],
    },
    {
      title: "Quản lý khóa học",
      items: [
        { label: "Khóa đang học", href: "/courses", icon: BookOpen },
        {
          label: "Lộ trình học tập",
          href: "/employee/learning-path",
          icon: Workflow,
        },
      ],
    },
    {
      title: "Luyện tập & kiểm tra",
      items: [
        {
          label: "Luyện tập có chủ đích",
          href: "/employee/practice",
          icon: FileText,
        },
        {
          label: "Các kỳ thi tham dự",
          href: "/employee/exams",
          icon: ClipboardCheck,
        },
      ],
    },
    {
      title: "Ghi nhận & thành tích",
      items: [
        { label: "Đánh giá 360", href: "/employee/feedback-360", icon: Star },
        {
          label: "Ghi nhận học tập",
          href: "/employee/recognition",
          icon: Medal,
        },
        {
          label: "Văn bằng - chứng chỉ",
          href: "/employee/certificates",
          icon: FileBadge,
        },
        { label: "Gamification", href: "/employee/gamification", icon: Award },
      ],
    },
  ],
};