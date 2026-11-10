/**
 * event-emitter
 *
 * Author:      紅梅 (@redplum701)
 * Copyright:   © 2026 紅梅
 * License:     MIT
 * Created:     2026-11-09
 * Updated:     2026-11-09
 *
 * Description:
 *   A small event emitter: subscribe with on() or once(), unsubscribe with the
 *   function that on() returns or with off(), and send events with emit().
 *   Works with string and symbol event names. If listeners throw, every
 *   listener still runs and the error is thrown afterwards.
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
 *   - Node.js. Events: EventEmitter.
 *     https://nodejs.org/api/events.html
 *   - MDN Web Docs. EventTarget. Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/API/EventTarget
 *   - MDN Web Docs. AggregateError. Mozilla.
 *     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AggregateError
 *   - Gamma, E., Helm, R., Johnson, R., and Vlissides, J. Design Patterns: Elements of Reusable Object-Oriented Software (Observer pattern). Addison-Wesley, 1994.
 *     https://en.wikipedia.org/wiki/Observer_pattern
 */

function assertEvent(event, fnName) {
  if (typeof event !== "string" && typeof event !== "symbol") {
    throw new TypeError(`${fnName}: the event name must be a string or a symbol.`);
  }
}

function assertListener(listener, fnName) {
  if (typeof listener !== "function") {
    throw new TypeError(`${fnName}: the listener must be a function.`);
  }
}

/**
 * A small event emitter.
 *
 * @example
 * const emitter = new EventEmitter();
 * const stop = emitter.on("greet", (name) => console.log(`Hello, ${name}`));
 * emitter.emit("greet", "Mei"); // logs "Hello, Mei"
 * stop();                       // unsubscribes
 */
export class EventEmitter {
  // event name -> array of { listener, once } in the order they were added
  #entries = new Map();

  #add(event, listener, once, fnName) {
    assertEvent(event, fnName);
    assertListener(listener, fnName);

    const entry = { listener, once };
    const list = this.#entries.get(event);
    if (list) list.push(entry);
    else this.#entries.set(event, [entry]);

    return () => this.#remove(event, entry);
  }

  // Removes one specific registration. Returns true if it was still there.
  #remove(event, entry) {
    const list = this.#entries.get(event);
    const index = list ? list.indexOf(entry) : -1;
    if (index === -1) return false;

    list.splice(index, 1);
    if (list.length === 0) this.#entries.delete(event);
    return true;
  }

  /**
   * Adds a listener.
   *
   * @param {string|symbol} event - The event name.
   * @param {Function} listener - Called with the arguments given to emit().
   * @returns {() => boolean} A function that removes this registration.
   *   It returns true the first time and false after that.
   * @throws {TypeError} If event is not a string or symbol, or listener is not a function.
   */
  on(event, listener) {
    return this.#add(event, listener, false, "on");
  }

  /**
   * Adds a listener that runs at most once, then removes itself.
   *
   * @param {string|symbol} event - The event name.
   * @param {Function} listener - Called with the arguments given to emit().
   * @returns {() => boolean} A function that removes this registration.
   * @throws {TypeError} If event is not a string or symbol, or listener is not a function.
   */
  once(event, listener) {
    return this.#add(event, listener, true, "once");
  }

  /**
   * Removes a listener. If the same function was added several times, the
   * most recently added one is removed (one call removes one).
   *
   * @param {string|symbol} event - The event name.
   * @param {Function} listener - The function that was added.
   * @returns {boolean} True if a listener was removed.
   * @throws {TypeError} If event is not a string or symbol, or listener is not a function.
   */
  off(event, listener) {
    assertEvent(event, "off");
    assertListener(listener, "off");

    const list = this.#entries.get(event);
    if (!list) return false;
    for (let i = list.length - 1; i >= 0; i -= 1) {
      if (list[i].listener === listener) return this.#remove(event, list[i]);
    }
    return false;
  }

  /**
   * Calls the listeners of an event, in the order they were added.
   *
   * - The list is copied first. Listeners added during emit() wait for the next
   *   emit(), and listeners removed during emit() still run this time
   *   (except once-listeners, which never run twice).
   * - If a listener throws, the others still run. Afterwards the error is
   *   thrown: the error itself if there was one, or an AggregateError if
   *   several listeners threw.
   * - Async listeners are not awaited.
   * - Inside a regular function listener, `this` is the emitter (as in Node.js).
   *
   * @param {string|symbol} event - The event name.
   * @param {...*} args - Passed to every listener.
   * @returns {boolean} True if the event had at least one listener.
   * @throws {TypeError} If event is not a string or symbol.
   */
  emit(event, ...args) {
    assertEvent(event, "emit");

    const list = this.#entries.get(event);
    if (!list || list.length === 0) return false;

    const errors = [];
    for (const entry of [...list]) {
      // A once-listener is removed first. If that fails, it already ran
      // (for example, a listener emitted the same event again).
      if (entry.once && !this.#remove(event, entry)) continue;

      try {
        // `this` is the emitter, as in Node.js. Arrow functions ignore it.
        Reflect.apply(entry.listener, this, args);
      } catch (error) {
        errors.push(error);
      }
    }

    if (errors.length === 1) throw errors[0];
    if (errors.length > 1) {
      throw new AggregateError(errors, `${errors.length} listeners threw while handling "${String(event)}".`);
    }
    return true;
  }

  /**
   * Counts listeners.
   *
   * @param {string|symbol} [event] - Count only this event. Omit to count all.
   * @returns {number}
   * @throws {TypeError} If event is given but is not a string or symbol.
   */
  listenerCount(event) {
    if (event === undefined) {
      let total = 0;
      for (const list of this.#entries.values()) total += list.length;
      return total;
    }
    assertEvent(event, "listenerCount");
    return this.#entries.get(event)?.length ?? 0;
  }

  /**
   * Lists the event names that have at least one listener.
   *
   * @returns {Array<string|symbol>}
   */
  eventNames() {
    return [...this.#entries.keys()];
  }

  /**
   * Removes all listeners of one event, or of every event.
   *
   * @param {string|symbol} [event] - Remove only this event's listeners. Omit to remove all.
   * @returns {number} How many listeners were removed.
   * @throws {TypeError} If event is given but is not a string or symbol.
   */
  removeAll(event) {
    if (event === undefined) {
      const count = this.listenerCount();
      this.#entries.clear();
      return count;
    }
    assertEvent(event, "removeAll");

    const count = this.#entries.get(event)?.length ?? 0;
    this.#entries.delete(event);
    return count;
  }
}
