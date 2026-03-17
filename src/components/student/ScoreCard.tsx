import { useEffect, useState } from "react";
import { Trophy, Clock, Target, CheckCircle2, XCircle } from "lucide-react";
import type { AttemptResult } from "@/types/student";

interface ScoreCardProps {
  result: AttemptResult;
}

const CIRCLE_SIZE = 140;
const STROKE_WIDTH = 10;
const RADIUS = (CIRCLE_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

export function ScoreCard({ result }: ScoreCardProps) {
  const scorePercentage =
    result.totalMarks > 0
      ? Math.round((result.score / result.totalMarks) * 100)
      : 0;

  const [animatedPct, setAnimatedPct] = useState(0);
  const passed = result.passed === true;
  const failed = result.passed === false;

  useEffect(() => {
    const id = setTimeout(() => setAnimatedPct(scorePercentage), 100);
    return () => clearTimeout(id);
  }, [scorePercentage]);

  const strokeDashoffset = CIRCUMFERENCE - (animatedPct / 100) * CIRCUMFERENCE;
  const strokeColor = passed
    ? "var(--color-emerald)"
    : failed
      ? "oklch(0.65 0.2 25)"
      : "var(--color-muted-foreground)";

  return (
    <div
      className={`
        score-card relative overflow-hidden rounded-2xl border p-6 sm:p-8
        transition-colors duration-300
        ${passed
          ? "border-emerald-500/40 bg-linear-to-br from-emerald-500/8 via-card to-card shadow-[0_0_60px_-12px_var(--color-emerald-glow)]"
          : failed
            ? "border-destructive/30 bg-linear-to-br from-destructive/5 via-card to-card"
            : "border-border bg-card"
        }
      `}
    >
      {/* Subtle grid pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
        style={{
          backgroundImage: `
            linear-gradient(var(--foreground) 1px, transparent 1px),
            linear-gradient(90deg, var(--foreground) 1px, transparent 1px)
          `,
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-10">
        {/* Circular progress ring */}
        <div
          className="score-card-ring flex shrink-0 items-center justify-center"
          style={{ width: CIRCLE_SIZE, height: CIRCLE_SIZE }}
        >
          <svg
            width={CIRCLE_SIZE}
            height={CIRCLE_SIZE}
            className="-rotate-90"
            aria-hidden
          >
            <circle
              cx={CIRCLE_SIZE / 2}
              cy={CIRCLE_SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke="var(--color-muted)"
              strokeWidth={STROKE_WIDTH}
            />
            <circle
              cx={CIRCLE_SIZE / 2}
              cy={CIRCLE_SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke={strokeColor}
              strokeWidth={STROKE_WIDTH}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={strokeDashoffset}
              className="transition-[stroke-dashoffset] duration-1000 ease-out"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span
              className="font-display text-3xl font-bold tabular-nums"
              style={{ color: strokeColor }}
            >
              {scorePercentage}
            </span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
              %
            </span>
          </div>
        </div>

        {/* Score details */}
        <div className="flex flex-1 flex-col gap-4 sm:gap-5">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1">
              Your Score
            </p>
            <p className="font-display text-4xl sm:text-5xl font-bold tabular-nums">
              {result.score}
              <span className="font-display text-xl sm:text-2xl font-medium text-muted-foreground ml-1">
                /{result.totalMarks}
              </span>
            </p>
          </div>

          {/* Pass/Fail badge with icon */}
          {result.passed != null && (
            <div
              className={`
                inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold
                ${passed
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-destructive/15 text-destructive border border-destructive/30"
                }
              `}
            >
              {passed ? (
                <CheckCircle2 className="size-4 shrink-0" />
              ) : (
                <XCircle className="size-4 shrink-0" />
              )}
              <span>{passed ? "Passed" : "Failed"}</span>
            </div>
          )}

          {/* Stats row */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Trophy className="size-4 shrink-0 text-amber-500/80" />
              <span>{scorePercentage}%</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="size-4 shrink-0" />
              <span>{formatDuration(result.timeTaken)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="size-4 shrink-0" />
              <span>Pass: {result.passMarks} marks</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
