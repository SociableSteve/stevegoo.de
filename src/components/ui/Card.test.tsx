/**
 * Card component tests
 *
 * Coverage areas:
 *  1. Rendering — root element, elevation, sub-components
 *  2. Polymorphism — `as` prop semantic elements
 *  3. Interactive card — class, ARIA, keyboard affordance
 *  4. Compound components — Header, Body, Footer
 *  5. Accessibility — axe-core violations
 *  6. Ref forwarding
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import axe from "axe-core";
import { Card, CardHeader, CardBody, CardFooter } from "./Card";

/* ============================================================
   Axe helper
   ============================================================ */

async function runAxe(container: Element) {
  const results = await axe.run(container);
  return results.violations;
}

/* ============================================================
   1. Rendering
   ============================================================ */

describe("Card — rendering", () => {
  it("renders as div by default", () => {
    const { container } = render(<Card>Content</Card>);
    expect(container.firstChild?.nodeName).toBe("DIV");
  });

  it("renders children", () => {
    render(<Card>Hello Card</Card>);
    expect(screen.getByText("Hello Card")).toBeInTheDocument();
  });

  it("merges custom className", () => {
    const { container } = render(<Card className="my-card">Content</Card>);
    expect(container.firstChild).toHaveClass("my-card");
  });

  it("passes arbitrary HTML attributes", () => {
    render(<Card data-testid="test-card">Content</Card>);
    expect(screen.getByTestId("test-card")).toBeInTheDocument();
  });

  it.each(["flat", "raised", "elevated"] as const)(
    "renders %s elevation without crashing",
    (elevation) => {
      render(<Card elevation={elevation}>Content</Card>);
      expect(screen.getByText("Content")).toBeInTheDocument();
    },
  );
});

/* ============================================================
   2. Polymorphism — `as` prop
   ============================================================ */

describe("Card — polymorphic `as` prop", () => {
  it("renders as article when as='article'", () => {
    const { container } = render(
      <Card as="article">
        <h2>Post title</h2>
        <p>Post excerpt</p>
      </Card>,
    );
    expect(container.querySelector("article")).toBeInTheDocument();
  });

  it("renders as section when as='section'", () => {
    const { container } = render(<Card as="section">Section</Card>);
    expect(container.querySelector("section")).toBeInTheDocument();
  });

  it("renders as li when as='li'", () => {
    const { container } = render(
      <ul>
        <Card as="li">List item card</Card>
      </ul>,
    );
    expect(container.querySelector("li")).toBeInTheDocument();
  });

  it("renders as button when as='button'", () => {
    render(<Card as="button">Interactive card</Card>);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });
});

/* ============================================================
   3. Interactive card
   ============================================================ */

describe("Card — interactive prop", () => {
  it("is not interactive by default", () => {
    const { container } = render(<Card>Content</Card>);
    // The interactive CSS class should not be present
    // We can't check CSS class names directly (hashed modules), so we
    // verify the element does NOT have the interactive data attribute
    // by checking cursor-pointer is not set via inline style
    expect(container.firstChild).not.toHaveAttribute("data-interactive");
  });

  it("forwards onClick when interactive", async () => {
    const handleClick = vi.fn();
    render(
      <Card as="button" isInteractive onClick={handleClick}>
        Click me
      </Card>,
    );
    screen.getByRole("button").click();
    expect(handleClick).toHaveBeenCalledOnce();
  });
});

/* ============================================================
   4. Compound components
   ============================================================ */

