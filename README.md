# flatten

- **Author:** 紅梅 ([@redplum701](https://github.com/redplum701))
- **Copyright:** © 2026 紅梅
- **License:** MIT
- **Created:** 2026-11-09
- **Updated:** 2026-11-09

## Description

Flattens nested arrays into a single array, down to a chosen depth (or all the way with `Infinity`). It works like the built-in `Array.prototype.flat`, but uses a loop instead of recursion, so extremely deep nesting cannot overflow the call stack, and it reports circular references with a clear error.

## Usage

```js
import { flatten } from "./flatten.js";

flatten([1, [2, [3, [4]]]]);           // [1, 2, [3, [4]]]  (depth 1)
flatten([1, [2, [3, [4]]]], 2);        // [1, 2, 3, [4]]
flatten([1, [2, [3, [4]]]], Infinity); // [1, 2, 3, 4]
flatten([1, [2]], 0);                  // [1, [2]] (a copy)

// Very deep nesting is fine
let deep = [1];
for (let i = 0; i < 100000; i++) deep = [deep];
flatten(deep, Infinity);               // [1]

// Circular references throw a clear error
const loop = [1];
loop.push(loop);
flatten(loop, Infinity);               // TypeError
```

## API

`flatten(array, depth = 1)`

| Parameter | Type | Description |
|-----------|------|-------------|
| `array` | Array | The array to flatten |
| `depth` | integer ≥ 0, or `Infinity` | Levels to flatten. Default `1` |

- Returns a new array. The original is not changed.
- Empty slots in sparse arrays are skipped (same as `Array.prototype.flat`).
- Only arrays are flattened. Array-likes, Sets, and strings are left as they are.
- Circular references throw `TypeError`.
- Errors: `TypeError` if `array` is not an array, `RangeError` if `depth` is negative, fractional, or `NaN`.

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

- MDN Web Docs. Array.prototype.flat(). Mozilla.. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flat
- MDN Web Docs. Array.isArray(). Mozilla.. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray
- Wikipedia. Depth-first search.. https://en.wikipedia.org/wiki/Depth-first_search
