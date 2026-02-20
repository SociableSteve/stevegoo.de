"use client";

import { useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { PostCard } from "@/components/blog/PostCard";
import { Badge } from "@/components/ui";
import { Card } from "@/components/ui/Card";
import type { PostSummary } from "@/content/post.types";
import styles from "./BlogPostsClient.module.css";

interface BlogPostsClientProps {
  posts: readonly PostSummary[];
}

export function BlogPostsClient({ posts }: BlogPostsClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Get the tag from URL params directly
  const selectedTag = searchParams.get("tag");

  // Filter posts based on selected tag
  const filteredPosts = useMemo(() => {
    if (!selectedTag) {
      return posts;
    }
    return posts.filter(post =>
      post.tags.some(tag =>
        tag.toLowerCase() === selectedTag.toLowerCase()
      )
    );
  }, [posts, selectedTag]);


  const clearFilter = () => {
    // Create new URL params without the tag filter
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.delete("tag");

    const queryString = newParams.toString();
    const url = queryString ? `${pathname}?${queryString}` : pathname;
    router.push(url);
  };

  return (
    <>
      {/* Filter indicator */}
      {selectedTag && (
        <div className={styles["filterIndicator"]}>
          <p className={styles["filterText"]}>
            Showing posts tagged with:{" "}
            <Badge variant="default">{selectedTag}</Badge>
          </p>
          <button
            onClick={clearFilter}
            className={styles["clearFilter"]}
            type="button"
          >
            Show All Posts
          </button>
        </div>
      )}

      {/* Posts Grid */}
      {filteredPosts.length > 0 ? (
        <>
          <div className={styles["postsGrid"]}>
            {filteredPosts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>

          <div className={styles["postsInfo"]}>
            <p className={styles["postsCount"]}>
              Showing {filteredPosts.length} of {posts.length} {posts.length === 1 ? 'post' : 'posts'}
              {selectedTag && ` tagged with \u201c${selectedTag}\u201d`}
            </p>
          </div>
        </>
      ) : selectedTag ? (
        <Card className={styles["emptyState"]}>
          <h2>No Posts Found</h2>
          <p>
            No posts found with the tag &ldquo;{selectedTag}&rdquo;.
          </p>
          <button
            onClick={clearFilter}
            className={styles["clearFilterButton"]}
            type="button"
          >
            Show All Posts
          </button>
        </Card>
      ) : (
        <Card className={styles["emptyState"]}>
          <h2>No Posts Found</h2>
          <p>
            No posts have been published yet. Check back soon for new content!
          </p>
        </Card>
      )}
    </>
  );
}