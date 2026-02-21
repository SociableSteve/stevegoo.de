/**
 * BlogPostsClient component tests
 *
 * Coverage areas:
 *  1. URL param parsing and tag filtering
 *  2. Case-insensitive tag matching
 *  3. Empty states and post counts
 *  4. Clear filter navigation
 *  5. Accessibility
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi, type MockedFunction } from "vitest";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { BlogPostsClient } from "./BlogPostsClient";
import { buildPost, createPostSlug } from "@/test/helpers/post.builders";

// Mock Next.js navigation hooks
vi.mock("next/navigation", () => ({
  useSearchParams: vi.fn(),
  useRouter: vi.fn(),
  usePathname: vi.fn(),
}));

const mockUseSearchParams = useSearchParams as MockedFunction<typeof useSearchParams>;
const mockUseRouter = useRouter as MockedFunction<typeof useRouter>;
const mockUsePathname = usePathname as MockedFunction<typeof usePathname>;

describe("BlogPostsClient", () => {
  const mockPush = vi.fn();

  const samplePosts = [
    buildPost({
      slug: createPostSlug("typescript-post"),
      title: "TypeScript Tips",
      tags: ["TypeScript", "Programming"],
      draft: false,
    }),
    buildPost({
      slug: createPostSlug("react-post"),
      title: "React Patterns",
      tags: ["React", "Frontend"],
      draft: false,
    }),
    buildPost({
      slug: createPostSlug("mixed-case-post"),
      title: "Mixed Case Tags",
      tags: ["TypeScript", "react"], // Mixed case for testing
      draft: false,
    }),
  ];

  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      push: mockPush,
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
    } as ReturnType<typeof useRouter>);
    mockUsePathname.mockReturnValue("/blog");
    mockPush.mockClear();
  });

  describe("tag filtering", () => {
    it("shows all posts when no tag filter is active", () => {
      const mockSearchParams = new URLSearchParams();
      mockUseSearchParams.mockReturnValue(mockSearchParams as ReturnType<typeof useSearchParams>);

      render(<BlogPostsClient posts={samplePosts} />);

      expect(screen.getByText("TypeScript Tips")).toBeInTheDocument();
      expect(screen.getByText("React Patterns")).toBeInTheDocument();
      expect(screen.getByText("Mixed Case Tags")).toBeInTheDocument();
      expect(screen.getByText("Showing 3 of 3 posts")).toBeInTheDocument();
    });

    it("filters posts by exact tag match", () => {
      const mockSearchParams = new URLSearchParams("tag=TypeScript");
      mockUseSearchParams.mockReturnValue(mockSearchParams as ReturnType<typeof useSearchParams>);

      render(<BlogPostsClient posts={samplePosts} />);

      // Check filtered posts are shown
      expect(screen.getByText("TypeScript Tips")).toBeInTheDocument();
      expect(screen.getByText("Mixed Case Tags")).toBeInTheDocument();
      expect(screen.queryByText("React Patterns")).not.toBeInTheDocument();

      // Check filter UI is shown
      expect(screen.getByText('Showing posts tagged with:')).toBeInTheDocument();
    });

    it("performs case-insensitive tag matching", () => {
      const mockSearchParams = new URLSearchParams("tag=REACT");
      mockUseSearchParams.mockReturnValue(mockSearchParams as ReturnType<typeof useSearchParams>);

      render(<BlogPostsClient posts={samplePosts} />);

      expect(screen.getByText("React Patterns")).toBeInTheDocument();
      expect(screen.getByText("Mixed Case Tags")).toBeInTheDocument(); // has lowercase "react"
      expect(screen.queryByText("TypeScript Tips")).not.toBeInTheDocument();
      // Check that the count shows 2 filtered posts and contains REACT
      const postsCountElement = document.querySelector('[class*="postsCount"]');
      expect(postsCountElement?.textContent).toMatch(/Showing 2 of 3 posts/);
      expect(postsCountElement?.textContent).toContain("REACT");
    });

    it("shows filter indicator when tag is selected", () => {
      const mockSearchParams = new URLSearchParams("tag=Programming");
      mockUseSearchParams.mockReturnValue(mockSearchParams as ReturnType<typeof useSearchParams>);

      render(<BlogPostsClient posts={samplePosts} />);

      expect(screen.getByText("Showing posts tagged with:")).toBeInTheDocument();
      // Check that the count shows 1 filtered post and contains Programming
      const postsCountElement = document.querySelector('[class*="postsCount"]');
      expect(postsCountElement?.textContent).toMatch(/Showing 1 of 3 posts/);
      expect(postsCountElement?.textContent).toContain("Programming");
      expect(screen.getAllByRole("button", { name: "Show All Posts" })).toHaveLength(1);
    });
  });

  describe("empty states", () => {
    it("shows no posts found state when tag has no matches", () => {
      const mockSearchParams = new URLSearchParams("tag=NonExistentTag");
      mockUseSearchParams.mockReturnValue(mockSearchParams as ReturnType<typeof useSearchParams>);

      render(<BlogPostsClient posts={samplePosts} />);

      expect(screen.getByText("No Posts Found")).toBeInTheDocument();
      expect(screen.getByText(/No posts found with the tag/)).toBeInTheDocument();
      expect(screen.getAllByRole("button", { name: "Show All Posts" })).toHaveLength(2);
    });

    it("shows general empty state when no posts exist", () => {
      const mockSearchParams = new URLSearchParams();
      mockUseSearchParams.mockReturnValue(mockSearchParams as ReturnType<typeof useSearchParams>);

      render(<BlogPostsClient posts={[]} />);

      expect(screen.getByText("No Posts Found")).toBeInTheDocument();
      expect(screen.getByText("No posts have been published yet. Check back soon for new content!")).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Show All Posts" })).not.toBeInTheDocument();
    });
  });

  describe("clear filter navigation", () => {
    it("navigates to blog page when clear filter is clicked", () => {
      const mockSearchParams = new URLSearchParams("tag=TypeScript");
      mockUseSearchParams.mockReturnValue(mockSearchParams as ReturnType<typeof useSearchParams>);

      render(<BlogPostsClient posts={samplePosts} />);

      const clearButton = screen.getAllByRole("button", { name: "Show All Posts" })[0]!;
      fireEvent.click(clearButton);

      expect(mockPush).toHaveBeenCalledWith("/blog");
    });

    it("navigates from empty state clear button", () => {
      const mockSearchParams = new URLSearchParams("tag=NonExistentTag");
      mockUseSearchParams.mockReturnValue(mockSearchParams as ReturnType<typeof useSearchParams>);

      render(<BlogPostsClient posts={samplePosts} />);

      const clearButtons = screen.getAllByRole("button", { name: "Show All Posts" });
      fireEvent.click(clearButtons[0]!);

      expect(mockPush).toHaveBeenCalledWith("/blog");
    });
  });

  describe("post counts", () => {
    it("shows correct singular/plural post counts", () => {
      const singlePost = [samplePosts[0]!];
      const mockSearchParams = new URLSearchParams();
      mockUseSearchParams.mockReturnValue(mockSearchParams as ReturnType<typeof useSearchParams>);

      render(<BlogPostsClient posts={singlePost} />);

      expect(screen.getByText("Showing 1 of 1 post")).toBeInTheDocument();
    });

    it("shows correct filtered count with tag name", () => {
      const mockSearchParams = new URLSearchParams("tag=TypeScript");
      mockUseSearchParams.mockReturnValue(mockSearchParams as ReturnType<typeof useSearchParams>);

      render(<BlogPostsClient posts={samplePosts} />);

      // Check that the count shows 2 filtered posts and contains TypeScript
      const postsCountElement = document.querySelector('[class*="postsCount"]');
      expect(postsCountElement?.textContent).toMatch(/Showing 2 of 3 posts/);
      expect(postsCountElement?.textContent).toContain("TypeScript");
    });
  });

  describe("accessibility", () => {
    it("has proper button roles and labels", () => {
      const mockSearchParams = new URLSearchParams("tag=TypeScript");
      mockUseSearchParams.mockReturnValue(mockSearchParams as ReturnType<typeof useSearchParams>);

      render(<BlogPostsClient posts={samplePosts} />);

      const clearButtons = screen.getAllByRole("button", { name: "Show All Posts" });
      expect(clearButtons[0]).toHaveAttribute("type", "button");
    });

    it("includes screen reader friendly post count text", () => {
      const mockSearchParams = new URLSearchParams("tag=Programming");
      mockUseSearchParams.mockReturnValue(mockSearchParams as ReturnType<typeof useSearchParams>);

      render(<BlogPostsClient posts={samplePosts} />);

      // Check that the count shows 1 filtered post and contains Programming
      const postsCountElement = document.querySelector('[class*="postsCount"]');
      expect(postsCountElement?.textContent).toMatch(/Showing 1 of 3 posts/);
      expect(postsCountElement?.textContent).toContain("Programming");
    });
  });

  describe("grid layout", () => {
    it("renders posts in a grid layout", () => {
      const mockSearchParams = new URLSearchParams();
      mockUseSearchParams.mockReturnValue(mockSearchParams as ReturnType<typeof useSearchParams>);

      const { container } = render(<BlogPostsClient posts={samplePosts} />);
      const grid = container.querySelector('[class*="postsGrid"]');

      expect(grid).toBeInTheDocument();
      expect(grid?.children).toHaveLength(3);
    });
  });
});