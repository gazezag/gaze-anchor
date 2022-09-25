原本用 vite, 重构为 rollup



# Why

vite 的杀手级特性感觉是 dev server, 这里用不到, 而且代码分割什么的很麻烦



# What

主要是要分包

+ 核心模块
+ 插件
+ 用来写自定义插件的 API



# 9.25

给3个不同的入口分别打包

```typescript
const coreEntry = 'packages/core/index.ts';
const publicAPIEntry = 'packages/publicAPI/index.ts';
const pluginsEntries = 'packages/plugins/index.ts';
```





打包完的代码结构没法看...

```tex
|--dist
	  |--core
	  	  |--core
	  	  		|--...
	  	  		|--index.js
	  	  |--node_modules
	  	  |--utils
	  |--plugins
        |--core
	  	  		|--...
	  	  		|--index.js
	  	  |--node_modules
	  	  |--plugins
	  	  		|--...
	  	  		|--index.js
	  	  |--utils
	  |--publicAPI
	  |--types
```

大量重复模块,很呆



而且发包之后发现就算配置了 exports 字段也没法正常找到类型信息