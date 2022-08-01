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

export const unload = (callback: unloadListenerHandler) => {
  window.addEventListener('unload', callback);
};
