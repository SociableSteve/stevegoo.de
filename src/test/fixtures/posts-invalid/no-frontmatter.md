# Post Without Frontmatter

This markdown file has no frontmatter section at all, which should be handled gracefully by the parser.

The parser should either provide defaults or handle the missing frontmatter appropriately.

## Content Section

This post has regular markdown content but lacks the required frontmatter fields like title, description, publishedAt, etc.

- List item 1
- List item 2
- List item 3

Some `inline code` and a code block:

```javascript
console.log('This post has no frontmatter!');
```