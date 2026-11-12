/**
 * nearest-japanese-color
 *
 * Author:      紅梅 (@redplum701)
 * Copyright:   © 2026 紅梅
 * License:     MIT
 * Created:     2026-11-09
 * Updated:     2026-11-09
 *
 * Description:
 *   Finds the traditional Japanese color name (wairo) closest to any color.
 *   Colors are compared by perceived difference in CIELAB space, with a choice
 *   of the simple CIE76 distance or the more accurate CIEDE2000. The built-in
 *   palette is a small starter set: replace it with your own list through
 *   createColorFinder().
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
 *   - Wikipedia. CIELAB color space.
 *     https://en.wikipedia.org/wiki/CIELAB_color_space
 *   - Wikipedia. Color difference (Delta E).
 *     https://en.wikipedia.org/wiki/Color_difference
 *   - Sharma, G., Wu, W., and Dalal, E. N. The CIEDE2000 color-difference formula: implementation notes, supplementary test data, and mathematical observations. Color Research and Application, 30(1), 2005.
 *     https://doi.org/10.1002/col.20070
 *   - Nippon Colors (a widely used table of traditional Japanese colors; the starter palette follows tables like it, and is not authoritative).
 *     https://nipponcolors.com/
 */

const HEX_PATTERN = /^#?([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

// Reads a HEX string or { r, g, b } object. Any alpha is ignored.
function readRgb(color, name) {
  if (typeof color === "string") {
    const match = HEX_PATTERN.exec(color.trim());
    if (!match) throw new RangeError(`${name} is not a valid HEX color.`);

    let digits = match[1];
    if (digits.length <= 4) digits = digits.split("").map((char) => char + char).join("");
    return {
      r: parseInt(digits.slice(0, 2), 16),
      g: parseInt(digits.slice(2, 4), 16),
      b: parseInt(digits.slice(4, 6), 16),
    };
  }

  if (typeof color === "object" && color !== null) {
    for (const channel of ["r", "g", "b"]) {
      const value = color[channel];
      if (typeof value !== "number" || !(value >= 0 && value <= 255)) {
        throw new RangeError(`${name}.${channel} must be a number from 0 to 255.`);
      }
    }
    return { r: color.r, g: color.g, b: color.b };
  }

  throw new TypeError(`${name} must be a HEX string or an { r, g, b } object.`);
}

// ---------------------------------------------------------------------------
// sRGB -> CIELAB (D65 white point)
// ---------------------------------------------------------------------------

const toLinear = (channel) => {
  const value = channel / 255;
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
};

const WHITE = { x: 0.95047, y: 1, z: 1.08883 };
const EPSILON = 216 / 24389;
const KAPPA = 24389 / 27;

const labCurve = (t) => (t > EPSILON ? Math.cbrt(t) : (KAPPA * t + 16) / 116);

/**
 * Converts a color to CIELAB (D65 white point).
 *
 * @param {string|{r: number, g: number, b: number}} color - A HEX string
 *   (#rgb, #rrggbb; alpha is ignored) or an object with r, g, b from 0 to 255.
 * @returns {{L: number, a: number, b: number}} L from 0 to 100.
 * @throws {TypeError} If color is not a string or object.
 * @throws {RangeError} If color is not a valid color.
 */
export function rgbToLab(color) {
  const { r, g, b } = readRgb(color, "color");
  const [red, green, blue] = [toLinear(r), toLinear(g), toLinear(b)];

  const x = 0.4124564 * red + 0.3575761 * green + 0.1804375 * blue;
  const y = 0.2126729 * red + 0.7151522 * green + 0.072175 * blue;
  const z = 0.0193339 * red + 0.119192 * green + 0.9503041 * blue;

  const fx = labCurve(x / WHITE.x);
  const fy = labCurve(y / WHITE.y);
  const fz = labCurve(z / WHITE.z);
  return { L: 116 * fy - 16, a: 500 * (fx - fy), b: 200 * (fy - fz) };
}

// ---------------------------------------------------------------------------
// Color differences
// ---------------------------------------------------------------------------

// CIE76: the straight-line distance in Lab space. Simple and fast.
function deltaE76(first, second) {
  return Math.hypot(first.L - second.L, first.a - second.a, first.b - second.b);
}

