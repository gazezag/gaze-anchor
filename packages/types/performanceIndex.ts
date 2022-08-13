import { PerformanceInfoType } from 'core/common';

export interface PerformanceNavigationIndex {
  time: number;
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
  time: number;
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

export interface PerformanceInfo {
  type: PerformanceInfoType;
  time: number;
  value: any;
}

export interface PerformanceInfoObj {
  [name: string]: PerformanceInfo;
}
