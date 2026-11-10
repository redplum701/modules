# random-id

- **Author:** 紅梅 ([@redplum701](https://github.com/redplum701))
- **Copyright:** © 2026 紅梅
- **License:** MIT
- **Created:** 2026-11-09
- **Updated:** 2026-11-09

## Description

Generates random IDs from a chosen set of characters, using the Web Crypto random number generator (`crypto.getRandomValues`). Every character is equally likely: unbiased rejection sampling avoids the "modulo bias" of the common `randomValue % alphabetSize` shortcut.

## Usage

```js
import { randomId, CHARSETS } from "./random-id.js";

randomId();                              // e.g. "V1StGXR8Z5jdHi6BmyTq4" (21 characters)
randomId(8);                             // e.g. "q7Kd9XpA"
randomId(6, { charset: "numeric" });     // e.g. "480192"  (a one-time code)
randomId(12, { charset: "hex" });        // e.g. "9f2c04ab71de"
randomId(10, { charset: "unambiguous" });// no 0 O 1 I l
randomId(5, { alphabet: "ABCDEFGHJKLMNPQRSTUVWXYZ23456789" });

console.log(Object.keys(CHARSETS));
// ["alphanumeric", "url-safe", "numeric", "lowercase", "uppercase",
//  "lowercase-alphanumeric", "hex", "unambiguous"]
```

## API

`randomId(length = 21, options?)`

| Option | Default | Description |
|--------|---------|-------------|
| `charset` | `"alphanumeric"` | A name from `CHARSETS` |
| `alphabet` | — | Your own characters (2 to 65,536, no repeats). Use instead of `charset` |
| `getRandomValues` | `crypto.getRandomValues` | Fills a `Uint32Array`. Replace for testing only |

| Charset | Characters | Size |
|---------|-----------|------|
| `alphanumeric` | `A–Z a–z 0–9` | 62 |
| `url-safe` | `A–Z a–z 0–9 _ -` | 64 |
| `numeric` | `0–9` | 10 |
| `lowercase` / `uppercase` | `a–z` / `A–Z` | 26 |
| `lowercase-alphanumeric` | `0–9 a–z` | 36 |
| `hex` | `0–9 a–f` | 16 |
| `unambiguous` | letters and digits without `0 O 1 I l` | 57 |

- **How random is it?** Each character adds `log2(alphabet size)` bits: about 5.95 for the 62-character default. 21 characters give about 125 bits, which is plenty to avoid collisions without checking. Short IDs (such as 6 digits) are only suitable when you check for duplicates.
- **Unbiased:** random 32-bit numbers in the uneven leftover range are rejected instead of folded in with `%`. Every character is equally likely.
- Uses Web Crypto: Node.js 19+ (global `crypto`) and all current browsers. On older Node.js, pass `getRandomValues` or set `globalThis.crypto`.
- Errors: `TypeError` for wrong types, `RangeError` for a bad `length` (1 to 100,000), unknown `charset`, or an invalid `alphabet`.

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

- MDN Web Docs. Crypto: getRandomValues() method. Mozilla.. https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues
- Wikipedia. Rejection sampling.. https://en.wikipedia.org/wiki/Rejection_sampling
- Wikipedia. Fisher-Yates shuffle: modulo bias.. https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle#Modulo_bias
- Ai, A. Nano ID (a similar, popular ID generator, for comparison).. https://github.com/ai/nanoid
