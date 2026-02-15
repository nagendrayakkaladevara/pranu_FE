import type { UserRole } from "@/types/auth";

export function getRoleDashboardPath(role: UserRole): string {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "LECTURER":
      return "/lecturer";
    case "STUDENT":
      return "/student";
  }
}
