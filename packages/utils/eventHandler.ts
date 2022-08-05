import { EventType } from 'core/common';

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

export const errorListener = createlistener(EventType.error);
export const unhandleRejectionListener = createlistener(EventType.unhandledrejection);

export const dispatchEvent = (event: Event): void => {
  window.dispatchEvent(event);
};
