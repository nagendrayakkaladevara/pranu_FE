import { useCallback, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  Quiz,
  PaginatedQuizzes,
  QuizQueryParams,
  QuizStatus,
  CreateQuizPayload,
  UpdateQuizPayload,
  AddQuestionsPayload,
  PublishQuizPayload,
} from "@/types/lecturer";

export function useQuizzes(initialParams?: QuizQueryParams) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(initialParams?.page ?? 1);
  const [status, setStatusState] = useState<QuizStatus | undefined>(initialParams?.status);
  const [search, setSearchState] = useState(initialParams?.search ?? "");
  const limit = initialParams?.limit ?? 10;

  const queryKey = ["quizzes", { page, limit, status, search }] as const;

  const { data, isLoading, error: queryError, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));
      if (status) params.set("status", status);
      if (search) params.set("search", search);
      params.set("sortBy", "createdAt:desc");
      return api.get<PaginatedQuizzes>(`/quizzes?${params}`);
    },
  });

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["quizzes"] });
  }, [queryClient]);

  const setStatus = useCallback((s: QuizStatus | undefined) => {
    setStatusState(s);
    setPage(1);
  }, []);

  const setSearch = useCallback((s: string) => {
    setSearchState(s);
    setPage(1);
  }, []);

  const createMutation = useMutation({
    mutationFn: (payload: CreateQuizPayload) => api.post<Quiz>("/quizzes", payload),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateQuizPayload }) =>
      api.patch<Quiz>(`/quizzes/${id}`, payload),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/quizzes/${id}`),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey });
      const prev = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, (old: PaginatedQuizzes | undefined) =>
        old ? { ...old, quizzes: old.quizzes.filter((q: Quiz) => q.id !== id) } : old,
      );
      return { prev };
    },
    onError: (_err, _id, context) => {
      if (context?.prev) queryClient.setQueryData(queryKey, context.prev);
    },
    onSettled: invalidate,
  });

  const cloneMutation = useMutation({
    mutationFn: (id: string) => api.post<Quiz>(`/quizzes/${id}/clone`, {}),
    onSuccess: invalidate,
  });

  const addQuestionsMutation = useMutation({
    mutationFn: ({ quizId, payload }: { quizId: string; payload: AddQuestionsPayload }) =>
      api.post<Quiz>(`/quizzes/${quizId}/questions`, payload),
    onSuccess: invalidate,
  });

  const publishMutation = useMutation({
    mutationFn: ({ quizId, payload }: { quizId: string; payload: PublishQuizPayload }) =>
      api.post<Quiz>(`/quizzes/${quizId}/publish`, payload),
    onSuccess: invalidate,
  });

  return {
    quizzes: data?.quizzes ?? [],
    page,
    totalPages: data?.totalPages ?? 1,
    totalResults: data?.totalResults ?? 0,
    isLoading,
    error: queryError ? (queryError as Error).message : null,
    setPage,
    status,
    search,
    setStatus,
    setSearch,
    createQuiz: (payload: CreateQuizPayload) => createMutation.mutateAsync(payload),
    updateQuiz: (id: string, payload: UpdateQuizPayload) =>
      updateMutation.mutateAsync({ id, payload }),
    deleteQuiz: (id: string) => deleteMutation.mutateAsync(id),
    cloneQuiz: (id: string) => cloneMutation.mutateAsync(id),
    getQuizDetail: (id: string) => api.get<Quiz>(`/quizzes/${id}`),
    addQuestions: (quizId: string, payload: AddQuestionsPayload) =>
      addQuestionsMutation.mutateAsync({ quizId, payload }),
    publishToClasses: (quizId: string, payload: PublishQuizPayload) =>
      publishMutation.mutateAsync({ quizId, payload }),
    refetch,
  };
}
