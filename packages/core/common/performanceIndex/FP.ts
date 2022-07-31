import { isPerformanceObserverSupported, isPerformanceSupported } from 'utils/compatible';
import { disconnect, getObserveFn, ObserveHandler } from '../observe';
import { EntryNames, EntryTypes } from '../static';

export const getFP = (): Promise<PerformanceEntry> | undefined => {
  return new Promise((resolve, reject) => {
    if (!isPerformanceObserverSupported()) {
      if (!isPerformanceSupported()) {
        reject(new Error('browser do not support performance api'));
      } else {
        const [entry] = window.performance.getEntriesByName(EntryNames.FP);

        entry && resolve(entry);

        reject(new Error('browser has no fp'));
      }
    } else {
      const paintObserver = getObserveFn([EntryTypes.paint]);
      const callback: ObserveHandler = entry => {
        if (entry.name === EntryNames.FP) {
          // if the observer already exists
          // prevent performance watchers from continuing to observe
          observer && disconnect(observer);

          resolve(entry);
        }
      };

      const observer = paintObserver(callback);
    }
  });
};

// getFP()
//   ?.then(entry => {
//     console.log(roundOff(entry.startTime));
//     console.log(entry.duration);
//   })
//   .catch(err => {
//     console.error(err);
//   });
