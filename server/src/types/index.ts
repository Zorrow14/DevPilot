export type UserRole = "user" | "admin";

export type ApiStatus = "planned" | "active" | "disabled";

export type RouteDefinition = {
  basePath: string;
  plannedEndpoints: string[];
};
