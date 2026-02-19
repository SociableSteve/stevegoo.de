import { z } from "zod";

export const PostFrontmatterSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  publishedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "Date must be in YYYY-MM-DD format",
  }),
  updatedAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
  slug: z.string().optional(),
});

export type PostFrontmatter = z.infer<typeof PostFrontmatterSchema>;

export const PostSchema = PostFrontmatterSchema.extend({
  slug: z.string().min(1),
  content: z.string(),
  readingTimeMinutes: z.number().int().positive(),
});

export type Post = z.infer<typeof PostSchema>;

export const ProjectSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  url: z.string().url().optional(),
  githubUrl: z.string().url().optional(),
  tags: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  publishedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export type Project = z.infer<typeof ProjectSchema>;
