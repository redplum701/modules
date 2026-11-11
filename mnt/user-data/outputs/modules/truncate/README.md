# truncate

- **Author:** 紅梅 ([@redplum701](https://github.com/redplum701))
- **Copyright:** © 2026 紅梅
- **License:** MIT
- **Created:** 2026-11-09
- **Updated:** 2026-11-09

## Description

Shortens text to a maximum number of user-perceived characters (grapheme clusters) and adds an ellipsis. It never cuts an emoji or an accented letter in half, and the ellipsis counts toward the limit, so the result is never longer than you asked for.

## Usage

```js
import { truncate } from "./truncate.js";

truncate("Hello, world", 8);              // "Hello, …"
truncate("Hello", 10);                    // "Hello" (already fits)
truncate("Hello, world", 8, { ellipsis: "..." }); // "Hello..."
truncate("Hello, world", 5, { ellipsis: "" });    // "Hello"

truncate("こんにちは世界", 5);              // "こんにち…"

// Emoji are never cut in half
truncate("👨‍👩‍👧‍👦👨‍👩‍👧‍👦abc", 3);         // "👨‍👩‍👧‍👦👨‍👩‍👧‍👦…"
```

## API

`truncate(text, maxLength, options?)`

| Parameter | Type | Description |
|-----------|------|-------------|
| `text` | string | The text to shorten |
| `maxLength` | integer ≥ 0, or `Infinity` | Maximum length of the result, counted in grapheme clusters |
| `options.ellipsis` | string | Added at the end when shortened. Default `"…"`. Use `""` for no ellipsis |

- The ellipsis counts toward `maxLength`. `truncate("Hello, world", 8)` is exactly 8 characters long.
- Text that already fits is returned unchanged (without an ellipsis).
- Needs `Intl.Segmenter` (Node.js 16+ and all current browsers).
- Errors: `TypeError` for wrong types, `RangeError` if `maxLength` is negative, fractional, or `NaN`, or if the text must be shortened but `maxLength` is smaller than the ellipsis.

## License

MIT License

Copyright (c) 2026 紅梅

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## References

- MDN Web Docs. Intl.Segmenter. Mozilla.. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter
- Unicode Consortium. Unicode Standard Annex #29: Unicode Text Segmentation.. https://unicode.org/reports/tr29/
- MDN Web Docs. Array.prototype.slice(). Mozilla.. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/slice
