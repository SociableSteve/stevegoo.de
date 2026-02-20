import type { ZodError } from "zod";

export class FrontmatterError extends Error {
  public readonly filePath: string;
  public readonly field?: string;

  constructor(filePath: string, zodError: ZodError) {
    const issues = zodError.issues
      .map((issue) => {
        const path = issue.path.length > 0 ? issue.path.join('.') : 'root';
        return `  - ${path}: ${issue.message}`;
      })
      .join('\n');

    const message = `Invalid frontmatter in ${filePath}:\n${issues}`;
    super(message);

    this.name = 'FrontmatterError';
    this.filePath = filePath;
    const firstField = zodError.issues[0]?.path?.[0]?.toString();
    if (firstField) {
      this.field = firstField;
    }

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, FrontmatterError);
    }
  }
}