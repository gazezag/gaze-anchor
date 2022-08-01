import { ReportHandler } from 'types/uploader';
import { isPerformanceObserverSupported, isPerformanceSupported } from 'utils/compatible';
import { roundOff } from 'utils/math';
import { disconnect, getObserveFn, ObserveHandler } from 'core/common/observe';
import { EntryTypes, PerformanceInfoType } from 'core/common/static';
import { Store } from 'core/common/store';

interface LayoutShift extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}

// Cumulative Layout Shift
const getCLS = (): Promise<PerformanceEntry> | undefined => {
  return new Promise((resolve, reject) => {
    if (!isPerformanceObserverSupported()) {
      if (!isPerformanceSupported()) {
        reject(new Error('browser do not support performance api'));
      } else {
        reject(new Error('browser has no lcp'));
      }
    } else {
      const clsObserver = getObserveFn([EntryTypes.CLS]);
      const callback: ObserveHandler = entry => {
        if (entry.entryType === EntryTypes.CLS) {
          // if the observer already exists
          // prevent performance watchers from continuing to observe
          observer && disconnect(observer);

          resolve(entry);
        }
      };

      const observer = clsObserver(callback);
    }
  });
};

export const initCLS = (store: Store, report: ReportHandler, immediately = true) => {
  getCLS()
    ?.then(entry => {
      const indexValue = {
        type: PerformanceInfoType.CLS,
        value: roundOff(entry.startTime)
      };

      store.set(PerformanceInfoType.CLS, indexValue);

      immediately && report(indexValue);
    })
    .catch(err => console.error(err));
};
