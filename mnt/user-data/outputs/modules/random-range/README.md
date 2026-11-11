# random-range

- **Author:** 紅梅 ([@redplum701](https://github.com/redplum701))
- **Copyright:** © 2026 紅梅
- **License:** MIT
- **Created:** 2026-11-09
- **Updated:** 2026-11-09

## Description

Random integers and floats within a range. Integers include both ends. Floats include the minimum but not the maximum. Both accept an optional random source, so they can be paired with a seeded generator (such as the planned `seeded-random` module) for reproducible results.

## Usage

```js
import { randomInt, randomFloat } from "./random-range.js";

randomInt(1, 6);          // 1, 2, 3, 4, 5, or 6 (like a die)
randomInt(-5, 5);         // -5 through 5
randomFloat(0, 1);        // 0 <= x < 1
randomFloat(10, 20);      // 10 <= x < 20

// Use your own random source, for example a fixed one for testing:
randomInt(1, 6, () => 0);       // 1
randomInt(1, 6, () => 0.9999);  // 6
```

## API

| Function | Range | Notes |
|----------|-------|-------|
| `randomInt(min, max, random = Math.random)` | `min` ≤ x ≤ `max` | Both ends included. Bounds must be safe integers |
| `randomFloat(min, max, random = Math.random)` | `min` ≤ x < `max` | Bounds must be finite. `min === max` returns `min` |

- `random` is any function that returns a number from 0 up to (but not including) 1, just like `Math.random`. Anything else it returns throws `RangeError`.
- `Math.random` is not cryptographically secure. Do not use these functions for passwords or tokens.
- Errors: `RangeError` for bad bounds or `min > max`, `TypeError` if `random` is not a function.

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

- MDN Web Docs. Math.random(). Mozilla.. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
- MDN Web Docs. Math.floor(). Mozilla.. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/floor
- MDN Web Docs. Number.isSafeInteger(). Mozilla.. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isSafeInteger
