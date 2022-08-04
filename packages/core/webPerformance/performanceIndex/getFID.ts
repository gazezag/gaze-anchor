import { PerformanceInfoUploader } from 'types/uploader';
import { isPerformanceObserverSupported, isPerformanceSupported } from 'utils/compatible';
import { roundOff } from 'utils/math';
import { disconnect, observe, ObserveHandler } from 'core/common/observe';
import { EntryTypes, PerformanceInfoType } from 'core/common/static';
import { Store } from 'core/common/store';
import { PerformanceInfo } from 'types/performanceIndex';

// First Input Delay
const getFID = (): Promise<PerformanceEventTiming> | undefined =>
  new Promise((resolve, reject) => {
    if (!isPerformanceObserverSupported()) {
      if (!isPerformanceSupported()) {
        reject(new Error('browser do not support performance api'));
      } else {
        reject(new Error('browser has no lcp'));
      }
    } else {
      const callback = (entry: PerformanceEventTiming) => {
        if (entry.entryType === EntryTypes.FID) {
          // if the observer already exists
          // prevent performance watchers from continuing to observe
          observer && disconnect(observer);

          resolve(entry);
        }
      };

      const observer = observe(EntryTypes.FID, callback as ObserveHandler);
    }
  });

export const initFID = (
  store: Store<PerformanceInfoType, PerformanceInfo>,
  upload: PerformanceInfoUploader,
  immediately = true
) => {
  getFID()
    ?.then((entry: PerformanceEventTiming) => {
      const indexValue = {
        type: PerformanceInfoType.FID,
        value: roundOff(entry.startTime),
        delay: roundOff(entry.processingStart - entry.startTime, 2),
        eventHandleTime: roundOff(entry.processingEnd - entry.processingStart, 2)
      };

      store.set(PerformanceInfoType.FID, indexValue);

      immediately && upload(indexValue);
    })
    .catch(err => console.error(err));
};
