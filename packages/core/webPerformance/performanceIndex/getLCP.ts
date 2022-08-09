import { PerformanceInfoUploader } from 'types/uploader';
import { isPerformanceObserverSupported } from 'utils/compatible';
import { roundOff } from 'utils/math';
import { disconnect, observe, ObserveHandler, takeRecords } from 'core/common/observe';
import { EntryTypes, EventType, PerformanceInfoType } from 'core/common/static';
import { Store } from 'core/common/store';
import { PerformanceInfo } from 'types/performanceIndex';
import { createlistener, getFirstHiddenTime } from 'utils/eventHandler';
import { onHidden } from 'utils/pageHook';

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

export const initLCP = (
  store: Store<PerformanceInfoType, PerformanceInfo>,
  upload: PerformanceInfoUploader,
  immediately: boolean
) => {
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

        const indexValue = {
          type: LCP,
          value: roundOff(lcp.entry.startTime)
        };

        store.set(LCP, indexValue);

        immediately && upload(indexValue);
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
