import { ErrorType } from 'core/common';
import { BehaviorItem } from './userBehavior';

export interface ErrorStep {
  filename: string;
  functionName: string;
  line: number;
  col: number;
}
// JS
export interface JsErrorDetail {
  type: string;
  stackTrace: Array<ErrorStep>;
}

// Unhandle Rejection
export interface PromiseRejectDetail {
  type: string;
  stackTrace: Array<ErrorStep>;
  reason: string;
}

// Resource Error
export interface ResourceErrorDetail {
  src?: string;
  type?: string;
  outerHTML?: string;
  tagName?: string;
}

// HTTP Error
export interface HttpErrorDetail {
  status: number;
  response: string;
  statusText: string;
}

export interface CorsErrorDetail {
  target: string;
}

export type uid = string;

// 格式化的错误信息
export interface ErrorInfo {
  type: ErrorType;
  // 唯一标识
  errorUid: uid;
  // 错误发生的时间
  time: DOMHighResTimeStamp;
  // 原生报错信息
  message: string;
  // 报错细节
  detail:
    | JsErrorDetail
    | PromiseRejectDetail
    | ResourceErrorDetail
    | HttpErrorDetail
    | CorsErrorDetail;
  // 跟踪用户操作
  breadcrumbs: Array<BehaviorItem>;
}

// 错误类型
// export enum mechanismType {
//   JS = 'js',
//   RS = 'resource',
//   UJ = 'unhandledrejection',
//   HP = 'http',
//   CS = 'cors',
//   VUE = 'vue'
// }

// export enum metricsName {
//   PI = 'page-information',
//   OI = 'origin-information',
//   RCR = 'router-change-record',
//   CBR = 'click-behavior-record',
//   CDR = 'custom-define-record',
//   HT = 'http-record'
// }

// export interface behaviorStack {
//   name: metricsName;
//   page: string;
//   timestamp: number | string;
//   value: Object;
// }

// // 格式化后的 异常数据结构体
// export interface ExceptionMetrics {
//   mechanism: Object;
//   value?: string;
//   type: string;
//   stackTrace?: Object;
//   pageInformation?: Object;
//   breadcrumbs?: Array<behaviorStack>;
//   errorUid: string;
//   meta?: any;
// }

// export interface UserInstance {
//   breadcrumbs: object;
//   metrics: object;
// }

// export interface TransportInstance {
//   breadcrumbs: object;
//   metrics: object;
// }

// export interface EngineInstance {
//   userInstance: UserInstance;
//   transportInstance: TransportInstance;
// }

// // 静态资源错误的 ErrorTarget
// export interface ResourceErrorTarget {
//   src?: string;
//   tagName?: string;
//   outerHTML?: string;
// }

// // http
// export interface httpMetrics {
//   status: number;
//   response: string;
//   statusText: string;
// }

// // 初始化用参
// export interface ErrorVitalsInitOptions {
//   Vue: any;
// }
