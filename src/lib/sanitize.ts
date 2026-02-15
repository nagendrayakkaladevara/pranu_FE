import DOMPurify from "dompurify";

/** Sanitize user-generated text to prevent XSS. Returns safe plain text. */
export function sanitize(dirty: string): string {
  return DOMPurify.sanitize(dirty, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
}
