# Why

rollup 打包了之后, 模块之间的依赖太乱, 导致出来的包里面有大量重复代码, 用 monorepo 也许可以解决



# What

learn? ppm? turborepo?



turborepo

+ 并行构建
+ pipeline 工作流



分两个 workspace

```tex
|--public
		 |--core
		 |--plugins
		 |--utils
|--packages
		 |--shared-utils
		 |--shared-types
		 |--tsconfig
		 |--static
```

将顶级依赖抽出去分别打包



# 9.26

turborepo 官方推荐 tsup 作为打包构建工具, 用起来不错, 底层是 esbuild, 速度很快, 而且使用简单

```json
{
  "scripts": {
    "build": "tsup src/index.ts --format cjs --dts"
  }
}
```

打包出来会自动进行 bundle

```tex
|--dist
		|--index.js
		|--index.d.ts
```



突然发现打包的时候是每个仓库分别打包, 意味着

```tex
|--public
		 |--core
		 		  |--dist
		 |--plugins
		 		  |--dist
		 |--utils
		 		  |--dsit
|--packages
		 |--shared-utils
		 		  |--dist
		 |--shared-types
		 			|--dist
		 |--tsconfig
		 			|--dist
		 |--static
		 			|--dist
```

发布的时候出了问题

发布的包结构

```tex
@gaze-anchor
		|--core
				|--.turbo
				|--dist
					  |--index.d.ts
					  |--index.js
				|--src
					  |--types
					  |--errorHandler.ts
					  |--index.ts
					  |--upload.ts
				|--package.json
				|--tsconfig.json
		|--plugins
				|--...
		|--utils
				|--..
```

core 里面对 @gaze-anchor/shared-utils 的依赖没有构建, 这里面本来应该有一个 node_modules

而且为什么把 .turbo 都打包进来了.....

而且为什么把 src 也打包进来了....



发布脚本一定要写, 手动发布要死人

找时间去看一下 next 的源码, 看看他的 turborepo 怎么用的....
