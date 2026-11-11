# iso-week-number

- **Author:** 紅梅 ([@redplum701](https://github.com/redplum701))
- **Copyright:** © 2026 紅梅
- **License:** MIT
- **Created:** 2026-11-09
- **Updated:** 2026-11-09

## Description

ISO 8601 week dates: the week number and week-year of a date, the number of weeks in a year (52 or 53), conversion from a week date back to a calendar date, and parsing of strings such as `"2026-W46-2"`. Weeks start on Monday, and week 1 is the week that contains the year's first Thursday.

## Usage

```js
import { isoWeek, weeksInIsoYear, isoWeekToDate, parseIsoWeek, formatIsoWeek } from "./iso-week-number.js";

isoWeek("2026-11-10");
// { year: 2026, week: 46, weekday: 2, label: "2026-W46" }   (Tuesday)

// Near New Year the week-year can differ from the calendar year
isoWeek("2025-12-29").label;     // "2026-W01"
isoWeek("2021-01-03").label;     // "2020-W53"

isoWeek(new Date());             // a Date works too (local time)

weeksInIsoYear(2026);            // 53
weeksInIsoYear(2027);            // 52

isoWeekToDate(2026, 46, 2).iso;  // "2026-11-10"
isoWeekToDate(2026, 1).iso;      // "2025-12-29" (the Monday of week 1)

parseIsoWeek("2026-W46-2");      // { year: 2026, week: 46, weekday: 2 }
parseIsoWeek("2026W46");         // { year: 2026, week: 46, weekday: null }
parseIsoWeek("2025-W53");        // null (2025 has only 52 weeks)

formatIsoWeek(2026, 46, 2);      // "2026-W46-2"
```

## API

Dates are given as a `Date` (read in the local time zone), a `"YYYY-MM-DD"` string, or `{ year, month, day }`. Years 1000 to 9999 are supported.

| Function | Result |
|----------|--------|
| `isoWeek(date)` | `{ year, week, weekday, label }`: the ISO week-year, week 1–53, weekday 1 (Mon) – 7 (Sun), and a label like `"2026-W46"` |
| `weeksInIsoYear(year)` | `52` or `53` |
| `isoWeekToDate(year, week, weekday = 1)` | `{ year, month, day, iso }` of that day |
| `parseIsoWeek(text)` | `{ year, week, weekday }` (`weekday` is `null` if absent), or `null` if the text is not a valid week date |
| `formatIsoWeek(year, week, weekday?)` | `"2026-W46"` or `"2026-W46-2"` |

**The rules (ISO 8601)**
- Weeks run Monday to Sunday.
- Week 1 is the week that contains the year's first Thursday, which is the same as the week that contains January 4.
- A week belongs to the year that holds its **Thursday**. So the first days of January can be in week 52 or 53 of the previous year, and the last days of December can be in week 1 of the next.
- A year has 53 weeks if January 1 is a Thursday, or a Wednesday in a leap year. Otherwise it has 52. For example, 2020, 2026, and 2032 have 53 weeks.

**Notes**
- This is not the same as the US-style week number (weeks start on Sunday, week 1 contains January 1) or Japan's common calendar-week habits. If you need those, count them separately.
- `parseIsoWeek` accepts the extended form (`2026-W46-2`) and the basic form (`2026W462`), but not a mix of the two.
- `isoWeekToDate` can throw `RangeError` at the very edges (a result outside years 1000 to 9999).
- Errors: `TypeError` for unsupported date types. `RangeError` for invalid calendar dates, or arguments out of range.

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

- Wikipedia. ISO week date.. https://en.wikipedia.org/wiki/ISO_week_date
- ISO. ISO 8601: Date and time format.. https://en.wikipedia.org/wiki/ISO_8601
- MDN Web Docs. Date.UTC(). Mozilla.. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/UTC
