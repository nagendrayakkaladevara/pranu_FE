import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type {
  AttemptSummary,
  BackendAttemptItem,
  PaginatedBackendAttempts,
  StartAttemptResponse,
  SubmitAttemptPayload,
  SubmitAttemptResponse,
} from "@/types/student";

function mapAttemptToSummary(item: BackendAttemptItem): AttemptSummary {
  const startMs = new Date(item.startTime).getTime();
  const endMs = item.endTime ? new Date(item.endTime).getTime() : Date.now();
  const timeTaken = Math.round((endMs - startMs) / 1000);
  const passed = item.quiz.passMarks != null ? item.score >= item.quiz.passMarks : null;

  return {
    id: item.id,
    quizId: item.quiz.id,
    quizTitle: item.quiz.title,
    status: item.status,
    score: item.score,
    totalMarks: item.quiz.totalMarks,
    passMarks: item.quiz.passMarks,
    passed,
    timeTaken,
    submittedAt: item.endTime ?? item.updatedAt,
  };
}

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

      const data = await api.get<PaginatedBackendAttempts>(
        `/exam/attempts?${params}`,
      );
      setAttempts(data.attempts.map(mapAttemptToSummary));
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

  const startAttempt = useCallback(async (quizId: string) => {
    return api.post<StartAttemptResponse>(`/exam/quizzes/${quizId}/start`, {});
  }, []);

  const submitAttempt = useCallback(
    async (attemptId: string, payload: SubmitAttemptPayload) => {
      return api.post<SubmitAttemptResponse>(
        `/exam/attempts/${attemptId}/submit`,
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
