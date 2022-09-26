实现生命周期 hook 供插件内部使用

+ beforeInstall
+ installed
+ beforeUpload
+ uploaded



# Why

加上了比较酷



# What

可以直接用发布订阅来做, 将 hooks 注册到每个 plguin 实例上就可以



# 9.26

生命周期注入

直接挂载到了 plugin 实例上

```typescript
const injectHook = (type: LifeCycleHookTypes, target: Plugin, hookCallback: HookCallback) => {
  if (!has(target, type)) {
    set(target, type, hookCallback);
  }
};

const createHook = (type: LifeCycleHookTypes, target: Plugin) => {
  return (hookCallback: HookCallback) => {
    injectHook(type, target, hookCallback);
  };
};
```

发布策略直接调 triggerHooks

```typescript
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

```typescript
class Gaze {
  use(plugin: Plugin): this {
    nextTick(() => {
      if (!this.plugins.has(plugin)) {
        this.plugins.add(plugin);
        triggerHook(BEFORE_INSTALL, plugin)
        plugin.install(
          createUploader(this.target), 
          this,errorHandler, 
          createHooks(plugin))
				triggerHook(BEFORE_INSTALL, plugin)
      }
    }, this.errorHandler);

    return this;
  }
}
```



订阅策略比较难搞

+ beforeInstall 如何订阅?
  + 没办法在 install 函数内部进行订阅, 因为没有模板解析能力, 不像 vue 那样
  + 意思是必须调用了 install 才会知道要订阅 beforeInstall
+ 如何将订阅函数绑定好各个插件的上下文?
  + 没想到好办法, 直接将绑定好上下文的 Hook 注入到 install 的参数中
  + 主要是因为所有的插件可以视为并发, 无法控制插件执行顺序, 也无法控制插件的数据流, 因此也就没法知道当前哪个插件正在执行, 只能一一对应绑定好上下文直接传进去

```typescript
export const ppp: PluginDefineFunction<null> = () => {
  return {
    beforeInstall() {
      console.log('before install...');
    },

    install(uploader, errorHandler, { onBeforeUpload, onInstalled, onUploaded }) {
      onBeforeUpload(() => {
        console.log('before upload..');
      });
      
      // ....
    }
  };
};

```

也还行



用代理重新做了一版, 蛮不错

代理 plugin 的 install 和 upload

也因此可以实现拦截功能

只要 hook 的回调返回 false 就视为拦截操作

顺势给 hook 的回调传入参数, 可以依次判断是否拦截

```typescript
const proxyInstall = (target: Plugin) => {
  return new Proxy(target.install, {
    apply(fn, thisArg, args: Parameters<typeof target.install>) {
      const isContinue = triggerHook(BEFORE_INSTALL, target);
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
  return (errorHandler: ErrorHandler) => {
    return proxyInstall(target)(
      proxyUploader(target, uploader), 
      errorHandler, 
      getHooks(target)
    );
  };
};
```

后置 hook 暂时没想到有什么用, 先留着, 也许可以进行一些奇怪的操作, 比如

+ 移除插件?? 暂时没想到有什么实现方式
+ 看 upload 返回值??



初始化这样写

单独传入 errorHandler 主要是为了集中管理错误, 用 gaze 上下文中挂载的全局 handler

```typescript
class Gaze {
  use(plugin: Plugin): this {
    // execute asynchronously to avoid blocking the main process
    nextTick(() => {
      if (!this.plugins.has(plugin)) {
        this.plugins.add(plugin);
        // initialize the life cycle
        // it will proxy the install function actually
        // and inject the life cycle hooks automatically
        initLifeCycle(plugin, createUploader(this.target))(this.errorHandler);
      }
    }, this.errorHandler);

    return this;
  }
}
```



感觉用代理实现, 侵入性小, 基于 AOP 思想进行集中管理, 代码依赖关系也比较明确, 之后要维护也相对轻松, 不需要到处找地方 triggerHook



