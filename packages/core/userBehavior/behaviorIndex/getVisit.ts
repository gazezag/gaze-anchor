import { EventType } from 'core/common';
import { BehaviorInfoUploader } from 'types/uploader';
import { VisitInfo } from 'types/userBehavior';
import { createlistener, removeListener } from 'utils/eventHandler';
import { getTimestamp } from 'utils/timestampHandler';

export const initPV = (upload: BehaviorInfoUploader) => {
  const handler = () => {
    const visitInfo: VisitInfo = {
      time: getTimestamp(),
      origin: document.referrer
    };

    upload(visitInfo);

    // remove this event listener while visit info was uplaoded
    removeListener(EventType.error, handler, { once: true, capture: true });
  };

  createlistener(EventType.load)(handler, { once: true, capture: true });
};
