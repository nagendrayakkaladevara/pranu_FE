import { useEffect, useState, useCallback } from "react";
import { Download, Printer } from "lucide-react";
import { api } from "@/lib/api";
import type { PaginatedQuizzes, QuizAnalyticsStats } from "@/types/lecturer";
import { Button } from "@/components/ui/button";
import { useQuizAnalytics } from "@/hooks/useQuizAnalytics";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { QuizStatsCards } from "@/components/lecturer/QuizStatsCards";
import { StudentResultsTable } from "@/components/lecturer/StudentResultsTable";

const EMPTY_STATS: QuizAnalyticsStats = {
  totalAttempts: 0,
  averageScore: 0,
  highestScore: 0,
  lowestScore: 0,
  passedCount: 0,
  failedCount: 0,
  passRate: 0,
};

interface QuizOption {
  id: string;
  title: string;
}

export default function AnalyticsPage() {
  const [quizOptions, setQuizOptions] = useState<QuizOption[]>([]);
  const [isLoadingQuizzes, setIsLoadingQuizzes] = useState(true);
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);

  const { analytics, isLoading, error } = useQuizAnalytics(selectedQuizId);

  const exportCSV = useCallback(() => {
    if (!analytics?.results?.length) return;

    const headers = ["Student Name", "Email", "Score", "Total Marks", "Status", "Time Taken (s)", "Submitted At"];
    const rows = analytics.results.map((r) => [
      r.student.name,
      r.student.email,
      r.score,
      r.totalMarks,
      r.status,
      r.timeTaken,
      r.submittedAt,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => {
          let str = String(cell);
          // Prevent formula injection
          if (/^[=+\-@\t\r]/.test(str)) str = `'${str}`;
          return str.includes(",") || str.includes('"')
            ? `"${str.replace(/"/g, '""')}"`
            : str;
        }).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const quizTitle = quizOptions.find((q) => q.id === selectedQuizId)?.title ?? "quiz";
    link.download = `${quizTitle.replace(/\s+/g, "_")}_results.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [analytics, selectedQuizId, quizOptions]);

  useEffect(() => {
    async function fetchQuizzes() {
      try {
        const data = await api.get<PaginatedQuizzes>(
          "/quizzes?limit=100&status=PUBLISHED&sortBy=createdAt:desc",
        );
        setQuizOptions(
          data.quizzes.map((q) => ({ id: q.id, title: q.title })),
        );
      } catch {
        // keep empty
      } finally {
        setIsLoadingQuizzes(false);
      }
    }
    fetchQuizzes();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="animate-fade-up">
        <h2 className="font-display text-2xl font-bold">Quiz Analytics</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Select a published quiz to view performance analytics.
        </p>
      </div>

      {/* Quiz Selector */}
      <div className="animate-fade-up" style={{ animationDelay: "0.05s" }}>
        {isLoadingQuizzes ? (
          <Skeleton className="h-10 w-64" />
        ) : quizOptions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No published quizzes found.
          </p>
        ) : (
          <Select
            value={selectedQuizId ?? ""}
            onValueChange={(v) => setSelectedQuizId(v || null)}
          >
            <SelectTrigger className="w-[320px]">
              <SelectValue placeholder="Select a quiz..." />
            </SelectTrigger>
            <SelectContent>
              {quizOptions.map((q) => (
                <SelectItem key={q.id} value={q.id}>
                  {q.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Analytics Content */}
      {selectedQuizId && (
        <div
          className="space-y-6 animate-fade-up"
          style={{ animationDelay: "0.1s" }}
        >
          {error ? (
            <div className="text-center py-12 text-muted-foreground rounded-xl border border-border bg-card">
              <p className="text-sm">{error}</p>
            </div>
          ) : (
            <>
              <QuizStatsCards
                stats={analytics?.stats ?? EMPTY_STATS}
                isLoading={isLoading}
              />

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display font-semibold text-lg">
                    Student Results
                  </h3>
                  {analytics?.results && analytics.results.length > 0 && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => window.print()}>
                        <Printer className="size-4 mr-1" />
                        Print / PDF
                      </Button>
                      <Button variant="outline" size="sm" onClick={exportCSV}>
                        <Download className="size-4 mr-1" />
                        Export CSV
                      </Button>
                    </div>
                  )}
                </div>
                <StudentResultsTable
                  results={analytics?.results ?? []}
                  isLoading={isLoading}
                />
              </div>
            </>
          )}
        </div>
      )}

      {!selectedQuizId && !isLoadingQuizzes && quizOptions.length > 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-sm">Select a quiz above to view analytics.</p>
        </div>
      )}
    </div>
  );
}
