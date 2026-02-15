import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type {
  AttemptSummary,
  PaginatedAttempts,
  StartAttemptPayload,
  SubmitAttemptPayload,
  AttemptDetail,
} from "@/types/student";

export function useAttempts(quizId?: string, initialLimit = 10) {
  const [attempts, setAttempts] = useState<AttemptSummary[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const limit = initialLimit;

  const fetchAttempts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));
      if (quizId) params.set("quizId", quizId);
      params.set("sortBy", "submittedAt:desc");

      const data = await api.get<PaginatedAttempts>(
        `/student/attempts?${params}`,
      );
      setAttempts(data.attempts);
      setTotalPages(data.totalPages);
      setTotalResults(data.totalResults);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch attempts",
      );
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, quizId]);

  useEffect(() => {
    fetchAttempts();
  }, [fetchAttempts]);

  const startAttempt = useCallback(async (payload: StartAttemptPayload) => {
    return api.post<AttemptDetail>("/student/attempts", payload);
  }, []);

  const submitAttempt = useCallback(
    async (attemptId: string, payload: SubmitAttemptPayload) => {
      return api.post<{ message: string }>(
        `/student/attempts/${attemptId}/submit`,
        payload,
      );
    },
    [],
  );

  return {
    attempts,
    page,
    totalPages,
    totalResults,
    isLoading,
    error,
    setPage,
    startAttempt,
    submitAttempt,
    refetch: fetchAttempts,
  };
}
