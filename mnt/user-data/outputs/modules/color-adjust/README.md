# color-adjust

- **Author:** 紅梅 ([@redplum701](https://github.com/redplum701))
- **Copyright:** © 2026 紅梅
- **License:** MIT
- **Created:** 2026-11-09
- **Updated:** 2026-11-09

## Description

Lighten, darken, and mix colors. Colors can be HEX strings (`#rgb`, `#rrggbb`, with or without alpha) or `{ r, g, b, a }` objects, and the result comes back in the same form. Lightness changes work in HSL, and mixing can be done in sRGB (what Sass and most design tools do) or in linear light.

## Usage

```js
import { lighten, darken, mix } from "./color-adjust.js";

lighten("#800000", 0.2);                  // "#e60000"
darken("#e60000", 0.2);                   // "#800000"
lighten("#336699", 0.1);                  // a lighter blue, same hue
lighten({ r: 0, g: 128, b: 0 }, 0.2);     // { r: 0, g: 204, b: 0 }  (objects stay objects)
lighten("#336699cc", 0.1);                // alpha is kept: "#....cc"

mix("#ff0000", "#0000ff");                // "#800080"
mix("#000000", "#ffffff", 0.25);          // "#404040" (25% of the way to white)
mix("#ff0000", "#0000ff", 0);             // "#ff0000"
mix("#000000", "#ffffff", 0.5, { space: "linear" });   // "#bcbcbc" (brighter than "#808080")
mix("#ff000080", "#0000ff", 0.5);         // "#80008...": alpha is mixed too
```

## API

| Function | Result |
|----------|--------|
| `lighten(color, amount)` | Adds `amount` (0 to 1) to the HSL lightness. Stops at white |
| `darken(color, amount)` | Subtracts `amount` (0 to 1) from the HSL lightness. Stops at black |
| `mix(color1, color2, weight = 0.5, options?)` | A blend: `0` is `color1`, `1` is `color2` |

| Option (`mix`) | Default | Description |
|----------------|---------|-------------|
| `space` | `"srgb"` | `"srgb"`: blend the values you see. `"linear"`: blend in linear light (brighter, physically accurate midpoints) |

- **Colors:** a HEX string (`#rgb`, `#rgba`, `#rrggbb`, `#rrggbbaa`, `#` optional) or an object `{ r, g, b, a? }` with `r`, `g`, `b` from 0 to 255 and `a` from 0 to 1. The result has the same form as the input (for `mix`, the form of the first color). HEX output is lowercase with a `#`.
- **`amount` is in lightness points:** `lighten(c, 0.2)` adds 20 percentage points to HSL lightness (a color at 25% lightness becomes 45%). It is not a 20% scaling. Gray values and fully saturated colors both behave as expected, but very light or dark colors reach white or black quickly.
- Hue, saturation, and alpha are kept by `lighten` and `darken`.
- Alpha in `mix` is blended by the same weight; a missing alpha counts as fully opaque. The result has alpha if either color has one.
- Channels are rounded to whole numbers in the result.
- Errors: `TypeError` for a color that is not a string or object. `RangeError` for an invalid color, a channel or alpha out of range, an `amount` or `weight` outside 0 to 1, or an unknown `space`.

## License

MIT License

Copyright (c) 2026 紅梅

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## References

- Wikipedia. HSL and HSV.. https://en.wikipedia.org/wiki/HSL_and_HSV
- W3C. CSS Color Module Level 4: HSL to RGB conversion.. https://www.w3.org/TR/css-color-4/#hsl-to-rgb
- Wikipedia. sRGB (the transfer function).. https://en.wikipedia.org/wiki/SRGB
- Sass. color.mix() and color.scale/adjust (the behavior this module follows for lighten, darken, and mix).. https://sass-lang.com/documentation/modules/color/
