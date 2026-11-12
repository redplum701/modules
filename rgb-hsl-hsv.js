/**
 * rgb-hsl-hsv
 *
 * Author:      紅梅 (@redplum701)
 * Copyright:   © 2026 紅梅
 * License:     MIT
 * Created:     2026-11-09
 * Updated:     2026-11-09
 *
 * Description:
 *   Converts colors between RGB, HSL, and HSV, in every direction. Hue is in
 *   degrees (0 up to 360), saturation, lightness, and value are fractions from
 *   0 to 1, and RGB channels are 0 to 255. Results are rounded by default.
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
 *   - Smith, A. R. Color gamut transform pairs. SIGGRAPH Computer Graphics, 12(3), 1978 (the paper that introduced HSV).
 *     https://doi.org/10.1145/965139.807361
 */

function assertObject(value, fnName) {
  if (typeof value !== "object" || value === null) {
    throw new TypeError(`${fnName}: expected an object.`);
  }
}

function readRgb(rgb, fnName) {
  assertObject(rgb, fnName);
  for (const channel of ["r", "g", "b"]) {
    const value = rgb[channel];
    if (typeof value !== "number" || !(value >= 0 && value <= 255)) {
      throw new RangeError(`${fnName}: ${channel} must be a number from 0 to 255.`);
    }
  }
  return rgb;
}

function readHue(h, fnName) {
  if (typeof h !== "number" || !Number.isFinite(h)) {
    throw new RangeError(`${fnName}: h must be a finite number (degrees).`);
  }
  return ((h % 360) + 360) % 360; // any angle becomes 0 up to (not including) 360
}

function readFraction(value, name, fnName) {
  if (typeof value !== "number" || !(value >= 0 && value <= 1)) {
    throw new RangeError(`${fnName}: ${name} must be a number from 0 to 1.`);
  }
  return value;
}

function readRound(options, fnName) {
  const { round = true } = options;
  if (typeof round !== "boolean") {
    throw new TypeError(`${fnName}: round must be a boolean.`);
  }
  return round;
}

const roundTo = (value, digits) => Number(value.toFixed(digits)) + 0; // + 0 turns -0 into 0

function packHsl(h, s, l, round) {
  if (!round) return { h, s, l };
  return { h: roundTo(h, 2) % 360, s: roundTo(s, 4), l: roundTo(l, 4) };
}

function packHsv(h, s, v, round) {
  if (!round) return { h, s, v };
  return { h: roundTo(h, 2) % 360, s: roundTo(s, 4), v: roundTo(v, 4) };
}

function packRgb(r, g, b, round) {
  if (!round) return { r, g, b };
  return { r: Math.round(r), g: Math.round(g), b: Math.round(b) };
}

// The hue in degrees, from channels in 0..1 with known max and min.
function hueOf(red, green, blue, max, delta) {
  if (delta === 0) return 0; // a gray has no hue
  let hue;
  if (max === red) hue = ((green - blue) / delta) % 6;
  else if (max === green) hue = (blue - red) / delta + 2;
  else hue = (red - green) / delta + 4;
  return (hue * 60 + 360) % 360;
}

/**
 * Converts RGB to HSL.
 *
 * @param {{r: number, g: number, b: number}} rgb - Channels from 0 to 255.
 * @param {object} [options]
 * @param {boolean} [options.round=true] - Round h to 2 decimals and s, l to 4. false keeps full precision.
 * @returns {{h: number, s: number, l: number}} h: degrees from 0 up to (not including) 360;
 *   s and l: from 0 to 1. A gray has h = 0 and s = 0.
 * @throws {TypeError} If rgb is not an object.
 * @throws {RangeError} If a channel is not a number from 0 to 255.
 */
export function rgbToHsl(rgb, options = {}) {
  const { r, g, b } = readRgb(rgb, "rgbToHsl");
  const round = readRound(options, "rgbToHsl");

  const [red, green, blue] = [r / 255, g / 255, b / 255];
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;
  const lightness = (max + min) / 2;
  const saturation = delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1));

  return packHsl(hueOf(red, green, blue, max, delta), saturation, lightness, round);
}

/**
 * Converts HSL to RGB.
 *
 * @param {{h: number, s: number, l: number}} hsl - h in degrees (any angle; it wraps
 *   around), s and l from 0 to 1.
 * @param {object} [options]
 * @param {boolean} [options.round=true] - Round the channels to whole numbers. false keeps decimals.
 * @returns {{r: number, g: number, b: number}} Channels from 0 to 255.
 * @throws {TypeError} If hsl is not an object.
 * @throws {RangeError} If h is not a finite number, or s or l is outside 0 to 1.
 */
