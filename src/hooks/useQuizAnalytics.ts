import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type {
  QuizAnalytics,
  QuestionAnalytics,
  DifficultyAnalytics,
} from "@/types/lecturer";

export function useQuizAnalytics(quizId: string | null) {
  const [analytics, setAnalytics] = useState<QuizAnalytics | null>(null);
  const [questionAnalytics, setQuestionAnalytics] = useState<QuestionAnalytics | null>(null);
  const [difficultyAnalytics, setDifficultyAnalytics] = useState<DifficultyAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    if (!quizId) {
      setAnalytics(null);
      setQuestionAnalytics(null);
      setDifficultyAnalytics(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const [resultsData, questionsData, difficultyData] = await Promise.all([
        api.get<QuizAnalytics>(`/analytics/results/${quizId}`),
        api.get<QuestionAnalytics>(`/analytics/questions/${quizId}`).catch(() => null),
        api.get<DifficultyAnalytics>(`/analytics/difficulty/${quizId}`).catch(() => null),
      ]);
      setAnalytics(resultsData);
      setQuestionAnalytics(questionsData);
      setDifficultyAnalytics(difficultyData);
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
    questionAnalytics,
    difficultyAnalytics,
    isLoading,
    error,
    refetch: fetchAnalytics,
  };
}
