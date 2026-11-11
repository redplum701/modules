# chunk

- **Author:** 紅梅 ([@redplum701](https://github.com/redplum701))
- **Copyright:** © 2026 紅梅
- **License:** MIT
- **Created:** 2026-11-09
- **Updated:** 2026-11-09

## Description

Splits an array into smaller arrays of a given size. The last chunk may be shorter. Useful for pagination, batching requests, and laying items out in rows.

## Usage

```js
import { chunk } from "./chunk.js";

chunk([1, 2, 3, 4, 5], 2);   // [[1, 2], [3, 4], [5]]
chunk([1, 2, 3, 4], 2);      // [[1, 2], [3, 4]]
chunk([1, 2, 3], 10);        // [[1, 2, 3]]
chunk([], 3);                // []

// Batch work in groups of 100
for (const batch of chunk(allIds, 100)) {
  await sendBatch(batch);
}
```

## API

`chunk(array, size)`

| Parameter | Type | Description |
|-----------|------|-------------|
| `array` | Array | The array to split |
| `size` | positive integer | Items per chunk |

- Returns a new array of new arrays. The original is not changed.
- The last chunk holds the leftover items and may be shorter than `size`.
- An empty array returns `[]`.
- Errors: `TypeError` if `array` is not an array or `size` is not a number, `RangeError` if `size` is not a positive integer (`0`, negative, fractional, `NaN`, `Infinity`).

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

- Lodash. _.chunk.. https://lodash.com/docs/#chunk
- MDN Web Docs. Array.prototype.slice(). Mozilla.. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/slice
- MDN Web Docs. Number.isInteger(). Mozilla.. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isInteger
