import { EventType } from 'static';
import { createlistener, EventHandler } from 'shared-utils';

/**
 * @description accumulate the number of clicks on an DOM element
 * @param { Element } dom target DOM element
 * @return get the value via xxx.value
 */
export const countClick = (dom: Element) => {
  let count = 0;
  const handler: EventHandler = () => {
    count++;
  };

  createlistener(EventType.click, dom)(handler, {
    capture: false,
    once: false
  });

  return {
    get value() {
      return count;
    }
  };
};
