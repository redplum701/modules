# gcd-lcm

- **Author:** 紅梅 ([@redplum701](https://github.com/redplum701))
- **Copyright:** © 2026 紅梅
- **License:** MIT
- **Created:** 2026-11-09
- **Updated:** 2026-11-09

## Description

Greatest common divisor (GCD) and least common multiple (LCM) for any number of integers. Works with numbers and BigInt, and ignores signs.

## Usage

```js
import { gcd, lcm } from "./gcd-lcm.js";

gcd(12, 18);            // 6
gcd(12, 18, 24);        // 6
gcd(-12, 18);           // 6
gcd(0, 5);              // 5
gcd(0, 0);              // 0

lcm(4, 6);              // 12
lcm(4, 6, 10);          // 60
lcm(0, 5);              // 0

gcd(2n ** 80n, 2n ** 60n); // 1152921504606846976n
lcm(2n ** 40n, 3n);        // 3298534883328n
```

## API

| Function | Input | Output |
|----------|-------|--------|
| `gcd(...values)` | One or more safe integers or BigInts | Greatest common divisor (≥ 0) |
| `lcm(...values)` | One or more safe integers or BigInts | Least common multiple (≥ 0) |

- Signs are ignored: `gcd(-12, 18)` is `6`.
- `gcd(0, 0)` is `0`. `lcm` returns `0` if any input is `0`.
- If every input is a number, the result is a number. If any input is a BigInt, the result is a BigInt.
- A number result above `Number.MAX_SAFE_INTEGER` (possible with `lcm`) throws `RangeError`. Pass BigInts to avoid this.
- To use an array, spread it: `gcd(...numbers)`.
- Errors: `TypeError` for no arguments or non-integer arguments.

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

- Wikipedia. Euclidean algorithm.. https://en.wikipedia.org/wiki/Euclidean_algorithm
- Wikipedia. Least common multiple.. https://en.wikipedia.org/wiki/Least_common_multiple
- MDN Web Docs. BigInt. Mozilla.. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt
