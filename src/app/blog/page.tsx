import type { Metadata } from "next";
import Link from "next/link";
import { Suspense, use } from "react";
import { MarkdownPostRepository } from "@/content/markdown.repository";
import { PostCard } from "@/components/blog/PostCard";
import { CategoryFilter } from "@/components/blog/CategoryFilter";
import { Card } from "@/components/ui/Card";
import { SITE_CONFIG } from "@/lib/config/site.config";
import type { CategorySlug } from "@/content/post.types";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: `Blog - ${SITE_CONFIG.authorName}`,
  description: "Articles about software architecture, engineering leadership, team building, and technical excellence.",
  openGraph: {
    type: "website",
    title: `Blog - ${SITE_CONFIG.authorName}`,
    description: "Articles about software architecture, engineering leadership, team building, and technical excellence.",
  },
};

// For static export compatibility - render default state server-side
export default async function BlogPage() {
  const postRepository = new MarkdownPostRepository();

  // Get all published posts for static generation
  const postsResult = await postRepository.findPublished({ page: 1, perPage: 12 });

  // Get all posts to determine available categories
  const allPosts = await postRepository.findPublished({ page: 1, perPage: 1000 });
  const availableCategories = Array.from(
    new Set(
      allPosts.items
        .map((post) => post.category)
        .filter((cat): cat is CategorySlug => cat !== undefined)
    )
  ).sort();

  return (
    <main id="main-content" className={styles["main"]}>
      {/* Hero Section */}
      <section className={styles["hero"]}>
        <div className={styles["container"]}>
          <div className={styles["heroContent"]}>
            <h1 className={styles["heroTitle"]}>Engineering Insights</h1>
            <p className={styles["heroDescription"]}>
              Sharing thoughts on software architecture, engineering leadership,
              team building, and the craft of building great software.
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className={styles["content"]}>
        <div className={styles["container"]}>
          {/* Category Filter */}
          <div className={styles["filterSection"]}>
            <Suspense fallback={<div>Loading filters...</div>}>
              <CategoryFilter
                categories={availableCategories}
                postCount={postsResult.total}
              />
            </Suspense>
          </div>

          {/* Posts Grid */}
          {postsResult.items.length > 0 ? (
            <>
              <div className={styles["postsGrid"]}>
                {postsResult.items.map((post) => (
                  <PostCard key={post.slug} post={post} />
                ))}
              </div>

              {/* Pagination - For static export, show all posts without pagination for now */}
              {postsResult.totalPages > 1 && (
                <div className={styles["pagination"]}>
                  <div className={styles["paginationInfo"]}>
                    Showing {postsResult.items.length} of {postsResult.total} {postsResult.total === 1 ? 'post' : 'posts'}
                  </div>
                  {postsResult.total > 12 && (
                    <p className={styles["paginationNote"]}>
                      Category filtering and pagination handled client-side for static export compatibility.
                    </p>
                  )}
                </div>
              )}
            </>
          ) : (
            <Card className={styles["emptyState"]}>
              <h2>No Posts Found</h2>
              <p>
                No posts have been published yet. Check back soon for new content!
              </p>
              <p>
                Use the category filter above to browse posts by topic once content is available.
              </p>
              {/* Reset filter will be handled by CategoryFilter component */}
            </Card>
          )}
        </div>
      </section>
    </main>
  );
}