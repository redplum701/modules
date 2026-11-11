# date-diff

- **Author:** 紅梅 ([@redplum701](https://github.com/redplum701))
- **Copyright:** © 2026 紅梅
- **License:** MIT
- **Created:** 2026-11-09
- **Updated:** 2026-11-09

## Description

Counts the difference between two calendar dates correctly: exact days, whole months, and a years-months-days breakdown, plus day and month arithmetic. Months follow one clear rule (a month-end date moves to the last day of a shorter month). Everything works on plain calendar dates, so time zones and daylight saving never change a count.

## Usage

```js
import { daysBetween, dateDiff, monthsBetween, addMonths, addDays } from "./date-diff.js";

daysBetween("2026-01-01", "2026-12-31");        // 364
daysBetween("2026-11-10", "2026-11-01");        // -9

dateDiff("2000-01-01", "2026-11-10");
// { sign: 1, years: 26, months: 10, days: 9, totalMonths: 322, totalDays: 9810 }

// Month ends
dateDiff("2026-01-31", "2026-02-28");           // 0 years, 1 month, 0 days
dateDiff("2026-01-31", "2026-03-01");           // 0 years, 1 month, 1 day
dateDiff("2020-02-29", "2021-02-28");           // 1 year, 0 months, 0 days

monthsBetween("2026-01-15", "2026-11-14");      // 9  (not yet 10)
monthsBetween("2026-11-14", "2026-01-15");      // -9

addMonths("2026-01-31", 1).iso;                 // "2026-02-28"
addMonths("2026-03-31", -1).iso;                // "2026-02-28"
addDays("2026-02-28", 1).iso;                   // "2026-03-01"

// Age in years on a given day
dateDiff("1990-05-15", "2026-11-10").years;     // 36
```

## API

Dates are given as a `Date` (read in the local time zone), a `"YYYY-MM-DD"` string, or `{ year, month, day }`. Results are `{ year, month, day, iso }`. Years 1000 to 9999 are supported.

| Function | Result |
|----------|--------|
| `daysBetween(from, to)` | Exact days from `from` to `to` (negative if `to` is earlier) |
| `dateDiff(from, to)` | `{ sign, years, months, days, totalMonths, totalDays }` |
| `monthsBetween(from, to)` | Whole months (negative if `to` is earlier) |
| `addDays(date, days)` | The date `days` later (or earlier if negative) |
| `addMonths(date, months)` | The date `months` later, with the month-end rule |

**The month rule.** Adding months to a date keeps the day, unless the new month is too short, and then the date becomes that month's last day: `2026-01-31` + 1 month = `2026-02-28`. `dateDiff` starts from the earlier date and counts the most whole months that end on or before the later date, then counts the leftover days. That gives:

| From → To | Result |
|-----------|--------|
| 2026-01-31 → 2026-02-28 | 1 month, 0 days |
| 2026-01-31 → 2026-03-01 | 1 month, 1 day |
| 2026-01-31 → 2026-03-31 | 2 months, 0 days |
| 2020-02-29 → 2021-02-28 | 1 year, 0 months, 0 days |
| 2026-01-15 → 2026-11-14 | 9 months, 30 days |

- `years`, `months`, and `days` are never negative. `sign` tells the direction, and the numbers are the same in both directions.
- `months` is 0–11. `days` is 0–30 (the leftover after the whole months).
- Everything is based on whole calendar days, so daylight saving time and time zones cannot add or remove a day.
- **Compared with `java.time.Period.between`:** the two agree except at month ends. Java does not count `2026-01-31` → `2026-02-28` as a month (it reports 28 days), because the day number 28 is smaller than 31. This module does, because `2026-01-31` + 1 month is `2026-02-28`. Pick the rule that matches your business meaning, and note that this one makes month-end to month-end a whole number of months.
- **Legal age in Japan** counts differently: under the Act on Calculation of Age (年齢計算ニ関スル法律), a person is treated as reaching an age at the very end of the day before the birthday. This module counts calendar differences and does not apply that rule. If you need it, count from the day after the birth date.
- Errors: `TypeError` for unsupported date types. `RangeError` for invalid calendar dates, a non-integer `days` or `months`, or a result outside years 1000 to 9999.

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

- Oracle. java.time.Period.between (a similar library function; its month-end rule differs, see the README).. https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/time/Period.html
- ISO. ISO 8601: Date and time format.. https://en.wikipedia.org/wiki/ISO_8601
- MDN Web Docs. Date.UTC(). Mozilla.. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/UTC
