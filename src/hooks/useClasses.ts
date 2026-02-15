import { useCallback, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  Class,
  ClassQueryParams,
  CreateClassPayload,
  PaginatedClasses,
  UpdateClassPayload,
  AssignStudentsPayload,
  AssignLecturersPayload,
} from "@/types/admin";

export function useClasses(initialParams?: ClassQueryParams) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(initialParams?.page ?? 1);
  const [search, setSearchState] = useState(initialParams?.name ?? "");
  const limit = initialParams?.limit ?? 10;

  const queryKey = ["classes", { page, limit, search }] as const;

  const { data, isLoading, error: queryError, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));
      if (search) params.set("name", search);
      params.set("sortBy", "createdAt:desc");
      return api.get<PaginatedClasses>(`/classes?${params}`);
    },
  });

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["classes"] });
  }, [queryClient]);

  const setSearch = useCallback((s: string) => {
    setSearchState(s);
    setPage(1);
  }, []);

  const createMutation = useMutation({
    mutationFn: (payload: CreateClassPayload) => api.post<Class>("/classes", payload),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateClassPayload }) =>
      api.patch<Class>(`/classes/${id}`, payload),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/classes/${id}`),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey });
      const prev = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, (old: PaginatedClasses | undefined) =>
        old ? { ...old, classes: old.classes.filter((c: Class) => c.id !== id) } : old,
      );
      return { prev };
    },
    onError: (_err, _id, context) => {
      if (context?.prev) queryClient.setQueryData(queryKey, context.prev);
    },
    onSettled: invalidate,
  });

  const assignStudentsMutation = useMutation({
    mutationFn: ({ classId, payload }: { classId: string; payload: AssignStudentsPayload }) =>
      api.post<Class>(`/classes/${classId}/students`, payload),
    onSuccess: invalidate,
  });

  const bulkAssignMutation = useMutation({
    mutationFn: ({ classId, emails }: { classId: string; emails: string[] }) =>
      api.post<Class>(`/classes/${classId}/students/bulk`, { emails }),
    onSuccess: invalidate,
  });

  const assignLecturersMutation = useMutation({
    mutationFn: ({ classId, payload }: { classId: string; payload: AssignLecturersPayload }) =>
      api.post<Class>(`/classes/${classId}/lecturers`, payload),
    onSuccess: invalidate,
  });

  return {
    classes: data?.classes ?? [],
    page,
    totalPages: data?.totalPages ?? 1,
    totalResults: data?.totalResults ?? 0,
    isLoading,
    error: queryError ? (queryError as Error).message : null,
    setPage,
    search,
    setSearch,
    createClass: (payload: CreateClassPayload) => createMutation.mutateAsync(payload),
    updateClass: (id: string, payload: UpdateClassPayload) =>
      updateMutation.mutateAsync({ id, payload }),
    deleteClass: (id: string) => deleteMutation.mutateAsync(id),
    getClassDetail: (id: string) => api.get<Class>(`/classes/${id}`),
    assignStudents: (classId: string, payload: AssignStudentsPayload) =>
      assignStudentsMutation.mutateAsync({ classId, payload }),
    bulkAssignStudentsByEmail: (classId: string, emails: string[]) =>
      bulkAssignMutation.mutateAsync({ classId, emails }),
    assignLecturers: (classId: string, payload: AssignLecturersPayload) =>
      assignLecturersMutation.mutateAsync({ classId, payload }),
    refetch,
  };
}
