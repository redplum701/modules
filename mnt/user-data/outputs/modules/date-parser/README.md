# date-parser

- **Author:** 紅梅 ([@redplum701](https://github.com/redplum701))
- **Copyright:** © 2026 紅梅
- **License:** MIT
- **Created:** 2026-11-09
- **Updated:** 2026-11-09

## Description

Reads dates written in many common ways: ISO (`2026-11-10`), slashes and dots, compact (`20261110`), 年月日 (`2026年11月10日`), era dates (`令和8年11月10日`, `R8.11.10`), English month names (`Nov 10, 2026`, `10 November 2026`), and month/day/year or day/month/year. It returns a plain calendar date, or `null` if the text is not a date. A time of day, if present, is ignored.

## Usage

```js
import { parseDateText, isDateText } from "./date-parser.js";

parseDateText("2026-11-10");               // { year: 2026, month: 11, day: 10, iso: "2026-11-10", format: "iso" }
parseDateText("2026/11/10").iso;           // "2026-11-10"
parseDateText("2026.1.5").iso;             // "2026-01-05"
parseDateText("20261110").iso;             // "2026-11-10"
parseDateText("2026年11月10日").iso;        // "2026-11-10"
parseDateText("２０２６年１１月１０日").iso;   // "2026-11-10" (full-width digits)

// Japanese era dates
parseDateText("令和8年11月10日").iso;       // "2026-11-10"
parseDateText("R8.11.10").iso;             // "2026-11-10"
parseDateText("平成元年1月8日").iso;        // "1989-01-08"
parseDateText("平成31年5月1日");            // null (that day is Reiwa 1)

// English
parseDateText("Nov 10, 2026").iso;         // "2026-11-10"
parseDateText("November 10th, 2026").iso;  // "2026-11-10"
parseDateText("Tue, 10 Nov 2026").iso;     // "2026-11-10"

// Year last: month/day/year by default
parseDateText("11/10/2026").iso;           // "2026-11-10"
parseDateText("03/04/2026").iso;           // "2026-03-04" (March 4th: month first)
parseDateText("03/04/2026", { order: "dmy" }).iso;   // "2026-04-03" (day first: 3 April)
parseDateText("25/12/2026").iso;           // "2026-12-25" (25 can only be a day)
parseDateText("11/10/26").iso;             // "2026-11-10" (two-digit year)

// A time is ignored
parseDateText("2026-11-10T23:30:00-05:00").iso;      // "2026-11-10" (the date as written)
parseDateText("2026-11-10 09:30").iso;               // "2026-11-10"

parseDateText("2026-02-30");               // null (no such day)
parseDateText("hello");                    // null
isDateText("2026-11-10");                  // true
```

## API

`parseDateText(text, options?)` returns `{ year, month, day, iso, format }`, or `null`. `isDateText(text, options?)` returns `true` or `false`.

| Option | Default | Description |
|--------|---------|-------------|
| `order` | `"mdy"` | For a year-last date where both of the first two numbers are 12 or below: `"mdy"` (month/day/year) or `"dmy"` (day/month/year) |
| `pivot` | `70` | Two-digit years below this are 20xx, from this up are 19xx (`26` → 2026, `85` → 1985) |

**Formats**

| Format name | Examples |
|-------------|----------|
| `iso` | `2026-11-10`, `2026/11/10`, `2026.1.5` |
| `compact` | `20261110` |
| `kanji` | `2026年11月10日` |
| `era` | `令和8年11月10日`, `令和元年5月1日`, `R8.11.10`, `H31/4/30`, `Reiwa 8-11-10` |
| `numeric` | `11/10/2026`, `10.11.2026`, `11-10-26` (year last) |
| `english` | `Nov 10, 2026`, `November 10th 2026`, `Tue, 10 Nov 2026`, `10-Nov-2026` |

- **Strict:** a date that does not exist (`2026-02-30`, `2026-13-01`) gives `null`. An era date must fall inside that era (`平成31年5月1日` is `null`; `昭和64年1月7日` works).
- **Ambiguous dates:** `03/04/2026` can mean March 4 or April 3. `order` decides, except when one number is above 12 (`25/12/2026` can only be 25 December). If your data comes from a known source, set `order` for it. If you cannot be sure, prefer ISO dates in your inputs.
- **Time is ignored:** text after the date such as `T09:30:00Z`, ` 09:30`, or `-05:00` is cut off. The date is taken as written, with **no time zone conversion**: `2026-11-10T23:30:00-05:00` is November 10 (it would be November 11 in UTC).
- Full-width digits and letters are accepted (`２０２６年１１月１０日`). Years run from 1000 to 9999.
- Not understood: dates without a year, month-year only (`Nov 2026`), relative words (`tomorrow`), week dates, Japanese numerals (`二〇二六年`), and `10th of November`. They give `null`.
- For era conversion in both directions, see `japanese-era`. This module has its own copy of the era table.
- Errors: `TypeError` if `text` is not a string (`isDateText` returns `false` instead). `RangeError` for an invalid `order` or `pivot`.

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

- Wikipedia. ISO 8601.. https://en.wikipedia.org/wiki/ISO_8601
- Wikipedia. Date format by country.. https://en.wikipedia.org/wiki/Date_format_by_country
- MDN Web Docs. Date.parse() and the date time string format. Mozilla.. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse#date_time_string_format
- Wikipedia. Japanese era name.. https://en.wikipedia.org/wiki/Japanese_era_name
