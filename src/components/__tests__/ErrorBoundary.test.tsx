import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { ErrorBoundary } from "../ErrorBoundary";

function ThrowError({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error("Test error");
  return <div>No error</div>;
}

describe("ErrorBoundary", () => {
  // Suppress console.error for expected errors
  const originalError = console.error;
  beforeEach(() => {
    console.error = vi.fn();
  });
  afterEach(() => {
    console.error = originalError;
  });

  it("renders children when no error", () => {
    render(
      <MemoryRouter>
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      </MemoryRouter>,
    );
    expect(screen.getByText("No error")).toBeInTheDocument();
  });

  it("renders fallback UI when child throws", () => {
    render(
      <MemoryRouter>
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      </MemoryRouter>,
    );
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("Test error")).toBeInTheDocument();
  });

  it("shows Try Again button that resets the boundary", async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <MemoryRouter>
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      </MemoryRouter>,
    );
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();

    // After clicking Try Again, re-render with no error
    rerender(
      <MemoryRouter>
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("button", { name: /try again/i }));
  });
});
