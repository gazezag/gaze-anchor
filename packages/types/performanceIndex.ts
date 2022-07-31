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

export interface ResourceFlowTiming {
  name: string;
  initiatorType: string;
  transferSize: number;
  startTime: number;
  responseEnd: number;

  // domainLookupEnd - domainLookupStart
  DNS: number;
  // connectEnd - secureConnectionStart
  SSL: number;
  // responseStart - requestStart
  TTFB: number;
  // responseEnd - responseStart
  transmit: number;
  // connectEnd - connectStart
  initialConnect: number;
  // responseStart - requestStart
  request: number;
  // responseStart - requestStart
  contentDownload: number;
}
