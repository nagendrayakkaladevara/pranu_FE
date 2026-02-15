import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { QuizAnalytics } from "@/types/lecturer";

export function useQuizAnalytics(quizId: string | null) {
  const [analytics, setAnalytics] = useState<QuizAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    if (!quizId) {
      setAnalytics(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.get<QuizAnalytics>(
        `/quizzes/${quizId}/analytics`,
      );
      setAnalytics(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch analytics",
      );
    } finally {
      setIsLoading(false);
    }
  }, [quizId]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    analytics,
    isLoading,
    error,
    refetch: fetchAnalytics,
  };
}
