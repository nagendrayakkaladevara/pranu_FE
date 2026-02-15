import { useEffect, useState, useRef, useCallback } from "react";
import { toast } from "sonner";
import { Clock } from "lucide-react";

interface QuizTimerProps {
  endTime: string;
  onExpired: () => void;
}

export function QuizTimer({ endTime, onExpired }: QuizTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(() => {
    const diff = Math.max(
      0,
      Math.floor((new Date(endTime).getTime() - Date.now()) / 1000),
    );
    return diff;
  });
  const expiredRef = useRef(false);
  const onExpiredRef = useRef(onExpired);
  useEffect(() => {
    onExpiredRef.current = onExpired;
  }, [onExpired]);
  const warned5min = useRef(false);
  const warned1min = useRef(false);

  const formatTime = useCallback((total: number) => {
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    if (h > 0) {
      return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    }
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        const next = prev - 1;

        // Time warnings
        if (next <= 300 && next > 299 && !warned5min.current) {
          warned5min.current = true;
          toast.warning("5 minutes remaining!", { duration: 5000 });
        }
        if (next <= 60 && next > 59 && !warned1min.current) {
          warned1min.current = true;
          toast.error("1 minute remaining! Submit your quiz soon.", { duration: 8000 });
        }

        if (next <= 0 && !expiredRef.current) {
          expiredRef.current = true;
          setTimeout(() => onExpiredRef.current(), 0);
          return 0;
        }
        return Math.max(0, next);
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const isUrgent = secondsLeft <= 60;
  const isWarning = secondsLeft <= 300 && secondsLeft > 60;

  return (
    <div
      role="timer"
      aria-live="polite"
      aria-atomic="true"
      aria-label={`Time remaining: ${formatTime(secondsLeft)}`}
      className={`flex items-center gap-2 font-display text-lg font-bold tabular-nums ${
        isUrgent ? "text-red-500 animate-pulse" : isWarning ? "text-amber-500" : "text-foreground"
      }`}
    >
      <Clock className={`size-5 ${isUrgent ? "text-red-500" : isWarning ? "text-amber-500" : "text-muted-foreground"}`} aria-hidden="true" />
      <span>{formatTime(secondsLeft)}</span>
    </div>
  );
}
