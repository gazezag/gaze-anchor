import { PerformanceInfoUploader } from 'types/uploader';
import { isPerformanceObserverSupported, isPerformanceSupported } from 'utils/compatible';
import { roundOff } from 'utils/math';
import { disconnect, observe, ObserveHandler } from 'core/common/observe';
import { EntryTypes, PerformanceInfoType } from 'core/common/static';
import { Store } from 'core/common/store';
import { PerformanceInfo } from 'types/performanceIndex';

interface LayoutShift extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}

// Cumulative Layout Shift
const getCLS = (): Promise<PerformanceEntry> | undefined =>
  new Promise((resolve, reject) => {
    if (!isPerformanceObserverSupported()) {
      if (!isPerformanceSupported()) {
        reject(new Error('browser do not support performance api'));
      } else {
        reject(new Error('browser has no lcp'));
      }
    } else {
      const callback: ObserveHandler = entry => {
        if (entry.entryType === EntryTypes.CLS) {
          // if the observer already exists
          // prevent performance watchers from continuing to observe
          observer && disconnect(observer);

          resolve(entry);
        }
      };

      const observer = observe(EntryTypes.CLS, callback);
    }
  });

export const initCLS = (
  store: Store<PerformanceInfoType, PerformanceInfo>,
  upload: PerformanceInfoUploader,
  immediately = true
) => {
  getCLS()
    ?.then(entry => {
      const indexValue = {
        type: PerformanceInfoType.CLS,
        value: roundOff(entry.startTime)
      };

      store.set(PerformanceInfoType.CLS, indexValue);

      immediately && upload(indexValue);
    })
    .catch(err => console.error(err));
};
