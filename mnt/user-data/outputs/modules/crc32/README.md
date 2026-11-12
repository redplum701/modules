# crc32

- **Author:** 紅梅 ([@redplum701](https://github.com/redplum701))
- **Copyright:** © 2026 紅梅
- **License:** MIT
- **Created:** 2026-11-09
- **Updated:** 2026-11-09

## Description

The CRC-32 checksum used by ZIP, gzip, PNG, and Ethernet (the "IEEE" polynomial), plus CRC-32C (the "Castagnoli" polynomial used by iSCSI and many storage systems). It is table-driven, works on strings (as UTF-8) and bytes, and can continue from an earlier checksum to process data in chunks. A CRC finds accidental errors in data. **It is not a security feature.**

## Usage

```js
import { crc32, crc32Hex, crc32c, crc32cHex } from "./crc32.js";

crc32("123456789");              // 3421780262 (0xcbf43926)
crc32Hex("123456789");           // "cbf43926"
crc32("");                       // 0
crc32Hex("a");                   // "e8b7be43"
crc32Hex("The quick brown fox jumps over the lazy dog");   // "414fa339"

crc32cHex("123456789");          // "e3069283"

// Bytes
crc32(new Uint8Array([0x00, 0xff, 0x10]));

// In pieces: pass the result so far as the second argument
let crc = 0;
for (const chunk of chunks) crc = crc32(chunk, crc);
crc === crc32(allDataAtOnce);    // true
crc32("hello world") === crc32(" world", crc32("hello"));   // true
```

## API

| Function | Result |
|----------|--------|
| `crc32(input, previous = 0)` | CRC-32 (IEEE) as an unsigned 32-bit `number` |
| `crc32Hex(input, previous = 0)` | The same, as 8 lowercase hex digits |
| `crc32c(input, previous = 0)` | CRC-32C (Castagnoli) as an unsigned 32-bit `number` |
| `crc32cHex(input, previous = 0)` | The same, as 8 lowercase hex digits |

`input` is a string (hashed as its UTF-8 bytes), a typed array, a `DataView`, or an `ArrayBuffer`.

**Test vectors**

| Input | CRC-32 | CRC-32C |
|-------|--------|---------|
| `""` | `00000000` | `00000000` |
| `"a"` | `e8b7be43` | `c1d04330` |
| `"123456789"` | `cbf43926` | `e3069283` |
| `"The quick brown fox jumps over the lazy dog"` | `414fa339` | `22620404` |

- **Chunked input:** `crc32(b, crc32(a))` equals `crc32(a + b)`. Pass `0` (the default) for the first chunk. This works like `crc32(crc, buffer)` in zlib.
- **Which one?** `crc32` matches ZIP, gzip, PNG, and Ethernet, and the `cksum`-style tools in most languages (Python's `zlib.crc32`, for example). `crc32c` is used by iSCSI, ext4, Btrfs, and many databases, and is often hardware-accelerated.
- **Use:** finding accidental corruption (transmission errors, bad disk reads). **Do not use it for security:** it is easy to build data with a chosen CRC. Use SHA-256 (`crypto.subtle.digest`) for that.
- The lookup tables are built once, on first use.
- Errors: `TypeError` for an input that is not a string, typed array, `DataView`, or `ArrayBuffer`. `RangeError` for a `previous` that is not an unsigned 32-bit integer.

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

- Wikipedia. Cyclic redundancy check.. https://en.wikipedia.org/wiki/Cyclic_redundancy_check
- Deutsch, P. RFC 1952: GZIP file format specification 4.3 (CRC-32 algorithm).. https://www.rfc-editor.org/rfc/rfc1952
- W3C. Portable Network Graphics (PNG) Specification: Annex D, sample CRC implementation.. https://www.w3.org/TR/png/#D-CRCAppendix
- Sheinwald, J., Satran, J., Thaler, P., and Cavanna, V. RFC 3720: Internet Small Computer Systems Interface (iSCSI) (CRC-32C).. https://www.rfc-editor.org/rfc/rfc3720
- MDN Web Docs. TextEncoder. Mozilla.. https://developer.mozilla.org/en-US/docs/Web/API/TextEncoder
