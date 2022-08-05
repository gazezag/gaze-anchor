import { BehaviorInfoUploader } from 'types/uploader';
import { BehaviorItem, RouterChangeDetail, UserBehavior } from 'types/userBehavior';
import { createlistener, dispatchEvent, EventHandler } from 'utils/eventHandler';
import { get, set } from 'utils/reflect';
import { getTimestamp } from 'utils/timestampHandler';
import { BehaviorType, EventType } from './static';
import { Store } from './store';

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

export const proxyForwardAndBackward = (types: Array<EventType>, handler: EventHandler): void => {
  createlistener(types)(handler);
};

export const init = (
  store: Store<BehaviorType, UserBehavior>,
  upload: BehaviorInfoUploader,
  immediately = true
) => {
  const { RC } = BehaviorType;

  const handler = (e: Event) => {
    const { hash, pathname, href } = (e.target as Window).location;

    const detail: RouterChangeDetail = {
      method: hash ? 'Hash' : 'History',
      href
    };
    hash ? set(detail, 'hash', hash) : set(detail, 'pathname', pathname);

    const behaviorItem: BehaviorItem = {
      type: RC,
      page: href,
      time: getTimestamp(),
      detail
    };

    if (store.has(RC)) {
      const behaviorList = store.get(RC);
      store.set(RC, [behaviorItem, ...behaviorList!]);
    } else {
      store.set(RC, [behaviorItem]);
    }

    // store can be asserted that must contains 'router-change' at this time
    immediately && upload(store.get(RC)!);
  };

  // called when routing is switched
  proxyRouterLink([EventType.pushState], handler);
  // called when click the forward and backward buttons
  proxyForwardAndBackward([EventType.popState], handler);
};
