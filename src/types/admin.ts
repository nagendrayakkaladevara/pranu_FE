import type { User, UserRole } from "./auth";

// ── Pagination ──────────────────────────────────────────────

export interface PaginationMeta {
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

export interface PaginatedUsers extends PaginationMeta {
  users: User[];
}

export interface PaginatedClasses extends PaginationMeta {
  classes: Class[];
}

// ── Query params ────────────────────────────────────────────

export interface UserQueryParams {
  page?: number;
  limit?: number;
  role?: UserRole;
  name?: string;
  sortBy?: string;
}

export interface ClassQueryParams {
  page?: number;
  limit?: number;
  name?: string;
  department?: string;
  sortBy?: string;
}

// ── Class ───────────────────────────────────────────────────

export interface Class {
  id: string;
  name: string;
  department: string;
  academicYear: string;
  semester: number;
  students: string[] | User[];
  lecturers: string[] | User[];
  createdAt: string;
  updatedAt: string;
}

// ── CRUD payloads ───────────────────────────────────────────

export interface CreateUserPayload {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface CreateClassPayload {
  name: string;
  department: string;
  academicYear: string;
  semester: number;
}

export interface UpdateClassPayload {
  name?: string;
  department?: string;
  academicYear?: string;
  semester?: number;
}

export interface AssignStudentsPayload {
  studentIds: string[];
}

export interface AssignLecturersPayload {
  lecturerIds: string[];
}

// ── Bulk upload ────────────────────────────────────────────

export interface BulkCreateUserRow {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface BulkCreateUsersPayload {
  users: BulkCreateUserRow[];
}

export interface BulkCreateUserResult {
  email: string;
  success: boolean;
  message?: string;
}

export interface BulkCreateUsersResponse {
  results: BulkCreateUserResult[];
  successCount: number;
  failureCount: number;
}
