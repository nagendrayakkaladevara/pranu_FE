import type { QuizAnalyticsResult } from "@/types/lecturer";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

const STATUS_CLASSES: Record<string, string> = {
  SUBMITTED: "bg-green-500/15 text-green-400 border-green-500/30",
  EXPIRED: "bg-red-500/15 text-red-400 border-red-500/30",
  STARTED: "bg-amber-500/15 text-amber-400 border-amber-500/30",
};

interface StudentResultsTableProps {
  results: QuizAnalyticsResult[];
  totalMarks?: number;
  isLoading: boolean;
}

export function StudentResultsTable({
  results,
  totalMarks,
  isLoading,
}: StudentResultsTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-sm">No student results yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Student</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.map((result) => (
            <TableRow key={result.id}>
              <TableCell className="font-medium">
                {result.student.name}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {result.student.email}
              </TableCell>
              <TableCell>
                {result.score}{totalMarks != null ? `/${totalMarks}` : ""}
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={STATUS_CLASSES[result.status] ?? ""}
                >
                  {result.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
