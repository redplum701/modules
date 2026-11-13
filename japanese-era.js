/**
 * japanese-era
 *
 * Author:      紅梅 (@redplum701)
 * Copyright:   © 2026 紅梅
 * License:     MIT
 * Created:     2026-11-09
 * Updated:     2026-11-09
 *
 * Description:
 *   Converts between Gregorian dates and Japanese era dates (wareki): 明治,
 *   大正, 昭和, 平成, 令和. The boundary days are exact (昭和64年1月7日 is
 *   followed by 平成元年1月8日, and 平成31年4月30日 by 令和元年5月1日).
 *   Formats and parses dates such as "令和8年11月10日" and "R8.11.10",
 *   including 元年 and full-width digits. New eras can be added through an
 *   option.
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
 *   - Wikipedia. Japanese era name.
 *     https://en.wikipedia.org/wiki/Japanese_era_name
 *   - Wikipedia. List of Japanese era names.
 *     https://en.wikipedia.org/wiki/List_of_Japanese_era_names
 *   - Wikipedia. Japanese calendar (the switch to the Gregorian calendar in 1873).
 *     https://en.wikipedia.org/wiki/Japanese_calendar
 *   - MDN Web Docs. String.prototype.normalize(). Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize
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

/**
 * The eras this module knows, oldest first. `start` is the first day of the era
 * in the Gregorian calendar. An era lasts until the day before the next one starts.
 *
 * Meiji is dated from 1868-01-25 (the first day of 慶応4年, which Meiji was made
 * to start from). Japan used a lunisolar calendar until it adopted the Gregorian
 * calendar on 1873-01-01 (明治6年1月1日), so for dates before that, the era years
 * here follow the Gregorian year and are only approximate.
 */
export const ERAS = Object.freeze([
  Object.freeze({ name: "明治", romaji: "Meiji", abbreviation: "M", start: "1868-01-25" }),
  Object.freeze({ name: "大正", romaji: "Taisho", abbreviation: "T", start: "1912-07-30" }),
  Object.freeze({ name: "昭和", romaji: "Showa", abbreviation: "S", start: "1926-12-25" }),
  Object.freeze({ name: "平成", romaji: "Heisei", abbreviation: "H", start: "1989-01-08" }),
  Object.freeze({ name: "令和", romaji: "Reiwa", abbreviation: "R", start: "2019-05-01" }),
]);

// Checks an era table and adds the first day as an epoch day.
function readEras(options, fnName) {
  const { eras = ERAS } = options;
  if (!Array.isArray(eras) || eras.length === 0) {
    throw new TypeError(`${fnName}: eras must be a non-empty array.`);
  }

  const prepared = eras.map((era) => {
    if (typeof era !== "object" || era === null ||
        typeof era.name !== "string" || typeof era.romaji !== "string" ||
        typeof era.abbreviation !== "string" || typeof era.start !== "string") {
      throw new TypeError(`${fnName}: each era needs name, romaji, abbreviation, and start strings.`);
    }
    return { ...era, startDay: toEpochDay(parseDate(era.start, "an era start")), startYear: Number(era.start.slice(0, 4)) };
  });
  for (let i = 1; i < prepared.length; i += 1) {
    if (prepared[i].startDay <= prepared[i - 1].startDay) {
      throw new RangeError(`${fnName}: eras must be in order, oldest first.`);
    }
  }
  return prepared;
}

function describe(era, year) {
  return {
    era: era.name,
    romaji: era.romaji,
    abbreviation: era.abbreviation,
    year,
    isFirstYear: year === 1,
    label: `${era.name}${year === 1 ? "元" : year}年`,
  };
}

/**
 * Finds the era and era year of a date.
 *
 * The era year is the Gregorian year minus the year the era started, plus 1, and it
 * changes on January 1 (as in real use). The first year is 元年 (year 1).
 * The era boundaries are exact to the day.
 *
 * @param {Date|string|{year: number, month: number, day: number}} date - The date, as a Date
 *   (read in local time), "YYYY-MM-DD", or { year, month, day }.
 * @param {object} [options]
 * @param {Array<{name: string, romaji: string, abbreviation: string, start: string}>} [options.eras=ERAS]
 *   An era table, oldest first. Use this to add a future era.
 * @returns {{era: string, romaji: string, abbreviation: string, year: number, isFirstYear: boolean, label: string}}
 *   label is like "令和8年", or "令和元年" for the first year.
 * @throws {TypeError} If the date or option has an unsupported type.
 * @throws {RangeError} If the date is not valid, or is before the first era.
 */
export function toJapaneseEra(date, options = {}) {
  const eras = readEras(options, "toJapaneseEra");
  const parsed = parseDate(date, "date");
  const day = toEpochDay(parsed);

  let found = null;
  for (const era of eras) if (era.startDay <= day) found = era;
  if (found === null) {
    throw new RangeError(`toJapaneseEra: dates before ${eras[0].start} have no era in the table.`);
  }
  return describe(found, parsed.year - found.startYear + 1);
}

// Finds an era by its kanji name, romaji, or abbreviation letter.
function findEra(eras, label) {
  const wanted = label.trim().toLowerCase();
  return eras.find((era) => era.name === label.trim() || era.romaji.toLowerCase() === wanted || era.abbreviation.toLowerCase() === wanted);
}

