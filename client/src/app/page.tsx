import Link from "next/link";
import { ButtonLink } from "@/src/components/ui/ButtonLink";
import { Card } from "@/src/components/ui/Card";
import { ProgressBar } from "@/src/components/ui/ProgressBar";
import { ReadinessGauge } from "@/src/components/ui/ReadinessGauge";
import { mockProjects, mockSkills, mockTasks, mockUser } from "@/src/data/mockData";
import { routes } from "@/src/constants/routes";

const modules = [
  {
    code: "SKL",
    title: "Skill Tracking",
    description: "Map what you know, what you're learning, and how recently you've practiced it.",
  },
  {
    code: "PRJ",
    title: "Project Planning",
    description: "Organize portfolio builds with deadlines, priority, and stack — one board per project.",
  },
  {
    code: "RDM",
    title: "AI Roadmaps",
    description: "Turn a target role into a sequenced path of what to learn next, and for how long.",
  },
  {
    code: "RDY",
    title: "Readiness Score",
    description: "One instrument reading that combines skills, shipped projects, and open tasks.",
  },
  {
    code: "ADM",
    title: "Admin Oversight",
    description: "Monitor signups, feedback, and roadmap adoption across the whole cohort.",
  },
];

export default function HomePage() {
  const activeProject = mockProjects[0];
  const openTasks = mockTasks.filter((task) => !task.completed).length;

  return (
    <main className="min-h-screen bg-panel text-ink">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link href={routes.home} className="font-display text-xl font-bold text-ink">
          DevPilot
        </Link>
        <nav className="flex items-center gap-3">
          <Link
            href={routes.login}
            className="rounded-bezel px-3 py-2 text-sm font-semibold text-ink-dim hover:text-beacon"
          >
            Login
          </Link>
          <ButtonLink href={routes.dashboard}>Get Started</ButtonLink>
        </nav>
      </header>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-16">
        <div>
          <p className="mb-4 flex w-fit items-center gap-2 rounded-bezel border border-bezel-bright bg-console px-3 py-1.5 font-display text-[0.6875rem] uppercase tracking-wider text-ink-dim">
            <span className="h-1.5 w-1.5 rounded-full bg-nominal" />
            Skills &middot; Projects &middot; Roadmap &middot; Readiness
          </p>
          <h1 className="max-w-xl font-display text-4xl font-bold leading-[1.1] tracking-tight text-ink sm:text-5xl">
            Know exactly how close you are to job-ready.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-ink-dim">
            DevPilot tracks the skills you&rsquo;re building, the projects you&rsquo;re shipping,
            and the tasks still open — then rolls it into one readiness reading, so you always
            know what to work on next.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={routes.dashboard} className="px-5 py-3">
              Get started
            </ButtonLink>
            <ButtonLink href={routes.projects} variant="secondary" className="px-5 py-3">
              See a sample workspace
            </ButtonLink>
          </div>
        </div>

        <Card>
          <div className="flex items-center justify-between border-b border-bezel pb-4">
            <p className="font-display text-[0.6875rem] uppercase tracking-wider text-ink-dim">
              Readiness instrument
            </p>
            <p className="text-sm text-ink-dim">{mockUser.targetRole}</p>
          </div>
          <div className="flex justify-center py-6">
            <ReadinessGauge value={mockUser.readinessScore} size={168} />
          </div>
          <div className="grid grid-cols-2 gap-3 border-t border-bezel pt-5">
            <div>
              <p className="font-display text-[0.6875rem] uppercase tracking-wider text-ink-dim">
                Skills tracked
              </p>
              <p className="mt-1 font-display text-2xl font-bold text-ink">{mockSkills.length}</p>
            </div>
            <div>
              <p className="font-display text-[0.6875rem] uppercase tracking-wider text-ink-dim">
                Open tasks
              </p>
              <p className="mt-1 font-display text-2xl font-bold text-ink">{openTasks}</p>
            </div>
          </div>
          <div className="mt-5 rounded-bezel border border-bezel bg-console-raised p-4">
            <div className="mb-2 flex items-center justify-between gap-4">
              <p className="text-sm font-semibold text-ink">{activeProject.title}</p>
              <p className="font-display text-sm text-ink-dim">{activeProject.progress}%</p>
            </div>
            <ProgressBar value={activeProject.progress} tone="heading" />
          </div>
        </Card>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {modules.map((module) => (
            <Card key={module.code}>
              <p className="font-display text-xs font-bold tracking-wider text-beacon">
                {module.code}
              </p>
              <h2 className="mt-3 text-base font-bold text-ink">{module.title}</h2>
              <p className="mt-2 text-sm leading-6 text-ink-dim">{module.description}</p>
            </Card>
          ))}
        </div>
      </section>

      <footer className="border-t border-bezel px-6 py-6 text-center">
        <p className="font-display text-[0.6875rem] uppercase tracking-wider text-ink-faint">
          DevPilot — growth instrumentation for developers
        </p>
      </footer>
    </main>
  );
}
