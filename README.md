## Webpack5 学习


资料:
https://pan.baidu.com/s/114lJRGua2uHBdLq_iVLOOQ 提取码：yyds

视频链接:
https://www.bilibili.com/video/BV14T4y1z7sw/?p=3&spm_id_from=pageDriver&vd_source=14fedc3c63ed079cd9eb76b1b47d1f84



1. 为什么需要打包工具:
react, vue, es6, less/sass
压缩代码, 做兼容处理, 提升性能.

2. 基础使用 / 测试
如果直接访问, 报如下错误.
浏览器不识别es6 模块化 语言
webpack开发环境下,仅能编译es6 模块化语法, 不能编译箭头函数, es6语法等.
```
Uncaught SyntaxError: Cannot use import statement outside a module (at main.js:1:1)
```

 ![Uncaught SyntaxError.png](./public/img/Uncaught%20SyntaxError.png)


第二部分:
使用webpack技术来解决上述问题


(1) 初始化package.json
npm init -y 
注意: "name": "webpack_code" 名称不能为webpack,如果是下面的webpack包会下载失败.

(2) 安装2个, webpack webpack-cli(webpack 指令)
下载到开发依赖中 -D
pm i webpack webpack-cli -D

(3) 打包测试
npx webpack ./src/main.js --mode=development
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
 
npx webpack ./src/main.js --mode=production
生成dist文件, 里面的main.js被压缩. (1行)
```
dxm@bogon webpack_code % npx webpack ./src/main.js --mode=production 
asset main.js 86 bytes [emitted] [minimized] (name: main)
orphan modules 283 bytes [orphan] 2 modules
./src/main.js + 2 modules 399 bytes [built] [code generated]
webpack 5.84.0 compiled successfully in 840 ms
dxm@bogon webpack_code % 
```