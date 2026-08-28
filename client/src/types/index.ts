export type UserRole = "user" | "admin";

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  targetRole: string;
  preferredStack: string[];
  readinessScore: number;
  joinedAt: string;
};

export type Skill = {
  id: string;
  name: string;
  category: string;
  level: "beginner" | "intermediate" | "advanced";
  progress: number;
  lastPracticed: string;
};

export type Project = {
  id: string;
  title: string;
  description: string;
  // Mirrors the server's formatProject output: the Prisma ProjectStatus enum
  // lowercased with underscores swapped for hyphens (PLANNING -> "planning").
  status: "planning" | "in-progress" | "completed";
  priority: "low" | "medium" | "high";
  deadline: string;
  progress: number;
  techStack: string[];
};

export type Task = {
  id: string;
  projectId: string;
  title: string;
  status: "todo" | "in-progress" | "done";
  priority: "low" | "medium" | "high";
  dueDate: string;
  completed: boolean;
};

export type RoadmapStep = {
  id: string;
  title: string;
  description: string;
  duration: string;
  status: "planned" | "active" | "completed";
  /** Index into the generated weekly plan; what the progress toggle sends back. */
  week: number;
};

/**
 * The generated body, mirroring roadmapContentSchema on the server. Held
 * separately from the flat fields so the rich sections the README promises
 * (mini projects, mistakes to avoid, next steps) survive round-tripping through
 * the Json column.
 */
export type RoadmapContent = {
  title: string;
  summary: string;
  weeklyPlan: { week: number; focus: string; objectives: string[] }[];
  recommendedSkills: { name: string; reason: string }[];
  miniProjects: { title: string; description: string }[];
  milestones: { week: number; title: string }[];
  mistakesToAvoid: string[];
  nextSteps: string[];
};

export type Roadmap = {
  id: string;
  goal: string;
  targetRole: string;
  duration: string;
  currentSkills: string[];
  completedWeeks: number[];
  createdAt: string;
  /** Taken from the generated content, falling back to `goal` if it is unreadable. */
  title: string;
  description: string;
  /** Derived server-side from weeklyPlan + completedWeeks. */
  steps: RoadmapStep[];
  content: RoadmapContent | null;
};

export type Announcement = {
  id: string;
  title: string;
  message: string;
  audience: "users" | "admins" | "all";
  createdAt: string;
};

export type FeedbackStatus = "new" | "in-review" | "resolved" | "rejected";

export type Feedback = {
  id: string;
  userId: string;
  /** Only populated on the admin queue, which joins the submitter. */
  userName: string;
  userEmail: string;
  title: string;
  message: string;
  type: "bug" | "feature" | "general";
  status: FeedbackStatus;
  createdAt: string;
  updatedAt: string;
};
