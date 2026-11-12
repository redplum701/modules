/**
 * matrix
 *
 * Author:      紅梅 (@redplum701)
 * Copyright:   © 2026 紅梅
 * License:     MIT
 * Created:     2026-11-09
 * Updated:     2026-11-09
 *
 * Description:
 *   A small, immutable Matrix class for numbers: add, subtract, multiply (by a
 *   matrix or a number), transpose, determinant, inverse, trace, integer
 *   powers, and solving linear systems. Determinant, inverse, and solve use
 *   Gaussian elimination with partial pivoting, and a singular matrix is
 *   reported clearly.
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
 *   - Wikipedia. Gaussian elimination.
 *     https://en.wikipedia.org/wiki/Gaussian_elimination
 *   - Wikipedia. Invertible matrix.
 *     https://en.wikipedia.org/wiki/Invertible_matrix
 *   - Wikipedia. LU decomposition (partial pivoting).
 *     https://en.wikipedia.org/wiki/LU_decomposition
 *   - Wikipedia. Matrix multiplication.
 *     https://en.wikipedia.org/wiki/Matrix_multiplication
 *   - MDN Web Docs. Private elements (class private fields). Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_elements
 */

const MAX_DIMENSION = 2000;
const SINGULAR_LIMIT = 1e-12; // a pivot this small (compared with the biggest entry) counts as zero

function readRows(rows, fnName) {
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new TypeError(`${fnName}: expected a non-empty array of rows.`);
  }
  if (rows.length > MAX_DIMENSION) {
    throw new RangeError(`${fnName}: at most ${MAX_DIMENSION} rows are supported.`);
  }

  const width = Array.isArray(rows[0]) ? rows[0].length : -1;
  if (width < 1 || width > MAX_DIMENSION) {
    throw new RangeError(`${fnName}: each row must be an array of 1 to ${MAX_DIMENSION} numbers.`);
  }
  return rows.map((row, i) => {
    if (!Array.isArray(row) || row.length !== width) {
      throw new RangeError(`${fnName}: every row must have the same length (row ${i} differs).`);
    }
    return row.map((value) => {
      if (typeof value !== "number" || !Number.isFinite(value)) {
        throw new TypeError(`${fnName}: every entry must be a finite number.`);
      }
      return value + 0; // + 0 turns -0 into 0
    });
  });
}

function toMatrix(value, fnName) {
  return value instanceof Matrix ? value : new Matrix(value);
}

/**
 * An immutable matrix of numbers, stored by rows.
 *
 * Calculations use ordinary floating-point numbers, so results are
 * approximate. For example, the inverse of a matrix times the matrix is
 * the identity only up to a tiny rounding error.
 *
 * @example
 * const a = new Matrix([[1, 2], [3, 4]]);
 * a.transpose().toArray(); // [[1, 3], [2, 4]]
 * a.determinant();         // -2
 */
export class Matrix {
  #rows;

  /**
   * @param {number[][]} rows - A rectangular array of rows of finite numbers
   *   (1 to 2,000 rows and columns). The input is copied.
   * @throws {TypeError} If rows is not an array of arrays, or an entry is not a finite number.
   * @throws {RangeError} If the rows differ in length, or a dimension is above 2,000.
   */
  constructor(rows) {
    const copy = readRows(rows, "Matrix");
    this.#rows = Object.freeze(copy.map((row) => Object.freeze(row)));
    Object.freeze(this);
  }

  /**
   * An all-zero matrix.
   *
   * @param {number} rowCount - Number of rows (1 to 2,000).
   * @param {number} [columnCount=rowCount] - Number of columns (1 to 2,000).
   * @returns {Matrix}
   * @throws {RangeError} If a size is not an integer from 1 to 2,000.
   */
  static zeros(rowCount, columnCount = rowCount) {
    for (const size of [rowCount, columnCount]) {
      if (!Number.isInteger(size) || size < 1 || size > MAX_DIMENSION) {
        throw new RangeError(`Matrix.zeros: sizes must be integers from 1 to ${MAX_DIMENSION}.`);
      }
    }
    return new Matrix(Array.from({ length: rowCount }, () => new Array(columnCount).fill(0)));
  }

