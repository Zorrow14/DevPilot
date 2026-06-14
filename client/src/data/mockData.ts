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
  name: "DevPilot User",
  email: "user@example.com",
  role: "user",
};

export const mockSkills: Skill[] = [
  {
    id: "skill-1",
    name: "React",
    category: "Frontend",
    level: "beginner",
  },
];

export const mockProjects: Project[] = [
  {
    id: "project-1",
    title: "Portfolio Website",
    description: "A starter project placeholder.",
    status: "planned",
  },
];

export const mockTasks: Task[] = [
  {
    id: "task-1",
    projectId: "project-1",
    title: "Create project plan",
    completed: false,
  },
];

export const mockRoadmaps: Roadmap[] = [
  {
    id: "roadmap-1",
    title: "Frontend Basics",
    description: "A placeholder learning roadmap.",
    steps: ["HTML", "CSS", "JavaScript", "React"],
  },
];

export const mockAnnouncements: Announcement[] = [
  {
    id: "announcement-1",
    title: "Welcome to DevPilot",
    message: "Project structure is ready for the next phase.",
  },
];

export const mockAdminUsers: User[] = [
  {
    id: "admin-1",
    name: "DevPilot Admin",
    email: "admin@example.com",
    role: "admin",
  },
];

export const mockFeedback: Feedback[] = [
  {
    id: "feedback-1",
    userId: "user-1",
    message: "This is placeholder feedback.",
    status: "open",
  },
];
