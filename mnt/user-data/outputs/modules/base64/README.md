# base64

- **Author:** 紅梅 ([@redplum701](https://github.com/redplum701))
- **Copyright:** © 2026 紅梅
- **License:** MIT
- **Created:** 2026-11-09
- **Updated:** 2026-11-09

## Description

Base64 encoding and decoding that is safe for any text (UTF-8) and for raw bytes, with the standard alphabet or the URL-safe one, with or without padding. It is written by hand, so it does not depend on `btoa`/`atob` (which break on non-Latin text) or on Node's `Buffer`.

## Usage

```js
import { encodeBase64, decodeBase64, decodeBase64ToBytes, isBase64 } from "./base64.js";

encodeBase64("Hello");                 // "SGVsbG8="
encodeBase64("こんにちは");              // "44GT44KT44Gr44Gh44Gv"
decodeBase64("44GT44KT44Gr44Gh44Gv");  // "こんにちは"

// Bytes in, bytes out
encodeBase64(new Uint8Array([251, 255, 254]));   // "+//+"
decodeBase64ToBytes("+//+");                      // Uint8Array [251, 255, 254]

// URL-safe, no padding (JWT style)
encodeBase64(new Uint8Array([251, 255, 254]), { urlSafe: true, padding: false }); // "-__-"
encodeBase64("a", { padding: false });            // "YQ"

// Decoding is forgiving about alphabet, padding, and line breaks
decodeBase64("SGVs\nbG8");                        // "Hello"
decodeBase64ToBytes("-__-");                      // Uint8Array [251, 255, 254] (URL-safe input works too)
decodeBase64("-__-");                             // throws RangeError: those bytes are not valid UTF-8

isBase64("SGVsbG8=");                             // true
isBase64("SGVsbG8!");                             // false
```

## API

| Function | Result |
|----------|--------|
| `encodeBase64(input, options?)` | Base64 string. `input`: string (as UTF-8), typed array, `DataView`, or `ArrayBuffer` |
| `decodeBase64(text)` | Text (bytes read as UTF-8) |
| `decodeBase64ToBytes(text)` | `Uint8Array` |
| `isBase64(text)` | `true` or `false` (never throws) |

| Option (`encodeBase64`) | Default | Description |
|-------------------------|---------|-------------|
| `urlSafe` | `false` | Use `-` and `_` instead of `+` and `/` |
| `padding` | `true` | End with `=` so the length is a multiple of 4. Use `false` for JWT-style Base64URL |

- **Why not `btoa`?** `btoa` only accepts characters up to U+00FF and throws on Japanese text or emoji. This module encodes text as UTF-8 first.
- Decoding accepts both alphabets, with or without `=` padding, and ignores spaces and line breaks. Extra, missing, or misplaced `=`, invalid characters, and impossible lengths are rejected.
- Leftover bits at the end are not checked (`"Zh=="` decodes like `"Zg=="`), the same as most decoders.
- `decodeBase64` throws if the bytes are not valid UTF-8. A leading byte order mark is kept. Use `decodeBase64ToBytes` for binary data.
- A lone surrogate in the input text becomes U+FFFD when encoded.
- Errors: `TypeError` for unsupported types, `RangeError` for invalid Base64 or invalid UTF-8.

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

- Josefsson, S. RFC 4648: The Base16, Base32, and Base64 Data Encodings. IETF, 2006.. https://www.rfc-editor.org/rfc/rfc4648
- MDN Web Docs. Base64 (glossary): the Unicode problem. Mozilla.. https://developer.mozilla.org/en-US/docs/Web/API/Window/btoa#unicode_strings
- MDN Web Docs. TextEncoder. Mozilla.. https://developer.mozilla.org/en-US/docs/Web/API/TextEncoder
- MDN Web Docs. TextDecoder. Mozilla.. https://developer.mozilla.org/en-US/docs/Web/API/TextDecoder
