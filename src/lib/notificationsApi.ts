import { api } from "@/lib/api";
import type {
  Notification,
  NotificationsResponse,
  UnreadCountResponse,
} from "@/types/notification";

export interface GetNotificationsOptions {
  page?: number;
  limit?: number;
  read?: boolean;
  type?: string;
  sortBy?: string;
}

export async function getNotifications(
  options: GetNotificationsOptions = {},
): Promise<NotificationsResponse> {
  const { page = 1, limit = 10, read, type, sortBy } = options;
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (read !== undefined) params.set("read", String(read));
  if (type) params.set("type", type);
  if (sortBy) params.set("sortBy", sortBy);

  return api.get<NotificationsResponse>(`/notifications?${params}`);
}

export async function getUnreadCount(): Promise<number> {
  const { count } = await api.get<UnreadCountResponse>(
    "/notifications/unread-count",
  );
  return count;
}

export async function markNotificationAsRead(
  notificationId: string,
): Promise<Notification | undefined> {
  const result = await api.patch<Notification | undefined>(
    `/notifications/${notificationId}/read`,
    {},
  );
  return result;
}

export async function markAllNotificationsAsRead(): Promise<void> {
  await api.patch<undefined>("/notifications/read-all", {});
}
