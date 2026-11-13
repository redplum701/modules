# weighted-random

- **Author:** 紅梅 ([@redplum701](https://github.com/redplum701))
- **Copyright:** © 2026 紅梅
- **License:** MIT
- **Created:** 2026-11-09
- **Updated:** 2026-11-09

## Description

Weighted random choice: pick items so that an item with weight 3 is three times as likely as an item with weight 1. It has a one-off `weightedChoice`, a reusable picker (binary search over running totals), and weighted sampling without repeats. It is the core of fortune-telling slips (*omikuji*) and gacha drops.

## Usage

```js
import { weightedChoice, createWeightedPicker, weightedSample } from "./weighted-random.js";

// A fortune slip: 大吉 5%, 中吉 25%, 小吉 40%, 凶 30%
const fortunes = ["大吉", "中吉", "小吉", "凶"];
weightedChoice(fortunes, [5, 25, 40, 30]);          // e.g. "小吉"

// Weights from the items themselves
const drops = [
  { name: "Common sword", rate: 70 },
  { name: "Rare shield", rate: 25 },
  { name: "Legendary crown", rate: 5 },
];
weightedChoice(drops, (item) => item.rate).name;

// Many picks from the same list: prepare once
const picker = createWeightedPicker(drops, (item) => item.rate);
picker.pick().name;
picker.pickMany(10).map((d) => d.name);              // a "10-pull"
picker.probabilities();                              // [0.7, 0.25, 0.05]

// Different items, no repeats (heavier items tend to come first)
weightedSample(["a", "b", "c", "d"], [10, 1, 1, 5], 2);   // e.g. ["a", "d"]

// Repeatable results with a seeded generator
// weightedChoice(fortunes, [5, 25, 40, 30], { random: createSeededRandom(42) });
```

## API

| Function | Result |
|----------|--------|
| `weightedChoice(items, weights, options?)` | One item |
| `createWeightedPicker(items, weights, options?)` | `{ pick(), pickMany(count), probabilities(), size, totalWeight }` |
| `weightedSample(items, weights, count, options?)` | `count` **different** items, in the order drawn |

- `weights` is an array with one weight per item, or a function `(item, index) => weight`. Weights are finite numbers, 0 or more, and must add up to more than 0. They do not need to add up to 1 or 100: only their proportions matter.
- `options.random` (default `Math.random`) is a function returning a number from 0 up to (not including) 1. Pass a seeded generator for repeatable results.
- **Weight 0 means never.** An item with weight 0 can never be picked, and a tiny floating-point rounding at the end of the range cannot select it either.
- **`createWeightedPicker`** works out the running totals once. Each `pick()` is a binary search (O(log n)), so use it for many picks from one list. It copies the item list when created. `probabilities()` gives each item's chance as a fraction (adding up to 1).
- **`weightedSample`** uses the Efraimidis-Spirakis method (each item gets the key ln(u) / weight; the largest keys win). `count` must be at most the number of items with a weight above 0.
- **Gacha and fairness:** these functions pick with exactly the given probabilities. A "pity" system (a guaranteed drop after N misses) is a rule you build on top; it is not part of this module.
- Not secure: `Math.random` is predictable. Do not use it where players could gain money by guessing the next result.
- Errors: `RangeError` for empty items, a weights array of the wrong length, a negative, NaN, or infinite weight, weights that add up to 0, a bad `count`, or a `random()` result outside `[0, 1)`. `TypeError` for weights that are not an array or function, or a `random` that is not a function.

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

- Wikipedia. Fitness proportionate selection (roulette wheel selection).. https://en.wikipedia.org/wiki/Fitness_proportionate_selection
- Efraimidis, P. S. and Spirakis, P. G. Weighted random sampling with a reservoir. Information Processing Letters, 97(5), 2006.. https://doi.org/10.1016/j.ipl.2005.11.003
- Wikipedia. Binary search algorithm.. https://en.wikipedia.org/wiki/Binary_search_algorithm
- MDN Web Docs. Math.random(). Mozilla.. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
