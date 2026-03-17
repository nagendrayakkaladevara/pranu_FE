import { useEffect, useState } from "react";
import { Timer } from "lucide-react";

export function getCountdownText(startTime: string): string | null {
  const ms = new Date(startTime).getTime() - Date.now();
  if (ms <= 0) return null;

  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);

  if (days > 0) return `Starts in ${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `Starts in ${hours}h ${minutes}m`;
  if (minutes > 0) return `Starts in ${minutes}m ${seconds}s`;
  return `Starts in ${seconds}s`;
}

export function getCountdownMs(startTime: string): number {
  return new Date(startTime).getTime() - Date.now();
}

interface QuizCountdownProps {
  startTime: string;
  onReachZero?: () => void;
  /** Update interval in ms. Use 1000 for last minute precision. */
  updateInterval?: number;
  className?: string;
}

export function QuizCountdown({
  startTime,
  onReachZero,
  updateInterval = 60000,
  className = "",
}: QuizCountdownProps) {
  const [text, setText] = useState<string | null>(() =>
    getCountdownText(startTime)
  );

  useEffect(() => {
    const ms = getCountdownMs(startTime);
    if (ms <= 0) {
      setText(null);
      onReachZero?.();
      return;
    }

    // Use 1s interval when < 2 minutes remain for precision
    const interval =
      ms < 2 * 60 * 1000 ? 1000 : Math.min(updateInterval, 60000);

    const tick = () => {
      const next = getCountdownText(startTime);
      if (next === null) {
        setText(null);
        onReachZero?.();
        return;
      }
      setText(next);
    };

    const id = setInterval(tick, interval);
    return () => clearInterval(id);
  }, [startTime, onReachZero, updateInterval]);

  if (text === null) return null;

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-sm text-muted-foreground ${className}`}
    >
      <Timer className="size-4 shrink-0" />
      {text}
    </span>
  );
}
