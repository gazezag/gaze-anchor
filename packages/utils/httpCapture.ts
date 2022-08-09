export interface httpType {
    method: string;
    url: string | URL;
    body: Document | XMLHttpRequestBodyInit | null | undefined | ReadableStream;
    requestTime: number;
    responseTime: number;
    status: number;
    statusText: string;
    response?: any;
  }


  // 对 XMLHttpRequest、fetch 进行劫持 ，往接口请求中加入所需的一些参数捕获
  export const proxyXmlHttp = (handler: Function) => {
    if ('XMLHttpRequest' in window && typeof window.XMLHttpRequest === 'function') {
      // 赋值gXMLHttpRequest
      const gXMLHttpRequest = window.XMLHttpRequest;
      if (!(window as any).gXMLHttpRequest) {
        (window as any).gXMLHttpRequest = gXMLHttpRequest;
      }
      (window as any).XMLHttpRequest = function () {
        
        const xhr = new gXMLHttpRequest();
        const { open, send } = xhr;
        let httpType = {} as httpType;
        xhr.open = (method, url) => {
          httpType.method = method;
          httpType.url = url;
          open.call(xhr, method, url, true);
        };
        xhr.send = (body) => {
          httpType.body = body || '';
          httpType.requestTime = new Date().getTime();
          send.call(xhr, body);
        };
        // loadend 外部资源停止加载触发
        xhr.addEventListener('loadend', () => {
          const { status, statusText, response } = xhr;
          httpType = {
            ...httpType,
            status,
            statusText,
            response,
            responseTime: new Date().getTime(),
          };
          if (typeof handler === 'function') handler(httpType);
        });
        return xhr;
      };
    }
  };

export const proxyFetch = (handler: Function) => {
    if ('fetch' in window && typeof window.fetch === 'function') {
      const gFetch = window.fetch;
      if (!(window as any).gFetch) {
        (window as any).gFetch = gFetch;
      }
      (window as any).fetch = async (input: any, init: RequestInit) => {
        let httpType = {} as httpType;
  
        httpType.method = init?.method || '';
        httpType.url = (input && typeof input !== 'string' ? input?.url : input) || '';
        httpType.body = init?.body || '';
        httpType.requestTime = new Date().getTime();
  
        return gFetch.call(window, input, init).then(async (response) => {
          const res = response.clone();
          httpType = {
            ...httpType,
            status: res.status,
            statusText: res.statusText,
            response: await res.text(),
            responseTime: new Date().getTime(),
          };
          if (typeof handler === 'function') handler(httpType);
          return response;
        });
      };
    }
  };
  