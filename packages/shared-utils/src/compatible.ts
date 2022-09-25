export const isNavigatorSupported = (): boolean => !!window.navigator;

export const isPerformanceSupported = (): boolean =>
  !!window.performance && !!window.performance.getEntriesByType && !!window.performance.mark;

export const isPerformanceObserverSupported = (): boolean => !!window.PerformanceObserver;

export const isBeaconSupported = (): boolean => !!window.navigator.sendBeacon;
