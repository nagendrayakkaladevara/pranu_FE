// ── Enums ─────────────────────────────────────────────────────

export type CircularType = "CIRCULAR" | "NOTICE" | "ANNOUNCEMENT";
export type TargetType = "CLASS" | "DEPARTMENT" | "ALL";
export type CircularPriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

// ── Populated refs ─────────────────────────────────────────────

export interface PublishedBy {
  id: string;
  name: string;
  email: string;
}

export interface TargetClassRef {
  id: string;
  name: string;
  department: string;
}

// ── Circular (API response) ────────────────────────────────────

export interface Circular {
  id: string;
  type: CircularType;
  title: string;
  content: string;
  publishedBy: PublishedBy;
  targetType: TargetType;
  targetClassId?: TargetClassRef | null;
  targetDepartment?: string | null;
  priority: CircularPriority;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Pagination ─────────────────────────────────────────────────

export interface PaginatedCirculars {
  circulars: Circular[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

// ── Query params ───────────────────────────────────────────────

export interface CircularQueryParams {
  page?: number;
  limit?: number;
  type?: CircularType;
  targetType?: TargetType;
  targetClassId?: string;
  targetDepartment?: string;
  priority?: CircularPriority;
  isPinned?: boolean;
  myOnly?: boolean;
  sortBy?: string;
}

// ── Create payload ──────────────────────────────────────────────

export interface CreateCircularPayload {
  type: CircularType;
  title: string;
  content: string;
  targetType: TargetType;
  targetClassId?: string;
  targetDepartment?: string;
  priority?: CircularPriority;
  isPinned?: boolean;
}

// ── Update payload ──────────────────────────────────────────────

export interface UpdateCircularPayload {
  title?: string;
  content?: string;
  priority?: CircularPriority;
  isPinned?: boolean;
}
