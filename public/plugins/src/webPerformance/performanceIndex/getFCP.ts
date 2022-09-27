<<<<<<< HEAD:packages/plugins/webPerformance/performanceIndex/getFCP.ts
import { disconnect, observe, ObserveHandler } from 'core/index';
import { Uploader, ErrorHandler } from 'types/index';
=======
>>>>>>> refactor-monorepo:public/plugins/src/webPerformance/performanceIndex/getFCP.ts
import {
  isPerformanceObserverSupported,
  isPerformanceSupported,
  roundOff,
  getNow,
  disconnect,
  observe,
  ObserveHandler,
  Uploader
} from '@gaze-anchor/shared';
import { PerformanceInfo } from '../types/performanceIndex';
import { EntryNames, EntryTypes, PerformanceInfoType, UploadTarget } from '../static';

const { performanceTimingTarget } = UploadTarget;

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

export const initFCP = (upload: Uploader, errorHandler: ErrorHandler) => {
  getFCP()
    .then(entry => {
      const { FCP } = PerformanceInfoType;

      const indexValue: PerformanceInfo = {
        type: FCP,
        time: getNow(),
        value: roundOff(entry.startTime)
      };

      upload(performanceTimingTarget, indexValue);
    })
    .catch(errorHandler);
};
