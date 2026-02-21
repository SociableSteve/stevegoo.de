import fs from "fs";
import path from "path";
import { parse as parseYaml } from "yaml";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import rehypePrettyCode from "rehype-pretty-code";
import type { PostRepository, PaginatedResult, PaginationParams } from "./post.repository";
import type { Post, PostSummary } from "./post.types";
import { PostFrontmatterSchema, createPostSlug } from "./post.types";
import { calculateReadingTime } from "@/lib/content/reading-time";
import { FrontmatterError } from "@/lib/frontmatter-error";
import { markdownImageHandler } from "@/lib/markdown-image-handler";

export class MarkdownPostRepository implements PostRepository {
  private postsDir: string;

  constructor(postsDir: string = path.join(process.cwd(), "content", "posts")) {
    this.postsDir = postsDir;
  }

  async findAll(): Promise<Post[]> {
    const posts = await this.getAllPosts();
    return posts.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  }

  async findBySlug(slug: string): Promise<Post | null> {
    const posts = await this.getAllPosts();
    return posts.find(post => post.slug === slug) || null;
  }

  async findPublished(params?: PaginationParams): Promise<PaginatedResult<PostSummary>> {
    const published = (await this.getAllPosts())
      .filter(post => !post.draft)
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

    return this.paginate(published.map(this.toPostSummary), params);
  }


  private async getAllPosts(): Promise<Post[]> {
    if (!fs.existsSync(this.postsDir)) {
      return [];
    }

    const files = fs.readdirSync(this.postsDir)
      .filter(file => file.endsWith('.md'));

    const posts: Post[] = [];

    for (const file of files) {
      const filePath = path.join(this.postsDir, file);
      try {
        const post = await this.parsePostFile(filePath);
        posts.push(post);
      } catch (error) {
        // In production, you might want to log this error
        console.warn(`Failed to parse post file ${file}:`, error);
        continue;
      }
    }

    return posts;
  }

  private async parsePostFile(filePath: string): Promise<Post> {
    const content = fs.readFileSync(filePath, 'utf-8');
    const { frontmatter, body } = this.extractFrontmatter(content);

    // Validate frontmatter with Zod
    const result = PostFrontmatterSchema.safeParse(frontmatter);
    if (!result.success) {
      throw new FrontmatterError(filePath, result.error);
    }

    const data = result.data;

    // Derive slug from filename
    const filename = path.basename(filePath, '.md');
    const slug = createPostSlug(filename);

    // Process markdown content
    const processedContent = data.externalUrl ? "" : await this.processMarkdown(body);

    // Calculate reading time
    const readingTime = calculateReadingTime(data.externalUrl ? "" : body);

    return {
      slug,
      title: data.title,
      description: data.description,
      content: processedContent,
      publishedAt: data.publishedAt,
      updatedAt: data.updatedAt ?? null,
      tags: data.tags ?? [],
      draft: data.draft ?? false,
      externalUrl: data.externalUrl ?? null,
      readingTimeMinutes: readingTime,
    };
  }

  private extractFrontmatter(content: string): { frontmatter: unknown; body: string } {
    const frontmatterRegex = /^---\r?\n(.*?)\r?\n---\r?\n(.*)/s;
    const match = content.match(frontmatterRegex);

    if (!match) {
      return { frontmatter: {}, body: content };
    }

    try {
      const frontmatterText = match[1];
      const body = match[2];

      if (frontmatterText === undefined || body === undefined) {
        return { frontmatter: {}, body: content };
      }

      const frontmatter = parseYaml(frontmatterText);
      return { frontmatter, body };
    } catch (error) {
      throw new Error(`Failed to parse frontmatter: ${error}`);
    }
  }


  private async processMarkdown(markdown: string): Promise<string> {
    const processor = unified()
      .use(remarkParse)
      .use(remarkRehype)
      .use(rehypePrettyCode, {
        theme: {
          dark: 'github-dark',
          light: 'github-light'
        }
      })
      .use(markdownImageHandler)
      .use(rehypeStringify);

    const result = await processor.process(markdown);
    return String(result);
  }

  private toPostSummary(post: Post): PostSummary {
    const { content: _content, ...summary } = post;
    return summary;
  }

  private paginate<T>(items: T[], params?: PaginationParams): PaginatedResult<T> {
    const page = params?.page ?? 1;
    const perPage = params?.perPage ?? 10;
    const offset = (page - 1) * perPage;

    const paginatedItems = items.slice(offset, offset + perPage);
    const total = items.length;
    const totalPages = Math.max(1, Math.ceil(total / perPage));

    return {
      items: paginatedItems,
      total,
      page,
      perPage,
      totalPages,
    };
  }
}