/**
 * closing-date
 *
 * Author:      紅梅 (@redplum701)
 * Copyright:   © 2026 紅梅
 * License:     MIT
 * Created:     2026-11-09
 * Updated:     2026-11-09
 *
 * Description:
 *   Closing-date (shimebi) calculations for invoicing: which closing date a
 *   transaction belongs to ("end of month", "the 20th"), the billing period
 *   around it, and the payment date ("closes at month end, paid at the end of
 *   next month"), with optional moving of payment dates that fall on a weekend
 *   or holiday. Works with plain calendar dates, so time zones never shift the
 *   result.
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
 *   - ISO. ISO 8601: Date and time format (calendar dates, YYYY-MM-DD).
 *     https://en.wikipedia.org/wiki/ISO_8601
 *   - Wikipedia. Invoice.
 *     https://en.wikipedia.org/wiki/Invoice
 *   - MDN Web Docs. Date.UTC(). Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/UTC
 */

const MS_PER_DAY = 86400000;
const MIN_YEAR = 1000;
const MAX_YEAR = 9999;
const ADJUSTMENTS = ["none", "next", "previous"];

function daysInMonth(year, month) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate(); // day 0 of the next month = last day of this one
}

function pad(number, length) {
  return String(number).padStart(length, "0");
}

function toResult(year, month, day) {
  if (year < MIN_YEAR || year > MAX_YEAR) {
    throw new RangeError(`The result is outside the supported years (${MIN_YEAR} to ${MAX_YEAR}).`);
  }
  return { year, month, day, iso: `${pad(year, 4)}-${pad(month, 2)}-${pad(day, 2)}` };
}

