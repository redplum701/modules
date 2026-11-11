# pad

- **Author:** 紅梅 ([@redplum701](https://github.com/redplum701))
- **Copyright:** © 2026 紅梅
- **License:** MIT
- **Created:** 2026-11-09
- **Updated:** 2026-11-09

## Description

Pads strings and numbers to a fixed length. Pad the left, right, or both sides with any fill string, or zero-pad integers (negative numbers and BigInt included).

## Usage

```js
import { padStart, padEnd, padCenter, zeroPad } from "./pad.js";

zeroPad(7, 3);            // "007"
zeroPad(-5, 3);           // "-05"
zeroPad(12345n, 8);       // "00012345"
padStart("42", 5, "*");   // "***42"
padEnd("Name", 8, ".");   // "Name...."
padCenter("hi", 7, "-");  // "--hi---"
padStart("abc", 2);       // "abc" (already long enough)
```

## API

| Function | Input | Output |
|----------|-------|--------|
| `padStart(value, length, fill = " ")` | string, number, or BigInt | Padded string (left) |
| `padEnd(value, length, fill = " ")` | string, number, or BigInt | Padded string (right) |
| `padCenter(value, length, fill = " ")` | string, number, or BigInt | Padded string (both sides) |
| `zeroPad(value, length)` | safe integer, BigInt, or integer string | Zero-padded string |

- `length` must be a non-negative integer. Values already at or over `length` are returned unchanged.
- `zeroPad` counts the minus sign toward `length`, like `printf("%03d")`.
- Lengths use JavaScript string length (UTF-16 code units), so an emoji counts as 2.
- Errors: `TypeError` for wrong types, `RangeError` for bad lengths or non-integer numbers.

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

- MDN Web Docs. String.prototype.padStart(). Mozilla.. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padStart
- MDN Web Docs. String.prototype.padEnd(). Mozilla.. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padEnd
- MDN Web Docs. Number.isSafeInteger(). Mozilla.. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isSafeInteger
