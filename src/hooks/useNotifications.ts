import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  type GetNotificationsOptions,
} from "@/lib/notificationsApi";

const NOTIFICATIONS_QUERY_KEY = ["notifications"] as const;

export function useNotificationsList(
  options: GetNotificationsOptions = {},
  queryOptions?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: [...NOTIFICATIONS_QUERY_KEY, options],
    queryFn: () => getNotifications(options),
    staleTime: 30_000,
    enabled: queryOptions?.enabled ?? true,
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) =>
      markNotificationAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
    },
  });
}
