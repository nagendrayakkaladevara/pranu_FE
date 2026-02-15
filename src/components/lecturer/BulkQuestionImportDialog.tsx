import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { Upload, AlertCircle, CheckCircle2 } from "lucide-react";
import type { Difficulty, CreateQuestionPayload } from "@/types/lecturer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const VALID_DIFFICULTIES: Difficulty[] = ["EASY", "MEDIUM", "HARD"];

interface ParsedQuestion {
  rowIndex: number;
  payload: CreateQuestionPayload;
  errors: string[];
}

interface BulkQuestionImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (payload: CreateQuestionPayload) => Promise<unknown>;
}

/** Strip leading characters that could trigger formula injection */
function sanitize(value: string): string {
  return value.replace(/^[=+\-@\t\r]+/, "");
}

/**
 * Expected CSV format:
 * text,subject,topic,difficulty,marks,optionA,optionB,optionC,optionD,correctOption
 *
 * correctOption is A/B/C/D
 */
function parseCSV(text: string): ParsedQuestion[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  const header = lines[0].toLowerCase().split(",").map((h) => h.trim());
  const idx = (name: string) => header.indexOf(name);

  const textIdx = idx("text");
  const subjectIdx = idx("subject");
  const topicIdx = idx("topic");
  const difficultyIdx = idx("difficulty");
  const marksIdx = idx("marks");
  const optAIdx = idx("optiona");
  const optBIdx = idx("optionb");
  const optCIdx = idx("optionc");
  const optDIdx = idx("optiond");
  const correctIdx = idx("correctoption");

  if (textIdx === -1 || optAIdx === -1 || optBIdx === -1 || correctIdx === -1) {
    return [];
  }

  return lines.slice(1).map((line, i) => {
    const cols = line.split(",").map((c) => sanitize(c.trim()));
    const errors: string[] = [];

    const qText = cols[textIdx] ?? "";
    const subject = cols[subjectIdx] ?? "";
    const topic = cols[topicIdx] ?? "";
    const difficulty = ((cols[difficultyIdx] ?? "").toUpperCase() as Difficulty);
    const marks = Number(cols[marksIdx]) || 1;
    const optA = cols[optAIdx] ?? "";
    const optB = cols[optBIdx] ?? "";
    const optC = cols[optCIdx] ?? "";
    const optD = cols[optDIdx] ?? "";
    const correct = (cols[correctIdx] ?? "").toUpperCase();

    if (!qText) errors.push("Question text is required");
    if (!subject) errors.push("Subject is required");
    if (!VALID_DIFFICULTIES.includes(difficulty)) errors.push("Invalid difficulty");
    if (!optA || !optB) errors.push("At least 2 options required");
    if (!["A", "B", "C", "D"].includes(correct)) errors.push("correctOption must be A/B/C/D");

    const optionsRaw = [optA, optB, optC, optD].filter(Boolean);
    const correctIdx2 = ["A", "B", "C", "D"].indexOf(correct);
    const options = optionsRaw.map((text, j) => ({
      text,
      isCorrect: j === correctIdx2,
    }));

    return {
      rowIndex: i + 2,
      payload: {
        text: qText,
        type: "MCQ" as const,
        difficulty: VALID_DIFFICULTIES.includes(difficulty) ? difficulty : "MEDIUM",
        marks,
        subject,
        topic,
        options,
      },
      errors,
    };
  });
}

export function BulkQuestionImportDialog({
  open,
  onOpenChange,
  onImport,
}: BulkQuestionImportDialogProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<ParsedQuestion[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [importedCount, setImportedCount] = useState<number | null>(null);

  const reset = useCallback(() => {
    setRows([]);
    setParseError(null);
    setImportedCount(null);
    if (fileRef.current) fileRef.current.value = "";
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setParseError(null);
      setImportedCount(null);

      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        const parsed = parseCSV(text);
        if (parsed.length === 0) {
          setParseError(
            "Could not parse CSV. Ensure headers: text,subject,topic,difficulty,marks,optionA,optionB,optionC,optionD,correctOption",
          );
          setRows([]);
          return;
        }
        setRows(parsed);
      };
      reader.readAsText(file);
    },
    [],
  );

  const validRows = rows.filter((r) => r.errors.length === 0);
  const invalidRows = rows.filter((r) => r.errors.length > 0);

  const handleImport = useCallback(async () => {
    if (validRows.length === 0) return;
    setIsUploading(true);
    let successCount = 0;
    let failCount = 0;

    for (const row of validRows) {
      try {
        await onImport(row.payload);
        successCount++;
      } catch {
        failCount++;
      }
    }

    setImportedCount(successCount);
    if (successCount > 0) toast.success(`${successCount} question(s) created`);
    if (failCount > 0) toast.error(`${failCount} question(s) failed`);
    setIsUploading(false);
  }, [validRows, onImport]);

  const handleClose = useCallback(
    (isOpen: boolean) => {
      if (!isOpen) reset();
      onOpenChange(isOpen);
    },
    [onOpenChange, reset],
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">
            Bulk Import Questions
          </DialogTitle>
          <DialogDescription>
            Upload a CSV file to create multiple questions at once.
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
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Expected CSV format:
            </p>
            <code className="text-[11px] text-foreground/70">
              text,subject,topic,difficulty,marks,optionA,optionB,optionC,optionD,correctOption
              <br />
              What is 2+2?,Math,Arithmetic,EASY,1,3,4,5,6,B
            </code>
          </div>

          {parseError && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2.5">
              <AlertCircle className="size-4 shrink-0" />
              {parseError}
            </div>
          )}

          {rows.length > 0 && importedCount === null && (
            <div className="space-y-2">
              <p className="text-sm text-foreground font-medium">
                {validRows.length} valid, {invalidRows.length} invalid of{" "}
                {rows.length} rows
              </p>
              <div className="border border-border rounded-lg overflow-hidden max-h-48 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 sticky top-0">
                    <tr>
                      <th className="text-left px-3 py-2 font-medium text-muted-foreground">
                        Row
                      </th>
                      <th className="text-left px-3 py-2 font-medium text-muted-foreground">
                        Question
                      </th>
                      <th className="text-left px-3 py-2 font-medium text-muted-foreground">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, i) => (
                      <tr
                        key={i}
                        className={
                          row.errors.length > 0 ? "bg-destructive/5" : ""
                        }
                      >
                        <td className="px-3 py-1.5 text-muted-foreground">
                          {row.rowIndex}
                        </td>
                        <td className="px-3 py-1.5 truncate max-w-[200px]">
                          {row.payload.text}
                        </td>
                        <td className="px-3 py-1.5">
                          {row.errors.length > 0 ? (
                            <span
                              className="text-destructive text-xs"
                              title={row.errors.join(", ")}
                            >
                              {row.errors[0]}
                            </span>
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

          {importedCount !== null && (
            <div className="flex items-center gap-2 text-sm text-primary bg-primary/10 border border-primary/20 rounded-lg px-3 py-2.5">
              <CheckCircle2 className="size-4 shrink-0" />
              Successfully created {importedCount} question(s).
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)}>
            {importedCount !== null ? "Close" : "Cancel"}
          </Button>
          {importedCount === null && (
            <Button
              onClick={handleImport}
              disabled={validRows.length === 0 || isUploading}
            >
              <Upload className="size-4 mr-2" />
              {isUploading
                ? "Importing..."
                : `Import ${validRows.length} Question(s)`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
