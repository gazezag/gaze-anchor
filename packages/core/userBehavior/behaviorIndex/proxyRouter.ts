import { BehaviorInfoUploader } from 'types/uploader';
import { BehaviorItem, RouterChangeDetail, UserBehavior } from 'types/userBehavior';
import { createlistener, dispatchEvent, EventHandler } from 'utils/eventHandler';
import { get, set } from 'utils/reflect';
import { getNow } from 'utils/timestampHandler';
import { BehaviorType, EventType } from 'core/common/static';
import { Store } from 'core/common/store';

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

export const initRouterProxy = (
  store: Store<BehaviorType, UserBehavior>,
  upload: BehaviorInfoUploader,
  immediately: boolean
) => {
  const { routerChange } = BehaviorType;

  const handler = (e: Event) => {
    const { hash, pathname, href } = (e.target as Window).location;

    const detail: RouterChangeDetail = {
      method: hash ? 'Hash' : 'History',
      href
    };
    hash ? set(detail, 'hash', hash) : set(detail, 'pathname', pathname);

    const behaviorItem: BehaviorItem = {
      type: routerChange,
      page: href,
      time: getNow(),
      detail
    };

    if (store.has(routerChange)) {
      store.get(routerChange)!.push(behaviorItem);
    } else {
      store.set(routerChange, [behaviorItem]);
    }

    // store can be asserted that must contains 'router-change' at this time
    immediately && upload(store.get(routerChange)!);
  };

  // called when routing is switched
  proxyRouterLink([EventType.pushState], handler);
  // called when click the forward and backward buttons
  proxyForwardAndBackward([EventType.popState], handler);
};
