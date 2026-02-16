import type { PaginationMeta } from "./admin";
import type { User } from "./auth";

// ── Enums / Literals ───────────────────────────────────────

export type Difficulty = "EASY" | "MEDIUM" | "HARD";
export type QuizStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type QuestionType = "MCQ" | "SUBJECTIVE";
export type AttemptStatus = "STARTED" | "SUBMITTED" | "EXPIRED";

// ── Question ───────────────────────────────────────────────

export interface QuestionOption {
  _id: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  difficulty: Difficulty;
  marks: number;
  subject: string;
  topic?: string;
  options: QuestionOption[];
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
  type?: QuestionType;
  difficulty?: Difficulty;
  marks?: number;
  subject: string;
  topic?: string;
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
  description?: string;
  status: QuizStatus;
  totalMarks: number;
  durationMinutes: number;
  passMarks?: number;
  shuffleQuestions: boolean;
  startTime?: string;
  endTime?: string;
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
  description?: string;
  totalMarks: number;
  durationMinutes?: number;
  passMarks?: number;
  shuffleQuestions?: boolean;
  startTime?: string;
  endTime?: string;
}

export interface UpdateQuizPayload {
  title?: string;
  description?: string;
  totalMarks?: number;
  durationMinutes?: number;
  passMarks?: number;
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

export interface QuizAttemptResponse {
  questionId: string;
  selectedOptionId?: string;
  textAnswer?: string;
  awardedMarks?: number;
  isGraded: boolean;
}

export interface QuizAttempt {
  id: string;
  quiz: string | Quiz;
  student: string | User;
  status: AttemptStatus;
  score?: number;
  startTime: string;
  endTime?: string;
  responses: QuizAttemptResponse[];
  createdAt: string;
  updatedAt: string;
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
  id: string;
  student: {
    id: string;
    name: string;
    email: string;
  };
  score: number;
  status: AttemptStatus;
  startTime: string;
  endTime?: string;
  responses: QuizAttemptResponse[];
}

export interface QuizAnalytics {
  quiz: {
    title: string;
    totalMarks: number;
    passMarks?: number;
  };
  stats: QuizAnalyticsStats;
  results: QuizAnalyticsResult[];
}

// Per-question analytics
export interface QuestionAnalyticsItem {
  questionId: string;
  text: string;
  type: QuestionType;
  difficulty: Difficulty;
  marks: number;
  attemptedCount: number;
  correctCount: number;
  correctRate: number;
  averageMarks: number;
}

export interface QuestionAnalytics {
  quiz: {
    title: string;
    totalMarks: number;
  };
  questions: QuestionAnalyticsItem[];
}

// Difficulty analytics
export interface DifficultyAnalyticsItem {
  difficulty: Difficulty;
  questionCount: number;
  totalMarks: number;
  correctRate: number;
  averageScore: number;
}

export interface DifficultyAnalytics {
  quiz: {
    title: string;
    totalMarks: number;
  };
  difficulties: DifficultyAnalyticsItem[];
}

// Grading
export interface GradePayload {
  grades: {
    questionId: string;
    awardedMarks: number;
  }[];
}

export interface GradeResponse {
  message: string;
  score: number;
  totalMarks: number;
  allGraded: boolean;
}

// Student analytics
export interface StudentAnalyticsAttempt {
  id: string;
  quizTitle: string;
  score: number;
  totalMarks: number;
  percentage: number;
  passed: boolean | null;
  date: string;
}

export interface StudentAnalytics {
  student: {
    id: string;
    name: string;
    email: string;
  };
  attempts: StudentAnalyticsAttempt[];
  summary: {
    totalAttempts: number;
    averagePercentage: number;
    quizzesPassed: number;
    quizzesFailed: number;
  };
}
