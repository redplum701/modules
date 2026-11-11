# email-validator

- **Author:** 紅梅 ([@redplum701](https://github.com/redplum701))
- **Copyright:** © 2026 紅梅
- **License:** MIT
- **Created:** 2026-11-09
- **Updated:** 2026-11-09

## Description

A practical email address format check. It covers what real addresses use (dots, `+` tags, common symbols, domain label rules, length limits) and skips the rare corners of the RFC (quoted local parts, comments, IP literals). A valid format does not mean the mailbox exists.

## Usage

```js
import { isValidEmail, parseEmail } from "./email-validator.js";

isValidEmail("user@example.com");               // true
isValidEmail("first.last+tag@example.co.jp");   // true
isValidEmail("o'brien@example.com");            // true

isValidEmail("plainaddress");                   // false
isValidEmail("user@example");                   // false (no top-level domain)
isValidEmail("user@@example.com");              // false
isValidEmail("us..er@example.com");             // false (double dot)
isValidEmail("user name@example.com");          // false

// Options
isValidEmail("user@localhost", { requireTld: false });          // true
isValidEmail("ユーザー@例え.jp", { allowUnicode: true });          // true
isValidEmail("name..@example.ne.jp", { lenientDots: true });    // true

parseEmail("Mei@Example.COM");
// { local: "Mei", domain: "example.com" }
```

## API

| Function | Result |
|----------|--------|
| `isValidEmail(email, options?)` | `true` or `false` (never throws) |
| `parseEmail(email, options?)` | `{ local, domain }` (domain lowercased), or `null` |

| Option | Default | Description |
|--------|---------|-------------|
| `allowUnicode` | `false` | Allow non-ASCII letters and digits in the local part and domain |
| `lenientDots` | `false` | Allow leading, trailing, and double dots in the local part (older Japanese mobile addresses) |
| `requireTld` | `true` | Require a dot and a top-level domain (at least 2 characters, not all digits) |

**Rules:** exactly one `@`; local part up to 64 characters, made of letters, digits, and ``!#$%&'*+/=?^_`{|}~-``, with no leading, trailing, or double dots; domain labels 1–63 characters of letters, digits, and inner hyphens; whole address up to 254 characters.

**Not supported on purpose:** quoted local parts (`"a b"@example.com`), comments, and IP-address domains (`user@[192.0.2.1]`). These are valid in the RFCs but almost never used, and accepting them tends to let bad input through.

- A valid format does not prove the mailbox exists. Send a confirmation email to be sure.
- Surrounding spaces are not trimmed: `" user@example.com"` is invalid. Trim before you check if you want that.
- Errors: `TypeError` for non-strings in `parseEmail`.

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

- WHATWG. HTML Standard: valid email address.. https://html.spec.whatwg.org/multipage/input.html#valid-e-mail-address
- Klensin, J. RFC 5321: Simple Mail Transfer Protocol (length limits). IETF, 2008.. https://www.rfc-editor.org/rfc/rfc5321
- Resnick, P. RFC 5322: Internet Message Format (addr-spec syntax). IETF, 2008.. https://www.rfc-editor.org/rfc/rfc5322
- Yao, J. and Mao, W. RFC 6531: SMTP Extension for Internationalized Email. IETF, 2012.. https://www.rfc-editor.org/rfc/rfc6531
- Braden, R. (ed.). RFC 1123: Requirements for Internet Hosts. IETF, 1989.. https://www.rfc-editor.org/rfc/rfc1123
