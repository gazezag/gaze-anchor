中间件, 设置在每个插件的数据流上, 可以做一些奇怪的操作

```typescript
const m1 = (data, next) => {
  // process data...
  next();
}

const m2 = (data, next) => {
  // process data...
  next();
}

const plugin = {
  middleware: [ m1, m2 ],
	install() {
    // ...
  }
}
```



为什么不用 hooks ??



其实 hooks 应该是期望没有返回值的纯函数, 只执行一些行为

middleware 才应该真正装载在数据流上, 可以进行拦截操作....





# How

如果要实现

就需要把中间件设置在 upload 之前执行, 让即将进入 upload 的数据流入中间件, 然后由中间件来进行拓展操作

暂时想到的只有一个拦截, 其他还有什么用??

可能如果要做削峰限流的话, 可以用中间件来支持

搞个内置中间件, 和 mq 交互, 如果 mq 长度太长, 就拦截掉....



所以到底为什么不用 hooks