# fullwidth-halfwidth

- **Author:** 紅梅 ([@redplum701](https://github.com/redplum701))
- **Copyright:** © 2026 紅梅
- **License:** MIT
- **Created:** 2026-11-09
- **Updated:** 2026-11-09

## Description

Converts between full-width and half-width letters, digits, symbols, and spaces (`ＡＢＣ１２３！` ⇔ `ABC123!`). Each group can be switched on or off, so you can, for example, convert only digits. Kana are not touched; see `halfwidth-kana` for those.

## Usage

```js
import { toHalfwidth, toFullwidth } from "./fullwidth-halfwidth.js";

toHalfwidth("ＡＢＣ１２３！");               // "ABC123!"
toHalfwidth("東京都千代田区１－１－１");      // "東京都千代田区1-1-1"
toHalfwidth("￥１，０００　円");              // "¥1,000 円"

toFullwidth("Hello 123!");                  // "Ｈｅｌｌｏ　１２３！"

// Convert only some groups
toHalfwidth("ＡＢＣ１２３", { letters: false }); // "ＡＢＣ123"
toHalfwidth("ＡＢＣ１２３", { digits: false });  // "ABC１２３"
toFullwidth("ID: 42", { spaces: false });        // "ＩＤ： ４２" (the space stays)
```

## API

| Function | Result |
|----------|--------|
| `toHalfwidth(text, options?)` | Full-width → half-width |
| `toFullwidth(text, options?)` | Half-width → full-width |

| Option | Default | Covers |
|--------|---------|--------|
| `letters` | `true` | `Ａ–Ｚ` `ａ–ｚ` ⇔ `A–Z` `a–z` |
| `digits` | `true` | `０–９` ⇔ `0–9` |
| `symbols` | `true` | Punctuation and symbols (`！` ⇔ `!`, `～` ⇔ `~`), plus `￠ ￡ ￢ ￣ ￤ ￥ ￦` ⇔ `¢ £ ¬ ¯ ¦ ¥ ₩` |
| `spaces` | `true` | `U+3000` (ideographic space) ⇔ `U+0020` |

- Only the printable ASCII range, the ideographic space, and the currency forms above are converted. Kana, kanji, and everything else are left unchanged.
- The wave dash `〜` (U+301C) and the full-width tilde `～` (U+FF5E) are different characters. Only `～` is converted.
- `toFullwidth` converts the normal space to `U+3000` only when `spaces` is `true`.
- Errors: `TypeError` if `text` is not a string.

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

- Unicode Consortium. Halfwidth and Fullwidth Forms (U+FF00-U+FFEF) code chart.. https://www.unicode.org/charts/PDF/UFF00.pdf
- Unicode Consortium. Unicode Standard Annex #11: East Asian Width.. https://www.unicode.org/reports/tr11/
- MDN Web Docs. String.fromCharCode(). Mozilla.. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/fromCharCode
