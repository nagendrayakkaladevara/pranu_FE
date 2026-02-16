import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import type { QuizAvailability, AssignedQuiz } from "@/types/student";
import { useAssignedQuizzes } from "@/hooks/useAssignedQuizzes";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AssignedQuizCard } from "@/components/student/AssignedQuizCard";
import { DataTablePagination } from "@/components/admin/DataTablePagination";

export default function MyQuizzesPage() {
  const navigate = useNavigate();
  const {
    quizzes,
    page,
    totalPages,
    totalResults,
    isLoading,
    availability,
    setAvailability,
    setSearch,
    setPage,
  } = useAssignedQuizzes();

  const [searchInput, setSearchInput] = useState("");

  const handleSearchSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setSearch(searchInput);
    },
    [searchInput, setSearch],
  );

  const handleStartQuiz = useCallback(
    (quiz: AssignedQuiz) => {
      navigate(`/student/quizzes/${quiz.id}/attempt`, {
        state: { quizTitle: quiz.title, durationMinutes: quiz.durationMinutes },
      });
    },
    [navigate],
  );

  return (
    <div className="p-6 space-y-6">
      <div className="animate-fade-up">
        <h2 className="font-display text-2xl font-bold">My Quizzes</h2>
        <p className="text-muted-foreground text-sm mt-1">
          View and attempt your assigned quizzes.
        </p>
      </div>

      {/* Filters */}
      <div
        className="flex flex-col sm:flex-row gap-3 animate-fade-up"
        style={{ animationDelay: "0.05s" }}
      >
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search quizzes..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </form>
        <Select
          value={availability ?? "ALL"}
          onValueChange={(v) =>
            setAvailability(
              v === "ALL" ? undefined : (v as QuizAvailability),
            )
          }
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="UPCOMING">Upcoming</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="ENDED">Ended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Cards Grid */}
      <div className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-56 rounded-xl" />
            ))}
          </div>
        ) : quizzes.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-sm">No quizzes found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quizzes.map((quiz) => (
              <AssignedQuizCard
                key={quiz.id}
                quiz={quiz}
                onStartQuiz={handleStartQuiz}
              />
            ))}
          </div>
        )}

        {!isLoading && totalPages > 0 && (
          <DataTablePagination
            page={page}
            totalPages={totalPages}
            totalResults={totalResults}
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  );
}
