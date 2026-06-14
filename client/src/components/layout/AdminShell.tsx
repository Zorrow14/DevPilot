import { AdminSidebar } from "./AdminSidebar";
import { PageHeader } from "./PageHeader";
import { TopBar } from "./TopBar";

type AdminShellProps = {
  children: React.ReactNode;
  title: string;
  description?: string;
};

export function AdminShell({ children, title, description }: AdminShellProps) {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-slate-200">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[280px_1fr]">
        <AdminSidebar />
        <section className="w-full px-5 py-6 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <TopBar />
            <PageHeader title={title} description={description} />
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}
