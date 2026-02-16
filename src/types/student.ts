import type { PaginationMeta } from "./admin";
import type { AttemptStatus, Quiz, QuestionType } from "./lecturer";

// ── Quiz Availability ────────────────────────────────────────

export type QuizAvailability = "UPCOMING" | "ACTIVE" | "ENDED";

// ── Assigned Quiz ────────────────────────────────────────────

export interface AssignedQuiz extends Quiz {
  attemptCount?: number;
  lastAttemptStatus?: AttemptStatus | null;
  canAttempt?: boolean;
  availability?: QuizAvailability;
}

// ── Attempt ──────────────────────────────────────────────────

export interface AttemptAnswer {
  questionId: string;
  selectedOptionId?: string;
  textAnswer?: string;
}

export interface ExamQuestionOption {
  id: string;
  text: string;
}

export interface AttemptQuestion {
  id: string;
  text: string;
  type: QuestionType;
  marks: number;
  options: ExamQuestionOption[];
}

// Backend response from POST /exam/quizzes/:quizId/start
export interface StartAttemptResponse {
  attempt: {
    id: string;
    quiz: string;
    student: string;
    status: AttemptStatus;
    startTime: string;
    responses: AttemptAnswer[];
    createdAt: string;
    updatedAt: string;
  };
  questions: AttemptQuestion[];
}

// Combined view for UI convenience
export interface AttemptDetail {
  id: string;
  quizId: string;
  quizTitle: string;
  status: AttemptStatus;
  durationMinutes: number;
  startTime: string;
  endTime: string | null;
  questions: AttemptQuestion[];
  answers: AttemptAnswer[];
}

// ── Result ───────────────────────────────────────────────────

// Backend response shape from GET /exam/attempts/:id
export interface BackendAttemptDetail {
  id: string;
  quiz: {
    id: string;
    title: string;
    totalMarks: number;
    passMarks: number;
    durationMinutes: number;
  };
  student: {
    id: string;
    name: string;
    email: string;
  };
  status: AttemptStatus;
  score: number;
  startTime: string;
  endTime: string | null;
  responses: Array<{
    questionId: string;
    selectedOptionId?: string;
    textAnswer?: string;
    isGraded?: boolean;
    awardedMarks?: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

// UI-friendly result shape
export interface AttemptResult {
  id: string;
  quizTitle: string;
  status: AttemptStatus;
  score: number;
  totalMarks: number;
  passMarks: number;
  passed: boolean | null;
  startTime: string;
  endTime: string | null;
  timeTaken: number; // seconds
  totalResponses: number;
  gradedResponses: number;
  pendingGrading: boolean;
}

// ── Attempt History ──────────────────────────────────────────

// Backend response shape from GET /exam/attempts
export interface BackendAttemptItem {
  id: string;
  quiz: {
    id: string;
    title: string;
    totalMarks: number;
    passMarks: number;
    durationMinutes: number;
  };
  student: {
    id: string;
    name: string;
    email: string;
  };
  status: AttemptStatus;
  score: number;
  startTime: string;
  endTime: string | null;
  responses: Array<{
    questionId: string;
    selectedOptionId?: string;
    textAnswer?: string;
    isGraded?: boolean;
    awardedMarks?: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedBackendAttempts extends PaginationMeta {
  attempts: BackendAttemptItem[];
}

// UI-friendly flattened shape used by components
export interface AttemptSummary {
  id: string;
  quizId: string;
  quizTitle: string;
  status: AttemptStatus;
  score: number;
  totalMarks: number;
  passMarks: number;
  passed: boolean | null;
  timeTaken: number; // seconds
  submittedAt: string;
}

export interface PaginatedAttempts extends PaginationMeta {
  attempts: AttemptSummary[];
}

// ── Student Stats ────────────────────────────────────────────

export interface StudentStatsSummary {
  totalAttempts: number;
  averagePercentage: number;
  quizzesPassed: number;
  quizzesFailed: number;
}

export interface StudentStatsAttempt {
  id: string;
  quizTitle: string;
  score: number;
  totalMarks: number;
  percentage: number;
  passed: boolean | null;
  date: string;
}

export interface StudentStatsResponse {
  student: { id: string; name: string; email: string };
  summary: StudentStatsSummary;
  attempts: StudentStatsAttempt[];
}

// ── Payloads ─────────────────────────────────────────────────

export interface SubmitAttemptPayload {
  responses: AttemptAnswer[];
}

export interface SubmitAttemptResponse {
  message: string;
  score: number;
  totalMarks: number;
  pendingGrading: boolean;
}
