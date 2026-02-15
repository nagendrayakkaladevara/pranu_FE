import type { Class } from "@/types/admin";
import type { User } from "@/types/auth";
import { MoreHorizontal, Pencil, Trash2, Users, GraduationCap, UserPlus, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface ClassCardProps {
  cls: Class;
  onEdit: (cls: Class) => void;
  onDelete: (cls: Class) => void;
  onAssignStudents: (cls: Class) => void;
  onAssignLecturers: (cls: Class) => void;
  onBulkAssignStudents?: (cls: Class) => void;
}

function countMembers(arr: string[] | User[]): number {
  return arr?.length ?? 0;
}

export function ClassCard({ cls, onEdit, onDelete, onAssignStudents, onAssignLecturers, onBulkAssignStudents }: ClassCardProps) {
  const studentCount = countMembers(cls.students);
  const lecturerCount = countMembers(cls.lecturers);

  return (
    <div className="rounded-xl border border-border bg-card p-5 animate-fade-up">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-display font-semibold text-base">{cls.name}</h3>
          <p className="text-sm text-muted-foreground">{cls.department}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8" aria-label={`Actions for ${cls.name}`}>
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(cls)}>
              <Pencil className="size-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAssignStudents(cls)}>
              <UserPlus className="size-4 mr-2" />
              Assign Students
            </DropdownMenuItem>
            {onBulkAssignStudents && (
              <DropdownMenuItem onClick={() => onBulkAssignStudents(cls)}>
                <Upload className="size-4 mr-2" />
                Bulk Assign (CSV)
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => onAssignLecturers(cls)}>
              <UserPlus className="size-4 mr-2" />
              Assign Lecturers
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(cls)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="size-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-3 mb-3">
        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
          {cls.academicYear}
        </Badge>
        <Badge variant="outline">Sem {cls.semester}</Badge>
      </div>

      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Users className="size-4" />
          <span>{studentCount} student{studentCount !== 1 ? "s" : ""}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <GraduationCap className="size-4" />
          <span>{lecturerCount} lecturer{lecturerCount !== 1 ? "s" : ""}</span>
        </div>
      </div>
    </div>
  );
}
