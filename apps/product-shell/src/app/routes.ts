export type RouteKey =
  | "home"
  | "members"
  | "exclusive"
  | "customer"
  | "admin";

export type AppRoute = {
  key: RouteKey;
  path: string;
  label: string;
};

export const routes: AppRoute[] = [
  { key: "home", path: "/", label: "Home" },
  { key: "members", path: "/members", label: "Members" },
  { key: "exclusive", path: "/exclusive", label: "Exclusive" },
  { key: "customer", path: "/customer", label: "Customer" },
  { key: "admin", path: "/admin", label: "Admin" }
];
