# reverse-string

- **Author:** 紅梅 ([@redplum701](https://github.com/redplum701))
- **Copyright:** © 2026 紅梅
- **License:** MIT
- **Created:** 2026-11-09
- **Updated:** 2026-11-09

## Description

Reverses a string by user-perceived characters (grapheme clusters). Emoji, flags, and letters with accents stay intact, unlike the common `text.split("").reverse().join("")` trick, which breaks them.

## Usage

```js
import { reverseString } from "./reverse-string.js";

reverseString("hello");        // "olleh"
reverseString("こんにちは");     // "はちにんこ"
reverseString("a👨‍👩‍👧‍👦b");       // "b👨‍👩‍👧‍👦a" (family emoji stays whole)
reverseString("🇯🇵🇺🇸");         // "🇺🇸🇯🇵"
reverseString("e\u0301a");     // "ae\u0301" (accent stays on the e)
reverseString("");             // ""

// The naive way breaks emoji:
"a😀b".split("").reverse().join(""); // garbled surrogate pairs
```

## API

`reverseString(text)`

| Input | Output |
|-------|--------|
| `"abc"` | `"cba"` |
| `"a👨‍👩‍👧‍👦b"` | `"b👨‍👩‍👧‍👦a"` |
| `""` | `""` |

- Characters are grapheme clusters, so emoji sequences, flags, and base letters with combining accents move as one unit.
- Only the order of characters is reversed. Right-to-left (bidirectional) text rules are not applied.
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
- MDN Web Docs. Array.prototype.reverse(). Mozilla.. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reverse
