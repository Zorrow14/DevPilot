import type {
  Announcement,
  Feedback,
  Project,
  Roadmap,
  Skill,
  Task,
  User,
} from "@/src/types";
import { getAuthToken } from "@/src/lib/authToken";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

/** Per-component readiness percentages behind the overall score. */
export type ReadinessBreakdown = {
  overall: number;
  skills: number;
  projects: number;
  tasks: number;
  coverage: number;
};

export type DashboardStatsResponse = {
  user: User;
  readiness: ReadinessBreakdown;
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

/** The raw Postgres user row, as returned by GET /api/users/me. */
export type UserProfile = {
  id: string;
  firebaseUid: string;
  email: string;
  name: string;
  imageUrl: string | null;
  targetRole: string | null;
  preferredStack: string[];
  role: "USER" | "ADMIN";
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  updatedAt: string;
};

export type UserProfilePayload = {
  name?: string;
  targetRole?: string | null;
  preferredStack?: string[];
};

// Payload fields stay loosely typed as strings to match the server services,
// which accept any casing/separator and normalize to the Prisma enums themselves.
export type SkillPayload = {
  name?: string;
  category?: string;
  level?: string;
  progress?: number;
  notes?: string | null;
};

export type ProjectPayload = {
  title?: string;
  description?: string | null;
  techStack?: string[];
  status?: string;
  priority?: string;
  deadline?: string | null;
  progress?: number;
};

export type TaskPayload = {
  title?: string;
  description?: string | null;
  status?: string;
  priority?: string;
  dueDate?: string | null;
};

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
};

function send(path: string, options: RequestOptions, token: string | null) {
  const headers: Record<string, string> = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  return fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    signal: options.signal,
  });
}

async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  let token = await getAuthToken();
  let response = await send(path, options, token);

  // A cached token can be revoked server-side or skewed past validity without
  // being "expired", which getIdToken() alone will not catch. Retry once with a
  // forced refresh before giving up. The body is already serialized to a string,
  // so nothing has been consumed.
  if (response.status === 401 && token) {
    token = await getAuthToken(true);

    if (token) {
      response = await send(path, options, token);
    }
  }

  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    const message =
      typeof (body as { message?: unknown } | null)?.message === "string"
        ? (body as { message: string }).message
        : `API request failed: ${response.status}`;

    throw new ApiError(response.status, message);
  }

  // Delete endpoints answer 204 with an empty body, which response.json() throws on.
  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const api = {
  getDashboardStats: (signal?: AbortSignal) =>
    apiRequest<DashboardStatsResponse>("/api/dashboard/stats", { signal }),
  getSkills: (signal?: AbortSignal) => apiRequest<Skill[]>("/api/skills", { signal }),
  getProjects: (signal?: AbortSignal) => apiRequest<Project[]>("/api/projects", { signal }),
  getProject: (id: string, signal?: AbortSignal) =>
    apiRequest<Project>(`/api/projects/${id}`, { signal }),
  getProjectTasks: (projectId: string, signal?: AbortSignal) =>
    apiRequest<Task[]>(`/api/projects/${projectId}/tasks`, { signal }),
  getRoadmaps: (signal?: AbortSignal) => apiRequest<Roadmap[]>("/api/roadmaps", { signal }),
  getAnnouncements: (signal?: AbortSignal) =>
    apiRequest<Announcement[]>("/api/announcements", { signal }),
  getAdminOverview: (signal?: AbortSignal) =>
    apiRequest<AdminOverviewResponse>("/api/admin/overview", { signal }),
  getAdminUsers: (signal?: AbortSignal) => apiRequest<User[]>("/api/admin/users", { signal }),
  getAdminProjects: (signal?: AbortSignal) =>
    apiRequest<Project[]>("/api/admin/projects", { signal }),
  getAdminSkills: (signal?: AbortSignal) => apiRequest<Skill[]>("/api/admin/skills", { signal }),
  getAdminRoadmaps: (signal?: AbortSignal) =>
    apiRequest<Roadmap[]>("/api/admin/roadmaps", { signal }),
  getAdminFeedback: (signal?: AbortSignal) =>
    apiRequest<Feedback[]>("/api/admin/feedback", { signal }),
  getAdminAnnouncements: (signal?: AbortSignal) =>
    apiRequest<Announcement[]>("/api/admin/announcements", { signal }),

  getMe: (signal?: AbortSignal) => apiRequest<UserProfile>("/api/users/me", { signal }),
  updateMe: (body: UserProfilePayload) =>
    apiRequest<UserProfile>("/api/users/me", { method: "PATCH", body }),
  syncUser: (signal?: AbortSignal) =>
    apiRequest<UserProfile>("/api/auth/sync-user", { method: "POST", signal }),

  createSkill: (body: SkillPayload) => apiRequest<Skill>("/api/skills", { method: "POST", body }),
  updateSkill: (id: string, body: SkillPayload) =>
    apiRequest<Skill>(`/api/skills/${id}`, { method: "PUT", body }),
  deleteSkill: (id: string) => apiRequest<void>(`/api/skills/${id}`, { method: "DELETE" }),

  createProject: (body: ProjectPayload) =>
    apiRequest<Project>("/api/projects", { method: "POST", body }),
  updateProject: (id: string, body: ProjectPayload) =>
    apiRequest<Project>(`/api/projects/${id}`, { method: "PUT", body }),
  deleteProject: (id: string) => apiRequest<void>(`/api/projects/${id}`, { method: "DELETE" }),

  // Tasks are created under their project but updated and deleted on a flat route.
  createProjectTask: (projectId: string, body: TaskPayload) =>
    apiRequest<Task>(`/api/projects/${projectId}/tasks`, { method: "POST", body }),
  updateTask: (id: string, body: TaskPayload) =>
    apiRequest<Task>(`/api/tasks/${id}`, { method: "PUT", body }),
  deleteTask: (id: string) => apiRequest<void>(`/api/tasks/${id}`, { method: "DELETE" }),
};
