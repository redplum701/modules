/**
 * url-parser
 *
 * Author:      紅梅 (@redplum701)
 * Copyright:   © 2026 紅梅
 * License:     MIT
 * Created:     2026-11-09
 * Updated:     2026-11-09
 *
 * Description:
 *   Splits a URL into its parts (scheme, user info, host, port, path, query,
 *   fragment) as a plain object. Built on the standard URL class, so it
 *   follows the WHATWG URL Standard, and returns null instead of throwing
 *   for invalid input.
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
 *   - WHATWG. URL Standard.
 *     https://url.spec.whatwg.org/
 *   - Berners-Lee, T., Fielding, R., and Masinter, L. RFC 3986: Uniform Resource Identifier (URI): Generic Syntax. IETF, 2005.
 *     https://www.rfc-editor.org/rfc/rfc3986
 *   - MDN Web Docs. URL. Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/API/URL
 *   - MDN Web Docs. URLSearchParams. Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
 */

// Path segments are shown decoded ("b%20c" -> "b c"). A broken escape such as
// "%E0%A4%A" cannot be decoded, so that segment is left as it is.
function decodeSegment(segment) {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

/**
 * Splits a URL into its parts.
 *
 * @param {string} input - An absolute URL, or a relative one when `base` is given.
 * @param {string} [base] - Base URL for resolving a relative input.
 * @returns {{
 *   href: string, origin: string|null, scheme: string,
 *   username: string, password: string,
 *   host: string, hostname: string, port: number|null,
 *   pathname: string, segments: string[],
 *   search: string, params: Array<[string, string]>,
 *   hash: string, fragment: string
 * } | null} null if the URL is invalid.
 *   scheme: without the colon ("https").
 *   host: hostname plus port ("example.com:8080").
 *   port: a number, or null when absent or the default for the scheme.
 *   segments: decoded path pieces without empty ones ("/a/b%20c/" -> ["a", "b c"]).
 *   search: with the leading "?" (or "").
 *   params: every query pair, in order, duplicates included.
 *   hash: with the leading "#" (or ""). fragment: without the "#".
 *   origin: null for URLs that have no origin, such as "mailto:".
 * @throws {TypeError} If input is not a string, or base is given but not a string.
 */
export function parseUrl(input, base) {
  if (typeof input !== "string") {
    throw new TypeError("parseUrl: expected a string.");
  }
  if (base !== undefined && typeof base !== "string") {
    throw new TypeError("parseUrl: base must be a string.");
  }

  let url;
  try {
    url = new URL(input, base);
  } catch {
    return null; // not a valid URL (for example, no scheme and no base)
  }

  return {
    href: url.href,
    origin: url.origin === "null" ? null : url.origin,
    scheme: url.protocol.slice(0, -1),
    username: url.username,
    password: url.password,
    host: url.host,
    hostname: url.hostname,
    port: url.port === "" ? null : Number(url.port),
    pathname: url.pathname,
    segments: url.pathname.split("/").filter(Boolean).map(decodeSegment),
    search: url.search,
    params: [...url.searchParams.entries()],
    hash: url.hash,
    fragment: url.hash.slice(1),
  };
}

/**
 * Checks whether a string is a valid absolute URL.
 * Never throws: non-strings return false.
 *
 * @param {*} input - Anything.
 * @param {object} [options]
 * @param {string[]} [options.protocols] - Allowed schemes without the colon,
 *   for example ["http", "https"]. Any scheme is allowed when omitted.
 * @returns {boolean}
 */
export function isUrl(input, options = {}) {
  if (typeof input !== "string") return false;

  const parsed = parseUrl(input);
  if (parsed === null) return false;

  const { protocols } = options;
  if (protocols === undefined) return true;
  return protocols.some((protocol) => protocol.toLowerCase() === parsed.scheme);
}
