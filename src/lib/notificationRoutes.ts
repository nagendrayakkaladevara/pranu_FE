import type { UserRole } from "@/types/auth";
import type { Notification } from "@/types/notification";

/**
 * Maps a notification to the correct in-app route based on user role.
 * Uses metadata when our routes differ from the API's suggested link.
 */
export function getNotificationRoute(
  notification: Notification,
  role: UserRole,
): string {
  const prefix = role === "ADMIN" ? "/admin" : role === "LECTURER" ? "/lecturer" : "/student";

  switch (notification.type) {
    case "CIRCULAR":
      return `${prefix}/circulars`;
    case "QUIZ_PUBLISHED":
      return role === "STUDENT" ? "/student/quizzes" : "/lecturer/quizzes";
    case "ATTEMPT_GRADED":
      return "/student/results";
    case "CLASS_ENROLLED":
      return "/admin/classes";
    default:
      return notification.link ?? prefix;
  }
}
