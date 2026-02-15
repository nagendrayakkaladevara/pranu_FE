import type { LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  isLoading?: boolean;
}

export function StatCard({ label, value, icon: Icon, isLoading }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 animate-fade-up">
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Icon className="size-5 text-primary" />
        </div>
      </div>
      {isLoading ? (
        <>
          <Skeleton className="h-8 w-20 mb-1" />
          <Skeleton className="h-4 w-24" />
        </>
      ) : (
        <>
          <p className="font-display text-3xl font-bold">{value}</p>
          <p className="text-sm text-muted-foreground mt-1">{label}</p>
        </>
      )}
    </div>
  );
}
