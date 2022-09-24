import { createlistener, EventHandler } from 'utils/eventHandler';
import { get, set } from 'utils/reflect';
import { EventType } from './static';

// called when routing is switched
export const proxyRouterLink = (types: Array<EventType>, handler: EventHandler): void => {
  // rewrite the native event handlers
  const rewriteHistory = (historyType: EventType) => {
    const native: Function = get(history, historyType);

    return function (this: History) {
      const res = native.apply(this, arguments);
      dispatchEvent(new Event(historyType));
      return res;
    };
  };

  // mount new events on the window.history
  types.forEach(type => {
    set(history, type, rewriteHistory(type));
  });

  // monitor all events and handled them uniformly
  createlistener(types)(handler);
};

// called when click the forward and backward buttons
export const proxyForwardAndBackward = (types: Array<EventType>, handler: EventHandler): void => {
  createlistener(types)(handler);
};
