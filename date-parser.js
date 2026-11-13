/**
 * date-parser
 *
 * Author:      紅梅 (@redplum701)
 * Copyright:   © 2026 紅梅
 * License:     MIT
 * Created:     2026-11-09
 * Updated:     2026-11-09
 *
 * Description:
 *   Reads dates written in many common ways: ISO (2026-11-10), slashes and
 *   dots, compact (20261110), 年月日 (2026年11月10日), era dates (令和8年11月10日,
 *   R8.11.10), English month names (Nov 10, 2026; 10 November 2026), and
 *   month/day/year or day/month/year. Returns a plain calendar date, or null if
 *   the text is not a date. A time of day, if present, is ignored.
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
 *   - Wikipedia. ISO 8601.
 *     https://en.wikipedia.org/wiki/ISO_8601
 *   - Wikipedia. Date format by country.
 *     https://en.wikipedia.org/wiki/Date_format_by_country
 *   - MDN Web Docs. Date.parse() and the date time string format. Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse#date_time_string_format
 *   - Wikipedia. Japanese era name.
 *     https://en.wikipedia.org/wiki/Japanese_era_name
 */

const MIN_YEAR = 1000;
const MAX_YEAR = 9999;

const MONTH_NAMES = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];

// Eras (the first day in the Gregorian calendar), for dates such as 令和8年11月10日.
const ERAS = [
  { name: "明治", romaji: "meiji", abbreviation: "m", start: [1868, 1, 25] },
  { name: "大正", romaji: "taisho", abbreviation: "t", start: [1912, 7, 30] },
  { name: "昭和", romaji: "showa", abbreviation: "s", start: [1926, 12, 25] },
  { name: "平成", romaji: "heisei", abbreviation: "h", start: [1989, 1, 8] },
  { name: "令和", romaji: "reiwa", abbreviation: "r", start: [2019, 5, 1] },
];

function daysInMonth(year, month) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function isValidDate(year, month, day) {
  return (
    Number.isInteger(year) && year >= MIN_YEAR && year <= MAX_YEAR &&
    Number.isInteger(month) && month >= 1 && month <= 12 &&
    Number.isInteger(day) && day >= 1 && day <= daysInMonth(year, month)
  );
}

