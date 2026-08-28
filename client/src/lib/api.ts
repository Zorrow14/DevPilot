import type {
  Announcement,
  Feedback,
  FeedbackStatus,
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
  /** Breadth: how many of the four core stack areas have any skill tracked. */
  coverage: number;
  /** Follow-through: share of planned roadmap weeks actually ticked off. */
  roadmap: number;
  /** Depth: average skill progress within each core area. */
  categories: {
    frontend: number;
    backend: number;
    database: number;
    deployment: number;
  };
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

/** Headline counts for the admin overview cards. */
export type PlatformStats = {
  users: number;
  activeUsers: number;
  admins: number;
  projects: number;
  completedProjects: number;
  skills: number;
  roadmaps: number;
  tasks: number;
  completedTasks: number;
  openFeedback: number;
};

/**
 * A user as the admin table sees them: the profile plus the derived readiness
 * score and work counts, which a plain User does not carry.
 */
export type AdminUser = {
  id: string;
  name: string;
  email: string;
  imageUrl: string | null;
  role: "user" | "admin";
  status: "active" | "inactive";
  targetRole: string;
  preferredStack: string[];
  readinessScore: number;
  skillCount: number;
  projectCount: number;
  createdAt: string;
};

/** A project with its owner attached, which the user-facing Project lacks. */
export type AdminProject = {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  status: "planning" | "in-progress" | "completed";
  priority: "low" | "medium" | "high";
  progress: number;
  deadline: string;
  taskCount: number;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  createdAt: string;
};

export type AdminSkill = {
  id: string;
  name: string;
  category: string;
  level: "beginner" | "intermediate" | "advanced";
  progress: number;
  ownerName: string;
  lastPracticed: string;
};

export type SkillAnalytics = {
  totalSkills: number;
  averageProgress: number;
  mostAdded: { name: string; count: number; averageProgress: number }[];
  byCategory: { category: string; count: number; averageProgress: number }[];
  byLevel: { level: string; count: number }[];
};

export type RoadmapAnalytics = {
  totalGenerated: number;
  commonTargetRoles: { targetRole: string; count: number }[];
  recent: {
    id: string;
    goal: string;
    targetRole: string;
    duration: string;
    completedWeeks: number;
    ownerName: string;
    createdAt: string;
  }[];
};

export type AdminOverviewResponse = {
  stats: PlatformStats;
  users: AdminUser[];
  projects: AdminProject[];
  skills: AdminSkill[];
  roadmaps: RoadmapAnalytics;
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

export type AnnouncementPayload = {
  title?: string;
  message?: string;
};

export type FeedbackPayload = {
  title: string;
  message: string;
  type?: string;
};

export type GenerateRoadmapPayload = {
  goal: string;
  targetRole: string;
  duration: string;
  currentSkills?: string[];
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

/**
 * Builds a query string, omitting blank values so an empty search box means
 * "no filter" rather than `?search=`, which the server would treat as a real
 * (never-matching) term.
 */
function toQuery(params: Record<string, string | undefined>) {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value.trim() !== "") {
      search.set(key, value);
    }
  }

  const query = search.toString();

  return query ? `?${query}` : "";
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
  generateRoadmap: (body: GenerateRoadmapPayload) =>
    apiRequest<Roadmap>("/api/roadmaps/generate", { method: "POST", body }),
  setRoadmapWeek: (id: string, week: number, completed: boolean) =>
    apiRequest<Roadmap>(`/api/roadmaps/${id}/progress`, {
      method: "PATCH",
      body: { week, completed },
    }),
  deleteRoadmap: (id: string) => apiRequest<void>(`/api/roadmaps/${id}`, { method: "DELETE" }),
  getAnnouncements: (signal?: AbortSignal) =>
    apiRequest<Announcement[]>("/api/announcements", { signal }),
  getAdminOverview: (signal?: AbortSignal) =>
    apiRequest<AdminOverviewResponse>("/api/admin/overview", { signal }),
  getAdminUsers: (search?: string, signal?: AbortSignal) =>
    apiRequest<AdminUser[]>(`/api/admin/users${toQuery({ search })}`, { signal }),
  setUserRole: (id: string, role: "user" | "admin") =>
    apiRequest<AdminUser>(`/api/admin/users/${id}/role`, { method: "PATCH", body: { role } }),
  setUserStatus: (id: string, status: "active" | "inactive") =>
    apiRequest<AdminUser>(`/api/admin/users/${id}/status`, { method: "PATCH", body: { status } }),
  getAdminProjects: (filters: { status?: string; priority?: string } = {}, signal?: AbortSignal) =>
    apiRequest<AdminProject[]>(`/api/admin/projects${toQuery(filters)}`, { signal }),
  deleteAdminProject: (id: string) =>
    apiRequest<void>(`/api/admin/projects/${id}`, { method: "DELETE" }),
  getAdminSkills: (signal?: AbortSignal) =>
    apiRequest<AdminSkill[]>("/api/admin/skills", { signal }),
  getAdminSkillAnalytics: (signal?: AbortSignal) =>
    apiRequest<SkillAnalytics>("/api/admin/skills/analytics", { signal }),
  getAdminRoadmaps: (signal?: AbortSignal) =>
    apiRequest<RoadmapAnalytics>("/api/admin/roadmaps", { signal }),
  getAdminFeedback: (signal?: AbortSignal) =>
    apiRequest<Feedback[]>("/api/admin/feedback", { signal }),
  setFeedbackStatus: (id: string, status: FeedbackStatus) =>
    apiRequest<Feedback>(`/api/admin/feedback/${id}/status`, {
      method: "PATCH",
      body: { status },
    }),
  getAdminAnnouncements: (signal?: AbortSignal) =>
    apiRequest<Announcement[]>("/api/admin/announcements", { signal }),
  createAnnouncement: (body: AnnouncementPayload) =>
    apiRequest<Announcement>("/api/admin/announcements", { method: "POST", body }),
  updateAnnouncement: (id: string, body: AnnouncementPayload) =>
    apiRequest<Announcement>(`/api/admin/announcements/${id}`, { method: "PUT", body }),
  deleteAnnouncement: (id: string) =>
    apiRequest<void>(`/api/admin/announcements/${id}`, { method: "DELETE" }),

  getFeedback: (signal?: AbortSignal) => apiRequest<Feedback[]>("/api/feedback", { signal }),
  createFeedback: (body: FeedbackPayload) =>
    apiRequest<Feedback>("/api/feedback", { method: "POST", body }),
  deleteFeedback: (id: string) => apiRequest<void>(`/api/feedback/${id}`, { method: "DELETE" }),

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
