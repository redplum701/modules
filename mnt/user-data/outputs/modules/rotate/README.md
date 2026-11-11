# rotate

- **Author:** 紅梅 ([@redplum701](https://github.com/redplum701))
- **Copyright:** © 2026 紅梅
- **License:** MIT
- **Created:** 2026-11-09
- **Updated:** 2026-11-09

## Description

Rotates the elements of an array by `n` positions and returns a new array. Positive `n` moves elements to the left (the first elements wrap around to the end). Negative `n` moves them to the right.

## Usage

```js
import { rotate } from "./rotate.js";

const items = [1, 2, 3, 4, 5];

rotate(items, 2);    // [3, 4, 5, 1, 2]
rotate(items, -1);   // [5, 1, 2, 3, 4]
rotate(items, 5);    // [1, 2, 3, 4, 5] (full turn)
rotate(items, 7);    // [3, 4, 5, 1, 2] (same as 2)
rotate([], 3);       // []

items;               // unchanged: [1, 2, 3, 4, 5]
```

## API

`rotate(array, n)`

| `n` | Effect | `rotate([1, 2, 3, 4, 5], n)` |
|-----|--------|------------------------------|
| `2` | Left by 2 | `[3, 4, 5, 1, 2]` |
| `-2` | Right by 2 | `[4, 5, 1, 2, 3]` |
| `0` or a multiple of the length | No change | `[1, 2, 3, 4, 5]` |

- Returns a new array. The original is not changed.
- `n` can be larger than the array length. It wraps around.
- An empty array returns `[]`.
- Errors: `TypeError` if `array` is not an array, `RangeError` if `n` is not an integer (including `NaN` and `Infinity`).

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

- Wikipedia. Circular shift.. https://en.wikipedia.org/wiki/Circular_shift
- MDN Web Docs. Array.prototype.slice(). Mozilla.. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/slice
- MDN Web Docs. Remainder (%). Mozilla.. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Remainder
