import { Uploader } from 'shared-types';
import {
  isPerformanceObserverSupported,
  isPerformanceSupported,
  roundOff,
  getNow,
  disconnect,
  observe,
  ObserveHandler
} from 'shared-utils';
import { PerformanceInfo } from '../types/performanceIndex';
import { EntryNames, EntryTypes, PerformanceInfoType, UploadTarget } from '../static';

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

export const initFP = (upload: Uploader) => {
  getFP()
    .then(entry => {
      const { FP } = PerformanceInfoType;

      const indexValue: PerformanceInfo = {
        type: FP,
        time: getNow(),
        value: roundOff(entry.startTime)
      };

      upload(performanceTimingTarget, indexValue);
    })
    .catch(err => console.error(err));
};