function checkCalendarDate(year, month, day, source) {
  const valid =
    Number.isInteger(year) && Number.isInteger(month) && Number.isInteger(day) &&
    year >= MIN_YEAR && year <= MAX_YEAR && month >= 1 && month <= 12 && day >= 1 && day <= daysInMonth(year, month);
  if (!valid) {
    throw new RangeError(`${source} is not a valid calendar date (years ${MIN_YEAR} to ${MAX_YEAR}).`);
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

function checkDay(value, name) {
  if (value !== "end" && !(Number.isInteger(value) && value >= 1 && value <= 31)) {
    throw new RangeError(`${name} must be an integer from 1 to 31, or "end".`);
  }
}

// The real day for a closing or payment day in a given month: "end" and days
// past the end of the month (such as 31 in November) mean the last day.
function effectiveDay(year, month, day) {
  const last = daysInMonth(year, month);
  return day === "end" ? last : Math.min(day, last);
}

function addMonths(year, month, count) {
  const index = month - 1 + count;
  return { year: year + Math.floor(index / 12), month: (((index % 12) + 12) % 12) + 1 };
}

function addDays({ year, month, day }, count) {
  const date = new Date(Date.UTC(year, month - 1, day) + count * MS_PER_DAY);
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() };
}

/**
 * Finds the closing date that a date belongs to: the first closing date on or
 * after it.
 *
 * "Closing day" 31 (or "end") means the last day of every month. Any day
 * past the end of a short month also means its last day (30 in February).
 *
 * @param {Date|string|{year: number, month: number, day: number}} date - The
 *   date, as a Date (read in local time), "YYYY-MM-DD", or { year, month, day }.
 * @param {number|"end"} closingDay - 1 to 31, or "end" for month end.
 * @returns {{year: number, month: number, day: number, iso: string}}
 * @throws {TypeError} If date has an unsupported type.
 * @throws {RangeError} If date is not a valid calendar date, closingDay is
 *   invalid, or the result is outside years 1000 to 9999.
 */
export function closingDate(date, closingDay) {
  const { year, month, day } = parseDate(date, "date");
  checkDay(closingDay, "closingDay");

  const thisMonth = effectiveDay(year, month, closingDay);
  if (day <= thisMonth) return toResult(year, month, thisMonth);

  const next = addMonths(year, month, 1);
  return toResult(next.year, next.month, effectiveDay(next.year, next.month, closingDay));
}

/**
 * Finds the billing period a date belongs to: from the day after the
 * previous closing date through the closing date.
 *
 * @param {Date|string|{year: number, month: number, day: number}} date - The date.
 * @param {number|"end"} closingDay - 1 to 31, or "end".
 * @returns {{start: object, end: object}} Both are { year, month, day, iso }.
 * @throws {TypeError} If date has an unsupported type.
 * @throws {RangeError} If date or closingDay is invalid, or the result is out of range.
 */
export function billingPeriod(date, closingDay) {
  const end = closingDate(date, closingDay);
  const before = addMonths(end.year, end.month, -1);
  const previousClosing = { ...before, day: effectiveDay(before.year, before.month, closingDay) };
  const start = addDays(previousClosing, 1);
  return { start: toResult(start.year, start.month, start.day), end };
}

function normalizeHolidays(holidays) {
  if (holidays === undefined) return new Set();
  if (holidays === null || typeof holidays[Symbol.iterator] !== "function" || typeof holidays === "string") {
    throw new TypeError("holidays must be an array or other iterable of dates.");
  }
  return new Set([...holidays].map((holiday) => {
    const { year, month, day } = parseDate(holiday, "a holiday");
    return `${pad(year, 4)}-${pad(month, 2)}-${pad(day, 2)}`;
  }));
}

function isBusinessDay({ year, month, day }, holidays) {
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay(); // 0 = Sunday, 6 = Saturday
  if (weekday === 0 || weekday === 6) return false;
  return !holidays.has(`${pad(year, 4)}-${pad(month, 2)}-${pad(day, 2)}`);
}

/**
 * Finds the payment date for a transaction.
 *
 * Example: "closes at month end, paid at the end of next month" is
 * closingDay "end", monthsLater 1, paymentDay "end" (the defaults for the last
 * two). "Closes on the 20th, paid on the 10th of next month" is
 * closingDay 20, paymentDay 10.
 *
 * @param {Date|string|{year: number, month: number, day: number}} date - The transaction date.
 * @param {number|"end"} closingDay - 1 to 31, or "end".
 * @param {object} [options]
 * @param {number} [options.monthsLater=1] - Months after the closing month (0 or more).
 * @param {number|"end"} [options.paymentDay="end"] - Day of that month: 1 to 31 or "end".
 *   A day past the end of a short month means its last day.
 * @param {"none"|"next"|"previous"} [options.adjust="none"] - What to do when the
 *   payment date is a Saturday, Sunday, or holiday: "none" keeps it, "next" moves to the
 *   next business day, "previous" to the previous one.
 * @param {Iterable} [options.holidays] - Holidays (dates in any accepted form).
 *   Weekends are always treated as non-business days when adjusting.
 * @returns {{year: number, month: number, day: number, iso: string, adjusted: boolean}}
 *   adjusted: true if the date was moved.
 * @throws {TypeError} If an argument has an unsupported type.
 * @throws {RangeError} If an argument is invalid, no business day is found
 *   within 31 days, or the result is outside years 1000 to 9999.
 */
export function paymentDate(date, closingDay, options = {}) {
  const { monthsLater = 1, paymentDay = "end", adjust = "none", holidays } = options;
  if (!Number.isInteger(monthsLater) || monthsLater < 0 || monthsLater > 1200) {
    throw new RangeError("monthsLater must be an integer from 0 to 1200.");
  }
  checkDay(paymentDay, "paymentDay");
  if (!ADJUSTMENTS.includes(adjust)) {
    throw new RangeError(`adjust must be one of ${ADJUSTMENTS.join(", ")}.`);
  }
  const holidaySet = normalizeHolidays(holidays);

  const closing = closingDate(date, closingDay);
  const target = addMonths(closing.year, closing.month, monthsLater);
  let payment = { ...target, day: effectiveDay(target.year, target.month, paymentDay) };
  const original = payment;

  if (adjust !== "none") {
    const step = adjust === "next" ? 1 : -1;
    let tries = 0;
    while (!isBusinessDay(payment, holidaySet)) {
      payment = addDays(payment, step);
      tries += 1;
      if (tries > 31) throw new RangeError("No business day found within 31 days.");
    }
  }

  return { ...toResult(payment.year, payment.month, payment.day), adjusted: payment !== original };
}