const radians = (degrees) => (degrees * Math.PI) / 180;
const hueDegrees = (b, a) => {
  if (a === 0 && b === 0) return 0;
  const degrees = (Math.atan2(b, a) * 180) / Math.PI;
  return degrees < 0 ? degrees + 360 : degrees;
};

// CIEDE2000, following Sharma, Wu, and Dalal (2005).
function deltaE2000(first, second) {
  const averageL = (first.L + second.L) / 2;
  const chroma1 = Math.hypot(first.a, first.b);
  const chroma2 = Math.hypot(second.a, second.b);
  const averageChroma = (chroma1 + chroma2) / 2;

  const chromaPower = averageChroma ** 7;
  const g = 0.5 * (1 - Math.sqrt(chromaPower / (chromaPower + 25 ** 7)));
  const a1 = (1 + g) * first.a;
  const a2 = (1 + g) * second.a;
  const c1 = Math.hypot(a1, first.b);
  const c2 = Math.hypot(a2, second.b);
  const averageC = (c1 + c2) / 2;
  const h1 = hueDegrees(first.b, a1);
  const h2 = hueDegrees(second.b, a2);

  const deltaL = second.L - first.L;
  const deltaC = c2 - c1;

  let deltaHue = 0;
  if (c1 * c2 !== 0) {
    deltaHue = h2 - h1;
    if (deltaHue > 180) deltaHue -= 360;
    else if (deltaHue < -180) deltaHue += 360;
  }
  const deltaH = 2 * Math.sqrt(c1 * c2) * Math.sin(radians(deltaHue / 2));

  let averageHue;
  if (c1 * c2 === 0) averageHue = h1 + h2;
  else if (Math.abs(h1 - h2) <= 180) averageHue = (h1 + h2) / 2;
  else averageHue = h1 + h2 < 360 ? (h1 + h2 + 360) / 2 : (h1 + h2 - 360) / 2;

  const t =
    1 -
    0.17 * Math.cos(radians(averageHue - 30)) +
    0.24 * Math.cos(radians(2 * averageHue)) +
    0.32 * Math.cos(radians(3 * averageHue + 6)) -
    0.2 * Math.cos(radians(4 * averageHue - 63));

  const deltaTheta = 30 * Math.exp(-(((averageHue - 275) / 25) ** 2));
  const rotationC = 2 * Math.sqrt(averageC ** 7 / (averageC ** 7 + 25 ** 7));
  const sl = 1 + (0.015 * (averageL - 50) ** 2) / Math.sqrt(20 + (averageL - 50) ** 2);
  const sc = 1 + 0.045 * averageC;
  const sh = 1 + 0.015 * averageC * t;
  const rotation = -Math.sin(radians(2 * deltaTheta)) * rotationC;

  const l = deltaL / sl;
  const c = deltaC / sc;
  const h = deltaH / sh;
  return Math.sqrt(l * l + c * c + h * h + rotation * c * h);
}

const METRICS = { cie76: deltaE76, ciede2000: deltaE2000 };

function readMetric(options, fnName) {
  const { metric = "ciede2000" } = options;
  if (!Object.hasOwn(METRICS, metric)) {
    throw new RangeError(`${fnName}: metric must be "cie76" or "ciede2000".`);
  }
  return metric;
}

/**
 * The perceived difference between two colors (delta E). 0 means identical;
 * around 1 is the smallest difference an eye can notice; above about 10
 * the colors look clearly different.
 *
 * @param {string|{r: number, g: number, b: number}} color1 - A HEX string or { r, g, b }.
 * @param {string|{r: number, g: number, b: number}} color2 - A HEX string or { r, g, b }.
 * @param {object} [options]
 * @param {"cie76"|"ciede2000"} [options.metric="ciede2000"] - cie76: straight
 *   distance in Lab (simple). ciede2000: the modern formula, closer to what people see.
 * @returns {number}
 * @throws {TypeError} If a color is not a string or object.
 * @throws {RangeError} If a color is not valid, or the metric is unknown.
 */
export function colorDistance(color1, color2, options = {}) {
  const metric = readMetric(options, "colorDistance");
  return METRICS[metric](rgbToLab(color1), rgbToLab(color2));
}

// ---------------------------------------------------------------------------
// The starter palette
// ---------------------------------------------------------------------------

const entry = (name, reading, romaji, hex) => Object.freeze({ name, reading, romaji, hex });

