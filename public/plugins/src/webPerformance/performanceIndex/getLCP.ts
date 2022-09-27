import { EventType } from '@gaze-anchor/static';
import {
  isPerformanceObserverSupported,
  roundOff,
  createlistener,
  getFirstHiddenTime,
  getNow,
  disconnect,
  observe,
  ObserveHandler,
  takeRecords,
  onHidden,
  Uploader
} from '@gaze-anchor/shared';
import { PerformanceInfo } from '../types/performanceIndex';
import { EntryTypes, PerformanceInfoType, UploadTarget } from '../static';

const { performanceTimingTarget } = UploadTarget;

interface LCPCache {
  entry: PerformanceEntry;
}

const getLCP = (lcp: LCPCache): Promise<PerformanceObserver> =>
  new Promise((resolve, reject) => {
    if (!isPerformanceObserverSupported()) {
      reject(new Error('browser not support performance observer'));
    } else {
      const firstHiddenTime = getFirstHiddenTime();

      const callback: ObserveHandler = entry => {
        if (entry.entryType === EntryTypes.LCP && entry.startTime < firstHiddenTime) {
          lcp.entry = entry;
          resolve(observer);
        }
      };

      const observer = observe(EntryTypes.LCP, callback);
    }
  });

export const initLCP = (upload: Uploader) => {
  const lcp: LCPCache = { entry: {} as PerformanceEntry };

  getLCP(lcp)
    .then(observer => {
      const { LCP } = PerformanceInfoType;
      const { click, keydown } = EventType;

      const clearListener = () => {
        takeRecords(observer).forEach(entry => {
          lcp.entry = entry;
        });
        disconnect(observer);

        const indexValue: PerformanceInfo = {
          type: LCP,
          time: getNow(),
          value: roundOff(lcp.entry.startTime)
        };

        upload(performanceTimingTarget, indexValue);
      };

      // listene to the hidden, click, keydown event
      // only upload the data while these event triggered
      onHidden(clearListener);
      createlistener([click, keydown])(clearListener, {
        once: true,
        capture: true
      });
    })
    .catch(err => console.error(err));
};
