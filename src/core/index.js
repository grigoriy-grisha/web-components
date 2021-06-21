import { data } from "../../data";

export default function compose(...funcs) {
  if (funcs.length === 0) return (arg) => arg;
  if (funcs.length === 1) return funcs[0];

  return funcs.reduce((a, b) => (...args) => a(b(...args)));
}

export function component(name, ...modifiers) {
  return (templateHtml = "") =>
    setTimeout(() => {
      const customElement = class extends HTMLElement {
        constructor() {
          super();
          if (!this.internalState) {
            this.internalState = {};
            this.listeners = {};
          }
        }
        connectedCallback() {}
        update() {}

        setListeners() {
          Object.entries(this.listeners).forEach(([key, value]) => {
            const [selector, event] = key.split("@");
            const elem = this.querySelector(selector);
            if (!elem) return;
            this.querySelector(selector).addEventListener(event, value);
          });
        }

        removeListeners() {
          Object.entries(this.listeners).forEach(([key, value]) => {
            const [selector, event] = key.split("@");
            const elem = this.querySelector(selector);
            if (!elem) return;
            this.querySelector(selector).removeEventListener(event, value);
          });
        }
      };
      return customElements.define(
        name,
        compose(...modifiers, setHtml(templateHtml))(customElement)
      );
    });
}

export function defineProp(propName) {
  return (BaseElement) =>
    class extends BaseElement {
      constructor() {
        super();
      }

      set [propName](value) {
        this.internalState[propName] = value;
        this.setAttribute(propName, value);
        this.update();
      }

      get [propName]() {
        return this.internalState[propName];
      }
    };
}

export function setProp(propName, value) {
  return (BaseElement) =>
    class extends BaseElement {
      constructor() {
        super();
        this[propName] = value;
      }
    };
}

export function setHtml(htmlHandler) {
  return (BaseElement) =>
    class extends BaseElement {
      constructor() {
        super();
      }
      connectedCallback() {
        super.connectedCallback();
        this.removeListeners();
        this.innerHTML = htmlHandler(this);
        this.setListeners();
      }
      update() {
        this.removeListeners();
        this.innerHTML = htmlHandler(this);
        this.setListeners();
        super.update();
      }
    };
}

const store = {};
export function createStore(reducer, initialState) {
  let state = initialState;
  const subscribers = [];

  store.getState = () => state;
  store.subscribe = (listener) => subscribers.push(listener);
  store.dispatch = (action) => {
    state = reducer(state, action);
    subscribers.forEach((subscriber) => subscriber());
  };
}

export function connectStore(handlerSelectors) {
  return (BaseElement) =>
    class extends BaseElement {
      constructor() {
        super();
      }

      connectedCallback() {
        super.connectedCallback();
        const storeHandler = () => {
          Object.assign(this, handlerSelectors(store, this));
          this.update();
        };
        store.subscribe(storeHandler);
        storeHandler();
      }
    };
}
export function eventListener(selector, event, callback) {
  return (BaseElement) =>
    class extends BaseElement {
      constructor() {
        super();
      }
      connectedCallback() {
        super.connectedCallback();
        this.removeListeners();
        this.listeners[`${selector}@${event}`] = (event) =>
          callback({ event, dataElem: this });
        this.setListeners();
      }
    };
}
