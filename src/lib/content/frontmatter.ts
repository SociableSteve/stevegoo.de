import { PostFrontmatterSchema, type PostFrontmatter } from "@/types/content";

const FRONTMATTER_REGEX = /^---\n([\s\S]*?)\n---/;

/**
 * Parses YAML frontmatter from a Markdown string.
 *
 * Returns both the parsed frontmatter object and the remaining body content.
 * Validates the frontmatter against the PostFrontmatterSchema.
 *
 * @throws {Error} If frontmatter is missing or fails schema validation
 */
export function parseFrontmatter(raw: string): {
  frontmatter: PostFrontmatter;
  body: string;
} {
  const match = FRONTMATTER_REGEX.exec(raw);
  if (!match || !match[1]) {
    throw new Error("Missing or malformed frontmatter block");
  }

  const yamlBlock = match[1];
  const body = raw.slice(match[0].length).trimStart();

  const parsed = parseYaml(yamlBlock);
  const frontmatter = PostFrontmatterSchema.parse(parsed);

  return { frontmatter, body };
}

/**
 * Minimal YAML parser for simple key-value frontmatter.
 * Handles strings, booleans, and arrays of strings.
 */
function parseYaml(yaml: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const lines = yaml.split("\n");

  let currentKey: string | null = null;
  let inArray = false;
  let arrayValues: string[] = [];

  for (const line of lines) {
    const arrayItem = /^\s+-\s+(.+)$/.exec(line);
    const keyValue = /^(\w+):\s*(.*)$/.exec(line);

    if (arrayItem && inArray && currentKey) {
      arrayValues.push(arrayItem[1]?.trim() ?? "");
      continue;
    }

    if (inArray && currentKey) {
      result[currentKey] = arrayValues;
      inArray = false;
      arrayValues = [];
      currentKey = null;
    }

    if (keyValue) {
      const key = keyValue[1] ?? "";
      const value = keyValue[2]?.trim() ?? "";

      if (value === "") {
        currentKey = key;
        inArray = true;
        arrayValues = [];
      } else if (value === "true") {
        result[key] = true;
      } else if (value === "false") {
        result[key] = false;
      } else {
        result[key] = value.replace(/^['"]|['"]$/g, "");
      }
    }
  }

  if (inArray && currentKey) {
    result[currentKey] = arrayValues;
  }

  return result;
}
