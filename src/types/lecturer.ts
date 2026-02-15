import type { PaginationMeta } from "./admin";
import type { User } from "./auth";

// ── Enums / Literals ───────────────────────────────────────

export type Difficulty = "EASY" | "MEDIUM" | "HARD";
export type QuizStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type AttemptStatus = "IN_PROGRESS" | "COMPLETED" | "TIMED_OUT";
export type ResultVisibility = "IMMEDIATE" | "AFTER_END" | "MANUAL";

// ── Question ───────────────────────────────────────────────

export interface QuestionOption {
  _id: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  text: string;
  type: "MCQ";
  difficulty: Difficulty;
  marks: number;
  subject: string;
  topic: string;
  options: QuestionOption[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedQuestions extends PaginationMeta {
  questions: Question[];
}

export interface QuestionQueryParams {
  page?: number;
  limit?: number;
  subject?: string;
  topic?: string;
  difficulty?: Difficulty;
  search?: string;
  sortBy?: string;
}

export interface CreateQuestionPayload {
  text: string;
  type: "MCQ";
  difficulty: Difficulty;
  marks: number;
  subject: string;
  topic: string;
  options: { text: string; isCorrect: boolean }[];
}

export interface UpdateQuestionPayload {
  text?: string;
  difficulty?: Difficulty;
  marks?: number;
  subject?: string;
  topic?: string;
  options?: { text: string; isCorrect: boolean }[];
}

// ── Quiz ───────────────────────────────────────────────────

export interface Quiz {
  id: string;
  title: string;
  description: string;
  status: QuizStatus;
  totalMarks: number;
  durationMinutes: number;
  passMarks: number;
  negativeMarks: number;
  maxAttempts: number;
  resultVisibility: ResultVisibility;
  shuffleQuestions: boolean;
  startTime: string;
  endTime: string;
  questions: string[] | Question[];
  assignedClasses: string[];
  createdBy: string;
  _count?: {
    questions: number;
    assignedClasses: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedQuizzes extends PaginationMeta {
  quizzes: Quiz[];
}

export interface QuizQueryParams {
  page?: number;
  limit?: number;
  status?: QuizStatus;
  search?: string;
  sortBy?: string;
}

export interface CreateQuizPayload {
  title: string;
  description: string;
  totalMarks: number;
  durationMinutes: number;
  passMarks: number;
  negativeMarks: number;
  maxAttempts: number;
  resultVisibility: ResultVisibility;
  shuffleQuestions: boolean;
  startTime: string;
  endTime: string;
}

export interface UpdateQuizPayload {
  title?: string;
  description?: string;
  totalMarks?: number;
  durationMinutes?: number;
  passMarks?: number;
  negativeMarks?: number;
  maxAttempts?: number;
  resultVisibility?: ResultVisibility;
  shuffleQuestions?: boolean;
  startTime?: string;
  endTime?: string;
}

export interface AddQuestionsPayload {
  questionIds: string[];
}

export interface PublishQuizPayload {
  classIds: string[];
}

// ── Quiz Attempt / Analytics ───────────────────────────────

export interface QuizAttempt {
  id: string;
  quiz: string | Quiz;
  student: string | User;
  status: AttemptStatus;
  score: number;
  totalMarks: number;
  startTime: string;
  endTime: string;
}

export interface QuizAnalyticsStats {
  totalAttempts: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  passedCount: number;
  failedCount: number;
  passRate: number;
}

export interface QuizAnalyticsResult {
  student: {
    id: string;
    name: string;
    email: string;
  };
  score: number;
  totalMarks: number;
  status: AttemptStatus;
  timeTaken: number; // seconds
  submittedAt: string;
}

export interface QuizAnalytics {
  quiz: {
    id: string;
    title: string;
    totalMarks: number;
    durationMinutes: number;
  };
  stats: QuizAnalyticsStats;
  results: QuizAnalyticsResult[];
}
