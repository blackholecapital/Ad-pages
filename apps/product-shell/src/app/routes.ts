export type RouteKey =
  | "home"
  | "members"
  | "admin";

export type AppRoute = {
  key: RouteKey;
  path: string;
  label: string;
};

export const routes: AppRoute[] = [
  { key: "home", path: "/", label: "Home" },
  { key: "members", path: "/members", label: "Members" },
  { key: "admin", path: "/admin", label: "Admin" }
];
