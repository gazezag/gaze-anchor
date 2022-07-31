import { ResourceFlowTiming } from 'types/performanceIndex';
import { isPerformanceObserverSupported, isPerformanceSupported } from 'utils/compatible';
import { roundOff } from 'utils/math';
import { disconnect, observe, ObserveHandler } from '../observe';
import { EntryTypes } from '../static';

export const getResourceFlowTiming = (): Promise<ResourceFlowTiming> | undefined => {
  if (!isPerformanceSupported()) {
    console.warn('Performance API not support');
    return;
  }

  const resolveResourceFlow = (entry: PerformanceResourceTiming, resolve: (value: any) => void) => {
    const {
      name,
      transferSize,
      initiatorType,
      startTime,
      responseEnd,
      domainLookupEnd,
      domainLookupStart,
      connectStart,
      connectEnd,
      secureConnectionStart,
      responseStart,
      requestStart
    } = entry;

    resolve({
      name,
      transferSize,
      initiatorType,
      startTime,
      responseEnd,
      DNS: roundOff(domainLookupEnd - domainLookupStart),
      initialConnect: roundOff(connectEnd - connectStart),
      SSL: roundOff(connectEnd - secureConnectionStart),
      request: roundOff(responseStart - requestStart),
      TTFB: roundOff(responseStart - requestStart),
      transmit: roundOff(responseEnd - responseStart),
      contentDownload: roundOff(responseStart - requestStart)
    });
  };

  // TODO added cache-hit-rate
  // TODO cache-hit: duration == 0 && transferSize !== 0
  return new Promise((resolve, reject) => {
    if (!isPerformanceObserverSupported()) {
      reject(new Error('browser does not support the PerformanceObserver'));
    } else {
      const callback = (entry: PerformanceResourceTiming) => {
        if (entry.entryType === EntryTypes.resource) {
          resourceObserver && disconnect(resourceObserver);

          resolveResourceFlow(entry, resolve);
        }
      };

      const resourceObserver = observe(
        [EntryTypes.resource],
        // must be asserted
        // maybe bug here
        callback as ObserveHandler
      );
    }
  });
};
