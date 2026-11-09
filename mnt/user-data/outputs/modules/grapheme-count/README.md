# grapheme-count

- **Author:** 紅梅 ([@redplum701](https://github.com/redplum701))
- **Copyright:** © 2026 紅梅
- **License:** MIT
- **Created:** 2026-11-09
- **Updated:** 2026-11-09

## Description

Counts the user-perceived characters (grapheme clusters) in a string using `Intl.Segmenter`. `measureText` also reports the other kinds of length side by side: code points, UTF-16 code units (`text.length`), and UTF-8 bytes. This is the practical version of the planned `grapheme-splitter`.

## Usage

```js
import { countGraphemes, measureText } from "./grapheme-count.js";

countGraphemes("hello");        // 5
countGraphemes("こんにちは");     // 5
countGraphemes("👨‍👩‍👧‍👦");        // 1
countGraphemes("🇯🇵🇺🇸");         // 2
countGraphemes("e\u0301");      // 1

"👨‍👩‍👧‍👦".length;              // 11 (what JavaScript says)

measureText("👨‍👩‍👧‍👦");
// { graphemes: 1, codePoints: 7, codeUnits: 11, bytes: 25 }
```

## API

| Function | Result |
|----------|--------|
| `countGraphemes(text)` | Number of user-perceived characters |
| `measureText(text)` | `{ graphemes, codePoints, codeUnits, bytes }` |

| Field | Meaning |
|-------|---------|
| `graphemes` | User-perceived characters (what a person would count) |
| `codePoints` | Unicode code points |
| `codeUnits` | UTF-16 code units, the same as `text.length` |
| `bytes` | Size when encoded as UTF-8 |

- Results depend on the Unicode version in the JavaScript engine. Newer emoji may count differently on older runtimes.
- Needs `Intl.Segmenter` (Node.js 16+ and all current browsers).
- Errors: `TypeError` if `text` is not a string.

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
- MDN Web Docs. TextEncoder. Mozilla.. https://developer.mozilla.org/en-US/docs/Web/API/TextEncoder
