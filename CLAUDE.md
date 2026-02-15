# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Engineering College Quiz Examination System (ECQES)** — a centralized platform for engineering colleges to conduct quiz-based examinations with role-based access, automatic evaluation, and performance analytics. Built with React 19, TypeScript, and Vite 7.

## Roles

- **Admin** — manages users (lecturers/students), creates classes (e.g., CSE-3A), assigns students and lecturers to classes, views organization-wide analytics
- **Lecturer** — creates question banks and quizzes, configures quiz settings (duration, marks, negative marking, randomization), publishes quizzes to assigned classes, views per-quiz/class/student analytics
- **Student** — views and attempts assigned quizzes within scheduled time windows, views scores and performance history

## Core Feature Areas

- **Auth & RBAC** — role-based login, password reset
- **User Management** — CRUD for lecturers/students, bulk CSV upload, activate/deactivate
- **Class Management** — classes, student/lecturer assignments, semesters, academic years
- **Question Banks** — MCQs with difficulty levels (Easy/Medium/Hard), organized by subject/topic
- **Quiz Management** — create from question bank, configure time/marks/shuffle/pass criteria, schedule and publish
- **Quiz Taking** — timed attempts, auto-submit on expiry, configurable attempt limits
- **Evaluation & Results** — automatic MCQ grading, configurable result visibility
- **Analytics** — college-wide, class-wise, lecturer-wise, student-wise performance dashboards

## MVP Scope

MCQ-only quizzes with automatic evaluation. Proctoring, subjective questions, and mobile app are out of scope.

## Commands

- **Dev server:** `npm run dev` (starts Vite dev server with HMR, default port 5173)
- **Build:** `npm run build` (runs `tsc -b && vite build`, output in `dist/`)
- **Lint:** `npm run lint` (ESLint with TypeScript and React hooks rules)
- **Preview production build:** `npm run preview`

## Tech Stack

- React 19 with automatic JSX runtime (`react-jsx`)
- TypeScript 5.9 in strict mode (noUnusedLocals, noUnusedParameters, noFallthroughCasesInSwitch enabled)
- Vite 7 with @vitejs/plugin-react
- ESLint 9 flat config with typescript-eslint, react-hooks, and react-refresh plugins
- Vanilla CSS with light/dark mode via `prefers-color-scheme`
- ES modules throughout (`"type": "module"`)

## Architecture

Early-stage SPA. Entry point is `src/main.tsx` which renders `App.tsx` wrapped in `StrictMode`. No routing, state management library, or API layer is set up yet.
