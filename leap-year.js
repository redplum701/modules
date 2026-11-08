/**
 * leap-year
 *
 * Author:      紅梅 (@redplum701)
 * Copyright:   © 2026 紅梅
 * License:     MIT
 * Created:     2026-11-09
 * Updated:     2026-11-09
 *
 * Description:
 *   Leap year check (Gregorian rules), days in a month, last day of a month,
 *   and days in a year.
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
 *   - Wikipedia. Leap year.
 *     https://en.wikipedia.org/wiki/Leap_year
 *   - Wikipedia. Gregorian calendar.
 *     https://en.wikipedia.org/wiki/Gregorian_calendar
 */

const DAYS_PER_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

function assertYear(year, fnName) {
  if (!Number.isInteger(year)) {
    throw new TypeError(`${fnName}: year must be an integer.`);
  }
}

/**
 * Checks whether a year is a leap year in the Gregorian calendar.
 * A year is a leap year if it is divisible by 4, except for century years,
 * which must be divisible by 400.
 *
 * @param {number} year - An integer year, e.g. 2028.
 * @returns {boolean}
 */
export function isLeapYear(year) {
  assertYear(year, "isLeapYear");
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * Returns the number of days in a month.
 *
 * @param {number} year - An integer year.
 * @param {number} month - Month from 1 (January) to 12 (December).
 * @returns {number} 28, 29, 30, or 31.
 * @throws {TypeError} If year is not an integer.
 * @throws {RangeError} If month is not an integer from 1 to 12.
 */
export function daysInMonth(year, month) {
  assertYear(year, "daysInMonth");
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new RangeError("daysInMonth: month must be an integer from 1 to 12.");
  }
  if (month === 2 && isLeapYear(year)) return 29;
  return DAYS_PER_MONTH[month - 1];
}

/**
 * Returns the last day of a month. Same value as daysInMonth().
 *
 * @param {number} year - An integer year.
 * @param {number} month - Month from 1 to 12.
 * @returns {number}
 */
export const lastDayOfMonth = daysInMonth;

/**
 * Returns the number of days in a year.
 *
 * @param {number} year - An integer year.
 * @returns {number} 365 or 366.
 */
export function daysInYear(year) {
  return isLeapYear(year) ? 366 : 365;
}
