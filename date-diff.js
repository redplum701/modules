/**
 * date-diff
 *
 * Author:      紅梅 (@redplum701)
 * Copyright:   © 2026 紅梅
 * License:     MIT
 * Created:     2026-11-09
 * Updated:     2026-11-09
 *
 * Description:
 *   Counts the difference between two calendar dates correctly: exact days,
 *   whole months, and a years-months-days breakdown, plus month and day
 *   arithmetic. Months follow a clear rule (a month-end date moves to the last
 *   day of a shorter month), and everything works on plain dates, so time
 *   zones and daylight saving never change a count.
 *
 * ---------------------------------------------------------------------------
 * MIT License
 *
 * Copyright (c) 2026 紅梅
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * ---------------------------------------------------------------------------
 *
 * References:
 *   - Oracle. java.time.Period.between (a similar library function; its month-end rule differs, see the README).
 *     https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/time/Period.html
 *   - ISO. ISO 8601: Date and time format.
 *     https://en.wikipedia.org/wiki/ISO_8601
 *   - MDN Web Docs. Date.UTC(). Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/UTC
 */

const MS_PER_DAY = 86400000;
const MIN_YEAR = 1000;
const MAX_YEAR = 9999;

function pad(number, length) {
  return String(number).padStart(length, "0");
}

function daysInMonth(year, month) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate(); // day 0 of the next month = last day of this one
}

function checkCalendarDate(year, month, day, name) {
  const valid =
    Number.isInteger(year) && Number.isInteger(month) && Number.isInteger(day) &&
    year >= MIN_YEAR && year <= MAX_YEAR && month >= 1 && month <= 12 && day >= 1 && day <= daysInMonth(year, month);
  if (!valid) {
    throw new RangeError(`${name} is not a valid calendar date (years ${MIN_YEAR} to ${MAX_YEAR}).`);
  }
}

// Reads a date as plain { year, month, day }. A Date is read in the local time zone.
function parseDate(input, name) {
  let year, month, day;

  if (input instanceof Date) {
    if (Number.isNaN(input.getTime())) throw new RangeError(`${name} is an invalid Date.`);
    year = input.getFullYear();
    month = input.getMonth() + 1;
    day = input.getDate();
  } else if (typeof input === "string") {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input);
    if (!match) throw new RangeError(`${name} must look like "2026-11-30".`);
    [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  } else if (typeof input === "object" && input !== null) {
    ({ year, month, day } = input);
  } else {
    throw new TypeError(`${name} must be a Date, a "YYYY-MM-DD" string, or { year, month, day }.`);
  }

  checkCalendarDate(year, month, day, name);
  return { year, month, day };
}

// Whole days since 1970-01-01 (time zones and daylight saving cannot affect it).
function toEpochDay({ year, month, day }) {
  return Date.UTC(year, month - 1, day) / MS_PER_DAY;
}

function fromEpochDay(epochDay) {
  const date = new Date(epochDay * MS_PER_DAY);
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() };
}

function toResult({ year, month, day }) {
  if (year < MIN_YEAR || year > MAX_YEAR) {
    throw new RangeError(`The result is outside the supported years (${MIN_YEAR} to ${MAX_YEAR}).`);
  }
  return { year, month, day, iso: `${pad(year, 4)}-${pad(month, 2)}-${pad(day, 2)}` };
}

const MAX_MONTH_SHIFT = 120000; // 10,000 years

// Moves a date by whole months. If the day does not exist in the new month,
// it becomes that month's last day (January 31 + 1 month = February 28 or 29).
// The result is not range-checked here.
function shiftMonths({ year, month, day }, count) {
  const index = year * 12 + (month - 1) + count;
  const newYear = Math.floor(index / 12);
  const newMonth = (index % 12) + 1;
  return { year: newYear, month: newMonth, day: Math.min(day, daysInMonth(newYear, newMonth)) };
}

function compare(a, b) {
  return a.year - b.year || a.month - b.month || a.day - b.day;
}

/**
 * Counts the days from one date to another.
 *
 * @param {Date|string|{year: number, month: number, day: number}} from - The start date.
 * @param {Date|string|{year: number, month: number, day: number}} to - The end date.
 * @returns {number} to minus from, in whole days. Negative if `to` is earlier.
 * @throws {TypeError} If a date has an unsupported type.
 * @throws {RangeError} If a date is not a valid calendar date (years 1000 to 9999).
 */
