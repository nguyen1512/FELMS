import type { ReactNode } from "react";
import type { Workspace } from "@/types/lms";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

type Props = {
  workspace: Workspace;
  title: string;
  children: ReactNode;
};

export default function AppShell({ workspace, title, children }: Props) {
  return (
    <div className="min-h-screen bg-[#f6f7fb] text-slate-800">
      <Sidebar workspace={workspace} />

      <main className="ml-[280px] min-h-screen">
        <Topbar workspace={workspace} title={title} />

        <div className="p-6">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <p className="mb-2 text-sm text-slate-500">Dashboard</p>
              <h1 className="text-2xl font-bold text-slate-950">{title}</h1>
            </div>
          </div>

          {children}
        </div>
      </main>
    </div>
  );
}