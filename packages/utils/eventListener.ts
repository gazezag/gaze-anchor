import { EventType } from 'core/common';

export type EventHandler = (e: ErrorEvent | Event) => void;

interface Option {
  capture: boolean;
  once: boolean;
}

const createlistener = (eventType: EventType) => {
  return (eventHandler: EventHandler, option: Option | boolean = true) => {
    window.addEventListener(eventType, eventHandler, option);
  };
};

export const errorListener = createlistener(EventType.error);
export const unhandleRejectionListener = createlistener(EventType.unhandledrejection);
