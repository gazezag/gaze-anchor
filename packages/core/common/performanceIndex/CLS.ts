import { isPerformanceObserverSupported, isPerformanceSupported } from 'utils/compatible';
import { disconnect, getObserveFn, ObserveHandler } from '../observe';
import { EntryTypes } from '../static';

interface LayoutShift extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}

// Cumulative Layout Shift
export const getCLS = (): Promise<PerformanceEntry> | undefined => {
  return new Promise((resolve, reject) => {
    if (!isPerformanceObserverSupported()) {
      if (!isPerformanceSupported()) {
        reject(new Error('browser do not support performance api'));
      } else {
        reject(new Error('browser has no lcp'));
      }
    } else {
      const clsObserver = getObserveFn([EntryTypes.CLS]);
      const callback: ObserveHandler = entry => {
        if (entry.entryType === EntryTypes.CLS) {
          // if the observer already exists
          // prevent performance watchers from continuing to observe
          observer && disconnect(observer);

          resolve(entry);
        }
      };

      const observer = clsObserver(callback);
    }
  });
};
