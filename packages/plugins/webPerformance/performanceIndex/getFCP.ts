import { EntryNames, EntryTypes, PerformanceInfoType, UploadTarget } from '../static';
import { Uploader } from 'types/uploader';
import { isPerformanceObserverSupported, isPerformanceSupported } from 'utils/compatible';
import { roundOff } from 'utils/math';
import { disconnect, observe, ObserveHandler } from 'core/observe';
import { PerformanceInfo } from 'packages/plugins/webPerformance/types/performanceIndex';
import { getNow } from 'utils/timestampHandler';
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

export const initFCP = (upload: Uploader) => {
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
    .catch(err => console.error(err));
};
