# gaze-anchor

一个前端性能监控平台的数据采集 SDK



## Feature

- 插件化
  - 内置插件
  - 自定义插件
    - 好用的工具方法
    - 好用的生命周期钩子

- 错误隔离
- 常见数据的采集
  - 页面性能信息
  - 平台信息
  - 浏览器导航数据
  - 资源加载流
  - 页面错误捕获
  - 用户操作信息

- 最大程度避免丢失数据的错误上报策略



## Todo

### bug

1. Beacon API

### feature

1. 连接验证 (token?)

### refactor

1. 发布脚本



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

// 安装插件
gaze
  .use(performanceIndexPlugin())
  .use(userBehaviorObserverPlugin())
  .use(errorCatcherPlugin({ stackLimit: 10 }));
```



## Implement

![sdk](https://user-images.githubusercontent.com/76992456/192314191-6186af66-e0fe-4bb4-b062-88f2daf01cf1.jpg)



### Core

核心模块只包含最基础的功能

+ 基础的上报器
+ 基础的错误处理器
+ 挂载插件

```typescript
// 插件的类型接口
interface Plugin {
  install: (uploader: Uploader, errorHandler: ErrorHandler, hooks: Hooks) => void;

  // 生命周期钩子
  [LifeCycleHookTypes.BEFORE_INSTALL]?: HookCallback<PluginConfig>;
  [LifeCycleHookTypes.INSTALLED]?: HookCallback;
  [LifeCycleHookTypes.BEFOR_UPLOAD]?: HookCallback;
  [LifeCycleHookTypes.UPLOADED]?: HookCallback;
}
```

```typescript
// 核心模块
class Gaze {
  static instance: Gaze;
  private target: string;
  private plugins: Set<Plugin>;
  private errorHandler: ErrorHandler;

  private constructor(config?: Record<string, any>) {
    const { target } = mergeConfig(config);
    this.target = target;
    this.plugins = new Set<Plugin>();
    this.errorHandler = errorHandler;
  }

  // 单例模式
  static getInstance(config?: Record<string, any>) {
    if (!this.instance) {
      this.instance = new Gaze(config);
    }
    return this.instance;
  }

