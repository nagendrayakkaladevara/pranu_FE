import type { UserRole } from "@/types/auth";
import type { Notification } from "@/types/notification";

/** Result of mapping a notification to an in-app route. */
export interface NotificationRoute {
  path: string;
  state?: Record<string, unknown>;
}

/**
 * Maps a notification to the correct in-app route based on user role.
 * Aligns with backend spec: CIRCULAR, QUIZ_PUBLISHED, ATTEMPT_GRADED, CLASS_ENROLLED.
 * Uses metadata when our routes differ from the API's suggested link.
 */
export function getNotificationRoute(
  notification: Notification,
  role: UserRole,
): NotificationRoute {
  const prefix =
    role === "ADMIN" ? "/admin" : role === "LECTURER" ? "/lecturer" : "/student";

  switch (notification.type) {
    case "CIRCULAR":
      // Backend link: /circulars/:id. We use role-prefixed list; no detail route yet.
      return { path: `${prefix}/circulars` };
    case "QUIZ_PUBLISHED":
      // Backend link: /exam/quizzes. Students → My Quizzes; lecturers → Quiz Management.
      return {
        path: role === "STUDENT" ? "/student/quizzes" : "/lecturer/quizzes",
      };
    case "ATTEMPT_GRADED":
      // Backend link: /exam/attempts/:id. ResultsPage accepts attemptId in state.
      return {
        path: "/student/results",
        state: notification.metadata?.attemptId
          ? { attemptId: notification.metadata.attemptId }
          : undefined,
      };
    case "CLASS_ENROLLED":
      // Recipients are students. Admin assigns; students get notified. No student class view.
      return {
        path: role === "ADMIN" ? "/admin/classes" : "/student",
      };
    default:
      return { path: notification.link ?? prefix };
  }
}
