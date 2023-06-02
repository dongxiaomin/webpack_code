## Webpack5 高阶学习


资料:
https://yk2012.github.io/sgg_webpack5/senior/enhanceExperience.html#%E6%98%AF%E4%BB%80%E4%B9%88

视频:
https://www.bilibili.com/video/BV14T4y1z7sw/?p=34&spm_id_from=pageDriver&vd_source=14fedc3c63ed079cd9eb76b1b47d1f84


# 高级优化
我们会从以下角度来进行优化：

* 提升开发体验
* 提升打包构建速度
* 减少代码体积
* 优化代码运行性能

# 一 提升开发体验
**SourceMap**
## 为什么
开发时我们运行的代码是经过 webpack 编译后的, 所有 css 和 js 合并成了一个文件，并且多了其他代码。

此时如果代码运行出错那么提示代码错误位置我们是看不懂的。一旦将来开发代码文件很多，那么很难去发现错误出现在哪里。

所以我们需要更加准确的错误提示，来帮助我们更好的开发代码。

## 是什么
SourceMap（源代码映射）是一个用来生成源代码与构建后代码一一映射的文件的方案。

它会生成一个 xxx.map 文件，里面包含源代码和构建后代码每一行、每一列的映射关系。

当构建后代码出错了，会通过 xxx.map 文件，从构建后代码出错位置找到映射后源代码出错位置，从而让浏览器提示源代码文件出错位置，帮助我们更快的找到错误根源。

## 怎么用
开发模式：```cheap-module-source-map```
* 优点：打包编译速度快，只包含行映射
* 缺点：没有列映射
```
module.exports = {
    ...
    mode: "development",
    devtool: "cheap-module-source-map",
}
```

生产模式：```source-map```
* 优点：包含行/列映射
* 缺点：打包编译速度更慢
```
module.exports = {
    ...
    mode: "production",
    devtool: "source-map",
};
```


# 二 提升打包构建速度 

## 1. HotModuleReplacement

### 为什么
开发时我们修改了其中一个模块代码，Webpack 默认会将所有模块全部重新打包编译，速度很慢。

所以我们需要做到修改某个模块代码，就只有这个模块代码需要重新打包编译，其他模块不变，这样打包速度就能很快。

### 是什么
HotModuleReplacement（**HMR/热模块替换**）：在程序运行中，替换、添加或删除模块，而无需重新加载整个页面。

### 怎么用
只配置dev
1. 基本配置: 
```hot: true```, 值默认为true;

* style-loader: css 样式经过 style-loader 处理，已经具备 HMR 功能.
  例如修改css并保存:  ![HMR_Css.png](./public/img/HMR_Css.png)

```
module.exports = {
  ...
  devServer: {
    ...
    hot: true, // 开启HMR功能（只能用于开发环境，生产环境不需要）
  },
};
```

2. js配置
* js如果没有配置, 更新时页面会刷新, 所以需要增加如下配置
```src/main.js
// 判断是否支持HMR功能
if (module.hot) {
    module.hot.accept("./js/count.js")
}
```
上面这样写会很麻烦，所以实际开发我们会使用其他 loader 来解决。
例如：[vue-loader](https://github.com/vuejs/vue-loader), [react-hot-loader](https://github.com/gaearon/react-hot-loader)。


## 2. oneOf

### 为什么
打包时每个文件都会经过所有 loader 处理，虽然因为 test 正则原因实际没有处理上，但是都要过一遍。比较慢。

### 是什么
顾名思义就是只能匹配上一个 loader, 剩下的就不匹配了。

### 怎么用
配置dev, prod
```
module.exports = {
    ...
    module: {
        rules: [
            {
                oneOf: [
                    //loader
                    ...
                ]
            }
        ]
    }
    ...
}
```


## 3. Include/Exclude

### 为什么
开发时我们需要使用第三方的库或插件，所有文件都下载到 node_modules 中了。而这些文件是不需要编译可以直接使用的。

所以我们在对 js 文件处理时，要排除 node_modules 下面的文件。

### 是什么
* include
包含，只处理 xxx 文件

* exclude
排除，除了 xxx 文件以外其他文件都处理

### 怎么用
配置dev, prod

* 只针对 js (eslint, bable) 处理
* include 与 exclude 不能同时使用
```
{
    test: /\.js$/,
    // exclude: /node_modules/, // 排除node_modules代码不编译
    include: path.resolve(__dirname, "../src"), // 也可以用包含
    loader: "babel-loader",
},
```
```
new ESLintPlugin({
    // 检测哪些文件
    context: path.resolve(__dirname, "../src"),
    exclude: "node_modules", // 默认值
}),
```


## 4. Cache

### 为什么
每次打包时 js 文件都要经过 Eslint 检查 和 Babel 编译，速度比较慢。

我们可以**缓存之前的 Eslint 检查 和 Babel 编译结果**，这样第二次打包时速度就会更快了。


### 是什么
对 Eslint 检查 和 Babel 编译结果进行缓存。


### 怎么用
配置dev, prod
编译后, node_modules/.cache 可以看到cache文件

```
{
    test: /\.js$/,
    // exclude: /node_modules/, // 排除node_modules代码不编译
    include: path.resolve(__dirname, "../src"), // 也可以用包含
    loader: "babel-loader",
    options: {
        cacheDirectory: true, // 开启babel编译缓存
        cacheCompression: false, // 缓存文件不要压缩
    },
},
```
```
new ESLintWebpackPlugin({
    // 指定检查文件的根目录
    context: path.resolve(__dirname, "../src"),
    exclude: "node_modules", // 默认值
    cache: true, // 开启缓存
    cacheLocation: path.resolve(__dirname, "../node_modules/.cache/eslintcache"), // 缓存目录
}),
```


## 5. Thread

### 为什么
当项目越来越庞大时，打包速度越来越慢，甚至于需要一个下午才能打包出来代码。这个速度是比较慢的。

我们想要继续提升打包速度，其实就是要提升 js 的打包速度，因为其他文件都比较少。

而对 js 文件处理主要就是 eslint 、babel、Terser 三个工具，所以我们要提升它们的运行速度。

我们可以开启多进程同时处理 js 文件，这样速度就比之前的单进程打包更快了。

**Terser**: webpack 生产模式下, 内置有terser插件, 从而压缩js代码. 

不需要下载, 可以直接引入使用 ```const TerserWebpackPlugin = require('terser-webpack-plugin');```.


### 是什么
多进程打包：开启电脑的多个进程同时干一件事，速度更快。
即同时做eslint, 同时做babel, 同时做terser.
俗语: 一人做一件事, 优化为多人做一件事.

**需要注意：请仅在特别耗时的操作中使用，因为每个进程启动就有大约为 600ms 左右开销。**

### 怎么用
配置dev, prod
我们启动进程的数量就是我们 CPU 的核数。

1. 如何获取 CPU 的核数，因为每个电脑都不一样。
```
// nodejs核心模块，直接使用
const os = require("os");
// cpu核数
const threads = os.cpus().length;
```

2. 下载包
```
npm i thread-loader -D
```

3. 使用
babel:
```
{
    test: /\.js$/,
    // exclude: /node_modules/, // 排除node_modules代码不编译
    include: path.resolve(__dirname, "../src"), // 也可以用包含
    use: [
        {
            loader: "thread-loader", // 开启多进程
            options: {
                workers: threads, // 数量
            },
        },
        {
            loader: "babel-loader",
            options: {
                cacheDirectory: true, // 开启babel编译缓存
            },
        },
    ],
},
```

eslint:
```
new ESLintPlugin({
    // 检测哪些文件
    context: path.resolve(__dirname, "../src"),
    exclude: "node_modules", // 默认值
    cache: true,
    cacheLocation: path.resolve(__dirname, "../node_modules/.cache/eslintcache"),
    threads, // 开启多进程和设置进程数量
}),
```

terser:
``` 
const TerserWebpackPlugin = require('terser-webpack-plugin');
...
optimization: {
    minimize: true,
    minimizer: [
      // css压缩也可以写到optimization.minimizer里面，效果一样的
      new CssMinimizerPlugin(),
      // 当生产模式会默认开启TerserPlugin，但是我们需要进行其他配置，就要重新写了
      new TerserPlugin({
        parallel: threads // 开启多进程
      })
    ],
  },
```
我们目前打包的内容都很少，所以因为启动进程开销原因，使用多进程打包实际上会显著的让我们打包时间变得很长。



**提升 webpack 提升打包构建速度总结**
* 使用 HotModuleReplacement 让开发时只重新编译打包更新变化了的代码，不变的代码使用缓存，从而使更新速度更快。
* 使用 OneOf 让资源文件一旦被某个 loader 处理了，就不会继续遍历了，打包速度更快。
* 使用 Include/Exclude 排除或只检测某些文件，处理的文件更少，速度更快。
* 使用 Cache 对 eslint 和 babel 处理的结果进行缓存，让第二次打包速度更快。
* 使用 Thead 多进程处理 eslint 和 babel 任务，速度更快。（需要注意的是，进程启动通信都有开销的，要在比较多代码处理时使用才有效果）


# 三 减少代码体积

## 1. Tree Shaking

### 为什么
开发时我们定义了一些工具函数库，或者引用第三方工具函数库或组件库。

如果没有特殊处理的话我们打包时会引入整个库，但是实际上可能我们可能只用上极小部分的功能。

这样将整个库都打包进来，体积就太大了。

### 是什么
**Tree Shaking** 是一个术语，通常用于描述移除 JavaScript 中的没有使用上的代码。
例如: 写了方法, 但未引用, 不会被打包.

注意：它依赖 **ES Module**。

### 怎么用
Webpack 已经默认开启了这个功能，无需其他配置。


## 2. Babel

### 为什么
Babel 为编译的每个文件都插入了辅助代码，使代码体积过大！

Babel 对一些公共方法使用了非常小的辅助代码，比如 _extend。默认情况下会被添加到每一个需要它的文件中。

你可以将这些辅助代码作为一个独立模块，来避免重复引入。

### 是什么
`@babel/plugin-transform-runtime`: 禁用了 Babel 自动对每个文件的 runtime 注入

而是引入 `@babel/plugin-transform-runtime` 并且使所有辅助代码从这里引用。


### 怎么用
1. 下载包
```npm i @babel/plugin-transform-runtime -D```
2. 
```
{
    loader: 'babel-loader',
    options: {
        cacheDirectory: true, // 开启babel编译缓存
        cacheCompression: false, // 缓存文件不要压缩, 主要是省时
        plugins: ["@babel/plugin-transform-runtime"], // 减少代码体积
    },
}
```


## 3. Image Minimizer

### 为什么
开发如果项目中引用了较多图片，那么图片体积会比较大，将来请求速度比较慢。

我们可以对图片进行压缩，减少图片体积。

**注意：如果项目中图片都是在线链接，那么就不需要了。本地项目静态图片才需要进行压缩。**


### 是什么
`image-minimizer-webpack-plugin`: 用来压缩图片的插件



### 怎么用
1. 下载包
```npm i image-minimizer-webpack-plugin imagemin -D```
无损压缩: ```npm install imagemin-gifsicle imagemin-jpegtran imagemin-optipng imagemin-svgo -D```
有损压缩: ```npm install imagemin-gifsicle imagemin-jpegtran imagemin-optipng imagemin-svgo -D```

2. 
```
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");
...
// 压缩图片
new ImageMinimizerPlugin({
    minimizer: {
        implementation: ImageMinimizerPlugin.imageminGenerate,
        options: {
            plugins: [
                ["gifsicle", { interlaced: true }],
                ["jpegtran", { progressive: true }],
                ["optipng", { optimizationLevel: 5 }],
                [
                    "svgo",
                    {
                        plugins: [
                            "preset-default",
                            "prefixIds",
                            {
                                name: "sortAttrs",
                                params: {
                                    xmlnsOrder: "alphabetical",
                                },
                            },
                        ],
                    },
                ],
            ],
        },
    },
}),
```

### 问题
Q1: 安装npm install imagemin-gifsicle imagemin-jpegtran imagemin-optipng imagemin-svgo -D报错:
```
npm ERR! code 1
npm ERR! path /Users/dxm/webpack_code/node_modules/gifsicle
npm ERR! command failed
npm ERR! command sh -c node lib/install.js
npm ERR! compiling from source
npm ERR! connect ECONNREFUSED :::443
npm ERR! gifsicle pre-build test failed
npm ERR! Error: Command failed: /bin/sh -c autoreconf -ivf
npm ERR! /bin/sh: autoreconf: command not found
```

A1:
使用cnpm安装
```
sudo npm i -g cnpm
cnpm install imagemin-gifsicle imagemin-jpegtran imagemin-svgo -D
```

Q2: cnpm下载imagemin-optipng 依然失败 TODO
```
[npminstall:runscript:error] imagemin-optipng@8.0.0 › optipng-bin@^7.0.0 run postinstall node lib/install.js error: Error: Command failed with exit code 1: node lib/install.js
```

A2: 参考 https://www.bilibili.com/video/BV14T4y1z7sw/?p=41&spm_id_from=pageDriver&vd_source=14fedc3c63ed079cd9eb76b1b47d1f84



# 四 优化代码运行性能

## 1. Code Split

### 为什么
打包代码时会将所有 js 文件打包到一个文件中，体积太大了。我们如果只要渲染首页，就应该只加载首页的 js 文件，其他文件不应该加载。

所以我们需要将打包生成的文件进行代码分割，生成多个 js 文件，渲染哪个页面就只加载某个 js 文件，这样加载的资源就少，速度就更快。

### 是什么
代码分割（`Code Split`）主要做了两件事：

分割文件：将打包生成的文件进行分割，生成多个 js 文件。
按需加载：需要哪个文件就加载哪个文件。

### 怎么用
代码分割实现方式有不同的方式，为了更加方便体现它们之间的差异，我们会分别创建新的文件来演示

1. 多入口
配置了几个入口，至少输出几个 js 文件。

demo1: 
```
entry: {
    xxx: './src/main.js',
    app: './src/app.js',
},
output: {
    path: path.resolve(__dirname, './dist'),
    // [name]是webpack命名规则，使用chunk的name作为输出的文件名。
    // 什么是chunk？打包的资源就是chunk，输出出去叫bundle。
    // chunk的name是啥呢？ 比如： entry中xxx: "./src/xxx.js", name就是xxx。注意是前面的xxx，和文件名无关。
    // 为什么需要这样命名呢？如果还是之前写法main.js，那么打包生成两个js文件都会叫做main.js会发生覆盖。(实际上会直接报错的)
    filename: './js/[name].js',
    clean: true,
},
```

2. 提取重复代码
如果多入口文件中都引用了同一份代码，我们不希望这份代码被打包到两个文件中，导致代码重复，体积更大。

我们需要提取多入口的重复代码，只打包生成一个 js 文件，其他文件引用它就好。

一般情况下使用默认配置.

demo2: 
```
optimization: {
    // 代码分割配置
    splitChunks: {
        chunks: "all", // 对所有模块都进行分割
        // 以下是默认值
        // minSize: 20000, // 分割代码最小的大小
        // minRemainingSize: 0, // 类似于minSize，最后确保提取的文件大小不能为0
        // minChunks: 1, // 至少被引用的次数，满足条件才会代码分割
        // maxAsyncRequests: 30, // 按需加载时并行加载的文件的最大数量
        // maxInitialRequests: 30, // 入口js文件最大并行请求数量
        // enforceSizeThreshold: 50000, // 超过50kb一定会单独打包（此时会忽略minRemainingSize、maxAsyncRequests、maxInitialRequests）
        // cacheGroups: { // 组，哪些模块要打包到一个组
        //   defaultVendors: { // 组名
        //     test: /[\\/]node_modules[\\/]/, // 需要打包到一起的模块
        //     priority: -10, // 权重（越大越高）
        //     reuseExistingChunk: true, // 如果当前 chunk 包含已从主 bundle 中拆分出的模块，则它将被重用，而不是生成新的模块
        //   },
        //   default: { // 其他没有写的配置会使用上面的默认值
        //     minChunks: 2, // 这里的minChunks权重更大
        //     priority: -20,
        //     reuseExistingChunk: true,
        //   },
        // },
        // 修改配置
        cacheGroups: {
            // 组，哪些模块要打包到一个组
            // defaultVendors: { // 组名
            //   test: /[\\/]node_modules[\\/]/, // 需要打包到一起的模块
            //   priority: -10, // 权重（越大越高）
            //   reuseExistingChunk: true, // 如果当前 chunk 包含已从主 bundle 中拆分出的模块，则它将被重用，而不是生成新的模块
            // },
            default: {
                // 其他没有写的配置会使用上面的默认值
                minSize: 0, // 我们定义的文件体积太小了，所以要改打包的最小文件体积
                minChunks: 2,
                priority: -20,
                reuseExistingChunk: true,
            },
        },
    },
}
```

3. 按需加载，动态导入
一旦通过 import 动态导入语法导入模块，模块就被代码分割，同时也能按需加载了。

demo3: 
```
document.getElementById("btn").onclick = function () {
  // 动态导入 --> 实现按需加载
  // 即使只被引用了一次，也会代码分割
  import("./math.js").then(({ sum }) => {
    alert(sum(1, 2, 3, 4, 5));
  });
};
```

4. 单入口
开发时我们可能是单页面应用（SPA），只有一个入口（单入口）。那么我们需要这样配置：

demo4: 
```
entry: './src/main.js',
...
optimization: {
    // 代码分割配置
    splitChunks: {
      chunks: "all", // 对所有模块都进行分割
    }
}
```


5. 更新配置
最终我们会使用单入口+代码分割+动态导入方式来进行配置。更新之前的配置文件。

```index.html
<button id="btn">计算</button>
```
```main.js
document.getElementById("btn").onclick = function () {
    import ('./js/test').then(( {test} ) => {
        console.log(test(2, 1))
    })
};
```
eslint 配置:
```npm i eslint-plugin-import -D```
```.eslintrc.js
...
plugins: ["import"], // 解决动态导入import语法报错问题 --> 实际使用eslint-plugin-import的规则解决的
...
```

6.
6.1 动态导入输出资源重命名:
dist/static/js/test.js
dist/static/js/test.js.map
```
import(/* webpackChunkName: "test" */'./js/test').then(({ test }) => {
    console.log(test(2, 1))
})
```
```
output: {
    ...
    // 入口文件打包输出文件名
    filename: 'static/js/main.js',
    // 动态导入输出资源命名方式
    chunkFilename: 'static/js/[name].js',
},
```

6.2 给其他资源重命名
```
// 入口文件打包输出文件名
filename: 'static/js/[name].js',
// 动态导入输出资源命名方式
chunkFilename: 'static/js/[name].chunk.js',
// 图片、字体等资源命名方式（注意用hash）
assetModuleFilename: 'static/media/[hash:10][ext][query]',
```
```
new MiniCssExtractPlugin({
    // 定义输出文件名和目录
    filename: "static/css/[name].css",
    chunkFilename: "static/css/[name].chunk.css",
}),
```
TODO: npm start 有时会报下面的错
```
ERROR in [eslint] 
20:5  error  Parsing error: 'import' and 'export' may only appear at the top level
```

## 2. Preload / Prefetch

### 为什么
我们前面已经做了代码分割，同时会使用 import 动态导入语法来进行代码按需加载（我们也叫懒加载，比如路由懒加载就是这样实现的）。

但是加载速度还不够好，比如：是用户点击按钮时才加载这个资源的，如果资源体积很大，那么用户会感觉到明显卡顿效果。

我们想在浏览器空闲时间，加载后续需要使用的资源。我们就需要用上 Preload 或 Prefetch 技术。


### 是什么
`Preload`：告诉浏览器立即加载资源。

`Prefetch`：告诉浏览器在空闲时才开始加载资源。

##### 它们共同点：
* 都只会加载资源，并不执行。
* 都有缓存。


##### 它们区别：
`Preload`加载优先级高，`Prefetch`加载优先级低。
`Preload`只能加载当前页面需要使用的资源，`Prefetch`可以加载当前页面资源，也可以加载下一个页面需要使用的资源。

##### 总结：
* 当前页面优先级高的资源用 Preload 加载。
* 下一个页面需要使用的资源用 Prefetch 加载。

##### 它们的问题：兼容性较差。
我们可以去 https://caniuse.com/?search=preload 网站查询 API 的兼容性问题。
Preload 相对于 Prefetch 兼容性好一点。


### 怎么用
1. 下载包
```npm i @vue/preload-webpack-plugin -D```

2. preload 配置
```
const PreloadWebpackPlugin = require("@vue/preload-webpack-plugin");
new PreloadWebpackPlugin({
    rel: "preload", // preload兼容性更好
    as: "script",
}),
```

测试:dist/index.html
```
 <link href="static/js/test.chunk.js" rel="preload" as="script">
```

3. prefetch 配置
```
new PreloadWebpackPlugin({
    rel: 'prefetch' // prefetch兼容性更差
}),
```

测试:dist/index.html
```
<link href="static/js/test.chunk.js" rel="prefetch">
```



## 3. Network Cache

### 为什么
将来开发时我们对静态资源会使用缓存来优化，这样浏览器第二次请求资源就能读取缓存了，速度很快。

但是这样的话就会有一个问题, 因为前后输出的文件名是一样的，都叫 main.js，一旦将来发布新版本，因为文件名没有变化导致浏览器会直接读取缓存，不会加载新资源，项目也就没法更新了。

所以我们从文件名入手，确保更新前后文件名不一样，这样就可以做缓存了。


### 是什么
它们都会生成一个唯一的 hash 值。

* fullhash（webpack4 是 hash）
每次修改任何一个文件，所有文件名的 hash 值都将改变。所以一旦修改了任何一个文件，整个项目的文件缓存都将失效。

* chunkhash
根据不同的入口文件(Entry)进行依赖文件解析、构建对应的 chunk，生成对应的哈希值。我们 js 和 css 是同一个引入，会共享一个 hash 值。

* contenthash
根据文件内容生成 hash 值，只有文件内容变化了，hash 值才会变化。所有文件 hash 值是独享且不同的。


### 怎么用
```
// [contenthash:8]使用contenthash，取8位长度
filename: "static/js/[name].[contenthash:8].js", // 入口文件打包输出资源命名方式
chunkFilename: "static/js/[name].[contenthash:8].chunk.js", // 动态导入输出资源命名方式
```
```
optimization: {
    ...
    runtimeChunk: {
        name: entrypoint => `runtime-${entrypoint.name}.js`,
    }
},
```


## 4. Core-js

### 为什么
过去我们使用 babel 对 js 代码进行了兼容性处理，其中使用@babel/preset-env 智能预设来处理兼容性问题。

它能将 ES6 的一些语法进行编译转换，比如箭头函数、点点点运算符等。但是如果是 async 函数、promise 对象、数组的一些方法（includes）等，它没办法处理。

所以此时我们 js 代码仍然存在兼容性问题，一旦遇到低版本浏览器会直接报错。所以我们想要将 js 兼容性问题彻底解决


### 是什么
`core-js` 是专门用来做 ES6 以及以上 API 的 `polyfill`。

`polyfill`翻译过来叫做垫片/补丁。就是用社区上提供的一段代码，让我们在不兼容某些新特性的浏览器上，使用该新特性。


### 怎么用
安装:
```
npm i core-js
```

* 手动全部引入

这样引入会将所有兼容性代码全部引入，体积太大了。我们只想引入 promise 的 polyfill。

```
// import 'core-js'; // 完整引入
```

* 手动按需引入

只引入打包 promise 的 polyfill，打包体积更小。但是将来如果还想使用其他语法，我需要手动引入库很麻烦。

```
// import 'core-js/es/promise'; // 按需加载(手动引入)
```

* 自动按需引入
此时就会自动根据我们代码中使用的语法，来按需加载相应的 polyfill 了。

babel.config.js 配置

```
module.exports = {
    // 智能预设, 能够编译es6语法
    presets: [
        ['@babel/preset-env', {
            useBuiltIns: 'usage', // 按需加载,自动引入
            corejs: 3
        }]
    ]
}
```

官网: https://www.babeljs.cn/docs/babel-preset-env#corejs