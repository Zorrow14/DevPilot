// Express admin routes will be defined here.

export const adminRoutes = {
  basePath: "/api/admin",
  plannedEndpoints: [
    "GET /users",
    "GET /projects",
    "GET /skills",
    "GET /roadmaps",
    "GET /feedback",
    "POST /announcements",
  ],
};
