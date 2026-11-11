# isbn-validator

- **Author:** 紅梅 ([@redplum701](https://github.com/redplum701))
- **Copyright:** © 2026 紅梅
- **License:** MIT
- **Created:** 2026-11-09
- **Updated:** 2026-11-09

## Description

Validates ISBN-10 and ISBN-13 numbers by their check digit, accepts common written forms (hyphens, spaces, a leading `ISBN`, full-width characters), and converts between the two formats.

## Usage

```js
import { isValidIsbn, parseIsbn, toIsbn13, toIsbn10 } from "./isbn-validator.js";

isValidIsbn("978-0-306-40615-7");     // true (ISBN-13)
isValidIsbn("0-306-40615-2");         // true (ISBN-10)
isValidIsbn("ISBN 0-8044-2957-X");    // true (X is a valid check digit)
isValidIsbn("９７８０３０６４０６１５７"); // true (full-width digits)
isValidIsbn("978-0-306-40615-6");     // false (wrong check digit)

toIsbn13("0-306-40615-2");            // "9780306406157"
toIsbn10("978-0-306-40615-7");        // "0306406152"
toIsbn10("979-10-90636-07-1");        // null (979 numbers have no ISBN-10 form)

parseIsbn("0-306-40615-2");
// { type: 10, digits: "0306406152", isbn10: "0306406152", isbn13: "9780306406157" }
```

## API

| Function | Result |
|----------|--------|
| `isValidIsbn(input)` | `true` or `false` (never throws) |
| `parseIsbn(input)` | `{ type, digits, isbn10, isbn13 }`, or `null` if not valid |
| `toIsbn13(input)` | 13-digit ISBN-13 string, or `null` |
| `toIsbn10(input)` | 10-character ISBN-10 string, or `null` |

- Accepted input: 10 or 13 characters with optional hyphens, dashes, `ー`, and spaces, a leading `ISBN`, `ISBN-10:` or `ISBN-13:`, and full-width characters. An `X` (any case) is allowed as the last character of an ISBN-10.
- **Hyphen positions are not checked.** Placing hyphens correctly needs the official ISBN range table, which changes over time. Only the digits and the check digit are validated.
- ISBN-13 numbers that start with `979` have no ISBN-10 form, so `toIsbn10` returns `null` for them.
- A valid check digit does not prove the book exists.
- Errors: `TypeError` if `input` is not a string (`isValidIsbn` never throws).

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

- International ISBN Agency. ISBN Users' Manual, International Standard Book Number (ISO 2108).. https://www.isbn-international.org/content/isbn-users-manual
- Wikipedia. International Standard Book Number.. https://en.wikipedia.org/wiki/ISBN
- MDN Web Docs. String.prototype.normalize(). Mozilla.. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize
