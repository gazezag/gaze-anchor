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
  RL = 'resource-flow',

  // info
  DI = 'device-info'
}

export const uploadTarget = {
  proformance: '',
  errInfo: '',
  userBehavior: ''
};
