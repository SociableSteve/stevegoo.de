---
title: "Unicode & Special Characters Test: 中文 العربية русский 🚀"
description: "Testing unicode support: émojis 🎉, 中文字符, العربية, русский, and special symbols"
publishedAt: 2024-01-20
category: internationalization
tags: ["unicode", "i18n", "testing", "🏷️"]
draft: false
---

# Unicode & Special Characters Test

Testing comprehensive unicode support across different character sets and symbols.

## Language Scripts

### Latin Extended
- **French**: Café, naïve, résumé, Montréal
- **German**: Straße, Müller, Größe, Weiß
- **Spanish**: niño, señora, corazón, Bogotá
- **Nordic**: Åse, Björk, Næss, Østerås

### Asian Scripts
- **Chinese Simplified**: 你好世界，这是一个测试文档
- **Chinese Traditional**: 你好世界，這是一個測試文檔
- **Japanese**: こんにちは世界、これはテストドキュメントです
- **Korean**: 안녕하세요 세계, 이것은 테스트 문서입니다

### Right-to-Left Scripts
- **Arabic**: مرحبا بالعالم، هذه وثيقة اختبار
- **Hebrew**: שלום עולם, זהו מסמך בדיקה

### Cyrillic
- **Russian**: Привет мир, это тестовый документ
- **Ukrainian**: Привіт світ, це тестовий документ

## Emojis and Symbols

### Common Emojis
🚀 🎉 ✨ 💎 🔥 💯 ❤️ 👍 🎯 📚 💡 🌟

### Technical Symbols
⚡ ⚙️ 🔧 🖥️ 💻 📱 🌐 🔒 🔑 📊

### Mathematical Symbols
∞ ≈ ≠ ± ∑ ∏ ∫ ∂ ∆ ∇ ℝ ℂ ℕ ℤ

### Currency Symbols
$ € £ ¥ ₹ ₿ ¢ ₽ ₩ ₦

### Arrows and Geometric
→ ← ↑ ↓ ↔ ⇒ ⇐ ⇑ ⇓ ⇔ ▲ ▼ ◀ ▶ ■ □ ● ○

## Code Examples with Unicode

```javascript
// Unicode in variable names (valid in modern JS)
const 用户名 = "张三";
const café = "French café";
const Größe = 100;

// Unicode strings
const messages = {
  en: "Hello, World! 🌍",
  zh: "你好，世界！🌏",
  ar: "مرحبا بالعالم! 🌎",
  ru: "Привет, мир! 🌍"
};

// Emoji in function names (valid but not recommended)
const 🚀launch = () => console.log("Launching! 🎉");
```

```python
# Python unicode support
用户信息 = {
    "姓名": "张三",
    "年龄": 25,
    "城市": "北京"
}

def 处理数据(数据):
    """处理用户数据 - Unicode function name"""
    return f"用户: {数据['姓名']}, 年龄: {数据['年龄']}"

# Emoji variables (Python allows this)
🐍 = "Python"
🚀 = "Fast"
result = f"{🐍} is {🚀}!"
```

## Special Character Edge Cases

### Quotes and Punctuation
- "Smart quotes" vs "straight quotes"
- 'Single smart' vs 'single straight'
- … ellipsis vs ... three dots
- – en dash vs — em dash vs - hyphen

### Invisible Characters
- Zero-width space: ​ (present but invisible)
- Non-breaking space:   (between these words)
- Soft hyphen: hy­phen (conditional break)

### Combining Characters
- Base + combining: e + ´ = é
- Multiple combining: a + ̂ + ̃ = ã̂
- Complex: ṽ̶̈ (v + tilde + strikethrough + diaeresis)

## Markdown with Unicode

| 语言 | 问候语 | Emoji |
|------|--------|-------|
| 中文 | 你好 | 👋 |
| العربية | مرحبا | 👋 |
| Русский | Привет | 👋 |
| 日本語 | こんにちは | 👋 |

### Unicode List
1. **Bullet points with emojis**
   - 🟢 Success case
   - 🟡 Warning case
   - 🔴 Error case
   - ⚪ Neutral case

2. **Mixed scripts in same line**
   - English + 中文 + العربية + русский in one line
   - Numbers: ١٢٣ (Arabic) vs 123 (ASCII) vs ୧୨୩ (Odia)

### Unicode Blockquotes

> **Chinese proverb**: 千里之行，始于足下
>
> Translation: "A journey of a thousand miles begins with a single step"

> **Arabic wisdom**: الصبر مفتاح الفرج
>
> Translation: "Patience is the key to relief"

## URL Encoding Test

Links with unicode:
- [中文 link](https://example.com/中文-测试)
- [العربية link](https://example.com/العربية-اختبار)
- [Emoji link](https://example.com/🚀-rocket)

## Complex Unicode Scenarios

### RTL Override
‮This text should appear reversed due to RTL override‮

### Bidirectional Text
This is English مع العربية and back to English again.

### Normalization Test
- NFC: café (composed)
- NFD: cafe´ (decomposed)
- NFKC: ﬁ (compatibility composed)
- NFKD: fi (compatibility decomposed)

---

This comprehensive unicode test ensures our markdown processor handles international content correctly. 🌍✨