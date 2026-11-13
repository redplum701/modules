# japanese-era

- **Author:** 紅梅 ([@redplum701](https://github.com/redplum701))
- **Copyright:** © 2026 紅梅
- **License:** MIT
- **Created:** 2026-11-09
- **Updated:** 2026-11-09

## Description

Converts between Gregorian dates and Japanese era dates (*wareki*): 明治, 大正, 昭和, 平成, 令和. The boundary days are exact (昭和64年1月7日 is followed by 平成元年1月8日, and 平成31年4月30日 by 令和元年5月1日). It formats and parses dates such as `"令和8年11月10日"` and `"R8.11.10"`, including 元年 and full-width digits. A new era can be added through an option.

## Usage

```js
import { toJapaneseEra, fromJapaneseEra, formatJapaneseEra, parseJapaneseEra, ERAS } from "./japanese-era.js";

toJapaneseEra("2026-11-10");
// { era: "令和", romaji: "Reiwa", abbreviation: "R", year: 8, isFirstYear: false, label: "令和8年" }

// The boundaries are exact
toJapaneseEra("1989-01-07").label;      // "昭和64年"
toJapaneseEra("1989-01-08").label;      // "平成元年"
toJapaneseEra("2019-04-30").label;      // "平成31年"
toJapaneseEra("2019-05-01").label;      // "令和元年"

fromJapaneseEra("令和", 8, 11, 10).iso; // "2026-11-10"
fromJapaneseEra("H", 31, 4, 30).iso;    // "2019-04-30"
fromJapaneseEra("平成", 31, 5, 1);      // RangeError: 平成31年5月1日 is not in the 平成 era

formatJapaneseEra("2026-11-10");                             // "令和8年11月10日"
formatJapaneseEra("2019-05-01");                             // "令和元年5月1日"
formatJapaneseEra("2019-05-01", { gannen: false });          // "令和1年5月1日"
formatJapaneseEra("2026-11-10", { format: "abbreviation" }); // "R8.11.10"
formatJapaneseEra("2026-11-10", { format: "romaji" });       // "Reiwa 8-11-10"

parseJapaneseEra("令和8年11月10日");       // { year: 2026, month: 11, day: 10, iso: "2026-11-10", era: "令和", eraYear: 8 }
parseJapaneseEra("平成元年1月8日");        // { ..., iso: "1989-01-08" }
parseJapaneseEra("R8.11.10");             // the same as the first
parseJapaneseEra("令和８年１１月１０日");   // full-width digits work
parseJapaneseEra("平成31年5月1日");        // null (not in that era)

// When a new era starts, add it (the name here is only an example)
const eras = [...ERAS, { name: "新元号", romaji: "Shingengo", abbreviation: "N", start: "2060-04-01" }];
toJapaneseEra("2060-04-01", { eras }).label;   // "新元号元年"
```

## API

| Function | Result |
|----------|--------|
| `toJapaneseEra(date, options?)` | `{ era, romaji, abbreviation, year, isFirstYear, label }` |
| `fromJapaneseEra(era, year, month, day, options?)` | `{ year, month, day, iso }` (Gregorian). Checks that the date is in the era |
| `formatJapaneseEra(date, options?)` | `"令和8年11月10日"` (or another format) |
| `parseJapaneseEra(text, options?)` | `{ year, month, day, iso, era, eraYear }`, or `null` |
| `ERAS` | The era table (frozen) |

Dates are a `Date` (read in the local time zone), a `"YYYY-MM-DD"` string, or `{ year, month, day }`.

| Option | Used by | Description |
|--------|---------|-------------|
| `eras` | all | A custom era table (oldest first). Use it to add a new era |
| `format` | `formatJapaneseEra` | `"long"` (default) `令和8年11月10日`, `"abbreviation"` `R8.11.10`, `"romaji"` `Reiwa 8-11-10` |
| `gannen` | `formatJapaneseEra` | `true` (default) writes `元` for the first year |

**The eras (first day, Gregorian)**

| Era | Abbr. | First day |
|-----|-------|-----------|
| 明治 Meiji | M | 1868-01-25 |
| 大正 Taisho | T | 1912-07-30 |
| 昭和 Showa | S | 1926-12-25 |
| 平成 Heisei | H | 1989-01-08 |
| 令和 Reiwa | R | 2019-05-01 |

- **Exact boundaries:** an era lasts until the day before the next one starts. `昭和64年` is 1989-01-01 to 1989-01-07 (only 7 days), and `平成31年` ends on 2019-04-30. `fromJapaneseEra` and `parseJapaneseEra` reject dates that do not exist, such as `昭和64年1月8日` and `平成31年5月1日`.
- **Era year:** Gregorian year − the year the era started + 1, changing on January 1, as in everyday use. The first year is 元年.
- **Before 1873:** Japan used a lunisolar calendar until 明治6年1月1日 (1873-01-01), so Gregorian dates for 明治1年 to 5年 are only approximate matches. For historical work on that period, use a lunar calendar conversion.
- **Parsing** accepts era names (`令和`), romaji (`Reiwa`), and letters (`R`, any case); `元` or a number for the year; `年月日` or `.`, `/`, `-` as separators; and full-width digits.
- **A future era:** the table ends with 令和, which continues until a new era is announced. When that happens, pass an updated `eras` table (see the example), or update `ERAS`.
- Errors: `TypeError` for unsupported types or a malformed `eras` table. `RangeError` for an invalid date, an unknown era, a date before the first era, or a date outside the named era (`parseJapaneseEra` returns `null` instead of throwing for text it cannot use).

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

- Wikipedia. Japanese era name.. https://en.wikipedia.org/wiki/Japanese_era_name
- Wikipedia. List of Japanese era names.. https://en.wikipedia.org/wiki/List_of_Japanese_era_names
- Wikipedia. Japanese calendar (the switch to the Gregorian calendar in 1873).. https://en.wikipedia.org/wiki/Japanese_calendar
- MDN Web Docs. String.prototype.normalize(). Mozilla.. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize
