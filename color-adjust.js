/**
 * color-adjust
 *
 * Author:      紅梅 (@redplum701)
 * Copyright:   © 2026 紅梅
 * License:     MIT
 * Created:     2026-11-09
 * Updated:     2026-11-09
 *
 * Description:
 *   Lighten, darken, and mix colors. Colors can be HEX strings (#rgb, #rrggbb,
 *   with or without alpha) or { r, g, b, a } objects, and the result comes
 *   back in the same form. Lightness changes work in HSL; mixing can be done
 *   in sRGB (like Sass and CSS authors expect) or in linear light.
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
 *   - Wikipedia. HSL and HSV.
 *     https://en.wikipedia.org/wiki/HSL_and_HSV
 *   - W3C. CSS Color Module Level 4: HSL to RGB conversion.
 *     https://www.w3.org/TR/css-color-4/#hsl-to-rgb
 *   - Wikipedia. sRGB (the transfer function).
 *     https://en.wikipedia.org/wiki/SRGB
 *   - Sass. color.mix() and color.scale/adjust (the behavior this module follows for lighten, darken, and mix).
 *     https://sass-lang.com/documentation/modules/color/
 */

const HEX_PATTERN = /^#?([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

// Reads a HEX string or { r, g, b, a } object.
// Returns { r, g, b, a, isHex }. `a` is undefined when there is no alpha.
function readColor(color, name) {
  if (typeof color === "string") {
    const match = HEX_PATTERN.exec(color.trim());
    if (!match) throw new RangeError(`${name} is not a valid HEX color.`);

    let digits = match[1];
    if (digits.length <= 4) digits = digits.split("").map((char) => char + char).join("");
    return {
      r: parseInt(digits.slice(0, 2), 16),
      g: parseInt(digits.slice(2, 4), 16),
      b: parseInt(digits.slice(4, 6), 16),
      a: digits.length === 8 ? parseInt(digits.slice(6, 8), 16) / 255 : undefined,
      isHex: true,
    };
  }

  if (typeof color === "object" && color !== null) {
    const { r, g, b, a } = color;
    for (const [channel, value] of [["r", r], ["g", g], ["b", b]]) {
      if (typeof value !== "number" || !(value >= 0 && value <= 255)) {
        throw new RangeError(`${name}.${channel} must be a number from 0 to 255.`);
      }
    }
    if (a !== undefined && !(typeof a === "number" && a >= 0 && a <= 1)) {
      throw new RangeError(`${name}.a must be a number from 0 to 1.`);
    }
    return { r, g, b, a, isHex: false };
  }

  throw new TypeError(`${name} must be a HEX string or an { r, g, b } object.`);
}

function toHexByte(value) {
  return Math.round(Math.min(255, Math.max(0, value))).toString(16).padStart(2, "0");
}

// Writes a color in the same form as `template` (a HEX string stays a HEX string).
function writeColor({ r, g, b, a }, template) {
  if (template.isHex) {
    return `#${toHexByte(r)}${toHexByte(g)}${toHexByte(b)}${a === undefined ? "" : toHexByte(a * 255)}`;
  }
  const result = { r: Math.round(r), g: Math.round(g), b: Math.round(b) };
  if (a !== undefined) result.a = a;
  return result;
}

function rgbToHsl(r, g, b) {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const lightness = (max + min) / 2;
  const delta = max - min;
  if (delta === 0) return { h: 0, s: 0, l: lightness }; // a gray

  const saturation = lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);
  let hue;
  if (max === red) hue = ((green - blue) / delta) % 6;
  else if (max === green) hue = (blue - red) / delta + 2;
  else hue = (red - green) / delta + 4;
  return { h: (hue * 60 + 360) % 360, s: saturation, l: lightness };
}

function hslToRgb(h, s, l) {
  const chroma = s * Math.min(l, 1 - l);
  const channel = (offset) => {
    const k = (offset + h / 30) % 12;
    return 255 * (l - chroma * Math.max(-1, Math.min(k - 3, 9 - k, 1)));
  };
  return { r: channel(0), g: channel(8), b: channel(4) };
}

