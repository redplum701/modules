/**
 * eto
 *
 * Author:      紅梅 (@redplum701)
 * Copyright:   © 2026 紅梅
 * License:     MIT
 * Created:     2026-11-09
 * Updated:     2026-11-09
 *
 * Description:
 *   Finds the eto (Chinese zodiac animal) and the full kanshi (sexagenary
 *   cycle name, such as 丙午) for a year. Years are counted by calendar year
 *   (January 1), as in Japanese New Year cards.
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
 *   - Wikipedia. Sexagenary cycle.
 *     https://en.wikipedia.org/wiki/Sexagenary_cycle
 *   - Wikipedia. Chinese zodiac.
 *     https://en.wikipedia.org/wiki/Chinese_zodiac
 */

// Twelve earthly branches (eto), starting from the Rat.
const BRANCHES = [
  { kanji: "子", reading: "ね", english: "Rat" },
  { kanji: "丑", reading: "うし", english: "Ox" },
  { kanji: "寅", reading: "とら", english: "Tiger" },
  { kanji: "卯", reading: "う", english: "Rabbit" },
  { kanji: "辰", reading: "たつ", english: "Dragon" },
  { kanji: "巳", reading: "み", english: "Snake" },
  { kanji: "午", reading: "うま", english: "Horse" },
  { kanji: "未", reading: "ひつじ", english: "Goat" },
  { kanji: "申", reading: "さる", english: "Monkey" },
  { kanji: "酉", reading: "とり", english: "Rooster" },
  { kanji: "戌", reading: "いぬ", english: "Dog" },
  { kanji: "亥", reading: "い", english: "Pig" },
];

// Ten heavenly stems. Even index = yang, odd index = yin.
const STEMS = [
  { kanji: "甲", reading: "きのえ", element: "Wood", yinYang: "yang" },
  { kanji: "乙", reading: "きのと", element: "Wood", yinYang: "yin" },
  { kanji: "丙", reading: "ひのえ", element: "Fire", yinYang: "yang" },
  { kanji: "丁", reading: "ひのと", element: "Fire", yinYang: "yin" },
  { kanji: "戊", reading: "つちのえ", element: "Earth", yinYang: "yang" },
  { kanji: "己", reading: "つちのと", element: "Earth", yinYang: "yin" },
  { kanji: "庚", reading: "かのえ", element: "Metal", yinYang: "yang" },
  { kanji: "辛", reading: "かのと", element: "Metal", yinYang: "yin" },
  { kanji: "壬", reading: "みずのえ", element: "Water", yinYang: "yang" },
  { kanji: "癸", reading: "みずのと", element: "Water", yinYang: "yin" },
];

// Year 4 CE is the first year of a sexagenary cycle (甲子).
const CYCLE_START_YEAR = 4;

// A modulo that always returns 0 or a positive number, even for negative input.
function mod(n, m) {
  return ((n % m) + m) % m;
}

function assertYear(year, fnName) {
  if (!Number.isInteger(year)) {
    throw new TypeError(`${fnName}: year must be an integer.`);
  }
}

/**
 * Returns the eto (zodiac animal) for a year.
 *
 * @param {number} year - An integer year, e.g. 2026.
 * @returns {{index: number, kanji: string, reading: string, english: string}}
 *   index is 0 (Rat) to 11 (Pig).
 */
export function getEto(year) {
  assertYear(year, "getEto");
  const index = mod(year - CYCLE_START_YEAR, 12);
  return { index, ...BRANCHES[index] };
}

/**
 * Returns the full kanshi (sexagenary cycle name) for a year.
 *
 * @param {number} year - An integer year, e.g. 2026.
 * @returns {{kanji: string, reading: string, cycleNumber: number,
 *   stem: object, branch: object}}
 *   cycleNumber is 1 (甲子) to 60 (癸亥).
 */
export function getKanshi(year) {
  assertYear(year, "getKanshi");
  const stemIndex = mod(year - CYCLE_START_YEAR, 10);
  const stem = { index: stemIndex, ...STEMS[stemIndex] };
  const branch = getEto(year);
  return {
    kanji: stem.kanji + branch.kanji,
    reading: stem.reading + "・" + branch.reading,
    cycleNumber: mod(year - CYCLE_START_YEAR, 60) + 1,
    stem,
    branch,
  };
}
