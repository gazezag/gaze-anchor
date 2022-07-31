import { PerformanceNavigationIndex } from 'types/performanceIndex';
import { isPerformanceObserverSupported, isPerformanceSupported } from 'utils/compatible';
import { roundOff } from 'utils/math';
import { disconnect, observe, ObserveHandler } from '../observe';
import { EntryTypes } from '../static';

export const getNavigationTiming = (): Promise<PerformanceNavigationIndex> | undefined => {
  if (!isPerformanceSupported()) {
    console.warn('Performance API not support');
    return;
  }

  const resolveNavigation = (navigation: PerformanceNavigationTiming, resolve: (value: any) => void) => {
    const {
      redirectStart,
      redirectEnd,
      domainLookupStart,
      domainLookupEnd,
      connectStart,
      connectEnd,
      secureConnectionStart,
      requestStart,
      responseStart,
      responseEnd,
      domInteractive,
      domContentLoadedEventStart,
      domContentLoadedEventEnd,
      loadEventStart,
      fetchStart
    } = navigation;

    resolve({
      redirect: roundOff(redirectEnd - redirectStart),
      DNS: roundOff(domainLookupEnd - domainLookupStart),
      TCP: roundOff(connectEnd - connectStart),
      // SSL exists only in https
      SSL: secureConnectionStart ? roundOff(connectEnd - secureConnectionStart) : 0,
      TTFB: roundOff(responseStart - requestStart),
      transmit: roundOff(responseEnd - responseStart),
      domParse: roundOff(domInteractive - responseEnd),
      deferExecuteDuration: roundOff(domContentLoadedEventStart - domInteractive),
      domContentLoadedCallback: roundOff(domContentLoadedEventEnd - domContentLoadedEventStart),
      resourceLoad: roundOff(loadEventStart - domContentLoadedEventEnd),
      domReady: roundOff(domContentLoadedEventEnd - fetchStart),
      L: roundOff(loadEventStart - fetchStart)
    });
  };

  return new Promise(resolve => {
    if (isPerformanceObserverSupported()) {
      const callback = (navigation: PerformanceNavigationTiming) => {
        if (navigation.entryType === EntryTypes.navigation) {
          navigationObserver && disconnect(navigationObserver);

          resolveNavigation(navigation, resolve);
        }
      };

      const navigationObserver = observe(
        [EntryTypes.navigation],
        // must be asserted
        // maybe bug here
        callback as ObserveHandler
      );
    } else {
      const navigation =
        performance.getEntriesByType(EntryTypes.navigation).length > 0
          ? performance.getEntriesByType(EntryTypes.navigation)[0]
          : performance.timing;

      resolveNavigation(navigation as PerformanceNavigationTiming, resolve);
    }
  });
};