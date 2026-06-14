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
  status: "planned" | "in-progress" | "completed";
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
};

export type Roadmap = {
  id: string;
  title: string;
  description: string;
  targetRole: string;
  duration: string;
  steps: RoadmapStep[];
  createdAt: string;
};

export type Announcement = {
  id: string;
  title: string;
  message: string;
  audience: "users" | "admins" | "all";
  createdAt: string;
};

export type Feedback = {
  id: string;
  userId: string;
  userName: string;
  message: string;
  status: "open" | "reviewed" | "closed";
  category: "bug" | "feature" | "general";
  createdAt: string;
};
