import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type {
  AssignedQuiz,
  PaginatedAssignedQuizzes,
  QuizAvailability,
} from "@/types/student";

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

      const data = await api.get<PaginatedAssignedQuizzes>(
        `/student/quizzes?${params}`,
      );
      setQuizzes(data.quizzes);
      setTotalPages(data.totalPages);
      setTotalResults(data.totalResults);
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
