# sample

- **Author:** 紅梅 ([@redplum701](https://github.com/redplum701))
- **Copyright:** © 2026 紅梅
- **License:** MIT
- **Created:** 2026-11-09
- **Updated:** 2026-11-09

## Description

Picks one random element from an array with equal probability. It accepts an optional random source, so it can be paired with a seeded generator (such as the planned `seeded-random` module) for reproducible picks.

## Usage

```js
import { sample } from "./sample.js";

const colors = ["red", "green", "blue"];

sample(colors);              // "red", "green", or "blue"
sample([]);                  // undefined

// Fixed random source for testing:
sample(colors, () => 0);     // "red"
sample(colors, () => 0.5);   // "green"
sample(colors, () => 0.999); // "blue"
```

## API

`sample(array, random = Math.random)`

| Parameter | Type | Description |
|-----------|------|-------------|
| `array` | Array | The array to pick from |
| `random` | function | Returns a number from 0 up to (but not including) 1, like `Math.random` |

- Returns one element, each with an equal chance. The array is not changed.
- Returns `undefined` for an empty array.
- Errors: `TypeError` if `array` is not an array or `random` is not a function, `RangeError` if `random()` returns a value outside `[0, 1)`.
- `Math.random` is not cryptographically secure. Do not use this for passwords or tokens.
- To pick several elements without repeats, shuffle first (see the planned `shuffle` module).

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
- Wikipedia. Discrete uniform distribution.. https://en.wikipedia.org/wiki/Discrete_uniform_distribution
