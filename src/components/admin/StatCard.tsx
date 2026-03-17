import type { LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  isLoading?: boolean;
  className?: string;
}

export function StatCard({ label, value, icon: Icon, isLoading, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card animate-fade-up",
        "p-4 sm:p-5 md:p-6",
        "min-h-18 sm:min-h-0",
        "flex flex-row sm:flex-col items-center sm:items-stretch gap-3 sm:gap-4",
        "active:scale-[0.98] transition-transform touch-manipulation",
        className
      )}
    >
      <div className="w-10 h-10 sm:w-10 sm:h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
        <Icon className="size-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0 sm:flex-initial">
        {isLoading ? (
          <>
            <Skeleton className="h-7 sm:h-8 w-16 sm:w-20 mb-1.5 sm:mb-1" />
            <Skeleton className="h-3.5 sm:h-4 w-20 sm:w-24" />
          </>
        ) : (
          <>
            <p className="font-display text-2xl sm:text-3xl font-bold tabular-nums">{value}</p>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1 truncate sm:whitespace-normal">{label}</p>
          </>
        )}
      </div>
    </div>
  );
}
