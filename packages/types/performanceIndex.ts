export interface PerformanceNavigationIndex {
  // redirectEnd - redirectStart
  redirect: number;
  // domainLookupEnd - domainLookupStart
  DNS: number;
  // connectEnd - connectStart
  TCP: number;
  // connectEnd - secureConnectionStart
  SSL: number;
  // responseStart - requestStart
  TTFB: number;
  // responseEnd - responseStart
  transmit: number;
  // domInteractive - responseEnd
  domParse: number;
  // domContentLoadedEventStart - domInteractive
  deferExecuteDuration: number;
  // domContentLoadedEventEnd - domContentLoadedEventStart
  domContentLoadedCallback: number;
  // loadEventStart - domContentLoadedEventEnd
  resourceLoad: number;
  // domContentLoadedEventEnd - fetchStart
  domReady: number;
  // loadEventStart - fetchStart
  L: number;
}
