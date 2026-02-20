---
title: Complex Markdown Test Post
description: Testing comprehensive markdown features including tables, code blocks, nested lists, and more
publishedAt: 2024-01-15
updatedAt: 2024-01-16
category: engineering
tags: ["markdown", "test", "complex"]
draft: false
---

# Complex Markdown Test Post

This post tests the complete markdown processing pipeline with various complex elements.

## Code Blocks with Syntax Highlighting

Here's some TypeScript code:

```typescript
interface User {
  id: string;
  name: string;
  email?: string;
}

function processUsers(users: User[]): User[] {
  return users
    .filter(user => user.email)
    .map(user => ({
      ...user,
      name: user.name.trim()
    }));
}

// Arrow function with generic constraints
const fetchData = async <T extends { id: string }>(
  endpoint: string
): Promise<T[]> => {
  const response = await fetch(endpoint);
  return response.json();
};
```

Python with complex syntax:

```python
from typing import Dict, List, Optional, Union
import asyncio
import json

class DataProcessor:
    def __init__(self, config: Dict[str, Union[str, int]]):
        self.config = config
        self._cache: Dict[str, List[str]] = {}

    async def process_batch(
        self,
        items: List[Dict[str, any]],
        batch_size: int = 100
    ) -> List[Dict[str, any]]:
        """Process items in batches with async support."""
        results = []

        for i in range(0, len(items), batch_size):
            batch = items[i:i + batch_size]
            batch_results = await asyncio.gather(
                *[self._process_item(item) for item in batch]
            )
            results.extend(batch_results)

        return [r for r in results if r is not None]
```

## Tables

| Feature | Support | Performance | Notes |
|---------|---------|-------------|-------|
| Syntax Highlighting | ✅ Full | Excellent | Uses Shiki |
| Code Folding | ❌ None | N/A | Could be added |
| Line Numbers | ✅ Optional | Good | Configurable |
| Copy Button | 🟡 Partial | Fair | Needs JS |

### Alignment Test

| Left | Center | Right |
|:-----|:------:|------:|
| L1 | C1 | R1 |
| Left align | Center align | Right align |
| Short | Medium length | Very long content here |

## Nested Lists

1. **Main Topic A**
   - Subtopic 1
     - Detail A
     - Detail B
       1. Sub-detail 1
       2. Sub-detail 2
          - Even deeper
          - More depth
   - Subtopic 2
     - Different detail

2. **Main Topic B**
   - First item
     > Blockquote within list
     > Multiple lines
   - Second item
     ```javascript
     // Code block within list
     const example = () => {
       console.log('nested code');
     };
     ```
   - Third item

3. **Mixed List Types**
   * Unordered within ordered
   * Another unordered
     1. Back to ordered
     2. More ordered
        * Mixed again
        * And again

## Blockquotes

> This is a simple blockquote.

> **Multi-line blockquote**
>
> This spans multiple paragraphs and includes formatting.
>
> It can contain `inline code` and **bold text**.

> **Nested quotes:**
>
> > This is a nested blockquote
> > with multiple lines
>
> Back to the main quote level.

## Links and Images

[Internal link](#code-blocks-with-syntax-highlighting)
[External link](https://example.com)
[Link with title](https://example.com "Example title")

Reference-style links: [Google][1] and [GitHub][2].

[1]: https://google.com
[2]: https://github.com

Auto-linking: https://autolink.example.com

![Alt text for image](https://example.com/image.jpg)
![Image with title](https://example.com/image.jpg "Image title")

## Text Formatting

**Bold text** and *italic text* and ***both bold and italic***.

~~Strikethrough text~~

`inline code` with backticks.

## Horizontal Rules

---

***

___

## HTML Elements (if supported)

<details>
<summary>Click to expand</summary>

This is hidden content that expands when clicked.

- It can contain lists
- And other markdown

</details>

<kbd>Ctrl</kbd> + <kbd>C</kbd> to copy

<mark>Highlighted text</mark>

H<sub>2</sub>O and E=MC<sup>2</sup>

## Special Characters and Escaping

\*Not italic\* and \**not bold**

Escaped: \# \- \+ \. \! \[ \] \( \) \{ \} \\ \` \*

## Edge Cases

Empty lines:


Multiple empty lines above.

Trailing spaces at line end:
This should create a line break.

Multiple consecutive formatting:

**Bold** *italic* `code` **bold again**

---

This fixture tests comprehensive markdown processing capabilities.