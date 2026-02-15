import { describe, it, expect } from "vitest";
import { sanitize } from "../sanitize";

describe("sanitize", () => {
  it("returns plain text unchanged", () => {
    expect(sanitize("Hello World")).toBe("Hello World");
  });

  it("strips HTML tags", () => {
    expect(sanitize('<script>alert("xss")</script>')).toBe("");
  });

  it("strips img onerror XSS", () => {
    expect(sanitize('<img onerror="alert(1)" src="x">')).toBe("");
  });

  it("preserves text content from HTML", () => {
    expect(sanitize("<b>bold</b> text")).toBe("bold text");
  });

  it("handles empty string", () => {
    expect(sanitize("")).toBe("");
  });
});
