import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type {
  AssignedQuiz,
  QuizAvailability,
  StudentQuizzesResponse,
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

function isActiveUpcomingResponse(
  data: unknown
): data is StudentQuizzesResponse {
  return (
    typeof data === "object" &&
    data !== null &&
    "active" in data &&
    "upcoming" in data &&
    Array.isArray((data as StudentQuizzesResponse).active) &&
    Array.isArray((data as StudentQuizzesResponse).upcoming)
  );
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
      const data = await api.get<StudentQuizzesResponse | AssignedQuiz[]>(
        "/exam/quizzes"
      );

      let enriched: AssignedQuiz[];

      if (isActiveUpcomingResponse(data)) {
        const merged = [
          ...data.active.map((q) => ({ ...q, availability: "ACTIVE" as const })),
          ...data.upcoming.map((q) => ({ ...q, availability: "UPCOMING" as const })),
        ];
        enriched = merged.map(enrichQuiz);
      } else {
        const arr = Array.isArray(data) ? data : [];
        enriched = arr.map(enrichQuiz);
      }

      // Client-side filters
      let filtered = enriched;
      if (availability) {
        filtered = filtered.filter((q) => q.availability === availability);
      }
      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter((q) =>
          q.title.toLowerCase().includes(s)
        );
      }

      // Sort by startTime ascending
      filtered.sort((a, b) => {
        const aT = a.startTime ? new Date(a.startTime).getTime() : 0;
        const bT = b.startTime ? new Date(b.startTime).getTime() : 0;
        return aT - bT;
      });

      const total = filtered.length;
      const start = (page - 1) * limit;
      const paginated = filtered.slice(start, start + limit);

      setQuizzes(paginated);
      setTotalPages(Math.max(1, Math.ceil(total / limit)));
      setTotalResults(total);
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
