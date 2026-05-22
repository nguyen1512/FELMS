import { BookOpen, Clock, GraduationCap, Trophy, Users, Award } from "lucide-react";
import type { CourseItem } from "@/types/lms";

export const adminStats = [
  { title: "Nhân sự", value: "242", description: "Tổng nhân sự đang hoạt động", icon: Users },
  { title: "Phòng ban", value: "8", description: "Phòng ban trong hệ thống", icon: BookOpen },
  { title: "Không hoạt động", value: "3", description: "Tài khoản cần kiểm tra", icon: Clock },
  { title: "Vai trò", value: "6", description: "Nhóm quyền đã cấu hình", icon: Award },
];

export const lmsAdminStats = [
  { title: "Nhân sự", value: "242", description: "Người học trong LMS", icon: Users },
  { title: "Khóa học", value: "867", description: "Khóa học đã tạo", icon: BookOpen },
  { title: "Giờ đã học", value: "30.52", description: "Tổng thời lượng học", icon: Clock },
  { title: "Tỷ lệ hoàn thành", value: "19%", description: "Toàn hệ thống LMS", icon: Trophy },
];

export const employeeStats = [
  { title: "Giờ đã học", value: "7.21", description: "Tổng thời lượng cá nhân", icon: Clock },
  { title: "Tỷ lệ hoàn thành", value: "15.55%", description: "Theo khóa được giao", icon: Trophy },
  { title: "Thứ hạng", value: "1", description: "Theo giờ học", icon: Award },
  { title: "Khóa học", value: "55", description: "Đã được gán", icon: BookOpen },
];

export const courses: CourseItem[] = [
  {
    id: 1,
    title: "Hướng dẫn sử dụng hệ thống AnU for Leading Business",
    category: "Quản trị & Vận hành",
    progress: 2.78,
    learners: 9,
    lessons: 48,
    status: "Đang học",
    thumbnail: "/course-1.jpg",
  },
  {
    id: 2,
    title: "Khóa đào tạo hội nhập nhân viên mới",
    category: "Nhân sự",
    progress: 3.68,
    learners: 25,
    lessons: 12,
    status: "Đang học",
    thumbnail: "/course-2.jpg",
  },
  {
    id: 3,
    title: "Quy trình vận hành CRM cho đội CM",
    category: "Chăm sóc khách hàng",
    progress: 75,
    learners: 32,
    lessons: 18,
    status: "Quá hạn",
    thumbnail: "/course-3.jpg",
  },
  {
    id: 4,
    title: "Đào tạo sản phẩm và dịch vụ nội bộ",
    category: "Kinh doanh",
    progress: 100,
    learners: 48,
    lessons: 10,
    status: "Hoàn thành",
    thumbnail: "/course-4.jpg",
  },
];

export const topEmployees = [
  { name: "Nguyễn Thị Tuyết N.", department: "Kinh doanh", hours: "11.29", complete: "82.46%" },
  { name: "AnU Demo", department: "Đào tạo", hours: "7.22", complete: "15.33%" },
  { name: "Nguyễn Thị Diệu Ng.", department: "Kinh doanh", hours: "6.28", complete: "38.41%" },
  { name: "Ngô Hồng Nhung", department: "Phòng Kinh doanh", hours: "2.47", complete: "30.36%" },
];

export const competency = [
  { label: "Kiến thức sản phẩm", value: 86 },
  { label: "Quy trình nội bộ", value: 78 },
  { label: "Kỹ năng hệ thống", value: 92 },
  { label: "Xử lý tình huống", value: 74 },
  { label: "Tuân thủ quy định", value: 88 },
];