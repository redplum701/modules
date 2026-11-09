# palindrome-check

- **Author:** 紅梅 ([@redplum701](https://github.com/redplum701))
- **Copyright:** © 2026 紅梅
- **License:** MIT
- **Created:** 2026-11-09
- **Updated:** 2026-11-09

## Description

Checks whether text reads the same forward and backward. By default it ignores case, spaces, and punctuation, and it compares whole user-perceived characters (grapheme clusters), so emoji and accented letters are not split apart. Works with Japanese too (`たけやぶやけた`).

## Usage

```js
import { isPalindrome } from "./palindrome-check.js";

isPalindrome("A man, a plan, a canal: Panama"); // true
isPalindrome("race a car");                     // false
isPalindrome("たけやぶやけた");                   // true

isPalindrome("Aa");                             // true
isPalindrome("Aa", { ignoreCase: false });      // false

// Keep punctuation and spaces in the comparison
isPalindrome("ab ba", { ignoreNonAlphanumeric: false });  // true
isPalindrome("ab, ba", { ignoreNonAlphanumeric: false }); // false

// Treat accented letters like plain ones
isPalindrome("éAae");                           // false
isPalindrome("éAae", { ignoreAccents: true });  // true

// Emoji clusters stay whole
isPalindrome("👨‍👩‍👧‍👦x👨‍👩‍👧‍👦", { ignoreNonAlphanumeric: false }); // true
```

## API

`isPalindrome(text, options?)`

| Option | Default | Description |
|--------|---------|-------------|
| `ignoreCase` | `true` | Treat uppercase and lowercase as equal |
| `ignoreNonAlphanumeric` | `true` | Ignore spaces, punctuation, symbols, and emoji |
| `ignoreAccents` | `false` | Treat `é` and `e` as equal |

- Letters and numbers from any script count (`\p{L}` and `\p{N}`), so Japanese, Greek, and so on work.
- An empty string, a single character, or text that is empty after cleaning returns `true`.
- Comparison uses grapheme clusters, so a family emoji or `e` plus a combining accent is treated as one character.
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

- Wikipedia. Palindrome.. https://en.wikipedia.org/wiki/Palindrome
- MDN Web Docs. String.prototype.normalize(). Mozilla.. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize
- MDN Web Docs. Intl.Segmenter. Mozilla.. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter
- Unicode Consortium. Unicode Standard Annex #29: Unicode Text Segmentation.. https://unicode.org/reports/tr29/
