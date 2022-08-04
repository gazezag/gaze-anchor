import { createErrInfoUploader, ErrorType, Store } from 'core/common';
import { ErrorInfo, uid } from 'types/errorInfo';
import { GazeConfig } from 'types/gaze';
import { ErrorInfoUploader } from 'types/uploader';
import { errorListener, EventHandler } from 'utils/eventListener';
import { getStackParser } from './errStackHandler';

export class ErrorObserver {
  //! 此处指定 Store 的泛型类型
  private store: Store<uid, ErrorInfo>;
  private uploader: ErrorInfoUploader;
  //! 此处使用 Set 记录已经上报过的错误数据
  //! 因为 Set 天然不重复, 且底层是 RBTree 查找性能极佳
  private submitedErrorUids: Set<uid>;
  private stackParser: Function;
  private logError: boolean;

  //! config 的类型未完全确定
  constructor(config: GazeConfig) {
    this.store = new Store();
    this.uploader = createErrInfoUploader(config);
    this.submitedErrorUids = new Set();
    //! 此处使用 config.stackLimit! 来断言该变量必定存在
    this.stackParser = getStackParser(config.stackLimit!);
    this.logError = config.logErrors!;
  }

  init() {
    this.initJsError();
    // TODO
  }

  private initJsError() {
    const handler = (event: ErrorEvent) => {
      // 阻止向上抛出控制台报错
      this.logError || event.preventDefault();

      if (this.getErrorKey(event) !== ErrorType.JS) return;

      const errorUid = this.getUid(`${ErrorType.JS}-${event.message}-${event.filename}`);

      const info: ErrorInfo = {
        // 上报错误归类
        type: ErrorType.JS,
        // 错误的标识码
        errorUid,
        // 错误发生的时间
        time: performance.now(),
        // 错误信息
        message: event.message,
        // 详细信息
        detail: {
          type: event.error?.name || 'Unknwon',
          stackTrace: this.stackParser(event.error)
        },
        // 追踪用户操作
        breadcrumbs: []
      };

      // 若当前错误未上报过则上报, 并记录其 uid
      if (!this.submitedErrorUids.has(errorUid)) {
        this.uploader(info);
        this.submitedErrorUids.add(errorUid);
      }

      // 若需要暂存
      this.store.set(errorUid, info);
    };

    errorListener(handler as EventHandler);
  }

  private initPromiseReject() {
    // TODO
  }

  private initResourceError() {
    // TODO
  }

  private initHttpError() {
    // TODO
  }

  private initCorsError() {
    // TODO
  }

  private getUid(input: string): uid {
    //! 这个 API 已经被废弃了, 考虑用哈希算法手写一个 uid 生成
    // btoa (Byte to Ascii)
    // 将一个二进制字符串编码为 ASCII 字符串
    // 解码使用 atob (Ascii to Byte)
    return window.btoa(unescape(encodeURIComponent(input)));
  }

  private getErrorKey(event: ErrorEvent | Event): string {
    const isJsError = event instanceof ErrorEvent;
    if (!isJsError) return ErrorType.RS;

    return event.message === 'Script error.' ? ErrorType.CS : ErrorType.JS;
  }
}

// import {
//   ErrorType,
//   ExceptionMetrics,
//   httpMetrics,
//   EngineInstance,
//   ErrorVitalsInitOptions,
//   ResourceErrorTarget
// } from 'types/errorInfo';
// import { parseStackFrames } from './errStack';

// //! 这个函数应该不用 export 出去的
// // 判断是 JS异常、静态资源异常、还是跨域异常
// export const getErrorKey = (event: ErrorEvent | Event) => {
//   //! isJsError 是冗余变量
//   const isJsError = event instanceof ErrorEvent;
//   if (!isJsError) return ErrorType.RS;

//   return event.message === 'Script error.' ? ErrorType.CS : ErrorType.JS;
// };

// // 初始化
// export default class ErrorVitals {
//   private engineInstance: EngineInstance;

//   // 已上报的错误 uid
//   private submitErrorUids: Array<string>;

//   //! 构造函数这里的两个参数暂时没看懂要怎么传入
//   //! 个人设想是直接传入一个 config 来进行初始化
//   //! 其中包括字段比如 STACKTRACE_LIMIT
//   //! 在 packages/index.ts 的 Gaze 类里面统一初始化并对外暴露
//   constructor(engineInstance: EngineInstance, options: ErrorVitalsInitOptions) {
//     //! 对 VUE 的支持应该考虑在 plugin 中进行封装, 因此此处感觉并不需要考虑 VUE 的情况
//     const { Vue } = options;
//     this.engineInstance = engineInstance;
//     this.submitErrorUids = [];
//     // 初始化 js错误
//     this.initJsError();
//     // 初始化 静态资源加载错误
//     this.initResourceError();
//     // 初始化 Promise异常
//     this.initPromiseError();
//     // 初始化 HTTP请求异常
//     // this.initHttpError();
//     // 初始化 跨域异常
//     this.initCorsError();
//     // 初始化 Vue异常
//     // this.initVueError(Vue);
//   }

