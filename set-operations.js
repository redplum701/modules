/**
 * set-operations
 *
 * Author:      紅梅 (@redplum701)
 * Copyright:   © 2026 紅梅
 * License:     MIT
 * Created:     2026-11-09
 * Updated:     2026-11-09
 *
 * Description:
 *   Set operations on arrays and other iterables: union, intersection,
 *   difference, and symmetric difference. Results are arrays without
 *   duplicates, in order of first appearance.
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
 *   - MDN Web Docs. Set. Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
 *   - MDN Web Docs. Equality comparisons and sameness. Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness
 *   - Wikipedia. Algebra of sets.
 *     https://en.wikipedia.org/wiki/Algebra_of_sets
 */

// Accepts arrays, Sets, and other iterables. Strings are rejected on purpose,
// because treating "abc" as a list of letters is almost always a mistake.
function toSets(lists, fnName) {
  if (lists.length === 0) {
    throw new TypeError(`${fnName}: expected at least one list.`);
  }
  return lists.map((list) => {
    const isIterable =
      list !== null &&
      list !== undefined &&
      typeof list !== "string" &&
      typeof list[Symbol.iterator] === "function";
    if (!isIterable) {
      throw new TypeError(`${fnName}: each argument must be an array, Set, or other iterable (not a string).`);
    }
    return new Set(list); // a Set removes duplicates and keeps first-appearance order
  });
}

/**
 * All unique items that appear in any of the lists.
 *
 * @param {...Iterable} lists - One or more arrays, Sets, or iterables.
 * @returns {Array}
 */
export function union(...lists) {
  const sets = toSets(lists, "union");
  return [...new Set(sets.flatMap((set) => [...set]))];
}

/**
 * Unique items of the first list that also appear in every other list.
 *
 * @param {Iterable} first - The list to filter.
 * @param {...Iterable} others - Lists the items must appear in.
 * @returns {Array}
 */
export function intersection(first, ...others) {
  const [firstSet, ...otherSets] = toSets([first, ...others], "intersection");
  return [...firstSet].filter((item) => otherSets.every((set) => set.has(item)));
}

/**
 * Unique items of the first list that do not appear in any other list.
 *
 * @param {Iterable} first - The list to filter.
 * @param {...Iterable} others - Lists whose items are removed.
 * @returns {Array}
 */
export function difference(first, ...others) {
  const [firstSet, ...otherSets] = toSets([first, ...others], "difference");
  return [...firstSet].filter((item) => !otherSets.some((set) => set.has(item)));
}

/**
 * Items that appear in exactly one of two lists.
 *
 * @param {Iterable} a - First list.
 * @param {Iterable} b - Second list.
 * @returns {Array} Items only in a, then items only in b.
 */
export function symmetricDifference(a, b) {
  const [setA, setB] = toSets([a, b], "symmetricDifference");
  return [
    ...[...setA].filter((item) => !setB.has(item)),
    ...[...setB].filter((item) => !setA.has(item)),
  ];
}