  /**
   * The identity matrix: ones on the diagonal, zeros elsewhere.
   *
   * @param {number} size - Rows and columns (1 to 2,000).
   * @returns {Matrix}
   * @throws {RangeError} If size is not an integer from 1 to 2,000.
   */
  static identity(size) {
    if (!Number.isInteger(size) || size < 1 || size > MAX_DIMENSION) {
      throw new RangeError(`Matrix.identity: size must be an integer from 1 to ${MAX_DIMENSION}.`);
    }
    return new Matrix(Array.from({ length: size }, (_, i) => Array.from({ length: size }, (_, j) => (i === j ? 1 : 0))));
  }

  /** The number of rows. */
  get rowCount() {
    return this.#rows.length;
  }

  /** The number of columns. */
  get columnCount() {
    return this.#rows[0].length;
  }

  /** True if there are as many rows as columns. */
  get isSquare() {
    return this.rowCount === this.columnCount;
  }

  /**
   * Reads one entry.
   *
   * @param {number} row - Row number, from 0.
   * @param {number} column - Column number, from 0.
   * @returns {number}
   * @throws {RangeError} If the position is outside the matrix.
   */
  get(row, column) {
    if (!Number.isInteger(row) || !Number.isInteger(column) || row < 0 || column < 0 ||
        row >= this.rowCount || column >= this.columnCount) {
      throw new RangeError("Matrix.get: the position is outside the matrix.");
    }
    return this.#rows[row][column];
  }

  /**
   * The matrix as a new array of rows.
   *
   * @returns {number[][]}
   */
  toArray() {
    return this.#rows.map((row) => [...row]);
  }

