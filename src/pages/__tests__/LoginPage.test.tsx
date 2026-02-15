import { describe, it, expect } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/test-utils";
import LoginPage from "../LoginPage";

describe("LoginPage", () => {
  it("renders login form", () => {
    renderWithProviders(<LoginPage />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("toggles password visibility", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    const passwordInput = screen.getByLabelText(/password/i);
    expect(passwordInput).toHaveAttribute("type", "password");

    await user.click(screen.getByText("Show"));
    expect(passwordInput).toHaveAttribute("type", "text");

    await user.click(screen.getByText("Hide"));
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  it("shows error on invalid credentials", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), "wrong@test.com");
    await user.type(screen.getByLabelText(/password/i), "badpass");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });

  it("fills demo credentials when demo button is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    await user.click(screen.getByText("Admin"));

    expect(screen.getByLabelText(/email/i)).toHaveValue("admin@ecqes.edu");
    expect(screen.getByLabelText(/password/i)).toHaveValue("admin123");
  });

  it("has a link to forgot password", () => {
    renderWithProviders(<LoginPage />);
    expect(screen.getByText(/reset it here/i)).toHaveAttribute("href", "/forgot-password");
  });
});
