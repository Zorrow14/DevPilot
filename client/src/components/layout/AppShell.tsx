import { MainSidebar } from "./MainSidebar";
import { PageHeader } from "./PageHeader";
import { TopBar } from "./TopBar";

type AppShellProps = {
  children: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export function AppShell({ children, title, description, action }: AppShellProps) {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-slate-200">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[260px_1fr]">
        <MainSidebar />
        <section className="w-full px-5 py-6 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <TopBar />
            <PageHeader title={title} description={description} action={action} />
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}
