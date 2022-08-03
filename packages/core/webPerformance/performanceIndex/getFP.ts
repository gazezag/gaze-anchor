import { PerformanceInfoUploader } from 'types/uploader';
import { isPerformanceObserverSupported, isPerformanceSupported } from 'utils/compatible';
import { roundOff } from 'utils/math';
import { disconnect, getObserveFn, ObserveHandler } from 'core/common/observe';
import { EntryNames, EntryTypes, PerformanceInfoType } from 'core/common/static';
import { Store } from 'core/common/store';

const getFP = (): Promise<PerformanceEntry> | undefined =>
  new Promise((resolve, reject) => {
    if (!isPerformanceObserverSupported()) {
      if (!isPerformanceSupported()) {
        reject(new Error('browser do not support performance api'));
      } else {
        const [entry] = window.performance.getEntriesByName(EntryNames.FP);

        entry && resolve(entry);

        reject(new Error('browser has no fp'));
      }
    } else {
      const fpObserver = getObserveFn([EntryTypes.paint]);
      const callback: ObserveHandler = entry => {
        if (entry.name === EntryNames.FP) {
          // if the observer already exists
          // prevent performance watchers from continuing to observe
          observer && disconnect(observer);

          resolve(entry);
        }
      };

      const observer = fpObserver(callback);
    }
  });

export const initFP = (store: Store, upload: PerformanceInfoUploader, immediately = true) => {
  getFP()
    ?.then(entry => {
      const indexValue = {
        type: PerformanceInfoType.FP,
        value: roundOff(entry.startTime)
      };

      store.set(PerformanceInfoType.FP, indexValue);

      immediately && upload(indexValue);
    })
    .catch(err => console.error(err));
};