describe("Card — compound components", () => {
  it("renders CardHeader children", () => {
    render(
      <Card>
        <CardHeader>
          <h2>Title</h2>
        </CardHeader>
      </Card>,
    );
    expect(screen.getByRole("heading", { name: "Title" })).toBeInTheDocument();
  });

  it("renders CardBody children", () => {
    render(
      <Card>
        <CardBody>
          <p>Body text</p>
        </CardBody>
      </Card>,
    );
    expect(screen.getByText("Body text")).toBeInTheDocument();
  });

  it("renders CardFooter children", () => {
    render(
      <Card>
        <CardFooter>
          <span>Footer info</span>
        </CardFooter>
      </Card>,
    );
    expect(screen.getByText("Footer info")).toBeInTheDocument();
  });

  it("renders full blog-post card composition", () => {
    render(
      <Card as="article">
        <CardHeader>
          <h2>My Blog Post</h2>
          <time dateTime="2026-02-19">Feb 19, 2026</time>
        </CardHeader>
        <CardBody>
          <p>Excerpt text for the blog post.</p>
        </CardBody>
        <CardFooter>
          <span>5 min read</span>
        </CardFooter>
      </Card>,
    );

    expect(
      screen.getByRole("heading", { name: "My Blog Post" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Excerpt text for the blog post.")).toBeInTheDocument();
    expect(screen.getByText("5 min read")).toBeInTheDocument();
    expect(screen.getByText("Feb 19, 2026")).toBeInTheDocument();
  });

  it("sub-components accept custom className", () => {
    const { container } = render(
      <Card>
        <CardHeader className="custom-header">Header</CardHeader>
        <CardBody className="custom-body">Body</CardBody>
        <CardFooter className="custom-footer">Footer</CardFooter>
      </Card>,
    );
    expect(container.querySelector(".custom-header")).toBeInTheDocument();
    expect(container.querySelector(".custom-body")).toBeInTheDocument();
    expect(container.querySelector(".custom-footer")).toBeInTheDocument();
  });
});

/* ============================================================
   5. Accessibility — axe-core
   ============================================================ */

describe("Card — accessibility (axe-core)", () => {
  it("plain card has no axe violations", async () => {
    const { container } = render(
      <Card>
        <p>Simple card content</p>
      </Card>,
    );
    expect(await runAxe(container)).toHaveLength(0);
  });

  it("article card with heading has no axe violations", async () => {
    const { container } = render(
      <Card as="article">
        <CardHeader>
          <h2>Post Title</h2>
        </CardHeader>
        <CardBody>
          <p>Post content.</p>
        </CardBody>
        <CardFooter>
          <time dateTime="2026-02-19">Feb 19, 2026</time>
        </CardFooter>
      </Card>,
    );
    expect(await runAxe(container)).toHaveLength(0);
  });

  it("interactive button card has no axe violations", async () => {
    const { container } = render(
      <Card
        as="button"
        isInteractive
        aria-label="Read post: My Blog Post"
      >
        <CardHeader>
          <span aria-hidden="true">My Blog Post</span>
        </CardHeader>
      </Card>,
    );
    expect(await runAxe(container)).toHaveLength(0);
  });

  it("card with nested link has no axe violations", async () => {
    const { container } = render(
      <Card as="article">
        <CardHeader>
          <h2>
            <a href="/posts/my-post">My Blog Post</a>
          </h2>
        </CardHeader>
        <CardBody>
          <p>Excerpt.</p>
        </CardBody>
      </Card>,
    );
    expect(await runAxe(container)).toHaveLength(0);
  });

  it("list of cards has no axe violations", async () => {
    const { container } = render(
      <ul>
        {["Alpha", "Beta", "Gamma"].map((title) => (
          <Card key={title} as="li">
            <CardHeader>
              <h3>{title}</h3>
            </CardHeader>
          </Card>
        ))}
      </ul>,
    );
    expect(await runAxe(container)).toHaveLength(0);
  });
});

/* ============================================================
   6. Ref forwarding
   ============================================================ */

describe("Card — ref forwarding", () => {
  it("forwards ref to the root element", () => {
    const ref = React.createRef<HTMLElement>();
    render(<Card ref={ref}>Content</Card>);
    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName).toBe("DIV");
  });

  it("forwards ref to article element when as='article'", () => {
    const ref = React.createRef<HTMLElement>();
    render(<Card as="article" ref={ref}>Content</Card>);
    expect(ref.current?.tagName).toBe("ARTICLE");
  });
});

/* ============================================================
   7. noPadding modifier
   ============================================================ */

describe("Card — noPadding", () => {
  it("renders without crashing with noPadding", () => {
    render(
      <Card noPadding>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/placeholder.jpg" alt="Cover" />
        <CardBody>
          <p>Content below image</p>
        </CardBody>
      </Card>,
    );
    expect(screen.getByText("Content below image")).toBeInTheDocument();
  });
});
