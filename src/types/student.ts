import type { PaginationMeta } from "./admin";
import type { AttemptStatus, Quiz, Question, QuestionOption, QuestionType } from "./lecturer";

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

export interface SubmitAttemptPayload {
  responses: AttemptAnswer[];
}

export interface SubmitAttemptResponse {
  message: string;
  score: number;
  totalMarks: number;
  pendingGrading: boolean;
}
