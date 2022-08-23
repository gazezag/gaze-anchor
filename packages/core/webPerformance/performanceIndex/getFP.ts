import { Uploader } from 'types/uploader';
import { isPerformanceObserverSupported, isPerformanceSupported } from 'utils/compatible';
import { roundOff } from 'utils/math';
import { disconnect, observe, ObserveHandler } from 'core/common/observe';
import { EntryNames, EntryTypes, PerformanceInfoType } from 'core/common/static';
import { Store } from 'core/common/store';
import { PerformanceInfo } from 'types/performanceIndex';
import { getNow } from 'utils/timestampHandler';
import { UploadTarget } from 'core/common';
const { performanceTimingTarget } = UploadTarget;

const getFP = (): Promise<PerformanceEntry> =>
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
      const callback: ObserveHandler = entry => {
        if (entry.name === EntryNames.FP) {
          // if the observer already exists
          // prevent performance watchers from continuing to observe
          observer && disconnect(observer);

          resolve(entry);
        }
      };

      const observer = observe(EntryTypes.paint, callback);
    }
  });

export const initFP = (
  store: Store<PerformanceInfoType, PerformanceInfo>,
  upload: Uploader,
  immediately: boolean
) => {
  getFP()
    .then(entry => {
      const { FP } = PerformanceInfoType;

      const indexValue = {
        type: FP,
        time: getNow(),
        value: roundOff(entry.startTime)
      };

      store.set(FP, indexValue);

      immediately && upload(performanceTimingTarget, indexValue);
    })
    .catch(err => console.error(err));
};
