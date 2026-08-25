export const PROJECT_CATEGORIES = [
  "Web Development",
  "WordPress",
  "UI / UX Design",
  "E-commerce",
  "Mobile App",
  "Web Application",
  "Landing Page",
  "Portfolio",
  "Corporate Website",
  "Custom Software",
] as const;

export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number];