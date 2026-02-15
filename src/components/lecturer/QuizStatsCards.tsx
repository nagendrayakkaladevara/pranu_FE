import { Users, Target, Trophy, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/admin/StatCard";
import type { QuizAnalyticsStats } from "@/types/lecturer";

interface QuizStatsCardsProps {
  stats: QuizAnalyticsStats;
  isLoading?: boolean;
}

export function QuizStatsCards({ stats, isLoading }: QuizStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Total Attempts"
        value={stats.totalAttempts}
        icon={Users}
        isLoading={isLoading}
      />
      <StatCard
        label="Average Score"
        value={Math.round(stats.averageScore)}
        icon={Target}
        isLoading={isLoading}
      />
      <StatCard
        label="Highest Score"
        value={stats.highestScore}
        icon={Trophy}
        isLoading={isLoading}
      />
      <StatCard
        label="Pass Rate %"
        value={Math.round(stats.passRate)}
        icon={TrendingUp}
        isLoading={isLoading}
      />
    </div>
  );
}
