import { useState } from "react";
import { Pin, ChevronRight } from "lucide-react";
import type { Circular, CircularType, TargetType, CircularPriority } from "@/types/circular";
import { useCirculars } from "@/hooks/useCirculars";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CircularDetailDialog } from "@/components/CircularDetailDialog";
import { DataTablePagination } from "@/components/admin/DataTablePagination";
import { ErrorState } from "@/components/ErrorState";

const TYPE_LABELS: Record<CircularType, string> = {
  CIRCULAR: "Circular",
  NOTICE: "Notice",
  ANNOUNCEMENT: "Announcement",
};

const PRIORITY_VARIANTS: Record<
  CircularPriority,
  "outline" | "default" | "secondary" | "destructive"
> = {
  LOW: "outline",
  NORMAL: "secondary",
  HIGH: "default",
  URGENT: "destructive",
};

function targetDisplay(c: Circular): string {
  if (c.targetType === "CLASS" && c.targetClassId) {
    const ref = typeof c.targetClassId === "object" ? c.targetClassId : null;
    return ref?.name ?? String(c.targetClassId);
  }
  if (c.targetType === "DEPARTMENT") return c.targetDepartment ?? "—";
  return "All Students";
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function CircularsPage() {
  const {
    circulars,
    page,
    totalPages,
    totalResults,
    isLoading,
    error,
    type,
    setType,
    targetType,
    setTargetType,
    priority,
    setPriority,
    setPage,
    refetch,
  } = useCirculars();

  const [selectedCircular, setSelectedCircular] = useState<Circular | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const handleRowClick = (c: Circular) => {
    setSelectedCircular(c);
    setDetailOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="animate-fade-up">
        <h2 className="font-display text-2xl font-bold">Circulars & Notices</h2>
        <p className="text-muted-foreground text-sm mt-1">
          View all circulars, notices, and announcements (read-only).
        </p>
      </div>

      {/* Filters */}
      <div
        className="flex flex-wrap items-center gap-3 animate-fade-up"
        style={{ animationDelay: "0.05s" }}
      >
        <Select
          value={type ?? "ALL"}
          onValueChange={(v) => setType(v === "ALL" ? undefined : (v as CircularType))}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Types</SelectItem>
            <SelectItem value="CIRCULAR">Circular</SelectItem>
            <SelectItem value="NOTICE">Notice</SelectItem>
            <SelectItem value="ANNOUNCEMENT">Announcement</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={targetType ?? "_ALL"}
          onValueChange={(v) =>
            setTargetType(v === "_ALL" ? undefined : (v as TargetType))
          }
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All Targets" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_ALL">All Targets</SelectItem>
            <SelectItem value="CLASS">Class</SelectItem>
            <SelectItem value="DEPARTMENT">Department</SelectItem>
            <SelectItem value="ALL">All Students</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={priority ?? "ALL"}
          onValueChange={(v) =>
            setPriority(v === "ALL" ? undefined : (v as CircularPriority))
          }
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All</SelectItem>
            <SelectItem value="LOW">Low</SelectItem>
            <SelectItem value="NORMAL">Normal</SelectItem>
            <SelectItem value="HIGH">High</SelectItem>
            <SelectItem value="URGENT">Urgent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      <div className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
        {error && <ErrorState message={error} onRetry={refetch} />}
        {!error && isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-20 rounded-xl border border-border bg-card animate-pulse"
              />
            ))}
          </div>
        )}
        {!error && !isLoading && circulars.length === 0 && (
          <div className="rounded-xl border border-border bg-card py-16 text-center">
            <p className="text-muted-foreground text-sm">No circulars found.</p>
          </div>
        )}
        {!error && !isLoading && circulars.length > 0 && (
          <div className="space-y-2">
            {circulars.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => handleRowClick(c)}
                className="w-full text-left rounded-xl border border-border bg-card p-4 flex items-center justify-between gap-4 hover:bg-muted/30 transition-colors"
              >
                <div className="min-w-0 flex-1 flex items-center gap-2">
                  {c.isPinned && (
                    <span title="Pinned">
                      <Pin className="size-3.5 text-primary shrink-0" />
                    </span>
                  )}
                  <div className="min-w-0">
                    <h3 className="font-medium truncate">{c.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {TYPE_LABELS[c.type]} • {c.publishedBy.name} •{" "}
                      {targetDisplay(c)} • {formatDate(c.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge
                    variant={PRIORITY_VARIANTS[c.priority]}
                    className="text-[10px]"
                  >
                    {c.priority}
                  </Badge>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </div>
              </button>
            ))}
          </div>
        )}
        {!error && !isLoading && totalPages > 0 && (
          <DataTablePagination
            page={page}
            totalPages={totalPages}
            totalResults={totalResults}
            onPageChange={setPage}
          />
        )}
      </div>

      <CircularDetailDialog
        circular={selectedCircular}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  );
}
