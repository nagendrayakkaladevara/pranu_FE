# ECQES — Engineering College Quiz Examination System

A centralized web platform for engineering colleges to conduct quiz-based examinations with role-based access, automatic evaluation, and performance analytics.

![Version](https://img.shields.io/badge/version-1.0.0-brightgreen)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![Vite](https://img.shields.io/badge/Vite-7-purple)

---

## Features

### Three Role-Based Dashboards

**Admin**
- User management (CRUD, bulk CSV upload, activate/deactivate)
- Class management (create classes, assign students & lecturers)
- Organization-wide analytics with monthly trends

**Lecturer**
- Question bank with MCQs (difficulty levels, subjects, topics)
- Quiz builder (duration, marks, negative marking, randomization, scheduling)
- Publish quizzes to classes, clone existing quizzes
- Per-quiz analytics with CSV/PDF export

**Student**
- View assigned quizzes with availability status
- Timed quiz taking with auto-save, bookmarking, and auto-submit
- Results with per-question breakdown
- Performance dashboard with score history

### Cross-Cutting Features
- JWT authentication with auto-refresh and session expiry handling
- Password reset flow (forgot password + email reset)
- Light/dark/system theme toggle
- Toast notifications + notification history panel
- Keyboard shortcuts
- Breadcrumb navigation
- Responsive design (mobile cards, desktop tables)
- Tab switch detection during quizzes
- Global error boundary
- 26 automated tests

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 |
| Language | TypeScript 5.9 (strict mode) |
| Build | Vite 7 |
| Styling | Tailwind CSS 4 |
| Data Fetching | TanStack React Query |
| Routing | React Router 7 |
| UI Components | Radix UI + shadcn/ui |
| Notifications | Sonner |
| Icons | Lucide React |
| Testing | Vitest + React Testing Library + MSW |

---

## Quick Start

### Prerequisites
- Node.js 18+
- npm 9+

### Install & Run

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:5173)
npm run dev

# Run linter
npm run lint

# Run tests
npm test

# Build for production
npm run build

# Preview production build
npm run preview
```

### Demo Accounts

The login page has quick-fill buttons for these demo accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@admin.edu | admin123 |
| Lecturer | lecturer@lecturer.edu | lecturer123 |
| Student | student@student.edu | student123 |
| Student | pranu@gmail.edu | pranu123 |
| Student | nagendra@gmail.edu | 12345678 |

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:4000/v1` | Backend API base URL |

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:4000/v1
```

---

## Deployment (Netlify)

The project includes a pre-configured `netlify.toml`:

1. Connect your Git repository to Netlify
2. Build settings are auto-detected:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
3. Add `VITE_API_URL` in **Site settings > Environment variables**
4. Deploy

Included configuration:
- SPA fallback routing (all paths serve `index.html`)
- Security headers (X-Frame-Options, CSP directives, Referrer-Policy)
- 1-year immutable cache for hashed static assets

---

## Project Structure

```
src/
  components/
    admin/           Admin-specific components (UserFormDialog, ClassCard, etc.)
    lecturer/        Lecturer components (QuizFormDialog, QuestionsTable, etc.)
    student/         Student components (QuizTimer, QuestionNav, etc.)
    ui/              Base UI components (Button, Card, Dialog, etc.)
    Breadcrumbs.tsx
    ErrorBoundary.tsx
    ErrorState.tsx
    NotificationHistory.tsx
    ProtectedRoute.tsx
    ThemeToggle.tsx
  contexts/          React contexts (Auth)
  hooks/             Custom hooks (useAuth, useUsers, useClasses, useQuizzes, etc.)
  lib/               Utilities (API client, routing, sanitize, notifications)
  pages/
    admin/           Admin pages (Overview, Users, Classes)
    lecturer/        Lecturer pages (Overview, Questions, Quizzes, QuizDetail, Analytics)
    student/         Student pages (Overview, MyQuizzes, QuizTaker, Results)
    LoginPage.tsx
    ForgotPasswordPage.tsx
    ResetPasswordPage.tsx
    NotFoundPage.tsx
  types/             TypeScript type definitions (auth, admin, lecturer, student)
  test/              Test setup and utilities
  mocks/             MSW mock handlers
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Type-check + production build |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build locally |
| `npm test` | Run all tests once |
| `npm run test:watch` | Run tests in watch mode |

---

## Bundle Size

Vendor-split chunks for optimal caching:

| Chunk | Size | Gzip |
|-------|------|------|
| Main bundle | 195 KB | 62 KB |
| vendor-ui (Radix, CVA) | 133 KB | 43 KB |
| vendor-react | 48 KB | 17 KB |
| vendor-query | 36 KB | 11 KB |
| vendor-sonner | 33 KB | 10 KB |
| Page chunks | 3-18 KB each | — |

---

## API Endpoints

The frontend expects a REST API with these endpoint groups:

- **Auth** — `POST /auth/login`, `/auth/refresh`, `/auth/forgot-password`, `/auth/reset-password`
- **Users** — `GET/POST /users`, `PATCH/DELETE /users/:id`, `POST /users/bulk`
- **Classes** — `GET/POST /classes`, `PATCH/DELETE /classes/:id`, `POST /classes/:id/students`, `/classes/:id/lecturers`
- **Questions** — `GET/POST /questions`, `PATCH/DELETE /questions/:id`
- **Quizzes** — `GET/POST /quizzes`, `PATCH/DELETE /quizzes/:id`, `POST /quizzes/:id/clone`, `/quizzes/:id/questions`, `/quizzes/:id/publish`
- **Student** — `GET /student/quizzes`, `POST /student/quizzes/:id/attempt`, `POST /student/attempts/:id/submit`, `GET /student/attempts`
- **Analytics** — `GET /admin/analytics`, `GET /lecturer/analytics/quiz/:id`, `GET /student/analytics`

See [RELEASE_NOTES.md](./RELEASE_NOTES.md) for the full API reference table.

---

## License

Private project. All rights reserved.
