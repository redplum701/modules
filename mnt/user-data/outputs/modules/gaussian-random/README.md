# gaussian-random

- **Author:** 紅梅 ([@redplum701](https://github.com/redplum701))
- **Copyright:** © 2026 紅梅
- **License:** MIT
- **Created:** 2026-11-09
- **Updated:** 2026-11-09

## Description

Normally distributed (bell-curve) random numbers, using the Box-Muller transform or Marsaglia's polar method. It gives single values, arrays, and a generator that uses both numbers of each pair. It takes any uniform random source, so it works with a seeded generator (such as the planned `seeded-random` module) for repeatable results.

## Usage

```js
import { randomNormal, randomNormals, createGaussian } from "./gaussian-random.js";

randomNormal();                                  // e.g. 0.37 (mean 0, standard deviation 1)
randomNormal({ mean: 170, stdDev: 6 });          // e.g. 174.2  (heights in cm)
randomNormal({ method: "polar" });               // the same distribution, no trigonometry

randomNormals(1000, { mean: 100, stdDev: 15 });  // 1000 values (like IQ scores)

// A generator that wastes nothing
const next = createGaussian({ mean: 50, stdDev: 10 });
next.next();
next.next();
next.reset();                                    // start a new pair

// Repeatable results with your own uniform source
let seed = 42;
const lcg = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
randomNormals(3, { random: lcg });

// Keep values in a range by clamping (or by rejecting and trying again)
const score = Math.min(100, Math.max(0, randomNormal({ mean: 70, stdDev: 12 })));
```

## API

| Function | Result |
|----------|--------|
| `randomNormal(options?)` | One number |
| `randomNormals(count, options?)` | An array of `count` numbers (up to 10,000,000), using both numbers of every pair |
| `createGaussian(options?)` | `{ next(), reset() }`: a generator that remembers the second number of each pair |

| Option | Default | Description |
|--------|---------|-------------|
| `mean` | `0` | The center of the curve |
| `stdDev` | `1` | The spread. About 68% of values lie within one `stdDev` of the mean, and about 95% within two. `0` always gives the mean |
| `random` | `Math.random` | A function returning a uniform number from 0 up to (not including) 1. Replace it for repeatable results |
| `method` | `"box-muller"` | `"box-muller"` or `"polar"` (Marsaglia's polar method) |

- **Box-Muller:** two uniform numbers `u1`, `u2` become `√(−2 ln u1) · cos(2π u2)` and `√(−2 ln u1) · sin(2π u2)`, two independent standard normal numbers. `u1` is taken from (0, 1] so the logarithm never sees 0.
- **Polar method:** picks a random point inside the unit circle (trying again when it falls outside, about 21% of the time) and avoids the trigonometry. Both methods give the same distribution.
- **`Math.random` is not cryptographically secure**, and it cannot be seeded. For repeatable results, pass your own `random` (see the planned `seeded-random`).
- Values are unbounded in theory: very rare values several standard deviations out can occur. Clamp or re-draw if you need a range.
- Errors: `TypeError` for a `random` that is not a function. `RangeError` for a `mean` or `stdDev` that is not finite (or a negative `stdDev`), an unknown `method`, a `count` outside 0 to 10,000,000, or a `random()` result outside `[0, 1)`.

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

- Box, G. E. P. and Muller, M. E. A note on the generation of random normal deviates. The Annals of Mathematical Statistics, 29(2), 1958.. https://doi.org/10.1214/aoms/1177706645
- Marsaglia, G. and Bray, T. A. A convenient method for generating normal variables. SIAM Review, 6(3), 1964.. https://doi.org/10.1137/1006063
- Wikipedia. Box-Muller transform.. https://en.wikipedia.org/wiki/Box%E2%80%93Muller_transform
- MDN Web Docs. Math.random(). Mozilla.. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
