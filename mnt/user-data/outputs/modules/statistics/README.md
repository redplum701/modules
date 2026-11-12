# statistics

- **Author:** 紅梅 ([@redplum701](https://github.com/redplum701))
- **Copyright:** © 2026 紅梅
- **License:** MIT
- **Created:** 2026-11-09
- **Updated:** 2026-11-09

## Description

Basic statistics for an array of numbers: sum, mean, median, mode(s), variance, standard deviation, min, max, range, and percentiles (two methods), plus a `summary` that computes them together. Sums use compensated (Neumaier) addition and variance uses Welford's method, so results stay accurate with large or many numbers.

## Usage

```js
import {
  sum, mean, median, mode, min, max, range,
  variance, standardDeviation, percentile, summary,
} from "./statistics.js";

const data = [2, 4, 4, 4, 5, 5, 7, 9];

sum(data);                                  // 40
mean(data);                                 // 5
median(data);                               // 4.5
mode(data);                                 // [4]
mode([1, 1, 2, 2, 3]);                      // [1, 2]  (a tie returns all)
min(data);  max(data);  range(data);        // 2  9  7

standardDeviation(data, { population: true });   // 2
standardDeviation(data);                         // 2.138089935299395 (sample)
variance(data, { population: true });            // 4

percentile([1, 2, 3, 4, 5], 50);            // 3
percentile([1, 2, 3, 4, 5], 25);            // 2
percentile([15, 20, 35, 40, 50], 30, { method: "nearest-rank" });   // 20
percentile([15, 20, 35, 40, 50], 50, { method: "nearest-rank" });   // 35

sum([0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1]);  // 1 (a plain loop gives 0.9999999999999999)

summary(data);
// { count: 8, sum: 40, mean: 5, median: 4.5, mode: [4], min: 2, max: 9, range: 7,
//   q1: 4, q3: 5.5, variance: 4.571428571428571, standardDeviation: 2.138089935299395 }
```

## API

| Function | Result |
|----------|--------|
| `sum(values)` | Sum, with compensated addition. `[]` gives `0` |
| `mean(values)` | Average |
| `median(values)` | Middle value (average of the two middle values for an even count) |
| `mode(values)` | Array of the most frequent value(s), increasing. A tie returns all tied values |
| `min(values)`, `max(values)`, `range(values)` | Smallest, largest, and max − min |
| `variance(values, options?)` | Variance (sample by default) |
| `standardDeviation(values, options?)` | Square root of the variance |
| `percentile(values, p, options?)` | The p-th percentile (`p` from 0 to 100) |
| `summary(values)` | Many of the above in one object |

| Option | Default | Description |
|--------|---------|-------------|
| `population` (`variance`, `standardDeviation`) | `false` | `false`: sample (divide by n − 1, needs 2+ numbers). `true`: population (divide by n) |
| `method` (`percentile`) | `"linear"` | `"linear"`: interpolates (Excel `PERCENTILE.INC`, NumPy default; `p = 50` is the median). `"nearest-rank"`: always an actual value from the data |

- Input is an array of **finite** numbers. The input array is never changed. An empty array is a `RangeError` (except for `sum`).
- **Accurate sums:** Neumaier's compensated addition keeps rounding errors from adding up, so ten `0.1`s sum to exactly `1`.
- **Stable variance:** Welford's one-pass method avoids the large-number cancellation of the "mean of squares minus square of mean" formula.
- `summary` returns `variance` and `standardDeviation` as `null` for a single number. `q1` and `q3` use the linear method.
- Percentile methods differ in the literature (Hyndman and Fan list nine). These two are the most common: linear is "type 7", nearest-rank is the classic textbook definition.
- Errors: `TypeError` for non-array input or non-number items. `RangeError` for empty input, NaN or Infinity, too few numbers for a sample variance, `p` outside 0 to 100, or an unknown `method`.

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

- Wikipedia. Algorithms for calculating variance (Welford's online algorithm).. https://en.wikipedia.org/wiki/Algorithms_for_calculating_variance
- Wikipedia. Kahan summation algorithm (including the Neumaier variant).. https://en.wikipedia.org/wiki/Kahan_summation_algorithm
- Hyndman, R. J. and Fan, Y. Sample quantiles in statistical packages. The American Statistician, 50(4), 1996.. https://doi.org/10.1080/00031305.1996.10473566
- Wikipedia. Percentile.. https://en.wikipedia.org/wiki/Percentile
