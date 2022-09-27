import { EventType } from '@gaze-anchor/static';
import {
  AfterLoadListenerHandler,
  BeforeUnloadListenerHandler,
  EventHandler,
  UnloadListenerHandler
} from './types';

export const afterLoad = (callback: AfterLoadListenerHandler) => {
  if (document.readyState === 'complete') {
    setTimeout(callback);
  } else {
    window.addEventListener('pageshow', callback);
  }
};

export const beforeUnload = (callback: BeforeUnloadListenerHandler) => {
  window.addEventListener('beforeunload', callback);
};

export const onUnload = (callback: UnloadListenerHandler) => {
  window.addEventListener('unload', callback);
};

export const onHidden = (callback: EventHandler, once = true) => {
  const hiddenHandler: EventHandler = (event: Event) => {
    if (document.visibilityState === 'hidden') {
      callback(event);
      once && window.removeEventListener(EventType.visibilitychange, hiddenHandler, true);
    }
  };

  window.addEventListener(EventType.visibilitychange, hiddenHandler, true);
};

export const onPageShow = (callback: EventHandler, once = true) => {
  const showHandler: EventHandler = (event: Event) => {
    if (document.visibilityState === 'visible') {
      callback(event);
      once && window.removeEventListener(EventType.pageshow, showHandler, true);
    }
  };

  window.addEventListener(EventType.pageshow, showHandler, { once: true, capture: true });
};

let firstHiddenTime = document.visibilityState === 'hidden' ? 0 : Infinity;
export const getFirstHiddenTime = (): number => {
  onHidden(e => {
    firstHiddenTime = Math.min(firstHiddenTime, e.timeStamp);
  });

  return firstHiddenTime;
};