  use(plugin: Plugin): this {
    // 异步执行避免阻塞主线程
    nextTick(() => {
      if (!this.plugins.has(plugin)) {
        this.plugins.add(plugin);
        // 这里会给每个插件注入生命周期
        // 实际上是在代理插件上的 install 方法
        // 然后给代理好的 install 传入生命周期钩子
        initLifeCycle(plugin, createUploader(this.target))(this.errorHandler);
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

因此, gaze 可以将任何实现了 "install" 方法的对象视为一个插件, 类似下面这样

```typescript
const customPlugin: PluginDefineFunction<SomeConfig> = (
  options: SomeConfig
): Plugin => {
  const { someData } = options;

  return {
    install(upload, errorHandler) {
      doSomething(someData, upload, errorHandler);
      doOther(someData, upload, errorHandler);
    }
  };
};
```



#### Life Cycle Hooks

基于 `AOP` 设计实现

每个插件会有自己的生命周期, 目前只暴露了以下钩子

+ beforeInstall
+ installed
+ beforeUpload
+ uploaded



##### Usage

钩子函数会作为最后一个参数传入 `install` 函数

因此声明接收后可以直接使用, 用法长这样

```typescript
const getPlugin = () => {
  return {
    install(uplaod, errorHandler, { onInstalled, onBeforeUpload, onUploaded }) {
      // ...
      
      onInstalled(() => {
        // 插件挂载好了
      })
      
      onBeforeUpload(() => {
        // 数据上报之前
      })
      
      onUploaded(() => {
        // 数据上报完成
      })
    }
  }
}
```

但是, `onBeforeInstall` 呢, 原来它在这里

```typescript
const getPlugin = () => {
  return {
    // 由于代码结构的原因
    // 这个钩子必须在这里定义
    beforeInstall() {
      // 插件挂载前
    },
    install() {
      // ...
    }
  }
}
```

当然也可以像 `onBeforeInstall` 一样使用其他的钩子

```typescript
const getPlugin = () => {
  return {
    beforeInstall() {},
    install() {},
    installed() {},
    beforeUpload() {},
    uploaded() {}
  }
}
```

此外, 所有的前置钩子都具有拦截操作的能力, 只需要返回 false 就可以拦截对应的操作

而且一些钩子函数可以接受参数来进行控制

```typescript
const getPlugin = () => {
  return {
    beforeInstall() {
      // 运行在 MacOS 时, 这个插件不会挂载
      if(isMacOS()) return false
    },
    install(upload, _, { onBeforeUpload }) {
      onBeforeUpload((path: string, data: any) => {
        // 上报地址是 'any-interface' 的话就不会上报数据
        if(path === 'any-interface') return false
        // 如果数据的哈希值已经存在, 则不上报
        if(hashSet.has(data.hash)) return false
      })
    }
  }
}
```



##### Injection & Trigger

生命周期的注入和触发大体上是使用`发布订阅模式`

下面这个函数会直接在插件实例上挂载生命周期钩子

```typescript
// packages/core/lifeCycle.ts
const injectHook = (
  type: LifeCycleHookTypes, 
  target: Plugin, 
  hookCallback: HookCallback
) => {
  if (!has(target, type)) {
    set(target, type, hookCallback);
  }
};
```

下面这个函数可以触发钩子

```typescript
// packages/core/lifeCycle.ts
const triggerHook = (
  type: LifeCycleHookTypes,
  target: Plugin,
  once: boolean = true,
  param: Array<any> = []
) => {
  if (has(target, type)) {
    const hook: HookCallback<any> = get(target, type);
    once && del(target, type);

    if (typeof hook === 'function') {
      return hook(...param);
    }
  }
};
```



##### Initialization

生命周期的整体初始化使用`代理模式`

目的:

+ 减少对原有代码结构的侵入性
+ 支持拦截操作
+ 方便后续维护

```typescript
// packages/core/lifeCycle.ts
const proxyInstall = (target: Plugin) => {
  return new Proxy(target.install, {
    apply(fn, thisArg, args: Parameters<typeof target.install>) {
      const isContinue = triggerHook(BEFORE_INSTALL, target);
      // 钩子返回 false 则不执行
      if (isContinue !== false) {
        const res = fn.apply(thisArg, args);
        triggerHook(INSTALLED, target);
        return res;
      }

      return;
    }
  });
};
const proxyUploader = (target: Plugin, uploader: Uploader) => {
  return new Proxy(uploader, {
    apply(fn, thisArg, args: Parameters<Uploader>) {
      const isContinue = triggerHook(BEFOR_UPLOAD, target, false, args);
      // 钩子返回 false 则不执行
      if (isContinue !== false) {
        const res = fn.apply(thisArg, args);
        triggerHook(UPLOADED, target, false);
        return res;
      }

      return;
    }
  });
};

export const initLifeCycle = (target: Plugin, uploader: Uploader) => {
  // 这里单独抽出一个函数, 由 Gaze 实例来注入全局的错误处理
  // 这样搞比较方便对错误进行统一管理
  return (errorHandler: ErrorHandler) => {
    // 代理 install 方法并调用
    proxyInstall(target)(
      // 获取代理过的 uploader
      proxyUploader(target, uploader),
      errorHandler,
      // 获取绑定好上下文的钩子函数
      getHooks(target)
    );
  };
};
```



#### Reporter

用三种不同的方式来解决跨域问题和数据丢失的问题

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

    // 2083 兼容一下 IE 意思一下
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

  // 使用原生的 XMLHttpRequest 
  const xhr = get(window, has(window, 'nativeXhr') ? 'nativeXhr' : 'XMLHttpRequest');

  const client = new xhr();
  client.open('POST', url, true);
  client.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
  client.send(JSON.stringify(data));
};
```





### Web Performance

用来采集性能数据

```typescript
// packages/plugins/webPerformance/index.ts
export const performanceIndexPlugin: PluginDefineFunction<null> = () => {
  return {
    install(uploader, errorHandler) {
      initDeviceInfo(uploader, errorHandler);

      initCLS(uploader, errorHandler);
      initLCP(uploader, errorHandler);

      // 在页面正在展示时采集 FP 和 FCP
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

以下以 FP(First Paint) 的采集为例

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
          // 如果 observer 已经存在则阻止它继续监听
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

用来采集用户行为数据

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

调用核心模块暴露出的代理方法来实现这个功能

```typescript
// packages/core/proxyRouter.ts
export const proxyRouterLink = (
  types: Array<EventType>, 
  handler: EventHandler
): void => {
  // 重写原生的事件处理程序
  const rewriteHistory = (historyType: EventType) => {
    const native: Function = get(history, historyType);

    return function (this: History) {
      const res = native.apply(this, arguments);
      // 事件派发
      dispatchEvent(new Event(historyType));
      return res;
    };
  };

  // 挂载新的事件处理程序
  types.forEach(type => {
    set(history, type, rewriteHistory(type));
  });

  // 单独监听所有的事件
  createlistener(types)(handler);
};

// 当点击前进或后退按钮时触发
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

  proxyRouterLink([EventType.pushState], handler);
  proxyForwardAndBackward([EventType.popState], handler);
};
```



#### proxyHttp

和上面类似, 直接调用核心模块暴露出的代理方法

+ XMLHttpRequest: 使用自定义的代理对象替换原生对象
+ Fetch: 直接重写原生方法

```typescript
// packages/core/proxyHttp.ts

// 这里用发布订阅模式封装了一个上下文对象来管理所有已经注册了的事件处理函数
class ProxyHttpContext {
  // 单例模式
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

  // 注册
  add(callback: ProxyCallback<HttpDetail>) {
    this.callbacks.has(callback) || this.callbacks.add(callback);
  }
	
  // 执行所有已经注册的回调函数,即发布
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

    // 挂载原生的 XMLHttpRequest 用于内部逻辑
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

          // 执行所有回调函数
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
        // 收集数据
        this.xhrDetail.method = method;
        this.xhrDetail.url = url;
        // 调用原生方法
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

    // 用反射绕开类型检查...
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

    // 挂载原生 fetch 用于内部逻辑
    has(window, 'nativeFetch') || set(window, 'nativeFetch', nativeFetch);

    const getProxyFetch = async (
      input: string | RequestInfo,
      init?: RequestInit
    ): Promise<Response> => {
      // 处理不同格式的 headers 对象
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

      // 使用 async 将返回值转为 promise
      return (
        nativeFetch
          .call(window, input, init)
	  // fetch 只会在发生内部错误时 reject
	  // 因此只处理 resolve 出来的数据
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

    // 用反射绕开类型检查...
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

感谢上面复杂的封装, 现在需要代理 `XMLHttpRequest` 和 `Fetch` 就很简单了

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

只需要直接监听对应的事件, 但是这里的实现为了降低数据上报的频率特殊处理了一下

最终实现的效果是在同一个对象上连续触发相同的事件时不会进行上报, 直到破坏了任一条件才会马上进行数据上报

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
  } as unknown as EventCache; // 绕开类型检查......

  // 监听 click input dbclick 事件
  [click, keydown, dblClick].forEach(type => {
    createlistener(type)((e: MouseEvent | KeyboardEvent | any) => {
      if (type !== prevEvent.type) {
        // trigger
        if (prevEvent.e && prevEvent.type) {
          trigger(prevEvent.detail.value, store, upload, immediately);
        }

        // 在触发不同事件时重新初始化 cache
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

  // 在用户关闭页面前上报残留在 cache 中的数据
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

  // 缓存事件处理函数
  const handleDetail =
    type === keydown
      ? (e: KeyboardEvent) => {
          // 根据不同的按键类型进行不同的拼接策略
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
      // 惰性求值
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

只需要监听对应的错误事件就行了, 如下

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



