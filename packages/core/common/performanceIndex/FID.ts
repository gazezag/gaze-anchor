import { isPerformanceObserverSupported, isPerformanceSupported } from 'utils/compatible';
import { disconnect, getObserveFn, ObserveHandler } from '../observe';
import { EntryTypes } from '../static';

// First Input Delay
export const getFID = (): Promise<PerformanceEntry> | undefined => {
  return new Promise((resolve, reject) => {
    if (!isPerformanceObserverSupported()) {
      if (!isPerformanceSupported()) {
        reject(new Error('browser do not support performance api'));
      } else {
        reject(new Error('browser has no lcp'));
      }
    } else {
      const fidObserver = getObserveFn([EntryTypes.FID]);
      const callback: ObserveHandler = entry => {
        if (entry.entryType === EntryTypes.FID) {
          // if the observer already exists
          // prevent performance watchers from continuing to observe
          observer && disconnect(observer);

          resolve(entry);
        }
      };

      const observer = fidObserver(callback);
    }
  });
};
