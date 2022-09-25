import { has, set } from './reflect';
import { getTimestamp } from './timestampHandler';
import { ProxyCallback, HttpDetail } from './types';

class ProxyHttpContext {
  static instance: ProxyHttpContext;
  private callbacks: Set<ProxyCallback<HttpDetail>>;

  private constructor() {
    this.callbacks = new Set();
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new ProxyHttpContext();
    }

    return this.instance;
  }

  add(callback: ProxyCallback<HttpDetail>) {
    this.callbacks.has(callback) || this.callbacks.add(callback);
  }

  walk(httpDetail: HttpDetail) {
    this.callbacks.forEach(f => f(httpDetail));
  }
}

/**
 * @description rewrite the global object 'XMLHttpRequest' to proxy the ajax request
 */
const proxyXhr = (context: ProxyHttpContext) => {
  if (!has(window, 'XMLHttpRequest')) {
    console.error('there has no XMLHttpRequest...');
    return;
  }

  if (!has(window, 'nativeXhr')) {
    const nativeXhr = window.XMLHttpRequest;

    // mount native XHR for internal business
    set(window, 'nativeXhr', nativeXhr);

    class ProxiedXhr {
      private xhr: XMLHttpRequest = new nativeXhr();
      private xhrDetail: HttpDetail;

      constructor() {
        this.xhrDetail = {
          method: '',
          url: '',
          headers: {},
          body: '',
          status: 0,
          statusText: '',
          requestTime: 0,
          responseTime: 0,
          response: ''
        };
        this.xhr.addEventListener('loadend', () => {
          const { status, statusText, response } = this.xhr;

          this.xhrDetail.status = status;
          this.xhrDetail.statusText = statusText;
          this.xhrDetail.response = response || '';
          this.xhrDetail.responseTime = getTimestamp();

          // execute all registered callback functions
          context.walk(this.xhrDetail);
        });
      }

      open(
        method: string,
        url: string,
        async: boolean = true,
        username?: string,
        password?: string
      ) {
        // collect data
        this.xhrDetail.method = method;
        this.xhrDetail.url = url;

        // call the native function
        this.xhr.open(method, url, async, username, password);
      }

      setRequestHeader(header: string, value: string) {
        set(this.xhrDetail.headers, header, value);

        this.xhr.setRequestHeader(header, value);
      }

      send(body: Document | XMLHttpRequestBodyInit | null | undefined) {
        this.xhrDetail.body = body || '';
        this.xhrDetail.requestTime = getTimestamp();

        this.xhr.send(body);
      }

      set onreadystatechange(handler: (e: Event) => void) {
        this.xhr.onreadystatechange = handler;
      }
    }

    // bypass the type checking with reflect...
    set(window, 'XMLHttpRequest', ProxiedXhr);
  }
};

/**
 * @description rewrite the global function 'fetch' to proxy the fetch request
 */
const proxyFetch = (context: ProxyHttpContext) => {
  if (!has(window, 'fetch')) {
    console.error('there has no Fetch...');
    return;
  }

  const fetchDetail: HttpDetail = {
    method: '',
    url: '',
    headers: {},
    body: '',
    status: 0,
    statusText: '',
    requestTime: 0,
    responseTime: 0,
    response: ''
  };

  if (!has(window, 'nativeFetch')) {
    const nativeFetch = window.fetch;

    // mount native fetch function for internal business
    has(window, 'nativeFetch') || set(window, 'nativeFetch', nativeFetch);

    const getProxyFetch = async (
      input: string | RequestInfo,
      init?: RequestInit
    ): Promise<Response> => {
      // process different types of request headers in object formated
      const getHeaders = (headerInit: Headers | string[][] | Record<string, string>) => {
        const headers = {};

        if (headerInit instanceof Headers) {
          headerInit.forEach((value, header) => {
            set(headers, header, value);
          });
        } else if (Array.isArray(headerInit)) {
          headerInit.forEach((item: Array<string>) => {
            set(headers, item[0], item[1]);
          });
        }

        return headers;
      };

      fetchDetail.method = init?.method || '';
      fetchDetail.url = typeof input === 'string' ? input : input.url;
      fetchDetail.headers = init?.headers ? getHeaders(init!.headers) : {};
      fetchDetail.body = init?.body || '';
      fetchDetail.requestTime = getTimestamp();

      // convert the returned value to Promsie with async-await
      return (
        nativeFetch
          .call(window, input, init)
          // fetch will only reject at panic
          // so just handle the resolved data
          .then(async resposne => {
            fetchDetail.status = resposne.status;
            fetchDetail.statusText = resposne.statusText;
            fetchDetail.responseTime = getTimestamp();
            fetchDetail.response = resposne;

            context.walk(fetchDetail);

            return resposne;
          })
      );
    };

    // bypass the type checking with reflecting...
    set(window, 'fetch', getProxyFetch);
  }
};

export const proxyHttp = (proxyCallback: ProxyCallback<HttpDetail>) => {
  const context = ProxyHttpContext.getInstance();
  context.add(proxyCallback);

  proxyXhr(context);
  proxyFetch(context);
};
