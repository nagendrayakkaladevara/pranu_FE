import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type {
  AssignedQuiz,
  QuizAvailability,
} from "@/types/student";
function computeAvailability(quiz: AssignedQuiz): QuizAvailability {
  const now = Date.now();
  if (quiz.startTime && new Date(quiz.startTime).getTime() > now) return "UPCOMING";
  if (quiz.endTime && new Date(quiz.endTime).getTime() < now) return "ENDED";
  return "ACTIVE";
}

function enrichQuiz(quiz: AssignedQuiz): AssignedQuiz {
  const avail = quiz.availability ?? computeAvailability(quiz);
  return {
    ...quiz,
    availability: avail,
    canAttempt: quiz.canAttempt ?? avail === "ACTIVE",
    attemptCount: quiz.attemptCount ?? 0,
    lastAttemptStatus: quiz.lastAttemptStatus ?? null,
  };
}

export function useAssignedQuizzes(initialLimit = 10) {
  const [quizzes, setQuizzes] = useState<AssignedQuiz[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [availability, setAvailabilityState] = useState<
    QuizAvailability | undefined
  >();
  const [search, setSearchState] = useState("");
  const limit = initialLimit;

  const fetchQuizzes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));
      if (availability) params.set("availability", availability);
      if (search) params.set("search", search);
      params.set("sortBy", "startTime:asc");

      const data = await api.get<AssignedQuiz[]>(
        `/exam/quizzes?${params}`,
      );
      // Backend returns a plain array; enrich with computed fields
      const enriched = data.map(enrichQuiz);
      // Client-side availability filter (backend may not support it)
      const filtered = availability
        ? enriched.filter((q) => q.availability === availability)
        : enriched;
      setQuizzes(filtered);
      setTotalPages(1);
      setTotalResults(filtered.length);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch quizzes",
      );
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, availability, search]);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  const setAvailability = useCallback((a: QuizAvailability | undefined) => {
    setAvailabilityState(a);
    setPage(1);
  }, []);

  const setSearch = useCallback((s: string) => {
    setSearchState(s);
    setPage(1);
  }, []);

  return {
    quizzes,
    page,
    totalPages,
    totalResults,
    isLoading,
    error,
    availability,
    search,
    setPage,
    setAvailability,
    setSearch,
    refetch: fetchQuizzes,
  };
}
