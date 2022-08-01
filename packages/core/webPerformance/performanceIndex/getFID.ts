import { ReportHandler } from 'types/uploader';
import { isPerformanceObserverSupported, isPerformanceSupported } from 'utils/compatible';
import { roundOff } from 'utils/math';
import { disconnect, getObserveFn } from 'core/common/observe';
import { EntryTypes, PerformanceInfoType } from 'core/common/static';
import { Store } from 'core/common/store';

// First Input Delay
const getFID = (): Promise<PerformanceEventTiming> | undefined => {
  return new Promise((resolve, reject) => {
    if (!isPerformanceObserverSupported()) {
      if (!isPerformanceSupported()) {
        reject(new Error('browser do not support performance api'));
      } else {
        reject(new Error('browser has no lcp'));
      }
    } else {
      const fidObserver = getObserveFn([EntryTypes.FID]);
      const callback = (entry: PerformanceEventTiming) => {
        if (entry.entryType === EntryTypes.FID) {
          // if the observer already exists
          // prevent performance watchers from continuing to observe
          observer && disconnect(observer);

          resolve(entry);
        }
      };

      const observer = fidObserver(callback);
    }
  });
};

export const initFID = (store: Store, report: ReportHandler, immediately = true) => {
  getFID()
    ?.then((entry: PerformanceEventTiming) => {
      const indexValue = {
        type: PerformanceInfoType.FID,
        value: roundOff(entry.startTime),
        delay: roundOff(entry.processingStart - entry.startTime, 2),
        eventHandleTime: roundOff(entry.processingEnd - entry.processingStart, 2)
      };

      store.set(PerformanceInfoType.FID, indexValue);

      immediately && report(indexValue);
    })
    .catch(err => console.error(err));
};
