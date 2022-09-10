# gaze-anchor

[中文文档传送门](https://github.com/gazezag/gaze-anchor/blob/master/README-zh.md)

A SDK for front-end performance monitoring

## Feature

- Page performance
- Platform information
- Navigation performance
- Resource flow
- Error catching
- User's actions collecting

## Todo

### bug

1. upload with beaconAPI (MDN sucks)

### feature

1. uploading function of the store
2. connection verification (token?)

### refactor

1. divide the core modules into different packages and released them separately
2. release script
3. merge the exported types into one file? (index.d.ts?)

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

![3231662826232_.pic](/Users/EthanTeng/Library/Containers/com.tencent.xinWeChat/Data/Library/Application Support/com.tencent.xinWeChat/2.0b4.0.9/5ab82589f0b30d323027b9c1daa55b59/Message/MessageTemp/4fde80e299ad1ab6717e977f8fb223b4/Image/3231662826232_.pic.jpg)

### Web Performance

> Take getting the FP(First Paint) as an example

```typescript
// packages/core/webPerformance/performacneIndex/getFP.ts
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

#### proxyRouter

```typescript
// packages/core/userBehavior/behaviorIndex/proxyRouter.ts
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

  // monitor all events and handle them uniformly
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

    // store can be asserted that must contains 'router-change' at this time
    immediately && upload(userBehaviorTarget, store.get(routerChange)!);
  };

  // called when routing is switched
  proxyRouterLink([EventType.pushState], handler);
  // called when click the forward and backward buttons
  proxyForwardAndBackward([EventType.popState], handler);
};

```

#### proxyHttp

Similar to the above, rewrite the methods named `open`, `setRequestHeader`, `send`in the `XMLHttpRequest`

> what's worth mentioning is that I mount the native `XMLHttpRequest` object on `window` for internal business
>
> ```typescript
> // packages/core/userBehavior/behaviorIndex/proxyHttp.ts
> const nativeXhr = window.XMLHttpRequest;
> // mount native XHR for internal business
> has(window, 'nativeXhr') || set(window, 'nativeXhr', nativeXhr);
> ```
>
> Of course the `fetch` will be the same
>
> ```typescript
> // packages/core/userBehavior/behaviorIndex/proxyHttp.ts
> const nativeFetch = window.fetch;
> // mount native fetch function for internal business
> has(window, 'nativeFetch') || set(window, 'nativeFetch', nativeFetch);
> ```

#### User Actions

Just listener the corresponding events directly.

However, a special treatment is used here in order to reduce the frequency of reports.

The final effect is that it will be merged and will not be reported if the same event is triggered  on the same target continuously.

And when any of the above conditions are broken, the data will be reported immediately.

##### init

```typescript
// packages/core/userBehavior/behaviorIndex/getOperationInfo.ts
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
// packages/core/userBehavior/behaviorIndex/getOperationInfo.ts
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
// packages/core/userBehavior/behaviorIndex/getOperationInfo.ts
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

Just listenen to the corresponding error events

```typescript
// packages/core/errListener/index.ts
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

Three report methods are set here to solve CORS problems

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

  // send ajax request with native XMLHttpRequest
  const xhr = get(window, has(window, 'nativeXhr') ? 'nativeXhr' : 'XMLHttpRequest');

  const client = new xhr();
  client.open('POST', url, true);
  client.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
  client.send(JSON.stringify(data));
};
```
