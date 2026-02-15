import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ErrorState } from "../ErrorState";

describe("ErrorState", () => {
  it("displays the error message", () => {
    render(<ErrorState message="Something failed" />);
    expect(screen.getByText("Something failed")).toBeInTheDocument();
  });

  it("shows retry button when onRetry is provided", () => {
    render(<ErrorState message="Error" onRetry={() => {}} />);
    expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
  });

  it("does not show retry button when onRetry is not provided", () => {
    render(<ErrorState message="Error" />);
    expect(screen.queryByRole("button", { name: /retry/i })).not.toBeInTheDocument();
  });

  it("calls onRetry when button is clicked", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(<ErrorState message="Error" onRetry={onRetry} />);
    await user.click(screen.getByRole("button", { name: /retry/i }));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
