import { http, HttpResponse } from "msw";

const API_BASE = "http://localhost:4000/v1";

// In-memory store for circulars (MSW mock)
const circularsStore: Array<{
  id: string;
  type: string;
  title: string;
  content: string;
  publishedBy: { id: string; name: string; email: string };
  targetType: string;
  targetClassId?: { id: string; name: string; department: string } | null;
  targetDepartment?: string | null;
  priority: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}> = [
  {
    id: "circ-1",
    type: "ANNOUNCEMENT",
    title: "Exam Schedule Update",
    content: "The mid-term exam has been rescheduled to next Friday. Please check the updated timetable.",
    publishedBy: { id: "2", name: "Dr. Smith", email: "smith@example.com" },
    targetType: "ALL",
    priority: "HIGH",
    isPinned: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

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

  http.post(`${API_BASE}/auth/change-password`, async ({ request }) => {
    const body = (await request.json()) as { currentPassword: string; newPassword: string };
    if (!body.currentPassword) {
      return HttpResponse.json({ message: "Current password is required" }, { status: 400 });
    }
    if (!body.newPassword || body.newPassword.length < 8) {
      return HttpResponse.json({ message: "New password must be at least 8 characters" }, { status: 400 });
    }
    if (body.currentPassword === body.newPassword) {
      return HttpResponse.json({ message: "New password must be different from current password" }, { status: 400 });
    }
    if (body.currentPassword !== "password") {
      return HttpResponse.json({ message: "Current password is incorrect" }, { status: 401 });
    }
    return new HttpResponse(null, { status: 204 });
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

  // Classes (admin)
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

  // Classes (for lecturer - circular form, publish dialog)
  http.get(`${API_BASE}/classes`, () => {
    return HttpResponse.json({
      classes: [
        {
          id: "1",
          name: "CSE-3A",
          department: "Computer Science",
          academicYear: "2025-26",
          semester: 5,
          students: [],
          lecturers: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      page: 1,
      limit: 100,
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

  // Circulars - List
  http.get(`${API_BASE}/circulars`, ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page")) || 1;
    const limit = Number(url.searchParams.get("limit")) || 10;
    const type = url.searchParams.get("type");
    const targetType = url.searchParams.get("targetType");
    const priority = url.searchParams.get("priority");
    const myOnly = url.searchParams.get("myOnly") === "true";

    let filtered = [...circularsStore];
    if (type) filtered = filtered.filter((c) => c.type === type);
    if (targetType) filtered = filtered.filter((c) => c.targetType === targetType);
    if (priority) filtered = filtered.filter((c) => c.priority === priority);
    if (myOnly) filtered = filtered.filter((c) => c.publishedBy.id === "2"); // mock lecturer

    const totalResults = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / limit));
    const start = (page - 1) * limit;
    const circulars = filtered.slice(start, start + limit);

    return HttpResponse.json({
      circulars,
      page,
      limit,
      totalPages,
      totalResults,
    });
  }),

  // Circulars - Get by ID
  http.get(`${API_BASE}/circulars/:circularId`, ({ params }) => {
    const c = circularsStore.find((x) => x.id === params.circularId);
    if (!c) return HttpResponse.json({ message: "Not found" }, { status: 404 });
    return HttpResponse.json(c);
  }),

  // Circulars - Create
  http.post(`${API_BASE}/circulars`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const id = `circ-${Date.now()}`;
    const now = new Date().toISOString();
    const circular = {
      id,
      type: body.type ?? "ANNOUNCEMENT",
      title: String(body.title ?? ""),
      content: String(body.content ?? ""),
      publishedBy: { id: "2", name: "Dr. Smith", email: "smith@example.com" },
      targetType: body.targetType ?? "ALL",
      targetClassId: body.targetType === "CLASS" && body.targetClassId
        ? { id: String(body.targetClassId), name: "CSE-3A", department: "Computer Science" }
        : null,
      targetDepartment: body.targetType === "DEPARTMENT" ? body.targetDepartment : null,
      priority: body.priority ?? "NORMAL",
      isPinned: Boolean(body.isPinned),
      createdAt: now,
      updatedAt: now,
    };
    circularsStore.unshift(circular);
    return HttpResponse.json(circular, { status: 201 });
  }),

  // Circulars - Update
  http.patch(`${API_BASE}/circulars/:circularId`, async ({ params, request }) => {
    const idx = circularsStore.findIndex((x) => x.id === params.circularId);
    if (idx < 0) return HttpResponse.json({ message: "Not found" }, { status: 404 });
    const body = (await request.json()) as Record<string, unknown>;
    const now = new Date().toISOString();
    circularsStore[idx] = {
      ...circularsStore[idx],
      ...(body.title != null && { title: String(body.title) }),
      ...(body.content != null && { content: String(body.content) }),
      ...(body.priority != null && { priority: String(body.priority) }),
      ...(body.isPinned != null && { isPinned: Boolean(body.isPinned) }),
      updatedAt: now,
    };
    return HttpResponse.json(circularsStore[idx]);
  }),

  // Circulars - Delete
  http.delete(`${API_BASE}/circulars/:circularId`, ({ params }) => {
    const idx = circularsStore.findIndex((x) => x.id === params.circularId);
    if (idx < 0) return HttpResponse.json({ message: "Not found" }, { status: 404 });
    circularsStore.splice(idx, 1);
    return new HttpResponse(null, { status: 204 });
  }),
];
