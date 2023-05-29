## Webpack5 学习


资料:
https://yk2012.github.io/sgg_webpack5/base/#%E4%B8%BA%E4%BB%80%E4%B9%88%E9%9C%80%E8%A6%81%E6%89%93%E5%8C%85%E5%B7%A5%E5%85%B7

视频:
https://www.bilibili.com/video/BV14T4y1z7sw/?p=3&spm_id_from=pageDriver&vd_source=14fedc3c63ed079cd9eb76b1b47d1f84


# 一 基础知识
## 1. 为什么需要打包工具？
开发时，我们会使用框架（React、Vue），ES6 模块化语法，Less/Sass 等 css 预处理器等语法进行开发。

这样的代码要想在浏览器运行必须经过编译成浏览器能识别的 JS、Css 等语法，才能运行。

所以我们需要打包工具帮我们做完这些事。

除此之外，打包工具还能**压缩代码**、做**兼容性处理**、**提升代码性能**等。


## 2. 基础使用 / 测试
Webpack 是一个静态资源打包工具。

**开发模式**：仅能编译 JS 中的 ES Module(import, export) 模块化语法, 不能编译箭头函数, es6语法等

**生产模式**：能编译 JS 中的 ES Module 语法，还能压缩 JS 代码

如果直接访问页面html,不打包, 报如下错误:
```
Uncaught SyntaxError: Cannot use import statement outside a module (at main.js:1:1)
```
 ![Uncaught SyntaxError.png](https://github.com/dongxiaomin/webpack_code/blob/master/public/img/Uncaught%20SyntaxError.png)


# 二 基本使用
可以使用webpack技术来解决上述问题

1. 初始化 package.json
```npm init -y ```
注意: "name": "webpack_code" 名称不能为webpack,否则因同名 下面的webpack包会下载失败.

2. 安装2个包: webpack webpack-cli(webpack 指令)
```npm i webpack webpack-cli -D```

3. 打包测试 (npx)
```npx webpack ./src/main.js --mode=development```
npx + webpack 包 + 入口文件 + 打包环境
生成dist文件, 里面的main.js 相对庞大. (106行)
```
dxm@bogon webpack_code % npx webpack ./src/main.js --mode=development
asset main.js 5.05 KiB [emitted] (name: main)
runtime modules 670 bytes 3 modules
cacheable modules 294 bytes
  ./src/main.js 116 bytes [built] [code generated]
  ./src/js/count.js 69 bytes [built] [code generated]
  ./src/js/sum.js 109 bytes [built] [code generated]
webpack 5.84.0 compiled successfully in 732 ms
dxm@bogon webpack_code %
```
 
```npx webpack ./src/main.js --mode=production```
生成dist文件, 里面的main.js被压缩. (1行)
```
dxm@bogon webpack_code % npx webpack ./src/main.js --mode=production 
asset main.js 86 bytes [emitted] [minimized] (name: main)
orphan modules 283 bytes [orphan] 2 modules
./src/main.js + 2 modules 399 bytes [built] [code generated]
webpack 5.84.0 compiled successfully in 840 ms
dxm@bogon webpack_code % 
```

4. 小结: 
* **npx说明: npx 会将 node_modules/.bin 临时添加为环境变量, 这样可以访问环境变量中的应用程序.**
* Webpack 本身功能比较少，只能处理 js 资源，一旦遇到 css 等其他资源就会报错。
* 主要学习如何处理其他资源



# 三 基本配置
五大核心
* entry（入口）指示 Webpack 从哪个文件开始打包

* output（输出）指示 Webpack 打包完的文件输出到哪里去，如何命名等

* loader（加载器）webpack 本身只能处理 js、json 等资源，其他资源需要借助 loader，Webpack 才能解析

* plugins（插件）扩展 Webpack 的功能

* mode（模式）
开发模式：development
生产模式：production


# 四 基本配置文件
编写**webpack.config.js**文件
执行 ```npx webpack```, 和上面执行```npx webpack ./src/main.js --mode=development```一样
```
const path = require("path"); //nodejs 核心模板, 专门用来处理路径问题

module.exports = {
    // 入口
    entry: './src/main.js', // 相对路径
    // 输出
    output: {
        // __dirname nodejs的变量, 代表当前文件夹目录
        path: path.resolve(__dirname, "dist"), // 绝对目录
        filename: 'main.js'
    },
    // 加载器
    module: {
        rules: [
            // loader 的配置
        ]
    },
    // 插件
    plugins: [
        // plugin的配置
    ],
    // 模式
    mode: "development",
}
```

# 五 处理css
### 处理css资源
npm install css-loader style-loader -D

### 处理less资源
npm install less less-loader --save-dev

### 处理sass资源
npm install sass-loader sass --save-dev

### 处理stylus资源
npm install stylus stylus-loader --save-dev

页面测试![style.png](https://github.com/dongxiaomin/webpack_code/blob/master/public/img/style.png)


# 六 处理 image
过去在 Webpack4 时，我们处理图片资源通过 file-loader 和 url-loader 进行处理

现在 Webpack5 已经将两个 Loader 功能内置到 Webpack 里了，我们只需要简单配置即可处理图片资源

注意: 重复打包不会覆盖旧的, 需要删除旧的图片

将小于10kb的图片转为 **data URI 形式（Base64 格式）**

优点: 减少图片请求数量, 也就是减轻服务器压力.
缺点: 体积会比原图大
```
{
    test: /\.(png|jpe?g|gif|svg|webp)/,
    type: 'asset',
    parser: {
        dataUrlCondition: {
            maxSize: 10 * 1024 // 10kb
        }
    }
}
```

# 七 修改输出文件目录
1. 修改输出图片路径
```
generator: {
    // 输出图片名称
    // [hash:10] hash值取前10位
    filename: 'static/images/[hash:10][ext][query]'
}
```

2. 修改输出主文件
```
output: {
    ...
    // 入口文件打包输出文件名
    filename: 'static/js/main.js'
},
```

# 八 自动清空上次打包内容
原理: 在打包前,将output path 整个目录内容清空, 再进行打包
```clean: true```

# 九 处理字体图标资源
前期准备: 下载 -- 阿里巴巴矢量图标库 https://www.iconfont.cn/
* 下载 -》 解压 -》 demo_index.html -》 Font class 
* 添加字体图标资源
```
src/fonts/iconfont.ttf
src/fonts/iconfont.woff
src/fonts/iconfont.woff2
src/css/iconfont.css
```
* 配置
```
{
    test: /\.(ttf|woff2?)/,
    type: 'asset/resource',
    generator: {
        // 输出名称
        filename: 'static/media/[hash:10][ext][query]'
    }
}
```

# 十 处理其他资源, 可直接正则追加
```test: /\.(ttf|woff2?|mp3|mp4|avi)/,```


# 十一 处理 js 资源, 使用 eslint 对代码进行检查
Webpack 对 js 处理是有限的，只能编译 js 中 ES 模块化语法，不能编译其他语法，导致 js 不能在 IE 等浏览器运行，所以我们希望做一些兼容性处理。

其次开发中，团队对代码格式是有严格要求的，我们不能由肉眼去检测代码格式，需要使用专业的工具来检测。

针对代码格式，我们使用 Eslint 来完成 (先)

针对 js 兼容性处理，我们使用 Babel 来完成 (后)

## 使用 eslint 对代码进行检查
Eslint
可组装的 JavaScript 和 JSX 检查工具。

它是用来检测 js 和 jsx 语法的工具，可以配置各项功能

我们使用 Eslint，关键是写 Eslint 配置文件，里面写上各种 rules 规则，将来运行 Eslint 时就会以写的规则对代码进行检查

* 安装
```npm install eslint eslint-webpack-plugin --save-dev```

* 配置
创建.eslintrc.js文件
```
module.exports = {
    // 继承 Eslint 规则
    extends: ["eslint:recommended"],
    env: {
        node: true, // 启用node中全局变量
        browser: true, // 启用浏览器中全局变量
    },
    parserOptions: {
        ecmaVersion: 6,
        sourceType: "module",
    },
    rules: {
        "no-var": 2, // 不能使用 var 定义变量
    },
};
```

* 在 Webpack 中使用
```
const ESLintPlugin = require('eslint-webpack-plugin');

```

```
plugins: [
    // plugin的配置
    new ESLintPlugin({
        // 检测哪些文件
        context: path.resolve(__dirname, "src")
    }),
],

```
测试: src/main.js 中的使用var会打包失败


## Babel
JavaScript 编译器。

主要用于将 ES6 语法编写的代码转换为向后兼容的 JavaScript 语法，以便能够运行在当前和旧版本的浏览器或其他环境中

```
{
    test: /\.js$/,
    exclude: /(node_modules)/, //排除node_modules中的js文件
        loader: 'babel-loader',
    //   options: {
    //     presets: ['@babel/preset-env']
    //   }
    }
```
babel.config.js, 后期方便修改   

注意: **presets  可以写在webpack.config.js 中, 也可以写在.babel.config.js**
测试: dist/static/js/main.js 中的sum() 箭头函数已转换

# 十二 处理 html 资源
```npm install --save-dev html-webpack-plugin```
有一个弊端, 不会引入样式
```
const HtmlWebpackPlugin = require('html-webpack-plugin');
```

会原封不动地输出到dist文件中, 包括样式
```
new HtmlWebpackPlugin({
    // 模板: 以public/index.html创建新的html文件
    // 新的html文件特点: 1. 结构和原来一致, 2. 自动引入打包输出的资源
    template: path.resolve(__dirname, "public/index.html")
})
```
此时 dist 目录就会输出一个 dist/index.html 


# 十三 开发服务器&自动化
每次写完代码都需要手动输入指令才能编译代码，太麻烦了，我们希望一切自动化, 保存后自动编译.
1. 下载包
```npm i webpack-dev-server -D```
2. 配置
```
// 开发服务器
devServer: {
    host: "localhost", // 启动服务器域名
    port: "3000", // 启动服务器端口号
    open: true, // 是否自动打开浏览器
},
```
3. 运行指令
```
npx webpack serve
```
注意: 
在开发服务器模式下启动, 不会输出资源.
因为在内存中编译打包, 并不会输出到 dist 目录下.
如果删除dist文件, 不会影响/终止编译.

-------------------------------------------------------------------------------------------------------------------


# 一 生产模式配置

```
//说明: devServe启动 + 指定配置文件路径
npx webpack serve --config ./config/webpack.dev.js
npx webpack --config ./config/webpack.prod.js
```

**优化**:
```
"scripts": {
    "start": "npm run dev",
    "dev": "webpack serve --config ./config/webpack.dev.js",
    "build": "webpack --config ./config/webpack.prod.js"
  },
```

**总结**:
开发环境:```npm start```或 ```npm run dev```
生产环境: ```npm run build```


# 二 Css 处理

## 提取 Css 成单独文件
Css 文件目前被打包到 js 文件中，当 js 文件加载时，会创建一个 style 标签来生成样式 

例: ![style.png](https://github.com/dongxiaomin/webpack_code/blob/master/public/img/style.png)

这样对于网站来说，会出现闪屏现象，用户体验不好

测试方法: Netwoking throttling --> Slow 3G, 如果是 script标签引入css, 会出现闪屏

![<style>test1.png](https://github.com/dongxiaomin/webpack_code/blob/master/public/img/<style>test1.png)

![<style>test2.png](https://github.com/dongxiaomin/webpack_code/blob/master/public/img/<style>test2.png) 

我们应该是单独的 Css 文件，通过 link 标签加载性能才好

例: ![style_prod.png](https://github.com/dongxiaomin/webpack_code/blob/master/public/img/style_prod.png)

方法:
```
npm install --save-dev mini-css-extract-plugin
```
```
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
...
new MiniCssExtractPlugin({
    // 定义输出文件名和目录
    filename: "static/css/main.css",
}),
```
replace ```"css-loader"``` to ```MiniCssExtractPlugin.loader,```


