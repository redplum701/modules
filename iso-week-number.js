/**
 * iso-week-number
 *
 * Author:      紅梅 (@redplum701)
 * Copyright:   © 2026 紅梅
 * License:     MIT
 * Created:     2026-11-09
 * Updated:     2026-11-09
 *
 * Description:
 *   ISO 8601 week dates: the week number and week-year of a date, the number
 *   of weeks in a year (52 or 53), conversion from a week date back to a
 *   calendar date, and parsing of strings such as "2026-W46-2". Weeks start on
 *   Monday, and week 1 is the week with the year's first Thursday.
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
 *   - Wikipedia. ISO week date.
 *     https://en.wikipedia.org/wiki/ISO_week_date
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

// Monday = 1 ... Sunday = 7 (JavaScript's getUTCDay() has Sunday = 0).
function isoWeekday(epochDay) {
  return ((new Date(epochDay * MS_PER_DAY).getUTCDay() + 6) % 7) + 1;
}

// The week-year and week number, worked out with the "Thursday rule":
// a week belongs to the year that holds its Thursday.
function weekOfEpochDay(epochDay) {
  const weekday = isoWeekday(epochDay);
  const thursday = epochDay + (4 - weekday);
  const year = new Date(thursday * MS_PER_DAY).getUTCFullYear();
  const dayOfYear = thursday - Date.UTC(year, 0, 1) / MS_PER_DAY + 1;
  return { year, week: Math.floor((dayOfYear - 1) / 7) + 1, weekday };
}

function checkWeekYear(year) {
  if (!Number.isInteger(year) || year < MIN_YEAR || year > MAX_YEAR) {
    throw new RangeError(`year must be an integer from ${MIN_YEAR} to ${MAX_YEAR}.`);
  }
}

function weeksIn(year) {
  // December 28 is always in the last week of its ISO year.
  return weekOfEpochDay(Date.UTC(year, 11, 28) / MS_PER_DAY).week;
}

/**
 * Formats a week date as "2026-W46" (or "2026-W46-2" with a weekday).
 *
 * @param {number} year - The ISO week-year.
 * @param {number} week - The week number.
 * @param {number} [weekday] - 1 (Monday) to 7 (Sunday). Left out of the text if omitted.
 * @returns {string}
 */
export function formatIsoWeek(year, week, weekday) {
  const base = `${pad(year, 4)}-W${pad(week, 2)}`;
  return weekday === undefined ? base : `${base}-${weekday}`;
}

/**
 * Finds the ISO week of a date.
 *
 * The week-year can differ from the calendar year near New Year: 2026-01-01
 * is in week 1 of 2026, but 2021-01-03 is in week 53 of 2020.
 *
 * @param {Date|string|{year: number, month: number, day: number}} date - The
 *   date, as a Date (read in local time), "YYYY-MM-DD", or { year, month, day }.
 * @returns {{year: number, week: number, weekday: number, label: string}}
 *   year: the ISO week-year. week: 1 to 53. weekday: 1 (Monday) to 7 (Sunday).
 *   label: like "2026-W46".
 * @throws {TypeError} If date has an unsupported type.
 * @throws {RangeError} If date is not a valid calendar date (years 1000 to 9999).
 */
export function isoWeek(date) {
  const { year, week, weekday } = weekOfEpochDay(toEpochDay(parseDate(date, "date")));
  return { year, week, weekday, label: formatIsoWeek(year, week) };
}

/**
 * Tells how many weeks an ISO week-year has: 52 or 53. A year has 53 weeks
 * if January 1 is a Thursday, or a Wednesday in a leap year.
 *
 * @param {number} year - The ISO week-year (1000 to 9999).
 * @returns {number} 52 or 53.
 * @throws {RangeError} If year is not an integer from 1000 to 9999.
 */
export function weeksInIsoYear(year) {
  checkWeekYear(year);
  return weeksIn(year);
}

/**
 * Finds the calendar date of a week date (the opposite of isoWeek).
 *
 * @param {number} year - The ISO week-year (1000 to 9999).
 * @param {number} week - 1 to 52 or 53 (see weeksInIsoYear).
 * @param {number} [weekday=1] - 1 (Monday) to 7 (Sunday).
 * @returns {{year: number, month: number, day: number, iso: string}}
 * @throws {RangeError} If an argument is out of range, or the result is outside years 1000 to 9999.
 */
export function isoWeekToDate(year, week, weekday = 1) {
  checkWeekYear(year);
  if (!Number.isInteger(week) || week < 1 || week > weeksIn(year)) {
    throw new RangeError(`week must be an integer from 1 to ${weeksIn(year)} for ${year}.`);
  }
  if (!Number.isInteger(weekday) || weekday < 1 || weekday > 7) {
    throw new RangeError("weekday must be an integer from 1 (Monday) to 7 (Sunday).");
  }

  // January 4 is always in week 1. Go back to that week's Monday, then forward.
  const january4 = Date.UTC(year, 0, 4) / MS_PER_DAY;
  const week1Monday = january4 - (isoWeekday(january4) - 1);
  return toResult(fromEpochDay(week1Monday + (week - 1) * 7 + (weekday - 1)));
}

/**
 * Reads a week date written as "2026-W46", "2026-W46-2", "2026W46", or
 * "2026W462" (the "W" can be lowercase).
 *
 * @param {string} text - The week date.
 * @returns {{year: number, week: number, weekday: number|null} | null}
 *   weekday is null when the text has none. null if the text is not a valid week date
 *   (including a week that the year does not have, such as 2025-W53).
 * @throws {TypeError} If text is not a string.
 */
export function parseIsoWeek(text) {
  if (typeof text !== "string") {
    throw new TypeError("parseIsoWeek: expected a string.");
  }
  const match = /^(\d{4})(-?)[Ww](\d{2})(?:\2([1-7]))?$/.exec(text);
  if (!match) return null;

  const year = Number(match[1]);
  const week = Number(match[3]);
  if (year < MIN_YEAR || year > MAX_YEAR || week < 1 || week > weeksIn(year)) return null;
  return { year, week, weekday: match[4] === undefined ? null : Number(match[4]) };
}
