export enum ErrorType {
  RESOURCE_ERR,
  CODE_ERR,
  PROMISE_REJECT
}

export interface ErrorInfo {
  type: ErrorType;
  message: string;
  time: DOMHighResTimeStamp;
  callStack: any; // any just for now
}
// export enum ErrorType {
//   RESOURCE_ERR,
//   CODE_ERR,
//   PROMISE_REJECT
// }

// export interface ErrorInfo {
//   type: ErrorType;
//   message: string;
//   time: DOMHighResTimeStamp;
//   callStack: any; // any just for now
// }
// 错误类型
//! 静态枚举一般命名开头首字母也大写  MechanismType
export enum mechanismType {
  JS = 'js',
  RS = 'resource',
  UJ = 'unhandledrejection',
  HP = 'http',
  CS = 'cors',
  VUE = 'vue'
}
export enum metricsName {
  PI = 'page-information',
  OI = 'origin-information',
  RCR = 'router-change-record',
  CBR = 'click-behavior-record',
  CDR = 'custom-define-record',
  HT = 'http-record'
}

export interface behaviorStack {
  name: metricsName;
  page: string;
  timestamp: number | string;
  value: Object;
}
// 格式化后的 异常数据结构体
export interface ExceptionMetrics {
  mechanism: Object;
  value?: string;
  type: string;
  stackTrace?: Object;
  pageInformation?: Object;
  breadcrumbs?: Array<behaviorStack>;
  errorUid: string;
  meta?: any;
}

export interface UserInstance {
  breadcrumbs: object;
  metrics: object;
}
export interface TransportInstance {
  breadcrumbs: object;
  metrics: object;
}
export interface EngineInstance {
  userInstance: UserInstance;
  transportInstance: TransportInstance;
}
// 静态资源错误的 ErrorTarget
export interface ResourceErrorTarget {
  src?: string;
  tagName?: string;
  outerHTML?: string;
}
// http
export interface httpMetrics {
  status: number;
  response: string;
  statusText: string;
}

// 初始化用参
export interface ErrorVitalsInitOptions {
  Vue: any;
}
