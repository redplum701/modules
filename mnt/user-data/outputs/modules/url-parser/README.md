# url-parser

- **Author:** 紅梅 ([@redplum701](https://github.com/redplum701))
- **Copyright:** © 2026 紅梅
- **License:** MIT
- **Created:** 2026-11-09
- **Updated:** 2026-11-09

## Description

Splits a URL into its parts (scheme, user info, host, port, path, query, fragment) as a plain object. It is built on the standard `URL` class, so it follows the WHATWG URL Standard, and it returns `null` instead of throwing for invalid input.

## Usage

```js
import { parseUrl, isUrl } from "./url-parser.js";

parseUrl("https://user:pw@example.com:8080/a/b%20c/d?x=1&y=2&x=3#top");
// {
//   href: "https://user:pw@example.com:8080/a/b%20c/d?x=1&y=2&x=3#top",
//   origin: "https://example.com:8080",
//   scheme: "https",
//   username: "user", password: "pw",
//   host: "example.com:8080", hostname: "example.com", port: 8080,
//   pathname: "/a/b%20c/d", segments: ["a", "b c", "d"],
//   search: "?x=1&y=2&x=3",
//   params: [["x", "1"], ["y", "2"], ["x", "3"]],
//   hash: "#top", fragment: "top"
// }

parseUrl("https://example.com:443/").port;   // null (default port)
parseUrl("/docs?page=2", "https://example.com/").hostname; // "example.com"
parseUrl("mailto:mei@example.com").origin;   // null
parseUrl("example.com");                     // null (no scheme)

isUrl("https://example.com");                // true
isUrl("ftp://example.com", { protocols: ["http", "https"] }); // false
```

## API

`parseUrl(input, base?)` returns `null` for an invalid URL, or an object with:

| Field | Description |
|-------|-------------|
| `href` | The full, normalized URL |
| `origin` | `"https://example.com:8080"`, or `null` when the URL has no origin (such as `mailto:`) |
| `scheme` | Without the colon (`"https"`) |
| `username`, `password` | User info, as written (still percent-encoded) |
| `host` | Hostname plus port |
| `hostname` | Host only. International names appear in their ASCII (punycode) form. IPv6 keeps its brackets |
| `port` | A number, or `null` if absent or the default for the scheme |
| `pathname` | The path, as written |
| `segments` | Path pieces, percent-decoded, empty ones removed |
| `search` | Query with the leading `?`, or `""` |
| `params` | All query pairs as `[key, value]`, in order, duplicates kept |
| `hash` / `fragment` | With and without the leading `#` |

`isUrl(input, options?)` returns `true` or `false` and never throws. `options.protocols` limits the allowed schemes (for example `["http", "https"]`).

- There is no automatic `https://` added: `"example.com"` has no scheme, so it returns `null`.
- Query values are decoded and `+` becomes a space, as in `URLSearchParams`. For nested keys and arrays, see the planned `query-string` module.
- Errors: `TypeError` if `input` or `base` is not a string.

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

- WHATWG. URL Standard.. https://url.spec.whatwg.org/
- Berners-Lee, T., Fielding, R., and Masinter, L. RFC 3986: Uniform Resource Identifier (URI): Generic Syntax. IETF, 2005.. https://www.rfc-editor.org/rfc/rfc3986
- MDN Web Docs. URL. Mozilla.. https://developer.mozilla.org/en-US/docs/Web/API/URL
- MDN Web Docs. URLSearchParams. Mozilla.. https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
