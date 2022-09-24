export type ProxyCallback<T> = (data: T) => void;

export interface HttpDetail {
  method: string;
  url: string | URL;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: Document | XMLHttpRequestBodyInit | string | ReadableStream;
  requestTime: DOMHighResTimeStamp;
  responseTime: DOMHighResTimeStamp;
  response: any;
}