  #requireSameShape(other, fnName) {
    if (other.rowCount !== this.rowCount || other.columnCount !== this.columnCount) {
      throw new RangeError(`Matrix.${fnName}: the matrices must have the same size.`);
    }
  }

  #requireSquare(fnName) {
    if (!this.isSquare) {
      throw new RangeError(`Matrix.${fnName}: the matrix must be square.`);
    }
  }

  /**
   * @param {Matrix|number[][]} other - A matrix of the same size.
   * @returns {Matrix} this + other
   * @throws {RangeError} If the sizes differ.
   */
  add(other) {
    const o = toMatrix(other, "add");
    this.#requireSameShape(o, "add");
    return new Matrix(this.#rows.map((row, i) => row.map((value, j) => value + o.#rows[i][j])));
  }

  /**
   * @param {Matrix|number[][]} other - A matrix of the same size.
   * @returns {Matrix} this - other
   * @throws {RangeError} If the sizes differ.
   */
  sub(other) {
    const o = toMatrix(other, "sub");
    this.#requireSameShape(o, "sub");
    return new Matrix(this.#rows.map((row, i) => row.map((value, j) => value - o.#rows[i][j])));
  }

  /**
   * Multiplies by a matrix or by a number.
   *
   * With a matrix, this must have as many columns as the other has rows. The
   * result has this matrix's rows and the other's columns.
   *
   * @param {Matrix|number[][]|number} other - A matrix, or a number to scale every entry.
   * @returns {Matrix} this x other
   * @throws {RangeError} If the sizes do not match, or a number is not finite.
   */
  mul(other) {
    if (typeof other === "number") {
      if (!Number.isFinite(other)) throw new RangeError("Matrix.mul: the number must be finite.");
      return new Matrix(this.#rows.map((row) => row.map((value) => value * other)));
    }

    const o = toMatrix(other, "mul");
    if (this.columnCount !== o.rowCount) {
      throw new RangeError(
        `Matrix.mul: a ${this.rowCount}x${this.columnCount} matrix cannot be multiplied by a ${o.rowCount}x${o.columnCount} matrix.`
      );
    }
    const result = Array.from({ length: this.rowCount }, () => new Array(o.columnCount).fill(0));
    for (let i = 0; i < this.rowCount; i += 1) {
      for (let k = 0; k < this.columnCount; k += 1) {
        const factor = this.#rows[i][k];
        if (factor === 0) continue;
        for (let j = 0; j < o.columnCount; j += 1) {
          result[i][j] += factor * o.#rows[k][j];
        }
      }
    }
    return new Matrix(result);
  }

  /** @returns {Matrix} The transpose: rows become columns. */
  transpose() {
    return new Matrix(Array.from({ length: this.columnCount }, (_, j) => this.#rows.map((row) => row[j])));
  }

  /**
   * Applies a function to every entry.
   *
   * @param {(value: number, row: number, column: number) => number} callback - Returns the new entry.
   * @returns {Matrix}
   * @throws {TypeError} If callback is not a function, or returns something that is not a finite number.
   */
  map(callback) {
    if (typeof callback !== "function") {
      throw new TypeError("Matrix.map: callback must be a function.");
    }
    return new Matrix(this.#rows.map((row, i) => row.map((value, j) => callback(value, i, j))));
  }

  /**
   * The sum of the diagonal entries.
   *
   * @returns {number}
   * @throws {RangeError} If the matrix is not square.
   */
  trace() {
    this.#requireSquare("trace");
    return this.#rows.reduce((total, row, i) => total + row[i], 0);
  }

  /**
   * The determinant, by Gaussian elimination with partial pivoting (and the
   * direct formulas for 1x1 and 2x2).
   *
   * @returns {number}
   * @throws {RangeError} If the matrix is not square.
   */
  determinant() {
    this.#requireSquare("determinant");
    const n = this.rowCount;
    if (n === 1) return this.#rows[0][0];
    if (n === 2) return this.#rows[0][0] * this.#rows[1][1] - this.#rows[0][1] * this.#rows[1][0];

    const work = this.toArray();
    let determinant = 1;
    for (let column = 0; column < n; column += 1) {
      // Pivot: the row with the largest entry in this column, which keeps the arithmetic stable.
      let pivot = column;
      for (let row = column + 1; row < n; row += 1) {
        if (Math.abs(work[row][column]) > Math.abs(work[pivot][column])) pivot = row;
      }
      if (work[pivot][column] === 0) return 0;
      if (pivot !== column) {
        [work[pivot], work[column]] = [work[column], work[pivot]];
        determinant = -determinant; // swapping two rows flips the sign
      }
      determinant *= work[column][column];

      for (let row = column + 1; row < n; row += 1) {
        const factor = work[row][column] / work[column][column];
        for (let k = column; k < n; k += 1) work[row][k] -= factor * work[column][k];
      }
    }
    return determinant + 0; // + 0 turns -0 into 0
  }

  // Solves this x X = right by Gauss-Jordan elimination. `right` is an array of rows.
  #eliminate(right, fnName) {
    this.#requireSquare(fnName);
    const n = this.rowCount;
    const columns = right[0].length;

    const scale = Math.max(...this.#rows.map((row) => Math.max(...row.map(Math.abs))));
    const work = this.#rows.map((row, i) => [...row, ...right[i]]);

    for (let column = 0; column < n; column += 1) {
      let pivot = column;
      for (let row = column + 1; row < n; row += 1) {
        if (Math.abs(work[row][column]) > Math.abs(work[pivot][column])) pivot = row;
      }
      if (scale === 0 || Math.abs(work[pivot][column]) <= SINGULAR_LIMIT * scale) {
        throw new RangeError(`Matrix.${fnName}: the matrix is singular (it has no inverse).`);
      }
      [work[pivot], work[column]] = [work[column], work[pivot]];

      const divisor = work[column][column];
      for (let k = column; k < n + columns; k += 1) work[column][k] /= divisor;

      for (let row = 0; row < n; row += 1) {
        if (row === column) continue;
        const factor = work[row][column];
        if (factor === 0) continue;
        for (let k = column; k < n + columns; k += 1) work[row][k] -= factor * work[column][k];
      }
    }
    return work.map((row) => row.slice(n));
  }

  /**
   * The inverse matrix: this x inverse is the identity. 1x1 and 2x2 matrices use
   * direct formulas; larger ones use Gauss-Jordan elimination with partial pivoting.
   *
   * @returns {Matrix}
   * @throws {RangeError} If the matrix is not square, or is singular (not invertible).
   */
  inverse() {
    this.#requireSquare("inverse");
    const n = this.rowCount;

    if (n === 1) {
      if (this.#rows[0][0] === 0) throw new RangeError("Matrix.inverse: the matrix is singular (it has no inverse).");
      return new Matrix([[1 / this.#rows[0][0]]]);
    }
    if (n === 2) {
      const [[a, b], [c, d]] = this.#rows;
      const determinant = a * d - b * c;
      if (determinant === 0) throw new RangeError("Matrix.inverse: the matrix is singular (it has no inverse).");
      return new Matrix([[d / determinant, -b / determinant], [-c / determinant, a / determinant]]);
    }
    return new Matrix(this.#eliminate(Matrix.identity(n).#rows, "inverse"));
  }

  /**
   * Solves the linear system A x = b, where A is this matrix.
   *
   * @param {number[]|Matrix|number[][]} b - A vector (array of numbers, one per row), or a
   *   matrix with one row per row of A (each column is solved at once).
   * @returns {number[]|Matrix} An array of numbers if b was a vector, a Matrix otherwise.
   * @throws {RangeError} If the matrix is not square, is singular, or b has the wrong size.
   * @throws {TypeError} If b has an unsupported form.
   */
  solve(b) {
    const isVector = Array.isArray(b) && b.length > 0 && !Array.isArray(b[0]);
    const right = isVector ? toMatrix(b.map((value) => [value]), "solve") : toMatrix(b, "solve");
    if (right.rowCount !== this.rowCount) {
      throw new RangeError("Matrix.solve: b must have one row (or entry) for each row of the matrix.");
    }

    const solution = this.#eliminate(right.#rows, "solve");
    return isVector ? solution.map((row) => row[0]) : new Matrix(solution);
  }

  /**
   * Raises a square matrix to a whole-number power by repeated squaring. A
   * negative power uses the inverse; the power 0 gives the identity.
   *
   * @param {number} exponent - An integer, at most 1,000,000 in size.
   * @returns {Matrix}
   * @throws {RangeError} If the matrix is not square, the exponent is not an integer or is too large,
   *   or the exponent is negative and the matrix is singular.
   */
  pow(exponent) {
    this.#requireSquare("pow");
    if (!Number.isInteger(exponent) || Math.abs(exponent) > 1_000_000) {
      throw new RangeError("Matrix.pow: the exponent must be an integer, at most 1,000,000 in size.");
    }
    if (exponent < 0) return this.inverse().pow(-exponent);

    let result = Matrix.identity(this.rowCount);
    let base = this;
    for (let remaining = exponent; remaining > 0; remaining = Math.floor(remaining / 2)) {
      if (remaining % 2 === 1) result = result.mul(base);
      base = base.mul(base);
    }
    return result;
  }

  /**
   * @param {Matrix|number[][]} other - A matrix.
   * @param {number} [tolerance=0] - How far apart entries may be and still count as equal. Use a
   *   small value such as 1e-9 after calculations that are not exact.
   * @returns {boolean} true if the matrices have the same size and all entries are within the tolerance.
   */
  equals(other, tolerance = 0) {
    const o = toMatrix(other, "equals");
    if (o.rowCount !== this.rowCount || o.columnCount !== this.columnCount) return false;
    return this.#rows.every((row, i) => row.every((value, j) => Math.abs(value - o.#rows[i][j]) <= tolerance));
  }

  /** @returns {string} Text like "[[1, 2], [3, 4]]". */
  toString() {
    return `[${this.#rows.map((row) => `[${row.join(", ")}]`).join(", ")}]`;
  }

  /** The rows, so a Matrix works with JSON. */
  toJSON() {
    return this.toArray();
  }
}
