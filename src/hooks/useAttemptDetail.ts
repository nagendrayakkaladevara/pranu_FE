import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { AttemptDetail, AttemptResult } from "@/types/student";

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
      const data = await api.get<AttemptResult>(
        `/exam/attempts/${attemptId}/result`,
      );
      setResult(data);
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
