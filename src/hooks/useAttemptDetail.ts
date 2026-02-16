import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { AttemptDetail, AttemptResult, BackendAttemptDetail } from "@/types/student";

export function useAttemptDetail(attemptId: string | undefined) {
  const [attempt, setAttempt] = useState<AttemptDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAttempt = useCallback(async () => {
    if (!attemptId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.get<AttemptDetail>(
        `/exam/attempts/${attemptId}`,
      );
      setAttempt(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch attempt",
      );
    } finally {
      setIsLoading(false);
    }
  }, [attemptId]);

  useEffect(() => {
    fetchAttempt();
  }, [fetchAttempt]);

  return {
    attempt,
    isLoading,
    error,
    refetch: fetchAttempt,
  };
}

export function useAttemptResult(attemptId: string | undefined) {
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResult = useCallback(async () => {
    if (!attemptId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.get<BackendAttemptDetail>(
        `/exam/attempts/${attemptId}`,
      );

      const startMs = new Date(data.startTime).getTime();
      const endMs = data.endTime ? new Date(data.endTime).getTime() : Date.now();
      const timeTaken = Math.round((endMs - startMs) / 1000);
      const passed = data.quiz.passMarks != null ? data.score >= data.quiz.passMarks : null;
      const gradedResponses = data.responses.filter((r) => r.isGraded).length;

      setResult({
        id: data.id,
        quizTitle: data.quiz.title,
        status: data.status,
        score: data.score,
        totalMarks: data.quiz.totalMarks,
        passMarks: data.quiz.passMarks,
        passed,
        startTime: data.startTime,
        endTime: data.endTime,
        timeTaken,
        totalResponses: data.responses.length,
        gradedResponses,
        pendingGrading: gradedResponses < data.responses.length,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch result",
      );
    } finally {
      setIsLoading(false);
    }
  }, [attemptId]);

  useEffect(() => {
    fetchResult();
  }, [fetchResult]);

  return {
    result,
    isLoading,
    error,
    refetch: fetchResult,
  };
}
