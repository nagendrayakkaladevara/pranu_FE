import { http, HttpResponse } from "msw";

const API_BASE = "http://localhost:4000/v1";

export const handlers = [
  // Auth
  http.post(`${API_BASE}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };
    if (body.email === "admin@test.com" && body.password === "password") {
      return HttpResponse.json({
        user: { id: "1", name: "Admin User", email: "admin@test.com", role: "ADMIN", isActive: true },
        tokens: {
          access: { token: "mock-token", expires: new Date(Date.now() + 3600_000).toISOString() },
        },
      });
    }
    return HttpResponse.json({ code: 400, message: "Invalid credentials" }, { status: 400 });
  }),

  // Users
  http.get(`${API_BASE}/admin/users`, () => {
    return HttpResponse.json({
      results: [
        { id: "1", name: "John Doe", email: "john@test.com", role: "STUDENT", isActive: true },
        { id: "2", name: "Jane Smith", email: "jane@test.com", role: "LECTURER", isActive: true },
      ],
      page: 1,
      limit: 10,
      totalPages: 1,
      totalResults: 2,
    });
  }),

  // Classes
  http.get(`${API_BASE}/admin/classes`, () => {
    return HttpResponse.json({
      results: [
        { id: "1", name: "CSE-3A", semester: 5, academicYear: "2025-26", studentCount: 30, lecturerCount: 2 },
      ],
      page: 1,
      limit: 10,
      totalPages: 1,
      totalResults: 1,
    });
  }),

  // Quizzes
  http.get(`${API_BASE}/lecturer/quizzes`, () => {
    return HttpResponse.json({
      results: [],
      page: 1,
      limit: 10,
      totalPages: 0,
      totalResults: 0,
    });
  }),

  // Questions
  http.get(`${API_BASE}/lecturer/questions`, () => {
    return HttpResponse.json({
      results: [],
      page: 1,
      limit: 10,
      totalPages: 0,
      totalResults: 0,
    });
  }),
];
