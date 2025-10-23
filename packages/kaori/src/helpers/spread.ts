/*
MIT License
Copyright (c) 2018 open-wc
Copyright (c) 2025 golok

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
*/

import { nothing } from 'lit-html';
import { directive, type ElementPart, type Part } from 'lit-html/directive.js';
import { AsyncDirective } from 'lit-html/async-directive.js';

type EventListenerWithOptions = EventListenerOrEventListenerObject &
  Partial<AddEventListenerOptions>;

export class SpreadPropsDirective extends AsyncDirective {
  host!: EventTarget | object | Element;
  element!: Element;
  prevData: { [key: string]: unknown } = {};

  render(_spreadData: { [key: string]: unknown }) {
    return nothing;
  }
  override update(part: Part, [spreadData]: Parameters<this['render']>) {
    if (this.element !== (part as ElementPart).element) {
      this.element = (part as ElementPart).element;
    }
    this.host = part.options?.host || this.element;
    this.apply(spreadData);
    this.groom(spreadData);
    this.prevData = { ...spreadData };
  }

  apply(data: { [key: string]: unknown }) {
    if (!data) return;
    const { prevData, element } = this;
    for (const key in data) {
      const value = data[key];
      if (value === prevData[key]) {
        continue;
      }
      // @ts-ignore
      element[key] = value;
    }
  }

  groom(data: { [key: string]: unknown }) {
    const { prevData, element } = this;
    if (!prevData) return;
    for (const key in prevData) {
      if (
        !data ||
        (!(key in data) && element[key as keyof Element] === prevData[key])
      ) {
        // @ts-ignore
        element[key] = undefined;
      }
    }
  }
}

/**
 * Usage:
 *    import { html, render } from 'lit';
 *    import { spreadProps } from '@open-wc/lit-helpers';
 *
 *    render(
 *      html`
 *        <div
 *          ${spreadProps({
 *              prop1: 'prop1',
 *              prop2: ['Prop', '2'],
 *              prop3: {
 *                  prop: 3,
 *              }
 *          })}
 *        ></div>
 *      `,
 *      document.body,
 *    );
 */
export const spreadProps = directive(SpreadPropsDirective);

export class SpreadEventsDirective extends SpreadPropsDirective {
  eventData: { [key: string]: unknown } = {};

  override apply(data: { [key: string]: unknown }) {
    if (!data) return;
    for (const key in data) {
      const value = data[key];
      if (value === this.eventData[key]) {
        // do nothing if the same value is being applied again.
        continue;
      }
      this.applyEvent(key, value as EventListenerWithOptions);
    }
  }

  applyEvent(eventName: string, eventValue: EventListenerWithOptions) {
    const { prevData, element } = this;
    this.eventData[eventName] = eventValue;
    const prevHandler = prevData[eventName];
    if (prevHandler) {
      element.removeEventListener(eventName, this, eventValue);
    }
    element.addEventListener(eventName, this, eventValue);
  }

  override groom(data: { [key: string]: unknown }) {
    const { prevData, element } = this;
    if (!prevData) return;
    for (const key in prevData) {
      if (
        !data ||
        (!(key in data) && element[key as keyof Element] === prevData[key])
      ) {
        this.groomEvent(key, prevData[key] as EventListenerWithOptions);
      }
    }
  }

  groomEvent(eventName: string, eventValue: EventListenerWithOptions) {
    const { element } = this;
    delete this.eventData[eventName];
    element.removeEventListener(eventName, this, eventValue);
  }

  handleEvent(event: Event) {
    const value: Function | EventListenerObject = this.eventData[event.type] as
      | Function
      | EventListenerObject;
    if (typeof value === 'function') {
      (value as Function).call(this.host, event);
    } else {
      (value as EventListenerObject).handleEvent(event);
    }
  }

  override disconnected() {
    const { eventData, element } = this;
    for (const key in eventData) {
      // event listener
      const name = key.slice(1);
      const value = eventData[key] as EventListenerWithOptions;
      element.removeEventListener(name, this, value);
    }
  }

  override reconnected() {
    const { eventData, element } = this;
    for (const key in eventData) {
      // event listener
      const name = key.slice(1);
      const value = eventData[key] as EventListenerWithOptions;
      element.addEventListener(name, this, value);
    }
  }
}

/**
 * Usage:
 *    import { html, render } from 'lit';
 *    import { spreadEvents } from '@open-wc/lit-helpers';
 *
 *    render(
 *      html`
 *        <div
 *          ${spreadEvents({
 *            '@my-event': () => console.log('my-event fired'),
 *            '@my-other-event': () => console.log('my-other-event fired'),
 *            '@my-additional-event':
 *              () => console.log('my-additional-event fired'),
 *          })}
 *        ></div>
 *      `,
 *      document.body,
 *    );
 */
export const spreadEvents = directive(SpreadEventsDirective);

