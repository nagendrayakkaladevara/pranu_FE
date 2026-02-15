import { useEffect, useState } from "react";
import {
  Users,
  GraduationCap,
  BookOpen,
  Shield,
  FileQuestion,
  Target,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import { api } from "@/lib/api";
import type { PaginatedUsers, PaginatedClasses } from "@/types/admin";
import type { PaginatedQuizzes } from "@/types/lecturer";
import { StatCard } from "@/components/admin/StatCard";
import { Skeleton } from "@/components/ui/skeleton";

interface Counts {
  totalUsers: number;
  lecturers: number;
  students: number;
  classes: number;
}

interface QuizCounts {
  total: number;
  published: number;
  draft: number;
  archived: number;
}

interface MonthlyTrend {
  month: string;
  attempts: number;
  avgScore: number;
}

interface AdminAnalytics {
  totalAttempts: number;
  averageScore: number;
  passRate: number;
  departmentStats: { department: string; classCount: number; studentCount: number }[];
  monthlyTrends?: MonthlyTrend[];
}

export default function OverviewPage() {
  const [counts, setCounts] = useState<Counts>({
    totalUsers: 0,
    lecturers: 0,
    students: 0,
    classes: 0,
  });
  const [quizCounts, setQuizCounts] = useState<QuizCounts>({
    total: 0,
    published: 0,
    draft: 0,
    archived: 0,
  });
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isQuizLoading, setIsQuizLoading] = useState(true);
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(true);

  useEffect(() => {
    async function fetchCounts() {
      try {
        const [allUsers, lecturers, students, classes] = await Promise.all([
          api.get<PaginatedUsers>("/users?limit=1"),
          api.get<PaginatedUsers>("/users?limit=1&role=LECTURER"),
          api.get<PaginatedUsers>("/users?limit=1&role=STUDENT"),
          api.get<PaginatedClasses>("/classes?limit=1"),
        ]);
        setCounts({
          totalUsers: allUsers.totalResults,
          lecturers: lecturers.totalResults,
          students: students.totalResults,
          classes: classes.totalResults,
        });
      } catch {
        // Keep defaults
      } finally {
        setIsLoading(false);
      }
    }

    async function fetchQuizCounts() {
      try {
        const [total, published, draft, archived] = await Promise.all([
          api.get<PaginatedQuizzes>("/quizzes?limit=1"),
          api.get<PaginatedQuizzes>("/quizzes?limit=1&status=PUBLISHED"),
          api.get<PaginatedQuizzes>("/quizzes?limit=1&status=DRAFT"),
          api.get<PaginatedQuizzes>("/quizzes?limit=1&status=ARCHIVED"),
        ]);
        setQuizCounts({
          total: total.totalResults,
          published: published.totalResults,
          draft: draft.totalResults,
          archived: archived.totalResults,
        });
      } catch {
        // Keep defaults
      } finally {
        setIsQuizLoading(false);
      }
    }

    async function fetchAnalytics() {
      try {
        const data = await api.get<AdminAnalytics>("/admin/analytics");
        setAnalytics(data);
      } catch {
        // Analytics endpoint may not exist yet — that's fine
      } finally {
        setIsAnalyticsLoading(false);
      }
    }

    fetchCounts();
    fetchQuizCounts();
    fetchAnalytics();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold animate-fade-up">
          Welcome back
        </h2>
        <p className="text-muted-foreground text-sm mt-1 animate-fade-up" style={{ animationDelay: "0.05s" }}>
          Here's an overview of your organization.
        </p>
      </div>

      {/* User Counts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={counts.totalUsers} icon={Users} isLoading={isLoading} />
        <StatCard label="Lecturers" value={counts.lecturers} icon={Shield} isLoading={isLoading} />
        <StatCard label="Students" value={counts.students} icon={GraduationCap} isLoading={isLoading} />
        <StatCard label="Classes" value={counts.classes} icon={BookOpen} isLoading={isLoading} />
      </div>

      {/* Quiz Counts */}
      <div>
        <h3 className="font-display text-lg font-semibold mb-3 animate-fade-up" style={{ animationDelay: "0.1s" }}>
          Quizzes
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Quizzes" value={quizCounts.total} icon={FileQuestion} isLoading={isQuizLoading} />
          <StatCard label="Published" value={quizCounts.published} icon={TrendingUp} isLoading={isQuizLoading} />
          <StatCard label="Drafts" value={quizCounts.draft} icon={BarChart3} isLoading={isQuizLoading} />
          <StatCard label="Archived" value={quizCounts.archived} icon={Target} isLoading={isQuizLoading} />
        </div>
      </div>

      {/* Analytics (from /admin/analytics if available) */}
      {!isAnalyticsLoading && analytics && (
        <div className="animate-fade-up" style={{ animationDelay: "0.15s" }}>
          <h3 className="font-display text-lg font-semibold mb-3">
            Performance Overview
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="rounded-xl border border-border bg-card p-6">
              <p className="text-sm text-muted-foreground mb-1">Total Attempts</p>
              <p className="font-display text-3xl font-bold">{analytics.totalAttempts}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-6">
              <p className="text-sm text-muted-foreground mb-1">Average Score</p>
              <p className="font-display text-3xl font-bold">{Math.round(analytics.averageScore)}%</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-6">
              <p className="text-sm text-muted-foreground mb-1">Pass Rate</p>
              <p className="font-display text-3xl font-bold">{Math.round(analytics.passRate)}%</p>
            </div>
          </div>

          {/* Monthly Trends (bar chart) */}
          {analytics.monthlyTrends && analytics.monthlyTrends.length > 0 && (
            <>
              <h3 className="font-display text-lg font-semibold mb-3">Monthly Activity</h3>
              <div className="rounded-xl border border-border bg-card p-6 mb-6">
                <div className="flex items-end gap-2 h-40">
                  {analytics.monthlyTrends.map((m) => {
                    const maxAttempts = Math.max(...analytics.monthlyTrends!.map((t) => t.attempts), 1);
                    const heightPct = (m.attempts / maxAttempts) * 100;
                    return (
                      <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-[10px] text-muted-foreground font-mono">{m.attempts}</span>
                        <div
                          className="w-full rounded-t bg-primary/80 transition-all min-h-[4px]"
                          style={{ height: `${heightPct}%` }}
                          title={`${m.month}: ${m.attempts} attempts, ${Math.round(m.avgScore)}% avg`}
                        />
                        <span className="text-[10px] text-muted-foreground">{m.month}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* Department breakdown */}
          {analytics.departmentStats.length > 0 && (
            <>
              <h3 className="font-display text-lg font-semibold mb-3">
                Department Breakdown
              </h3>
              <div className="rounded-xl border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Department</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Classes</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Students</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.departmentStats.map((dept) => (
                      <tr key={dept.department} className="border-t border-border/50">
                        <td className="px-4 py-3 font-medium">{dept.department}</td>
                        <td className="px-4 py-3 text-muted-foreground">{dept.classCount}</td>
                        <td className="px-4 py-3 text-muted-foreground">{dept.studentCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* Placeholder when analytics not available */}
      {!isAnalyticsLoading && !analytics && (
        <div className="animate-fade-up" style={{ animationDelay: "0.15s" }}>
          <h3 className="font-display text-lg font-semibold mb-3">
            Performance Overview
          </h3>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Skeleton className="h-24 rounded-xl" />
              <Skeleton className="h-24 rounded-xl" />
              <Skeleton className="h-24 rounded-xl" />
            </div>
          ) : (
            <div className="text-center py-12 rounded-xl border border-border bg-card text-muted-foreground">
              <BarChart3 className="size-8 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Analytics will appear once quizzes have been attempted.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
