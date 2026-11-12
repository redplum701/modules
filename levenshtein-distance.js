/**
 * levenshtein-distance
 *
 * Author:      紅梅 (@redplum701)
 * Copyright:   © 2026 紅梅
 * License:     MIT
 * Created:     2026-11-09
 * Updated:     2026-11-09
 *
 * Description:
 *   The edit distance between two strings: the fewest single-character
 *   insertions, deletions, and substitutions that turn one into the other.
 *   Also the Damerau (optimal string alignment) variant that counts swapping
 *   two neighboring characters as one edit, a similarity score from 0 to 1,
 *   and a closest-match search. Works on whole characters, so emoji count as
 *   one.
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
 *   - Wikipedia. Levenshtein distance.
 *     https://en.wikipedia.org/wiki/Levenshtein_distance
 *   - Wikipedia. Damerau-Levenshtein distance (optimal string alignment).
 *     https://en.wikipedia.org/wiki/Damerau%E2%80%93Levenshtein_distance
 *   - Wikipedia. Wagner-Fischer algorithm.
 *     https://en.wikipedia.org/wiki/Wagner%E2%80%93Fischer_algorithm
 *   - MDN Web Docs. Intl.Segmenter. Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter
 */

// Splits a string into the units that are compared: by default code points
// (so an emoji is one unit), or user-perceived characters if asked.
function toUnits(text, graphemes) {
  if (!graphemes) return Array.from(text);
  if (typeof Intl === "undefined" || typeof Intl.Segmenter !== "function") {
    throw new Error("levenshtein: graphemes needs Intl.Segmenter (Node.js 16+ or a modern browser).");
  }
  return Array.from(new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(text), (part) => part.segment);
}

function readOptions(options, fnName) {
  const { maxDistance = Infinity, ignoreCase = false, graphemes = false } = options;
  if (maxDistance !== Infinity && !(Number.isInteger(maxDistance) && maxDistance >= 0)) {
    throw new RangeError(`${fnName}: maxDistance must be a non-negative integer or Infinity.`);
  }
  if (typeof ignoreCase !== "boolean" || typeof graphemes !== "boolean") {
    throw new TypeError(`${fnName}: ignoreCase and graphemes must be booleans.`);
  }
  return { maxDistance, ignoreCase, graphemes };
}

function assertStrings(a, b, fnName) {
  if (typeof a !== "string" || typeof b !== "string") {
    throw new TypeError(`${fnName}: both arguments must be strings.`);
  }
}

// The edit distance of two arrays of units, with two rows of memory (three for
// transpositions). Returns Infinity as soon as the distance is known to be
// above maxDistance.
function editDistance(first, second, maxDistance, transpositions) {
  let a = first;
  let b = second;

  // Equal beginnings and endings never need an edit: drop them.
  let start = 0;
  while (start < a.length && start < b.length && a[start] === b[start]) start += 1;
  let endA = a.length;
  let endB = b.length;
  while (endA > start && endB > start && a[endA - 1] === b[endB - 1]) {
    endA -= 1;
    endB -= 1;
  }
  a = a.slice(start, endA);
  b = b.slice(start, endB);

  if (b.length > a.length) [a, b] = [b, a]; // keep the rows as short as possible (the distance is symmetric)
  if (b.length === 0) return a.length <= maxDistance ? a.length : Infinity;
  if (a.length - b.length > maxDistance) return Infinity; // the lengths alone are too far apart

  let beforePrevious = null; // the row two steps back (for transpositions)
  let previous = Array.from({ length: b.length + 1 }, (_, j) => j);
  let current = new Array(b.length + 1);

  for (let i = 1; i <= a.length; i += 1) {
    current[0] = i;
    let rowMinimum = i;

    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let value = Math.min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + cost);
      if (transpositions && i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        value = Math.min(value, beforePrevious[j - 2] + 1); // swap two neighbors
      }
      current[j] = value;
      if (value < rowMinimum) rowMinimum = value;
    }

    if (rowMinimum > maxDistance) return Infinity; // no path can get back under the limit
    const spare = beforePrevious ?? new Array(b.length + 1);
    beforePrevious = previous;
    previous = current;
    current = spare;
  }

  return previous[b.length] <= maxDistance ? previous[b.length] : Infinity;
}

function distanceOf(a, b, options, fnName, transpositions) {
  assertStrings(a, b, fnName);
  const { maxDistance, ignoreCase, graphemes } = readOptions(options, fnName);
  const [left, right] = ignoreCase ? [a.toLowerCase(), b.toLowerCase()] : [a, b];
  return editDistance(toUnits(left, graphemes), toUnits(right, graphemes), maxDistance, transpositions);
}

/**
 * The Levenshtein distance: the fewest single-character insertions, deletions,
 * and substitutions that turn one string into the other.
 *
 * "kitten" and "sitting" are 3 apart (k to s, e to i, add g).
 *
 * @param {string} a - The first string.
 * @param {string} b - The second string.
 * @param {object} [options]
 * @param {number} [options.maxDistance=Infinity] - Stop early and return Infinity when
 *   the distance is above this. Much faster for long strings when you only
 *   care whether they are close.
 * @param {boolean} [options.ignoreCase=false] - Compare "A" and "a" as equal.
 * @param {boolean} [options.graphemes=false] - Compare user-perceived characters
 *   instead of code points (so "e" plus an accent mark is one character).
 * @returns {number} The distance, or Infinity if it is above maxDistance.
 * @throws {TypeError} If an argument is not a string, or an option has the wrong type.
 * @throws {RangeError} If maxDistance is not a non-negative integer or Infinity.
 */
export function levenshtein(a, b, options = {}) {
  return distanceOf(a, b, options, "levenshtein", false);
}

/**
 * The Damerau-Levenshtein distance in its "optimal string alignment" form:
 * like levenshtein, but swapping two neighboring characters counts as one edit
 * ("ab" and "ba" are 1 apart, not 2). Each part of the text may be edited only once.
 *
 * @param {string} a - The first string.
 * @param {string} b - The second string.
 * @param {object} [options] - The same options as levenshtein.
 * @returns {number} The distance, or Infinity if it is above maxDistance.
 * @throws {TypeError} If an argument is not a string, or an option has the wrong type.
 * @throws {RangeError} If maxDistance is not a non-negative integer or Infinity.
 */
export function damerauLevenshtein(a, b, options = {}) {
  return distanceOf(a, b, options, "damerauLevenshtein", true);
}

/**
 * How alike two strings are, from 0 (nothing in common) to 1 (identical):
 * 1 minus the distance divided by the length of the longer string.
 * Two empty strings are identical (1).
 *
 * @param {string} a - The first string.
 * @param {string} b - The second string.
 * @param {object} [options] - The options of levenshtein (except maxDistance), plus
 *   `transpositions` (true: use the Damerau distance).
 * @returns {number}
 * @throws {TypeError} If an argument is not a string, or an option has the wrong type.
 */
export function similarity(a, b, options = {}) {
  assertStrings(a, b, "similarity");
  const { transpositions = false, ...rest } = options;
  const { ignoreCase, graphemes } = readOptions(rest, "similarity");
  const [left, right] = ignoreCase ? [a.toLowerCase(), b.toLowerCase()] : [a, b];
  const first = toUnits(left, graphemes);
  const second = toUnits(right, graphemes);

  const longest = Math.max(first.length, second.length);
  if (longest === 0) return 1;
  return 1 - editDistance(first, second, Infinity, Boolean(transpositions)) / longest;
}

/**
 * Finds the candidate closest to a target string.
 *
 * @param {string} target - The string to look for (for example, a mistyped word).
 * @param {string[]} candidates - The strings to choose from.
 * @param {object} [options] - The options of levenshtein, plus `transpositions` (true: use the
 *   Damerau distance). With maxDistance, candidates farther away are ignored.
 * @returns {{value: string, index: number, distance: number} | null} The closest candidate
 *   (the first one if two tie), or null if there are no candidates within maxDistance.
 * @throws {TypeError} If target or a candidate is not a string, or candidates is not an array.
 * @throws {RangeError} If maxDistance is not a non-negative integer or Infinity.
 */
export function closestMatch(target, candidates, options = {}) {
  if (typeof target !== "string") {
    throw new TypeError("closestMatch: target must be a string.");
  }
  if (!Array.isArray(candidates)) {
    throw new TypeError("closestMatch: candidates must be an array of strings.");
  }
  const { transpositions = false, ...rest } = options;
  const { maxDistance, ignoreCase, graphemes } = readOptions(rest, "closestMatch");

  const prepared = (text) => toUnits(ignoreCase ? text.toLowerCase() : text, graphemes);
  const targetUnits = prepared(target);

  let best = null;
  let limit = maxDistance; // after a match is found, only a closer one is of interest
  candidates.forEach((candidate, index) => {
    if (typeof candidate !== "string") {
      throw new TypeError("closestMatch: every candidate must be a string.");
    }
    const distance = editDistance(targetUnits, prepared(candidate), limit, Boolean(transpositions));
    if (distance <= limit && (best === null || distance < best.distance)) {
      best = { value: candidate, index, distance };
      limit = distance - 1; // from now on, only strictly closer candidates count
    }
  });
  return best;
}
