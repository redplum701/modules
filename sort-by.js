/**
 * sort-by
 *
 * Author:      紅梅 (@redplum701)
 * Copyright:   © 2026 紅梅
 * License:     MIT
 * Created:     2026-11-09
 * Updated:     2026-11-09
 *
 * Description:
 *   Sorts an array by one or more keys, with ascending or descending order per
 *   key, control over where empty values go, and a guaranteed stable result.
 *   Returns a new array. Strings compare by code unit by default, or with a
 *   locale if you ask, so results do not depend on the machine's language.
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
 *   - Lodash. _.sortBy and _.orderBy.
 *     https://lodash.com/docs/#orderBy
 *   - MDN Web Docs. Array.prototype.sort(). Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
 *   - MDN Web Docs. Intl.Collator. Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Collator
 *   - Wikipedia. Schwartzian transform (decorate, sort, undecorate).
 *     https://en.wikipedia.org/wiki/Schwartzian_transform
 */

const ORDERS = ["asc", "desc"];
const NULL_PLACEMENTS = ["first", "last"];

// Values that are "empty" for sorting: null, undefined, NaN, and invalid Dates.
function isEmptyValue(value) {
  return (
    value === null ||
    value === undefined ||
    (typeof value === "number" && Number.isNaN(value)) ||
    (value instanceof Date && Number.isNaN(value.getTime()))
  );
}

// Different kinds of values are ordered by kind: booleans, numbers, strings, dates, then others.
function kindOf(value) {
  if (typeof value === "boolean") return 0;
  if (typeof value === "number" || typeof value === "bigint") return 1;
  if (typeof value === "string") return 2;
  if (value instanceof Date) return 3;
  return 4; // objects, functions, symbols: not orderable, so they count as equal
}

function compareValues(a, b, collator) {
  const kindA = kindOf(a);
  const kindB = kindOf(b);
  if (kindA !== kindB) return kindA - kindB;

  switch (kindA) {
    case 0:
      return Number(a) - Number(b);
    case 1: // numbers and BigInts compare correctly with < and >
      return a < b ? -1 : a > b ? 1 : 0;
    case 2:
      if (collator) return collator.compare(a, b);
      return a < b ? -1 : a > b ? 1 : 0;
    case 3:
      return a.getTime() - b.getTime();
    default:
      return 0;
  }
}

function normalizeCriterion(criterion) {
  let spec;
  if (typeof criterion === "function" || typeof criterion === "string") {
    spec = { by: criterion };
  } else if (typeof criterion === "object" && criterion !== null) {
    spec = criterion;
  } else {
    throw new TypeError("sortBy: each criterion must be a function, a property name, or an object.");
  }

  const { by, order = "asc", nulls = "last", locale, numeric = false } = spec;
  if (typeof by !== "function" && typeof by !== "string") {
    throw new TypeError("sortBy: a criterion needs `by` (a function or a property name).");
  }
  if (!ORDERS.includes(order)) {
    throw new RangeError(`sortBy: order must be one of ${ORDERS.join(", ")}.`);
  }
  if (!NULL_PLACEMENTS.includes(nulls)) {
    throw new RangeError(`sortBy: nulls must be one of ${NULL_PLACEMENTS.join(", ")}.`);
  }
  if (locale !== undefined && typeof locale !== "string") {
    throw new TypeError("sortBy: locale must be a string.");
  }
  if (typeof numeric !== "boolean") {
    throw new TypeError("sortBy: numeric must be a boolean.");
  }

  return {
    select: typeof by === "function" ? by : (item) => (item === null || item === undefined ? undefined : item[by]),
    direction: order === "desc" ? -1 : 1,
    emptyFirst: nulls === "first",
    collator: locale !== undefined || numeric ? new Intl.Collator(locale, { numeric }) : undefined,
  };
}

/**
 * Sorts an array by one or more criteria and returns a new array.
 *
 * Each criterion is:
 *   - a function: (item) => value to sort by;
 *   - a string: a property name, like "age";
 *   - an object: { by, order, nulls, locale, numeric }
 *       by:      a function or a property name (required);
 *       order:   "asc" (default) or "desc";
 *       nulls:   "last" (default) or "first": where null, undefined, NaN, and
 *                invalid Dates go. This holds for both orders.
 *       locale:  a language tag such as "en" or "ja": compare strings with Intl.Collator;
 *       numeric: true: compare digit runs in strings as numbers ("file2" < "file10").
 *
 * With several criteria, the first decides, and later ones break ties.
 * The sort is stable: items that tie on everything keep their original order.
 * Each criterion's function runs once per item.
 *
 * Values are compared like this: numbers and BigInts by value, strings by
 * code unit (or by the collator), Dates by time, booleans false before true.
 * Mixed kinds are ordered boolean < number < string < Date < other. Objects
 * and functions are not orderable and count as equal.
 *
 * @param {Array} array - The array to sort.
 * @param {Function|string|object|Array} [criteria] - One criterion or an array of them.
 *   Omit to sort the items themselves, ascending.
 * @returns {Array} A new sorted array.
 * @throws {TypeError} If array is not an array, or a criterion is malformed.
 * @throws {RangeError} If order or nulls has an unknown value, or locale is not valid.
 */
export function sortBy(array, criteria = (item) => item) {
  if (!Array.isArray(array)) {
    throw new TypeError("sortBy: expected an array.");
  }
  const list = (Array.isArray(criteria) ? criteria : [criteria]).map(normalizeCriterion);

  // Decorate, sort, undecorate: work out each sort value once, and remember the
  // original position so ties keep their order whatever the engine does.
  const decorated = array.map((item, index) => ({
    item,
    index,
    values: list.map((criterion) => criterion.select(item)),
  }));

  decorated.sort((a, b) => {
    for (let k = 0; k < list.length; k += 1) {
      const { direction, emptyFirst, collator } = list[k];
      const valueA = a.values[k];
      const valueB = b.values[k];
      const emptyA = isEmptyValue(valueA);
      const emptyB = isEmptyValue(valueB);

      let result;
      if (emptyA || emptyB) {
        if (emptyA && emptyB) continue;
        result = (emptyA ? 1 : -1) * (emptyFirst ? -1 : 1); // not affected by `order`
      } else {
        result = direction * compareValues(valueA, valueB, collator);
      }
      if (result !== 0) return result;
    }
    return a.index - b.index;
  });

  return decorated.map((entry) => entry.item);
}
