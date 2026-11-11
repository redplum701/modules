# fibonacci

- **Author:** 紅梅 ([@redplum701](https://github.com/redplum701))
- **Copyright:** © 2026 紅梅
- **License:** MIT
- **Created:** 2026-11-09
- **Updated:** 2026-11-09

## Description

Fibonacci numbers of any size as `BigInt`, computed in logarithmic time with the fast doubling method, with a result cache. It also gives the first n terms, an endless generator, negative indices, and a test for whether a number is a Fibonacci number.

## Usage

```js
import { fibonacci, fibonacciNumber, fibonacciSequence, fibonacciGenerator, isFibonacci } from "./fibonacci.js";

fibonacci(10);                // 55n
fibonacci(100);               // 354224848179261915075n
fibonacci(1000);              // a 209-digit BigInt, instantly
fibonacci(-6);                // -8n  (F(-n) = (-1)^(n+1) F(n))

fibonacciNumber(50);          // 12586269025 (an ordinary number, up to index 78)
fibonacciNumber(79);          // RangeError: too large for an exact number

fibonacciSequence(8);         // [0n, 1n, 1n, 2n, 3n, 5n, 8n, 13n]

for (const term of fibonacciGenerator()) {
  if (term > 100n) break;
  console.log(term);          // 0, 1, 1, 2, 3, 5, 8, ... 89
}

isFibonacci(144);             // true
isFibonacci(145);             // false
isFibonacci(354224848179261915075n);   // true
```

## API

| Function | Result |
|----------|--------|
| `fibonacci(n)` | `F(n)` as a `BigInt`. `n` from −5,000,000 to 5,000,000 |
| `fibonacciNumber(n)` | `F(n)` as a `number`, for `|n|` ≤ 78 |
| `fibonacciSequence(count)` | `[F(0), …, F(count − 1)]` as BigInts (`count` up to 100,000) |
| `fibonacciGenerator()` | An endless generator: `0n, 1n, 1n, 2n, …` |
| `isFibonacci(value)` | `true` if `value` is a Fibonacci number |

- `F(0) = 0`, `F(1) = 1`, `F(2) = 1`, `F(3) = 2`. Negative indices follow `F(−n) = (−1)ⁿ⁺¹ F(n)`, so `F(−1) = 1`, `F(−2) = −1`, `F(−3) = 2`.
- **Fast:** fast doubling needs about log₂(n) steps instead of n. `fibonacci(1_000_000)` (a 208,988-digit number) takes well under a second.
- **Cached:** the last 1,000 results are kept, so repeating a call is instant.
- **Number or BigInt:** `F(78) = 8,944,394,323,791,464` is the last Fibonacci number that fits exactly in a JavaScript number. `fibonacciNumber` stops there. Use `fibonacci` for anything larger.
- `isFibonacci` uses the identity that `n` is a Fibonacci number exactly when `5n² + 4` or `5n² − 4` is a perfect square. It works for any size with BigInt, and returns `false` for negative numbers and non-integers.
- Errors: `RangeError` for an index or count out of range, or an unsafe-integer number in `isFibonacci`. `TypeError` for unsupported types in `isFibonacci`.

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

- Wikipedia. Fibonacci sequence.. https://en.wikipedia.org/wiki/Fibonacci_sequence
- Nayuki. Fast Fibonacci algorithms.. https://www.nayuki.io/page/fast-fibonacci-algorithms
- MDN Web Docs. BigInt. Mozilla.. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt
- MDN Web Docs. Generator functions (function*). Mozilla.. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*