function readAmount(amount, name, fnName) {
  if (typeof amount !== "number" || !(amount >= 0 && amount <= 1)) {
    throw new RangeError(`${fnName}: ${name} must be a number from 0 to 1.`);
  }
}

// Changes the lightness (HSL) by `delta`, keeping hue, saturation, and alpha.
function shiftLightness(color, delta) {
  const source = readColor(color, "color");
  const { h, s, l } = rgbToHsl(source.r, source.g, source.b);
  const rgb = hslToRgb(h, s, Math.min(1, Math.max(0, l + delta)));
  return writeColor({ ...rgb, a: source.a }, source);
}

/**
 * Makes a color lighter by raising its HSL lightness. The change is in
 * "points" of lightness: 0.2 adds 20 percentage points (like Sass lighten(c, 20%)),
 * and the result stops at white. Hue, saturation, and alpha stay the same.
 *
 * @param {string|{r: number, g: number, b: number, a?: number}} color - A HEX
 *   string (#rgb, #rgba, #rrggbb, #rrggbbaa) or an object with r, g, b from 0 to 255.
 * @param {number} amount - From 0 to 1.
 * @returns {string|object} The new color, in the same form as the input.
 * @throws {TypeError} If color is not a string or object.
 * @throws {RangeError} If color is not a valid color, or amount is outside 0 to 1.
 */
export function lighten(color, amount) {
  readAmount(amount, "amount", "lighten");
  return shiftLightness(color, amount);
}

/**
 * Makes a color darker by lowering its HSL lightness. 0.2 subtracts 20
 * percentage points, and the result stops at black.
 *
 * @param {string|{r: number, g: number, b: number, a?: number}} color - See lighten.
 * @param {number} amount - From 0 to 1.
 * @returns {string|object} The new color, in the same form as the input.
 * @throws {TypeError} If color is not a string or object.
 * @throws {RangeError} If color is not a valid color, or amount is outside 0 to 1.
 */
export function darken(color, amount) {
  readAmount(amount, "amount", "darken");
  return shiftLightness(color, -amount);
}

const toLinear = (channel) => {
  const value = channel / 255;
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
};

const fromLinear = (value) => {
  const encoded = value <= 0.0031308 ? value * 12.92 : 1.055 * value ** (1 / 2.4) - 0.055;
  return encoded * 255;
};

/**
 * Mixes two colors. weight is how much of the second color to use:
 * 0 gives the first color, 1 gives the second, 0.5 an even mix.
 * Alpha is mixed the same way (a missing alpha counts as 1).
 *
 * @param {string|{r: number, g: number, b: number, a?: number}} color1 - The first color.
 * @param {string|{r: number, g: number, b: number, a?: number}} color2 - The second color.
 * @param {number} [weight=0.5] - From 0 to 1.
 * @param {object} [options]
 * @param {"srgb"|"linear"} [options.space="srgb"] - "srgb": mix the numbers you see
 *   (what Sass and most design tools do). "linear": mix in linear light, which
 *   is physically correct and gives brighter midpoints.
 * @returns {string|object} The mixed color, in the same form as the first color.
 *   It has alpha if either input had alpha.
 * @throws {TypeError} If a color is not a string or object.
 * @throws {RangeError} If a color is not valid, weight is outside 0 to 1, or space is unknown.
 */
export function mix(color1, color2, weight = 0.5, options = {}) {
  readAmount(weight, "weight", "mix");
  const { space = "srgb" } = options;
  if (space !== "srgb" && space !== "linear") {
    throw new RangeError('mix: space must be "srgb" or "linear".');
  }

  const first = readColor(color1, "color1");
  const second = readColor(color2, "color2");

  const blend = (a, b) => {
    if (space === "srgb") return a * (1 - weight) + b * weight;
    return fromLinear(toLinear(a) * (1 - weight) + toLinear(b) * weight);
  };

  const hasAlpha = first.a !== undefined || second.a !== undefined;
  const alpha = hasAlpha ? (first.a ?? 1) * (1 - weight) + (second.a ?? 1) * weight : undefined;

  return writeColor(
    { r: blend(first.r, second.r), g: blend(first.g, second.g), b: blend(first.b, second.b), a: alpha },
    first
  );
}
