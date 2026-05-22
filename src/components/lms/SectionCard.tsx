import type { ReactNode } from "react";

type Props = {
  title: string;
  action?: string;
  children: ReactNode;
};

export default function SectionCard({ title, action, children }: Props) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-950">{title}</h2>
        {action && (
          <button className="text-sm font-semibold text-orange-600">
            {action}
          </button>
        )}
      </div>
      {children}
    </section>
  );
}