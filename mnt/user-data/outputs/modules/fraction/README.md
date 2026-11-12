# fraction

- **Author:** 紅梅 ([@redplum701](https://github.com/redplum701))
- **Copyright:** © 2026 紅梅
- **License:** MIT
- **Created:** 2026-11-09
- **Updated:** 2026-11-09

## Description

Exact fraction arithmetic with `BigInt`: add, subtract, multiply, divide, powers, comparison, and rounding, always reduced to lowest terms with the sign on the numerator. Fractions can be made from integers, decimals (`"0.125"`), strings (`"3/4"`, `"1 1/2"`), and numbers. There is no floating-point error and no overflow.

## Usage

```js
import { Fraction } from "./fraction.js";

const half = Fraction.of(1, 2);
const third = Fraction.of(1, 3);

half.add(third).toString();             // "5/6"
half.sub(third).toString();             // "1/6"
half.mul(third).toString();             // "1/6"
half.div(third).toString();             // "3/2"
Fraction.of(6, -8).toString();          // "-3/4" (reduced, sign on top)

// Exact where floating point is not
0.1 + 0.2;                              // 0.30000000000000004
Fraction.from("0.1").add("0.2").toString();   // "3/10"

// Many ways to make one
Fraction.from("3/4");                   // 3/4
Fraction.from("1 1/2");                 // 3/2  (a mixed number)
Fraction.from("-0.125");                // -1/8
Fraction.from(0.75);                    // 3/4
Fraction.from(7n);                      // 7

Fraction.of(3, 2).toMixedString();      // "1 1/2"
Fraction.of(1, 3).toDecimalString(5);   // "0.33333"
Fraction.of(1, 3).toNumber();           // 0.3333333333333333

Fraction.of(7, 2).floor();              // 3n
Fraction.of(-7, 2).floor();             // -4n
Fraction.of(5, 2).round();              // 3n   (halves go away from zero)
Fraction.of(2, 3).pow(3).toString();    // "8/27"
Fraction.of(2, 3).pow(-2).toString();   // "9/4"

half.compare(third);                    // 1
half.equals("2/4");                     // true
["1/2", "1/3", "3/4"].map(Fraction.from).sort(Fraction.compare).map(String);   // ["1/3", "1/2", "3/4"]
```

## API

**Making a fraction**

| Call | Result |
|------|--------|
| `Fraction.of(n, d = 1)` or `new Fraction(n, d)` | From integers (safe integers or BigInts). `d` must not be 0 |
| `Fraction.from(value)` | From a `Fraction`, integer, decimal `number`, `BigInt`, or string (`"3/4"`, `"-3/4"`, `"1 1/2"`, `"7"`, `"0.125"`, `"1.5e-3"`) |

**Methods** (every one returns a new `Fraction`; the argument can be anything `Fraction.from` accepts)

| Method | Result |
|--------|--------|
| `add`, `sub`, `mul`, `div` | Arithmetic. `div` by zero throws `RangeError` |
| `neg()`, `abs()`, `inverse()` | Negative, absolute value, 1 / this |
| `pow(n)` | Whole-number power (negative allowed; \|n\| ≤ 100,000) |
| `compare(other)`, `equals(other)`, `Fraction.compare(a, b)` | `-1`, `0`, `1` / `true` or `false` |
| `floor()`, `ceil()`, `round()`, `trunc()` | A `BigInt`. `round` takes halves away from zero |
| `toNumber()` | The nearest JavaScript number |
| `toDecimalString(digits = 10)` | Rounded decimal text, no trailing zeros |
| `toString()`, `toMixedString()`, `toJSON()` | `"3/4"`, `"1 1/2"`, and the same text for JSON |
| `numerator`, `denominator`, `sign`, `isInteger` | Read-only properties (the first two are `BigInt`) |

- **Always reduced:** `Fraction.of(6, 8)` is stored as `3/4`. The denominator is always positive, and `0` is `0/1`.
- **Immutable:** a `Fraction` is frozen, and each operation returns a new one.
- **Numbers become the decimal they print as:** `Fraction.from(0.1)` is exactly `1/10`, not the long fraction of the binary value stored in the computer. `Fraction.from(1/3)` is `3333333333333333/10000000000000000`, because `1/3` already lost its exactness as a number. Build thirds with `Fraction.of(1, 3)`.
- `toNumber()` rounds to the nearest double and handles huge numerators and denominators without overflow, as long as the result fits.
- Errors: `TypeError` for an unsupported value type. `RangeError` for a zero denominator, division by zero, a non-finite number, an unreadable string, a number that is not a safe integer where an integer is needed, an exponent beyond ±100,000, or `digits` outside 0 to 10,000.

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

- Wikipedia. Fraction (mathematics).. https://en.wikipedia.org/wiki/Fraction
- Wikipedia. Euclidean algorithm (greatest common divisor).. https://en.wikipedia.org/wiki/Euclidean_algorithm
- MDN Web Docs. BigInt. Mozilla.. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt
- MDN Web Docs. Private elements (class private fields). Mozilla.. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_elements
