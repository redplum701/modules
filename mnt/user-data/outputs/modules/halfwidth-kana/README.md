# halfwidth-kana

- **Author:** 紅梅 ([@redplum701](https://github.com/redplum701))
- **Copyright:** © 2026 紅梅
- **License:** MIT
- **Created:** 2026-11-09
- **Updated:** 2026-11-09

## Description

Converts between half-width katakana (`ｱｲｳ`) and full-width katakana (`アイウ`), including the voiced and semi-voiced sound marks: `ｶﾞ` becomes `ガ` and `ﾊﾟ` becomes `パ`. Punctuation (`｡｢｣､･`) is converted too, unless you turn it off.

## Usage

```js
import { toFullwidthKana, toHalfwidthKana } from "./halfwidth-kana.js";

toFullwidthKana("ｱｲｳｴｵ");        // "アイウエオ"
toFullwidthKana("ﾆﾎﾝｺﾞ");         // "ニホンゴ"
toFullwidthKana("ﾊﾟﾋﾟﾌﾟ");        // "パピプ"
toFullwidthKana("ｳﾞｧｲｵﾘﾝ");       // "ヴァイオリン"
toFullwidthKana("ｶﾀｶﾅｰ｡");        // "カタカナー。"
toFullwidthKana("ABCｱ123");       // "ABCア123" (other characters are untouched)

toHalfwidthKana("ガギグ");         // "ｶﾞｷﾞｸﾞ"
toHalfwidthKana("パピプ");         // "ﾊﾟﾋﾟﾌﾟ"
toHalfwidthKana("ヴ");            // "ｳﾞ"

// Leave punctuation alone
toFullwidthKana("ｱ｡", { punctuation: false }); // "ア｡"
```

## API

| Function | Result |
|----------|--------|
| `toFullwidthKana(text, options?)` | Half-width katakana → full-width, sound marks joined (`ｶﾞ` → `ガ`) |
| `toHalfwidthKana(text, options?)` | Full-width katakana → half-width, voiced letters split (`ガ` → `ｶﾞ`) |

| Option | Default | Description |
|--------|---------|-------------|
| `punctuation` | `true` | Also convert `｡｢｣､･` ⇔ `。「」、・` |

- Voiced forms: カ行, サ行, タ行, ハ行 (ガ… バ…), ウ → ヴ, ワ → ヷ, ヲ → ヺ. Semi-voiced: ハ行 → パ行.
- A sound mark that cannot join the letter before it (such as `ｱﾞ`) becomes a separate full-width mark (`ア゛`). A mark on its own does too.
- `ヮ`, `ヰ`, `ヱ`, `ヵ`, `ヶ` have no half-width form and are left unchanged.
- Only katakana and the punctuation above are converted. For letters and digits, use `fullwidth-halfwidth`. For hiragana, use `hiragana-katakana`.
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
- Unicode Consortium. Katakana (U+30A0-U+30FF) code chart.. https://www.unicode.org/charts/PDF/U30A0.pdf
- MDN Web Docs. String.prototype.replace(). Mozilla.. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace
