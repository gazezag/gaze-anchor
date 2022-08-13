import { PerformanceInfo, PerformanceNavigationIndex } from 'types/performanceIndex';
import { PerformanceInfoUploader } from 'types/uploader';
import { isPerformanceObserverSupported, isPerformanceSupported } from 'utils/compatible';
import { roundOff } from 'utils/math';
import { disconnect, observe, ObserveHandler } from 'core/common/observe';
import { EntryTypes, PerformanceInfoType } from 'core/common/static';
import { Store } from 'core/common/store';
import { getNow } from 'utils/timestampHandler';

const getNavigationTiming = (): Promise<PerformanceNavigationIndex> => {
  const resolveNavigation = (
    navigation: PerformanceNavigationTiming,
    resolve: (value: any) => void
  ) => {
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
      loadEventEnd,
      fetchStart
    } = navigation;

    resolve({
      // may be a mistake here
      redirect: roundOff(redirectEnd - redirectStart),
      // may be a mistake here
      DNS: roundOff(domainLookupEnd - domainLookupStart),
      // may be a mistake here
      TCP: roundOff(connectEnd - connectStart),
      // may be a mistake here
      // SSL exists only in https
      SSL: secureConnectionStart ? roundOff(connectEnd - secureConnectionStart) : 0,
      TTFB: roundOff(responseStart - requestStart),
      transmit: roundOff(responseEnd - responseStart),
      domParse: roundOff(domInteractive - responseEnd),
      deferExecuteDuration: roundOff(domContentLoadedEventStart - domInteractive),
      domContentLoadedCallback: roundOff(domContentLoadedEventEnd - domContentLoadedEventStart),
      // may be a mistake here
      resourceLoad: roundOff(responseEnd - redirectStart),
      domReady: roundOff(domContentLoadedEventEnd - fetchStart),
      // may be a mistake here
      L: roundOff(loadEventEnd - loadEventStart)
    });
  };

  return new Promise((resolve, reject) => {
    if (!isPerformanceSupported()) {
      reject(new Error('browser not support performance API'));
    }

    if (isPerformanceObserverSupported()) {
      const callback = (navigation: PerformanceNavigationTiming) => {
        if (navigation.entryType === EntryTypes.navigation) {
          navigationObserver && disconnect(navigationObserver);

          resolveNavigation(navigation, resolve);
        }
      };

      const navigationObserver = observe(
        EntryTypes.navigation,
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

export const initNavigationTiming = (
  store: Store<PerformanceInfoType, PerformanceInfo>,
  upload: PerformanceInfoUploader,
  immediately: boolean
) => {
  const { NT } = PerformanceInfoType;

  getNavigationTiming()
    .then(navigation => {
      const indexValue = {
        type: NT,
        time: getNow(),
        value: navigation
      };

      store.set(NT, indexValue);

      immediately && upload(indexValue);
    })
    .catch(err => console.error(err));
};
