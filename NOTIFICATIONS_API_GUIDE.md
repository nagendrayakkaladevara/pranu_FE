# Notifications API — Frontend Integration Guide

This guide documents how the VECQES frontend integrates with the backend Notifications API. It complements the backend service documentation.

## Backend Reference

| Concept | Description |
| :------ | :---------- |
| **Base URL** | `{VITE_API_URL}/notifications` (default: `http://localhost:4000/v1/notifications`) |
| **Auth** | Bearer token required on all endpoints |
| **Delivery** | REST API only. Frontend polls for updates (e.g. every 30–60 seconds) |
| **Access** | All authenticated users see only their own notifications |

### Backend Endpoints

| Method | Path | Description |
| :----- | :--- | :---------- |
| `GET` | `/notifications` | List notifications (paginated) |
| `GET` | `/notifications/unread-count` | Get unread count (for badge) |
| `PATCH` | `/notifications/:notificationId/read` | Mark one as read |
| `PATCH` | `/notifications/read-all` | Mark all as read |

### Backend Notification Types

| Type | Trigger | Recipients |
| :--- | :------ | :--------- |
| `CIRCULAR` | Lecturer creates a circular/notice/announcement | Students in target class/department/all |
| `QUIZ_PUBLISHED` | Lecturer publishes a quiz to classes | Students in assigned classes |
| `ATTEMPT_GRADED` | Lecturer grades a quiz attempt | The student who took the quiz |
| `CLASS_ENROLLED` | Admin assigns students to a class | The enrolled students |

---

## TypeScript Types

```typescript
// src/types/notification.ts

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
```

---

## API Client

```typescript
// src/lib/notificationsApi.ts

export interface GetNotificationsOptions {
  page?: number;
  limit?: number;
  read?: boolean;
  type?: string;  // CIRCULAR | QUIZ_PUBLISHED | ATTEMPT_GRADED | CLASS_ENROLLED
  sortBy?: string;  // Format: field:asc or field:desc (e.g. "createdAt:desc")
}

getNotifications(options?: GetNotificationsOptions): Promise<NotificationsResponse>
getUnreadCount(): Promise<number>
markNotificationAsRead(notificationId: string): Promise<Notification | undefined>
markAllNotificationsAsRead(): Promise<void>
```

All requests use Bearer token authentication via the shared API client.

### List Query Parameters (GET /notifications)

| Param | Type | Default | Notes |
| :---- | :--- | :----- | :---- |
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Items per page |
| `read` | boolean | — | Filter: `true` = read only, `false` = unread only |
| `type` | string | — | Filter: `CIRCULAR`, `QUIZ_PUBLISHED`, `ATTEMPT_GRADED`, `CLASS_ENROLLED` |
| `sortBy` | string | — | Format: `field:asc` or `field:desc` (e.g. `createdAt:desc`) |

---

## React Hooks

### useNotificationsList

Fetches paginated notifications. Use when opening the notifications panel.

```typescript
import { useNotificationsList } from "@/hooks/useNotifications";

const { data, isLoading, error } = useNotificationsList(
  { page: 1, limit: 10, sortBy: "createdAt:desc" },
  { enabled: isPanelOpen }
);

const notifications = data?.notifications ?? [];
```

### useUnreadCount

Polls the unread count every 30–60 seconds. Pauses when the tab is hidden. Use for the badge.

```typescript
import { useUnreadCount } from "@/hooks/useUnreadCount";

const { count, error, refetch } = useUnreadCount(45_000);  // 45s default
```

### useMarkNotificationAsRead

Marks a single notification as read. Invalidates the notifications query on success.

```typescript
import { useMarkNotificationAsRead } from "@/hooks/useNotifications";

const { mutate: markAsRead } = useMarkNotificationAsRead();

markAsRead(notificationId, {
  onSuccess: () => refetchCount(),
  onError: () => toast.error("Failed to mark as read"),
});
```

### useMarkAllNotificationsAsRead

Marks all notifications as read. Returns 204; invalidates queries on success.

```typescript
import { useMarkAllNotificationsAsRead } from "@/hooks/useNotifications";

const { mutate: markAllAsRead, isPending } = useMarkAllNotificationsAsRead();

markAllAsRead(undefined, {
  onSuccess: () => { refetchCount(); closePanel(); },
  onError: () => toast.error("Failed to mark all as read"),
});
```

---

## Navigation from Notifications

The backend provides `link` and `metadata` for each notification. The frontend maps these to in-app routes based on user role via `getNotificationRoute()`.

### Backend link/metadata (from API)

| Type | link | metadata |
| :--- | :--- | :------- |
| `CIRCULAR` | `/circulars/:id` | `circularId` |
| `QUIZ_PUBLISHED` | `/exam/quizzes` | `quizId` |
| `ATTEMPT_GRADED` | `/exam/attempts/:id` | `attemptId` |
| `CLASS_ENROLLED` | `/classes/:id` | `classId` |

### Frontend route mapping

| Type | Recipients | Frontend route |
| :--- | :--------- | :------------- |
| CIRCULAR | All | `{prefix}/circulars` |
| QUIZ_PUBLISHED | Students | `/student/quizzes` |
| QUIZ_PUBLISHED | Lecturers | `/lecturer/quizzes` |
| ATTEMPT_GRADED | Students | `/student/results` + `state: { attemptId }` |
| CLASS_ENROLLED | Students | `/student` (dashboard) |
| CLASS_ENROLLED | Admin | `/admin/classes` |

```typescript
import { getNotificationRoute } from "@/lib/notificationRoutes";

const { path, state } = getNotificationRoute(notification, user.role);
navigate(path, { state });
```

---

## Error Handling

- **401**: API client handles refresh; redirects to login if refresh fails.
- **404** (mark one as read): Notification not found or does not belong to the current user. Show toast.
- **Network errors**: Caught in mutation `onError`; show toast.

---

## Integration Checklist

1. **Badge** — Poll `GET /notifications/unread-count` every 30–60s via `useUnreadCount`.
2. **List** — Call `GET /notifications` when opening the panel via `useNotificationsList`.
3. **Mark read** — Call `PATCH .../:notificationId/read` on click; `PATCH .../read-all` for "Mark all read".
4. **Navigate** — Use `getNotificationRoute()` for path and optional state.
