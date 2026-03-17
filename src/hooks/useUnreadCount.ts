import { useState, useEffect, useCallback } from "react";
import { getUnreadCount } from "@/lib/notificationsApi";

const DEFAULT_POLL_INTERVAL_MS = 45_000;

/**
 * Polls the unread notification count. Pauses when the tab is hidden.
 */
export function useUnreadCount(pollIntervalMs = DEFAULT_POLL_INTERVAL_MS) {
  const [count, setCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const fetchCount = useCallback(async () => {
    try {
      const newCount = await getUnreadCount();
      setCount(newCount);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch");
    }
  }, []);

  useEffect(() => {
    fetchCount();

    let intervalId: ReturnType<typeof setInterval> | null = null;

    const schedulePoll = () => {
      if (document.visibilityState === "visible") {
        intervalId = setInterval(fetchCount, pollIntervalMs);
      }
    };

    const stopPoll = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchCount();
        schedulePoll();
      } else {
        stopPoll();
      }
    };

    schedulePoll();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      stopPoll();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchCount, pollIntervalMs]);

  return { count, error, refetch: fetchCount };
}
