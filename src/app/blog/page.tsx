import type { Metadata } from "next";
import { Suspense } from "react";
import { MarkdownPostRepository } from "@/content/markdown.repository";
import { BlogPostsClient } from "@/components/blog/BlogPostsClient";
import { SITE_CONFIG } from "@/lib/config/site.config";
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

// For static export compatibility - fetch all posts server-side, filter client-side
export default async function BlogPage() {
  const postRepository = new MarkdownPostRepository();

  // Get all published posts for client-side filtering
  const postsResult = await postRepository.findPublished({ page: 1, perPage: 100 });


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
          <Suspense fallback={<div>Loading posts...</div>}>
            <BlogPostsClient posts={postsResult.items} />
          </Suspense>
        </div>
      </section>
    </main>
  );
}