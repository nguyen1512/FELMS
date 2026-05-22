import type { LucideIcon } from "lucide-react";

type Props = {
  title: string;
  value: string;
  description?: string;
  icon: LucideIcon;
};

export default function StatCard({ title, value, description, icon: Icon }: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <h3 className="mt-2 text-3xl font-bold text-slate-950">{value}</h3>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
          <Icon size={22} />
        </div>
      </div>
      {description && <p className="mt-3 text-sm text-slate-400">{description}</p>}
    </div>
  );
}