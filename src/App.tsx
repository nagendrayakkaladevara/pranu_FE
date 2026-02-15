import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import { useAuth } from "@/hooks/useAuth";
import { getRoleDashboardPath } from "@/lib/routing";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Toaster } from "@/components/ui/sonner";
import { Skeleton } from "@/components/ui/skeleton";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Lazy-loaded pages
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const ForgotPasswordPage = lazy(() => import("@/pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("@/pages/ResetPasswordPage"));
const UnauthorizedPage = lazy(() => import("@/pages/UnauthorizedPage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));

// Admin
const AdminLayout = lazy(() =>
  import("@/components/admin/AdminLayout").then((m) => ({ default: m.AdminLayout }))
);
const OverviewPage = lazy(() => import("@/pages/admin/OverviewPage"));
const UsersPage = lazy(() => import("@/pages/admin/UsersPage"));
const ClassesPage = lazy(() => import("@/pages/admin/ClassesPage"));

// Lecturer
const LecturerLayout = lazy(() =>
  import("@/components/lecturer/LecturerLayout").then((m) => ({ default: m.LecturerLayout }))
);
const LecturerOverviewPage = lazy(() => import("@/pages/lecturer/OverviewPage"));
const QuestionsPage = lazy(() => import("@/pages/lecturer/QuestionsPage"));
const QuizzesPage = lazy(() => import("@/pages/lecturer/QuizzesPage"));
const QuizDetailPage = lazy(() => import("@/pages/lecturer/QuizDetailPage"));
const AnalyticsPage = lazy(() => import("@/pages/lecturer/AnalyticsPage"));

// Student
const StudentLayout = lazy(() =>
  import("@/components/student/StudentLayout").then((m) => ({ default: m.StudentLayout }))
);
const StudentOverviewPage = lazy(() => import("@/pages/student/OverviewPage"));
const MyQuizzesPage = lazy(() => import("@/pages/student/MyQuizzesPage"));
const QuizTakerPage = lazy(() => import("@/pages/student/QuizTakerPage"));
const ResultsPage = lazy(() => import("@/pages/student/ResultsPage"));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="space-y-4 w-full max-w-md px-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
    </div>
  );
}

function RootRedirect() {
  const { isAuthenticated, user } = useAuth();
  if (isAuthenticated && user) {
    return <Navigate to={getRoleDashboardPath(user.role)} replace />;
  }
  return <Navigate to="/login" replace />;
}

function App() {
  return (
    <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" richColors closeButton />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* Admin routes — nested with layout */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<OverviewPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="classes" element={<ClassesPage />} />
            </Route>

            {/* Lecturer routes — nested with layout */}
            <Route
              path="/lecturer"
              element={
                <ProtectedRoute allowedRoles={["LECTURER"]}>
                  <LecturerLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<LecturerOverviewPage />} />
              <Route path="questions" element={<QuestionsPage />} />
              <Route path="quizzes" element={<QuizzesPage />} />
              <Route path="quizzes/:id" element={<QuizDetailPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
            </Route>

            {/* Student routes — nested with layout */}
            <Route
              path="/student"
              element={
                <ProtectedRoute allowedRoles={["STUDENT"]}>
                  <StudentLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<StudentOverviewPage />} />
              <Route path="quizzes" element={<MyQuizzesPage />} />
              <Route path="quizzes/:id/attempt" element={<QuizTakerPage />} />
              <Route path="results" element={<ResultsPage />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
    </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
