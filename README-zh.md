# gaze-anchor

一个前端性能监控 SDK


## Feature

支持采集以下信息

- 页面性能数据
- 平台信息(操作系统、浏览器等)
- 导航性能数据
- 资源加载流
- 错误信息
- 用户操作信息


## Todo

### bug

1. Beacon API 上报数据


### feature

1. Store 的上报
2. 连接验证


### refactor

1. 拆分模块为不同的包并单独打包发布
2. 发布脚本
3. 把导出的类型合并到一个文件? (index.d.ts?)


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
import { Gaze } from 'gaze-anchor';

Gaze.init({});
```


## Implement

### Web Performance

用来采集页面性能数据

> 以下以获取 FP(First-Paint) 为例
> 
> packages/core/webPerformance/performacneIndex/getFP.ts

```typescript
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
          // 若此时已经存在 observer 则停止观察
          observer && disconnect(observer);
          resolve(entry);
        }
      };

      const observer = observe(EntryTypes.paint, callback);
    }
  });

export const initFP = (
  store: Store<PerformanceInfoType, PerformanceInfo>,
  upload: Uploader,
  immediately: boolean
) => {
  getFP()
    .then(entry => {
      const { FP } = PerformanceInfoType;
      const indexValue = {
        type: FP,
        time: getNow(),
        value: roundOff(entry.startTime)
      };

      store.set(FP, indexValue);
      immediately && upload(performanceTimingTarget, indexValue);
    })
    .catch(console.error);
};
```


### User Behavior

用来采集用户在页面中的各种行为数据

#### proxyRouter

> packages/core/userBehavior/behaviorIndex/proxyRouter.ts

```typescript
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

  // 把派发的事件挂载到 window.history 上
  types.forEach(type => {
    set(history, type, rewriteHistory(type));
  });

  // 分别监听所有的事件
  createlistener(types)(handler);
};

export const proxyForwardAndBackward = (
  types: Array<EventType>, 
  handler: EventHandler
): void => {
  createlistener(types)(handler);
};

export const initRouterProxy = (
  store: Store<BehaviorType, UserBehavior>,
  upload: Uploader,
  immediately: boolean
) => {
  const { routerChange } = BehaviorType;

  const handler = (e: Event) => {
    const { hash, pathname, href } = (e.target as Window).location;

    const detail: RouterChangeDetail = {
      method: hash ? 'Hash' : 'History',
      href
    };
    hash ? set(detail, 'hash', hash) : set(detail, 'pathname', pathname);

    const behaviorItem: BehaviorItem = {
      type: routerChange,
      page: href,
      time: getNow(),
      detail
    };

    if (store.has(routerChange)) {
      store.get(routerChange)!.value.push(behaviorItem);
    } else {
      store.set(routerChange, {
        time: Date.now(),
        value: [behaviorItem]
      });
    }

    // 此时可以断言 store 中必定存在 'router-change'
    immediately && upload(userBehaviorTarget, store.get(routerChange)!);
  };

  // 在路由切换时触发
  proxyRouterLink([EventType.pushState], handler);
  // 用户点击前进/后退按钮时触发
  proxyForwardAndBackward([EventType.popState], handler);
};