export function hslToRgb(hsl, options = {}) {
  assertObject(hsl, "hslToRgb");
  const h = readHue(hsl.h, "hslToRgb");
  const s = readFraction(hsl.s, "s", "hslToRgb");
  const l = readFraction(hsl.l, "l", "hslToRgb");
  const round = readRound(options, "hslToRgb");

  // The CSS Color 4 formula.
  const chroma = s * Math.min(l, 1 - l);
  const channel = (offset) => {
    const k = (offset + h / 30) % 12;
    return 255 * (l - chroma * Math.max(-1, Math.min(k - 3, 9 - k, 1)));
  };
  return packRgb(channel(0), channel(8), channel(4), round);
}

/**
 * Converts RGB to HSV (also called HSB).
 *
 * @param {{r: number, g: number, b: number}} rgb - Channels from 0 to 255.
 * @param {object} [options]
 * @param {boolean} [options.round=true] - Round h to 2 decimals and s, v to 4. false keeps full precision.
 * @returns {{h: number, s: number, v: number}} h: degrees from 0 up to (not including) 360;
 *   s and v: from 0 to 1.
 * @throws {TypeError} If rgb is not an object.
 * @throws {RangeError} If a channel is not a number from 0 to 255.
 */
export function rgbToHsv(rgb, options = {}) {
  const { r, g, b } = readRgb(rgb, "rgbToHsv");
  const round = readRound(options, "rgbToHsv");

  const [red, green, blue] = [r / 255, g / 255, b / 255];
  const max = Math.max(red, green, blue);
  const delta = max - Math.min(red, green, blue);

  return packHsv(hueOf(red, green, blue, max, delta), max === 0 ? 0 : delta / max, max, round);
}

/**
 * Converts HSV to RGB.
 *
 * @param {{h: number, s: number, v: number}} hsv - h in degrees (any angle; it wraps
 *   around), s and v from 0 to 1.
 * @param {object} [options]
 * @param {boolean} [options.round=true] - Round the channels to whole numbers. false keeps decimals.
 * @returns {{r: number, g: number, b: number}} Channels from 0 to 255.
 * @throws {TypeError} If hsv is not an object.
 * @throws {RangeError} If h is not a finite number, or s or v is outside 0 to 1.
 */
export function hsvToRgb(hsv, options = {}) {
  assertObject(hsv, "hsvToRgb");
  const h = readHue(hsv.h, "hsvToRgb");
  const s = readFraction(hsv.s, "s", "hsvToRgb");
  const v = readFraction(hsv.v, "v", "hsvToRgb");
  const round = readRound(options, "hsvToRgb");

  const channel = (offset) => {
    const k = (offset + h / 60) % 6;
    return 255 * (v - v * s * Math.max(0, Math.min(k, 4 - k, 1)));
  };
  return packRgb(channel(5), channel(3), channel(1), round);
}

/**
 * Converts HSL to HSV.
 *
 * @param {{h: number, s: number, l: number}} hsl - h in degrees, s and l from 0 to 1.
 * @param {object} [options]
 * @param {boolean} [options.round=true] - Round h to 2 decimals and s, v to 4.
 * @returns {{h: number, s: number, v: number}}
 * @throws {TypeError} If hsl is not an object.
 * @throws {RangeError} If h is not finite, or s or l is outside 0 to 1.
 */
export function hslToHsv(hsl, options = {}) {
  assertObject(hsl, "hslToHsv");
  const h = readHue(hsl.h, "hslToHsv");
  const s = readFraction(hsl.s, "s", "hslToHsv");
  const l = readFraction(hsl.l, "l", "hslToHsv");
  const round = readRound(options, "hslToHsv");

  const value = l + s * Math.min(l, 1 - l);
  return packHsv(h, value === 0 ? 0 : 2 * (1 - l / value), value, round);
}

/**
 * Converts HSV to HSL.
 *
 * @param {{h: number, s: number, v: number}} hsv - h in degrees, s and v from 0 to 1.
 * @param {object} [options]
 * @param {boolean} [options.round=true] - Round h to 2 decimals and s, l to 4.
 * @returns {{h: number, s: number, l: number}}
 * @throws {TypeError} If hsv is not an object.
 * @throws {RangeError} If h is not finite, or s or v is outside 0 to 1.
 */
export function hsvToHsl(hsv, options = {}) {
  assertObject(hsv, "hsvToHsl");
  const h = readHue(hsv.h, "hsvToHsl");
  const s = readFraction(hsv.s, "s", "hsvToHsl");
  const v = readFraction(hsv.v, "v", "hsvToHsl");
  const round = readRound(options, "hsvToHsl");

  const lightness = v * (1 - s / 2);
  const saturation = lightness === 0 || lightness === 1 ? 0 : (v - lightness) / Math.min(lightness, 1 - lightness);
  return packHsl(h, saturation, lightness, round);
}