//   // 封装错误的上报入口，上报前，判断错误是否已经发生过
//   errorSendHandler = (data: ExceptionMetrics) => {
//     // 统一加上 用户行为追踪 和 页面基本信息
//     const submitParams = {
//       ...data
//       // breadcrumbs: this.engineInstance.userInstance.breadcrumbs.get(),
//       // pageInformation: this.engineInstance.userInstance.metrics.get('page-information'),
//     } as ExceptionMetrics;

//     //! hasSubmitStatus 冗余变量
//     // 判断同一个错误在本次页面访问中是否已经发生过;
//     const hasSubmitStatus = this.submitErrorUids.includes(submitParams.errorUid);
//     // 检查一下错误在本次页面访问中，是否已经产生过
//     if (hasSubmitStatus) return;

//     this.submitErrorUids.push(submitParams.errorUid);
//   };

//   // 初始化 JS异常 的数据获取和上报
//   initJsError = (): void => {
//     const handler = (event: ErrorEvent) => {
//       // 阻止向上抛出控制台报错
//       event.preventDefault();

//       if (getErrorKey(event) !== ErrorType.JS) return;

//       const exception = {
//         // 上报错误归类
//         mechanism: {
//           type: ErrorType.JS
//         },
//         // 错误信息
//         value: event.message,
//         // 错误类型
//         //! 这里其实可以用 event?.error?.name 来简化代码
//         type: (event.error && event.error.name) || 'UnKnowun',
//         // 解析后的错误堆栈
//         stackTrace: {
//           frames: parseStackFrames(event.error)
//         },
//         // 错误的标识码
//         errorUid: getErrorUid(`${ErrorType.JS}-${event.message}-${event.filename}`),
//         // 附带信息
//         meta: {
//           // file 错误所处的文件地址
//           file: event.filename,
//           // col 错误列号
//           col: event.colno,
//           // row 错误行号
//           row: event.lineno
//         }
//       } as ExceptionMetrics;
//       // 一般错误异常立刻上报，不用缓存在本地
//       this.errorSendHandler(exception);
//     };
//     window.addEventListener('error', event => handler(event), true);
//   };

//   // 初始化 静态资源异常 的数据获取和上报
//   initResourceError = (): void => {
//     const handler = (event: Event) => {
//       event.preventDefault();

//       if (getErrorKey(event) !== ErrorType.RS) return;

//       const target = event.target as ResourceErrorTarget;
//       const exception = {
//         mechanism: {
//           type: ErrorType.RS
//         },
//         value: '',
//         type: 'ResourceError',
//         errorUid: getErrorUid(`${ErrorType.RS}-${target.src}-${target.tagName}`),
//         meta: {
//           url: target.src,
//           html: target.outerHTML,
//           type: target.tagName
//         }
//       } as ExceptionMetrics;
//       this.errorSendHandler(exception);
//     };
//     window.addEventListener('error', event => handler(event), true);
//   };

//   // 初始化 Promise异常 的数据获取和上报
//   initPromiseError = (): void => {
//     const handler = (event: PromiseRejectionEvent) => {
//       event.preventDefault();

//       const value = event.reason.message || event.reason;
//       const type = event.reason.name || 'UnKnowun';
//       const exception = {
//         mechanism: {
//           type: ErrorType.UJ
//         },
//         value,
//         type,
//         stackTrace: {
//           frames: parseStackFrames(event.reason)
//         },
//         errorUid: getErrorUid(`${ErrorType.UJ}-${value}-${type}`),
//         meta: {}
//       } as ExceptionMetrics;
//       this.errorSendHandler(exception);
//     };

//     window.addEventListener('unhandledrejection', event => handler(event), true);
//   };

//   // 初始化 HTTP请求异常 的数据获取和上报（觉得是属于错误模块）
//   //   initHttpError = (): void => {

//   //   };

//   // 初始化 跨域异常 的数据获取和上报
//   initCorsError = (): void => {
//     const handler = (event: ErrorEvent) => {
//       // 阻止向上抛出控制台报错
//       event.preventDefault();

//       if (getErrorKey(event) !== ErrorType.CS) return;
//       const exception = {
//         mechanism: {
//           type: ErrorType.CS
//         },
//         value: event.message,
//         type: 'CorsError',
//         errorUid: getErrorUid(`${ErrorType.JS}-${event.message}`),
//         meta: {}
//       } as ExceptionMetrics;
//       this.errorSendHandler(exception);
//     };
//     window.addEventListener('error', event => handler(event), true);
//   };

//   // 初始化 Vue异常 的数据获取和上报
//   //   initVueError = (app: Vue): void => {
//   //     // 报组件名
//   //   };
// }

// //! 这个函数应该不用 export 的
// // 对每一个错误详情，生成一串编码
// export const getErrorUid = (input: string) => {
//   // btoa (Byte to Ascii)
//   // 将一个二进制字符串编码为 ASCII 字符串
//   // 解码使用 atob (Ascii to Byte)
//   return window.btoa(unescape(encodeURIComponent(input)));
// };
