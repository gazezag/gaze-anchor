// store some static datas
export const EntryNames = {
  FP: 'first-paint',
  FCP: 'first-contentful-paint',
  LCP: 'largest-contentful-paint'
};

export const EntryTypes = {
  paint: 'paint',
  navigation: 'navigation',
  resource: 'resource',

  LCP: 'largest-contentful-paint',
  FID: 'first-input',
  CLS: 'layout-shift'
};

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

export const uploadTarget = {
  proformance: '',
  errInfo: '',
  userBehavior: ''
};

export enum ErrorType {
  JS = 'js',
  RS = 'resource',
  UJ = 'unhandledrejection',
  HP = 'http',
  CS = 'cors'
}

export enum BehaviorType {
  PI = 'page-information',
  OI = 'origin-information',
  RCR = 'router-change-record',
  CBR = 'click-behavior-record',
  CDR = 'custom-define-record',
  HT = 'http-record'
}

export enum EventType {
  error = 'error',
  unhandledrejection = 'unhandledrejection'
}
