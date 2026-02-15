import { Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AttemptSummary } from "@/types/student";

const STATUS_CLASSES: Record<string, string> = {
  IN_PROGRESS: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  COMPLETED: "bg-green-500/15 text-green-400 border-green-500/30",
  TIMED_OUT: "bg-red-500/15 text-red-400 border-red-500/30",
};

interface AttemptsTableProps {
  attempts: AttemptSummary[];
  onViewResult: (attempt: AttemptSummary) => void;
}

export function AttemptsTable({ attempts, onViewResult }: AttemptsTableProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  return (
    <>
    {/* Mobile card view */}
    <div className="md:hidden space-y-3">
      {attempts.map((attempt) => (
        <div key={attempt.id} className="rounded-xl border border-border bg-card p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm truncate mr-2">{attempt.quizTitle}</span>
            <Badge variant="outline" className={STATUS_CLASSES[attempt.status] ?? ""}>
              {attempt.status.replace("_", " ")}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span>
              <span className="font-display font-semibold">{attempt.score}</span>
              <span className="text-muted-foreground">/{attempt.totalMarks}</span>
            </span>
            <span className="text-muted-foreground">{formatDuration(attempt.timeTaken)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{formatDate(attempt.submittedAt)}</span>
            {(attempt.status === "COMPLETED" || attempt.status === "TIMED_OUT") &&
              (attempt.resultVisible !== false ? (
                <Button variant="ghost" size="sm" onClick={() => onViewResult(attempt)}>
                  <Eye className="size-4 mr-1" />
                  View
                </Button>
              ) : (
                <span className="text-xs text-muted-foreground">Results not yet available</span>
              ))}
          </div>
        </div>
      ))}
    </div>

    {/* Desktop table view */}
    <div className="hidden md:block rounded-xl border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Quiz</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Time Taken</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {attempts.map((attempt) => (
            <TableRow key={attempt.id}>
              <TableCell className="font-medium">{attempt.quizTitle}</TableCell>
              <TableCell>
                <span className="font-display font-semibold">
                  {attempt.score}
                </span>
                <span className="text-muted-foreground">
                  /{attempt.totalMarks}
                </span>
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={STATUS_CLASSES[attempt.status] ?? ""}
                >
                  {attempt.status.replace("_", " ")}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDuration(attempt.timeTaken)}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(attempt.submittedAt)}
              </TableCell>
              <TableCell className="text-right">
                {(attempt.status === "COMPLETED" ||
                  attempt.status === "TIMED_OUT") &&
                  (attempt.resultVisible !== false ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewResult(attempt)}
                    >
                      <Eye className="size-4 mr-1" />
                      View
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      Results not yet available
                    </span>
                  ))}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
    </>
  );
}
