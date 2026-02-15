import { useEffect, useState } from "react";
import { FileQuestion, ClipboardList, Send, FileEdit } from "lucide-react";
import { api } from "@/lib/api";
import type { PaginatedQuestions, PaginatedQuizzes } from "@/types/lecturer";
import { StatCard } from "@/components/admin/StatCard";

interface Counts {
  totalQuestions: number;
  totalQuizzes: number;
  published: number;
  drafts: number;
}

export default function OverviewPage() {
  const [counts, setCounts] = useState<Counts>({
    totalQuestions: 0,
    totalQuizzes: 0,
    published: 0,
    drafts: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCounts() {
      try {
        const [questions, allQuizzes, published, drafts] = await Promise.all([
          api.get<PaginatedQuestions>("/questions?limit=1"),
          api.get<PaginatedQuizzes>("/quizzes?limit=1"),
          api.get<PaginatedQuizzes>("/quizzes?limit=1&status=PUBLISHED"),
          api.get<PaginatedQuizzes>("/quizzes?limit=1&status=DRAFT"),
        ]);
        setCounts({
          totalQuestions: questions.totalResults,
          totalQuizzes: allQuizzes.totalResults,
          published: published.totalResults,
          drafts: drafts.totalResults,
        });
      } catch {
        // Keep defaults
      } finally {
        setIsLoading(false);
      }
    }
    fetchCounts();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold animate-fade-up">
          Welcome back
        </h2>
        <p
          className="text-muted-foreground text-sm mt-1 animate-fade-up"
          style={{ animationDelay: "0.05s" }}
        >
          Here's an overview of your question bank and quizzes.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Questions"
          value={counts.totalQuestions}
          icon={FileQuestion}
          isLoading={isLoading}
        />
        <StatCard
          label="Total Quizzes"
          value={counts.totalQuizzes}
          icon={ClipboardList}
          isLoading={isLoading}
        />
        <StatCard
          label="Published"
          value={counts.published}
          icon={Send}
          isLoading={isLoading}
        />
        <StatCard
          label="Drafts"
          value={counts.drafts}
          icon={FileEdit}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
