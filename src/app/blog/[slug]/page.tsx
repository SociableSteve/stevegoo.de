import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MarkdownPostRepository } from "@/content/markdown.repository";
import { PostMeta } from "@/components/blog/PostMeta";
import { ProseContent } from "@/components/blog/ProseContent";
import { Badge } from "@/components/ui/Badge";
import { BackToTopButton } from "@/components/ui/BackToTopButton";
import { SITE_CONFIG } from "@/lib/config/site.config";
import type { PostSlug } from "@/content/post.types";
import styles from "./page.module.css";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

// Generate static params for all blog posts
export async function generateStaticParams() {
  const postRepository = new MarkdownPostRepository();
  const posts = await postRepository.findPublished({ page: 1, perPage: 1000 });

  return posts.items.map((post) => ({
    slug: post.slug,
  }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const postRepository = new MarkdownPostRepository();
  const resolvedParams = await params;
  const post = await postRepository.findBySlug(resolvedParams.slug as PostSlug);

  if (!post) {
    return {
      title: `Post Not Found - ${SITE_CONFIG.authorName}`,
      description: "The requested blog post could not be found.",
    };
  }

  return {
    title: `${post.title} - ${SITE_CONFIG.authorName}`,
    description: post.description,
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      publishedTime: post.publishedAt,
      authors: [SITE_CONFIG.authorName],
      tags: post.tags,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const postRepository = new MarkdownPostRepository();
  const resolvedParams = await params;
  const post = await postRepository.findBySlug(resolvedParams.slug as PostSlug);

  if (!post) {
    notFound();
  }

  // Check if this is an external post
  const isExternal = post.externalUrl != null && post.externalUrl !== "";

  return (
    <main id="main-content" className={styles["main"]}>
      {/* Breadcrumb Navigation */}
      <nav className={styles["breadcrumb"]} aria-label="Breadcrumb">
        <div className={styles["container"]}>
          <Link href="/blog" className={styles["breadcrumbLink"]}>
            ← Back to Blog
          </Link>
        </div>
      </nav>

      <article className={styles["article"]}>
        <div className={styles["container"]}>
          <div className={styles["articleLayout"]}>
            {/* Main Content */}
            <div className={styles["articleContent"]}>
              {/* Article Header */}
              <header className={styles["articleHeader"]}>
                <h1 className={styles["articleTitle"]}>{post.title}</h1>

                <PostMeta
                  publishedAt={post.publishedAt}
                  updatedAt={post.updatedAt}
                  readingTimeMinutes={post.readingTimeMinutes}
                  author={SITE_CONFIG.authorName}
                  className={styles["articleMeta"] ?? ""}
                />

                {/* Tags below metadata for better information hierarchy */}
                {post.tags && post.tags.length > 0 && (
                  <nav className={styles["headerTags"]} aria-label="Post tags">
                    {post.tags.map((tag, index) => (
                      <Link
                        key={`tag-${index}-${tag}`}
                        href={`/blog?tag=${encodeURIComponent(tag)}`}
                        className={styles["tagLink"]}
                      >
                        <Badge variant="neutral">
                          {tag}
                        </Badge>
                      </Link>
                    ))}
                  </nav>
                )}

                <hr className={styles["divider"]} aria-hidden="true" />

                {isExternal && (
                  <div className={styles["externalNotice"]}>
                    <p>
                      This article was originally published on an external platform.{" "}
                      <a
                        href={post.externalUrl ?? ""}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles["externalLink"]}
                      >
                        Read the full article →
                      </a>
                    </p>
                  </div>
                )}
              </header>

              {/* Article Body */}
              {!isExternal && (
                <div className={styles["articleBody"]}>
                  <ProseContent html={post.content} />
                </div>
              )}

              {/* Article Footer */}
              <footer className={styles["articleFooter"]}>
                <div className={styles["backToTop"]}>
                  <BackToTopButton className={styles["backToTopButton"] ?? ""} />
                </div>
              </footer>
            </div>

            {/* Table of Contents Sidebar - TODO: Implement TOC extraction from content */}
          </div>
        </div>
      </article>

      {/* Navigation Section */}
      <nav className={styles["postNavigation"]} aria-label="Post navigation">
        <div className={styles["container"]}>
          <div className={styles["navigationLinks"]}>
            <Link href="/blog" className={styles["navigationLink"]}>
              ← All Posts
            </Link>
          </div>
        </div>
      </nav>
    </main>
  );
}