export class SpreadDirective extends SpreadEventsDirective {
  override apply(data: { [key: string]: unknown }) {
    if (!data) return;
    const { prevData, element } = this;
    for (const key in data) {
      const value = data[key];
      if (value === prevData[key]) {
        continue;
      }
      const name = key.slice(1);
      switch (key[0]) {
        case '@': // event listener
          this.eventData[name] = value;
          this.applyEvent(name, value as EventListenerWithOptions);
          break;
        case '.': // property
          // @ts-ignore
          element[name] = value;
          break;
        case '?': // boolean attribute
          if (value) {
            element.setAttribute(name, '');
          } else {
            element.removeAttribute(name);
          }
          break;
        default:
          // standard attribute
          if (value != null) {
            element.setAttribute(key, String(value));
          } else {
            element.removeAttribute(key);
          }
          break;
      }
    }
  }

  override groom(data: { [key: string]: unknown }) {
    const { prevData, element } = this;
    if (!prevData) return;
    for (const key in prevData) {
      const name = key.slice(1);
      if (
        !data ||
        (!(key in data) && element[name as keyof Element] === prevData[key])
      ) {
        switch (key[0]) {
          case '@': // event listener
            this.groomEvent(name, prevData[key] as EventListenerWithOptions);
            break;
          case '.': // property
            // @ts-ignore
            element[name] = undefined;
            break;
          case '?': // boolean attribute
            element.removeAttribute(name);
            break;
          default:
            // standard attribute
            element.removeAttribute(key);
            break;
        }
      }
    }
  }
}

/**
 * Usage:
 *    import { html, render } from 'lit';
 *    import { spread } from '@open-wc/lit-helpers';
 *
 *    render(
 *      html`
 *        <div
 *          ${spread({
 *            'my-attribute': 'foo',
 *            '?my-boolean-attribute': true,
 *            '.myProperty': { foo: 'bar' },
 *            '@my-event': () => console.log('my-event fired'),
 *          })}
 *        ></div>
 *      `,
 *      document.body,
 *    );
 */
export const litSpread = directive(SpreadDirective);

export class KaoriSpreadDirective extends SpreadEventsDirective {
  override apply(data: { [key: string]: unknown }) {
    if (!data) return;
    const { prevData, element } = this;
    for (const key in data) {
      const value = data[key];
      if (value === prevData[key]) {
        continue;
      }

      // Check for prop: prefix
      if (key.startsWith('prop:')) {
        const name = key.slice(5); // Remove 'prop:' prefix
        // @ts-ignore
        element[name] = value;
      }
      // Check for bool: prefix
      else if (key.startsWith('bool:')) {
        const name = key.slice(5); // Remove 'bool:' prefix
        if (value) {
          element.setAttribute(name, '');
        } else {
          element.removeAttribute(name);
        }
      }
      // Check for on prefix (event handlers)
      else if (
        key.startsWith('on') &&
        key.length > 2 &&
        key[2] === key[2].toUpperCase()
      ) {
        // Convert onClick -> click, onMyEvent -> myevent
        const eventName = key.slice(2).charAt(0).toLowerCase() + key.slice(3);
        this.eventData[eventName] = value;
        this.applyEvent(eventName, value as EventListenerWithOptions);
      }
      // Standard attribute
      else {
        if (value != null) {
          element.setAttribute(key, String(value));
        } else {
          element.removeAttribute(key);
        }
      }
    }
  }

  override groom(data: { [key: string]: unknown }) {
    const { prevData, element } = this;
    if (!prevData) return;
    for (const key in prevData) {
      if (!data || !(key in data)) {
        // Check for prop: prefix
        if (key.startsWith('prop:')) {
          const name = key.slice(5);
          if (element[name as keyof Element] === prevData[key]) {
            // @ts-ignore
            element[name] = undefined;
          }
        }
        // Check for bool: prefix
        else if (key.startsWith('bool:')) {
          const name = key.slice(5);
          element.removeAttribute(name);
        }
        // Check for on prefix (event handlers)
        else if (
          key.startsWith('on') &&
          key.length > 2 &&
          key[2] === key[2].toUpperCase()
        ) {
          const eventName = key.slice(2).charAt(0).toLowerCase() + key.slice(3);
          this.groomEvent(eventName, prevData[key] as EventListenerWithOptions);
        }
        // Standard attribute
        else {
          element.removeAttribute(key);
        }
      }
    }
  }
}

/**
 * Usage:
 *    import { html, render } from 'kaori';
 *    import { spread } from 'kaori/helpers';
 *
 *    render(
 *      html`
 *        <div
 *          ${spread({
 *            'my-attribute': 'foo',
 *            'bool:my-boolean-attribute': true,
 *            'prop:myProperty': { foo: 'bar' },
 *            'onClick': () => console.log('click event fired'),
 *          })}
 *        ></div>
 *      `,
 *      document.body,
 *    );
 */
export const spread = directive(KaoriSpreadDirective);