/**
 * A starter set of traditional Japanese colors. The HEX values are
 * approximations taken from commonly published tables, and different sources
 * give slightly different values for some names (紅梅 especially). Check them
 * against your own reference, or pass your own list to createColorFinder().
 *
 * Each entry is { name, reading, romaji, hex }.
 */
export const JAPANESE_COLORS = Object.freeze([
  entry("紅", "くれない", "kurenai", "#cb1b45"),
  entry("朱", "しゅ", "shu", "#eb6101"),
  entry("緋", "ひ", "hi", "#d3381c"),
  entry("茜", "あかね", "akane", "#b7282e"),
  entry("臙脂", "えんじ", "enji", "#9f353a"),
  entry("蘇芳", "すおう", "suou", "#9e3d3f"),
  entry("桜", "さくら", "sakura", "#feeeed"),
  entry("撫子", "なでしこ", "nadeshiko", "#dc9fb4"),
  entry("桃", "もも", "momo", "#f09199"),
  entry("紅梅", "こうばい", "koubai", "#e16b8c"),
  entry("躑躅", "つつじ", "tsutsuji", "#e95295"),
  entry("柿", "かき", "kaki", "#ed6d3d"),
  entry("蜜柑", "みかん", "mikan", "#f08300"),
  entry("山吹", "やまぶき", "yamabuki", "#f8b500"),
  entry("鬱金", "うこん", "ukon", "#efbb24"),
  entry("卵", "たまご", "tamago", "#fcd575"),
  entry("若草", "わかくさ", "wakakusa", "#c3d825"),
  entry("萌黄", "もえぎ", "moegi", "#aacf53"),
  entry("若竹", "わかたけ", "wakatake", "#5dac81"),
  entry("常磐", "ときわ", "tokiwa", "#007b43"),
  entry("深緑", "ふかみどり", "fukamidori", "#00552e"),
  entry("松葉", "まつば", "matsuba", "#42602d"),
  entry("鶯", "うぐいす", "uguisu", "#928c36"),
  entry("柳", "やなぎ", "yanagi", "#a8c97f"),
  entry("青磁", "せいじ", "seiji", "#7ebea5"),
  entry("白緑", "びゃくろく", "byakuroku", "#d6e9ca"),
  entry("藍", "あい", "ai", "#165e83"),
  entry("瑠璃", "るり", "ruri", "#1e50a2"),
  entry("紺", "こん", "kon", "#0f2540"),
  entry("群青", "ぐんじょう", "gunjou", "#4c6cb3"),
  entry("空", "そら", "sora", "#a0d8ef"),
  entry("水", "みず", "mizu", "#81c7d4"),
  entry("浅葱", "あさぎ", "asagi", "#00a3af"),
  entry("露草", "つゆくさ", "tsuyukusa", "#38a1db"),
  entry("紺碧", "こんぺき", "konpeki", "#007bbb"),
  entry("千草", "ちぐさ", "chigusa", "#3a8fb7"),
  entry("藤", "ふじ", "fuji", "#bbbcde"),
  entry("菫", "すみれ", "sumire", "#7058a3"),
  entry("紫", "むらさき", "murasaki", "#592c63"),
  entry("桔梗", "ききょう", "kikyou", "#5654a2"),
  entry("江戸紫", "えどむらさき", "edomurasaki", "#745399"),
  entry("古代紫", "こだいむらさき", "kodaimurasaki", "#895b8a"),
  entry("煤竹", "すすたけ", "susutake", "#6f514c"),
  entry("琥珀", "こはく", "kohaku", "#ca7a2c"),
  entry("黄土", "おうど", "oudo", "#c39143"),
  entry("白", "しろ", "shiro", "#ffffff"),
  entry("胡粉", "ごふん", "gofun", "#fffffc"),
  entry("象牙", "ぞうげ", "zouge", "#f8f4e6"),
  entry("鼠", "ねずみ", "nezumi", "#949495"),
  entry("銀鼠", "ぎんねず", "ginnezu", "#afafb0"),
  entry("利休鼠", "りきゅうねずみ", "rikyunezumi", "#888e7e"),
  entry("墨", "すみ", "sumi", "#595857"),
  entry("黒", "くろ", "kuro", "#2b2b2b"),
  entry("漆黒", "しっこく", "shikkoku", "#0d0015"),
]);

