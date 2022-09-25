import { EventType } from 'static';
import { beforeUnload, createlistener, getNow } from 'shared-utils';
import { Uploader } from 'shared-types';
import { BehaviorType, UploadTarget } from '../static';
import { OperationDetail, UserBehavior } from '../types/userBehavior';

const { userBehaviorTarget } = UploadTarget;
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
          // join a identification string while pressed a control key
          // and join the char while pressed the normal key
          operationDetail.innerText += e.key.length !== 1 ? ` [${e.key}] ` : e.key;
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
 * @param { Uploader } upload function used to upload data
 */
const trigger = (detail: OperationDetail, upload: Uploader) => {
  const userBehavior: UserBehavior = {
    time: getNow(),
    value: {
      type: operation,
      page: '',
      time: getNow(),
      detail
    }
  };

  upload(userBehaviorTarget, userBehavior);
};

export const initOperationListener = (upload: Uploader) => {
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
          trigger(prevEvent.detail.value, upload);
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
    trigger(prevEvent.detail.value, upload);
  });
};
