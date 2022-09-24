export enum UploadTarget {
  navigationTimingTarget = 'navigation-timing',
  performanceTimingTarget = 'performance-timing',
  deviceInfoTarget = 'platform-info',
  resourceFlowTarget = 'resource-flow'
}

export enum EntryNames {
  FP = 'first-paint',
  FCP = 'first-contentful-paint',
  LCP = 'largest-contentful-paint'
}

export enum EntryTypes {
  paint = 'paint',
  navigation = 'navigation',
  resource = 'resource',

  LCP = 'largest-contentful-paint',
  FID = 'first-input',
  CLS = 'layout-shift'
}

export enum PerformanceInfoType {
  // performance
  CLS = 'cumulative-layout-shift',
  NT = 'navigation-timing',
  FP = 'first-paint',
  FCP = 'first-contentful-paint',
  LCP = 'largest-contentful-paint',
  FID = 'first-input-delay',
  RF = 'resource-flow',

  // info
  DI = 'device-info'
}

export enum OSType {
  Windows = 'Windows',
  MacOS = 'MacOs',
  Linux = 'Linux',
  Unknown = 'Unknow'
}

export enum BrowserType {
  Chrome = 'Chrome',
  Safari = 'Safari',
  Edge = 'Edge',
  IE = 'IE',
  Firefox = 'Firefox',
  Opera = 'Opera',
  Unknown = 'Unknown'
}
