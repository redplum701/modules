# uuid-v4

- **Author:** 紅梅 ([@redplum701](https://github.com/redplum701))
- **Copyright:** © 2026 紅梅
- **License:** MIT
- **Created:** 2026-11-09
- **Updated:** 2026-11-09

## Description

Generates version 4 (random) UUIDs from cryptographic random numbers, and checks whether a string is a valid UUID of any version. It builds the UUID by hand from 16 random bytes, following RFC 9562, instead of calling `crypto.randomUUID()`.

## Usage

```js
import { uuidV4, isUuid, isUuidV4 } from "./uuid-v4.js";

uuidV4();                    // e.g. "3b241101-e2bb-4255-8caf-4136c566a962"

isUuid("3b241101-e2bb-4255-8caf-4136c566a962");     // true
isUuid("3B241101-E2BB-4255-8CAF-4136C566A962");     // true (any case)
isUuid("3b241101e2bb42558caf4136c566a962");         // false (no hyphens)
isUuid("00000000-0000-0000-0000-000000000000");     // true  (Nil UUID)

isUuidV4("3b241101-e2bb-4255-8caf-4136c566a962");   // true
isUuid("6ba7b810-9dad-11d1-80b4-00c04fd430c8", { version: 1 }); // true
isUuid("6ba7b810-9dad-11d1-80b4-00c04fd430c8", { version: 4 }); // false
```

## API

| Function | Result |
|----------|--------|
| `uuidV4(options?)` | A new version 4 UUID (lowercase, 8-4-4-4-12) |
| `isUuid(value, options?)` | `true` or `false`. `options.version` (1–8) requires a version |
| `isUuidV4(value)` | `true` if `value` is a valid version 4 UUID |

- **How it is built:** 16 random bytes from `crypto.getRandomValues`, then the version bits (`0100`) and variant bits (`10`) are set. 122 bits are random.
- `isUuid` accepts versions 1 to 8 with the RFC variant, in upper or lower case. The Nil UUID (all zeros) and Max UUID (all `f`) count as valid only when you do not ask for a version.
- Braces (`{…}`), `urn:uuid:` prefixes, and missing hyphens are not accepted.
- Uses Web Crypto: Node.js 19+ (global `crypto`) and all current browsers. The `getRandomValues` option lets you supply a source for testing.
- Errors: `TypeError` if `getRandomValues` is not a function, `RangeError` if `version` is not an integer from 1 to 8.

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

- Davis, K., Peabody, B., and Leach, P. RFC 9562: Universally Unique IDentifiers (UUIDs). IETF, 2024.. https://www.rfc-editor.org/rfc/rfc9562
- MDN Web Docs. Crypto: getRandomValues() method. Mozilla.. https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues
- MDN Web Docs. Crypto: randomUUID() method. Mozilla.. https://developer.mozilla.org/en-US/docs/Web/API/Crypto/randomUUID
