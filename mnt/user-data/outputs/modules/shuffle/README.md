# shuffle

- **Author:** 紅梅 ([@redplum701](https://github.com/redplum701))
- **Copyright:** © 2026 紅梅
- **License:** MIT
- **Created:** 2026-11-09
- **Updated:** 2026-11-09

## Description

Randomly reorders an array with the Fisher-Yates algorithm, so every ordering is equally likely. Provides a copying version (`shuffle`) and an in-place version (`shuffleInPlace`). Both accept an optional random source, so they can be paired with a seeded generator (such as the planned `seeded-random` module) for reproducible shuffles.

## Usage

```js
import { shuffle, shuffleInPlace } from "./shuffle.js";

const cards = ["A", "K", "Q", "J"];

shuffle(cards);              // e.g. ["Q", "A", "J", "K"]
cards;                       // unchanged: ["A", "K", "Q", "J"]

shuffleInPlace(cards);       // changes `cards` itself

// Fixed random source for testing:
shuffle([1, 2, 3, 4], () => 0); // [2, 3, 4, 1]
```

## API

| Function | Result |
|----------|--------|
| `shuffle(array, random = Math.random)` | A new shuffled array. The original is not changed |
| `shuffleInPlace(array, random = Math.random)` | The same array, shuffled in place |

- `random` is any function that returns a number from 0 up to (but not including) 1, like `Math.random`.
- Every ordering is equally likely (no bias) when `random` is uniform. This is the point of Fisher-Yates over the common `sort(() => Math.random() - 0.5)` trick, which is biased.
- `Math.random` is not cryptographically secure. Do not use this to shuffle anything security-sensitive.
- Errors: `TypeError` if `array` is not an array or `random` is not a function, `RangeError` if `random()` returns a value outside `[0, 1)`.

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

- Wikipedia. Fisher-Yates shuffle.. https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
- Durstenfeld, R. Algorithm 235: Random permutation. Communications of the ACM 7(7), 1964.. https://doi.org/10.1145/364520.364540
- MDN Web Docs. Math.random(). Mozilla.. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
