# postal-code-formatter

- **Author:** 紅梅 ([@redplum701](https://github.com/redplum701))
- **Copyright:** © 2026 紅梅
- **License:** MIT
- **Created:** 2026-11-09
- **Updated:** 2026-11-09

## Description

Formats Japanese postal codes as `NNN-NNNN`. It accepts messy input such as full-width digits, different kinds of hyphens, spaces, and the postal mark `〒`. It checks the format only (7 digits), not whether the code is actually assigned to an address.

## Usage

```js
import { formatPostalCode, parsePostalCode, isPostalCode } from "./postal-code-formatter.js";

formatPostalCode("1000001");              // "100-0001"
formatPostalCode("〒１００－０００１");     // "100-0001"
formatPostalCode("100 0001");             // "100-0001"
formatPostalCode("100ー0001");            // "100-0001"
formatPostalCode("1000001", { prefix: true });        // "〒100-0001"
formatPostalCode("1000001", { separator: "" });       // "1000001"
formatPostalCode("12345");                // null (not 7 digits)

parsePostalCode("100-0001");
// { digits: "1000001", upper: "100", lower: "0001" }

isPostalCode("100-0001");                 // true
isPostalCode("100-00011");                // false
```

## API

| Function | Result |
|----------|--------|
| `formatPostalCode(input, options?)` | Formatted string, or `null` if not a 7-digit postal code |
| `parsePostalCode(input)` | `{ digits, upper, lower }`, or `null` |
| `isPostalCode(input)` | `true` or `false` (never throws) |

| Option | Default | Description |
|--------|---------|-------------|
| `separator` | `"-"` | Text between the first 3 and last 4 digits |
| `prefix` | `false` | Add the postal mark `〒` in front |

- Accepted input: 7 digits, or 3 + 4 digits split by one hyphen, dash, `ー`, or spaces. Full-width digits and a leading `〒` are fine.
- Only the format is checked. The module does not know which codes are assigned. For that you need the data from Japan Post.
- The older 3-digit and 5-digit codes are not supported.
- Errors: `TypeError` if `input` is not a string (`isPostalCode` never throws).

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

- Japan Post. 郵便番号 (Postal codes).. https://www.post.japanpost.jp/zipcode/
- Wikipedia. Postal codes in Japan.. https://en.wikipedia.org/wiki/Postal_codes_in_Japan
- MDN Web Docs. String.prototype.normalize(). Mozilla.. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize
