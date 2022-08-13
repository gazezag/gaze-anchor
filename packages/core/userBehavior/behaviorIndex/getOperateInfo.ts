import { BehaviorType, EventType, Store } from 'core/common';
import { BehaviorInfoUploader } from 'types/uploader';
import { BehaviorItem, OperationDetail, UserBehavior } from 'types/userBehavior';
import { createlistener } from 'utils/eventHandler';
import { beforeUnload } from 'utils/pageHook';
import { getNow } from 'utils/timestampHandler';

const { operation } = BehaviorType;
const { click, dblClick, keydown } = EventType;

interface EventCache {
  type: string;
  e: MouseEvent | KeyboardEvent;
  target: Element;
  track: (e: MouseEvent | KeyboardEvent | any) => void;
  detail: { value: OperationDetail };
}

/**
 * @description create a collector to cache event data,
 *              data will only be collected and collated here,
 *              not upload
 * @param { Element } target event object triggered continuously
 * @param { EventType } type event type which triggered continuously
 * @return return a object contains 'track' method and 'operationDetail'
 */
const createTracker = (target: Element | null, type: EventType) => {
  const operationDetail: OperationDetail = {
    type,
    target,
    count: 0,
    id: target?.id || '',
    classList: target?.className ? target.className.split(' ') : [],
    // maybe bug here
    tagName: target?.localName || '',
    innerText: ''
  };

  // cache the handler function
  const handleDetail =
    type === keydown
      ? (e: KeyboardEvent) => {
          if (e.key.length !== 1) {
            // join a identification string while pressed a control key
            operationDetail.innerText += ` [${e.key}] `;
          } else {
            // join the char while pressed the normal key
            operationDetail.innerText += e.key;
          }
        }
      : (e: MouseEvent) => (operationDetail.innerText = (e.target as any).innerText);

  const track = (e: MouseEvent | KeyboardEvent | any) => {
    operationDetail.count++;
    handleDetail(e);
  };

  return {
    track,
    detail: {
      // lazy evaluation
      get value() {
        return operationDetail;
      }
    }
  };
};

/**
 * @description cooperate with track, data will be cached and uploaded here
 * @param { OperationDetail } detail data collected by track
 * @param { Store<BehaviorType, UserBehavior> } store target of cache
 * @param { BehaviorInfoUploader } upload function used to upload data
 * @param { boolean } immediately upload the data immediately or not
 */
const trigger = (
  detail: OperationDetail,
  store: Store<BehaviorType, UserBehavior>,
  upload: BehaviorInfoUploader,
  immediately: boolean
) => {
  const behaviorItem: BehaviorItem = {
    type: operation,
    page: '',
    time: getNow(),
    detail
  };

  if (store.has(operation)) {
    store.get(operation)!.push(behaviorItem);
  } else {
    store.set(operation, [behaviorItem]);
  }

  immediately && upload(store.get(operation)!);
};

export const initOperationListener = (
  store: Store<BehaviorType, UserBehavior>,
  upload: BehaviorInfoUploader,
  immediately: boolean
) => {
  const prevEvent = {
    type: '',
    e: null,
    target: null,
    track: null,
    detail: null
  } as unknown as EventCache; // bypass type checking......

  // listen to click, keydown and dblClick events
  [click, keydown, dblClick].forEach(type => {
    createlistener(type)((e: MouseEvent | KeyboardEvent | any) => {
      if (type !== prevEvent.type) {
        // trigger
        if (prevEvent.e && prevEvent.type) {
          trigger(prevEvent.detail.value, store, upload, immediately);
        }

        // initialize the event cache while not trigger the same event continuously
        const target = e.target ? e.target : e.path ? e.path.pop() : null;
        const { track, detail } = createTracker(target, type);
        prevEvent.type = type;
        prevEvent.e = e;
        prevEvent.target = target;
        prevEvent.track = track;
        prevEvent.detail = detail;
      }

      // track
      prevEvent.track(e);
    });
  });

  // upload the last operation before the user exits the page
  beforeUnload(() => {
    trigger(prevEvent.detail.value, store, upload, immediately);
  });
};
