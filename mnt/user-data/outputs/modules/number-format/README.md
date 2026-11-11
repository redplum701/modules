# number-format

- **Author:** 紅梅 ([@redplum701](https://github.com/redplum701))
- **Copyright:** © 2026 紅梅
- **License:** MIT
- **Created:** 2026-11-09
- **Updated:** 2026-11-09

## Description

Formats numbers with thousands separators. Works with numbers, BigInt, and numeric strings, so very large values keep every digit. The separator, decimal separator, and group size are configurable.

## Usage

```js
import { formatNumber } from "./number-format.js";

formatNumber(1234567);                    // "1,234,567"
formatNumber(-1234567.891);               // "-1,234,567.891"
formatNumber(12345678901234567890n);      // "12,345,678,901,234,567,890"
formatNumber("9876543210.5");             // "9,876,543,210.5"

// European style
formatNumber(1234567.89, { separator: ".", decimalSeparator: "," });
// "1.234.567,89"

// Groups of 4 digits (万 style)
formatNumber(123456789, { groupSize: 4 });
// "1,2345,6789"
```

## API

`formatNumber(value, options?)`

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `value` | number, BigInt, or numeric string | — | The number to format |
| `options.separator` | string | `","` | Group separator |
| `options.decimalSeparator` | string | `"."` | Decimal separator |
| `options.groupSize` | positive integer | `3` | Digits per group |

- Returns a string. Digits after the decimal point are not grouped or rounded.
- Numbers that JavaScript prints in exponent form (such as `1e21`) throw `RangeError`. Pass them as a string or BigInt instead.
- Strings must look like `-1234.5` (optional minus, digits, optional decimal part).
- Errors: `TypeError` for unsupported types, `RangeError` for invalid numbers or `groupSize`.

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

- MDN Web Docs. Intl.NumberFormat. Mozilla.. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat
- MDN Web Docs. Lookahead assertion. Mozilla.. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Regular_expressions/Lookahead_assertion
- MDN Web Docs. BigInt. Mozilla.. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt
