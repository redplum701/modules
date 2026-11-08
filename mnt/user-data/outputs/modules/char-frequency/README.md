# char-frequency

- **Author:** 紅梅 ([@redplum701](https://github.com/redplum701))
- **Copyright:** © 2026 紅梅
- **License:** MIT
- **Created:** 2026-11-09
- **Updated:** 2026-11-09

## Description

Counts how many times each character appears in a string. Characters are counted by Unicode code point, so emoji count as one character instead of two. Includes a `mostCommonChars` helper for top-N results.

## Usage

```js
import { charFrequency, mostCommonChars } from "./char-frequency.js";

charFrequency("hello");
// Map { "h" => 1, "e" => 1, "l" => 2, "o" => 1 }

charFrequency("Aa", { ignoreCase: true });
// Map { "a" => 2 }

charFrequency("a b\na", { ignoreWhitespace: true });
// Map { "a" => 2, "b" => 1 }

charFrequency("😀😀a");
// Map { "😀" => 2, "a" => 1 }

mostCommonChars("mississippi", 2);
// [["i", 4], ["s", 4]]
```

## API

| Function | Result |
|----------|--------|
| `charFrequency(text, options?)` | `Map` of character → count, in order of first appearance |
| `mostCommonChars(text, limit = Infinity, options?)` | Array of `[character, count]`, highest count first |

| Option | Default | Description |
|--------|---------|-------------|
| `ignoreCase` | `false` | Lowercase the text before counting |
| `ignoreWhitespace` | `false` | Skip spaces, tabs, and newlines |

- Characters are Unicode code points. A character made of several code points (such as `e` plus a combining accent, or a family emoji) is counted as separate pieces. Grapheme-level counting is planned in `grapheme-splitter`.
- Ties in `mostCommonChars` stay in order of first appearance.
- Errors: `TypeError` if `text` is not a string, `RangeError` if `limit` is not a non-negative integer or `Infinity`.

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

- MDN Web Docs. String.prototype[Symbol.iterator](). Mozilla.. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/Symbol.iterator
- MDN Web Docs. Map. Mozilla.. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
- Unicode Consortium. Unicode Standard Annex #29: Unicode Text Segmentation.. https://unicode.org/reports/tr29/
