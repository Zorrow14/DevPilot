export type UserRole = "user" | "admin";

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export type Skill = {
  id: string;
  name: string;
  category: string;
  level: "beginner" | "intermediate" | "advanced";
};

export type Project = {
  id: string;
  title: string;
  description: string;
  status: "planned" | "in-progress" | "completed";
};

export type Task = {
  id: string;
  projectId: string;
  title: string;
  completed: boolean;
};

export type Roadmap = {
  id: string;
  title: string;
  description: string;
  steps: string[];
};

export type Announcement = {
  id: string;
  title: string;
  message: string;
};

export type Feedback = {
  id: string;
  userId: string;
  message: string;
  status: "open" | "reviewed" | "closed";
};
