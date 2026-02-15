# ECQES v1.0.0 — Release Notes

**Engineering College Quiz Examination System**
**Release Date:** February 15, 2026

---

## Overview

ECQES is a centralized web platform for engineering colleges to conduct quiz-based examinations. It provides role-based dashboards for administrators, lecturers, and students — covering everything from user management and question banks to timed quiz attempts with automatic grading.

**Tech Stack:** React 19 | TypeScript 5.9 | Vite 7 | Tailwind CSS 4 | TanStack React Query | Sonner

**Live URL:** _(deployed on Netlify)_
**API Backend:** Configure via `VITE_API_URL` environment variable (defaults to `http://localhost:4000/v1`)

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Deployment](#deployment)
3. [User Roles](#user-roles)
4. [Features by Role](#features-by-role)
   - [Admin](#admin-features)
   - [Lecturer](#lecturer-features)
   - [Student](#student-features)
5. [Authentication & Security](#authentication--security)
6. [UI & Accessibility](#ui--accessibility)
7. [Keyboard Shortcuts](#keyboard-shortcuts)
8. [Architecture & Performance](#architecture--performance)
9. [Testing](#testing)
10. [Environment Configuration](#environment-configuration)
11. [Known Limitations](#known-limitations)
12. [API Endpoints Reference](#api-endpoints-reference)

---

## Getting Started

### Prerequisites
- Node.js 18+ and npm 9+
- A running backend API (see Environment Configuration)

### Local Development
```bash
# Install dependencies
npm install

# Start dev server (port 5173)
npm run dev

# Run linter
npm run lint

# Run tests
npm test

# Production build
npm run build

# Preview production build locally
npm run preview
```

### Demo Accounts
The login page includes quick-fill demo credentials:

| Role      | Email                 | Password      |
|-----------|-----------------------|---------------|
| Admin     | admin@ecqes.edu       | admin123      |
| Lecturer  | lecturer@ecqes.edu    | lecturer123   |
| Student   | student@ecqes.edu     | student123    |

---

## Deployment

### Netlify (Recommended)

The project includes `netlify.toml` with pre-configured build settings:

1. **Connect your repository** to Netlify (via GitHub, GitLab, or Bitbucket)
2. **Build settings** are auto-detected from `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. **Set environment variables** in Netlify dashboard:
   - `VITE_API_URL` = your backend API base URL (e.g., `https://api.ecqes.edu/v1`)
4. **Deploy** — Netlify will build and serve the SPA with proper routing

**Included Netlify configuration:**
- SPA fallback routing (all paths serve `index.html`)
- Security headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy)
- Aggressive caching for hashed static assets (1 year, immutable)
- Backup `_redirects` file in `public/`

### Manual Deployment
```bash
npm run build
# Upload the `dist/` folder to any static hosting service
# Ensure your hosting supports SPA routing (all paths -> index.html)
```

---

## User Roles

ECQES supports three roles with separate dashboards and permissions:

| Role       | Dashboard Path | Description |
|------------|---------------|-------------|
| **Admin**    | `/admin`      | Manages users, classes, and views organization-wide analytics |
| **Lecturer** | `/lecturer`   | Creates question banks and quizzes, publishes to classes, views per-quiz analytics |
| **Student**  | `/student`    | Views assigned quizzes, takes timed exams, views results and performance history |

Users are automatically redirected to their role-specific dashboard after login. Accessing unauthorized routes shows a 403 page.

---

## Features by Role

### Admin Features

#### Dashboard Overview (`/admin`)
- Total counts: users, lecturers, students, classes
- Quiz statistics: total, published, draft, archived
- Attempt metrics: total attempts, organization-wide average score
- Monthly activity trends bar chart
- Department-wise breakdown table

#### User Management (`/admin/users`)
- **Create User** — form dialog with name, email, password, role selection
- **Edit User** — modify any user field
- **Delete User** — remove with confirmation
- **Activate/Deactivate** — toggle user status without deletion
- **Bulk CSV Upload** — import users from CSV file with:
  - File input accepting `.csv` files
  - Preview table of parsed rows before upload
  - Validation highlighting for invalid rows
  - Results summary: X created, Y failed (with error details)
  - Expected CSV format: `name,email,password,role`
- **Search** — filter by name
- **Filter** — filter by role (Admin, Lecturer, Student)
- **Pagination** — configurable page size
- **Responsive** — card view on mobile, table on desktop

#### Class Management (`/admin/classes`)
- **Create Class** — name, department, academic year, semester
- **Edit Class** — modify all class fields
- **Delete Class** — remove with confirmation
- **Assign Students** — bulk assign students to a class with multi-select dialog
- **Assign Lecturers** — bulk assign lecturers to a class
- **Bulk CSV Assignment** — upload CSV to assign users to classes
- **Search** — filter by class name
- **Filter** — filter by department
- **Card View** — responsive class cards with student/lecturer counts

---

### Lecturer Features

#### Dashboard Overview (`/lecturer`)
- Quick stats for the lecturer's quizzes and questions
- Recent activity summary

#### Question Bank (`/lecturer/questions`)
- **Create Question** — MCQ with:
  - Question text
  - Difficulty level: Easy, Medium, Hard
  - Marks value
  - Subject and topic (with autocomplete suggestions)
  - Multiple choice options (add/remove dynamically)
  - Mark correct answer
- **Edit Question** — modify any question field
- **Delete Question** — remove with confirmation
- **Bulk Question Import** — CSV upload with preview and validation
- **Search** — filter by question text
- **Filter** — by difficulty, subject
- **Pagination** — configurable page size

#### Quiz Management (`/lecturer/quizzes`)
- **Create Quiz** — comprehensive quiz configuration:
  - Title and description
  - Total marks and pass marks
  - Duration (minutes)
  - Negative marking per wrong answer
  - Maximum attempts per student
  - Shuffle questions toggle
  - Result visibility: Immediate, After End, Manual
  - Scheduled start and end times
- **Clone Quiz** — duplicate existing quiz with all settings
- **Archive Quiz** — move to archived status
- **Quiz Detail Page** (`/lecturer/quizzes/:id`) — full configuration view with:
  - All quiz settings displayed
  - Questions list with add/remove
  - Add questions from bank with filtering
  - Publish to classes dialog
  - Student results table

#### Quiz Publishing
- **Publish to Classes** — select one or multiple classes
- Time-window enforcement after publishing
- Status transitions: Draft -> Published -> Archived

#### Analytics Dashboard (`/lecturer/analytics`)
- **Quiz Selection** — dropdown to pick quiz for analysis
- **Statistics Cards:**
  - Total attempts, average score, highest/lowest score
  - Pass count, fail count, pass rate %
- **Student Results Table** — per-student breakdown with:
  - Student name and email
  - Score and total marks
  - Attempt status and time taken
  - Submission timestamp
- **CSV Export** — download analytics as CSV with injection prevention
- **PDF Export** — generate PDF report of results
- **Print** — print-optimized view

---

### Student Features

#### Dashboard Overview (`/student`)
- **Personal Statistics:**
  - Total assigned quizzes
  - Quizzes attempted
  - Average score
  - Pass rate percentage
- **Upcoming Quizzes** — next 5 active quizzes with countdown
- **Recent Performance** — last 5 attempts with progress bars

#### My Quizzes (`/student/quizzes`)
- **Assigned Quizzes List** — cards showing:
  - Quiz title, description
  - Duration, total marks, pass marks
  - Availability status: Upcoming, Active, Ended
  - Attempts used vs maximum allowed
  - Start/end time window
- **Start Quiz** — begin attempt (only when active and attempts remaining)

#### Quiz Taker (`/student/quizzes/:id/attempt`)
- **Timed Interface:**
  - Countdown timer with color warnings (yellow < 5 min, red < 1 min)
  - Warning modal at 2 minutes remaining
  - Auto-submit on time expiry
- **Question Navigation:**
  - Numbered question nav panel
  - Color-coded: answered (green), current (blue), unanswered (gray), bookmarked (yellow)
  - Jump to any question
- **Question Display:**
  - Question text with marks shown
  - Radio button options
  - Bookmark toggle for flagging questions to review
- **Answer Auto-Save** — answers saved to localStorage every few seconds
  - Recovers on page refresh or accidental navigation
  - Cleared on successful submission
- **Tab Switch Detection** — warns when switching tabs, counts switches
- **Beforeunload Warning** — browser prompt when trying to navigate away
- **Submit Confirmation** — dialog showing answered/unanswered count before final submission

#### Results (`/student/results`)
- **Attempt History** — paginated list of all past attempts:
  - Quiz title, score/total, pass/fail badge
  - Time taken, submission date
  - Responsive: cards on mobile, table on desktop
- **Detailed Result View** — per-question breakdown:
  - Question text
  - Your answer vs correct answer
  - Marks awarded per question
  - Correct/incorrect indicator
- **Result Visibility** — respects lecturer's visibility setting (Immediate, After End, Manual)

---

## Authentication & Security

### Login & Sessions
- JWT token-based authentication stored in localStorage
- Automatic session expiry detection with redirect to login
- Token refresh attempt 5 minutes before expiry
- Session warning toast 2 minutes before expiry
- Multi-tab session sync — logout in one tab logs out all tabs
- 401 responses automatically clear session and redirect

### Password Recovery
- **Forgot Password** (`/forgot-password`) — enter email to receive reset link
- **Reset Password** (`/reset-password?token=xxx`) — set new password with token from email
- Password strength requirements enforced

### Security Measures
- XSS sanitization via DOMPurify
- CSV formula injection prevention in exports
- Security headers configured for Netlify deployment
- Role-based route protection with unauthorized page
- No sensitive data in URL parameters

---

## UI & Accessibility

### Theme System
- **Dark mode** (default) — deep blue/teal aesthetic with emerald accents
- **Light mode** — clean white with adjusted contrast
- **System mode** — follows OS preference
- Toggle available in all dashboard headers (Sun/Moon/Monitor icons)
- Theme persisted across sessions in localStorage

### Design System
- **Typography:** Sora (display/headings) + DM Sans (body text)
- **Colors:** OKLch color space for perceptual uniformity
- **Accent:** Emerald/teal primary with glow effects
- **Borders:** Visible card borders on all elements
- **Animations:** Fade-up stagger, floating orbs on login, animated gradient borders
- **Noise texture:** Subtle grain overlay for depth

### Responsive Design
- Mobile-first layouts
- Sidebar with trigger button (collapsible)
- Cards on mobile, tables on desktop for data lists
- Touch-friendly tap targets

### Accessibility
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus indicators
- Screen reader friendly landmarks
- Color contrast compliance
- Role attributes on navigation elements

### Notifications
- Toast notifications (sonner) for all actions: success, error, warning
- Notification history panel — bell icon in header with dropdown
- Up to 50 notifications stored in-memory
- Clear all button

### Breadcrumb Navigation
- Context-aware breadcrumbs on all pages
- Clickable path segments

### Help Tooltips
- In-app help tips on key features
- Tooltip-based guidance for complex forms

---

## Keyboard Shortcuts

Keyboard shortcuts are available throughout the app (press `?` to view):

| Shortcut | Action |
|----------|--------|
| `?`      | Show keyboard shortcuts help |
| `Ctrl+K` | Focus search |
| `Escape` | Close dialog/modal |

---

## Architecture & Performance

### Code Organization
```
src/
  components/       # Shared + role-specific UI components
    admin/          # Admin-specific components
    lecturer/       # Lecturer-specific components
    student/        # Student-specific components
    ui/             # Base UI components (shadcn)
  contexts/         # React contexts (Auth)
  hooks/            # Custom hooks (useAuth, useTheme, useUsers, etc.)
  lib/              # Utilities (api client, routing, sanitize, notifications)
  pages/            # Route-level page components
    admin/          # Admin pages
    lecturer/       # Lecturer pages
    student/        # Student pages
  test/             # Test utilities and setup
  mocks/            # MSW mock handlers
  types/            # TypeScript type definitions
```

### Performance Optimizations
- **Code Splitting** — every page lazy-loaded with React.lazy + Suspense
- **Vendor Splitting** — separate chunks for:
  - `vendor-react` (React, React DOM, React Router) — 48 KB
  - `vendor-query` (TanStack React Query) — 36 KB
  - `vendor-ui` (Radix UI, CVA, clsx, tailwind-merge) — 133 KB
  - `vendor-sonner` (Toast library) — 33 KB
  - Main bundle — 195 KB
- **React Query Caching** — 30-second stale time, single retry, no refetch on window focus
- **Optimistic Updates** — instant UI feedback on delete operations with rollback on error
- **AbortController** — all API hooks support request cancellation

### Error Handling
- Global ErrorBoundary wrapping the entire app
- Per-component ErrorState with retry button
- API error toasts with descriptive messages
- 404 Not Found page for invalid routes
- 403 Unauthorized page for role violations

---

## Testing

### Framework
- **Vitest** — test runner with jsdom environment
- **React Testing Library** — component testing
- **MSW (Mock Service Worker)** — API mocking

### Test Coverage (26 tests across 7 suites)
- `routing.test.ts` — role-based dashboard path resolution (3 tests)
- `sanitize.test.ts` — XSS sanitization (5 tests)
- `useAuth.test.tsx` — login, logout, session restore, expiry detection (5 tests)
- `ErrorBoundary.test.tsx` — error catching, display, and reset (3 tests)
- `ErrorState.test.tsx` — error display and retry callback (4 tests)
- `LoginPage.test.tsx` — form rendering, validation, demo credentials, navigation (5 tests)
- `sanity.test.ts` — basic sanity check (1 test)

### Running Tests
```bash
npm test          # Run all tests once
npm run test:watch  # Run in watch mode
```

---

## Environment Configuration

### Environment Variables

| Variable        | Required | Default                    | Description |
|-----------------|----------|----------------------------|-------------|
| `VITE_API_URL`  | No       | `http://localhost:4000/v1` | Backend API base URL |

### Setting for Netlify
1. Go to **Site settings > Environment variables**
2. Add `VITE_API_URL` with your production API URL
3. Redeploy

### Local `.env` file
```env
VITE_API_URL=http://localhost:4000/v1
```

---

## Known Limitations

- **MCQ Only** — only multiple-choice questions are supported (no subjective, fill-in-the-blank, etc.)
- **No Proctoring** — tab-switch detection is informational only, no lockdown browser
- **No Mobile App** — web-only, responsive but no native app
- **No Real-time Updates** — polling-based, no WebSocket live updates
- **No File Attachments** — questions are text-only, no image/media support
- **No Email Service** — forgot password flow requires backend email integration
- **Frontend Only** — this release is the frontend SPA; requires a compatible REST API backend

---

## API Endpoints Reference

The frontend expects the following REST API endpoints:

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Login with email and password |
| POST | `/auth/refresh` | Refresh JWT token |
| POST | `/auth/forgot-password` | Request password reset email |
| POST | `/auth/reset-password` | Reset password with token |

### Users (Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users` | List users (paginated, filterable) |
| POST | `/users` | Create a single user |
| PATCH | `/users/:id` | Update user |
| DELETE | `/users/:id` | Delete user |
| POST | `/users/bulk` | Bulk create users from CSV |

### Classes (Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/classes` | List classes (paginated) |
| POST | `/classes` | Create a class |
| PATCH | `/classes/:id` | Update a class |
| DELETE | `/classes/:id` | Delete a class |
| POST | `/classes/:id/students` | Assign students |
| POST | `/classes/:id/lecturers` | Assign lecturers |

### Questions (Lecturer)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/questions` | List questions (paginated, filterable) |
| POST | `/questions` | Create a question |
| PATCH | `/questions/:id` | Update a question |
| DELETE | `/questions/:id` | Delete a question |

### Quizzes (Lecturer)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/quizzes` | List quizzes (paginated) |
| POST | `/quizzes` | Create a quiz |
| PATCH | `/quizzes/:id` | Update a quiz |
| DELETE | `/quizzes/:id` | Archive a quiz |
| POST | `/quizzes/:id/clone` | Clone a quiz |
| POST | `/quizzes/:id/questions` | Add questions to quiz |
| POST | `/quizzes/:id/publish` | Publish quiz to classes |

### Student
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/student/quizzes` | List assigned quizzes |
| GET | `/student/quizzes/:id` | Get quiz details for attempt |
| POST | `/student/quizzes/:id/attempt` | Start a quiz attempt |
| POST | `/student/attempts/:id/submit` | Submit quiz answers |
| GET | `/student/attempts` | List past attempts |
| GET | `/student/attempts/:id` | Get attempt details with results |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/analytics` | Organization-wide analytics |
| GET | `/lecturer/analytics/quiz/:id` | Per-quiz analytics |
| GET | `/student/analytics` | Student's personal analytics |

---

## Build Output

```
dist/
  index.html            — Entry point
  assets/
    index-*.js          — Main bundle (195 KB / 62 KB gzip)
    vendor-react-*.js   — React runtime (48 KB / 17 KB gzip)
    vendor-ui-*.js      — UI components (133 KB / 43 KB gzip)
    vendor-query-*.js   — React Query (36 KB / 11 KB gzip)
    vendor-sonner-*.js  — Toast library (33 KB / 10 KB gzip)
    [page]-*.js         — Lazy-loaded page chunks (3-18 KB each)
    index-*.css         — Compiled CSS
```

Total gzip transfer: ~155 KB for initial load (main + vendor chunks).

---

## Credits

Built with React 19, TypeScript, Tailwind CSS 4, Vite 7, TanStack React Query, Radix UI, Sonner, Lucide Icons, and DOMPurify.

---

*ECQES v1.0.0 — Engineering College Quiz Examination System*
*Secure examination platform for engineering colleges.*
