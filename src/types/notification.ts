export type NotificationType =
  | "CIRCULAR"
  | "QUIZ_PUBLISHED"
  | "ATTEMPT_GRADED"
  | "CLASS_ENROLLED";

export interface NotificationMetadata {
  circularId?: string;
  quizId?: string;
  attemptId?: string;
  classId?: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string | null;
  link: string | null;
  metadata?: NotificationMetadata;
  read: boolean;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

export interface UnreadCountResponse {
  count: number;
}
