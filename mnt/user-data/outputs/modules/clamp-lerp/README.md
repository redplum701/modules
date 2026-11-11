# clamp-lerp

- **Author:** 紅梅 ([@redplum701](https://github.com/redplum701))
- **Copyright:** © 2026 紅梅
- **License:** MIT
- **Created:** 2026-11-09
- **Updated:** 2026-11-09

## Description

Range limiting and linear interpolation. Clamp a number into a range, interpolate between two values, find where a value sits between two values, and remap a value from one range to another.

## Usage

```js
import { clamp, lerp, inverseLerp, remap } from "./clamp-lerp.js";

clamp(15, 0, 10);              // 10
clamp(-3, 0, 10);              // 0
clamp(5, 0, 10);               // 5
clamp(42, 0, Infinity);        // 42

lerp(0, 100, 0.25);            // 25
lerp(10, 20, 1);               // 20
lerp(0, 100, 1.5);             // 150 (not clamped)

inverseLerp(0, 100, 25);       // 0.25

// Map a 0-255 brightness value to a 0-1 opacity
remap(128, 0, 255, 0, 1);      // 0.5019607843137255

// Combine with clamp to keep the result inside the output range
clamp(remap(300, 0, 255, 0, 1), 0, 1); // 1
```

## API

| Function | Result |
|----------|--------|
| `clamp(value, min, max)` | `value` limited to `[min, max]` |
| `lerp(start, end, t)` | `start * (1 - t) + end * t` |
| `inverseLerp(start, end, value)` | `(value - start) / (end - start)` |
| `remap(value, inMin, inMax, outMin, outMax)` | `value` moved from the input range to the output range |

- `lerp`, `inverseLerp`, and `remap` do **not** clamp. Values outside the range extrapolate. Wrap them in `clamp` when you need limits.
- `clamp` allows `Infinity` and `-Infinity` as bounds. The other functions need finite numbers.
- Errors: `TypeError` for non-numbers, `RangeError` for `NaN`, `min > max` in `clamp`, or `start === end` in `inverseLerp` and `remap`.

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

- Wikipedia. Linear interpolation.. https://en.wikipedia.org/wiki/Linear_interpolation
- MDN Web Docs. Math.min(). Mozilla.. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/min
- MDN Web Docs. Math.max(). Mozilla.. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/max
