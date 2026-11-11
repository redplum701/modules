# eto

- **Author:** 紅梅 ([@redplum701](https://github.com/redplum701))
- **Copyright:** © 2026 紅梅
- **License:** MIT
- **Created:** 2026-11-09
- **Updated:** 2026-11-09

## Description

Finds the eto (Chinese zodiac animal) and the full kanshi (sexagenary cycle name, such as 丙午) for a year. Years are counted by calendar year (January 1), the way Japanese New Year cards do it.

## Usage

```js
import { getEto, getKanshi } from "./eto.js";

getEto(2026);
// { index: 6, kanji: "午", reading: "うま", english: "Horse" }

getKanshi(2026).kanji;        // "丙午"
getKanshi(2026).reading;      // "ひのえ・うま"
getKanshi(2026).stem.element; // "Fire"
getKanshi(2026).cycleNumber;  // 43

getEto(1984).kanji;           // "子"
```

## API

| Function | Input | Output |
|----------|-------|--------|
| `getEto(year)` | Integer year | `{ index, kanji, reading, english }` |
| `getKanshi(year)` | Integer year | `{ kanji, reading, cycleNumber, stem, branch }` |

- `index` runs from 0 (Rat, 子) to 11 (Pig, 亥).
- `stem` has `{ index, kanji, reading, element, yinYang }`. `branch` is the same object `getEto` returns.
- `cycleNumber` runs from 1 (甲子) to 60 (癸亥).
- Years are counted by calendar year. The traditional zodiac changes at *risshun* (around February 4), which this module does not handle.
- Works for any integer year, including years before 4 CE. Throws `TypeError` if `year` is not an integer.

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

- Wikipedia. Sexagenary cycle.. https://en.wikipedia.org/wiki/Sexagenary_cycle
- Wikipedia. Chinese zodiac.. https://en.wikipedia.org/wiki/Chinese_zodiac
