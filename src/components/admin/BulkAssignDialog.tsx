import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { Upload, AlertCircle, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ParsedEmail {
  email: string;
  rowIndex: number;
  error: string | null;
}

interface BulkAssignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  className: string;
  onAssign: (emails: string[]) => Promise<void>;
}

/** Strip leading characters that could trigger formula injection in spreadsheets */
function sanitizeCell(value: string): string {
  return value.replace(/^[=+\-@\t\r]+/, "");
}

function parseEmailCSV(text: string): ParsedEmail[] {
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length === 0) return [];

  // Check if first line is a header
  const firstLine = lines[0].toLowerCase().trim();
  const startIndex = firstLine === "email" || firstLine.includes("email,") ? 1 : 0;

  // Find email column index if CSV has headers
  let emailIdx = 0;
  if (startIndex === 1) {
    const headers = firstLine.split(",").map((h) => h.trim());
    const idx = headers.indexOf("email");
    if (idx !== -1) emailIdx = idx;
  }

  return lines.slice(startIndex).map((line, i) => {
    const cols = line.split(",").map((c) => sanitizeCell(c.trim()));
    const email = cols[emailIdx] ?? "";
    const error = !email
      ? "Email is required"
      : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        ? "Invalid email format"
        : null;

    return { email, rowIndex: i + startIndex + 1, error };
  });
}

export function BulkAssignDialog({
  open,
  onOpenChange,
  className,
  onAssign,
}: BulkAssignDialogProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<ParsedEmail[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [done, setDone] = useState(false);

  const reset = useCallback(() => {
    setRows([]);
    setParseError(null);
    setDone(false);
    if (fileRef.current) fileRef.current.value = "";
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setParseError(null);
    setDone(false);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const parsed = parseEmailCSV(text);
      if (parsed.length === 0) {
        setParseError("No emails found in the file.");
        setRows([]);
        return;
      }
      setRows(parsed);
    };
    reader.readAsText(file);
  }, []);

  const validEmails = rows.filter((r) => !r.error).map((r) => r.email);
  const invalidCount = rows.filter((r) => r.error).length;

  const handleAssign = useCallback(async () => {
    if (validEmails.length === 0) return;
    setIsUploading(true);
    try {
      await onAssign(validEmails);
      setDone(true);
      toast.success(`${validEmails.length} student(s) assigned to ${className}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Bulk assign failed");
    } finally {
      setIsUploading(false);
    }
  }, [validEmails, onAssign, className]);

  const handleClose = useCallback(
    (isOpen: boolean) => {
      if (!isOpen) reset();
      onOpenChange(isOpen);
    },
    [onOpenChange, reset],
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">
            Bulk Assign Students
          </DialogTitle>
          <DialogDescription>
            Upload a CSV of student emails to assign to <strong>{className}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="text-sm text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border file:border-border file:text-sm file:font-medium file:bg-background file:text-foreground file:cursor-pointer hover:file:bg-muted transition-all"
          />

          <div className="rounded-lg border border-border bg-muted/30 p-3">
            <p className="text-xs font-medium text-muted-foreground mb-1">Expected CSV format:</p>
            <code className="text-[11px] text-foreground/70">
              email<br />
              student1@ecqes.edu<br />
              student2@ecqes.edu
            </code>
          </div>

          {parseError && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2.5">
              <AlertCircle className="size-4 shrink-0" />
              {parseError}
            </div>
          )}

          {rows.length > 0 && !done && (
            <div className="space-y-2">
              <p className="text-sm text-foreground font-medium">
                {validEmails.length} valid, {invalidCount} invalid of {rows.length} rows
              </p>
              <div className="border border-border rounded-lg overflow-hidden max-h-48 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 sticky top-0">
                    <tr>
                      <th className="text-left px-3 py-2 font-medium text-muted-foreground">Row</th>
                      <th className="text-left px-3 py-2 font-medium text-muted-foreground">Email</th>
                      <th className="text-left px-3 py-2 font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, i) => (
                      <tr key={i} className={row.error ? "bg-destructive/5" : ""}>
                        <td className="px-3 py-1.5 text-muted-foreground">{row.rowIndex}</td>
                        <td className="px-3 py-1.5">{row.email}</td>
                        <td className="px-3 py-1.5">
                          {row.error ? (
                            <span className="text-destructive text-xs">{row.error}</span>
                          ) : (
                            <span className="text-primary text-xs">Valid</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {done && (
            <div className="flex items-center gap-2 text-sm text-primary bg-primary/10 border border-primary/20 rounded-lg px-3 py-2.5">
              <CheckCircle2 className="size-4 shrink-0" />
              Successfully assigned {validEmails.length} student(s).
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)}>
            {done ? "Close" : "Cancel"}
          </Button>
          {!done && (
            <Button
              onClick={handleAssign}
              disabled={validEmails.length === 0 || isUploading}
            >
              <Upload className="size-4 mr-2" />
              {isUploading ? "Assigning..." : `Assign ${validEmails.length} Student(s)`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
