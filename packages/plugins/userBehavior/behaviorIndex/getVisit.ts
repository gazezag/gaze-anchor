import { EventType } from 'core/static';
import { UploadTarget } from '../static';
import { Uploader } from 'types/uploader';
import { VisitInfo } from '../types/userBehavior';
import { createlistener, removeListener, getNow } from 'utils/index';

const { visitInfoTarget } = UploadTarget;
const { load } = EventType;

export const initPV = (upload: Uploader) => {
  const getVisitType = () => {
    // TODO no alternative has been found for the time being
    const nvg = window.performance.navigation;
    if (nvg) {
      const { type, TYPE_NAVIGATE, TYPE_RELOAD, TYPE_BACK_FORWARD } = nvg;

      switch (type) {
        case TYPE_NAVIGATE:
          return 'normal';
        case TYPE_RELOAD:
          return 'reload';
        case TYPE_BACK_FORWARD:
          return 'back-forward';
      }
    }

    return 'other';
  };

  const handler = () => {
    const visitInfo: VisitInfo = {
      time: getNow(),
      origin: document.referrer,
      type: getVisitType()
    };

    // upload the visit information immediately
    upload(visitInfoTarget, visitInfo);

    // remove this event listener while visit information has uplaoded
    removeListener(load, handler, { once: true, capture: true });
  };

  createlistener(load)(handler, { once: true, capture: true });
};
