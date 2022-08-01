import { ReportHandler } from 'types/uploader';
import { isPerformanceObserverSupported, isPerformanceSupported } from 'utils/compatible';
import { roundOff } from 'utils/math';
import { disconnect, getObserveFn, ObserveHandler } from 'core/common/observe';
import { EntryNames, EntryTypes, PerformanceInfoType } from 'core/common/static';
import { Store } from 'core/common/store';

const getLCP = (): Promise<PerformanceEntry> | undefined => {
  return new Promise((resolve, reject) => {
    if (!isPerformanceObserverSupported()) {
      if (!isPerformanceSupported()) {
        reject(new Error('browser do not support performance api'));
      } else {
        const [entry] = window.performance.getEntriesByName(EntryNames.LCP);

        entry && resolve(entry);

        reject(new Error('browser has no lcp'));
      }
    } else {
      const lcpObserver = getObserveFn([EntryTypes.LCP]);
      const callback: ObserveHandler = entry => {
        if (entry.name === EntryNames.LCP) {
          // if the observer already exists
          // prevent performance watchers from continuing to observe
          observer && disconnect(observer);

          resolve(entry);
        }
      };

      const observer = lcpObserver(callback);
    }
  });
};

export const initLCP = (store: Store, report: ReportHandler, immediately = true) => {
  getLCP()
    ?.then(entry => {
      const indexValue = {
        type: PerformanceInfoType.LCP,
        value: roundOff(entry.startTime)
      };

      store.set(PerformanceInfoType.LCP, indexValue);

      immediately && report(indexValue);
    })
    .catch(err => console.error(err));
};
