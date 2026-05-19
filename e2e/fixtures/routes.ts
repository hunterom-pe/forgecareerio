export type PublicRoute = {
  path: string;
  name: string;
  expectedHeading?: RegExp;
};

export const publicRoutes: PublicRoute[] = [
  { path: "/", name: "home", expectedHeading: /hiring managers/i },
  { path: "/login", name: "login" },
  { path: "/pricing", name: "pricing" },
  { path: "/support", name: "support" },
  { path: "/privacy", name: "privacy" },
  { path: "/terms", name: "terms" },
];
