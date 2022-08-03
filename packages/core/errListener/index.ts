import {
  mechanismType,
  ExceptionMetrics,
  httpMetrics,
  EngineInstance,
  ErrorVitalsInitOptions,
  ResourceErrorTarget
} from 'types/errorInfo';
import { parseStackFrames } from './errStack';

// 判断是 JS异常、静态资源异常、还是跨域异常
export const getErrorKey = (event: ErrorEvent | Event) => {
  const isJsError = event instanceof ErrorEvent;
  if (!isJsError) return mechanismType.RS;
  return event.message === 'Script error.' ? mechanismType.CS : mechanismType.JS;
};

// 初始化
export default class ErrorVitals {
  private engineInstance: EngineInstance;

  // 已上报的错误 uid
  private submitErrorUids: Array<string>;

  constructor(engineInstance: EngineInstance, options: ErrorVitalsInitOptions) {
    const { Vue } = options;
    this.engineInstance = engineInstance;
    this.submitErrorUids = [];
    // 初始化 js错误
    this.initJsError();
    // 初始化 静态资源加载错误
    this.initResourceError();
    // 初始化 Promise异常
    this.initPromiseError();
    // 初始化 HTTP请求异常
    // this.initHttpError();
    // 初始化 跨域异常
    this.initCorsError();
    // 初始化 Vue异常
    // this.initVueError(Vue);
  }

  // 封装错误的上报入口，上报前，判断错误是否已经发生过
  errorSendHandler = (data: ExceptionMetrics) => {
    // 统一加上 用户行为追踪 和 页面基本信息
    const submitParams = {
      ...data
      // breadcrumbs: this.engineInstance.userInstance.breadcrumbs.get(),
      // pageInformation: this.engineInstance.userInstance.metrics.get('page-information'),
    } as ExceptionMetrics;
    // 判断同一个错误在本次页面访问中是否已经发生过;
    const hasSubmitStatus = this.submitErrorUids.includes(submitParams.errorUid);
    // 检查一下错误在本次页面访问中，是否已经产生过
    if (hasSubmitStatus) return;
    this.submitErrorUids.push(submitParams.errorUid);
  };

  // 初始化 JS异常 的数据获取和上报
  initJsError = (): void => {
    const handler = (event: ErrorEvent) => {
      // 阻止向上抛出控制台报错
      event.preventDefault();
      if (getErrorKey(event) !== mechanismType.JS) return;
      const exception = {
        // 上报错误归类
        mechanism: {
          type: mechanismType.JS
        },
        // 错误信息
        value: event.message,
        // 错误类型
        type: (event.error && event.error.name) || 'UnKnowun',
        // 解析后的错误堆栈
        stackTrace: {
          frames: parseStackFrames(event.error)
        },
        // 错误的标识码
        errorUid: getErrorUid(`${mechanismType.JS}-${event.message}-${event.filename}`),
        // 附带信息
        meta: {
          // file 错误所处的文件地址
          file: event.filename,
          // col 错误列号
          col: event.colno,
          // row 错误行号
          row: event.lineno
        }
      } as ExceptionMetrics;
      // 一般错误异常立刻上报，不用缓存在本地
      this.errorSendHandler(exception);
    };
    window.addEventListener('error', event => handler(event), true);
  };

  // 初始化 静态资源异常 的数据获取和上报
  initResourceError = (): void => {
    const handler = (event: Event) => {
      event.preventDefault();
      if (getErrorKey(event) !== mechanismType.RS) return;
      const target = event.target as ResourceErrorTarget;
      const exception = {
        mechanism: {
          type: mechanismType.RS
        },
        value: '',
        type: 'ResourceError',
        errorUid: getErrorUid(`${mechanismType.RS}-${target.src}-${target.tagName}`),
        meta: {
          url: target.src,
          html: target.outerHTML,
          type: target.tagName
        }
      } as ExceptionMetrics;
      this.errorSendHandler(exception);
    };
    window.addEventListener('error', event => handler(event), true);
  };

  // 初始化 Promise异常 的数据获取和上报
  initPromiseError = (): void => {
    const handler = (event: PromiseRejectionEvent) => {
      event.preventDefault();
      const value = event.reason.message || event.reason;
      const type = event.reason.name || 'UnKnowun';
      const exception = {
        mechanism: {
          type: mechanismType.UJ
        },
        value,
        type,
        stackTrace: {
          frames: parseStackFrames(event.reason)
        },
        errorUid: getErrorUid(`${mechanismType.UJ}-${value}-${type}`),
        meta: {}
      } as ExceptionMetrics;
      this.errorSendHandler(exception);
    };

    window.addEventListener('unhandledrejection', event => handler(event), true);
  };

  // 初始化 HTTP请求异常 的数据获取和上报（觉得是属于错误模块）
  //   initHttpError = (): void => {

  //   };

  // 初始化 跨域异常 的数据获取和上报
  initCorsError = (): void => {
    const handler = (event: ErrorEvent) => {
      // 阻止向上抛出控制台报错
      event.preventDefault();
      if (getErrorKey(event) !== mechanismType.CS) return;
      const exception = {
        mechanism: {
          type: mechanismType.CS
        },
        value: event.message,
        type: 'CorsError',
        errorUid: getErrorUid(`${mechanismType.JS}-${event.message}`),
        meta: {}
      } as ExceptionMetrics;
      this.errorSendHandler(exception);
    };
    window.addEventListener('error', event => handler(event), true);
  };

  // 初始化 Vue异常 的数据获取和上报
  //   initVueError = (app: Vue): void => {
  //     // 报组件名
  //   };
}

// 对每一个错误详情，生成一串编码
export const getErrorUid = (input: string) => window.btoa(unescape(encodeURIComponent(input)));
