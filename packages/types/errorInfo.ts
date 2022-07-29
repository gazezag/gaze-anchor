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
