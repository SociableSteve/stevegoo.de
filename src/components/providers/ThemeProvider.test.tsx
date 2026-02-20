import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach } from "vitest";
import ThemeProvider, { useTheme } from "./ThemeProvider";

// Test component that uses the theme hook
function TestComponent() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button onClick={toggleTheme} data-testid="toggle">
        Toggle Theme
      </button>
    </div>
  );
}

describe("ThemeProvider", () => {
  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();
    // Reset document data-theme
    delete document.documentElement.dataset['theme'];
  });

  it("provides initial theme as light by default", () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId("theme")).toHaveTextContent("light");
  });

  it("reads initial theme from data-theme attribute", () => {
    document.documentElement.dataset['theme'] = "dark";

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId("theme")).toHaveTextContent("dark");
  });

  it("toggles theme and updates localStorage", async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const toggleButton = screen.getByTestId("toggle");
    const themeDisplay = screen.getByTestId("theme");

    // Initial state
    expect(themeDisplay).toHaveTextContent("light");

    // Toggle to dark
    await user.click(toggleButton);
    expect(themeDisplay).toHaveTextContent("dark");
    expect(localStorage.getItem("theme")).toBe("dark");
    expect(document.documentElement.dataset['theme']).toBe("dark");

    // Toggle back to light
    await user.click(toggleButton);
    expect(themeDisplay).toHaveTextContent("light");
    expect(localStorage.getItem("theme")).toBe("light");
    expect(document.documentElement.dataset['theme']).toBe("light");
  });

  it("throws error when useTheme is used outside provider", () => {
    // Silence console.error for this test
    const originalError = console.error;
    console.error = () => {};

    expect(() => render(<TestComponent />)).toThrow(
      "useTheme must be used within a ThemeProvider"
    );

    console.error = originalError;
  });
});