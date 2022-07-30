// why is it so difficult to name something, worldless......

import { ObserverEntry, EntryType } from 'types/common';

export type ObserveHandler = (entries: ObserverEntry) => void;

export const getObserveFn = (observeTypes: Array<EntryType>) => {
  return (callback: ObserveHandler) => {
    new PerformanceObserver(callback).observe({ entryTypes: observeTypes });
  };
};
