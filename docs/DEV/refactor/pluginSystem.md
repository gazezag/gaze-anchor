将现有架构重构为插件-微内核架构



# Why

1. 想加入采集用户停留时间的模块, 发现很麻烦, 又要改 Gaze 配置的接口, 又要改 Gaze 的 init 方法
2. 打包时 vite 默认不拆包, 每次都全量导出, 包体积太大, vite 本身配置代码分割有点麻烦(换rollup?)



# What

分两部分

+ 内核

  + 上传

  + 错误处理

  + 插件初始化: 搞个抽象类, 有 install 方法和 uploader 还有 errorHandler

  + 插件卸载?

+ 插件

  + 内置插件
    + 性能采集
    + 错误捕获
    + 用户操作捕获

  + 自定义插件
    + 暴露工具方法进行支持



# 9.23

新的项目结构

```tex
|--packages
			|--core
			|--plugins
			|--publicAPI
			|--types
			|--utils
			|--index.ts
```

拆包能不能拆成3个包?



# 9.24

用抽象类好麻烦, 直接搞个接口,能实现的就是插件

```typescript
interface Plugin {
  install: (uploader: Uploader, errorHandler: ErrorHandler) => void;
}
```

核心模块搞个 use 方法, 里面调用插件的 install

```typescript
class Gaze {
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
```

没想到什么优雅的办法阻塞任务, 用定时器包成宏任务

```typescript
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

