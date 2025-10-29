import type * as csstype from 'csstype';
import type { nothing, TemplateResult } from 'lit-html';
import type { DirectiveResult } from 'lit-html/async-directive.js';
import type { RefOrCallback } from 'lit-html/directives/ref.js';

/*
 * Adapted from https://github.com/arcmantle/lit-jsx/blob/main/src/shared/jsx-types.ts :D
 *
 * Based on SolidJS JSX types
 *
 * Changed to support Lit-html
 */

type DOMElement = Element;

type IfEquals<X, Y, A = X> =
  (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2
    ? A
    : never;
type WritableKeys<T> = {
  [P in keyof T]-?: IfEquals<
    { [Q in P]: T[P] },
    { -readonly [Q in P]: T[P] },
    P
  >;
}[keyof T];
type TrimReadonly<T> = Pick<T, WritableKeys<T>>;
type ExcludeHTML<T extends object> = TrimReadonly<
  Omit<T, keyof HTMLElement | 'constructor'>
>;

declare global {
  namespace JSX {
    type JSXElement = [
      Generator,
      DirectiveResult<any>,
      typeof nothing,
      TemplateResult<any>,
      Node,
      JSXElement[],
      string & {},
      number,
      boolean,
      null,
      undefined,
      unknown,
    ][number];

    type Element = TemplateResult<any>; // This is the return type of a JSX template
    type ElementType = string | JSXElement;
    interface ElementClass {
      /* empty, libs can define requirements downstream */
    }
    interface ElementAttributesProperty {
      /* empty, libs can define requirements downstream */
    }
    interface ElementChildrenAttribute {
      children: {};
    }

    type CanBeNothing<T extends object> = {
      [K in keyof T]?:
        | T[K]
        | typeof nothing
        | ((flag: void) => T[K] | typeof nothing);
    };

    type JSXProps<T extends object> = CanBeNothing<ExcludeHTML<T>> &
      JSX.HTMLAttributes<T> & {};

    type EventHandler<T, E extends Event> = (
      e: E & {
        currentTarget: T;
        target: DOMElement;
      }
    ) => void;
    interface BoundEventHandler<
      T,
      E extends Event,
      EHandler extends EventHandler<T, any> = EventHandler<T, E>,
    > {
      0: (data: any, ...e: Parameters<EHandler>) => void;
      1: any;
    }
    type EventHandlerUnion<
      T,
      E extends Event,
      EHandler extends EventHandler<T, any> = EventHandler<T, E>,
    > = EHandler | BoundEventHandler<T, E, EHandler>;

    interface EventHandlerWithOptions<
      T,
      E extends Event,
      EHandler = EventHandler<T, E>,
    > extends AddEventListenerOptions {
      handleEvent: EHandler;
    }
    type EventHandlerWithOptionsUnion<
      T,
      E extends Event,
      EHandler extends EventHandler<T, any> = EventHandler<T, E>,
    > = EHandler | EventHandlerWithOptions<T, E, EHandler>;
    type InputEventHandler<T, E extends InputEvent> = (
      e: E & {
        currentTarget: T;
        target: T extends
          | HTMLInputElement
          | HTMLSelectElement
          | HTMLTextAreaElement
          ? T
          : DOMElement;
      }
    ) => void;
    type InputEventHandlerUnion<T, E extends InputEvent> = EventHandlerUnion<
      T,
      E,
      InputEventHandler<T, E>
    >;
    type ChangeEventHandler<T, E extends Event> = (
      e: E & {
        currentTarget: T;
        target: T extends
          | HTMLInputElement
          | HTMLSelectElement
          | HTMLTextAreaElement
          ? T
          : DOMElement;
      }
    ) => void;
    type ChangeEventHandlerUnion<T, E extends Event> = EventHandlerUnion<
      T,
      E,
      ChangeEventHandler<T, E>
    >;
    type FocusEventHandler<T, E extends FocusEvent> = (
      e: E & {
        currentTarget: T;
        target: T extends
          | HTMLInputElement
          | HTMLSelectElement
          | HTMLTextAreaElement
          ? T
          : DOMElement;
      }
    ) => void;
    type FocusEventHandlerUnion<T, E extends FocusEvent> = EventHandlerUnion<
      T,
      E,
      FocusEventHandler<T, E>
    >;

    const SERIALIZABLE: unique symbol;
    interface SerializableAttributeValue {
      toString(): string;
      [SERIALIZABLE]: never;
    }
    interface CustomAttributes<T>
      extends Partial<{
        ref: RefOrCallback<T>;
        classMap: { [k: string]: boolean | undefined };
        /**
         * This property takes in one or more element directives.\
         * This is akin to applying a directive through `<div ${myDirective()}></div>`
         */
        directive: DirectiveResult<any> | DirectiveResult<any>[];
      }> {}
    interface CustomEvents {}
    type OnAttributes<T> = {
      [Key in keyof CustomEvents as `on-${Key}`]?: EventHandlerWithOptionsUnion<
        T,
        CustomEvents[Key]
      >;
    };
    type ElementDirective = Partial<
      Record<`dir:${string}`, DirectiveResult<any>>
    >;
    interface DOMAttributes<T>
      extends CustomAttributes<T>,
        OnAttributes<T>,
        ElementDirective,
        PropAttributes,
        BoolAttributes,
        CustomEventHandlersNamespaced<T>,
        CanBeNothing<{
          children: JSXElement;
          innerHTML: string;
          innerText: string | number;
          textContent: string | number;
        }> {}

    interface CustomEventHandlersNamespaced<T>
      extends Partial<{
        onCopy: EventHandlerWithOptionsUnion<T, ClipboardEvent>;
        onCut: EventHandlerWithOptionsUnion<T, ClipboardEvent>;
        onPaste: EventHandlerWithOptionsUnion<T, ClipboardEvent>;
        onCompositionend: EventHandlerWithOptionsUnion<T, CompositionEvent>;
        onCompositionstart: EventHandlerWithOptionsUnion<T, CompositionEvent>;
        onCompositionupdate: EventHandlerWithOptionsUnion<T, CompositionEvent>;
        onFocusout: EventHandlerWithOptionsUnion<
          T,
          FocusEvent,
          FocusEventHandler<T, FocusEvent>
        >;
        onFocusin: EventHandlerWithOptionsUnion<
          T,
          FocusEvent,
          FocusEventHandler<T, FocusEvent>
        >;
        onEncrypted: EventHandlerWithOptionsUnion<T, Event>;
        onDragexit: EventHandlerWithOptionsUnion<T, DragEvent>;
        onAbort: EventHandlerWithOptionsUnion<T, Event>;
        onAnimationend: EventHandlerWithOptionsUnion<T, AnimationEvent>;
        onAnimationiteration: EventHandlerWithOptionsUnion<T, AnimationEvent>;
        onAnimationstart: EventHandlerWithOptionsUnion<T, AnimationEvent>;
        onAuxclick: EventHandlerWithOptionsUnion<T, MouseEvent>;
        onBeforeinput: EventHandlerWithOptionsUnion<
          T,
          InputEvent,
          InputEventHandler<T, InputEvent>
        >;
        onBeforetoggle: EventHandlerWithOptionsUnion<T, ToggleEvent>;
        onBlur: EventHandlerWithOptionsUnion<
          T,
          FocusEvent,
          FocusEventHandler<T, FocusEvent>
        >;
        onCanplay: EventHandlerWithOptionsUnion<T, Event>;
        onCanplaythrough: EventHandlerWithOptionsUnion<T, Event>;
        onChange: EventHandlerWithOptionsUnion<
          T,
          Event,
          ChangeEventHandler<T, Event>
        >;
        onClick: EventHandlerWithOptionsUnion<T, MouseEvent>;
        onContextmenu: EventHandlerWithOptionsUnion<T, MouseEvent>;
        onDblclick: EventHandlerWithOptionsUnion<T, MouseEvent>;
        onDrag: EventHandlerWithOptionsUnion<T, DragEvent>;
        onDragend: EventHandlerWithOptionsUnion<T, DragEvent>;
        onDragenter: EventHandlerWithOptionsUnion<T, DragEvent>;
        onDragleave: EventHandlerWithOptionsUnion<T, DragEvent>;
        onDragover: EventHandlerWithOptionsUnion<T, DragEvent>;
        onDragstart: EventHandlerWithOptionsUnion<T, DragEvent>;
        onDrop: EventHandlerWithOptionsUnion<T, DragEvent>;
        onDurationchange: EventHandlerWithOptionsUnion<T, Event>;
        onEmptied: EventHandlerWithOptionsUnion<T, Event>;
        onEnded: EventHandlerWithOptionsUnion<T, Event>;
        onError: EventHandlerWithOptionsUnion<T, Event>;
        onFocus: EventHandlerWithOptionsUnion<
          T,
          FocusEvent,
          FocusEventHandler<T, FocusEvent>
        >;
        onGotpointercapture: EventHandlerWithOptionsUnion<T, PointerEvent>;
        onInput: EventHandlerWithOptionsUnion<
          T,
          InputEvent,
          InputEventHandler<T, InputEvent>
        >;
        onInvalid: EventHandlerWithOptionsUnion<T, Event>;
        onKeydown: EventHandlerWithOptionsUnion<T, KeyboardEvent>;
        onKeypress: EventHandlerWithOptionsUnion<T, KeyboardEvent>;
        onKeyup: EventHandlerWithOptionsUnion<T, KeyboardEvent>;
        onLoad: EventHandlerWithOptionsUnion<T, Event>;
        onLoadeddata: EventHandlerWithOptionsUnion<T, Event>;
        onLoadedmetadata: EventHandlerWithOptionsUnion<T, Event>;
        onLoadstart: EventHandlerWithOptionsUnion<T, Event>;
        onLostpointercapture: EventHandlerWithOptionsUnion<T, PointerEvent>;
        onMousedown: EventHandlerWithOptionsUnion<T, MouseEvent>;
        onMouseenter: EventHandlerWithOptionsUnion<T, MouseEvent>;
        onMouseleave: EventHandlerWithOptionsUnion<T, MouseEvent>;
        onMousemove: EventHandlerWithOptionsUnion<T, MouseEvent>;
        onMouseout: EventHandlerWithOptionsUnion<T, MouseEvent>;
        onMouseover: EventHandlerWithOptionsUnion<T, MouseEvent>;
        onMouseup: EventHandlerWithOptionsUnion<T, MouseEvent>;
        onPause: EventHandlerWithOptionsUnion<T, Event>;
        onPlay: EventHandlerWithOptionsUnion<T, Event>;
        onPlaying: EventHandlerWithOptionsUnion<T, Event>;
        onPointercancel: EventHandlerWithOptionsUnion<T, PointerEvent>;
        onPointerdown: EventHandlerWithOptionsUnion<T, PointerEvent>;
        onPointerenter: EventHandlerWithOptionsUnion<T, PointerEvent>;
        onPointerleave: EventHandlerWithOptionsUnion<T, PointerEvent>;
        onPointermove: EventHandlerWithOptionsUnion<T, PointerEvent>;
        onPointerout: EventHandlerWithOptionsUnion<T, PointerEvent>;
        onPointerover: EventHandlerWithOptionsUnion<T, PointerEvent>;
        onPointerup: EventHandlerWithOptionsUnion<T, PointerEvent>;
        onProgress: EventHandlerWithOptionsUnion<T, ProgressEvent>;
        onRatechange: EventHandlerWithOptionsUnion<T, Event>;
        onReset: EventHandlerWithOptionsUnion<T, Event>;
        onScroll: EventHandlerWithOptionsUnion<T, Event>;
        onScrollend: EventHandlerWithOptionsUnion<T, Event>;
        onSeeked: EventHandlerWithOptionsUnion<T, Event>;
        onSeeking: EventHandlerWithOptionsUnion<T, Event>;
        onSelect: EventHandlerWithOptionsUnion<T, Event>;
        onStalled: EventHandlerWithOptionsUnion<T, Event>;
        onSubmit: EventHandlerWithOptionsUnion<T, SubmitEvent>;
        onSuspend: EventHandlerWithOptionsUnion<T, Event>;
        onTimeupdate: EventHandlerWithOptionsUnion<T, Event>;
        onToggle: EventHandlerWithOptionsUnion<T, ToggleEvent>;
        onTouchcancel: EventHandlerWithOptionsUnion<T, TouchEvent>;
        onTouchend: EventHandlerWithOptionsUnion<T, TouchEvent>;
        onTouchmove: EventHandlerWithOptionsUnion<T, TouchEvent>;
        onTouchstart: EventHandlerWithOptionsUnion<T, TouchEvent>;
        onTransitionstart: EventHandlerWithOptionsUnion<T, TransitionEvent>;
        onTransitionend: EventHandlerWithOptionsUnion<T, TransitionEvent>;
        onTransitionrun: EventHandlerWithOptionsUnion<T, TransitionEvent>;
        onTransitioncancel: EventHandlerWithOptionsUnion<T, TransitionEvent>;
        onVolumechange: EventHandlerWithOptionsUnion<T, Event>;
        onWaiting: EventHandlerWithOptionsUnion<T, Event>;
        onWheel: EventHandlerWithOptionsUnion<T, WheelEvent>;
      }> {}

    interface CSSProperties extends csstype.Properties {}

    type HTMLAutocapitalize = [
      'off',
      'none',
      'on',
      'sentences',
      'words',
      'characters',
    ][number];
    type HTMLDir = ['ltr', 'rtl', 'auto'][number];
    type HTMLFormEncType = [
      'application/x-www-form-urlencoded',
      'multipart/form-data',
      'text/plain',
    ][number];
    type HTMLFormMethod = ['post', 'get', 'dialog'][number];
    type HTMLCrossorigin = ['anonymous', 'use-credentials', '' & {}][number];
    type HTMLReferrerPolicy = [
      'no-referrer',
      'no-referrer-when-downgrade',
      'origin',
      'origin-when-cross-origin',
      'same-origin',
      'strict-origin',
      'strict-origin-when-cross-origin',
      'unsafe-url',
    ][number];
    type HTMLIframeSandbox = [
      'allow-downloads-without-user-activation',
      'allow-downloads',
      'allow-forms',
      'allow-modals',
      'allow-orientation-lock',
      'allow-pointer-lock',
      'allow-popups',
      'allow-popups-to-escape-sandbox',
      'allow-presentation',
      'allow-same-origin',
      'allow-scripts',
      'allow-storage-access-by-user-activation',
      'allow-top-navigation',
      'allow-top-navigation-by-user-activation',
      'allow-top-navigation-to-custom-protocols',
    ][number];
    type HTMLLinkAs = [
      'audio',
      'document',
      'embed',
      'fetch',
      'font',
      'image',
      'object',
      'script',
      'style',
      'track',
      'video',
      'worker',
    ][number];

    // All the WAI-ARIA 1.1 attributes from https://www.w3.org/TR/wai-aria-1.1/
    interface AriaAttributes
      extends CanBeNothing<{
        /**
         * Identifies the currently active element when DOM focus is on a composite widget, textbox,
         * group, or application.
         */
        'aria-activedescendant': string;
        /**
         * Indicates whether assistive technologies will present all, or only parts of, the changed
         * region based on the change notifications defined by the aria-relevant attribute.
         */
        'aria-atomic': boolean | 'false' | 'true';
        /**
         * Indicates whether inputting text could trigger display of one or more predictions of the
         * user's intended value for an input and specifies how predictions would be presented if they
         * are made.
         */
        'aria-autocomplete': 'none' | 'inline' | 'list' | 'both';
        /**
         * Indicates an element is being modified and that assistive technologies MAY want to wait until
         * the modifications are complete before exposing them to the user.
         */
        'aria-busy': boolean | 'false' | 'true';
        /**
         * Indicates the current "checked" state of checkboxes, radio buttons, and other widgets.
         *
         * @see aria-pressed @see aria-selected.
         */
        'aria-checked': boolean | 'false' | 'mixed' | 'true';
        /**
         * Defines the total number of columns in a table, grid, or treegrid.
         *
         * @see aria-colindex.
         */
        'aria-colcount': number | string;
        /**
         * Defines an element's column index or position with respect to the total number of columns
         * within a table, grid, or treegrid.
         *
         * @see aria-colcount @see aria-colspan.
         */
        'aria-colindex': number | string;
        /**
         * Defines the number of columns spanned by a cell or gridcell within a table, grid, or
         * treegrid.
         *
         * @see aria-colindex @see aria-rowspan.
         */
        'aria-colspan': number | string;
        /**
         * Identifies the element (or elements) whose contents or presence are controlled by the current
         * element.
         *
         * @see aria-owns.
         */
        'aria-controls': string;
        /**
         * Indicates the element that represents the current item within a container or set of related
         * elements.
         */
        'aria-current':
          | boolean
          | 'false'
          | 'true'
          | 'page'
          | 'step'
          | 'location'
          | 'date'
          | 'time'
          | undefined;
        /**
         * Identifies the element (or elements) that describes the object.
         *
         * @see aria-labelledby
         */
        'aria-describedby': string;
        /**
         * Identifies the element that provides a detailed, extended description for the object.
         *
         * @see aria-describedby.
         */
        'aria-details': string;
        /**
         * Indicates that the element is perceivable but disabled, so it is not editable or otherwise
         * operable.
         *
         * @see aria-hidden @see aria-readonly.
         */
        'aria-disabled': boolean | 'false' | 'true';
        /**
         * Indicates what functions can be performed when a dragged object is released on the drop
         * target.
         *
         * @deprecated In ARIA 1.1
         */
        'aria-dropeffect':
          | 'none'
          | 'copy'
          | 'execute'
          | 'link'
          | 'move'
          | 'popup';
        /**
         * Identifies the element that provides an error message for the object.
         *
         * @see aria-invalid @see aria-describedby.
         */
        'aria-errormessage': string;
        /**
         * Indicates whether the element, or another grouping element it controls, is currently expanded
         * or collapsed.
         */
        'aria-expanded': boolean | 'false' | 'true';
        /**
         * Identifies the next element (or elements) in an alternate reading order of content which, at
         * the user's discretion, allows assistive technology to override the general default of reading
         * in document source order.
         */
        'aria-flowto': string;
        /**
         * Indicates an element's "grabbed" state in a drag-and-drop operation.
         *
         * @deprecated In ARIA 1.1
         */
        'aria-grabbed': boolean | 'false' | 'true';
        /**
         * Indicates the availability and type of interactive popup element, such as menu or dialog,
         * that can be triggered by an element.
         */
        'aria-haspopup':
          | boolean
          | 'false'
          | 'true'
          | 'menu'
          | 'listbox'
          | 'tree'
          | 'grid'
          | 'dialog'
          | undefined;
        /**
         * Indicates whether the element is exposed to an accessibility API.
         *
         * @see aria-disabled.
         */
        'aria-hidden': boolean | 'false' | 'true';
        /**
         * Indicates the entered value does not conform to the format expected by the application.
         *
         * @see aria-errormessage.
         */
        'aria-invalid': boolean | 'false' | 'true' | 'grammar' | 'spelling';
        /**
         * Indicates keyboard shortcuts that an author has implemented to activate or give focus to an
         * element.
         */
        'aria-keyshortcuts': string;
        /**
         * Defines a string value that labels the current element.
         *
         * @see aria-labelledby.
         */
        'aria-label': string;
        /**
         * Identifies the element (or elements) that labels the current element.
         *
         * @see aria-describedby.
         */
        'aria-labelledby': string;
        /** Defines the hierarchical level of an element within a structure. */
        'aria-level': number | string;
        /**
         * Indicates that an element will be updated, and describes the types of updates the user
         * agents, assistive technologies, and user can expect from the live region.
         */
        'aria-live': 'off' | 'assertive' | 'polite';
        /** Indicates whether an element is modal when displayed. */
        'aria-modal': boolean | 'false' | 'true';
        /** Indicates whether a text box accepts multiple lines of input or only a single line. */
        'aria-multiline': boolean | 'false' | 'true';
        /**
         * Indicates that the user may select more than one item from the current selectable
         * descendants.
         */
        'aria-multiselectable': boolean | 'false' | 'true';
        /** Indicates whether the element's orientation is horizontal, vertical, or unknown/ambiguous. */
        'aria-orientation': 'horizontal' | 'vertical';
        /**
         * Identifies an element (or elements) in order to define a visual, functional, or contextual
         * parent/child relationship between DOM elements where the DOM hierarchy cannot be used to
         * represent the relationship.
         *
         * @see aria-controls.
         */
        'aria-owns': string;
        /**
         * Defines a short hint (a word or short phrase) intended to aid the user with data entry when
         * the control has no value. A hint could be a sample value or a brief description of the
         * expected format.
         */
        'aria-placeholder': string;
        /**
         * Defines an element's number or position in the current set of listitems or treeitems. Not
         * required if all elements in the set are present in the DOM.
         *
         * @see aria-setsize.
         */
        'aria-posinset': number | string;
        /**
         * Indicates the current "pressed" state of toggle buttons.
         *
         * @see aria-checked @see aria-selected.
         */
        'aria-pressed': boolean | 'false' | 'mixed' | 'true';
        /**
         * Indicates that the element is not editable, but is otherwise operable.
         *
         * @see aria-disabled.
         */
        'aria-readonly': boolean | 'false' | 'true';
        /**
         * Indicates what notifications the user agent will trigger when the accessibility tree within a
         * live region is modified.
         *
         * @see aria-atomic.
         */
        'aria-relevant':
          | 'additions'
          | 'additions removals'
          | 'additions text'
          | 'all'
          | 'removals'
          | 'removals additions'
          | 'removals text'
          | 'text'
          | 'text additions'
          | 'text removals'
          | undefined;
        /** Indicates that user input is required on the element before a form may be submitted. */
        'aria-required': boolean | 'false' | 'true';
        /** Defines a human-readable, author-localized description for the role of an element. */
        'aria-roledescription': string;
        /**
         * Defines the total number of rows in a table, grid, or treegrid.
         *
         * @see aria-rowindex.
         */
        'aria-rowcount': number | string;
        /**
         * Defines an element's row index or position with respect to the total number of rows within a
         * table, grid, or treegrid.
         *
         * @see aria-rowcount @see aria-rowspan.
         */
        'aria-rowindex': number | string;
        /**
         * Defines the number of rows spanned by a cell or gridcell within a table, grid, or treegrid.
         *
         * @see aria-rowindex @see aria-colspan.
         */
        'aria-rowspan': number | string;
        /**
         * Indicates the current "selected" state of various widgets.
         *
         * @see aria-checked @see aria-pressed.
         */
        'aria-selected': boolean | 'false' | 'true';
        /**
         * Defines the number of items in the current set of listitems or treeitems. Not required if all
         * elements in the set are present in the DOM.
         *
         * @see aria-posinset.
         */
        'aria-setsize': number | string;
        /** Indicates if items in a table or grid are sorted in ascending or descending order. */
        'aria-sort': 'none' | 'ascending' | 'descending' | 'other';
        /** Defines the maximum allowed value for a range widget. */
        'aria-valuemax': number | string;
        /** Defines the minimum allowed value for a range widget. */
        'aria-valuemin': number | string;
        /**
         * Defines the current value for a range widget.
         *
         * @see aria-valuetext.
         */
        'aria-valuenow': number | string;
        /** Defines the human readable text alternative of aria-valuenow for a range widget. */
        'aria-valuetext': string;
        role:
          | 'alert'
          | 'alertdialog'
          | 'application'
          | 'article'
          | 'banner'
          | 'button'
          | 'cell'
          | 'checkbox'
          | 'columnheader'
          | 'combobox'
          | 'complementary'
          | 'contentinfo'
          | 'definition'
          | 'dialog'
          | 'directory'
          | 'document'
          | 'feed'
          | 'figure'
          | 'form'
          | 'grid'
          | 'gridcell'
          | 'group'
          | 'heading'
          | 'img'
          | 'link'
          | 'list'
          | 'listbox'
          | 'listitem'
          | 'log'
          | 'main'
          | 'marquee'
          | 'math'
          | 'menu'
          | 'menubar'
          | 'menuitem'
          | 'menuitemcheckbox'
          | 'menuitemradio'
          | 'meter'
          | 'navigation'
          | 'none'
          | 'note'
          | 'option'
          | 'presentation'
          | 'progressbar'
          | 'radio'
          | 'radiogroup'
          | 'region'
          | 'row'
          | 'rowgroup'
          | 'rowheader'
          | 'scrollbar'
          | 'search'
          | 'searchbox'
          | 'separator'
          | 'slider'
          | 'spinbutton'
          | 'status'
          | 'switch'
          | 'tab'
          | 'table'
          | 'tablist'
          | 'tabpanel'
          | 'term'
          | 'textbox'
          | 'timer'
          | 'toolbar'
          | 'tooltip'
          | 'tree'
          | 'treegrid'
          | 'treeitem';
      }> {}
    interface HTMLAttributes<T>
      extends AriaAttributes,
        DOMAttributes<T>,
        CanBeNothing<{
          accessKey: string;
          class: string;
          contenteditable: boolean | 'plaintext-only' | 'inherit';
          contextmenu: string;
          dir: HTMLDir;
          draggable: boolean | 'false' | 'true';
          hidden: boolean | 'hidden' | 'until-found';
          id: string;
          is: string;
          inert: boolean;
          lang: string;
          spellcheck: boolean;
          style: CSSProperties | string | undefined;
          tabindex: number | string;
          title: string;
          translate: 'yes' | 'no';
          about: string;
          datatype: string;
          inlist: any;
          popover: boolean | 'manual' | 'auto';
          prefix: string;
          property: string;
          resource: string;
          typeof: string;
          vocab: string;
          autocapitalize: HTMLAutocapitalize;
          slot: string;
          color: string;
          itemprop: string;
          itemscope: boolean;
          itemtype: string;
          itemid: string;
          itemref: string;
          part: string;
          exportparts: string;
          inputmode:
            | 'none'
            | 'text'
            | 'tel'
            | 'url'
            | 'email'
            | 'numeric'
            | 'decimal'
            | 'search';
          contentEditable: boolean | 'plaintext-only' | 'inherit';
          contextMenu: string;
          tabIndex: number | string;
          autoCapitalize: HTMLAutocapitalize;
          itemProp: string;
          itemScope: boolean;
          itemType: string;
          itemId: string;
          itemRef: string;
          exportParts: string;
          inputMode:
            | 'none'
            | 'text'
            | 'tel'
            | 'url'
            | 'email'
            | 'numeric'
            | 'decimal'
            | 'search';
        }> {
      /** Tells the compiler to compile this Functional Component using its tag as a static literal */
      static?: boolean;
    }
    interface AnchorHTMLAttributes<T>
      extends HTMLAttributes<T>,
        CanBeNothing<{
          download: any;
          href: string;
          hreflang: string;
          media: string;
          ping: string;
          referrerpolicy: HTMLReferrerPolicy;
          rel: string;
          target: string;
          type: string;
          referrerPolicy: HTMLReferrerPolicy;
        }> {}
    interface AudioHTMLAttributes<T> extends MediaHTMLAttributes<T> {}
    interface AreaHTMLAttributes<T>
      extends HTMLAttributes<T>,
        CanBeNothing<{
          alt: string;
          coords: string;
          download: any;
          href: string;
          hreflang: string;
          ping: string;
          referrerpolicy: HTMLReferrerPolicy;
          rel: string;
          shape: 'rect' | 'circle' | 'poly' | 'default';
          target: string;
          referrerPolicy: HTMLReferrerPolicy;
        }> {}
    interface BaseHTMLAttributes<T>
      extends HTMLAttributes<T>,
        CanBeNothing<{
          href: string;
          target: string;
        }> {}
    interface BlockquoteHTMLAttributes<T>
      extends HTMLAttributes<T>,
        CanBeNothing<{
          cite: string;
        }> {}
    interface ButtonHTMLAttributes<T>
      extends HTMLAttributes<T>,
        CanBeNothing<{
          autofocus: boolean;
          disabled: boolean;
          form: string;
          formaction: string | SerializableAttributeValue;
          formenctype: HTMLFormEncType;
          formmethod: HTMLFormMethod;
          formnovalidate: boolean;
          formtarget: string;
          popovertarget: string;
          popovertargetaction: 'hide' | 'show' | 'toggle';
          name: string;
          type: 'submit' | 'reset' | 'button';
          value: string;
          formAction: string | SerializableAttributeValue;
          formEnctype: HTMLFormEncType;
          formMethod: HTMLFormMethod;
          formNoValidate: boolean;
          formTarget: string;
          popoverTarget: string;
          popoverTargetAction: 'hide' | 'show' | 'toggle';
        }> {}
    interface CanvasHTMLAttributes<T>
      extends HTMLAttributes<T>,
        CanBeNothing<{
          width: number | string;
          height: number | string;
        }> {}
    interface ColHTMLAttributes<T>
      extends HTMLAttributes<T>,
        CanBeNothing<{
          span: number | string;
          width: number | string;
        }> {}
    interface ColgroupHTMLAttributes<T>
      extends HTMLAttributes<T>,
        CanBeNothing<{
          span: number | string;
        }> {}
    interface DataHTMLAttributes<T>
      extends HTMLAttributes<T>,
        CanBeNothing<{
          value: string | string[] | number;
        }> {}
    interface DetailsHtmlAttributes<T>
      extends HTMLAttributes<T>,
        CanBeNothing<{
          open: boolean;
        }> {}
    interface DialogHtmlAttributes<T>
      extends HTMLAttributes<T>,
        CanBeNothing<{
          open: boolean;
          onClose: EventHandlerUnion<T, Event>;
          onCancel: EventHandlerUnion<T, Event>;
        }> {}
    interface EmbedHTMLAttributes<T>
      extends HTMLAttributes<T>,
        CanBeNothing<{
          height: number | string;
          width: number | string;
          src: string;
          type: string;
        }> {}
    interface FieldsetHTMLAttributes<T>
      extends HTMLAttributes<T>,
        CanBeNothing<{
          disabled: boolean;
          form: string;
          name: string;
        }> {}
    interface FormHTMLAttributes<T>
      extends HTMLAttributes<T>,
        CanBeNothing<{
          'accept-charset': string;
          action: string | SerializableAttributeValue;
          autocomplete: string;
          encoding: HTMLFormEncType;
          enctype: HTMLFormEncType;
          method: HTMLFormMethod;
          name: string;
          novalidate: boolean;
          target: string;
          noValidate: boolean;
        }> {}
    interface IframeHTMLAttributes<T>
      extends HTMLAttributes<T>,
        CanBeNothing<{
          allow: string;
          allowfullscreen: boolean;
          height: number | string;
          loading: 'eager' | 'lazy';
          name: string;
          referrerpolicy: HTMLReferrerPolicy;
          sandbox: HTMLIframeSandbox | string;
          src: string;
          srcdoc: string;
          width: number | string;
          referrerPolicy: HTMLReferrerPolicy;
        }> {}
    interface ImgHTMLAttributes<T>
      extends HTMLAttributes<T>,
        CanBeNothing<{
          alt: string;
          crossorigin: HTMLCrossorigin;
          decoding: 'sync' | 'async' | 'auto';
          height: number | string;
          ismap: boolean;
          isMap: boolean;
          loading: 'eager' | 'lazy';
          referrerpolicy: HTMLReferrerPolicy;
          referrerPolicy: HTMLReferrerPolicy;
          sizes: string;
          src: string;
          srcset: string;
          srcSet: string;
          usemap: string;
          useMap: string;
          width: number | string;
          crossOrigin: HTMLCrossorigin;
          elementtiming: string;
          fetchpriority: 'high' | 'low' | 'auto';
        }> {}
    interface InputHTMLAttributes<T>
      extends HTMLAttributes<T>,
        CanBeNothing<{
          accept: string;
          alt: string;
          autocomplete: string;
          autocorrect: 'on' | 'off';
          autofocus: boolean;
          capture: boolean | string;
          'bool:checked': boolean;
          'prop:value': string | string[] | number;
          crossorigin: HTMLCrossorigin;
          disabled: boolean;
          enterkeyhint:
            | 'enter'
            | 'done'
            | 'go'
            | 'next'
            | 'previous'
            | 'search'
            | 'send';
          form: string;
          formaction: string | SerializableAttributeValue;
          formenctype: HTMLFormEncType;
          formmethod: HTMLFormMethod;
          formnovalidate: boolean;
          formtarget: string;
          height: number | string;
          incremental: boolean;
          list: string;
          max: number | string;
          maxlength: number | string;
          min: number | string;
          minlength: number | string;
          multiple: boolean;
          name: string;
          pattern: string;
          placeholder: string;
          readonly: boolean;
          results: number;
          required: boolean;
          size: number | string;
          src: string;
          step: number | string;
          type: string;
          width: number | string;
          crossOrigin: HTMLCrossorigin;
          formAction: string | SerializableAttributeValue;
          formEnctype: HTMLFormEncType;
          formMethod: HTMLFormMethod;
          formNoValidate: boolean;
          formTarget: string;
          maxLength: number | string;
          minLength: number | string;
          readOnly: boolean;
        }> {}
    interface InsHTMLAttributes<T>
      extends HTMLAttributes<T>,
        CanBeNothing<{
          cite: string;
          dateTime: string;
        }> {}
    interface KeygenHTMLAttributes<T>
      extends HTMLAttributes<T>,
        CanBeNothing<{
          autofocus: boolean;
          challenge: string;
          disabled: boolean;
          form: string;
          keytype: string;
          keyparams: string;
          name: string;
        }> {}
    interface LabelHTMLAttributes<T>
      extends HTMLAttributes<T>,
        CanBeNothing<{
          for: string;
          form: string;
        }> {}
    interface LiHTMLAttributes<T>
      extends HTMLAttributes<T>,
        CanBeNothing<{
          value: number | string;
        }> {}
    interface LinkHTMLAttributes<T>
      extends HTMLAttributes<T>,
        CanBeNothing<{
          as: HTMLLinkAs;
          crossorigin: HTMLCrossorigin;
          disabled: boolean;
          fetchpriority: 'high' | 'low' | 'auto';
          href: string;
          hreflang: string;
          imagesizes: string;
          imagesrcset: string;
          integrity: string;
          media: string;
          referrerpolicy: HTMLReferrerPolicy;
          rel: string;
          sizes: string;
          type: string;
          crossOrigin: HTMLCrossorigin;
          referrerPolicy: HTMLReferrerPolicy;
        }> {}
    interface MapHTMLAttributes<T>
      extends HTMLAttributes<T>,
        CanBeNothing<{
          name: string;
        }> {}
    interface MediaHTMLAttributes<T>
      extends HTMLAttributes<T>,
        CanBeNothing<{
          autoplay: boolean;
          controls: boolean;
          crossorigin: HTMLCrossorigin;
          loop: boolean;
          mediagroup: string;
          muted: boolean;
          preload: 'none' | 'metadata' | 'auto' | '';
          src: string;
          crossOrigin: HTMLCrossorigin;
          mediaGroup: string;
        }> {}
    interface MenuHTMLAttributes<T>
      extends HTMLAttributes<T>,
        CanBeNothing<{
          label: string;
          type: 'context' | 'toolbar';
        }> {}
    interface MetaHTMLAttributes<T>
      extends HTMLAttributes<T>,
        CanBeNothing<{
          charset: string;
          content: string;
          'http-equiv': string;
          name: string;
          media: string;
        }> {}
    interface MeterHTMLAttributes<T>
      extends HTMLAttributes<T>,
        CanBeNothing<{
          form: string;
          high: number | string;
          low: number | string;
          max: number | string;
          min: number | string;
          optimum: number | string;
          value: string | string[] | number;
        }> {}
    interface QuoteHTMLAttributes<T>
      extends HTMLAttributes<T>,
        CanBeNothing<{
          cite: string;
        }> {}
    interface ObjectHTMLAttributes<T>
      extends HTMLAttributes<T>,
        CanBeNothing<{
          data: string;
          form: string;
          height: number | string;
          name: string;
          type: string;
          usemap: string;
          width: number | string;
          useMap: string;
        }> {}
    interface OlHTMLAttributes<T>
      extends HTMLAttributes<T>,
        CanBeNothing<{
          reversed: boolean;
          start: number | string;
          type: '1' | 'a' | 'A' | 'i' | 'I';
        }> {}
    interface OptgroupHTMLAttributes<T>
      extends HTMLAttributes<T>,
        CanBeNothing<{
          disabled: boolean;
          label: string;
        }> {}
    interface OptionHTMLAttributes<T>
      extends HTMLAttributes<T>,
        CanBeNothing<{
          disabled: boolean;
          label: string;
          selected: boolean;
          value: string | string[] | number;
        }> {}
    interface OutputHTMLAttributes<T>
      extends HTMLAttributes<T>,
        CanBeNothing<{
          form: string;
          for: string;
          name: string;
        }> {}
    interface ParamHTMLAttributes<T>
      extends HTMLAttributes<T>,
        CanBeNothing<{
          name: string;
          value: string | string[] | number;
        }> {}
    interface ProgressHTMLAttributes<T>
      extends HTMLAttributes<T>,
        CanBeNothing<{
          max: number | string;
          value: string | string[] | number;
        }> {}
    interface ScriptHTMLAttributes<T>
      extends HTMLAttributes<T>,
        CanBeNothing<{
          async: boolean;
          charset: string;
          crossorigin: HTMLCrossorigin;
          defer: boolean;
          integrity: string;
          nomodule: boolean;
          nonce: string;
          referrerpolicy: HTMLReferrerPolicy;
          src: string;
          type: string;
          crossOrigin: HTMLCrossorigin;
          noModule: boolean;
          referrerPolicy: HTMLReferrerPolicy;
        }> {}
    interface SelectHTMLAttributes<T>
      extends HTMLAttributes<T>,
        CanBeNothing<{
          autocomplete: string;
          autofocus: boolean;
          disabled: boolean;
          form: string;
          multiple: boolean;
          name: string;
          required: boolean;
          size: number | string;
          value: string | string[] | number;
        }> {}
    interface HTMLSlotElementAttributes<T = HTMLSlotElement>
      extends HTMLAttributes<T>,
        CanBeNothing<{
          name: string;
        }> {}
    interface SourceHTMLAttributes<T>
      extends HTMLAttributes<T>,
        CanBeNothing<{
          media: string;
          sizes: string;
          src: string;
          srcset: string;
          type: string;
          width: number | string;
          height: number | string;
        }> {}
    interface StyleHTMLAttributes<T>
      extends HTMLAttributes<T>,
        CanBeNothing<{
          media: string;
          nonce: string;
          scoped: boolean;
          type: string;
        }> {}
    interface TdHTMLAttributes<T>
      extends HTMLAttributes<T>,
        CanBeNothing<{
          colspan: number | string;
          headers: string;
          rowspan: number | string;
          colSpan: number | string;
          rowSpan: number | string;
        }> {}
    interface TemplateHTMLAttributes<T extends HTMLTemplateElement>
      extends HTMLAttributes<T>,
        CanBeNothing<{
          content: DocumentFragment;
        }> {}
    interface TextareaHTMLAttributes<T>
      extends HTMLAttributes<T>,
        CanBeNothing<{
          autocomplete: string;
          autofocus: boolean;
          cols: number | string;
          dirname: string;
          disabled: boolean;
          enterkeyhint:
            | 'enter'
            | 'done'
            | 'go'
            | 'next'
            | 'previous'
            | 'search'
            | 'send';
          form: string;
          maxlength: number | string;
          minlength: number | string;
          name: string;
          placeholder: string;
          readonly: boolean;
          required: boolean;
          rows: number | string;
          value: string | string[] | number;
          wrap: 'hard' | 'soft' | 'off';
          maxLength: number | string;
          minLength: number | string;
          readOnly: boolean;
        }> {}
    interface ThHTMLAttributes<T>
      extends HTMLAttributes<T>,
        CanBeNothing<{
          colspan: number | string;
          headers: string;
          rowspan: number | string;
          colSpan: number | string;
          rowSpan: number | string;
          scope: 'col' | 'row' | 'rowgroup' | 'colgroup';
        }> {}
    interface TimeHTMLAttributes<T>
      extends HTMLAttributes<T>,
        CanBeNothing<{
          datetime: string;
          dateTime: string;
        }> {}
    interface TrackHTMLAttributes<T>
      extends HTMLAttributes<T>,
        CanBeNothing<{
          default: boolean;
          kind:
            | 'subtitles'
            | 'captions'
            | 'descriptions'
            | 'chapters'
            | 'metadata';
          label: string;
          src: string;
          srclang: string;
        }> {}
    interface VideoHTMLAttributes<T>
      extends MediaHTMLAttributes<T>,
        CanBeNothing<{
          height: number | string;
          playsinline: boolean;
          poster: string;
          width: number | string;
          disablepictureinpicture: boolean;
        }> {}
    type SVGPreserveAspectRatio = [
      'none',
      'xMinYMin',
      'xMidYMin',
      'xMaxYMin',
      'xMinYMid',
      'xMidYMid',
      'xMaxYMid',
      'xMinYMax',
      'xMidYMax',
      'xMaxYMax',
      'xMinYMin meet',
      'xMidYMin meet',
      'xMaxYMin meet',
      'xMinYMid meet',
      'xMidYMid meet',
      'xMaxYMid meet',
      'xMinYMax meet',
      'xMidYMax meet',
      'xMaxYMax meet',
      'xMinYMin slice',
      'xMidYMin slice',
      'xMaxYMin slice',
      'xMinYMid slice',
      'xMidYMid slice',
      'xMaxYMid slice',
      'xMinYMax slice',
      'xMidYMax slice',
      'xMaxYMax slice',
    ][number];
    type ImagePreserveAspectRatio = [
      SVGPreserveAspectRatio,
      'defer none',
      'defer xMinYMin',
      'defer xMidYMin',
      'defer xMaxYMin',
      'defer xMinYMid',
      'defer xMidYMid',
      'defer xMaxYMid',
      'defer xMinYMax',
      'defer xMidYMax',
      'defer xMaxYMax',
      'defer xMinYMin meet',
      'defer xMidYMin meet',
      'defer xMaxYMin meet',
      'defer xMinYMid meet',
      'defer xMidYMid meet',
      'defer xMaxYMid meet',
      'defer xMinYMax meet',
      'defer xMidYMax meet',
      'defer xMaxYMax meet',
      'defer xMinYMin slice',
      'defer xMidYMin slice',
      'defer xMaxYMin slice',
      'defer xMinYMid slice',
      'defer xMidYMid slice',
      'defer xMaxYMid slice',
      'defer xMinYMax slice',
      'defer xMidYMax slice',
      'defer xMaxYMax slice',
    ][number];
    type SVGUnits = 'userSpaceOnUse' | 'objectBoundingBox';
    interface CoreSVGAttributes<T>
      extends AriaAttributes,
        DOMAttributes<T>,
        CanBeNothing<{
          id: string;
          lang: string;
          tabIndex: number | string;
          tabindex: number | string;
        }> {}
    interface StylableSVGAttributes
      extends CanBeNothing<{
        class: string;
        style: CSSProperties | string;
      }> {}
    interface TransformableSVGAttributes
      extends CanBeNothing<{
        transform: string;
      }> {}
    interface ConditionalProcessingSVGAttributes
      extends CanBeNothing<{
        requiredExtensions: string;
        requiredFeatures: string;
        systemLanguage: string;
      }> {}
    interface ExternalResourceSVGAttributes
      extends CanBeNothing<{
        externalResourcesRequired: 'true' | 'false';
      }> {}
    interface AnimationTimingSVGAttributes
      extends CanBeNothing<{
        begin: string;
        dur: string;
        end: string;
        min: string;
        max: string;
        restart: 'always' | 'whenNotActive' | 'never';
        repeatCount: number | 'indefinite';
        repeatDur: string;
        fill: 'freeze' | 'remove';
      }> {}
    interface AnimationValueSVGAttributes
      extends CanBeNothing<{
        calcMode: 'discrete' | 'linear' | 'paced' | 'spline';
        values: string;
        keyTimes: string;
        keySplines: string;
        from: number | string;
        to: number | string;
        by: number | string;
      }> {}
    interface AnimationAdditionSVGAttributes
      extends CanBeNothing<{
        attributeName: string;
        additive: 'replace' | 'sum';
        accumulate: 'none' | 'sum';
      }> {}
    interface AnimationAttributeTargetSVGAttributes
      extends CanBeNothing<{
        attributeName: string;
        attributeType: 'CSS' | 'XML' | 'auto';
      }> {}
    interface PresentationSVGAttributes
      extends CanBeNothing<{
        'alignment-baseline': [
          'auto',
          'baseline',
          'before-edge',
          'text-before-edge',
          'middle',
          'central',
          'after-edge',
          'text-after-edge',
          'ideographic',
          'alphabetic',
          'hanging',
          'mathematical',
          'inherit',
        ][number];
        'baseline-shift': number | string;
        clip: string;
        'clip-path': string;
        'clip-rule': 'nonzero' | 'evenodd' | 'inherit';
        color: string;
        'color-interpolation': 'auto' | 'sRGB' | 'linearRGB' | 'inherit';
        'color-interpolation-filters':
          | 'auto'
          | 'sRGB'
          | 'linearRGB'
          | 'inherit';
        'color-profile': string;
        'color-rendering':
          | 'auto'
          | 'optimizeSpeed'
          | 'optimizeQuality'
          | 'inherit';
        cursor: string;
        direction: 'ltr' | 'rtl' | 'inherit';
        display: string;
        'dominant-baseline': [
          'auto',
          'text-bottom',
          'alphabetic',
          'ideographic',
          'middle',
          'central',
          'mathematical',
          'hanging',
          'text-top',
          'inherit',
        ][number];
        'enable-background': string;
        fill: string;
        'fill-opacity': number | string | 'inherit';
        'fill-rule': 'nonzero' | 'evenodd' | 'inherit';
        filter: string;
        'flood-color': string;
        'flood-opacity': number | string | 'inherit';
        'font-family': string;
        'font-size': string;
        'font-size-adjust': number | string;
        'font-stretch': string;
        'font-style': 'normal' | 'italic' | 'oblique' | 'inherit';
        'font-variant': string;
        'font-weight': number | string;
        'glyph-orientation-horizontal': string;
        'glyph-orientation-vertical': string;
        'image-rendering':
          | 'auto'
          | 'optimizeQuality'
          | 'optimizeSpeed'
          | 'inherit';
        kerning: string;
        'letter-spacing': number | string;
        'lighting-color': string;
        'marker-end': string;
        'marker-mid': string;
        'marker-start': string;
        mask: string;
        opacity: number | string | 'inherit';
        overflow: 'visible' | 'hidden' | 'scroll' | 'auto' | 'inherit';
        pathLength: string | number;
        'pointer-events': [
          'bounding-box',
          'visiblePainted',
          'visibleFill',
          'visibleStroke',
          'visible',
          'painted',
          'color',
          'fill',
          'stroke',
          'all',
          'none',
          'inherit',
        ][number];
        'shape-rendering': [
          'auto',
          'optimizeSpeed',
          'crispEdges',
          'geometricPrecision',
          'inherit',
        ][number];
        'stop-color': string;
        'stop-opacity': number | string | 'inherit';
        stroke: string;
        'stroke-dasharray': string;
        'stroke-dashoffset': number | string;
        'stroke-linecap': 'butt' | 'round' | 'square' | 'inherit';
        'stroke-linejoin':
          | 'arcs'
          | 'bevel'
          | 'miter'
          | 'miter-clip'
          | 'round'
          | 'inherit';
        'stroke-miterlimit': number | string | 'inherit';
        'stroke-opacity': number | string | 'inherit';
        'stroke-width': number | string;
        'text-anchor': 'start' | 'middle' | 'end' | 'inherit';
        'text-decoration': [
          'none',
          'underline',
          'overline',
          'line-through',
          'blink',
          'inherit',
        ][number];
        'text-rendering': [
          'auto',
          'optimizeSpeed',
          'optimizeLegibility',
          'geometricPrecision',
          'inherit',
        ][number];
        'unicode-bidi': string;
        visibility: 'visible' | 'hidden' | 'collapse' | 'inherit';
        'word-spacing': number | string;
        'writing-mode':
          | 'lr-tb'
          | 'rl-tb'
          | 'tb-rl'
          | 'lr'
          | 'rl'
          | 'tb'
          | 'inherit';
      }> {}
    interface AnimationElementSVGAttributes<T>
      extends CoreSVGAttributes<T>,
        ExternalResourceSVGAttributes,
        ConditionalProcessingSVGAttributes {}
    interface ContainerElementSVGAttributes<T>
      extends CoreSVGAttributes<T>,
        ShapeElementSVGAttributes<T>,
        Pick<
          PresentationSVGAttributes,
          [
            'clip-path',
            'mask',
            'cursor',
            'opacity',
            'filter',
            'enable-background',
            'color-interpolation',
            'color-rendering',
          ][number]
        > {}
    interface FilterPrimitiveElementSVGAttributes<T>
      extends CoreSVGAttributes<T>,
        Pick<PresentationSVGAttributes, 'color-interpolation-filters'>,
        CanBeNothing<{
          x: number | string;
          y: number | string;
          width: number | string;
          height: number | string;
          result: string;
        }> {}
    interface SingleInputFilterSVGAttributes
      extends CanBeNothing<{
        in: string;
      }> {}
    interface DoubleInputFilterSVGAttributes
      extends CanBeNothing<{
        in: string;
        in2: string;
      }> {}
    interface FitToViewBoxSVGAttributes
      extends CanBeNothing<{
        viewBox: string;
        preserveAspectRatio: SVGPreserveAspectRatio;
      }> {}
    interface GradientElementSVGAttributes<T>
      extends CoreSVGAttributes<T>,
        ExternalResourceSVGAttributes,
        StylableSVGAttributes,
        CanBeNothing<{
          gradientUnits: SVGUnits;
          gradientTransform: string;
          spreadMethod: 'pad' | 'reflect' | 'repeat';
          href: string;
        }> {}
    interface GraphicsElementSVGAttributes<T>
      extends CoreSVGAttributes<T>,
        Pick<
          PresentationSVGAttributes,
          [
            'clip-rule',
            'mask',
            'pointer-events',
            'cursor',
            'opacity',
            'filter',
            'display',
            'visibility',
            'color-interpolation',
            'color-rendering',
          ][number]
        > {}
    interface LightSourceElementSVGAttributes<T> extends CoreSVGAttributes<T> {}
    interface NewViewportSVGAttributes<T>
      extends CoreSVGAttributes<T>,
        Pick<PresentationSVGAttributes, 'overflow' | 'clip'>,
        CanBeNothing<{
          viewBox: string;
        }> {}
    interface ShapeElementSVGAttributes<T>
      extends CoreSVGAttributes<T>,
        Pick<
          PresentationSVGAttributes,
          [
            'color',
            'fill',
            'fill-rule',
            'fill-opacity',
            'stroke',
            'stroke-width',
            'stroke-linecap',
            'stroke-linejoin',
            'stroke-miterlimit',
            'stroke-dasharray',
            'stroke-dashoffset',
            'stroke-opacity',
            'shape-rendering',
            'pathLength',
          ][number]
        > {}
    interface TextContentElementSVGAttributes<T>
      extends CoreSVGAttributes<T>,
        Pick<
          PresentationSVGAttributes,
          [
            'font-family',
            'font-style',
            'font-variant',
            'font-weight',
            'font-stretch',
            'font-size',
            'font-size-adjust',
            'kerning',
            'letter-spacing',
            'word-spacing',
            'text-decoration',
            'glyph-orientation-horizontal',
            'glyph-orientation-vertical',
            'direction',
            'unicode-bidi',
            'text-anchor',
            'dominant-baseline',
            'color',
            'fill',
            'fill-rule',
            'fill-opacity',
            'stroke',
            'stroke-width',
            'stroke-linecap',
            'stroke-linejoin',
            'stroke-miterlimit',
            'stroke-dasharray',
            'stroke-dashoffset',
            'stroke-opacity',
          ][number]
        > {}
    interface ZoomAndPanSVGAttributes
      extends CanBeNothing<{
        zoomAndPan: 'disable' | 'magnify';
      }> {}
    interface AnimateSVGAttributes<T>
      extends AnimationElementSVGAttributes<T>,
        AnimationAttributeTargetSVGAttributes,
        AnimationTimingSVGAttributes,
        AnimationValueSVGAttributes,
        AnimationAdditionSVGAttributes,
        Pick<
          PresentationSVGAttributes,
          ['color-interpolation', 'color-rendering'][number]
        > {}
    interface AnimateMotionSVGAttributes<T>
      extends AnimationElementSVGAttributes<T>,
        AnimationTimingSVGAttributes,
        AnimationValueSVGAttributes,
        AnimationAdditionSVGAttributes,
        CanBeNothing<{
          path: string;
          keyPoints: string;
          rotate: number | string | 'auto' | 'auto-reverse';
          origin: 'default';
        }> {}
    interface AnimateTransformSVGAttributes<T>
      extends AnimationElementSVGAttributes<T>,
        AnimationAttributeTargetSVGAttributes,
        AnimationTimingSVGAttributes,
        AnimationValueSVGAttributes,
        AnimationAdditionSVGAttributes,
        CanBeNothing<{
          type: 'translate' | 'scale' | 'rotate' | 'skewX' | 'skewY';
        }> {}
    interface CircleSVGAttributes<T>
      extends GraphicsElementSVGAttributes<T>,
        ShapeElementSVGAttributes<T>,
        ConditionalProcessingSVGAttributes,
        StylableSVGAttributes,
        TransformableSVGAttributes,
        CanBeNothing<{
          cx: number | string;
          cy: number | string;
          r: number | string;
        }> {}
    interface ClipPathSVGAttributes<T>
      extends CoreSVGAttributes<T>,
        ConditionalProcessingSVGAttributes,
        ExternalResourceSVGAttributes,
        StylableSVGAttributes,
        TransformableSVGAttributes,
        Pick<PresentationSVGAttributes, 'clip-path'>,
        CanBeNothing<{
          clipPathUnits: SVGUnits;
        }> {}
    interface DefsSVGAttributes<T>
      extends ContainerElementSVGAttributes<T>,
        ConditionalProcessingSVGAttributes,
        ExternalResourceSVGAttributes,
        StylableSVGAttributes,
        TransformableSVGAttributes {}
    interface DescSVGAttributes<T>
      extends CoreSVGAttributes<T>,
        StylableSVGAttributes {}
    interface EllipseSVGAttributes<T>
      extends GraphicsElementSVGAttributes<T>,
        ShapeElementSVGAttributes<T>,
        ConditionalProcessingSVGAttributes,
        ExternalResourceSVGAttributes,
        StylableSVGAttributes,
        TransformableSVGAttributes,
        CanBeNothing<{
          cx: number | string;
          cy: number | string;
          rx: number | string;
          ry: number | string;
        }> {}
    interface FeBlendSVGAttributes<T>
      extends FilterPrimitiveElementSVGAttributes<T>,
        DoubleInputFilterSVGAttributes,
        StylableSVGAttributes,
        CanBeNothing<{
          mode: 'normal' | 'multiply' | 'screen' | 'darken' | 'lighten';
        }> {}
    interface FeColorMatrixSVGAttributes<T>
      extends FilterPrimitiveElementSVGAttributes<T>,
        SingleInputFilterSVGAttributes,
        StylableSVGAttributes,
        CanBeNothing<{
          type: 'matrix' | 'saturate' | 'hueRotate' | 'luminanceToAlpha';
          values: string;
        }> {}
    interface FeComponentTransferSVGAttributes<T>
      extends FilterPrimitiveElementSVGAttributes<T>,
        SingleInputFilterSVGAttributes,
        StylableSVGAttributes {}
    interface FeCompositeSVGAttributes<T>
      extends FilterPrimitiveElementSVGAttributes<T>,
        DoubleInputFilterSVGAttributes,
        StylableSVGAttributes,
        CanBeNothing<{
          operator: 'over' | 'in' | 'out' | 'atop' | 'xor' | 'arithmetic';
          k1: number | string;
          k2: number | string;
          k3: number | string;
          k4: number | string;
        }> {}
    interface FeConvolveMatrixSVGAttributes<T>
      extends FilterPrimitiveElementSVGAttributes<T>,
        SingleInputFilterSVGAttributes,
        StylableSVGAttributes,
        CanBeNothing<{
          order: number | string;
          kernelMatrix: string;
          divisor: number | string;
          bias: number | string;
          targetX: number | string;
          targetY: number | string;
          edgeMode: 'duplicate' | 'wrap' | 'none';
          kernelUnitLength: number | string;
          preserveAlpha: 'true' | 'false';
        }> {}
    interface FeDiffuseLightingSVGAttributes<T>
      extends FilterPrimitiveElementSVGAttributes<T>,
        SingleInputFilterSVGAttributes,
        StylableSVGAttributes,
        Pick<PresentationSVGAttributes, 'color' | 'lighting-color'>,
        CanBeNothing<{
          surfaceScale: number | string;
          diffuseConstant: number | string;
          kernelUnitLength: number | string;
        }> {}
    interface FeDisplacementMapSVGAttributes<T>
      extends FilterPrimitiveElementSVGAttributes<T>,
        DoubleInputFilterSVGAttributes,
        StylableSVGAttributes,
        CanBeNothing<{
          scale: number | string;
          xChannelSelector: 'R' | 'G' | 'B' | 'A';
          yChannelSelector: 'R' | 'G' | 'B' | 'A';
        }> {}
    interface FeDistantLightSVGAttributes<T>
      extends LightSourceElementSVGAttributes<T>,
        CanBeNothing<{
          azimuth: number | string;
          elevation: number | string;
        }> {}
    interface FeDropShadowSVGAttributes<T>
      extends CoreSVGAttributes<T>,
        FilterPrimitiveElementSVGAttributes<T>,
        StylableSVGAttributes,
        Pick<
          PresentationSVGAttributes,
          'color' | 'flood-color' | 'flood-opacity'
        >,
        CanBeNothing<{
          dx: number | string;
          dy: number | string;
          stdDeviation: number | string;
        }> {}
    interface FeFloodSVGAttributes<T>
      extends FilterPrimitiveElementSVGAttributes<T>,
        StylableSVGAttributes,
        Pick<
          PresentationSVGAttributes,
          'color' | 'flood-color' | 'flood-opacity'
        > {}
    interface FeFuncSVGAttributes<T>
      extends CoreSVGAttributes<T>,
        CanBeNothing<{
          type: 'identity' | 'table' | 'discrete' | 'linear' | 'gamma';
          tableValues: string;
          slope: number | string;
          intercept: number | string;
          amplitude: number | string;
          exponent: number | string;
          offset: number | string;
        }> {}
    interface FeGaussianBlurSVGAttributes<T>
      extends FilterPrimitiveElementSVGAttributes<T>,
        SingleInputFilterSVGAttributes,
        StylableSVGAttributes,
        CanBeNothing<{
          stdDeviation: number | string;
        }> {}
    interface FeImageSVGAttributes<T>
      extends FilterPrimitiveElementSVGAttributes<T>,
        ExternalResourceSVGAttributes,
        StylableSVGAttributes,
        CanBeNothing<{
          preserveAspectRatio: SVGPreserveAspectRatio;
          href: string;
        }> {}
    interface FeMergeSVGAttributes<T>
      extends FilterPrimitiveElementSVGAttributes<T>,
        StylableSVGAttributes {}
    interface FeMergeNodeSVGAttributes<T>
      extends CoreSVGAttributes<T>,
        SingleInputFilterSVGAttributes {}
    interface FeMorphologySVGAttributes<T>
      extends FilterPrimitiveElementSVGAttributes<T>,
        SingleInputFilterSVGAttributes,
        StylableSVGAttributes,
        CanBeNothing<{
          operator: 'erode' | 'dilate';
          radius: number | string;
        }> {}
    interface FeOffsetSVGAttributes<T>
      extends FilterPrimitiveElementSVGAttributes<T>,
        SingleInputFilterSVGAttributes,
        StylableSVGAttributes,
        CanBeNothing<{
          dx: number | string;
          dy: number | string;
        }> {}
    interface FePointLightSVGAttributes<T>
      extends LightSourceElementSVGAttributes<T>,
        CanBeNothing<{
          x: number | string;
          y: number | string;
          z: number | string;
        }> {}
    interface FeSpecularLightingSVGAttributes<T>
      extends FilterPrimitiveElementSVGAttributes<T>,
        SingleInputFilterSVGAttributes,
        StylableSVGAttributes,
        Pick<PresentationSVGAttributes, 'color' | 'lighting-color'>,
        CanBeNothing<{
          surfaceScale: string;
          specularConstant: string;
          specularExponent: string;
          kernelUnitLength: number | string;
        }> {}
    interface FeSpotLightSVGAttributes<T>
      extends LightSourceElementSVGAttributes<T>,
        CanBeNothing<{
          x: number | string;
          y: number | string;
          z: number | string;
          pointsAtX: number | string;
          pointsAtY: number | string;
          pointsAtZ: number | string;
          specularExponent: number | string;
          limitingConeAngle: number | string;
        }> {}
    interface FeTileSVGAttributes<T>
      extends FilterPrimitiveElementSVGAttributes<T>,
        SingleInputFilterSVGAttributes,
        StylableSVGAttributes {}
    interface FeTurbulanceSVGAttributes<T>
      extends FilterPrimitiveElementSVGAttributes<T>,
        StylableSVGAttributes,
        CanBeNothing<{
          baseFrequency: number | string;
          numOctaves: number | string;
          seed: number | string;
          stitchTiles: 'stitch' | 'noStitch';
          type: 'fractalNoise' | 'turbulence';
        }> {}
    interface FilterSVGAttributes<T>
      extends CoreSVGAttributes<T>,
        ExternalResourceSVGAttributes,
        StylableSVGAttributes,
        CanBeNothing<{
          filterUnits: SVGUnits;
          primitiveUnits: SVGUnits;
          x: number | string;
          y: number | string;
          width: number | string;
          height: number | string;
          filterRes: number | string;
        }> {}
    interface ForeignObjectSVGAttributes<T>
      extends NewViewportSVGAttributes<T>,
        ConditionalProcessingSVGAttributes,
        ExternalResourceSVGAttributes,
        StylableSVGAttributes,
        TransformableSVGAttributes,
        Pick<PresentationSVGAttributes, 'display' | 'visibility'>,
        CanBeNothing<{
          x: number | string;
          y: number | string;
          width: number | string;
          height: number | string;
        }> {}
    interface GSVGAttributes<T>
      extends ContainerElementSVGAttributes<T>,
        ConditionalProcessingSVGAttributes,
        ExternalResourceSVGAttributes,
        StylableSVGAttributes,
        TransformableSVGAttributes,
        Pick<PresentationSVGAttributes, 'display' | 'visibility'> {}
    interface ImageSVGAttributes<T>
      extends NewViewportSVGAttributes<T>,
        GraphicsElementSVGAttributes<T>,
        ConditionalProcessingSVGAttributes,
        StylableSVGAttributes,
        TransformableSVGAttributes,
        Pick<PresentationSVGAttributes, 'color-profile' | 'image-rendering'>,
        CanBeNothing<{
          x: number | string;
          y: number | string;
          width: number | string;
          height: number | string;
          preserveAspectRatio: ImagePreserveAspectRatio;
          href: string;
        }> {}
    interface LineSVGAttributes<T>
      extends GraphicsElementSVGAttributes<T>,
        ShapeElementSVGAttributes<T>,
        ConditionalProcessingSVGAttributes,
        ExternalResourceSVGAttributes,
        StylableSVGAttributes,
        TransformableSVGAttributes,
        Pick<
          PresentationSVGAttributes,
          ['marker-start', 'marker-mid', 'marker-end'][number]
        >,
        CanBeNothing<{
          x1: number | string;
          y1: number | string;
          x2: number | string;
          y2: number | string;
        }> {}
    interface LinearGradientSVGAttributes<T>
      extends GradientElementSVGAttributes<T>,
        CanBeNothing<{
          x1: number | string;
          x2: number | string;
          y1: number | string;
          y2: number | string;
        }> {}
    interface MarkerSVGAttributes<T>
      extends ContainerElementSVGAttributes<T>,
        ExternalResourceSVGAttributes,
        StylableSVGAttributes,
        FitToViewBoxSVGAttributes,
        Pick<PresentationSVGAttributes, 'overflow' | 'clip'>,
        CanBeNothing<{
          markerUnits: 'strokeWidth' | 'userSpaceOnUse';
          refX: number | string;
          refY: number | string;
          markerWidth: number | string;
          markerHeight: number | string;
          orient: string;
        }> {}
    interface MaskSVGAttributes<T>
      extends Omit<ContainerElementSVGAttributes<T>, 'opacity' | 'filter'>,
        ConditionalProcessingSVGAttributes,
        ExternalResourceSVGAttributes,
        StylableSVGAttributes,
        CanBeNothing<{
          maskUnits: SVGUnits;
          maskContentUnits: SVGUnits;
          x: number | string;
          y: number | string;
          width: number | string;
          height: number | string;
        }> {}
    interface MetadataSVGAttributes<T> extends CoreSVGAttributes<T> {}
    interface MPathSVGAttributes<T> extends CoreSVGAttributes<T> {}
    interface PathSVGAttributes<T>
      extends GraphicsElementSVGAttributes<T>,
        ShapeElementSVGAttributes<T>,
        ConditionalProcessingSVGAttributes,
        ExternalResourceSVGAttributes,
        StylableSVGAttributes,
        TransformableSVGAttributes,
        Pick<
          PresentationSVGAttributes,
          ['marker-start', 'marker-mid', 'marker-end'][number]
        >,
        CanBeNothing<{
          d: string;
          pathLength: number | string;
        }> {}
    interface PatternSVGAttributes<T>
      extends ContainerElementSVGAttributes<T>,
        ConditionalProcessingSVGAttributes,
        ExternalResourceSVGAttributes,
        StylableSVGAttributes,
        FitToViewBoxSVGAttributes,
        Pick<PresentationSVGAttributes, 'overflow' | 'clip'>,
        CanBeNothing<{
          x: number | string;
          y: number | string;
          width: number | string;
          height: number | string;
          patternUnits: SVGUnits;
          patternContentUnits: SVGUnits;
          patternTransform: string;
          href: string;
        }> {}
    interface PolygonSVGAttributes<T>
      extends GraphicsElementSVGAttributes<T>,
        ShapeElementSVGAttributes<T>,
        ConditionalProcessingSVGAttributes,
        ExternalResourceSVGAttributes,
        StylableSVGAttributes,
        TransformableSVGAttributes,
        Pick<
          PresentationSVGAttributes,
          ['marker-start', 'marker-mid', 'marker-end'][number]
        >,
        CanBeNothing<{
          points: string;
        }> {}
    interface PolylineSVGAttributes<T>
      extends GraphicsElementSVGAttributes<T>,
        ShapeElementSVGAttributes<T>,
        ConditionalProcessingSVGAttributes,
        ExternalResourceSVGAttributes,
        StylableSVGAttributes,
        TransformableSVGAttributes,
        Pick<
          PresentationSVGAttributes,
          ['marker-start', 'marker-mid', 'marker-end'][number]
        >,
        CanBeNothing<{
          points: string;
        }> {}
    interface RadialGradientSVGAttributes<T>
      extends GradientElementSVGAttributes<T>,
        CanBeNothing<{
          cx: number | string;
          cy: number | string;
          r: number | string;
          fx: number | string;
          fy: number | string;
        }> {}
    interface RectSVGAttributes<T>
      extends GraphicsElementSVGAttributes<T>,
        ShapeElementSVGAttributes<T>,
        ConditionalProcessingSVGAttributes,
        ExternalResourceSVGAttributes,
        StylableSVGAttributes,
        TransformableSVGAttributes,
        CanBeNothing<{
          x: number | string;
          y: number | string;
          width: number | string;
          height: number | string;
          rx: number | string;
          ry: number | string;
        }> {}
    interface SetSVGAttributes<T>
      extends CoreSVGAttributes<T>,
        StylableSVGAttributes,
        AnimationTimingSVGAttributes {}
    interface StopSVGAttributes<T>
      extends CoreSVGAttributes<T>,
        StylableSVGAttributes,
        Pick<
          PresentationSVGAttributes,
          ['color', 'stop-color', 'stop-opacity'][number]
        >,
        CanBeNothing<{
          offset: number | string;
        }> {}
    interface SvgSVGAttributes<T>
      extends ContainerElementSVGAttributes<T>,
        NewViewportSVGAttributes<T>,
        ConditionalProcessingSVGAttributes,
        ExternalResourceSVGAttributes,
        StylableSVGAttributes,
        FitToViewBoxSVGAttributes,
        ZoomAndPanSVGAttributes,
        PresentationSVGAttributes,
        CanBeNothing<{
          version: string;
          baseProfile: string;
          x: number | string;
          y: number | string;
          width: number | string;
          height: number | string;
          contentScriptType: string;
          contentStyleType: string;
          xmlns: string;
          'xmlns:xlink': string;
        }> {}
    interface SwitchSVGAttributes<T>
      extends ContainerElementSVGAttributes<T>,
        ConditionalProcessingSVGAttributes,
        ExternalResourceSVGAttributes,
        StylableSVGAttributes,
        TransformableSVGAttributes,
        Pick<PresentationSVGAttributes, 'display' | 'visibility'> {}
    interface SymbolSVGAttributes<T>
      extends ContainerElementSVGAttributes<T>,
        NewViewportSVGAttributes<T>,
        ExternalResourceSVGAttributes,
        StylableSVGAttributes,
        FitToViewBoxSVGAttributes,
        CanBeNothing<{
          width: number | string;
          height: number | string;
          preserveAspectRatio: SVGPreserveAspectRatio;
          refX: number | string;
          refY: number | string;
          viewBox: string;
          x: number | string;
          y: number | string;
        }> {}
    interface TextSVGAttributes<T>
      extends TextContentElementSVGAttributes<T>,
        GraphicsElementSVGAttributes<T>,
        ConditionalProcessingSVGAttributes,
        ExternalResourceSVGAttributes,
        StylableSVGAttributes,
        TransformableSVGAttributes,
        Pick<PresentationSVGAttributes, 'writing-mode' | 'text-rendering'>,
        CanBeNothing<{
          x: number | string;
          y: number | string;
          dx: number | string;
          dy: number | string;
          rotate: number | string;
          textLength: number | string;
          lengthAdjust: 'spacing' | 'spacingAndGlyphs';
        }> {}
    interface TextPathSVGAttributes<T>
      extends TextContentElementSVGAttributes<T>,
        ConditionalProcessingSVGAttributes,
        ExternalResourceSVGAttributes,
        StylableSVGAttributes,
        Pick<
          PresentationSVGAttributes,
          [
            'alignment-baseline',
            'baseline-shift',
            'display',
            'visibility',
          ][number]
        >,
        CanBeNothing<{
          startOffset: number | string;
          method: 'align' | 'stretch';
          spacing: 'auto' | 'exact';
          href: string;
        }> {}
    interface TSpanSVGAttributes<T>
      extends TextContentElementSVGAttributes<T>,
        ConditionalProcessingSVGAttributes,
        ExternalResourceSVGAttributes,
        StylableSVGAttributes,
        Pick<
          PresentationSVGAttributes,
          [
            'alignment-baseline',
            'baseline-shift',
            'display',
            'visibility',
          ][number]
        >,
        CanBeNothing<{
          x: number | string;
          y: number | string;
          dx: number | string;
          dy: number | string;
          rotate: number | string;
          textLength: number | string;
          lengthAdjust: 'spacing' | 'spacingAndGlyphs';
        }> {}
    /** @see https://developer.mozilla.org/en-US/docs/Web/SVG/Element/use */
    interface UseSVGAttributes<T>
      extends CoreSVGAttributes<T>,
        StylableSVGAttributes,
        ConditionalProcessingSVGAttributes,
        GraphicsElementSVGAttributes<T>,
        PresentationSVGAttributes,
        ExternalResourceSVGAttributes,
        TransformableSVGAttributes,
        CanBeNothing<{
          x: number | string;
          y: number | string;
          width: number | string;
          height: number | string;
          href: string;
        }> {}
    interface ViewSVGAttributes<T>
      extends CoreSVGAttributes<T>,
        ExternalResourceSVGAttributes,
        FitToViewBoxSVGAttributes,
        ZoomAndPanSVGAttributes,
        CanBeNothing<{
          viewTarget: string;
        }> {}
    /** @type {HTMLElementTagNameMap} */
    interface HTMLElementTags {
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a */
      a: AnchorHTMLAttributes<HTMLAnchorElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/abbr */
      abbr: HTMLAttributes<HTMLElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/address */
      address: HTMLAttributes<HTMLElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/area */
      area: AreaHTMLAttributes<HTMLAreaElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/article */
      article: HTMLAttributes<HTMLElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/aside */
      aside: HTMLAttributes<HTMLElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/audio */
      audio: AudioHTMLAttributes<HTMLAudioElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/b */
      b: HTMLAttributes<HTMLElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/base */
      base: BaseHTMLAttributes<HTMLBaseElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/bdi */
      bdi: HTMLAttributes<HTMLElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/bdo */
      bdo: HTMLAttributes<HTMLElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/blockquote */
      blockquote: BlockquoteHTMLAttributes<HTMLElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/body */
      body: HTMLAttributes<HTMLBodyElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/br */
      br: HTMLAttributes<HTMLBRElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button */
      button: ButtonHTMLAttributes<HTMLButtonElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/canvas */
      canvas: CanvasHTMLAttributes<HTMLCanvasElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/caption */
      caption: HTMLAttributes<HTMLElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/cite */
      cite: HTMLAttributes<HTMLElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/code */
      code: HTMLAttributes<HTMLElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/col */
      col: ColHTMLAttributes<HTMLTableColElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/colgroup */
      colgroup: ColgroupHTMLAttributes<HTMLTableColElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/data */
      data: DataHTMLAttributes<HTMLElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/datalist */
      datalist: HTMLAttributes<HTMLDataListElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dd */
      dd: HTMLAttributes<HTMLElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/del */
      del: HTMLAttributes<HTMLElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/details */
      details: DetailsHtmlAttributes<HTMLDetailsElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dfn */
      dfn: HTMLAttributes<HTMLElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog */
      dialog: DialogHtmlAttributes<HTMLDialogElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/div */
      div: HTMLAttributes<HTMLDivElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dl */
      dl: HTMLAttributes<HTMLDListElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dt */
      dt: HTMLAttributes<HTMLElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/em */
      em: HTMLAttributes<HTMLElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/embed */
      embed: EmbedHTMLAttributes<HTMLEmbedElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/fieldset */
      fieldset: FieldsetHTMLAttributes<HTMLFieldSetElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/figcaption */
      figcaption: HTMLAttributes<HTMLElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/figure */
      figure: HTMLAttributes<HTMLElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/footer */
      footer: HTMLAttributes<HTMLElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form */
      form: FormHTMLAttributes<HTMLFormElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Heading_Elements */
      h1: HTMLAttributes<HTMLHeadingElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Heading_Elements */
      h2: HTMLAttributes<HTMLHeadingElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Heading_Elements */
      h3: HTMLAttributes<HTMLHeadingElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Heading_Elements */
      h4: HTMLAttributes<HTMLHeadingElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Heading_Elements */
      h5: HTMLAttributes<HTMLHeadingElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Heading_Elements */
      h6: HTMLAttributes<HTMLHeadingElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/head */
      head: HTMLAttributes<HTMLHeadElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/header */
      header: HTMLAttributes<HTMLElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/hgroup */
      hgroup: HTMLAttributes<HTMLElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/hr */
      hr: HTMLAttributes<HTMLHRElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/html */
      html: HTMLAttributes<HTMLHtmlElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/i */
      i: HTMLAttributes<HTMLElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe */
      iframe: IframeHTMLAttributes<HTMLIFrameElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img */
      img: ImgHTMLAttributes<HTMLImageElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input */
      input: InputHTMLAttributes<HTMLInputElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/ins */
      ins: InsHTMLAttributes<HTMLModElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/kbd */
      kbd: HTMLAttributes<HTMLElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/label */
      label: LabelHTMLAttributes<HTMLLabelElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/legend */
      legend: HTMLAttributes<HTMLLegendElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/li */
      li: LiHTMLAttributes<HTMLLIElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link */
      link: LinkHTMLAttributes<HTMLLinkElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/main */
      main: HTMLAttributes<HTMLElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/map */
      map: MapHTMLAttributes<HTMLMapElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/mark */
      mark: HTMLAttributes<HTMLElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/menu */
      menu: MenuHTMLAttributes<HTMLMenuElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta */
      meta: MetaHTMLAttributes<HTMLMetaElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meter */
      meter: MeterHTMLAttributes<HTMLElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/nav */
      nav: HTMLAttributes<HTMLElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/noscript */
      noscript: HTMLAttributes<HTMLElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/object */
      object: ObjectHTMLAttributes<HTMLObjectElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/ol */
      ol: OlHTMLAttributes<HTMLOListElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/optgroup */
      optgroup: OptgroupHTMLAttributes<HTMLOptGroupElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/option */
      option: OptionHTMLAttributes<HTMLOptionElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/output */
      output: OutputHTMLAttributes<HTMLElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/p */
      p: HTMLAttributes<HTMLParagraphElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/picture */
      picture: HTMLAttributes<HTMLElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/pre */
      pre: HTMLAttributes<HTMLPreElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/progress */
      progress: ProgressHTMLAttributes<HTMLProgressElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/q */
      q: QuoteHTMLAttributes<HTMLQuoteElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/rp */
      rp: HTMLAttributes<HTMLElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/rt */
      rt: HTMLAttributes<HTMLElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/ruby */
      ruby: HTMLAttributes<HTMLElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/s */
      s: HTMLAttributes<HTMLElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/samp */
      samp: HTMLAttributes<HTMLElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script */
      script: ScriptHTMLAttributes<HTMLScriptElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/search */
      search: HTMLAttributes<HTMLElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/section */
      section: HTMLAttributes<HTMLElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select */
      select: SelectHTMLAttributes<HTMLSelectElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/slot */
      slot: HTMLSlotElementAttributes;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/small */
      small: HTMLAttributes<HTMLElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/source */
      source: SourceHTMLAttributes<HTMLSourceElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/span */
      span: HTMLAttributes<HTMLSpanElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/strong */
      strong: HTMLAttributes<HTMLElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/style */
      style: StyleHTMLAttributes<HTMLStyleElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/sub */
      sub: HTMLAttributes<HTMLElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/summary */
      summary: HTMLAttributes<HTMLElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/sup */
      sup: HTMLAttributes<HTMLElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/table */
      table: HTMLAttributes<HTMLTableElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/tbody */
      tbody: HTMLAttributes<HTMLTableSectionElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/td */
      td: TdHTMLAttributes<HTMLTableCellElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/template */
      template: TemplateHTMLAttributes<HTMLTemplateElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea */
      textarea: TextareaHTMLAttributes<HTMLTextAreaElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/tfoot */
      tfoot: HTMLAttributes<HTMLTableSectionElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/th */
      th: ThHTMLAttributes<HTMLTableCellElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/thead */
      thead: HTMLAttributes<HTMLTableSectionElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/time */
      time: TimeHTMLAttributes<HTMLElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/title */
      title: HTMLAttributes<HTMLTitleElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/tr */
      tr: HTMLAttributes<HTMLTableRowElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/track */
      track: TrackHTMLAttributes<HTMLTrackElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/u */
      u: HTMLAttributes<HTMLElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/ul */
      ul: HTMLAttributes<HTMLUListElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/var */
      var: HTMLAttributes<HTMLElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video */
      video: VideoHTMLAttributes<HTMLVideoElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/wbr */
      wbr: HTMLAttributes<HTMLElement>;
    }
    /** @type {HTMLElementDeprecatedTagNameMap} */
    interface HTMLElementDeprecatedTags {
      /**
       * @deprecated The `<big>` element is deprecated and should not be used.
       * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/big
       */
      big: HTMLAttributes<HTMLElement>;
      /**
       * @deprecated The `<keygen>` element is deprecated and should not be used.
       * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/keygen
       */
      keygen: KeygenHTMLAttributes<HTMLElement>;
      /**
       * @deprecated The `<menuitem>` element is deprecated and should not be used.
       * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/menuitem
       */
      menuitem: HTMLAttributes<HTMLElement>;
      /**
       * @deprecated The `<noindex>` element is deprecated and should not be used.
       * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/noindex
       */
      noindex: HTMLAttributes<HTMLElement>;
      /**
       * @deprecated The `<param>` element is deprecated and should not be used.
       * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/param
       */
      param: ParamHTMLAttributes<HTMLParamElement>;
    }
    /** @type {SVGElementTagNameMap} */
    interface SVGElementTags {
      /** @see https://developer.mozilla.org/en-US/docs/Web/SVG/Element/animate */
      animate: AnimateSVGAttributes<SVGAnimateElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/SVG/Element/animateMotion */
      animateMotion: AnimateMotionSVGAttributes<SVGAnimateMotionElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/SVG/Element/animateTransform */
      animateTransform: AnimateTransformSVGAttributes<SVGAnimateTransformElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/SVG/Element/circle */
      circle: CircleSVGAttributes<SVGCircleElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/SVG/Element/clipPath */
      clipPath: ClipPathSVGAttributes<SVGClipPathElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/SVG/Element/defs */
      defs: DefsSVGAttributes<SVGDefsElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/SVG/Element/desc */
      desc: DescSVGAttributes<SVGDescElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/SVG/Element/ellipse */
      ellipse: EllipseSVGAttributes<SVGEllipseElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feBlend */
      feBlend: FeBlendSVGAttributes<SVGFEBlendElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feColorMatrix */
      feColorMatrix: FeColorMatrixSVGAttributes<SVGFEColorMatrixElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feComponentTransfer */
      feComponentTransfer: FeComponentTransferSVGAttributes<SVGFEComponentTransferElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feComposite */
      feComposite: FeCompositeSVGAttributes<SVGFECompositeElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feConvolveMatrix */
      feConvolveMatrix: FeConvolveMatrixSVGAttributes<SVGFEConvolveMatrixElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feDiffuseLighting */
      feDiffuseLighting: FeDiffuseLightingSVGAttributes<SVGFEDiffuseLightingElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feDisplacementMap */
      feDisplacementMap: FeDisplacementMapSVGAttributes<SVGFEDisplacementMapElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feDistantLight */
      feDistantLight: FeDistantLightSVGAttributes<SVGFEDistantLightElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feDropShadow */
      feDropShadow: FeDropShadowSVGAttributes<SVGFEDropShadowElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feFlood */
      feFlood: FeFloodSVGAttributes<SVGFEFloodElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feFuncA */
      feFuncA: FeFuncSVGAttributes<SVGFEFuncAElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feFuncB */
      feFuncB: FeFuncSVGAttributes<SVGFEFuncBElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feFuncG */
      feFuncG: FeFuncSVGAttributes<SVGFEFuncGElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feFuncR */
      feFuncR: FeFuncSVGAttributes<SVGFEFuncRElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feGaussianBlur */
      feGaussianBlur: FeGaussianBlurSVGAttributes<SVGFEGaussianBlurElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feImage */
      feImage: FeImageSVGAttributes<SVGFEImageElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feMerge */
      feMerge: FeMergeSVGAttributes<SVGFEMergeElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feMergeNode */
      feMergeNode: FeMergeNodeSVGAttributes<SVGFEMergeNodeElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feMorphology */
      feMorphology: FeMorphologySVGAttributes<SVGFEMorphologyElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feOffset */
      feOffset: FeOffsetSVGAttributes<SVGFEOffsetElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/SVG/Element/fePointLight */
      fePointLight: FePointLightSVGAttributes<SVGFEPointLightElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feSpecularLighting */
      feSpecularLighting: FeSpecularLightingSVGAttributes<SVGFESpecularLightingElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feSpotLight */
      feSpotLight: FeSpotLightSVGAttributes<SVGFESpotLightElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feTile */
      feTile: FeTileSVGAttributes<SVGFETileElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feTurbulence */
      feTurbulence: FeTurbulanceSVGAttributes<SVGFETurbulenceElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/SVG/Element/filter */
      filter: FilterSVGAttributes<SVGFilterElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/SVG/Element/foreignObject */
      foreignObject: ForeignObjectSVGAttributes<SVGForeignObjectElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/SVG/Element/g */
      g: GSVGAttributes<SVGGElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/SVG/Element/image */
      image: ImageSVGAttributes<SVGImageElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/SVG/Element/line */
      line: LineSVGAttributes<SVGLineElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/SVG/Element/linearGradient */
      linearGradient: LinearGradientSVGAttributes<SVGLinearGradientElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/SVG/Element/marker */
      marker: MarkerSVGAttributes<SVGMarkerElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/SVG/Element/mask */
      mask: MaskSVGAttributes<SVGMaskElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/SVG/Element/metadata */
      metadata: MetadataSVGAttributes<SVGMetadataElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/SVG/Element/mpath */
      mpath: MPathSVGAttributes<SVGMPathElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path */
      path: PathSVGAttributes<SVGPathElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/SVG/Element/pattern */
      pattern: PatternSVGAttributes<SVGPatternElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/SVG/Element/polygon */
      polygon: PolygonSVGAttributes<SVGPolygonElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/SVG/Element/polyline */
      polyline: PolylineSVGAttributes<SVGPolylineElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/SVG/Element/radialGradient */
      radialGradient: RadialGradientSVGAttributes<SVGRadialGradientElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/SVG/Element/rect */
      rect: RectSVGAttributes<SVGRectElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/SVG/Element/set */
      set: SetSVGAttributes<SVGSetElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/SVG/Element/stop */
      stop: StopSVGAttributes<SVGStopElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/SVG/Element/svg */
      svg: SvgSVGAttributes<SVGSVGElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/SVG/Element/switch */
      switch: SwitchSVGAttributes<SVGSwitchElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/SVG/Element/symbol */
      symbol: SymbolSVGAttributes<SVGSymbolElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/SVG/Element/text */
      text: TextSVGAttributes<SVGTextElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/SVG/Element/textPath */
      textPath: TextPathSVGAttributes<SVGTextPathElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/SVG/Element/tspan */
      tspan: TSpanSVGAttributes<SVGTSpanElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/SVG/Element/use */
      use: UseSVGAttributes<SVGUseElement>;
      /** @see https://developer.mozilla.org/en-US/docs/Web/SVG/Element/view */
      view: ViewSVGAttributes<SVGViewElement>;
    }
    /** Interface for semantic tags that start with "s-". */
    interface SemanticTags {
      [key: `s-${string}`]: HTMLAttributes<HTMLElement>;
    }
    /** Interface for registering custom element tags. */
    interface CustomElementTags {}

    interface IntrinsicElements
      extends HTMLElementTags,
        HTMLElementDeprecatedTags,
        SVGElementTags,
        SemanticTags,
        CustomElementTags {}
  }

  interface ExplicitProperties {}

  interface ExplicitBoolAttributes {}

  type PropAttributes = {
    [Key in keyof ExplicitProperties as `prop:${Key}`]?: ExplicitProperties[Key];
  };
  type BoolAttributes = {
    [Key in keyof ExplicitBoolAttributes as `bool:${Key}`]?: ExplicitBoolAttributes[Key];
  };
}
