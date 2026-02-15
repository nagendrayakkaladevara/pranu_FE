import { useCallback, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { User } from "@/types/auth";
import type {
  BulkCreateUsersPayload,
  BulkCreateUsersResponse,
  CreateUserPayload,
  PaginatedUsers,
  UpdateUserPayload,
  UserQueryParams,
} from "@/types/admin";

export function useUsers(initialParams?: UserQueryParams) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(initialParams?.page ?? 1);
  const [role, setRoleState] = useState<UserQueryParams["role"]>(initialParams?.role);
  const [search, setSearchState] = useState(initialParams?.name ?? "");
  const limit = initialParams?.limit ?? 10;

  const queryKey = ["users", { page, limit, role, search }] as const;

  const { data, isLoading, error: queryError, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));
      if (role) params.set("role", role);
      if (search) params.set("name", search);
      params.set("sortBy", "createdAt:desc");
      return api.get<PaginatedUsers>(`/users?${params}`);
    },
  });

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["users"] });
  }, [queryClient]);

  const setRole = useCallback((r: UserQueryParams["role"]) => {
    setRoleState(r);
    setPage(1);
  }, []);

  const setSearch = useCallback((s: string) => {
    setSearchState(s);
    setPage(1);
  }, []);

  const createMutation = useMutation({
    mutationFn: (payload: CreateUserPayload) => api.post<User>("/users", payload),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserPayload }) =>
      api.patch<User>(`/users/${id}`, payload),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/users/${id}`),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey });
      const prev = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, (old: PaginatedUsers | undefined) =>
        old ? { ...old, users: old.users.filter((u: User) => u.id !== id) } : old,
      );
      return { prev };
    },
    onError: (_err, _id, context) => {
      if (context?.prev) queryClient.setQueryData(queryKey, context.prev);
    },
    onSettled: invalidate,
  });

  const bulkCreateMutation = useMutation({
    mutationFn: (payload: BulkCreateUsersPayload) =>
      api.post<BulkCreateUsersResponse>("/users/bulk", payload),
    onSuccess: invalidate,
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      api.patch<User>(`/users/${id}`, { isActive }),
    onSuccess: invalidate,
  });

  return {
    users: data?.users ?? [],
    page,
    totalPages: data?.totalPages ?? 1,
    totalResults: data?.totalResults ?? 0,
    isLoading,
    error: queryError ? (queryError as Error).message : null,
    setPage,
    role,
    search,
    setRole,
    setSearch,
    createUser: (payload: CreateUserPayload) => createMutation.mutateAsync(payload),
    updateUser: (id: string, payload: UpdateUserPayload) =>
      updateMutation.mutateAsync({ id, payload }),
    deleteUser: (id: string) => deleteMutation.mutateAsync(id),
    bulkCreateUsers: (payload: BulkCreateUsersPayload) =>
      bulkCreateMutation.mutateAsync(payload),
    toggleActive: (id: string, isActive: boolean) =>
      toggleActiveMutation.mutateAsync({ id, isActive }),
    refetch,
  };
}
