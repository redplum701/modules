# hiragana-katakana

- **Author:** 紅梅 ([@redplum701](https://github.com/redplum701))
- **Copyright:** © 2026 紅梅
- **License:** MIT
- **Created:** 2026-11-09
- **Updated:** 2026-11-09

## Description

Converts between hiragana and (full-width) katakana, and checks whether text is all hiragana or all katakana. Kanji, the prolonged sound mark `ー`, ASCII, and half-width kana are left unchanged.

## Usage

```js
import { toKatakana, toHiragana, isHiragana, isKatakana } from "./hiragana-katakana.js";

toKatakana("ひらがな");         // "ヒラガナ"
toKatakana("漢字とひらがな");     // "漢字トヒラガナ"
toHiragana("カタカナ");         // "かたかな"
toHiragana("コーヒー");         // "こーひー" (ー stays as it is)
toKatakana("ゔ");              // "ヴ"

isHiragana("ありがとう");       // true
isHiragana("ありがとう!");      // false
isKatakana("コーヒー");         // true
isKatakana("");               // false
```

## API

| Function | Result |
|----------|--------|
| `toKatakana(text)` | Hiragana → katakana |
| `toHiragana(text)` | Katakana → hiragana |
| `isHiragana(text)` | `true` if the text is only hiragana (and `ー`) |
| `isKatakana(text)` | `true` if the text is only full-width katakana (and `ー`) |

- Converted ranges: `ぁ`–`ゖ` ⇔ `ァ`–`ヶ`, and the iteration marks `ゝゞ` ⇔ `ヽヾ`. That includes `ゔ` ⇔ `ヴ` and the small `ゕゖ` ⇔ `ヵヶ`.
- Not converted: kanji, `ー`, `・`, ASCII, half-width katakana, and `ヷ ヸ ヹ ヺ` (no hiragana partner).
- `isHiragana` and `isKatakana` allow the prolonged sound mark `ー` and return `false` for an empty string.
- Half-width katakana is not converted. Run `toFullwidthKana` from `halfwidth-kana` first.
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

- Unicode Consortium. Hiragana (U+3040-U+309F) code chart.. https://www.unicode.org/charts/PDF/U3040.pdf
- Unicode Consortium. Katakana (U+30A0-U+30FF) code chart.. https://www.unicode.org/charts/PDF/U30A0.pdf
- MDN Web Docs. String.prototype.replace(). Mozilla.. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace
