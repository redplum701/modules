/**
 * phone-number-formatter
 *
 * Author:      紅梅 (@redplum701)
 * Copyright:   © 2026 紅梅
 * License:     MIT
 * Created:     2026-11-09
 * Updated:     2026-11-09
 *
 * Description:
 *   Formats Japanese phone numbers with hyphens. Cleans up input (full-width
 *   digits, odd hyphens, spaces, parentheses, +81), recognizes mobile, IP
 *   phone, toll-free, and other service numbers, and places landline hyphens
 *   using the official area code list from the Ministry of Internal Affairs
 *   and Communications (as of 2026-03-01).
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
 *   - Ministry of Internal Affairs and Communications (Japan). 市外局番の一覧 (List of area codes), as of March 1, 2026.
 *     https://www.soumu.go.jp/main_content/000141817.pdf
 *   - Ministry of Internal Affairs and Communications (Japan). 電話番号に関するQ&A (Telephone number Q&A).
 *     https://www.soumu.go.jp/main_sosiki/joho_tsusin/top/tel_number/q_and_a.html
 *   - Ministry of Internal Affairs and Communications (Japan). 電気通信番号制度 (Telecommunications numbering).
 *     https://www.soumu.go.jp/main_sosiki/joho_tsusin/top/tel_number/shigai_list.html
 *   - MDN Web Docs. String.prototype.normalize(). Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize
 */

// Area codes (the digits after the leading 0), copied from the Ministry of
// Internal Affairs and Communications (MIC) "List of area codes" (市外局番の一覧),
// as of 2026-03-01. A landline number is 0 + area code + local code, where the
// area code and local code together are always 5 digits, followed by a
// 4-digit subscriber number.
const AREA_CODES_BY_LENGTH = {
  1: "3 4 6",
  2: `11 15 17 18 19 22 23 24 25 26 27 28 29 42 43 44 45 46 47 48 49
     52 53 54 55 58 59 72 73 75 76 77 78 79 82 83 84 86 87 88 89
     92 93 95 96 97 98 99`,
  3: `123 124 125 126 133 134 135 136 137 138 139 142 143 144 145 146
     152 153 154 155 156 157 158 162 163 164 165 166 167
     172 173 174 175 176 178 179 182 183 184 185 186 187
     191 192 193 194 195 197 198
     220 223 224 225 226 228 229 233 234 235 237 238
     240 241 242 243 244 246 247 248
     250 254 255 256 257 258 259
     260 261 263 264 265 266 267 268 269
     270 274 276 277 278 279
     280 282 283 284 285 287 288 289
     291 293 294 295 296 297 299
     422 428 436 438 439 460 463 465 466 467 470 475 476 478 479
     480 493 494 495
     531 532 533 536 537 538 539 544 545 547 548
     550 551 553 554 555 556 557 558
     561 562 563 564 565 566 567 568 569
     572 573 574 575 576 577 578 581 584 585 586 587
     594 595 596 597 598 599
     721 725 735 736 737 738 739
     740 742 743 744 745 746 747 748 749
     761 763 765 766 767 768
     770 771 772 773 774 776 778 779
     790 791 794 795 796 797 798 799
     820 823 824 826 827 829 833 834 835 836 837 838
     845 846 847 848 852 853 854 855 856 857 858 859
     863 865 866 867 868 869 875 877 879
     880 883 884 885 887 889 892 893 894 895 896 897 898
     920 930 940 942 943 944 946 947 948 949
     950 952 954 955 956 957 959
     964 965 966 967 968 969 972 973 974 977 978 979
     980 982 983 984 985 986 987 993 994 995 996 997`,
  4: `1267 1372 1374 1377 1392 1397 1398 1456 1457 1466 1547 1558 1564
     1586 1587 1632 1634 1635 1648 1654 1655 1656 1658
     4992 4994 4996 4998 5769 5979 7468 8387 8388 8396 8477 8512 8514
     9802 9912 9913 9969`,
};

const AREA_CODES = new Set(
  Object.values(AREA_CODES_BY_LENGTH).flatMap((codes) => codes.trim().split(/\s+/))
);

// Numbers that start with 0 + one digit + 0, and have 11 digits in total.
const ELEVEN_DIGIT_TYPES = new Map([
  ["020", "m2m"],
  ["050", "ip-phone"],
  ["060", "mobile"],
  ["070", "mobile"],
  ["080", "mobile"],
  ["090", "mobile"],
]);

// Special service numbers: prefix, type, and allowed total lengths.
const SPECIAL_SERVICES = [
  { prefix: "0120", type: "toll-free", lengths: [10] },
  { prefix: "0800", type: "toll-free", lengths: [10, 11] },
  { prefix: "0570", type: "navi-dial", lengths: [10] },
  { prefix: "0180", type: "mass-call", lengths: [10] },
  { prefix: "0990", type: "info-fee", lengths: [10] },
];

// Characters allowed between digits: spaces, hyphens and dashes, the
// prolonged sound mark ー, parentheses, dots, and the middle dot.
const ALLOWED_BODY = /^[\d\s\-\u2010-\u2015\u2212\u30FC().\u30FB]+$/;

// Turns user input into plain digits that start with 0, or null.
// Handles full-width characters (NFKC), "+81" forms, and "(0)" after +81.
function toNationalDigits(input) {
  const text = input.normalize("NFKC").trim();
  const international = text.startsWith("+");
  const body = international ? text.slice(1) : text;
  if (!ALLOWED_BODY.test(body)) return null;

  let digits = body.replace(/\D/g, "");
  if (international) {
    if (!digits.startsWith("81")) return null;
    digits = digits.slice(2);
    if (digits.startsWith("0")) digits = digits.slice(1); // "+81 (0)90..." form
    digits = "0" + digits;
  }
  return digits.startsWith("0") ? digits : null;
}

// Finds the longest area code that starts the number, trying 4 digits first.
function findAreaCode(digits) {
  for (let length = 4; length >= 1; length -= 1) {
    const candidate = digits.slice(1, 1 + length);
    if (AREA_CODES.has(candidate)) return candidate;
  }
  return null;
}

/**
 * Reads a Japanese phone number and splits it into hyphen groups.
 *
 * Recognized: landlines (0 + area code + local code + 4 digits), mobile
 * (060, 070, 080, 090), IP phone (050), M2M (020), toll-free (0120, 0800),
 * navi dial (0570), mass-call (0180), and information-fee (0990) numbers.
 *
 * @param {string} input - A phone number in almost any common written form.
 * @returns {{type: string, digits: string, groups: string[], areaCode?: string} | null}
 *   null if the input is not a recognizable Japanese phone number.
 *   type: "landline", "mobile", "ip-phone", "m2m", "toll-free",
 *   "navi-dial", "mass-call", or "info-fee".
 *   areaCode (landline only): with the leading 0, e.g. "03" or "0422".
 * @throws {TypeError} If input is not a string.
 */
export function parsePhoneNumber(input) {
  if (typeof input !== "string") {
    throw new TypeError("parsePhoneNumber: expected a string.");
  }

  const digits = toNationalDigits(input);
  if (digits === null) return null;

  // Special services come first: an 11-digit 0800 number starts with the same
  // three digits as a mobile 080 number, but 080-0XXX-XXXX is not a mobile range.
  // Special services: 0XXX-XXX-XXX (or -XXXX for 11 digits)
  for (const service of SPECIAL_SERVICES) {
    if (digits.startsWith(service.prefix) && service.lengths.includes(digits.length)) {
      return {
        type: service.type,
        digits,
        groups: [digits.slice(0, 4), digits.slice(4, 7), digits.slice(7)],
      };
    }
  }

  // 11-digit numbers: 0X0-XXXX-XXXX
  const elevenDigitType = ELEVEN_DIGIT_TYPES.get(digits.slice(0, 3));
  if (digits.length === 11 && elevenDigitType) {
    return {
      type: elevenDigitType,
      digits,
      groups: [digits.slice(0, 3), digits.slice(3, 7), digits.slice(7)],
    };
  }

  // Landlines: 10 digits, with hyphens after the area code and local code.
  if (digits.length === 10) {
    const area = findAreaCode(digits);
    if (area === null) return null;

    const localEnd = 6; // area code + local code always fill digits 1 to 5
    const areaEnd = 1 + area.length;
    return {
      type: "landline",
      digits,
      areaCode: "0" + area,
      groups: ["0" + area, digits.slice(areaEnd, localEnd), digits.slice(localEnd)],
    };
  }

  return null;
}

/**
 * Formats a Japanese phone number with hyphens.
 *
 * "09012345678" -> "090-1234-5678"
 * "0312345678"  -> "03-1234-5678"
 *
 * @param {string} input - A phone number in almost any common written form.
 * @param {object} [options]
 * @param {string} [options.separator="-"] - Text placed between the groups.
 * @param {boolean} [options.international=false] - Use the +81 form:
 *   "+81 90-1234-5678" (the leading 0 is dropped).
 * @returns {string|null} The formatted number, or null if it cannot be recognized.
 * @throws {TypeError} If input is not a string, or separator is not a string.
 */
export function formatPhoneNumber(input, options = {}) {
  const { separator = "-", international = false } = options;
  if (typeof separator !== "string") {
    throw new TypeError("formatPhoneNumber: separator must be a string.");
  }

  const parsed = parsePhoneNumber(input);
  if (parsed === null) return null;

  const groups = [...parsed.groups];
  if (international) {
    groups[0] = groups[0].slice(1); // drop the leading 0
    return "+81 " + groups.join(separator);
  }
  return groups.join(separator);
}

/**
 * Checks whether a string is a recognizable Japanese phone number.
 * Never throws: non-strings return false.
 *
 * @param {*} input - Anything.
 * @returns {boolean}
 */
export function isPhoneNumber(input) {
  return typeof input === "string" && parsePhoneNumber(input) !== null;
}
