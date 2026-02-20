/**
 * Button component tests
 *
 * Coverage areas:
 *  1. Rendering — variant, size, icon slot, loading state
 *  2. Accessibility — axe-core violations, ARIA attributes, roles
 *  3. Keyboard navigation — focus, Enter / Space activation
 *  4. Interaction — click handlers, disabled state, loading state
 *  5. Ref forwarding
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { Button } from "./Button";

/* ============================================================
   Axe accessibility helper
   ============================================================ */

async function runAxe(container: Element) {
  const results = await axe.run(container);
  return results.violations;
}

/* ============================================================
   1. Rendering
   ============================================================ */

describe("Button — rendering", () => {
  it("renders with default props", () => {
    render(<Button>Click me</Button>);
    const btn = screen.getByRole("button", { name: "Click me" });
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveAttribute("type", "button");
  });

  it.each(["primary", "secondary", "ghost", "destructive"] as const)(
    "renders %s variant without crashing",
    (variant) => {
      render(<Button variant={variant}>Label</Button>);
      expect(screen.getByRole("button", { name: "Label" })).toBeInTheDocument();
    },
  );

  it.each(["sm", "md", "lg"] as const)(
    "renders %s size without crashing",
    (size) => {
      render(<Button size={size}>Label</Button>);
      expect(screen.getByRole("button", { name: "Label" })).toBeInTheDocument();
    },
  );

  it("renders a leading icon", () => {
    render(
      <Button leadingIcon={<span data-testid="icon" />}>Save</Button>,
    );
    expect(screen.getByTestId("icon")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it("renders a trailing icon", () => {
    render(
      <Button trailingIcon={<span data-testid="trailing" />}>Next</Button>,
    );
    expect(screen.getByTestId("trailing")).toBeInTheDocument();
  });

  it("merges custom className", () => {
    render(<Button className="custom-class">Label</Button>);
    expect(screen.getByRole("button")).toHaveClass("custom-class");
  });

  it("passes arbitrary HTML attributes to the button element", () => {
    render(<Button data-testid="my-btn">Label</Button>);
    expect(screen.getByTestId("my-btn")).toBeInTheDocument();
  });
});

/* ============================================================
   2. Loading state
   ============================================================ */

describe("Button — loading state", () => {
  it("sets aria-busy when loading", () => {
    render(<Button isLoading>Save</Button>);
    const btn = screen.getByRole("button");
    expect(btn).toHaveAttribute("aria-busy", "true");
  });

  it("sets aria-disabled when loading", () => {
    render(<Button isLoading>Save</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("aria-disabled", "true");
  });

  it("renders a spinner element when loading", () => {
    const { container } = render(<Button isLoading>Save</Button>);
    // Spinner is a span with aria-hidden — first aria-hidden span inside the button
    const spinner = container.querySelector('button span[aria-hidden="true"]');
    expect(spinner).toBeInTheDocument();
  });

  it("hides leading icon while loading", () => {
    render(
      <Button isLoading leadingIcon={<span data-testid="icon" />}>
        Save
      </Button>,
    );
    expect(screen.queryByTestId("icon")).not.toBeInTheDocument();
  });

  it("hides trailing icon while loading", () => {
    render(
      <Button isLoading trailingIcon={<span data-testid="trailing" />}>
        Save
      </Button>,
    );
    expect(screen.queryByTestId("trailing")).not.toBeInTheDocument();
  });

  it("uses explicit loadingLabel as aria-label when loading", () => {
    render(
      <Button isLoading loadingLabel="Saving your changes">
        Save
      </Button>,
    );
    expect(screen.getByRole("button")).toHaveAttribute(
      "aria-label",
      "Saving your changes",
    );
  });

  it("appends (loading) to existing aria-label when loading", () => {
    render(
      <Button isLoading aria-label="Save document">
        Save
      </Button>,
    );
    expect(screen.getByRole("button")).toHaveAttribute(
      "aria-label",
      "Save document (loading)",
    );
  });

  it("does not fire onClick while loading", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(
      <Button isLoading onClick={handleClick}>
        Save
      </Button>,
    );
    await user.click(screen.getByRole("button"));
    expect(handleClick).not.toHaveBeenCalled();
  });
});

/* ============================================================
   3. Disabled states
   ============================================================ */

describe("Button — disabled states", () => {
  it("sets disabled attribute", () => {
    render(<Button disabled>Label</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("does not fire onClick when disabled", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(
      <Button disabled onClick={handleClick}>
        Label
      </Button>,
    );
    // userEvent respects disabled attribute and won't click
    await user.click(screen.getByRole("button"));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("sets aria-disabled for disabledFocusable", () => {
    render(<Button disabledFocusable>Label</Button>);
    const btn = screen.getByRole("button");
    expect(btn).toHaveAttribute("aria-disabled", "true");
    expect(btn).not.toBeDisabled();
  });

  it("does not fire onClick for disabledFocusable", () => {
    const handleClick = vi.fn();
    render(
      <Button disabledFocusable onClick={handleClick}>
        Label
      </Button>,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).not.toHaveBeenCalled();
  });
});

/* ============================================================
   4. Interaction
   ============================================================ */

describe("Button — interaction", () => {
  it("calls onClick when clicked", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Submit</Button>);
    await user.click(screen.getByRole("button", { name: "Submit" }));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it("calls onClick when Enter is pressed while focused", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Submit</Button>);
    screen.getByRole("button").focus();
    await user.keyboard("{Enter}");
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it("calls onClick when Space is pressed while focused", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Submit</Button>);
    screen.getByRole("button").focus();
    await user.keyboard(" ");
    expect(handleClick).toHaveBeenCalledOnce();
  });
});

/* ============================================================
   5. Ref forwarding
   ============================================================ */

describe("Button — ref forwarding", () => {
  it("forwards ref to the underlying button element", () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Label</Button>);
    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName).toBe("BUTTON");
  });

  it("allows programmatic focus via ref", () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Label</Button>);
    ref.current?.focus();
    expect(document.activeElement).toBe(ref.current);
  });
});

