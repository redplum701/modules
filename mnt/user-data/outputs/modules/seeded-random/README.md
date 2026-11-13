# seeded-random

- **Author:** 紅梅 ([@redplum701](https://github.com/redplum701))
- **Copyright:** © 2026 紅梅
- **License:** MIT
- **Created:** 2026-11-09
- **Updated:** 2026-11-09

## Description

Random number generators that give the same sequence for the same seed: mulberry32, xorshift128, and sfc32. They give floats from 0 up to 1, unbiased integers in a range, 53-bit floats, and let you save, restore, and copy the generator's state. The returned function can be used anywhere a `Math.random` replacement is accepted. **They are not secure.**

## Usage

```js
import { createSeededRandom } from "./seeded-random.js";

const random = createSeededRandom(12345);
random();                       // 0.9797282677609473 (always the same for seed 12345)
random();                       // 0.3067522644996643

createSeededRandom("hello");    // string seeds work: the same text gives the same sequence
createSeededRandom(42, { algorithm: "sfc32" });

random.nextInt(1, 6);           // a die roll, unbiased
random.nextUint32();            // 0 to 4294967295
random.nextFloat53();           // a float with 53 random bits

// Pause and resume
const saved = random.getState();
const a = random();
random.setState(saved);
random() === a;                 // true

// An independent copy
const copy = random.clone();
copy() === random();            // true (they continue identically)

// Use it wherever a random source is accepted
// shuffle(cards, random);  sample(items, random);  randomInt(1, 6, random);
```

## API

`createSeededRandom(seed, options?)` returns a function `random()` that gives a number from 0 up to (not including) 1.

| Option | Default | Description |
|--------|---------|-------------|
| `algorithm` | `"mulberry32"` | `"mulberry32"` (1 word of state), `"xorshift128"` (4 words), or `"sfc32"` (4 words) |

| Member of `random` | Description |
|--------------------|-------------|
| `random()` | A float in `[0, 1)` (32 bits of precision) |
| `random.nextUint32()` | An unsigned 32-bit integer |
| `random.nextFloat53()` | A float in `[0, 1)` with 53 bits of precision |
| `random.nextInt(min, max)` | A whole number from `min` to `max`, both included, unbiased (range up to 2³² numbers) |
| `random.getState()` / `random.setState(state)` | Save and restore the state (an array of unsigned 32-bit integers) |
| `random.clone()` | An independent generator at the same point |
| `random.algorithm` | The algorithm name |

**Seeds.** A whole number between −2³¹ and 2³¹ is used as it is, so `createSeededRandom(1)` matches other published mulberry32 implementations seeded with `1`. Any other number, a `BigInt`, or a string is hashed to 32 bits first (FNV-1a). For `xorshift128` and `sfc32`, the one seed is spread over the four words of state with SplitMix32.

- **Same seed, same sequence**, on every machine and in every JavaScript engine (everything is integer arithmetic).
- **Only 32 bits of seed.** Different seeds can give the same sequence once they are hashed (a one in four billion chance for any two). That is fine for games and tests.
- **Not secure.** Never use these for passwords, tokens, or shuffling cards in a game with money. Use `crypto.getRandomValues` (see `random-id`, `uuid-v4`).
- **Compatible with the other modules:** the returned function is a plain `() => number`, so it plugs into the `random` option of `shuffle`, `sample`, `random-range`, `weighted-random`, `gaussian-random`, and others.
- `nextInt` throws away the few values that would favor small numbers, so it can call the generator more than once.
- Errors: `TypeError` for a seed that is not a number, BigInt, or string, or a bad `setState` argument. `RangeError` for a non-finite seed, an unknown algorithm, bad `nextInt` bounds, or an invalid state.

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

- Ettinger, T. mulberry32 (a small 32-bit generator).. https://gist.github.com/tommyettinger/46a874533244883189143505d203312c
- Marsaglia, G. Xorshift RNGs. Journal of Statistical Software, 8(14), 2003.. https://doi.org/10.18637/jss.v008.i14
- Wikipedia. Xorshift.. https://en.wikipedia.org/wiki/Xorshift
- Steele, G. L., Lea, D., and Flood, C. H. Fast splittable pseudorandom number generators (SplitMix, used here to spread a seed). OOPSLA 2014.. https://doi.org/10.1145/2660193.2660195
- Doty-Humphrey, C. PractRand (the home of the sfc generators).. https://pracrand.sourceforge.net/
