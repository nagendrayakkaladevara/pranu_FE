import type { PaginationMeta } from "./admin";
import type { AttemptStatus, Quiz, Question, QuestionOption } from "./lecturer";

// ── Quiz Availability ────────────────────────────────────────

export type QuizAvailability = "UPCOMING" | "ACTIVE" | "ENDED";

// ── Assigned Quiz ────────────────────────────────────────────

export interface AssignedQuiz extends Quiz {
  attemptCount: number;
  lastAttemptStatus: AttemptStatus | null;
  canAttempt: boolean;
  availability: QuizAvailability;
}

export interface PaginatedAssignedQuizzes extends PaginationMeta {
  quizzes: AssignedQuiz[];
}

// ── Attempt ──────────────────────────────────────────────────

export interface AttemptAnswer {
  questionId: string;
  selectedOptionId: string;
}

export interface AttemptQuestion {
  id: string;
  text: string;
  marks: number;
  options: Omit<QuestionOption, "isCorrect">[];
}

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

export interface QuestionResult {
  question: Pick<Question, "id" | "text" | "marks">;
  options: QuestionOption[];
  selectedOptionId: string | null;
  correctOptionId: string;
  isCorrect: boolean;
  marksAwarded: number;
}

export interface AttemptResult {
  id: string;
  quizTitle: string;
  status: AttemptStatus;
  score: number;
  totalMarks: number;
  passMarks: number;
  passed: boolean;
  startTime: string;
  endTime: string;
  timeTaken: number; // seconds
  questions: QuestionResult[];
}

// ── Attempt History ──────────────────────────────────────────

export interface AttemptSummary {
  id: string;
  quizId: string;
  quizTitle: string;
  status: AttemptStatus;
  score: number;
  totalMarks: number;
  passed: boolean;
  timeTaken: number; // seconds
  submittedAt: string;
  resultVisible?: boolean;
}

export interface PaginatedAttempts extends PaginationMeta {
  attempts: AttemptSummary[];
}

// ── Student Stats ────────────────────────────────────────────

export interface StudentStats {
  totalAssigned: number;
  totalAttempted: number;
  averageScore: number;
  passRate: number;
}

// ── Payloads ─────────────────────────────────────────────────

export interface StartAttemptPayload {
  quizId: string;
}

export interface SubmitAttemptPayload {
  answers: AttemptAnswer[];
}
