import { EventType } from 'core/common';
import { onHidden } from './pageHook';

export type EventHandler = (e: ErrorEvent | Event) => void;

interface Option {
  capture: boolean;
  once: boolean;
}

export const createlistener = (eventType: EventType | Array<EventType>) => {
  if (Array.isArray(eventType)) {
    return (eventHandler: EventHandler, option: Option | boolean = true) => {
      eventType.forEach(type => {
        window.addEventListener(type, eventHandler, option);
      });
    };
  }

  return (eventHandler: EventHandler, option: Option | boolean = true) => {
    window.addEventListener(eventType, eventHandler, option);
  };
};

export const removeListener = (
  eventType: EventType | Array<EventType>,
  eventHandler: EventHandler,
  option: Option | boolean = true
) => {
  if (Array.isArray(eventType)) {
    eventType.forEach(type => {
      window.removeEventListener(type, eventHandler, option);
    });
  } else {
    window.removeEventListener(eventType, eventHandler, option);
  }
};

export const dispatchEvent = (event: Event): void => {
  window.dispatchEvent(event);
};

let firstHiddenTime = document.visibilityState === 'hidden' ? 0 : Infinity;
export const getFirstHiddenTime = (): number => {
  onHidden(e => {
    firstHiddenTime = Math.min(firstHiddenTime, e.timeStamp);
  });

  return firstHiddenTime;
};

export const unhandleRejectionListener = (handler: EventHandler) => {
  // TODO
};
