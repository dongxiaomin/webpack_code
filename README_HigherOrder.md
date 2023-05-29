## Webpack5 高阶学习


资料:
https://yk2012.github.io/sgg_webpack5/base/#%E4%B8%BA%E4%BB%80%E4%B9%88%E9%9C%80%E8%A6%81%E6%89%93%E5%8C%85%E5%B7%A5%E5%85%B7

视频:
https://www.bilibili.com/video/BV14T4y1z7sw/?p=3&spm_id_from=pageDriver&vd_source=14fedc3c63ed079cd9eb76b1b47d1f84


# 一 高级优化
我们会从以下角度来进行优化：

* 提升开发体验
* 提升打包构建速度
* 减少代码体积
* 优化代码运行性能

# 提升开发体验
SourceMap
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