# luhn-check

- **Author:** 紅梅 ([@redplum701](https://github.com/redplum701))
- **Copyright:** © 2026 紅梅
- **License:** MIT
- **Created:** 2026-11-09
- **Updated:** 2026-11-09

## Description

The Luhn algorithm (mod 10 check). It validates numbers such as payment card numbers and IMEI numbers, and calculates the check digit for a number that does not have one yet. It catches typing mistakes. It is not a security feature.

## Usage

```js
import { isValidLuhn, luhnCheckDigit, addLuhnCheckDigit } from "./luhn-check.js";

isValidLuhn("79927398713");              // true
isValidLuhn("79927398710");              // false (typo)
isValidLuhn("4111 1111 1111 1111");      // true (spaces and hyphens are ignored)
isValidLuhn("4111-1111-1111-1112");      // false
isValidLuhn("abc");                      // false

luhnCheckDigit("7992739871");            // 3
addLuhnCheckDigit("7992739871");         // "79927398713"
addLuhnCheckDigit("4111 1111 1111 111"); // "4111111111111111"
```

## API

| Function | Result |
|----------|--------|
| `isValidLuhn(input)` | `true` or `false` (never throws) |
| `luhnCheckDigit(payload)` | The check digit (0–9) for a number without one |
| `addLuhnCheckDigit(payload)` | The number with its check digit added, as a digit string |

- `input` is a string (spaces and hyphens ignored), a safe non-negative integer, or a BigInt. Use strings for real card numbers: a number loses leading zeros, and numbers above 2⁵³ lose digits.
- At least 2 digits are needed for `isValidLuhn`.
- A passing check means the number has no single-digit typo and no common swap of neighboring digits (except `09` ↔ `90`). It does not mean the card or account exists. Do not use it for security.
- Errors: `luhnCheckDigit` and `addLuhnCheckDigit` throw `TypeError` for unsupported types and `RangeError` for non-digit text.

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

- Wikipedia. Luhn algorithm.. https://en.wikipedia.org/wiki/Luhn_algorithm
- Luhn, H. P. Computer for Verifying Numbers. US Patent 2,950,048, 1960.. https://patents.google.com/patent/US2950048A
- MDN Web Docs. Number.isSafeInteger(). Mozilla.. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isSafeInteger
