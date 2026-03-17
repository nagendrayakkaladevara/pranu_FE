import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { AssignedQuiz, StudentQuizzesResponse } from "@/types/student";

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

export function useStudentQuizzes() {
  const [active, setActive] = useState<AssignedQuiz[]>([]);
  const [upcoming, setUpcoming] = useState<AssignedQuiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuizzes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.get<StudentQuizzesResponse | AssignedQuiz[]>(
        "/exam/quizzes"
      );

      if (isActiveUpcomingResponse(data)) {
        setActive(data.active);
        setUpcoming(data.upcoming);
      } else {
        // Fallback: backend returns array; split by startTime
        const arr = Array.isArray(data) ? data : [];
        const now = Date.now();
        const activeList: AssignedQuiz[] = [];
        const upcomingList: AssignedQuiz[] = [];
        for (const q of arr) {
          const startMs = q.startTime ? new Date(q.startTime).getTime() : 0;
          if (startMs > now) {
            upcomingList.push({ ...q, availability: "UPCOMING" as const });
          } else {
            const endMs = q.endTime ? new Date(q.endTime).getTime() : Infinity;
            if (endMs >= now) {
              activeList.push({ ...q, availability: "ACTIVE" as const });
            }
          }
        }
        setActive(activeList);
        setUpcoming(upcomingList);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch quizzes"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  return {
    active,
    upcoming,
    isLoading,
    error,
    refetch: fetchQuizzes,
  };
}
