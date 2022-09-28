import {
  isPerformanceObserverSupported,
  isPerformanceSupported,
  roundOff,
  getNow,
  disconnect,
  observe,
  ObserveHandler,
  Uploader,
  ErrorHandler
} from '@gaze-anchor/shared';
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

export const initFP = (upload: Uploader, errorHandler: ErrorHandler) => {
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
    .catch(errorHandler);
};
