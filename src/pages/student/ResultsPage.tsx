import { useState, useCallback } from "react";
import { useAttempts } from "@/hooks/useAttempts";
import { useAttemptResult } from "@/hooks/useAttemptDetail";
import type { AttemptSummary } from "@/types/student";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { AttemptsTable } from "@/components/student/AttemptsTable";
import { ScoreCard } from "@/components/student/ScoreCard";
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

    return (
      <div className="p-6 space-y-6 animate-fade-up">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="size-4 mr-1" />
            Back
          </Button>
          <h2 className="font-display text-xl font-bold">{result.quizTitle}</h2>
        </div>

        <ScoreCard result={result} />

        {/* Grading status */}
        {result.pendingGrading && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 flex items-center gap-3">
            <AlertCircle className="size-5 text-amber-400 shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-400">Grading in progress</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Some responses are still being graded. Your score may update once all grading is complete.
              </p>
            </div>
          </div>
        )}
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
