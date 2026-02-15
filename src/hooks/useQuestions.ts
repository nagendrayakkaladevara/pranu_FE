import { useCallback, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  Question,
  PaginatedQuestions,
  QuestionQueryParams,
  CreateQuestionPayload,
  UpdateQuestionPayload,
  Difficulty,
} from "@/types/lecturer";

export function useQuestions(initialParams?: QuestionQueryParams) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(initialParams?.page ?? 1);
  const [difficulty, setDifficultyState] = useState<Difficulty | undefined>(initialParams?.difficulty);
  const [subject, setSubjectState] = useState(initialParams?.subject ?? "");
  const [search, setSearchState] = useState(initialParams?.search ?? "");
  const limit = initialParams?.limit ?? 10;

  const queryKey = ["questions", { page, limit, difficulty, subject, search }] as const;

  const { data, isLoading, error: queryError, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));
      if (difficulty) params.set("difficulty", difficulty);
      if (subject) params.set("subject", subject);
      if (search) params.set("search", search);
      params.set("sortBy", "createdAt:desc");
      return api.get<PaginatedQuestions>(`/questions?${params}`);
    },
  });

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["questions"] });
  }, [queryClient]);

  const setDifficulty = useCallback((d: Difficulty | undefined) => {
    setDifficultyState(d);
    setPage(1);
  }, []);

  const setSubject = useCallback((s: string) => {
    setSubjectState(s);
    setPage(1);
  }, []);

  const setSearch = useCallback((s: string) => {
    setSearchState(s);
    setPage(1);
  }, []);

  const createMutation = useMutation({
    mutationFn: (payload: CreateQuestionPayload) => api.post<Question>("/questions", payload),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateQuestionPayload }) =>
      api.patch<Question>(`/questions/${id}`, payload),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/questions/${id}`),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey });
      const prev = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, (old: PaginatedQuestions | undefined) =>
        old ? { ...old, questions: old.questions.filter((q: Question) => q.id !== id) } : old,
      );
      return { prev };
    },
    onError: (_err, _id, context) => {
      if (context?.prev) queryClient.setQueryData(queryKey, context.prev);
    },
    onSettled: invalidate,
  });

  return {
    questions: data?.questions ?? [],
    page,
    totalPages: data?.totalPages ?? 1,
    totalResults: data?.totalResults ?? 0,
    isLoading,
    error: queryError ? (queryError as Error).message : null,
    setPage,
    difficulty,
    subject,
    search,
    setDifficulty,
    setSubject,
    setSearch,
    createQuestion: (payload: CreateQuestionPayload) => createMutation.mutateAsync(payload),
    updateQuestion: (id: string, payload: UpdateQuestionPayload) =>
      updateMutation.mutateAsync({ id, payload }),
    deleteQuestion: (id: string) => deleteMutation.mutateAsync(id),
    refetch,
  };
}
