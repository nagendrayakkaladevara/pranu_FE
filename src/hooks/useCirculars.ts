import { useCallback, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  Circular,
  CircularQueryParams,
  CreateCircularPayload,
  PaginatedCirculars,
  UpdateCircularPayload,
} from "@/types/circular";

function buildQueryString(params: Record<string, string | number | boolean | undefined>): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "" && v !== null) {
      search.set(k, String(v));
    }
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export function useCirculars(initialParams?: CircularQueryParams) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(initialParams?.page ?? 1);
  const [limit] = useState(initialParams?.limit ?? 10);
  const [type, setType] = useState<CircularQueryParams["type"]>(initialParams?.type);
  const [targetType, setTargetType] = useState<CircularQueryParams["targetType"]>(initialParams?.targetType);
  const [priority, setPriority] = useState<CircularQueryParams["priority"]>(initialParams?.priority);
  const [myOnly, setMyOnly] = useState(initialParams?.myOnly ?? false);

  const queryKey = ["circulars", { page, limit, type, targetType, priority, myOnly }] as const;

  const { data, isLoading, error: queryError, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      const qs = buildQueryString({
        page,
        limit,
        type,
        targetType,
        priority,
        myOnly: myOnly || undefined,
        sortBy: "isPinned:desc,createdAt:desc",
      });
      return api.get<PaginatedCirculars>(`/circulars${qs}`);
    },
  });

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["circulars"] });
  }, [queryClient]);

  const createMutation = useMutation({
    mutationFn: (payload: CreateCircularPayload) => api.post<Circular>("/circulars", payload),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCircularPayload }) =>
      api.patch<Circular>(`/circulars/${id}`, payload),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/circulars/${id}`),
    onSuccess: invalidate,
  });

  return {
    circulars: data?.circulars ?? [],
    page,
    totalPages: data?.totalPages ?? 1,
    totalResults: data?.totalResults ?? 0,
    isLoading,
    error: queryError ? (queryError as Error).message : null,
    setPage,
    type,
    setType,
    targetType,
    setTargetType,
    priority,
    setPriority,
    myOnly,
    setMyOnly,
    createCircular: (payload: CreateCircularPayload) => createMutation.mutateAsync(payload),
    updateCircular: (id: string, payload: UpdateCircularPayload) =>
      updateMutation.mutateAsync({ id, payload }),
    deleteCircular: (id: string) => deleteMutation.mutateAsync(id),
    getCircular: (id: string) => api.get<Circular>(`/circulars/${id}`),
    refetch,
  };
}
