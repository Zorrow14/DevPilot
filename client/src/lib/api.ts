import type {
  Announcement,
  Feedback,
  Project,
  Roadmap,
  Skill,
  Task,
  User,
} from "@/src/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export type DashboardStatsResponse = {
  user: User;
  skills: Skill[];
  projects: Project[];
  tasks: Task[];
  roadmaps: Roadmap[];
  announcements: Announcement[];
};

export type AdminOverviewResponse = {
  users: User[];
  projects: Project[];
  skills: Skill[];
  roadmaps: Roadmap[];
  feedback: Feedback[];
  announcements: Announcement[];
};

async function apiRequest<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`);

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const api = {
  getDashboardStats: () => apiRequest<DashboardStatsResponse>("/api/dashboard/stats"),
  getSkills: () => apiRequest<Skill[]>("/api/skills"),
  getProjects: () => apiRequest<Project[]>("/api/projects"),
  getProject: (id: string) => apiRequest<Project>(`/api/projects/${id}`),
  getProjectTasks: (projectId: string) =>
    apiRequest<Task[]>(`/api/projects/${projectId}/tasks`),
  getRoadmaps: () => apiRequest<Roadmap[]>("/api/roadmaps"),
  getAnnouncements: () => apiRequest<Announcement[]>("/api/announcements"),
  getAdminOverview: () => apiRequest<AdminOverviewResponse>("/api/admin/overview"),
  getAdminUsers: () => apiRequest<User[]>("/api/admin/users"),
  getAdminProjects: () => apiRequest<Project[]>("/api/admin/projects"),
  getAdminSkills: () => apiRequest<Skill[]>("/api/admin/skills"),
  getAdminRoadmaps: () => apiRequest<Roadmap[]>("/api/admin/roadmaps"),
  getAdminFeedback: () => apiRequest<Feedback[]>("/api/admin/feedback"),
  getAdminAnnouncements: () => apiRequest<Announcement[]>("/api/admin/announcements"),
};
