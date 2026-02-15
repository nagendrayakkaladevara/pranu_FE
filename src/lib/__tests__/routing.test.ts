import { describe, it, expect } from "vitest";
import { getRoleDashboardPath } from "../routing";

describe("getRoleDashboardPath", () => {
  it("returns /admin for ADMIN role", () => {
    expect(getRoleDashboardPath("ADMIN")).toBe("/admin");
  });

  it("returns /lecturer for LECTURER role", () => {
    expect(getRoleDashboardPath("LECTURER")).toBe("/lecturer");
  });

  it("returns /student for STUDENT role", () => {
    expect(getRoleDashboardPath("STUDENT")).toBe("/student");
  });
});
