# closing-date

- **Author:** 紅梅 ([@redplum701](https://github.com/redplum701))
- **Copyright:** © 2026 紅梅
- **License:** MIT
- **Created:** 2026-11-09
- **Updated:** 2026-11-09

## Description

Closing-date (*shimebi*, 締め日) calculations for invoicing. It finds which closing date a transaction belongs to ("end of month", "the 20th"), the billing period around it, and the payment date ("closes at month end, paid at the end of next month"). Payment dates that fall on a weekend or holiday can be moved to the next or previous business day. Dates are handled as plain calendar dates, so time zones never shift the result.

## Usage

```js
import { closingDate, billingPeriod, paymentDate } from "./closing-date.js";

// 月末締め
closingDate("2026-11-10", "end").iso;        // "2026-11-30"
closingDate("2026-02-15", "end").iso;        // "2026-02-28"

// 20日締め
closingDate("2026-11-20", 20).iso;           // "2026-11-20" (the closing day itself is included)
closingDate("2026-11-21", 20).iso;           // "2026-12-20"
closingDate("2026-12-21", 20).iso;           // "2027-01-20"

// 31日締め is the same as month end, in every month
closingDate("2026-11-01", 31).iso;           // "2026-11-30"

billingPeriod("2026-11-25", 20);
// { start: { iso: "2026-11-21", ... }, end: { iso: "2026-12-20", ... } }

// 月末締め 翌月末払い
paymentDate("2026-11-10", "end").iso;        // "2026-12-31"

// 20日締め 翌月10日払い
paymentDate("2026-11-21", 20, { paymentDay: 10 }).iso;   // "2027-01-10"

// 月末締め 翌々月15日払い
paymentDate("2026-11-10", "end", { monthsLater: 2, paymentDay: 15 }).iso; // "2027-01-15"

// Move a payment that falls on a weekend or holiday
paymentDate("2026-10-10", "end", { paymentDay: 15, adjust: "next" });
// 2026-11-15 is a Sunday: { iso: "2026-11-16", adjusted: true, ... }
paymentDate("2026-10-10", "end", { paymentDay: 15, adjust: "previous" }).iso; // "2026-11-13"
paymentDate("2026-10-10", "end", { paymentDay: 24, adjust: "next", holidays: ["2026-11-24"] }).iso; // "2026-11-25"
```

## API

All functions take a date as a `Date` (read in the local time zone), a `"YYYY-MM-DD"` string, or `{ year, month, day }`. Results are `{ year, month, day, iso }`.

| Function | Result |
|----------|--------|
| `closingDate(date, closingDay)` | The first closing date on or after `date` |
| `billingPeriod(date, closingDay)` | `{ start, end }`: the day after the previous closing date, through the closing date |
| `paymentDate(date, closingDay, options?)` | The payment date, with an extra `adjusted` field |

`closingDay` is `1`–`31` or `"end"` (month end). A day past the end of a short month means that month's last day, so `31` and `"end"` are the same, and `30` in February is the 28th or 29th.

| Option (`paymentDate`) | Default | Description |
|------------------------|---------|-------------|
| `monthsLater` | `1` | Months after the closing month (`0` = same month, `2` = the month after next) |
| `paymentDay` | `"end"` | `1`–`31` or `"end"`, with the same rule for short months |
| `adjust` | `"none"` | `"next"` or `"previous"`: move a payment on a Saturday, Sunday, or holiday to the next or previous business day (it can cross into another month) |
| `holidays` | — | Dates to treat as non-business days (any accepted form). Weekends always count |

- A transaction **on** the closing day belongs to that closing (`closingDate("2026-11-20", 20)` is November 20).
- Everything works on calendar dates (year, month, day), never on times of day, so time zones and daylight saving cannot move a result.
- Years 1000 to 9999 are supported.
- There is no built-in holiday list. Japanese public holidays change, so pass your own list. For general business-day arithmetic, see the planned `business-days` module.
- Errors: `TypeError` for unsupported types. `RangeError` for invalid calendar dates (`"2026-02-30"`), an invalid `closingDay`, `paymentDay`, `monthsLater`, or `adjust`, or a result outside the supported years.

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

- ISO. ISO 8601: Date and time format (calendar dates, YYYY-MM-DD).. https://en.wikipedia.org/wiki/ISO_8601
- Wikipedia. Invoice.. https://en.wikipedia.org/wiki/Invoice
- MDN Web Docs. Date.UTC(). Mozilla.. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/UTC
