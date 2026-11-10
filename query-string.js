/**
 * query-string
 *
 * Author:      紅梅 (@redplum701)
 * Copyright:   © 2026 紅梅
 * License:     MIT
 * Created:     2026-11-09
 * Updated:     2026-11-09
 *
 * Description:
 *   Parses and builds URL query strings, including repeated keys, arrays
 *   (a[]=1&a[]=2 and a[0]=1), and nested objects (a[b][c]=1). Safe against
 *   prototype pollution, and it reads back exactly what it writes for
 *   strings, arrays, and nested objects.
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
 *   - WHATWG. URL Standard: application/x-www-form-urlencoded.
 *     https://url.spec.whatwg.org/#application/x-www-form-urlencoded
 *   - Berners-Lee, T., Fielding, R., and Masinter, L. RFC 3986: Uniform Resource Identifier (URI): Generic Syntax. IETF, 2005.
 *     https://www.rfc-editor.org/rfc/rfc3986
 *   - MDN Web Docs. URLSearchParams. Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
 *   - MDN Web Docs. encodeURIComponent(). Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent
 *   - Harb, J. qs (a widely used query string library, for comparison).
 *     https://github.com/ljharb/qs
 */

const MAX_ARRAY_LENGTH = 1000; // numeric keys 0..n-1 become an array up to this length

// A plain object is made with {} or Object.create(null): not an array, Map,
// Date, class instance, and so on.
function isPlainObject(value) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

// Read only a property the object itself owns. Without this, a key such as
// "constructor" would find Object's inherited property and corrupt it.
function ownValue(object, key) {
  return Object.hasOwn(object, key) ? object[key] : undefined;
}

// defineProperty makes a real own property even for a key like "__proto__",
// where a plain assignment would change the prototype instead.
function setOwn(object, key, value) {
  Object.defineProperty(object, key, { value, enumerable: true, writable: true, configurable: true });
}

// "+" means a space in query strings. A broken escape such as "%E0%A4%A" is
// left as it is instead of throwing.
function decodeComponent(text) {
  const spaced = text.replace(/\+/g, " ");
  try {
    return decodeURIComponent(spaced);
  } catch {
    return spaced;
  }
}

// Splits a decoded key such as "a[b][]" into ["a", "b", ""].
// A key that is not of the form name[...][...], or that nests too deeply,
// is used as one plain key.
function splitKey(rawKey, depth) {
  const key = decodeComponent(rawKey);
  const match = /^([^[\]]+)((?:\[[^[\]]*\])*)$/.exec(key);
  if (!match || match[2] === "") return [key];

  const segments = [...match[2].matchAll(/\[([^[\]]*)\]/g)].map((part) => part[1]);
  if (segments.length > depth) return [key];
  return [match[1], ...segments];
}

// Stores a value at the path. Rules:
//   - A key used again collects its values in an array ("a=1&a=2").
//   - A trailing [] always makes an array ("a[]=1").
//   - If a later value needs a container where an earlier plain value or array
//     sits, or the other way round, the later one wins.
function insert(root, tokens, value) {
  const pushToArray = tokens.length > 1 && tokens[tokens.length - 1] === "";
  const path = pushToArray ? tokens.slice(0, -1) : tokens;

  let node = root;
  for (let i = 0; i < path.length - 1; i += 1) {
    const existing = ownValue(node, path[i]);
    if (isPlainObject(existing)) {
      node = existing;
    } else {
      const created = {};
      setOwn(node, path[i], created);
      node = created;
    }
  }

  const key = path[path.length - 1];
  const existing = ownValue(node, key);

  if (Array.isArray(existing)) {
    existing.push(value);
  } else if (typeof existing === "string") {
    setOwn(node, key, [existing, value]);
  } else if (pushToArray) {
    setOwn(node, key, [value]); // nothing there yet, or an object that gets replaced
  } else {
    setOwn(node, key, value);
  }
}

// Turns objects whose keys are exactly "0", "1", ... "n-1" into arrays
// (so a[0]=x&a[1]=y gives ["x", "y"]), all the way down.
function toArrays(value) {
  if (Array.isArray(value)) return value.map(toArrays);
  if (!isPlainObject(value)) return value;

  const keys = Object.keys(value);
  const looksLikeArray =
    keys.length > 0 && keys.length <= MAX_ARRAY_LENGTH && keys.every((key, index) => key === String(index));

  if (looksLikeArray) return keys.map((key) => toArrays(value[key]));

  const result = {};
  for (const key of keys) setOwn(result, key, toArrays(value[key]));
  return result;
}

/**
 * Parses a query string into an object.
 *
 * Supported forms:
 *   a=1&b=2          { a: "1", b: "2" }
 *   a=1&a=2          { a: ["1", "2"] }          repeated key
 *   a[]=1&a[]=2      { a: ["1", "2"] }          bracket array (one item stays an array)
 *   a[0]=x&a[1]=y    { a: ["x", "y"] }          numeric index
 *   a[b][c]=1        { a: { b: { c: "1" } } }   nesting
 *   flag             { flag: "" }               no "="
 *
 * Values are always strings. "+" becomes a space and %XX escapes are decoded
 * (also in keys, so "a%5Bb%5D=1" works like "a[b]=1"). Empty keys are skipped.
 * Keys such as "__proto__" are stored as ordinary properties and never change
 * any prototype.
 *
 * @param {string} query - With or without a leading "?". Do not include a "#fragment".
 * @param {object} [options]
 * @param {number} [options.depth=10] - Most bracket levels to read. A key nested
 *   deeper is used as one plain key.
 * @returns {object}
 * @throws {TypeError} If query is not a string.
 * @throws {RangeError} If depth is not a non-negative integer.
 */
export function parseQuery(query, options = {}) {
  if (typeof query !== "string") {
    throw new TypeError("parseQuery: expected a string.");
  }
  const { depth = 10 } = options;
  if (!Number.isInteger(depth) || depth < 0) {
    throw new RangeError("parseQuery: depth must be a non-negative integer.");
  }

  const text = query.startsWith("?") ? query.slice(1) : query;
  const root = {};

  for (const part of text.split("&")) {
    if (part === "") continue;

    const equals = part.indexOf("=");
    const rawKey = equals === -1 ? part : part.slice(0, equals);
    const rawValue = equals === -1 ? "" : part.slice(equals + 1);

    const tokens = splitKey(rawKey, depth);
    if (tokens[0] === "") continue; // no key name
    insert(root, tokens, decodeComponent(rawValue));
  }

  const result = {};
  for (const key of Object.keys(root)) setOwn(result, key, toArrays(root[key]));
  return result;
}

const ARRAY_FORMATS = ["brackets", "repeat", "index"];

function isPrimitiveItem(value) {
  return value === null || value === undefined || ["string", "number", "boolean", "bigint"].includes(typeof value) || value instanceof Date;
}

/**
 * Builds a query string from an object.
 *
 * Values may be strings, numbers, booleans, BigInts, Dates (written as ISO
 * strings), null (written as an empty value), arrays, and nested plain objects.
 * undefined values are skipped. Empty arrays and empty objects write nothing.
 *
 * @param {object|null|undefined} object - The data. null or undefined gives "".
 * @param {object} [options]
 * @param {"brackets"|"repeat"|"index"} [options.arrayFormat="brackets"] - How
 *   arrays of simple values are written:
 *     brackets: a[]=1&a[]=2    (default; reads back as an array, even with one item)
 *     repeat:   a=1&a=2        (a one-item array reads back as a plain string)
 *     index:    a[0]=1&a[1]=2
 *   Arrays that contain objects or arrays always use the index format.
 * @param {boolean} [options.skipNull=false] - Leave out null values instead of writing "key=".
 * @param {boolean} [options.sort=false] - Sort object keys alphabetically.
 * @param {boolean} [options.addQueryPrefix=false] - Start with "?" (when there is output).
 * @param {boolean} [options.spaceAsPlus=false] - Write spaces as "+" instead of "%20".
 * @returns {string}
 * @throws {TypeError} If object is not a plain object, or contains a function,
 *   symbol, or circular reference.
 * @throws {RangeError} If a key contains "[" or "]", a number is not finite,
 *   a Date is invalid, or arrayFormat is unknown.
 */
export function stringifyQuery(object, options = {}) {
  const {
    arrayFormat = "brackets",
    skipNull = false,
    sort = false,
    addQueryPrefix = false,
    spaceAsPlus = false,
  } = options;

  if (!ARRAY_FORMATS.includes(arrayFormat)) {
    throw new RangeError(`stringifyQuery: arrayFormat must be one of ${ARRAY_FORMATS.join(", ")}.`);
  }
  if (object === null || object === undefined) return "";
  if (!isPlainObject(object)) {
    throw new TypeError("stringifyQuery: expected a plain object.");
  }

  const encode = (text) => {
    const encoded = encodeURIComponent(text);
    return spaceAsPlus ? encoded.replace(/%20/g, "+") : encoded;
  };

  const pairs = [];
  const ancestors = new Set(); // objects being written right now, to spot cycles

  const keysOf = (value) => {
    const keys = Object.keys(value);
    for (const key of keys) {
      if (key.includes("[") || key.includes("]")) {
        throw new RangeError(`stringifyQuery: the key "${key}" contains a bracket, which is used for nesting.`);
      }
    }
    return sort ? keys.sort() : keys;
  };

  const write = (prefix, value) => {
    if (value === undefined) return;

    if (value === null) {
      if (!skipNull) pairs.push(`${prefix}=`);
      return;
    }

    switch (typeof value) {
      case "string":
      case "boolean":
      case "bigint":
        pairs.push(`${prefix}=${encode(String(value))}`);
        return;
      case "number":
        if (!Number.isFinite(value)) {
          throw new RangeError("stringifyQuery: numbers must be finite.");
        }
        pairs.push(`${prefix}=${encode(String(value))}`);
        return;
      case "object":
        break;
      default:
        throw new TypeError(`stringifyQuery: a ${typeof value} value cannot be written.`);
    }

    if (value instanceof Date) {
      if (Number.isNaN(value.getTime())) {
        throw new RangeError("stringifyQuery: invalid Date.");
      }
      pairs.push(`${prefix}=${encode(value.toISOString())}`);
      return;
    }

    if (ancestors.has(value)) {
      throw new TypeError("stringifyQuery: circular reference.");
    }
    ancestors.add(value);

    if (Array.isArray(value)) {
      const simple = value.every(isPrimitiveItem);
      value.forEach((item, index) => {
        if (!simple || arrayFormat === "index") write(`${prefix}[${index}]`, item);
        else if (arrayFormat === "brackets") write(`${prefix}[]`, item);
        else write(prefix, item);
      });
    } else if (isPlainObject(value)) {
      for (const key of keysOf(value)) write(`${prefix}[${encode(key)}]`, value[key]);
    } else {
      throw new TypeError("stringifyQuery: only plain objects and arrays can be nested.");
    }

    ancestors.delete(value);
  };

  ancestors.add(object);
  for (const key of keysOf(object)) write(encode(key), object[key]);

  return (addQueryPrefix && pairs.length > 0 ? "?" : "") + pairs.join("&");
}
