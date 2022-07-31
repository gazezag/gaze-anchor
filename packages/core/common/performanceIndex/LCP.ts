import {
  isPerformanceObserverSupported,
  isPerformanceSupported
} from 'utils/compatible';
import { disconnect, getObserveFn, ObserveHandler } from '../observe';
import { EntryNames, EntryTypes } from '../static';

export const getLCP = (): Promise<PerformanceEntry> | undefined => {
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
      const paintObserver = getObserveFn([EntryTypes.LCP]);
      const callback: ObserveHandler = entry => {
        if (entry.name === EntryNames.LCP) {
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
