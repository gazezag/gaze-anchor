import { EventType } from 'core/static';

type EventHandler = (e: ErrorEvent | Event) => void;
type afterLoadListenerHandler = (this: Window, ev: PageTransitionEvent) => any;
type beforeUnloadListenerHandler = (this: Window, ev: BeforeUnloadEvent) => any;
type unloadListenerHandler = (this: Window, ev: Event) => any;

export const afterLoad = (callback: afterLoadListenerHandler) => {
  if (document.readyState === 'complete') {
    setTimeout(callback);
  } else {
    window.addEventListener('pageshow', callback);
  }
};

export const beforeUnload = (callback: beforeUnloadListenerHandler) => {
  window.addEventListener('beforeunload', callback);
};

export const onUnload = (callback: unloadListenerHandler) => {
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