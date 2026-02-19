const AVERAGE_WORDS_PER_MINUTE = 238;

/**
 * Calculates estimated reading time from a Markdown or plain text string.
 *
 * @param content - The text content to measure
 * @returns Estimated reading time in minutes (minimum 1)
 */
export function calculateReadingTime(content: string): number {
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.ceil(wordCount / AVERAGE_WORDS_PER_MINUTE);
  return Math.max(1, minutes);
}
