import { useState, useCallback } from "react";
import { useAttempts } from "@/hooks/useAttempts";
import { useAttemptResult } from "@/hooks/useAttemptDetail";
import type { AttemptSummary } from "@/types/student";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trophy, Clock, Target } from "lucide-react";
import { AttemptsTable } from "@/components/student/AttemptsTable";
import { AttemptResultCard } from "@/components/student/AttemptResultCard";
import { DataTablePagination } from "@/components/admin/DataTablePagination";

export default function ResultsPage() {
  const { attempts, page, totalPages, totalResults, isLoading, setPage } =
    useAttempts();

  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(
    null,
  );

  const { result, isLoading: resultLoading } =
    useAttemptResult(selectedAttemptId ?? undefined);

  const handleViewResult = useCallback((attempt: AttemptSummary) => {
    setSelectedAttemptId(attempt.id);
  }, []);

  const handleBack = useCallback(() => {
    setSelectedAttemptId(null);
  }, []);

  // Detailed result view
  if (selectedAttemptId) {
    if (resultLoading) {
      return (
        <div className="p-6 space-y-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      );
    }

    if (!result) {
      return (
        <div className="p-6">
          <div className="text-center py-12 rounded-xl border border-border bg-card">
            <p className="text-sm text-destructive mb-4">
              Unable to load result.
            </p>
            <Button variant="outline" onClick={handleBack}>
              Back to Results
            </Button>
          </div>
        </div>
      );
    }

    const scorePercentage =
      result.totalMarks > 0
        ? Math.round((result.score / result.totalMarks) * 100)
        : 0;

    const formatDuration = (seconds: number) => {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m}m ${s}s`;
    };

    return (
      <div className="p-6 space-y-6 animate-fade-up">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="size-4 mr-1" />
            Back
          </Button>
          <h2 className="font-display text-xl font-bold">{result.quizTitle}</h2>
        </div>

        {/* Score summary */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="text-center sm:text-left">
              <p className="text-sm text-muted-foreground mb-1">Your Score</p>
              <p className="font-display text-4xl font-bold">
                {result.score}
                <span className="text-lg text-muted-foreground">
                  /{result.totalMarks}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <Badge
                variant="outline"
                className={
                  result.passed
                    ? "bg-green-500/15 text-green-400 border-green-500/30"
                    : "bg-red-500/15 text-red-400 border-red-500/30"
                }
              >
                {result.passed ? "PASSED" : "FAILED"}
              </Badge>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Trophy className="size-4" />
                <span>{scorePercentage}%</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock className="size-4" />
                <span>{formatDuration(result.timeTaken)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Target className="size-4" />
                <span>Pass: {result.passMarks} marks</span>
              </div>
            </div>
          </div>
        </div>

        {/* Per-question results */}
        <div>
          <h3 className="font-display text-lg font-semibold mb-4">
            Question Breakdown
          </h3>
          <div className="space-y-4">
            {result.questions.map((qr, i) => (
              <AttemptResultCard key={qr.question.id} result={qr} index={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Attempts list view
  return (
    <div className="p-6 space-y-6">
      <div className="animate-fade-up">
        <h2 className="font-display text-2xl font-bold">Results</h2>
        <p className="text-muted-foreground text-sm mt-1">
          View your past quiz attempts and scores.
        </p>
      </div>

      <div className="animate-fade-up" style={{ animationDelay: "0.05s" }}>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-xl" />
            ))}
          </div>
        ) : attempts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-sm">No attempts yet.</p>
          </div>
        ) : (
          <>
            <AttemptsTable
              attempts={attempts}
              onViewResult={handleViewResult}
            />
            {totalPages > 0 && (
              <DataTablePagination
                page={page}
                totalPages={totalPages}
                totalResults={totalResults}
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
