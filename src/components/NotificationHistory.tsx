import { useState, useSyncExternalStore } from "react";
import { Bell, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { notificationStore, type Notification } from "@/lib/notifications";

function useNotifications() {
  return useSyncExternalStore(
    notificationStore.subscribe,
    notificationStore.getAll,
  );
}

const typeColors: Record<Notification["type"], string> = {
  success: "text-green-400",
  error: "text-red-400",
  warning: "text-amber-400",
  info: "text-blue-400",
};

export function NotificationHistory() {
  const notifications = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notification history"
      >
        <Bell className="size-4" />
        {notifications.length > 0 && (
          <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-primary" />
        )}
      </Button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-50 w-80 rounded-xl border border-border bg-card shadow-lg max-h-96 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
              <h4 className="font-display text-sm font-semibold">Notifications</h4>
              {notifications.length > 0 && (
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => notificationStore.clear()}
                >
                  <Trash2 className="size-3 mr-1" />
                  Clear
                </Button>
              )}
            </div>
            <div className="overflow-y-auto max-h-80">
              {notifications.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No notifications yet.
                </p>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className="px-4 py-3 border-b border-border/10 last:border-0"
                  >
                    <p className={`text-sm ${typeColors[n.type]}`}>{n.message}</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1">
                      {n.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
