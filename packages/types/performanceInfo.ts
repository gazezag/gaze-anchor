export interface PerformanceInfo {
  web: {
    redirect: number;
    DNS: number;
    TCP: number;
    SSL: number;
    TTFB: number;
    transmit: number;
    domReady: number;
  };
  page: {
    FP: number;
    FCP: number;
    LCP: number;
    FMP: number;
    DCL: number;
    L: number;
    TTI: number;
    FID: number;
  };
}