/**
 * Converts an era date to a Gregorian date. It checks that the date really
 * falls in that era: 平成31年5月1日 and 昭和64年1月8日 do not exist, because
 * the next era had already begun.
 *
 * @param {string} era - The era: "令和", "Reiwa", or "R" (any case for letters).
 * @param {number} year - The era year (1 is 元年).
 * @param {number} month - 1 to 12.
 * @param {number} day - 1 to 31.
 * @param {object} [options]
 * @param {Array<{name: string, romaji: string, abbreviation: string, start: string}>} [options.eras=ERAS]
 *   An era table, oldest first.
 * @returns {{year: number, month: number, day: number, iso: string}}
 * @throws {TypeError} If an argument has an unsupported type.
 * @throws {RangeError} If the era is unknown, the date is not valid, or it is outside the era.
 */
export function fromJapaneseEra(era, year, month, day, options = {}) {
  const eras = readEras(options, "fromJapaneseEra");
  if (typeof era !== "string") {
    throw new TypeError("fromJapaneseEra: era must be a string.");
  }
  const found = findEra(eras, era);
  if (!found) {
    throw new RangeError(`fromJapaneseEra: unknown era "${era}".`);
  }
  if (!Number.isInteger(year) || year < 1) {
    throw new RangeError("fromJapaneseEra: year must be an integer, 1 or more.");
  }

  const gregorianYear = found.startYear + year - 1;
  checkCalendarDate(gregorianYear, month, day, `${found.name}${year}年${month}月${day}日`);

  const dayNumber = toEpochDay({ year: gregorianYear, month, day });
  const next = eras[eras.indexOf(found) + 1];
  if (dayNumber < found.startDay || (next && dayNumber >= next.startDay)) {
    throw new RangeError(`fromJapaneseEra: ${found.name}${year}年${month}月${day}日 is not in the ${found.name} era.`);
  }
  return toResult({ year: gregorianYear, month, day });
}

/**
 * Writes a date in era form.
 *
 * Formats:
 *   "long" (default)    令和8年11月10日 (令和元年5月1日 for the first year)
 *   "abbreviation"      R8.11.10
 *   "romaji"            Reiwa 8-11-10
 *
 * @param {Date|string|{year: number, month: number, day: number}} date - The date.
 * @param {object} [options]
 * @param {"long"|"abbreviation"|"romaji"} [options.format="long"] - The format.
 * @param {boolean} [options.gannen=true] - For "long": write 元 instead of 1 for the first year.
 * @param {Array<{name: string, romaji: string, abbreviation: string, start: string}>} [options.eras=ERAS]
 *   An era table, oldest first.
 * @returns {string}
 * @throws {TypeError} If an argument has an unsupported type.
 * @throws {RangeError} If the date is not valid or has no era, or the format is unknown.
 */
export function formatJapaneseEra(date, options = {}) {
  const { format = "long", gannen = true } = options;
  if (!["long", "abbreviation", "romaji"].includes(format)) {
    throw new RangeError('formatJapaneseEra: format must be "long", "abbreviation", or "romaji".');
  }
  if (typeof gannen !== "boolean") {
    throw new TypeError("formatJapaneseEra: gannen must be a boolean.");
  }

  const parsed = parseDate(date, "date");
  const era = toJapaneseEra(parsed, options);
  if (format === "abbreviation") return `${era.abbreviation}${era.year}.${parsed.month}.${parsed.day}`;
  if (format === "romaji") return `${era.romaji} ${era.year}-${parsed.month}-${parsed.day}`;
  return `${era.era}${gannen && era.isFirstYear ? "元" : era.year}年${parsed.month}月${parsed.day}日`;
}

const escapePattern = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Reads a date written in era form, such as "令和8年11月10日", "平成元年1月8日",
 * "R8.11.10", "H31/4/30", or "Reiwa 8-11-10". Full-width digits and spaces are fine.
 * The date must really fall in the named era.
 *
 * @param {string} text - The date text.
 * @param {object} [options]
 * @param {Array<{name: string, romaji: string, abbreviation: string, start: string}>} [options.eras=ERAS]
 *   An era table, oldest first.
 * @returns {{year: number, month: number, day: number, iso: string, era: string, eraYear: number} | null}
 *   The Gregorian date and the era it was read in, or null if the text is not an era date or
 *   the date does not exist in that era.
 * @throws {TypeError} If text is not a string, or the eras option is malformed.
 */
export function parseJapaneseEra(text, options = {}) {
  if (typeof text !== "string") {
    throw new TypeError("parseJapaneseEra: text must be a string.");
  }
  const eras = readEras(options, "parseJapaneseEra");

  const names = eras.flatMap((era) => [era.name, era.romaji, era.abbreviation]).map(escapePattern).sort((a, b) => b.length - a.length);
  const pattern = new RegExp(
    `^(${names.join("|")})\\s*(元|\\d+)\\s*(?:年|[./-])\\s*(\\d{1,2})\\s*(?:月|[./-])\\s*(\\d{1,2})\\s*日?$`,
    "i"
  );
  const match = pattern.exec(text.normalize("NFKC").trim());
  if (!match) return null;

  const [, eraText, yearText, monthText, dayText] = match;
  const eraYear = yearText === "元" ? 1 : Number(yearText);
  try {
    const found = findEra(eras, eraText);
    const date = fromJapaneseEra(found.name, eraYear, Number(monthText), Number(dayText), options);
    return { ...date, era: found.name, eraYear };
  } catch {
    return null; // a date that does not exist in that era
  }
}
