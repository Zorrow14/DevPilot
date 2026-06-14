import type {
  Announcement,
  Feedback,
  Project,
  Roadmap,
  Skill,
  Task,
  User,
} from "@/src/types";

export const mockUser: User = {
  id: "user-1",
  name: "Alyssa Chen",
  email: "alyssa.dev@example.com",
  role: "user",
  targetRole: "Frontend Developer Intern",
  preferredStack: ["Next.js", "TypeScript", "PostgreSQL"],
  readinessScore: 78,
  joinedAt: "2026-04-12",
};

export const mockSkills: Skill[] = [
  {
    id: "skill-1",
    name: "React Foundations",
    category: "Frontend",
    level: "intermediate",
    progress: 78,
    lastPracticed: "Today",
  },
  {
    id: "skill-2",
    name: "TypeScript",
    category: "Frontend",
    level: "intermediate",
    progress: 64,
    lastPracticed: "Yesterday",
  },
  {
    id: "skill-3",
    name: "REST API Design",
    category: "Backend",
    level: "beginner",
    progress: 42,
    lastPracticed: "3 days ago",
  },
  {
    id: "skill-4",
    name: "PostgreSQL Basics",
    category: "Database",
    level: "beginner",
    progress: 36,
    lastPracticed: "1 week ago",
  },
  {
    id: "skill-5",
    name: "UI Composition",
    category: "Design",
    level: "advanced",
    progress: 86,
    lastPracticed: "Today",
  },
];

export const mockProjects: Project[] = [
  {
    id: "project-1",
    title: "Developer Portfolio",
    description: "A polished personal site with case studies and a project archive.",
    status: "in-progress",
    priority: "high",
    deadline: "2026-07-05",
    progress: 72,
    techStack: ["Next.js", "Tailwind CSS", "TypeScript"],
  },
  {
    id: "project-2",
    title: "Task Planner API",
    description: "A backend practice project for CRUD routes, validation, and auth guards.",
    status: "planned",
    priority: "medium",
    deadline: "2026-07-22",
    progress: 28,
    techStack: ["Express", "Prisma", "PostgreSQL"],
  },
  {
    id: "project-3",
    title: "Study Tracker Dashboard",
    description: "Analytics dashboard for skill goals, study streaks, and weekly reviews.",
    status: "in-progress",
    priority: "medium",
    deadline: "2026-08-10",
    progress: 54,
    techStack: ["React", "Charts", "Mock Data"],
  },
];

export const mockTasks: Task[] = [
  {
    id: "task-1",
    projectId: "project-1",
    title: "Write portfolio hero copy",
    status: "done",
    priority: "medium",
    dueDate: "2026-06-16",
    completed: true,
  },
  {
    id: "task-2",
    projectId: "project-1",
    title: "Add project case study cards",
    status: "in-progress",
    priority: "high",
    dueDate: "2026-06-20",
    completed: false,
  },
  {
    id: "task-3",
    projectId: "project-2",
    title: "Draft route list",
    status: "todo",
    priority: "medium",
    dueDate: "2026-06-24",
    completed: false,
  },
  {
    id: "task-4",
    projectId: "project-3",
    title: "Design dashboard stat cards",
    status: "todo",
    priority: "low",
    dueDate: "2026-06-28",
    completed: false,
  },
];

export const mockRoadmaps: Roadmap[] = [
  {
    id: "roadmap-1",
    title: "Frontend Internship Sprint",
    description: "A mock AI roadmap focused on portfolio readiness and interview practice.",
    targetRole: "Frontend Developer Intern",
    duration: "8 weeks",
    createdAt: "2026-06-12",
    steps: [
      {
        id: "step-1",
        title: "Strengthen TypeScript fundamentals",
        description: "Practice typed props, reusable utility types, and API response models.",
        duration: "2 weeks",
        status: "active",
      },
      {
        id: "step-2",
        title: "Ship one polished portfolio case study",
        description: "Document problem, process, tradeoffs, screenshots, and outcomes.",
        duration: "2 weeks",
        status: "planned",
      },
      {
        id: "step-3",
        title: "Practice frontend interview rounds",
        description: "Review React rendering, accessibility, data fetching, and debugging.",
        duration: "4 weeks",
        status: "planned",
      },
    ],
  },
];

export const mockAnnouncements: Announcement[] = [
  {
    id: "announcement-1",
    title: "Mock roadmap generator is ready",
    message: "Roadmaps now show structured milestones using local mock data.",
    audience: "all",
    createdAt: "2026-06-14",
  },
  {
    id: "announcement-2",
    title: "Portfolio review checklist added",
    message: "Use the dashboard tasks to keep your internship portfolio moving.",
    audience: "users",
    createdAt: "2026-06-10",
  },
];

export const mockAdminUsers: User[] = [
  {
    id: "admin-1",
    name: "Maya Admin",
    email: "maya.admin@example.com",
    role: "admin",
    targetRole: "Platform Admin",
    preferredStack: ["Analytics", "Operations"],
    readinessScore: 96,
    joinedAt: "2026-03-01",
  },
  {
    id: "user-2",
    name: "Ravi Kumar",
    email: "ravi.dev@example.com",
    role: "user",
    targetRole: "Backend Developer Intern",
    preferredStack: ["Express", "PostgreSQL"],
    readinessScore: 67,
    joinedAt: "2026-05-08",
  },
  {
    id: "user-3",
    name: "Nora Lee",
    email: "nora.ui@example.com",
    role: "user",
    targetRole: "UI Engineer Intern",
    preferredStack: ["React", "Design Systems"],
    readinessScore: 84,
    joinedAt: "2026-04-25",
  },
];

export const mockFeedback: Feedback[] = [
  {
    id: "feedback-1",
    userId: "user-1",
    userName: "Alyssa Chen",
    message: "It would be useful to compare readiness score changes week over week.",
    status: "open",
    category: "feature",
    createdAt: "2026-06-13",
  },
  {
    id: "feedback-2",
    userId: "user-2",
    userName: "Ravi Kumar",
    message: "Project deadlines should show a stronger visual warning near due dates.",
    status: "reviewed",
    category: "general",
    createdAt: "2026-06-11",
  },
];
