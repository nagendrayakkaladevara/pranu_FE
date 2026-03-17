import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ClipboardList,
  CheckCircle2,
  TrendingUp,
  Award,
  Clock,
  ArrowRight,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useStudentQuizzes } from "@/hooks/useStudentQuizzes";
import type { StudentStatsResponse, StudentStatsSummary, AttemptSummary, PaginatedAttempts } from "@/types/student";
import { StatCard } from "@/components/admin/StatCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QuizCountdown } from "@/components/student/QuizCountdown";

export default function OverviewPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    active: activeQuizzes,
    upcoming: upcomingQuizzes,
    completed: completedQuizzes,
    isLoading: quizzesLoading,
    refetch: refetchQuizzes,
  } = useStudentQuizzes();
  const [stats, setStats] = useState<StudentStatsSummary>({
    totalAttempts: 0,
    averagePercentage: 0,
    quizzesPassed: 0,
    quizzesFailed: 0,
  });
  const [recentAttempts, setRecentAttempts] = useState<AttemptSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsResp, attemptsData] = await Promise.all([
          api.get<StudentStatsResponse>("/exam/my-stats"),
          api.get<PaginatedAttempts>(
            "/exam/attempts?limit=5&sortBy=submittedAt:desc",
          ),
        ]);
        setStats(statsResp.summary);
        setRecentAttempts(attemptsData.attempts);
      } catch {
        // Keep defaults
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const isLoadingAny = isLoading || quizzesLoading;

  return (
    <div className="p-4 sm:p-5 md:p-6 space-y-5 sm:space-y-6 pb-safe">
      <div className="animate-fade-up">
        <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight">
          Welcome back{user ? `, ${user.name.split(" ")[0]}` : ""}
        </h2>
        <p
          className="text-muted-foreground text-sm mt-0.5 sm:mt-1 animate-fade-up"
          style={{ animationDelay: "0.05s" }}
        >
          Here's your quiz performance overview.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Total Attempts"
          value={stats.totalAttempts}
          icon={ClipboardList}
          isLoading={isLoading}
        />
        <StatCard
          label="Quizzes Passed"
          value={stats.quizzesPassed}
          icon={CheckCircle2}
          isLoading={isLoading}
        />
        <StatCard
          label="Average %"
          value={Math.round(stats.averagePercentage)}
          icon={TrendingUp}
          isLoading={isLoading}
        />
        <StatCard
          label="Quizzes Failed"
          value={stats.quizzesFailed}
          icon={Award}
          isLoading={isLoading}
        />
      </div>

      {/* Upcoming Quizzes */}
      {upcomingQuizzes.length > 0 && (
        <div
          className="animate-fade-up"
          style={{ animationDelay: "0.08s" }}
        >
          <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4">
            <h3 className="font-display text-base sm:text-lg font-semibold">
              Upcoming Quizzes
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/student/quizzes")}
              className="shrink-0 min-h-11 touch-manipulation"
            >
              View all
              <ArrowRight className="size-4 ml-1" />
            </Button>
          </div>

          {quizzesLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingQuizzes.slice(0, 5).map((quiz) => (
                <div
                  key={quiz.id}
                  className="rounded-xl border border-border bg-card p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <h4 className="font-display font-semibold text-sm truncate">
                      {quiz.title}
                    </h4>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="size-3 shrink-0" />
                        {quiz.durationMinutes}m
                      </span>
                      <span>{quiz.totalMarks} marks</span>
                      <Badge
                        variant="outline"
                        className="bg-blue-500/15 text-blue-400 border-blue-500/30 text-[10px]"
                      >
                        UPCOMING
                      </Badge>
                    </div>
                    {quiz.startTime && (
                      <div className="mt-2">
                        <QuizCountdown
                          startTime={quiz.startTime}
                          onReachZero={refetchQuizzes}
                        />
                      </div>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full sm:w-auto min-h-11 touch-manipulation shrink-0 opacity-60 cursor-not-allowed"
                    disabled
                  >
                    Starts soon
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Active Quizzes */}
      <div
        className="animate-fade-up"
        style={{ animationDelay: "0.1s" }}
      >
        <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4">
          <h3 className="font-display text-base sm:text-lg font-semibold">
            Active Quizzes
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/student/quizzes")}
            className="shrink-0 min-h-11 touch-manipulation"
          >
            View all
            <ArrowRight className="size-4 ml-1" />
          </Button>
        </div>

        {isLoadingAny ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : activeQuizzes.length === 0 ? (
          <div className="text-center py-12 rounded-xl border border-border bg-card">
            <p className="text-sm text-muted-foreground">
              No active quizzes right now.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeQuizzes.slice(0, 5).map((quiz) => (
              <div
                key={quiz.id}
                className="rounded-xl border border-border bg-card p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4"
              >
                <div className="min-w-0 flex-1">
                  <h4 className="font-display font-semibold text-sm truncate">
                    {quiz.title}
                  </h4>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="size-3 shrink-0" />
                      {quiz.durationMinutes}m
                    </span>
                    <span>{quiz.totalMarks} marks</span>
                    <Badge
                      variant="outline"
                      className="bg-green-500/15 text-green-400 border-green-500/30 text-[10px]"
                    >
                      ACTIVE
                    </Badge>
                  </div>
                </div>
                {quiz.canAttempt !== false && (
                  <Button
                    size="sm"
                    className="w-full sm:w-auto min-h-11 touch-manipulation shrink-0"
                    onClick={() =>
                      navigate(`/student/quizzes/${quiz.id}/attempt`, {
                        state: { quizTitle: quiz.title, durationMinutes: quiz.durationMinutes },
                      })
                    }
                  >
                    Start Quiz
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed Quizzes */}
      {completedQuizzes.length > 0 && (
        <div
          className="animate-fade-up"
          style={{ animationDelay: "0.12s" }}
        >
          <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4">
            <h3 className="font-display text-base sm:text-lg font-semibold">
              Completed Quizzes
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/student/quizzes")}
              className="shrink-0 min-h-11 touch-manipulation"
            >
              View all
              <ArrowRight className="size-4 ml-1" />
            </Button>
          </div>

          <div className="space-y-3">
            {completedQuizzes.slice(0, 5).map((quiz) => {
              const pct =
                quiz.totalMarks > 0
                  ? Math.round((quiz.score / quiz.totalMarks) * 100)
                  : 0;
              return (
                <div
                  key={quiz.id}
                  className="rounded-xl border border-border bg-card p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <h4 className="font-display font-semibold text-sm truncate">
                      {quiz.title}
                    </h4>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
                      <span>{quiz.score}/{quiz.totalMarks} ({pct}%)</span>
                      <Badge
                        variant="outline"
                        className="bg-muted text-muted-foreground border-border text-[10px]"
                      >
                        COMPLETED
                      </Badge>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full sm:w-auto min-h-11 touch-manipulation shrink-0"
                    onClick={() =>
                      navigate("/student/results", {
                        state: { attemptId: quiz.attemptId },
                      })
                    }
                  >
                    View Result
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Performance */}
      <div className="animate-fade-up" style={{ animationDelay: "0.15s" }}>
        <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4">
          <h3 className="font-display text-base sm:text-lg font-semibold">Recent Performance</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/student/results")}
            className="shrink-0 min-h-11 touch-manipulation"
          >
            View all <ArrowRight className="size-4 ml-1" />
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-xl" />
            ))}
          </div>
        ) : recentAttempts.length === 0 ? (
          <div className="text-center py-12 rounded-xl border border-border bg-card">
            <p className="text-sm text-muted-foreground">No attempts yet. Take a quiz to see your performance.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentAttempts.map((attempt) => {
              const pct = attempt.totalMarks > 0 ? Math.round((attempt.score / attempt.totalMarks) * 100) : 0;
              return (
                <div key={attempt.id} className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h4 className="font-display font-semibold text-sm truncate min-w-0">{attempt.quizTitle}</h4>
                    {attempt.passed != null && (
                      <Badge variant={attempt.passed ? "default" : "destructive"} className="text-[10px] shrink-0">
                        {attempt.passed ? "PASSED" : "FAILED"}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${attempt.passed ? "bg-green-500" : "bg-red-500"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono text-muted-foreground whitespace-nowrap shrink-0">
                      {attempt.score}/{attempt.totalMarks} ({pct}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
