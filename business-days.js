/**
 * business-days
 *
 * Author:      紅梅 (@redplum701)
 * Copyright:   © 2026 紅梅
 * License:     MIT
 * Created:     2026-11-09
 * Updated:     2026-11-09
 *
 * Description:
 *   Business day arithmetic: is a date a business day, the next and previous
 *   business day, adding or subtracting business days, and counting business
 *   days between two dates. Weekends are configurable (Saturday and Sunday by
 *   default), and holidays come from a list or a function that you provide.
 *   Works with plain calendar dates, so time zones never change a result.
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
 *   - Wikipedia. Business day.
 *     https://en.wikipedia.org/wiki/Business_day
 *   - Cabinet Office, Japan. 国民の祝日について (National holidays).
 *     https://www8.cao.go.jp/chosei/shukujitsu/gaiyou.html
 *   - Cabinet Office, Japan. 国民の祝日 CSV (holidays from 1955 to next year, updated yearly).
 *     https://www8.cao.go.jp/chosei/shukujitsu/syukujitsu.csv
 *   - ISO. ISO 8601: Date and time format.
 *     https://en.wikipedia.org/wiki/ISO_8601
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

const MAX_COUNT = 100000; // business days that addBusinessDays will move
const MAX_SPAN = 200000; // days that businessDaysBetween will walk through

// JavaScript's weekday numbers: 0 = Sunday, 1 = Monday ... 6 = Saturday.
// 1970-01-01 (epoch day 0) was a Thursday.
function weekdayOf(epochDay) {
  return (((epochDay % 7) + 7 + 4) % 7);
}

function readSettings(options, fnName) {
  const { holidays, isHoliday, weekend = [0, 6] } = options;

  if (!Array.isArray(weekend) || weekend.length > 6 || !weekend.every((d) => Number.isInteger(d) && d >= 0 && d <= 6) ||
      new Set(weekend).size !== weekend.length) {
    throw new RangeError(`${fnName}: weekend must be an array of up to 6 different weekday numbers (0 = Sunday ... 6 = Saturday).`);
  }
  if (isHoliday !== undefined && typeof isHoliday !== "function") {
    throw new TypeError(`${fnName}: isHoliday must be a function.`);
  }

  const holidayDays = new Set();
  if (holidays !== undefined) {
    if (holidays === null || typeof holidays === "string" || typeof holidays[Symbol.iterator] !== "function") {
      throw new TypeError(`${fnName}: holidays must be an array or other iterable of dates.`);
    }
    for (const holiday of holidays) holidayDays.add(toEpochDay(parseDate(holiday, "a holiday")));
  }
  return { weekend: new Set(weekend), holidayDays, isHoliday };
}

function isBusinessEpochDay(epochDay, settings) {
  const weekday = weekdayOf(epochDay);
  if (settings.weekend.has(weekday)) return false;
  if (settings.holidayDays.has(epochDay)) return false;
  if (settings.isHoliday) {
    const date = toResult(fromEpochDay(epochDay));
    if (settings.isHoliday({ ...date, weekday })) return false;
  }
  return true;
}

/**
 * Tells whether a date is a business day: not on a weekend, and not a holiday.
 *
 * @param {Date|string|{year: number, month: number, day: number}} date - The date, as a Date
 *   (read in local time), "YYYY-MM-DD", or { year, month, day }.
 * @param {object} [options]
 * @param {Iterable} [options.holidays] - Holiday dates (any accepted form).
 * @param {(date: {year: number, month: number, day: number, iso: string, weekday: number}) => boolean} [options.isHoliday]
 *   A function that says whether a date is a holiday. Used together with `holidays`.
 * @param {number[]} [options.weekend=[0, 6]] - The weekend days: 0 = Sunday ... 6 = Saturday.
 * @returns {boolean}
 * @throws {TypeError} If an argument has an unsupported type.
 * @throws {RangeError} If a date is not a valid calendar date (years 1000 to 9999), or weekend is invalid.
 */
export function isBusinessDay(date, options = {}) {
  const settings = readSettings(options, "isBusinessDay");
  return isBusinessEpochDay(toEpochDay(parseDate(date, "date")), settings);
}

/**
 * Moves a date forward or backward by a number of business days. Zero returns
 * the same date, even if it is not a business day. Moving by n always lands on a
 * business day (for n other than 0).
 *
 * @param {Date|string|{year: number, month: number, day: number}} date - The start date.
 * @param {number} count - Business days to move: positive for later, negative for earlier (at most 100,000).
 * @param {object} [options] - holidays, isHoliday, weekend (see isBusinessDay).
 * @returns {{year: number, month: number, day: number, iso: string}}
 * @throws {TypeError} If an argument has an unsupported type.
 * @throws {RangeError} If count is not an integer within 100,000, a date is invalid, no business day can be
 *   found, or the result is outside years 1000 to 9999.
 */
