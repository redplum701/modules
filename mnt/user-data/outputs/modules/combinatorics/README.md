# combinatorics

- **Author:** 紅梅 ([@redplum701](https://github.com/redplum701))
- **Copyright:** © 2026 紅梅
- **License:** MIT
- **Created:** 2026-11-09
- **Updated:** 2026-11-09

## Description

Counting formulas as exact `BigInt` values: factorial, permutations (nPk), combinations (nCk), and combinations with repetition. It uses binary splitting for large products and the exact multiplicative formula for binomial coefficients, so there is no overflow and no rounding.

## Usage

```js
import { factorial, permutations, combinations, combinationsWithRepetition } from "./combinatorics.js";

factorial(5);                       // 120n
factorial(20);                      // 2432902008176640000n
factorial(25);                      // 15511210043330985984000000n (too big for a number)
factorial(0);                       // 1n

permutations(5, 2);                 // 20n   (5 x 4)
permutations(10, 3);                // 720n

combinations(5, 2);                 // 10n
combinations(52, 5);                // 2598960n   (poker hands)
combinations(100, 50);              // 100891344545564193334812497256n
combinations(5, 7);                 // 0n         (k is larger than n)

combinationsWithRepetition(5, 3);   // 35n   (3 scoops from 5 flavors, repeats allowed)

// BigInt arguments work for huge n
combinations(10n ** 12n, 3n);       // 166666666666166666666667000000000000n (exact)

// Convert to a number only when you know it is small enough
Number(combinations(10, 3));        // 120
```

## API

| Function | Meaning | Result |
|----------|---------|--------|
| `factorial(n)` | n! | `BigInt` |
| `permutations(n, k)` | nPk = n! / (n − k)!, ordered picks | `BigInt` (`0n` if `k > n`) |
| `combinations(n, k)` | nCk = n! / (k! (n − k)!), unordered picks | `BigInt` (`0n` if `k > n`) |
| `combinationsWithRepetition(n, k)` | C(n + k − 1, k), repeats allowed | `BigInt` |

Arguments are non-negative safe integers or `BigInt`s. Results are always `BigInt`.

| Limit | Value |
|-------|-------|
| `factorial(n)` | `n` ≤ 100,000 (a 456,574-digit result) |
| `permutations(n, k)` | `k` ≤ 100,000 |
| `combinations(n, k)` | `min(k, n − k)` ≤ 100,000 |

`n` itself can be any size as a `BigInt` for `permutations` and `combinations`, as long as `k` (or `n − k`) is within the limit.

- **Exact:** no floating point is used. `combinations` multiplies and divides step by step, and every division is exact, so the numbers stay as small as possible.
- **Fast for big factorials:** the product is split in half recursively (binary splitting), so `factorial(20000)` takes a fraction of a second.
- `combinations` uses the symmetry `C(n, k) = C(n, n − k)` to do the least work.
- Conventions: `0! = 1`, `C(n, 0) = 1`, `C(n, n) = 1`, `P(n, 0) = 1`. `permutations` and `combinations` give `0n` when `k > n`. `combinationsWithRepetition(0, 0) = 1n` and `combinationsWithRepetition(0, k) = 0n` for `k > 0`.
- To use the result as a normal number, wrap it with `Number(...)`, and only when it is below 2⁵³ (about 9 × 10¹⁵).
- Errors: `TypeError` for arguments that are not numbers or BigInts. `RangeError` for negative values, numbers above 2⁵³ − 1 (pass a `BigInt`), or work above the limits.

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

- Wikipedia. Factorial.. https://en.wikipedia.org/wiki/Factorial
- Wikipedia. Binomial coefficient (computing the value: the multiplicative formula).. https://en.wikipedia.org/wiki/Binomial_coefficient
- Wikipedia. Permutation (k-permutations of n).. https://en.wikipedia.org/wiki/Permutation
- Wikipedia. Binary splitting.. https://en.wikipedia.org/wiki/Binary_splitting
- MDN Web Docs. BigInt. Mozilla.. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt
