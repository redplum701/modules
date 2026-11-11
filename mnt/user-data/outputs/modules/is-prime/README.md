# is-prime

- **Author:** 紅梅 ([@redplum701](https://github.com/redplum701))
- **Copyright:** © 2026 紅梅
- **License:** MIT
- **Created:** 2026-11-09
- **Updated:** 2026-11-09

## Description

Checks whether a single number is prime. It uses the deterministic Miller-Rabin test with the first 13 primes as bases, so the answer is exact (not probabilistic) for every integer below 3,317,044,064,679,887,385,961,981. Works with numbers and BigInt.

## Usage

```js
import { isPrime } from "./is-prime.js";

isPrime(2);                    // true
isPrime(91);                   // false (7 x 13)
isPrime(1);                    // false
isPrime(-7);                   // false
isPrime(2.5);                  // false
isPrime(9007199254740881);     // true (largest prime below 2^53)
isPrime(2305843009213693951n); // true (2^61 - 1, a Mersenne prime)
```

## API

`isPrime(n)`

| Input | Result |
|-------|--------|
| Integer number or BigInt below 3.3 × 10²⁴ | `true` or `false` (exact) |
| Less than 2, or a non-integer number (`NaN`, `Infinity`, `2.5`) | `false` |
| Number above `Number.MAX_SAFE_INTEGER` | `RangeError` (use BigInt) |
| BigInt of 3,317,044,064,679,887,385,961,981 or more | `RangeError` |
| Anything else | `TypeError` |

- The result is exact because the first 13 primes as Miller-Rabin bases are proven sufficient below the limit above (Sorenson and Webster, 2017).
- Numbers are converted to BigInt internally, so large inputs stay fast.

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

- Wikipedia. Miller-Rabin primality test.. https://en.wikipedia.org/wiki/Miller%E2%80%93Rabin_primality_test
- Sorenson, J. and Webster, J. Strong pseudoprimes to twelve prime bases. Mathematics of Computation, 86 (2017).. https://arxiv.org/abs/1509.00864
- MDN Web Docs. BigInt. Mozilla.. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt
