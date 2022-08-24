import { ErrorType, EventType, Store, createUploader } from 'core/common';
import { ErrorInfo, uid, ResourceErrorDetail } from 'types/errorInfo';
import { ErrorCaptureConfig } from 'types/gaze';
import { createlistener, EventHandler } from 'utils/eventHandler';
import { getNow } from 'utils/timestampHandler';
import { proxyXmlHttp, proxyFetch, httpType } from 'utils/httpCapture';
import { getStackParser } from './errStackHandler';
import { UploadTarget } from 'core/common';
import { Uploader } from 'types/uploader';
const { erorrInfoTarget } = UploadTarget;

export class ErrorObserver {
  private store: Store<uid, ErrorInfo>;
  private uploader: Uploader;
  private submitedErrorUids: Set<uid>;
  private stackParser: Function;
  private logError: boolean;

  constructor(baseURL: string, config: ErrorCaptureConfig) {
    const { duration, logErrors, stackLimit } = config;

    this.store = new Store();
    this.uploader = createUploader(baseURL);
    this.submitedErrorUids = new Set();
    this.stackParser = getStackParser(stackLimit!);
    this.logError = logErrors!;
  }

  init() {
    this.initJsError();
    this.initPromiseReject();
    this.initResourceError();
    this.initHttpError();
    this.initCorsError();
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
        time: getNow(),
        // 错误信息
        message: event.message,
        // 详细信息
        detail: {
          type: event.error?.name || 'Unknwon',
          stackTrace: this.stackParser(event.error)
        }
      };
      // 若当前错误未上报过则上报, 并记录其 uid
      if (!this.submitedErrorUids.has(errorUid)) {
        this.uploader(erorrInfoTarget, info);
        this.submitedErrorUids.add(errorUid);
      }

      // 若需要暂存
      this.store.set(errorUid, info);
    };

    createlistener(EventType.error)(handler as EventHandler);
  }

  private initPromiseReject() {
    const handler = (event: PromiseRejectionEvent) => {
      // 阻止向上抛出控制台报错
      this.logError || event.preventDefault();

      const value = event.reason;
      const type = event.reason.name || 'UnKnowun';
      const errorUid = this.getUid(`${ErrorType.UJ}-${value}-${type}`);

      const info: ErrorInfo = {
        // 上报错误归类
        type: ErrorType.UJ,
        // 错误的标识码
        errorUid,
        // 错误发生的时间
        time: getNow(),
        // 错误信息
        message: value,
        // 详细信息
        detail: {
          type: event.reason || 'Unknwon',
          stackTrace: this.stackParser(event.reason)
        }
      };

      // 若当前错误未上报过则上报, 并记录其 uid
      if (!this.submitedErrorUids.has(errorUid)) {
        this.uploader(erorrInfoTarget, info);
        this.submitedErrorUids.add(errorUid);
      }

      // 若需要暂存
      this.store.set(errorUid, info);
    };

    createlistener(EventType.unhandledrejection)(handler as EventHandler);
  }

  private initResourceError() {
    const handler = (event: ErrorEvent) => {
      this.logError || event.preventDefault();

      if (this.getErrorKey(event) !== ErrorType.RS) return;
      const target = event.target as ResourceErrorDetail;
      const errorUid = this.getUid(`${ErrorType.RS}-${target.src}-${target.tagName}`);

      const info: ErrorInfo = {
        // 上报错误归类
        type: ErrorType.RS,
        // 错误的标识码
        errorUid,
        // 错误发生的时间
        time: getNow(),
        // 错误信息
        message: '',
        // 详细信息
        detail: {
          type: event.error?.name || 'Unknwon',
          src: target.src,
          outerHTML: target.outerHTML,
          tagName: target.tagName
        }
      };
      // 若当前错误未上报过则上报, 并记录其 uid
      if (!this.submitedErrorUids.has(errorUid)) {
        this.uploader(erorrInfoTarget, info);
        this.submitedErrorUids.add(errorUid);
      }

      // 若需要暂存
      this.store.set(errorUid, info);
    };

    createlistener(EventType.error)(handler as EventHandler, true);
  }

  // TODO
  private initHttpError() {
    const handler = (event: httpType) => {
      if (event.status < 400) return;
      const errorUid = this.getUid(`${ErrorType.RS}-${event.response}-${event.statusText}`);

      const info: ErrorInfo = {
        // 上报错误归类
        type: ErrorType.HP,
        // 错误的标识码
        errorUid,
        // 错误发生的时间
        time: getNow(),
        // 错误信息
        message: event.response,
        // 详细信息
        detail: {
          status: event.status,
          response: event.response,
          statusText: event.statusText
        }
      };
      // 若当前错误未上报过则上报, 并记录其 uid
      if (!this.submitedErrorUids.has(errorUid)) {
        this.uploader(erorrInfoTarget, info);
        this.submitedErrorUids.add(errorUid);
      }

      // 若需要暂存
      this.store.set(errorUid, info);
    };

    proxyXmlHttp(handler);
    proxyFetch(handler);
  }

  private initCorsError() {
    const handler = (event: ErrorEvent) => {
      this.logError || event.preventDefault();

      if (this.getErrorKey(event) !== ErrorType.CS) return;

      const errorUid = this.getUid(`${ErrorType.CS}-${event.message}`);
      const info: ErrorInfo = {
        // 上报错误归类
        type: ErrorType.CS,
        // 错误的标识码
        errorUid,
        // 错误发生的时间
        time: getNow(),
        // 错误信息
        message: event.message,
        // 详细信息
        detail: {
          tagName: ''
        }
      };
      // 若当前错误未上报过则上报, 并记录其 uid
      if (!this.submitedErrorUids.has(errorUid)) {
        this.uploader(erorrInfoTarget, info);
        this.submitedErrorUids.add(errorUid);
      }

      // 若需要暂存
      this.store.set(errorUid, info);
    };

    createlistener(EventType.error)(handler as EventHandler);
  }

  private getUid(input: string): uid {
    return window.btoa(encodeURIComponent(input)).slice(0, 255);
  }

  private getErrorKey(event: ErrorEvent | Event): string {
    const isJsError = event instanceof ErrorEvent;
    if (!isJsError) return ErrorType.RS;

    return event.message === 'Script error.' ? ErrorType.CS : ErrorType.JS;
  }
}
