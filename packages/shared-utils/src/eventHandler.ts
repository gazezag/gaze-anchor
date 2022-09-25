import { EventType } from 'static';
import { EventHandler } from './types';

interface Option {
  capture: boolean;
  once: boolean;
}

export const createlistener = (
  eventType: EventType | Array<EventType>,
  target: Element | Window = window
) => {
  if (Array.isArray(eventType)) {
    return (eventHandler: EventHandler, option: Option | boolean = true) => {
      eventType.forEach(type => {
        target.addEventListener(type, eventHandler, option);
      });
    };
  }

  return (eventHandler: EventHandler, option: Option | boolean = true) => {
    target.addEventListener(eventType, eventHandler, option);
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