/**
 * Prepares a palette for fast searching: each color is converted to Lab once.
 *
 * @param {Array<{hex: string}>} [palette=JAPANESE_COLORS] - Entries are objects
 *   with a `hex` string and any other fields you like (name, reading...).
 *   Other fields are passed through to the results. Must not be empty.
 * @param {object} [options]
 * @param {"cie76"|"ciede2000"} [options.metric="ciede2000"] - See colorDistance.
 * @returns {{nearest: Function, nearestN: Function, palette: Array<object>}}
 *   nearest(color): the closest entry, plus a `distance` field.
 *   nearestN(color, count): the `count` closest entries, closest first, each with `distance`.
 * @throws {TypeError} If the palette is not an array of objects, or a color is not a string or object.
 * @throws {RangeError} If the palette is empty, a hex value is invalid, or the metric is unknown.
 */
export function createColorFinder(palette = JAPANESE_COLORS, options = {}) {
  const metric = readMetric(options, "createColorFinder");
  if (!Array.isArray(palette)) {
    throw new TypeError("createColorFinder: palette must be an array.");
  }
  if (palette.length === 0) {
    throw new RangeError("createColorFinder: palette must not be empty.");
  }

  const distance = METRICS[metric];
  const entries = palette.map((item, index) => {
    if (typeof item !== "object" || item === null || typeof item.hex !== "string") {
      throw new TypeError(`createColorFinder: palette[${index}] must be an object with a hex string.`);
    }
    return { item, lab: rgbToLab(item.hex) };
  });

  const rank = (color) => {
    const lab = rgbToLab(color);
    return entries.map(({ item, lab: itemLab }) => ({ ...item, distance: distance(lab, itemLab) }));
  };

  return {
    palette: entries.map(({ item }) => item),

    nearest(color) {
      const lab = rgbToLab(color);
      let best = null;
      let bestDistance = Infinity;
      for (const { item, lab: itemLab } of entries) {
        const value = distance(lab, itemLab);
        if (value < bestDistance) { // a strict "<" keeps the first entry when two tie
          best = item;
          bestDistance = value;
        }
      }
      return { ...best, distance: bestDistance };
    },

    nearestN(color, count) {
      if (!Number.isInteger(count) || count < 1) {
        throw new RangeError("nearestN: count must be a positive integer.");
      }
      // Array.prototype.sort is stable, so ties keep the palette order.
      return rank(color).sort((a, b) => a.distance - b.distance).slice(0, count);
    },
  };
}

const defaultFinders = {}; // one finder per metric, made on first use

function defaultFinder(options, fnName) {
  const metric = readMetric(options, fnName);
  defaultFinders[metric] ??= createColorFinder(JAPANESE_COLORS, { metric });
  return defaultFinders[metric];
}

/**
 * Finds the traditional Japanese color closest to a color.
 *
 * @param {string|{r: number, g: number, b: number}} color - A HEX string
 *   (#rgb, #rrggbb; alpha is ignored) or an object with r, g, b from 0 to 255.
 * @param {object} [options]
 * @param {"cie76"|"ciede2000"} [options.metric="ciede2000"] - See colorDistance.
 * @returns {{name: string, reading: string, romaji: string, hex: string, distance: number}}
 *   The closest entry of JAPANESE_COLORS and its distance (delta E).
 * @throws {TypeError} If color is not a string or object.
 * @throws {RangeError} If color is not valid, or the metric is unknown.
 */
export function nearestJapaneseColor(color, options = {}) {
  return defaultFinder(options, "nearestJapaneseColor").nearest(color);
}

/**
 * Finds the `count` traditional Japanese colors closest to a color.
 *
 * @param {string|{r: number, g: number, b: number}} color - A HEX string or { r, g, b }.
 * @param {number} count - How many colors to return (1 or more).
 * @param {object} [options]
 * @param {"cie76"|"ciede2000"} [options.metric="ciede2000"] - See colorDistance.
 * @returns {Array<{name: string, reading: string, romaji: string, hex: string, distance: number}>}
 *   Closest first.
 * @throws {TypeError} If color is not a string or object.
 * @throws {RangeError} If color is not valid, count is not a positive integer, or the metric is unknown.
 */
export function nearestJapaneseColors(color, count, options = {}) {
  return defaultFinder(options, "nearestJapaneseColors").nearestN(color, count);
}
