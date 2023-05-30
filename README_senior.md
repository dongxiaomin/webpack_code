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