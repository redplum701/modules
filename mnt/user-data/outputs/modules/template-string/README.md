# template-string

- **Author:** 紅梅 ([@redplum701](https://github.com/redplum701))
- **Copyright:** © 2026 紅梅
- **License:** MIT
- **Created:** 2026-11-09
- **Updated:** 2026-11-09

## Description

Fills `{name}` placeholders in a string from an object. It supports nested paths (`{user.name}`, `{items[0]}`), a choice of what to do when a value is missing, a transform hook (for HTML escaping, for example), custom delimiters, and a backslash to write a literal placeholder.

## Usage

```js
import { renderTemplate, extractPlaceholders, escapeHtml } from "./template-string.js";

renderTemplate("Hello, {name}!", { name: "Mei" });               // "Hello, Mei!"
renderTemplate("{user.name} is {user.age}", { user: { name: "Sam", age: 30 } });
// "Sam is 30"
renderTemplate("First: {items[0]}", { items: ["a", "b"] });      // "First: a"

// Missing values
renderTemplate("Hi {name}", {});                                  // "Hi {name}" (kept; the default)
renderTemplate("Hi {name}", {}, { missing: "empty" });            // "Hi "
renderTemplate("Hi {name}", {}, { missing: "throw" });            // RangeError

// Escape HTML in the values (not in the template)
renderTemplate("<p>{comment}</p>", { comment: "<script>x</script>" }, { transform: escapeHtml });
// "<p>&lt;script&gt;x&lt;/script&gt;</p>"

// A literal placeholder
renderTemplate("Write \\{name} to insert a name", { name: "Mei" });   // "Write {name} to insert a name"

// Other delimiters
renderTemplate("Hello, {{name}}!", { name: "Mei" }, { open: "{{", close: "}}" });

extractPlaceholders("{a} and {b.c} and {a}");                    // ["a", "b.c"]
```

## API

| Function | Result |
|----------|--------|
| `renderTemplate(template, data?, options?)` | The filled string |
| `extractPlaceholders(template, options?)` | Placeholder names, without repeats, in order |
| `escapeHtml(text)` | `text` with `& < > " '` escaped |

| Option | Default | Description |
|--------|---------|-------------|
| `missing` | `"keep"` | `"keep"`: leave the placeholder as written. `"empty"`: use `""`. `"throw"`: throw `RangeError` |
| `transform` | — | `(text, key) => string`, applied to every inserted value |
| `open`, `close` | `"{"`, `"}"` | Delimiters (for example `"{{"` and `"}}"`) |
| `escape` | `"\\"` | The character before an opening delimiter that makes it plain text |

- **Paths:** `{name}`, `{user.name}`, `{items[0]}`, `{items.0.title}`. Spaces inside the braces are ignored (`{ name }`).
- **Only own properties** are read, so `{constructor}` and `{toString}` are always "missing" and cannot expose anything from the prototype.
- **Values** are converted with `String()`: `null` gives `"null"`, `0` gives `"0"`, arrays use `join(",")` rules, and a plain object gives `"[object Object]"`. A property holding `undefined` counts as missing. Use `transform` if you need another format.
- **Literal braces:** `\{name}` gives `{name}`. A `{` with no closing `}`, and empty `{}`, stay as plain text. With `missing: "throw"`, text that merely looks like a placeholder (such as JSON with braces) will throw, so escape it or use other delimiters.
- **Security:** this is plain string replacement, not an HTML templating system. When the output goes into HTML, pass `escapeHtml` as `transform` (it escapes the *values*, not your template).
- Errors: `TypeError` for a non-string template, non-object data, or an option of the wrong type. `RangeError` for an unknown `missing`, or a missing value when `missing` is `"throw"`.

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

- Mustache. mustache(5) manual: tags and escaping.. https://mustache.github.io/mustache.5.html
- MDN Web Docs. Template literals. Mozilla.. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals
- OWASP. Cross Site Scripting Prevention Cheat Sheet.. https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html
- MDN Web Docs. Object.hasOwn(). Mozilla.. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwn
