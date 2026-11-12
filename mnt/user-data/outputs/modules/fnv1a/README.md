# fnv1a

- **Author:** 紅梅 ([@redplum701](https://github.com/redplum701))
- **Copyright:** © 2026 紅梅
- **License:** MIT
- **Created:** 2026-11-09
- **Updated:** 2026-11-09

## Description

The FNV-1a hash (Fowler-Noll-Vo): a very small and fast non-cryptographic hash. It comes as a 32-bit number and a 64-bit `BigInt`, with hexadecimal versions. Strings are hashed as UTF-8, so the result is the same in every language and environment. It is good for hash tables, bucketing, and quick fingerprints. **It is not for passwords or security.**

## Usage

```js
import { fnv1a32, fnv1a32Hex, fnv1a64, fnv1a64Hex } from "./fnv1a.js";

fnv1a32("");                 // 2166136261 (0x811c9dc5, the starting value)
fnv1a32("a");                // 3826002220 (0xe40c292c)
fnv1a32Hex("foobar");        // "bf9cf968"

fnv1a64("a");                // 12638187200555641996n
fnv1a64Hex("a");             // "af63dc4c8601ec8c"
fnv1a64Hex("foobar");        // "85944171f73967e8"

fnv1a32("こんにちは");         // UTF-8 bytes are hashed: the same in every language
fnv1a32(new Uint8Array([1, 2, 3]));     // bytes work too

// Pick one of 16 buckets
const bucket = fnv1a32("user:42") % 16;
```

## API

| Function | Result |
|----------|--------|
| `fnv1a32(input)` | The 32-bit hash as an unsigned `number` (0 to 4,294,967,295) |
| `fnv1a32Hex(input)` | The same, as 8 lowercase hex digits |
| `fnv1a64(input)` | The 64-bit hash as a `BigInt` |
| `fnv1a64Hex(input)` | The same, as 16 lowercase hex digits |

`input` is a string (hashed as its UTF-8 bytes), a typed array, a `DataView`, or an `ArrayBuffer`.

**Test vectors** (from the FNV specification)

| Input | 32-bit | 64-bit |
|-------|--------|--------|
| `""` | `811c9dc5` | `cbf29ce484222325` |
| `"a"` | `e40c292c` | `af63dc4c8601ec8c` |
| `"foobar"` | `bf9cf968` | `85944171f73967e8` |

- **How it works:** start from a fixed offset value. For each byte, XOR it into the hash, then multiply by the FNV prime. (The older FNV-1 multiplies first and XORs second; FNV-1a mixes the last bytes a little better.)
- **Fast and small**, but **not cryptographic.** It is easy to find different inputs with the same hash. Never use it for passwords, signatures, or anything an attacker could exploit. For security use SHA-256 or another cryptographic hash (`crypto.subtle.digest`).
- A 32-bit hash starts to collide after about 65,000 different inputs (the birthday bound). Use the 64-bit version for larger sets.
- `fnv1a64` uses `BigInt` arithmetic and is much slower than `fnv1a32`.
- Text is hashed as UTF-8, so the same text gives the same hash as FNV implementations in other languages. A lone surrogate in a string is hashed as U+FFFD.
- Errors: `TypeError` for an input that is not a string, typed array, `DataView`, or `ArrayBuffer`.

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

- Wikipedia. Fowler-Noll-Vo hash function.. https://en.wikipedia.org/wiki/Fowler%E2%80%93Noll%E2%80%93Vo_hash_function
- Eastlake, D., Hansen, T., Fowler, G., Vo, K.-P., and Noll, L. C. The FNV Non-Cryptographic Hash Algorithm (IETF Internet-Draft).. https://datatracker.ietf.org/doc/html/draft-eastlake-fnv-17
- MDN Web Docs. Math.imul(). Mozilla.. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/imul
- MDN Web Docs. TextEncoder. Mozilla.. https://developer.mozilla.org/en-US/docs/Web/API/TextEncoder
