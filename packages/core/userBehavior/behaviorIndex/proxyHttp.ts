import { BehaviorType, Store } from 'core/common';
import { BehaviorInfoUploader } from 'types/uploader';
import { BehaviorItem, HttpDetail, UserBehavior } from 'types/userBehavior';
import { has, set } from 'utils/reflect';
import { getNow, getTimestamp } from 'utils/timestampHandler';

/**
 * @description rewrite the global object 'XMLHttpRequest' to proxy the ajax request
 */
const proxyXhr = (
  store: Store<BehaviorType, UserBehavior>,
  upload: BehaviorInfoUploader,
  immediately: boolean
) => {
  if (has(window, 'XMLHttpRequest')) {
    const nativeXhr = window.XMLHttpRequest;

    // mount native XHR for internal business
    has(window, 'nativeXhr') || set(window, 'nativeXhr', nativeXhr);

    // can not use arrow function because it should be used as a constructor
    const getProxyXhr = function (): XMLHttpRequest {
      const xhr = new nativeXhr();
      const { open, setRequestHeader, send } = xhr;

      const xhrDetail: HttpDetail = {
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

      xhr.open = (
        method: string,
        url: string,
        async: boolean = true,
        username?: string,
        password?: string
      ) => {
        // collecting data
        xhrDetail.method = method;
        xhrDetail.url = url;

        // call native function
        open.call(xhr, method, url, async, username, password);
      };

      xhr.setRequestHeader = (header: string, value: string) => {
        set(xhrDetail.headers, header, value);

        setRequestHeader.call(xhr, header, value);
      };

      xhr.send = (body: Document | XMLHttpRequestBodyInit | null | undefined) => {
        xhrDetail.body = body || '';
        xhrDetail.requestTime = getTimestamp();

        send.call(xhr, body);
      };

      // can also listene to the 'onreadystatechange' event
      xhr.addEventListener('loadend', () => {
        const { status, statusText, response } = xhr;
        const { request } = BehaviorType;

        xhrDetail.status = status;
        xhrDetail.statusText = statusText;
        xhrDetail.response = response || '';
        xhrDetail.responseTime = getTimestamp();

        const behaviorItem: BehaviorItem = {
          type: request,
          page: window.location.pathname,
          time: getNow(),
          detail: xhrDetail
        };

        // there is no need to report it immediately
        // just store it
        if (store.has(request)) {
          store.get(request)!.value.push(behaviorItem);
        } else {
          store.set(request, {
            time: getNow(),
            value: [behaviorItem]
          });
        }

        // store can be asserted that must contains 'request' at this time
        immediately && upload(store.get(request)!);
      });

      return xhr;
    };

    // bypass the type checking with reflect...
    set(window, 'XMLHttpRequest', getProxyXhr());
  }
};

/**
 * @description rewrite the global function 'fetch' to proxy the fetch request
 */
const proxyFetch = (
  store: Store<BehaviorType, UserBehavior>,
  upload: BehaviorInfoUploader,
  immediately: boolean
) => {
  if (has(window, 'fetch')) {
    const nativeFetch = window.fetch;

    // mount native fetch function for internal business
    has(window, 'nativeFetch') || set(window, 'nativeFetch', nativeFetch);

    const getProxyFetch = async (
      input: string | RequestInfo,
      init?: RequestInit
    ): Promise<Response> => {
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
            const { request } = BehaviorType;

            fetchDetail.status = resposne.status;
            fetchDetail.statusText = resposne.statusText;
            fetchDetail.responseTime = getTimestamp();
            fetchDetail.response = resposne;

            const behaviorItem: BehaviorItem = {
              type: request,
              page: window.location.pathname,
              time: getNow(),
              detail: fetchDetail
            };

            if (store.has(request)) {
              store.get(request)!.value.push(behaviorItem);
            } else {
              store.set(request, {
                time: getNow(),
                value: [behaviorItem]
              });
            }

            // store can be asserted that must contains 'request' at this time
            immediately && upload(store.get(request)!);

            return resposne;
          })
      );
    };

    // bypass the type checking with reflecting...
    set(window, 'fetch', getProxyFetch);
  }
};

export const initHttpProxy = (
  store: Store<BehaviorType, UserBehavior>,
  upload: BehaviorInfoUploader,
  immediately: boolean
) => {
  proxyXhr(store, upload, immediately);
  proxyFetch(store, upload, immediately);
};
