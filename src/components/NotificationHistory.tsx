import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck, FileText, ClipboardList, Trophy, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useUnreadCount } from "@/hooks/useUnreadCount";
import {
  useNotificationsList,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
} from "@/hooks/useNotifications";
import { getNotificationRoute } from "@/lib/notificationRoutes";
import type { Notification, NotificationType } from "@/types/notification";
import { Skeleton } from "@/components/ui/skeleton";

const TYPE_ICONS: Record<NotificationType, React.ComponentType<{ className?: string }>> = {
  CIRCULAR: FileText,
  QUIZ_PUBLISHED: ClipboardList,
  ATTEMPT_GRADED: Trophy,
  CLASS_ENROLLED: Users,
};

function formatTime(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3600_000);
  const diffDays = Math.floor(diffMs / 86400_000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export function NotificationHistory() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { count, refetch: refetchCount } = useUnreadCount();
  const { data, isLoading } = useNotificationsList(
    { page: 1, limit: 10, sortBy: "createdAt:desc" },
    { enabled: open },
  );

  const { mutate: markAsRead } = useMarkNotificationAsRead();
  const { mutate: markAllAsRead, isPending: markingAll } =
    useMarkAllNotificationsAsRead();

  const notifications = data?.notifications ?? [];
  const hasUnread = notifications.some((n) => !n.read);

  const handleNotificationClick = (n: Notification) => {
    if (!n.read) {
      markAsRead(n.id, { onSuccess: refetchCount });
    }
    const path = getNotificationRoute(n, user!.role);
    navigate(path);
    setOpen(false);
  };

  const handleMarkAllRead = () => {
    markAllAsRead(undefined, {
      onSuccess: () => {
        refetchCount();
        setOpen(false);
      },
    });
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Notifications"
          className="relative"
        >
          <Bell className="size-4" />
          {count > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex min-w-4.5 items-center justify-center rounded-full bg-primary px-1 py-0.5 text-[10px] font-medium text-primary-foreground">
              {count > 99 ? "99+" : count}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-[min(22rem,calc(100vw-2rem))] max-h-112 overflow-hidden p-0 rounded-xl"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <h4 className="font-display text-sm font-semibold">Notifications</h4>
          {hasUnread && (
            <Button
              variant="ghost"
              size="xs"
              onClick={handleMarkAllRead}
              disabled={markingAll}
            >
              <CheckCheck className="size-3.5 mr-1.5" />
              Mark all read
            </Button>
          )}
        </div>
        <div className="overflow-y-auto max-h-80">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-10 px-4">
              No notifications yet.
            </p>
          ) : (
            <div className="divide-y divide-border/50">
              {notifications.map((n) => {
                const Icon = TYPE_ICONS[n.type];
                return (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => handleNotificationClick(n)}
                    className={`w-full text-left px-4 py-3 flex gap-3 hover:bg-accent/50 transition-colors ${
                      !n.read ? "bg-accent/20" : ""
                    }`}
                  >
                    <div
                      className={`shrink-0 mt-0.5 rounded-full p-1.5 ${
                        !n.read ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Icon className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium leading-tight">{n.title}</p>
                      {n.message && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {n.message}
                        </p>
                      )}
                      <p className="text-[10px] text-muted-foreground/70 mt-1">
                        {formatTime(n.createdAt)}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
