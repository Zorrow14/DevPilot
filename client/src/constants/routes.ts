export const routes = {
  home: "/",
  login: "/login",
  register: "/register",
  dashboard: "/dashboard",
  skills: "/skills",
  projects: "/projects",
  roadmap: "/roadmap",
  profile: "/profile",
} as const;

export const adminRoutes = {
  home: "/admin",
  users: "/admin/users",
  projects: "/admin/projects",
  skills: "/admin/skills",
  roadmaps: "/admin/roadmaps",
  feedback: "/admin/feedback",
  announcements: "/admin/announcements",
} as const;