export function daysBetween(from, to) {
  return toEpochDay(parseDate(to, "to")) - toEpochDay(parseDate(from, "from"));
}

/**
 * Adds days to a date.
 *
 * @param {Date|string|{year: number, month: number, day: number}} date - The date.
 * @param {number} days - Whole days to add (negative to go back).
 * @returns {{year: number, month: number, day: number, iso: string}}
 * @throws {TypeError} If the date has an unsupported type.
 * @throws {RangeError} If days is not a safe integer, or the date or result is out of range.
 */
export function addDays(date, days) {
  if (!Number.isSafeInteger(days)) {
    throw new RangeError("days must be a safe integer.");
  }
  return toResult(fromEpochDay(toEpochDay(parseDate(date, "date")) + days));
}

/**
 * Adds months to a date. A day that does not exist in the new month becomes
 * that month's last day: January 31 + 1 month is February 28 (or 29).
 *
 * @param {Date|string|{year: number, month: number, day: number}} date - The date.
 * @param {number} months - Whole months to add (negative to go back).
 * @returns {{year: number, month: number, day: number, iso: string}}
 * @throws {TypeError} If the date has an unsupported type.
 * @throws {RangeError} If months is not an integer within 120,000, or the date or result is out of range.
 */
export function addMonths(date, months) {
  if (!Number.isInteger(months) || Math.abs(months) > MAX_MONTH_SHIFT) {
    throw new RangeError(`months must be an integer between -${MAX_MONTH_SHIFT} and ${MAX_MONTH_SHIFT}.`);
  }
  return toResult(shiftMonths(parseDate(date, "date"), months));
}

/**
 * Breaks the difference between two dates into years, months, and days.
 *
 * The rule: starting from the earlier date, count the most whole months that
 * still end on or before the later date (using the month-end rule of
 * addMonths), then count the days left over. The result is the same in
 * both directions; `sign` says which date is later.
 *
 * Examples: 2026-01-31 to 2026-02-28 is 1 month 0 days.
 * 2026-01-31 to 2026-03-01 is 1 month 1 day. 2020-02-29 to 2021-02-28 is 1 year.
 *
 * @param {Date|string|{year: number, month: number, day: number}} from - The start date.
 * @param {Date|string|{year: number, month: number, day: number}} to - The end date.
 * @returns {{sign: number, years: number, months: number, days: number,
 *   totalMonths: number, totalDays: number}}
 *   sign: 1 if `to` is after `from`, -1 if before, 0 if the same.
 *   years, months (0 to 11), days: the breakdown, never negative.
 *   totalMonths: the whole months (years x 12 + months). totalDays: the exact days.
 * @throws {TypeError} If a date has an unsupported type.
 * @throws {RangeError} If a date is not a valid calendar date (years 1000 to 9999).
 */
export function dateDiff(from, to) {
  const a = parseDate(from, "from");
  const b = parseDate(to, "to");
  const sign = Math.sign(compare(b, a));
  const [earlier, later] = sign >= 0 ? [a, b] : [b, a];

  // Start with the difference in calendar months, and step back if that
  // overshoots because the later date's day is smaller.
  let months = (later.year - earlier.year) * 12 + (later.month - earlier.month);
  if (compare(shiftMonths(earlier, months), later) > 0) months -= 1;

  const days = toEpochDay(later) - toEpochDay(shiftMonths(earlier, months));
  return {
    sign,
    years: Math.floor(months / 12),
    months: months % 12,
    days,
    totalMonths: months,
    totalDays: toEpochDay(later) - toEpochDay(earlier),
  };
}

/**
 * Counts the whole months from one date to another (see dateDiff for the rule).
 *
 * @param {Date|string|{year: number, month: number, day: number}} from - The start date.
 * @param {Date|string|{year: number, month: number, day: number}} to - The end date.
 * @returns {number} Whole months. Negative if `to` is earlier.
 * @throws {TypeError} If a date has an unsupported type.
 * @throws {RangeError} If a date is not a valid calendar date (years 1000 to 9999).
 */
export function monthsBetween(from, to) {
  const { sign, totalMonths } = dateDiff(from, to);
  return sign * totalMonths || 0; // avoid -0
}
