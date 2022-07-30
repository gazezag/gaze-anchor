export interface WebPerformanceInfo {
  redirect: number;
  DNS: number;
  TCP: number;
  SSL: number;
  TTFB: number;
  transmit: number;
  domReady: number;
}

export interface PagePerformanceInfo {
  FP: number;
  FCP: number;
  LCP: number;
  FMP: number;
  DCL: number;
  L: number;
  TTI: number;
  FID: number;
}

export interface PerformanceInfo {
  web: WebPerformanceInfo;
  page: PagePerformanceInfo;
}

export interface PerformanceEntity extends PerformanceInfo {
  catch: () => void;
}
