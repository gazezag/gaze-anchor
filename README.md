# gaze-anchor

[中文文档传送门](https://github.com/gazezag/gaze-anchor/blob/master/README-zh.md)

A SDK for front-end performance monitoring



## Feature

- Plugin architecture
- Error isolation
- Collection of common performance data
  - Page performance
  - Platform information
  - Navigation performance
  - Resource flow
  - Error catching
  - User's actions collecting

- Data reporting strategy to avoid data loss as much as possible



## Todo

### bug

1. upload with beaconAPI (MDN sucks)

### feature

1. connection verification (token?)

### refactor

1. refactor with monorepo
2. release script



## Usage

### install
```sh
# npm
npm install gaze-anchor -S

# yarn
yarn add gaze-anchor -S

# pnpm
pnpm add gaze-anchor -S
```

### init

```typescript
// main.ts
import { createGaze } from 'gaze-anchor/core';
import { 
  performanceIndexPlugin, 
  userBehaviorObserverPlugin, 
  errorCatcherPlugin 
} from 'gaze-anchor/plugins'

const gaze = createGaze({
	target: 'http://localhost:8080/'  
});

// install plugins
gaze
  .use(performanceIndexPlugin())
  .use(userBehaviorObserverPlugin())
	.use(errorCatcherPlugin({
  	stackLimit: 10
	 }));
```



## Implement

![sdk](https://user-images.githubusercontent.com/76992456/192145388-01e481b3-d969-4897-a880-6a8eaef7c212.jpg)



### Core

The function of the core module is extremely simple

+ Basic uploader
+ Basic error handler
+ Mounting plugins

```typescript
// type interface of plugins
interface Plugin {
  install: (uploader: Uploader, errorHandler: ErrorHandler) => void;
}
```

```typescript
// core module
class Gaze {
  private plugins: Set<Plugin>;
  private uploader: Uploader;
  private errorHandler: ErrorHandler;

  constructor(config?: Record<string, any>) {
    const { target } = mergeConfig(config);
    this.plugins = new Set<Plugin>();
    this.uploader = createUploader(target);
    this.errorHandler = errorHandler;
  }

  // mount plugin asynchronously
  use(plugin: Plugin): this {
    // execute asynchronously to avoid blocking the main process
    nextTick(() => {
      if (!this.plugins.has(plugin)) {
        this.plugins.add(plugin);
        plugin.install(this.uploader, this.errorHandler);
      }
    }, this.errorHandler);

    return this;
  }
}

const nextTick = (fn: Function, errorHandler: ErrorHandler) => {
  const timer = setTimeout(() => {
    try {
      fn();
    } catch (e: any) {
      errorHandler(e);
    } finally {
      clearTimeout(timer);
    }
  });
};
```

Therefore, gaze will treat any object with method "install" as a plugin, It's probably like this

```typescript
const customPlugin: PluginDefineFunction<SomeConfig> = (
  options: SomeConfig
): Plugin => {
  const { someData } = options;

  return {
    install(upload, errorHandler) {
      initSomething(someData, upload, errorHandler);
      initOther(someData, upload, errorHandler);
    }
  };
};
```



#### Reporter

Three report methods are set here to solve CORS problems

##### createUploader

```typescript
// packages/core/upload.ts
export const createUploader =
  (baseUrl: string): Uploader =>
  (path: string, data: any) => {
    const base = join(baseUrl, path);
    const url = join(base, 'empty.gif');

    const len = `${url}${url.indexOf('?') < 0 ? '?' : '&'}${encodeURIComponent(
      JSON.stringify(data)
    )}`.length;

    has(data, 'time') || set(data, 'time', getNow());

    // 2083 compatible with ie browser
    // chrome 8182
    // safari 80000
    // firefox 65536
    // opera 190000
    if (len < 2083) {
      imgRequest(url, data);
		} else if (isBeaconSupported()) {
      beaconRequest(join(base, 'add'), data);
    } else {
      ajaxRequest(join(base, 'add'), data);
    }
  };
```

##### ImageRequest

```typescript
const imgRequest = (url: string, data: any) => {
  if (!url || !data) return;
	const img = new Image();

  img.onerror = () => {
    ajaxRequest(url, data);
  };

  img.src = `${url}${url.indexOf('?') < 0 ? '?' : '&'}${encodeURIComponent(JSON.stringify(data))}`;
};
```

##### Beacon API

```typescript
const beaconRequest = (url: string, data: any) => {
  if (!url || !data) return;

  navigator.sendBeacon(
    url,
    new Blob([JSON.stringify(data)], {
      type: 'application/x-www-form-urlencoded'
    })
  );
};
```

##### Ajax

```typescript
const ajaxRequest = (url: string, data: any) => {
  if (!url || !data) return;

  // send ajax request with native XMLHttpRequest
  const xhr = get(window, has(window, 'nativeXhr') ? 'nativeXhr' : 'XMLHttpRequest');

  const client = new xhr();
  client.open('POST', url, true);
  client.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
  client.send(JSON.stringify(data));
};
```





### Web Performance

Used to collect performance data

```typescript
// packages/plugins/webPerformance/index.ts
export const performanceIndexPlugin: PluginDefineFunction<null> = () => {
  return {
    install(uploader, errorHandler) {
      initDeviceInfo(uploader, errorHandler);

      initCLS(uploader, errorHandler);
      initLCP(uploader, errorHandler);

      // monitor FP and FCP while page had shown
      onPageShow(() => {
        initFP(uploader, errorHandler);
        initFCP(uploader, errorHandler);
      });

      afterLoad(() => {
        initNavigationTiming(uploader, errorHandler);
        initResourceFlowTiming(uploader, errorHandler);
        initFID(uploader, errorHandler);
      });
    }
  };
};
```

Take getting the FP(First Paint) as an example

```typescript
// packages/plugins/webPerformance/performacneIndex/getFP.ts
const getFP = (): Promise<PerformanceEntry> =>
  new Promise((resolve, reject) => {
    if (!isPerformanceObserverSupported()) {
      if (!isPerformanceSupported()) {
        reject(new Error('browser do not support performance api'));
      } else {
        const [entry] = window.performance.getEntriesByName(EntryNames.FP);
        entry && resolve(entry);
        reject(new Error('browser has no fp'));
      }
    } else {
      const callback: ObserveHandler = entry => {
        if (entry.name === EntryNames.FP) {
          // if the observer already exists
          // prevent performance watchers from continuing to observe
          observer && disconnect(observer);
          resolve(entry);
        }
      };
      const observer = observe(EntryTypes.paint, callback);
    }
  });

export const initFP = (upload: Uploader, errorHandler: ErrorHandler) => {
  getFP()
    .then(entry => {
      const { FP } = PerformanceInfoType;
      const indexValue: PerformanceInfo = {
        type: FP,
        time: getNow(),
        value: roundOff(entry.startTime)
      };
      upload(performanceTimingTarget, indexValue);
    })
    .catch(errorHandler);
};
```



### User Behavior

Used to collect user behavior data

```typescript
// packages/plugins/userBehavior/index.ts
export const userBehaviorObserverPlugin: PluginDefineFunction<null> = () => {
  return {
    install(uploader) {
      initPV(uploader);
      initRouterProxy(uploader);
      initHttpProxy(uploader);
      initOperationListener(uploader);
    }
  };
};
```



#### proxyRouter

Call the proxy method exposed by the core module to implement

```typescript
// packages/core/proxyRouter.ts
export const proxyRouterLink = (
  types: Array<EventType>, 
  handler: EventHandler
): void => {
  // rewrite the native event handlers
  const rewriteHistory = (historyType: EventType) => {
    const native: Function = get(history, historyType);

    return function (this: History) {
      const res = native.apply(this, arguments);
      dispatchEvent(new Event(historyType));
      return res;
    };
  };

  // mount new events on the window.history
  types.forEach(type => {
    set(history, type, rewriteHistory(type));
  });

  // monitor all events and handled them uniformly
  createlistener(types)(handler);
};

// called when click the forward and backward buttons
export const proxyForwardAndBackward = (
  types: Array<EventType>, 
  handler: EventHandler
): void => {
  createlistener(types)(handler);
};
```

```typescript
// packages/core/userBehavior/behaviorIndex/proxyRouter.ts
export const initRouterProxy = (upload: Uploader) => {
  const { routerChange } = BehaviorType;

  const handler = (e: Event) => {
    const { hash, pathname, href } = (e.target as Window).location;

    const detail: RouterChangeDetail = {
      method: hash ? 'Hash' : 'History',
      href
    };
    hash ? set(detail, 'hash', hash) : set(detail, 'pathname', pathname);
    const userBehavior: UserBehavior = {
      time: getNow(),
      value: {
        type: routerChange,
        page: href,
        time: getNow(),
        detail
      }
    };

    upload(userBehaviorTarget, userBehavior);
  };

  // called when routing is switched
  proxyRouterLink([EventType.pushState], handler);
  // called when click the forward and backward buttons
  proxyForwardAndBackward([EventType.popState], handler);
};
```



#### proxyHttp

Similar to the above, call the proxy method exposed by the core module

+ XMLHttpRequest: Replace native objects with custom proxy class
+ Fetch: Rewrite the native function directly

```typescript
// packages/core/proxyHttp.ts

// encapsulate a context object to manage the callbacks
// using the publishing subscription mode
class ProxyHttpContext {
  // singleton mode
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

  // register callback
  add(callback: ProxyCallback<HttpDetail>) {
    this.callbacks.has(callback) || this.callbacks.add(callback);
  }
	
  // execute all registered callbacks
  walk(httpDetail: HttpDetail) {
    this.callbacks.forEach(f => f(httpDetail));
  }
}
```

```typescript
// packages/core/proxyHttp.ts
const proxyXhr = (context: ProxyHttpContext) => {
  if (!has(window, 'XMLHttpRequest')) {
    errorHandler(new Error('there has no XMLHttpRequest...'));
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
```

```typescript
// packages/core/proxyHttp.ts
const proxyFetch = (context: ProxyHttpContext) => {
  if (!has(window, 'fetch')) {
    errorHandler(new Error('there has no Fetch...'));
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
      const getHeaders = (
        headerInit: Headers | string[][] | Record<string, string>
      ) => {
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
```

```typescript
export const proxyHttp = (proxyCallback: ProxyCallback<HttpDetail>) => {
  const context = ProxyHttpContext.getInstance();
  context.add(proxyCallback);

  proxyXhr(context);
  proxyFetch(context);
};
```

Thanks to the complex encapsulation above, it is now very simple to proxy the `XMLHttpRequest` and `Fetch` at the same time

```typescript
export const initHttpProxy = (upload: Uploader) => {
  const handler: ProxyCallback<HttpDetail> = httpDetail => {
    const { request } = BehaviorType;
    
    const userBehavior: UserBehavior = {
      time: getNow(),
      value: {
        type: request,
        page: window.location.pathname,
        time: getNow(),
        detail: httpDetail
      }
    };
    upload(userBehaviorTarget, userBehavior);
  };

  proxyHttp(handler);
};
```



#### User Actions

Just listener the corresponding events directly.

However, a special treatment is used here in order to reduce the frequency of reports.

The final effect is that it will be merged and will not be reported if the same event is triggered  on the same target continuously.

And when any of the above conditions are broken, the data will be reported immediately.

##### init

```typescript
// packages/plugins/userBehavior/behaviorIndex/getOperationInfo.ts
export const initOperationListener = (upload: Uploader) => {
  const prevEvent = {
    type: '',
    e: null,
    target: null,
    track: null,
    detail: null
  } as unknown as EventCache; // bypass type checking......

  // listen to click, keydown and dblClick events
  [click, keydown, dblClick].forEach(type => {
    createlistener(type)((e: MouseEvent | KeyboardEvent | any) => {
      if (type !== prevEvent.type) {
        // trigger
        if (prevEvent.e && prevEvent.type) {
          trigger(prevEvent.detail.value, store, upload, immediately);
        }

        // initialize the event cache while not trigger the same event continuously
        const target = e.target ? e.target : e.path ? e.path.pop() : null;
        const { track, detail } = createTracker(target, type);
        prevEvent.type = type;
        prevEvent.e = e;
        prevEvent.target = target;
        prevEvent.track = track;
        prevEvent.detail = detail;
      }

      // track
      prevEvent.track(e);
    });
  });

  // upload the last operation before the user exits the page
  beforeUnload(() => {
    trigger(prevEvent.detail.value, store, upload, immediately);
  });
};
```

##### track

```typescript
// packages/plugins/userBehavior/behaviorIndex/getOperationInfo.ts
const createTracker = (target: Element | null, type: EventType) => {
  const operationDetail: OperationDetail = {
    type,
    target,
    count: 0,
    id: target?.id || '',
    classList: target?.className ? target.className.split(' ') : [],
    tagName: target?.localName || '',
    innerText: ''
  };

  // cache the handler function
  const handleDetail =
    type === keydown
      ? (e: KeyboardEvent) => {
          // join a identification string while pressed a control key
          // and join the char while pressed the normal key
          operationDetail.innerText += e.key.length !== 1 ? ` [${e.key}] ` : e.key;
        }
      : (e: MouseEvent) => (operationDetail.innerText = (e.target as any).innerText);

  const track = (e: MouseEvent | KeyboardEvent | any) => {
    operationDetail.count++;
    handleDetail(e);
  };

  return {
    track,
    detail: {
      // lazy evaluation
      get value() {
        return operationDetail;
      }
    }
  };
};
```

##### trigger

```typescript
// packages/plugins/userBehavior/behaviorIndex/getOperationInfo.ts
const trigger = (detail: OperationDetail, upload: Uploader) => {
  const userBehavior: UserBehavior = {
    time: getNow(),
    value: {
      type: operation,
      page: '',
      time: getNow(),
      detail
    }
  };

  upload(userBehaviorTarget, userBehavior);
};
```



### Error Listener

```typescript
// packages/plugins/errorListener/index.ts
export const errorCatcherPlugin: PluginDefineFunction<Config> = options => {
  const { stackLimit } = options;
  const stackParser = getStackParser(stackLimit);
  const submitedErrorUids = new Set<uid>();

  return {
    install(uploader) {
      initJsError(options, stackParser, submitedErrorUids, uploader);
      initPromiseReject(options, stackParser, submitedErrorUids, uploader);
      initResourceError(options, submitedErrorUids, uploader);
      initHttpError(submitedErrorUids, uploader);
      initCorsError(options, submitedErrorUids, uploader);
    }
  };
};
```

Just listenen to the corresponding error events, like this

```typescript
// packages/plugins/errorListener/errorCatcher/catchJsError.ts
export const initJsError = (
  options: Config,
  stackParser: StackParser,
  submitedErrorUids: Set<uid>,
  uploader: Uploader
) => {
  const { logError } = options;

  const handler = (event: ErrorEvent) => {
    logError || event.preventDefault();

    if (getErrorKey(event) !== ErrorType.JS) return;

    const errorUid = getUid(`${ErrorType.JS}-${event.message}-${event.filename}`);
    const info: ErrorInfo = {
      type: ErrorType.JS,
      errorUid,
      time: getNow(),
      message: event.message,
      detail: {
        type: event.error?.name || 'Unknwon',
        stackTrace: stackParser(event.error)
      }
    };

    if (!submitedErrorUids.has(errorUid)) {
      uploader(erorrInfoTarget, info);
      submitedErrorUids.add(errorUid);
    }
  };

  createlistener(EventType.error)(handler as EventHandler);
};
```



