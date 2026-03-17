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

// In-memory store for notifications (MSW mock)
const notificationsStore: Array<{
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string | null;
  link: string | null;
  metadata: Record<string, string>;
  read: boolean;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
}> = [
  {
    id: "notif-1",
    userId: "1",
    type: "CIRCULAR",
    title: "New notice: Exam Schedule Update",
    message: "The mid-term exam has been rescheduled to next Friday.",
    link: "/circulars/circ-1",
    metadata: { circularId: "circ-1" },
    read: false,
    readAt: null,
    createdAt: new Date(Date.now() - 3600_000).toISOString(),
    updatedAt: new Date(Date.now() - 3600_000).toISOString(),
  },
  {
    id: "notif-2",
    userId: "1",
    type: "QUIZ_PUBLISHED",
    title: "New quiz available: Math Quiz 1",
    message: null,
    link: "/exam/quizzes",
    metadata: { quizId: "quiz-1" },
    read: false,
    readAt: null,
    createdAt: new Date(Date.now() - 1800_000).toISOString(),
    updatedAt: new Date(Date.now() - 1800_000).toISOString(),
  },
  {
    id: "notif-3",
    userId: "1",
    type: "ATTEMPT_GRADED",
    title: "Quiz graded: Math Quiz 1",
    message: "You scored 85/100.",
    link: "/exam/attempts/att-1",
    metadata: { attemptId: "att-1" },
    read: false,
    readAt: null,
    createdAt: new Date(Date.now() - 900_000).toISOString(),
    updatedAt: new Date(Date.now() - 900_000).toISOString(),
  },
  {
    id: "notif-4",
    userId: "1",
    type: "CLASS_ENROLLED",
    title: "New class enrollment",
    message: "You have been enrolled in CSE-3A.",
    link: "/classes/class-1",
    metadata: { classId: "class-1" },
    read: false,
    readAt: null,
    createdAt: new Date(Date.now() - 600_000).toISOString(),
    updatedAt: new Date(Date.now() - 600_000).toISOString(),
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
    if (body.email === "lecturer@test.com" && body.password === "password") {
      return HttpResponse.json({
        user: {
          id: "2",
          name: "Dr. Smith",
          email: "lecturer@test.com",
          role: "LECTURER",
          isActive: true,
        },
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

  // Circulars - List (aligns with backend: page, limit, type, targetType, targetClassId, targetDepartment, priority, isPinned, myOnly, sortBy)
  http.get(`${API_BASE}/circulars`, ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page")) || 1;
    const limit = Number(url.searchParams.get("limit")) || 10;
    const type = url.searchParams.get("type");
    const targetType = url.searchParams.get("targetType");
    const targetClassId = url.searchParams.get("targetClassId");
    const targetDepartment = url.searchParams.get("targetDepartment");
    const priority = url.searchParams.get("priority");
    const isPinnedParam = url.searchParams.get("isPinned");
    const myOnly = url.searchParams.get("myOnly") === "true";
    const sortBy = url.searchParams.get("sortBy");

    let filtered = [...circularsStore];
    if (type) filtered = filtered.filter((c) => c.type === type);
    if (targetType) filtered = filtered.filter((c) => c.targetType === targetType);
    if (targetClassId) filtered = filtered.filter((c) => c.targetClassId?.id === targetClassId);
    if (targetDepartment)
      filtered = filtered.filter(
        (c) => c.targetDepartment?.toLowerCase().includes(targetDepartment.toLowerCase()),
      );
    if (priority) filtered = filtered.filter((c) => c.priority === priority);
    if (isPinnedParam === "true") filtered = filtered.filter((c) => c.isPinned);
    else if (isPinnedParam === "false") filtered = filtered.filter((c) => !c.isPinned);

    if (myOnly) {
      try {
        const userStr =
          typeof localStorage !== "undefined" ? localStorage.getItem("user") : null;
        const user = userStr ? (JSON.parse(userStr) as { id?: string }) : null;
        if (user?.id) filtered = filtered.filter((c) => c.publishedBy.id === user.id);
      } catch {
        filtered = filtered.filter((c) => c.publishedBy.id === "2");
      }
    }

    // Sort: default pinned first, then by date. sortBy format: field:asc or field:desc
    const [sortField, sortDir] = sortBy?.split(":") ?? [];
    filtered.sort((a, b) => {
      if (sortField) {
        const aVal = (a as Record<string, unknown>)[sortField];
        const bVal = (b as Record<string, unknown>)[sortField];
        let cmp: number;
        if (typeof aVal === "boolean" && typeof bVal === "boolean") {
          cmp = (aVal ? 1 : 0) - (bVal ? 1 : 0);
        } else if (typeof aVal === "string" && typeof bVal === "string") {
          cmp = aVal.localeCompare(bVal, undefined, { numeric: true });
        } else {
          cmp = String(aVal ?? "").localeCompare(String(bVal ?? ""), undefined, { numeric: true });
        }
        return sortDir === "asc" ? cmp : -cmp;
      }
      // Default: pinned first, then createdAt desc
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

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

  // Circulars - Create (LECTURER only; publishedBy from current user)
  http.post(`${API_BASE}/circulars`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const id = `circ-${Date.now()}`;
    const now = new Date().toISOString();
    let publishedBy = { id: "2", name: "Dr. Smith", email: "lecturer@test.com" };
    try {
      const userStr =
        typeof localStorage !== "undefined" ? localStorage.getItem("user") : null;
      const user = userStr ? (JSON.parse(userStr) as { id?: string; name?: string; email?: string }) : null;
      if (user?.id && user?.name && user?.email) {
        publishedBy = { id: user.id, name: user.name, email: user.email };
      }
    } catch {
      // Use default when localStorage unavailable
    }
    const circular = {
      id,
      type: body.type ?? "ANNOUNCEMENT",
      title: String(body.title ?? ""),
      content: String(body.content ?? ""),
      publishedBy,
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

  // Circulars - Update (LECTURER only, must be the publisher)
  http.patch(`${API_BASE}/circulars/:circularId`, async ({ params, request }) => {
    const idx = circularsStore.findIndex((x) => x.id === params.circularId);
    if (idx < 0) return HttpResponse.json({ message: "Not found" }, { status: 404 });
    const circular = circularsStore[idx];
    try {
      const userStr =
        typeof localStorage !== "undefined" ? localStorage.getItem("user") : null;
      const user = userStr ? (JSON.parse(userStr) as { id?: string; role?: string }) : null;
      if (user?.id && user?.role === "LECTURER" && circular.publishedBy.id !== user.id) {
        return HttpResponse.json({ message: "Forbidden" }, { status: 403 });
      }
    } catch {
      // Allow in test setups without localStorage
    }
    const body = (await request.json()) as Record<string, unknown>;
    const now = new Date().toISOString();
    circularsStore[idx] = {
      ...circular,
      ...(body.title != null && { title: String(body.title) }),
      ...(body.content != null && { content: String(body.content) }),
      ...(body.priority != null && { priority: String(body.priority) }),
      ...(body.isPinned != null && { isPinned: Boolean(body.isPinned) }),
      updatedAt: now,
    };
    return HttpResponse.json(circularsStore[idx]);
  }),

  // Circulars - Delete (LECTURER only, must be the publisher)
  http.delete(`${API_BASE}/circulars/:circularId`, ({ params }) => {
    const idx = circularsStore.findIndex((x) => x.id === params.circularId);
    if (idx < 0) return HttpResponse.json({ message: "Not found" }, { status: 404 });
    const circular = circularsStore[idx];
    try {
      const userStr =
        typeof localStorage !== "undefined" ? localStorage.getItem("user") : null;
      const user = userStr ? (JSON.parse(userStr) as { id?: string; role?: string }) : null;
      if (user?.id && user?.role === "LECTURER" && circular.publishedBy.id !== user.id) {
        return HttpResponse.json({ message: "Forbidden" }, { status: 403 });
      }
    } catch {
      // Allow in test setups without localStorage
    }
    circularsStore.splice(idx, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  // Notifications - List (aligns with backend: page, limit, read, type, sortBy)
  // Backend returns only the current user's notifications; mock filters by userId from localStorage
  http.get(`${API_BASE}/notifications`, ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page")) || 1;
    const limit = Number(url.searchParams.get("limit")) || 10;
    const readFilter = url.searchParams.get("read");
    const typeFilter = url.searchParams.get("type");
    const sortBy = url.searchParams.get("sortBy");

    let filtered = [...notificationsStore];
    try {
      const userStr =
        typeof localStorage !== "undefined" ? localStorage.getItem("user") : null;
      const user = userStr ? (JSON.parse(userStr) as { id?: string }) : null;
      if (user?.id) {
        filtered = filtered.filter((n) => n.userId === user.id);
      }
    } catch {
      // No user filter if localStorage unavailable or parse fails
    }
    if (readFilter === "true") filtered = filtered.filter((n) => n.read);
    else if (readFilter === "false") filtered = filtered.filter((n) => !n.read);
    if (typeFilter) filtered = filtered.filter((n) => n.type === typeFilter);

    const [sortField, sortDir] = sortBy?.split(":") ?? ["createdAt", "desc"];
    filtered.sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[sortField];
      const bVal = (b as Record<string, unknown>)[sortField];
      const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
      return sortDir === "asc" ? cmp : -cmp;
    });

    const totalResults = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / limit));
    const start = (page - 1) * limit;
    const notifications = filtered.slice(start, start + limit);

    return HttpResponse.json({
      notifications,
      page,
      limit,
      totalPages,
      totalResults,
    });
  }),

  // Notifications - Unread count (backend returns count for current user only)
  http.get(`${API_BASE}/notifications/unread-count`, () => {
    let list = notificationsStore;
    try {
      const userStr =
        typeof localStorage !== "undefined" ? localStorage.getItem("user") : null;
      const user = userStr ? (JSON.parse(userStr) as { id?: string }) : null;
      if (user?.id) list = list.filter((n) => n.userId === user.id);
    } catch {
      // No user filter
    }
    const count = list.filter((n) => !n.read).length;
    return HttpResponse.json({ count });
  }),

  // Notifications - Mark one as read (404 if not found or not owned by current user)
  http.patch(`${API_BASE}/notifications/:notificationId/read`, ({ params }) => {
    const idx = notificationsStore.findIndex((n) => n.id === params.notificationId);
    if (idx < 0) return HttpResponse.json({ message: "Notification not found" }, { status: 404 });
    const notification = notificationsStore[idx];
    try {
      const userStr =
        typeof localStorage !== "undefined" ? localStorage.getItem("user") : null;
      const user = userStr ? (JSON.parse(userStr) as { id?: string }) : null;
      if (user?.id && notification.userId !== user.id) {
        return HttpResponse.json(
          { message: "Notification not found" },
          { status: 404 },
        );
      }
    } catch {
      // Allow if localStorage unavailable (e.g. in some test setups)
    }
    const now = new Date().toISOString();
    notificationsStore[idx] = { ...notification, read: true, readAt: now, updatedAt: now };
    return HttpResponse.json(notificationsStore[idx]);
  }),

  // Notifications - Mark all as read (backend marks only current user's notifications)
  http.patch(`${API_BASE}/notifications/read-all`, () => {
    const now = new Date().toISOString();
    let targetIds: Set<string> | null = null;
    try {
      const userStr =
        typeof localStorage !== "undefined" ? localStorage.getItem("user") : null;
      const user = userStr ? (JSON.parse(userStr) as { id?: string }) : null;
      if (user?.id) {
        targetIds = new Set(notificationsStore.filter((n) => n.userId === user.id).map((n) => n.id));
      }
    } catch {
      // Mark all if localStorage unavailable
    }
    notificationsStore.forEach((n) => {
      if (!targetIds || targetIds.has(n.id)) {
        n.read = true;
        n.readAt = now;
        n.updatedAt = now;
      }
    });
    return new HttpResponse(null, { status: 204 });
  }),
];
