import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { Upload, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import type { UserRole } from "@/types/auth";
import type {
  BulkCreateUserRow,
  BulkCreateUsersPayload,
  BulkCreateUsersResponse,
} from "@/types/admin";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const VALID_ROLES: UserRole[] = ["ADMIN", "LECTURER", "STUDENT"];

/** Strip leading characters that could trigger formula injection in spreadsheets */
function sanitizeCell(value: string): string {
  return value.replace(/^[=+\-@\t\r]+/, "");
}

interface ParsedRow extends BulkCreateUserRow {
  rowIndex: number;
  errors: string[];
}

interface BulkUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (payload: BulkCreateUsersPayload) => Promise<BulkCreateUsersResponse>;
}

function parseCSV(text: string): ParsedRow[] {
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) return [];

  const header = lines[0].toLowerCase().split(",").map((h) => h.trim());
  const nameIdx = header.indexOf("name");
  const emailIdx = header.indexOf("email");
  const passwordIdx = header.indexOf("password");
  const roleIdx = header.indexOf("role");

  if (nameIdx === -1 || emailIdx === -1 || passwordIdx === -1 || roleIdx === -1) {
    return [];
  }

  return lines.slice(1).map((line, i) => {
    const cols = line.split(",").map((c) => sanitizeCell(c.trim()));
    const name = cols[nameIdx] ?? "";
    const email = cols[emailIdx] ?? "";
    const password = cols[passwordIdx] ?? "";
    const role = (cols[roleIdx] ?? "").toUpperCase() as UserRole;
    const errors: string[] = [];

    if (!name) errors.push("Name is required");
    if (!email) errors.push("Email is required");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push("Invalid email");
    if (!password) errors.push("Password is required");
    else if (password.length < 8) errors.push("Password must be at least 8 characters");
    if (!VALID_ROLES.includes(role)) errors.push(`Invalid role: ${cols[roleIdx] || "(empty)"}`);

    return { name, email, password, role, rowIndex: i + 2, errors };
  });
}

export function BulkUploadDialog({ open, onOpenChange, onUpload }: BulkUploadDialogProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<BulkCreateUsersResponse | null>(null);

  const reset = useCallback(() => {
    setRows([]);
    setParseError(null);
    setResult(null);
    if (fileRef.current) fileRef.current.value = "";
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setParseError(null);
    setResult(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const parsed = parseCSV(text);
      if (parsed.length === 0) {
        setParseError(
          "Could not parse CSV. Ensure the file has headers: name,email,password,role"
        );
        setRows([]);
        return;
      }
      setRows(parsed);
    };
    reader.readAsText(file);
  }, []);

  const validRows = rows.filter((r) => r.errors.length === 0);
  const invalidRows = rows.filter((r) => r.errors.length > 0);

  const handleUpload = useCallback(async () => {
    if (validRows.length === 0) return;
    setIsUploading(true);
    try {
      const payload: BulkCreateUsersPayload = {
        users: validRows.map(({ name, email, password, role }) => ({
          name,
          email,
          password,
          role,
        })),
      };
      const res = await onUpload(payload);
      setResult(res);
      toast.success(`${res.successCount} user(s) created`);
      if (res.failureCount > 0) {
        toast.error(`${res.failureCount} user(s) failed`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Bulk upload failed");
    } finally {
      setIsUploading(false);
    }
  }, [validRows, onUpload]);

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
          <DialogTitle className="font-display">Bulk Upload Users</DialogTitle>
          <DialogDescription>
            Upload a CSV file to create multiple users at once.
          </DialogDescription>
        </DialogHeader>

        {/* File input */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="text-sm text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border file:border-border file:text-sm file:font-medium file:bg-background file:text-foreground file:cursor-pointer hover:file:bg-muted transition-all"
            />
          </div>

          {/* CSV format hint */}
          <div className="rounded-lg border border-border bg-muted/30 p-3">
            <p className="text-xs font-medium text-muted-foreground mb-1">Expected CSV format:</p>
            <code className="text-[11px] text-foreground/70">
              name,email,password,role<br />
              John Doe,john@ecqes.edu,password123,STUDENT
            </code>
          </div>

          {parseError && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2.5">
              <AlertCircle className="size-4 shrink-0" />
              {parseError}
            </div>
          )}

          {/* Preview table */}
          {rows.length > 0 && !result && (
            <div className="space-y-3">
              <p className="text-sm text-foreground font-medium">
                Preview: {validRows.length} valid, {invalidRows.length} invalid of {rows.length} rows
              </p>
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="max-h-60 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 sticky top-0">
                      <tr>
                        <th className="text-left px-3 py-2 font-medium text-muted-foreground">Row</th>
                        <th className="text-left px-3 py-2 font-medium text-muted-foreground">Name</th>
                        <th className="text-left px-3 py-2 font-medium text-muted-foreground">Email</th>
                        <th className="text-left px-3 py-2 font-medium text-muted-foreground">Role</th>
                        <th className="text-left px-3 py-2 font-medium text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row, i) => (
                        <tr
                          key={i}
                          className={row.errors.length > 0 ? "bg-destructive/5" : ""}
                        >
                          <td className="px-3 py-1.5 text-muted-foreground">{row.rowIndex}</td>
                          <td className="px-3 py-1.5 truncate max-w-[120px]">{row.name}</td>
                          <td className="px-3 py-1.5 truncate max-w-[160px]">{row.email}</td>
                          <td className="px-3 py-1.5">{row.role}</td>
                          <td className="px-3 py-1.5">
                            {row.errors.length > 0 ? (
                              <span className="text-destructive text-xs" title={row.errors.join(", ")}>
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
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-sm text-primary">
                  <CheckCircle2 className="size-4" />
                  {result.successCount} created
                </div>
                {result.failureCount > 0 && (
                  <div className="flex items-center gap-1.5 text-sm text-destructive">
                    <XCircle className="size-4" />
                    {result.failureCount} failed
                  </div>
                )}
              </div>
              {result.results.filter((r) => !r.success).length > 0 && (
                <div className="border border-border rounded-lg overflow-hidden">
                  <div className="max-h-40 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50 sticky top-0">
                        <tr>
                          <th className="text-left px-3 py-2 font-medium text-muted-foreground">Email</th>
                          <th className="text-left px-3 py-2 font-medium text-muted-foreground">Error</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.results
                          .filter((r) => !r.success)
                          .map((r, i) => (
                            <tr key={i} className="bg-destructive/5">
                              <td className="px-3 py-1.5">{r.email}</td>
                              <td className="px-3 py-1.5 text-destructive text-xs">{r.message}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)}>
            {result ? "Close" : "Cancel"}
          </Button>
          {!result && (
            <Button
              onClick={handleUpload}
              disabled={validRows.length === 0 || isUploading}
            >
              <Upload className="size-4 mr-2" />
              {isUploading ? "Uploading..." : `Upload ${validRows.length} User(s)`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
