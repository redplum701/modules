# leap-year

- **Author:** 紅梅 ([@redplum701](https://github.com/redplum701))
- **Copyright:** © 2026 紅梅
- **License:** MIT
- **Created:** 2026-11-09
- **Updated:** 2026-11-09

## Description

Leap year check using Gregorian rules, plus days in a month, the last day of a month, and days in a year.

## Usage

```js
import { isLeapYear, daysInMonth, lastDayOfMonth, daysInYear } from "./leap-year.js";

isLeapYear(2028);        // true
isLeapYear(1900);        // false (century year, not divisible by 400)
isLeapYear(2000);        // true

daysInMonth(2028, 2);    // 29
lastDayOfMonth(2027, 2); // 28
lastDayOfMonth(2026, 11);// 30
daysInYear(2028);        // 366
```

## API

| Function | Input | Output |
|----------|-------|--------|
| `isLeapYear(year)` | Integer year | `true` or `false` |
| `daysInMonth(year, month)` | Integer year, month 1–12 | `28`, `29`, `30`, or `31` |
| `lastDayOfMonth(year, month)` | Same as `daysInMonth` | Same as `daysInMonth` |
| `daysInYear(year)` | Integer year | `365` or `366` |

- Months are numbered 1–12 (not 0–11 like `Date`).
- The Gregorian rules are applied to every year, including years before 1582 (proleptic Gregorian calendar).
- Errors: `TypeError` if `year` is not an integer, `RangeError` if `month` is out of range.

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

- Wikipedia. Leap year.. https://en.wikipedia.org/wiki/Leap_year
- Wikipedia. Gregorian calendar.. https://en.wikipedia.org/wiki/Gregorian_calendar
