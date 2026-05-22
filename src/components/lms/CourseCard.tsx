import Link from "next/link";
import type { CourseItem } from "@/types/lms";
import ProgressBar from "./ProgressBar";

type Props = {
  course: CourseItem;
};

export default function CourseCard({ course }: Props) {
  return (
    <Link
      href="/course-detail"
      className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:border-orange-300 hover:shadow-md"
    >
      <div className="mb-4 flex h-32 items-center justify-center rounded-xl bg-orange-100 text-sm font-semibold text-orange-700">
        AnU Course
      </div>

      <h3 className="line-clamp-2 min-h-[48px] font-bold text-slate-900">
        {course.title}
      </h3>

      <p className="mt-1 text-sm text-slate-500">{course.category}</p>

      <div className="mt-4">
        <div className="mb-2 flex justify-between text-xs text-slate-500">
          <span>Hoàn thành</span>
          <span>{course.progress}%</span>
        </div>
        <ProgressBar value={course.progress} />
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
        <span>{course.lessons} bài học</span>
        <span>{course.learners} nhân viên</span>
      </div>

      <div className="mt-4">
        <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
          {course.status}
        </span>
      </div>
    </Link>
  );
}