function result(year, month, day, format) {
  if (!isValidDate(year, month, day)) return null;
  const iso = `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  return { year, month, day, iso, format };
}

// "Nov", "November", and "Sept" all name a month. Returns the month number, or 0.
function monthFromName(word) {
  const lower = word.toLowerCase().replace(/\.$/, "");
  if (lower.length < 3) return 0;
  const index = MONTH_NAMES.findIndex((name) => name.startsWith(lower) || (lower === "sept" && name === "september"));
  return index + 1;
}

// A two-digit year: below the pivot is 20xx, from the pivot up is 19xx.
function expandYear(text, pivot) {
  const year = Number(text);
  if (text.length > 2) return year;
  return year < pivot ? 2000 + year : 1900 + year;
}

// Reads era dates: 令和8年11月10日, 令和元年5月1日, R8.11.10, Heisei 31-4-30.
function parseEraDate(text) {
  const names = ERAS.flatMap((era) => [era.name, era.romaji, era.abbreviation]).sort((a, b) => b.length - a.length);
  const pattern = new RegExp(`^(${names.join("|")})\\s*(元|\\d+)\\s*(?:年|[./-])\\s*(\\d{1,2})\\s*(?:月|[./-])\\s*(\\d{1,2})\\s*日?$`, "i");
  const match = pattern.exec(text);
  if (!match) return null;

  const label = match[1].toLowerCase();
  const era = ERAS.find((e) => e.name === match[1] || e.romaji === label || e.abbreviation === label);
  const eraYear = match[2] === "元" ? 1 : Number(match[2]);
  const year = era.start[0] + eraYear - 1;
  const month = Number(match[3]);
  const day = Number(match[4]);
  if (eraYear < 1 || !isValidDate(year, month, day)) return null;

  // The date must really fall in that era (not before it began, or after the next one began).
  const stamp = year * 10000 + month * 100 + day;
  const startStamp = era.start[0] * 10000 + era.start[1] * 100 + era.start[2];
  const next = ERAS[ERAS.indexOf(era) + 1];
  const nextStamp = next ? next.start[0] * 10000 + next.start[1] * 100 + next.start[2] : Infinity;
  if (stamp < startStamp || stamp >= nextStamp) return null;

  return result(year, month, day, "era");
}

/**
 * Reads a date from text.
 *
 * Formats understood (full-width digits and extra spaces are fine):
 *   2026-11-10, 2026/11/10, 2026.11.10   year, month, day
 *   20261110                              compact (8 digits)
 *   2026年11月10日                         with the kanji for year, month, day
 *   令和8年11月10日, R8.11.10, Reiwa 8-11-10   era dates (元年 is year 1; the date must exist in that era)
 *   11/10/2026, 10/11/2026, 11-10-26      month, day, year or day, month, year (see `order`)
 *   Nov 10, 2026   November 10 2026   Tue, Nov 10, 2026    English month names
 *   10 Nov 2026    10th of November is NOT understood; use "10 November 2026"
 *
 * A time of day and zone after the date ("2026-11-10T09:30:00Z", "2026-11-10 09:30") is ignored:
 * the date is taken as it is written, with no time zone conversion.
 *
 * The year comes first in ISO-style dates. For a date with the year last, such as
 * 03/04/2026, the order is ambiguous: `order` decides, unless the first number is
 * above 12 (then it can only be the day) or the second is above 12 (then it can
 * only be the day, and the first is the month).
 *
 * @param {string} text - The text to read.
 * @param {object} [options]
 * @param {"mdy"|"dmy"} [options.order="mdy"] - For dates with the year last and both of the first two
 *   numbers 12 or below: "mdy" is month/day/year (the US way), "dmy" is day/month/year.
 * @param {number} [options.pivot=70] - For a two-digit year: years below the pivot are 20xx, and from
 *   the pivot up are 19xx. The default 70 reads 26 as 2026 and 85 as 1985.
 * @returns {{year: number, month: number, day: number, iso: string, format: string} | null}
 *   format is one of "iso", "compact", "kanji", "era", "numeric", "english". null if the
 *   text is not a valid date (for example "2026-02-30"), or is not in a known format.
 * @throws {TypeError} If text is not a string.
 * @throws {RangeError} If order or pivot is invalid.
 */
export function parseDateText(text, options = {}) {
  if (typeof text !== "string") {
    throw new TypeError("parseDateText: text must be a string.");
  }
  const { order = "mdy", pivot = 70 } = options;
  if (order !== "mdy" && order !== "dmy") {
    throw new RangeError('parseDateText: order must be "mdy" or "dmy".');
  }
  if (!Number.isInteger(pivot) || pivot < 0 || pivot > 99) {
    throw new RangeError("parseDateText: pivot must be an integer from 0 to 99.");
  }

  // Full-width digits and letters become plain ones, then a trailing time is cut off.
  const cleaned = text
    .normalize("NFKC")
    .trim()
    .replace(/(?:[T\s])\d{1,2}:\d{2}(?::\d{2}(?:[.,]\d+)?)?\s*(?:Z|[+-]\d{2}(?::?\d{2})?|[A-Za-z]{2,5})?$/, "")
    .trim();
  if (cleaned === "") return null;

  let match;

  // 1. Year first: 2026-11-10, 2026/11/10, 2026.11.10
  if ((match = /^(\d{4})([-/.])(\d{1,2})\2(\d{1,2})$/.exec(cleaned))) {
    return result(Number(match[1]), Number(match[3]), Number(match[4]), "iso");
  }

  // 2. Compact: 20261110
  if ((match = /^(\d{4})(\d{2})(\d{2})$/.exec(cleaned))) {
    return result(Number(match[1]), Number(match[2]), Number(match[3]), "compact");
  }

  // 3. Kanji: 2026年11月10日
  if ((match = /^(\d{4})\s*年\s*(\d{1,2})\s*月\s*(\d{1,2})\s*日?$/.exec(cleaned))) {
    return result(Number(match[1]), Number(match[2]), Number(match[3]), "kanji");
  }

  // 4. Era dates
  const era = parseEraDate(cleaned);
  if (era) return era;

  // 5. Year last: 11/10/2026, 10.11.2026, 11-10-26
  if ((match = /^(\d{1,2})([-/.])(\d{1,2})\2(\d{2}|\d{4})$/.exec(cleaned))) {
    const first = Number(match[1]);
    const second = Number(match[3]);
    const year = expandYear(match[4], pivot);

    let month;
    let day;
    if (first > 12) [month, day] = [second, first]; // the first number can only be a day
    else if (second > 12) [month, day] = [first, second]; // the second number can only be a day
    else [month, day] = order === "mdy" ? [first, second] : [second, first];
    return result(year, month, day, "numeric");
  }

  // 6. English: Nov 10, 2026 / November 10 2026 / Tue, Nov 10th, 2026
  if ((match = /^(?:[A-Za-z]+\.?,?\s+)?([A-Za-z]{3,9})\.?\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})$/.exec(cleaned))) {
    const month = monthFromName(match[1]);
    if (month > 0) return result(Number(match[3]), month, Number(match[2]), "english");
  }

  // 7. English, day first: 10 Nov 2026 / 10-Nov-2026 / Tue, 10 November 2026
  if ((match = /^(?:[A-Za-z]+\.?,?\s+)?(\d{1,2})(?:st|nd|rd|th)?[\s-]+([A-Za-z]{3,9})\.?,?[\s-]+(\d{4})$/.exec(cleaned))) {
    const month = monthFromName(match[2]);
    if (month > 0) return result(Number(match[3]), month, Number(match[1]), "english");
  }

  return null;
}

/**
 * Tells whether text can be read as a date by parseDateText.
 * Never throws for the text: non-strings return false.
 *
 * @param {*} text - Anything.
 * @param {object} [options] - The same options as parseDateText.
 * @returns {boolean}
 * @throws {RangeError} If order or pivot is invalid.
 */
export function isDateText(text, options = {}) {
  return typeof text === "string" && parseDateText(text, options) !== null;
}
