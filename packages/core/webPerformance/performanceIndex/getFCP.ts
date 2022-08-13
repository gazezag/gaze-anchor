import { PerformanceInfoUploader } from 'types/uploader';
import { isPerformanceObserverSupported, isPerformanceSupported } from 'utils/compatible';
import { roundOff } from 'utils/math';
import { disconnect, observe, ObserveHandler } from 'core/common/observe';
import { EntryNames, EntryTypes, PerformanceInfoType } from 'core/common/static';
import { Store } from 'core/common/store';
import { PerformanceInfo } from 'types/performanceIndex';
import { getNow } from 'utils/timestampHandler';

const getFCP = (): Promise<PerformanceEntry> =>
  new Promise((resolve, reject) => {
    if (!isPerformanceObserverSupported()) {
      if (!isPerformanceSupported()) {
        reject(new Error('browser do not support performance api'));
      } else {
        const [entry] = window.performance.getEntriesByName(EntryNames.FCP);

        entry && resolve(entry);

        reject(new Error('browser has no fcp'));
      }
    } else {
      const callback: ObserveHandler = entry => {
        if (entry.name === EntryNames.FCP) {
          // if the observer already exists
          // prevent performance watchers from continuing to observe
          observer && disconnect(observer);

          resolve(entry);
        }
      };

      const observer = observe(EntryTypes.paint, callback);
    }
  });

export const initFCP = (
  store: Store<PerformanceInfoType, PerformanceInfo>,
  upload: PerformanceInfoUploader,
  immediately: boolean
) => {
  getFCP()
    .then(entry => {
      const { FCP } = PerformanceInfoType;

      const indexValue = {
        type: FCP,
        time: getNow(),
        value: roundOff(entry.startTime)
      };

      store.set(FCP, indexValue);

      immediately && upload(indexValue);
    })
    .catch(err => console.error(err));
};
