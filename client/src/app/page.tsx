import Link from "next/link";
import { ButtonLink } from "@/src/components/ui/ButtonLink";
import { Card } from "@/src/components/ui/Card";
import { ProgressBar } from "@/src/components/ui/ProgressBar";
import { mockProjects, mockSkills, mockTasks, mockUser } from "@/src/data/mockData";
import { routes } from "@/src/constants/routes";

const features = [
  {
    title: "Skill Tracking",
    description: "Map your current skills, confidence level, and weekly practice focus.",
  },
  {
    title: "Project Planning",
    description: "Organize portfolio projects, milestones, deadlines, and tech stacks.",
  },
  {
    title: "AI Roadmaps",
    description: "Preview structured learning paths now, with real AI planned later.",
  },
  {
    title: "Internship Readiness",
    description: "Measure progress across skills, projects, tasks, and career goals.",
  },
  {
    title: "Admin Insights",
    description: "Monitor users, feedback, project activity, and roadmap adoption.",
  },
];

export default function HomePage() {
  const activeProject = mockProjects[0];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-slate-200">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link href={routes.home} className="text-xl font-bold text-slate-900 dark:text-slate-100">
          DevPilot
        </Link>
        <nav className="flex items-center gap-3">
          <Link
            href={routes.login}
            className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 hover:text-indigo-700 dark:text-slate-300 dark:hover:text-indigo-300"
          >
            Login
          </Link>
          <ButtonLink href={routes.dashboard}>Get Started</ButtonLink>
        </nav>
      </header>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-16">
        <div>
          <p className="mb-4 w-fit rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 dark:border-indigo-500/40 dark:bg-indigo-500/10 dark:text-indigo-300">
            Developer growth, organized
          </p>
          <h1 className="max-w-4xl text-4xl font-bold leading-tight tracking-tight text-slate-900 dark:text-slate-100 sm:text-5xl lg:text-6xl">
            Navigate your developer growth with DevPilot.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
            Track skills, manage projects, generate learning roadmaps, and
            measure internship readiness from one clean dashboard.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={routes.dashboard} className="px-5 py-3">
              Get Started
            </ButtonLink>
            <ButtonLink href={routes.projects} variant="secondary" className="px-5 py-3">
              View Demo
            </ButtonLink>
          </div>
        </div>

        <Card className="p-5 sm:p-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-700">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Dashboard Preview
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {mockUser.targetRole}
              </p>
            </div>
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
              {mockUser.readinessScore}%
            </span>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
              <p className="text-sm text-slate-500 dark:text-slate-400">Skills</p>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
                {mockSkills.length}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
              <p className="text-sm text-slate-500 dark:text-slate-400">Open tasks</p>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
                {mockTasks.filter((task) => !task.completed).length}
              </p>
            </div>
          </div>
          <div className="mt-5 rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-semibold text-slate-900 dark:text-slate-100">
                {activeProject.title}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {activeProject.progress}%
              </p>
            </div>
            <ProgressBar value={activeProject.progress} />
          </div>
        </Card>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-16">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {features.map((feature) => (
            <Card key={feature.title}>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {feature.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