```


#### proxyHttp

与上面的 `proxyRouter` 类似, 重写了 `XMLHttpRequest` 上面的 `open`, `setRequestHeader`, `send` 方法

> packages/core/userBehavior/behaviorIndex/proxyHttp.ts
> 
> 此处把原生的 `XMLHttpRequest` 对象命名为 `nativeXhr` 挂载到 `window` 供 SDK 内部逻辑使用
> 
> ```typescript
> const nativeXhr = window.XMLHttpRequest;
> has(window, 'nativeXhr') || set(window, 'nativeXhr', nativeXhr);
> ```
>
> `fetch` 也是一样的处理
>
> ```typescript
> const nativeFetch = window.fetch;
> has(window, 'nativeFetch') || set(window, 'nativeFetch', nativeFetch);
> ```


#### User Actions

只需要直接监听对应的事件, 如 `click`、`keydown` 等

不过此处为了降低上报频率, 进行了专门的处理

最终效果是, 若在同一个目标上连续触发相同的事件, 则会对数据进行合并, 直到破坏任意条件, 即触发不同的事件或在不同的目标上触发, 此时会进行上报

> packages/core/userBehavior/behaviorIndex/getOperationInfo.ts

##### init

```typescript
export const initOperationListener = (
  store: Store<BehaviorType, UserBehavior>,
  upload: Uploader,
  immediately: boolean
) => {
  const prevEvent = {
    type: '',
    e: null,
    target: null,
    track: null,
    detail: null
  } as unknown as EventCache; // bypass type checking......

  // 监听 click, keydown, dbclick 事件
  [click, keydown, dblClick].forEach(type => {
    createlistener(type)((e: MouseEvent | KeyboardEvent | any) => {
      // 若当前触发的事件与上一次触发的事件不同
      if (type !== prevEvent.type) {
        // 若 prevEvent 已被初始化, 则会进行上报
        if (prevEvent.e && prevEvent.type) {
          trigger(prevEvent.detail.value, store, upload, immediately);
        }

        // 若 prevEvent 未被初始化, 则不上报, 只进行初始化
        const target = e.target ? e.target : e.path ? e.path.pop() : null;
        const { track, detail } = createTracker(target, type);
        prevEvent.type = type;
        prevEvent.e = e;
        prevEvent.target = target;
        prevEvent.track = track;
        prevEvent.detail = detail;
      }

      // 收集数据
      prevEvent.track(e);
    });
  });

  // 用户卸载页面时, 上报最后一次残留在 prevEvent 的数据...
  beforeUnload(() => {
    trigger(prevEvent.detail.value, store, upload, immediately);
  });
};
```


##### track

```typescript
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

  // 缓存处理函数
  const handleDetail =
    type === keydown
      ? (e: KeyboardEvent) => {
          // 若是功能键则专门标注一下
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
const trigger = (
  detail: OperationDetail,
  store: Store<BehaviorType, UserBehavior>,
  upload: Uploader,
  immediately: boolean
) => {
  const behaviorItem: BehaviorItem = {
    type: operation,
    page: '',
    time: getNow(),
    detail
  };

  if (store.has(operation)) {
    store.get(operation)!.value.push(behaviorItem);
  } else {
    store.set(operation, { time: getNow(), value: [behaviorItem] });
  }

  immediately &&
    upload(userBehaviorTarget, {
      time: getNow(),
      value: [behaviorItem]
    });
};
```


### Error Listener

只需要监听对应的错误事件就可以了

> packages/core/errListener/index.ts

```typescript
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
```


### Reporter

使用 ImageRequest、Beacon、Ajax 三种方式进行上报, 主要是为了解决以下问题

1. 请求跨域
2. 由于用户强制卸载页面导致数据丢失

#### createUploader

```typescript
export const createUploader =
  (baseUrl: string): Uploader =>
  (path: string, data: any) => {
    const base = join(baseUrl, path);
    let url = join(base, 'empty.gif');

    const len = `${url}${url.indexOf('?') < 0 ? '?' : '&'}${encodeURIComponent(
      JSON.stringify(data)
    )}`.length;

    // 2083 兼容 IE.....
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


#### ImageRequest

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


#### Beacon API

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


#### Ajax

```typescript
const ajaxRequest = (url: string, data: any) => {
  if (!url || !data) return;

  // 使用原生的 nativeXhr 发送, 避免数据污染
  const xhr = get(window, has(window, 'nativeXhr') ? 'nativeXhr' : 'XMLHttpRequest');

  const client = new xhr();
  client.open('POST', url, true);
  client.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
  client.send(JSON.stringify(data));
};
```