export function addBusinessDays(date, count, options = {}) {
  const settings = readSettings(options, "addBusinessDays");
  if (!Number.isInteger(count) || Math.abs(count) > MAX_COUNT) {
    throw new RangeError(`addBusinessDays: count must be an integer, at most ${MAX_COUNT} in size.`);
  }

  let current = toEpochDay(parseDate(date, "date"));
  const step = count < 0 ? -1 : 1;
  let remaining = Math.abs(count);
  let walked = 0;
  const limit = remaining * 10 + 3700; // far more than a sensible calendar needs

  while (remaining > 0) {
    current += step;
    walked += 1;
    if (walked > limit) throw new RangeError("addBusinessDays: no business days could be found (are all days holidays?).");
    if (isBusinessEpochDay(current, settings)) remaining -= 1;
  }
  return toResult(fromEpochDay(current));
}

/**
 * The first business day after a date.
 *
 * @param {Date|string|{year: number, month: number, day: number}} date - The date.
 * @param {object} [options] - holidays, isHoliday, weekend (see isBusinessDay).
 * @returns {{year: number, month: number, day: number, iso: string}}
 * @throws {TypeError} If an argument has an unsupported type.
 * @throws {RangeError} If the date is invalid or the result is out of range.
 */
export function nextBusinessDay(date, options = {}) {
  return addBusinessDays(date, 1, options);
}

/**
 * The last business day before a date.
 *
 * @param {Date|string|{year: number, month: number, day: number}} date - The date.
 * @param {object} [options] - holidays, isHoliday, weekend (see isBusinessDay).
 * @returns {{year: number, month: number, day: number, iso: string}}
 * @throws {TypeError} If an argument has an unsupported type.
 * @throws {RangeError} If the date is invalid or the result is out of range.
 */
export function previousBusinessDay(date, options = {}) {
  return addBusinessDays(date, -1, options);
}

/**
 * Returns the date itself if it is a business day; otherwise the closest business
 * day in the chosen direction.
 *
 * @param {Date|string|{year: number, month: number, day: number}} date - The date.
 * @param {"next"|"previous"} [direction="next"] - Which way to move when the date is not a business day.
 * @param {object} [options] - holidays, isHoliday, weekend (see isBusinessDay).
 * @returns {{year: number, month: number, day: number, iso: string}}
 * @throws {TypeError} If an argument has an unsupported type.
 * @throws {RangeError} If direction is unknown, the date is invalid, or the result is out of range.
 */
export function adjustToBusinessDay(date, direction = "next", options = {}) {
  if (direction !== "next" && direction !== "previous") {
    throw new RangeError('adjustToBusinessDay: direction must be "next" or "previous".');
  }
  const settings = readSettings(options, "adjustToBusinessDay");
  const parsed = parseDate(date, "date");
  if (isBusinessEpochDay(toEpochDay(parsed), settings)) return toResult(parsed);
  return addBusinessDays(parsed, direction === "next" ? 1 : -1, options);
}

/**
 * Counts the business days after `from` up to and including `to`. The start
 * day itself is not counted. So addBusinessDays(from, n) lands on a date `d`
 * for which businessDaysBetween(from, d) is n.
 *
 * If `to` is before `from`, the count is negative: minus the business days after `to` up to
 * and including `from`.
 *
 * @param {Date|string|{year: number, month: number, day: number}} from - The start date.
 * @param {Date|string|{year: number, month: number, day: number}} to - The end date.
 * @param {object} [options] - holidays, isHoliday, weekend (see isBusinessDay).
 * @returns {number}
 * @throws {TypeError} If an argument has an unsupported type.
 * @throws {RangeError} If a date is invalid, or the dates are more than 200,000 days apart.
 */
export function businessDaysBetween(from, to, options = {}) {
  const settings = readSettings(options, "businessDaysBetween");
  const start = toEpochDay(parseDate(from, "from"));
  const end = toEpochDay(parseDate(to, "to"));
  if (Math.abs(end - start) > MAX_SPAN) {
    throw new RangeError(`businessDaysBetween: the dates must be at most ${MAX_SPAN} days apart.`);
  }

  const [low, high] = start <= end ? [start, end] : [end, start];
  let count = 0;
  for (let day = low + 1; day <= high; day += 1) {
    if (isBusinessEpochDay(day, settings)) count += 1;
  }
  return start <= end ? count : -count || 0; // || 0 avoids -0
}