/* ============================================================
   6. Accessibility — axe-core
   ============================================================ */

describe("Button — accessibility (axe-core)", () => {
  it("primary button has no axe violations", async () => {
    const { container } = render(
      <Button variant="primary">Submit form</Button>,
    );
    const violations = await runAxe(container);
    expect(violations).toHaveLength(0);
  });

  it("secondary button has no axe violations", async () => {
    const { container } = render(
      <Button variant="secondary">Cancel</Button>,
    );
    const violations = await runAxe(container);
    expect(violations).toHaveLength(0);
  });

  it("ghost button has no axe violations", async () => {
    const { container } = render(<Button variant="ghost">More</Button>);
    const violations = await runAxe(container);
    expect(violations).toHaveLength(0);
  });

  it("destructive button has no axe violations", async () => {
    const { container } = render(
      <Button variant="destructive">Delete account</Button>,
    );
    const violations = await runAxe(container);
    expect(violations).toHaveLength(0);
  });

  it("loading button has no axe violations", async () => {
    const { container } = render(
      <Button isLoading loadingLabel="Submitting form">
        Submit
      </Button>,
    );
    const violations = await runAxe(container);
    expect(violations).toHaveLength(0);
  });

  it("disabled button has no axe violations", async () => {
    const { container } = render(
      <Button disabled>Cannot submit</Button>,
    );
    const violations = await runAxe(container);
    expect(violations).toHaveLength(0);
  });

  it("icon-only button with aria-label has no axe violations", async () => {
    const { container } = render(
      <Button aria-label="Open settings">
        <svg aria-hidden="true" viewBox="0 0 16 16" width="16" height="16">
          <circle cx="8" cy="8" r="4" />
        </svg>
      </Button>,
    );
    const violations = await runAxe(container);
    expect(violations).toHaveLength(0);
  });
});
