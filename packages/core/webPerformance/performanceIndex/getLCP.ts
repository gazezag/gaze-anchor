import { PerformanceInfoUploader } from 'types/uploader';
import { isPerformanceObserverSupported } from 'utils/compatible';
import { roundOff } from 'utils/math';
import { disconnect, observe, ObserveHandler } from 'core/common/observe';
import { EntryTypes, PerformanceInfoType } from 'core/common/static';
import { Store } from 'core/common/store';
import { PerformanceInfo } from 'types/performanceIndex';

const getLCP = (): Promise<PerformanceEntry> | undefined =>
  new Promise((resolve, reject) => {
    if (!isPerformanceObserverSupported()) {
      reject(new Error('browser not support performance observer'));
    } else {
      const callback: ObserveHandler = entry => {
        if (entry.entryType === EntryTypes.LCP) {
          // if the observer already exists
          // prevent performance watchers from continuing to observe
          observer && disconnect(observer);

          resolve(entry);
        }
      };

      const observer = observe(EntryTypes.LCP, callback);
    }
  });

export const initLCP = (
  store: Store<PerformanceInfoType, PerformanceInfo>,
  upload: PerformanceInfoUploader,
  immediately = true
) => {
  getLCP()
    ?.then(entry => {
      const indexValue = {
        type: PerformanceInfoType.LCP,
        value: roundOff(entry.startTime)
      };

      store.set(PerformanceInfoType.LCP, indexValue);

      immediately && upload(indexValue);
    })
    .catch(err => console.error(err));
};
