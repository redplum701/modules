# phone-number-formatter

- **Author:** 紅梅 ([@redplum701](https://github.com/redplum701))
- **Copyright:** © 2026 紅梅
- **License:** MIT
- **Created:** 2026-11-09
- **Updated:** 2026-11-09

## Description

Formats Japanese phone numbers with hyphens. It cleans up messy input (full-width digits, odd hyphens, spaces, parentheses, `+81`), recognizes mobile, IP phone, toll-free, and other service numbers, and places landline hyphens using the official area code list from the Ministry of Internal Affairs and Communications (MIC), as of March 1, 2026.

## Usage

```js
import { formatPhoneNumber, parsePhoneNumber, isPhoneNumber } from "./phone-number-formatter.js";

formatPhoneNumber("09012345678");            // "090-1234-5678"
formatPhoneNumber("０９０－１２３４－５６７８");  // "090-1234-5678"
formatPhoneNumber("03 (1234) 5678");         // "03-1234-5678"
formatPhoneNumber("0111234567");             // "011-123-4567"  (Sapporo)
formatPhoneNumber("0422123456");             // "0422-12-3456"  (Musashino)
formatPhoneNumber("0120123456");             // "0120-123-456"
formatPhoneNumber("+81 90 1234 5678");       // "090-1234-5678"

formatPhoneNumber("09012345678", { international: true }); // "+81 90-1234-5678"
formatPhoneNumber("09012345678", { separator: " " });      // "090 1234 5678"
formatPhoneNumber("12345");                  // null (not recognized)

parsePhoneNumber("0422123456");
// { type: "landline", digits: "0422123456", areaCode: "0422",
//   groups: ["0422", "12", "3456"] }

isPhoneNumber("090-1234-5678");              // true
isPhoneNumber("090-1234-567");               // false
```

## API

| Function | Result |
|----------|--------|
| `formatPhoneNumber(input, options?)` | Formatted string, or `null` if not recognized |
| `parsePhoneNumber(input)` | `{ type, digits, groups, areaCode? }`, or `null` |
| `isPhoneNumber(input)` | `true` or `false` (never throws) |

| Option | Default | Description |
|--------|---------|-------------|
| `separator` | `"-"` | Text between the groups |
| `international` | `false` | `+81` form without the leading 0 (`"+81 90-1234-5678"`) |

**Recognized numbers**

| Type | Prefix | Digits | Grouping |
|------|--------|--------|----------|
| `landline` | `0` + area code (see below) | 10 | `0AREA-LOCAL-XXXX` |
| `mobile` | `060` `070` `080` `090` | 11 | `0X0-XXXX-XXXX` |
| `ip-phone` | `050` | 11 | `050-XXXX-XXXX` |
| `m2m` | `020` | 11 | `020-XXXX-XXXX` |
| `toll-free` | `0120` | 10 | `0120-XXX-XXX` |
| `toll-free` | `0800` | 10 or 11 | `0800-XXX-XXX` / `0800-XXX-XXXX` |
| `navi-dial` | `0570` | 10 | `0570-XXX-XXX` |
| `mass-call` | `0180` | 10 | `0180-XXX-XXX` |
| `info-fee` | `0990` | 10 | `0990-XXX-XXX` |

**Input cleanup:** full-width digits and punctuation (NFKC), spaces, hyphens and dashes (including `ー`), parentheses, dots, and `+81` forms (including `+81 (0)90…`).

**Landline area codes.** The official rule is: area code (1 to 4 digits after the `0`) plus local code always make 5 digits, followed by a 4-digit subscriber number. The module holds the area code list published by the MIC (as of 2026-03-01) and picks the longest area code that matches the start of the number. That puts the hyphens correctly for all areas with one exception:

- **Area code `04`** (Saitama: Tokorozawa, Sayama, Iruma; Chiba: Kashiwa, Noda, Nagareyama, Abiko, Kamogawa) is shared with the digit patterns of `042`–`049`. The area code alone cannot tell them apart; the local codes decide. This module does not hold local codes, so those numbers are grouped like `042-XXX-XXXX` and may be wrong.

**Other notes**

- Hyphen positions are a convention. The MIC defines the numbers and area codes, not where to write hyphens. Mobile and service numbers follow the usual styles.
- Numbers must include the leading `0` (or `+81`). Short numbers such as `110` or `119` return `null`.
- Area codes can change. Re-check against the MIC list when you update.
- Errors: `TypeError` if `input` is not a string (`isPhoneNumber` never throws).

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

- Ministry of Internal Affairs and Communications (Japan). 市外局番の一覧 (List of area codes), as of March 1, 2026.. https://www.soumu.go.jp/main_content/000141817.pdf
- Ministry of Internal Affairs and Communications (Japan). 電話番号に関するQ&A (Telephone number Q&A).. https://www.soumu.go.jp/main_sosiki/joho_tsusin/top/tel_number/q_and_a.html
- Ministry of Internal Affairs and Communications (Japan). 電気通信番号制度 (Telecommunications numbering).. https://www.soumu.go.jp/main_sosiki/joho_tsusin/top/tel_number/shigai_list.html
- MDN Web Docs. String.prototype.normalize(). Mozilla.. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize
