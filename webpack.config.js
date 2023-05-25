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
            {
                test: /\.css$/, // 只检测css文件
                use: [ // 执行顺序, 从右往左(从下到上)
                    "style-loader",  // 动态创建style标签,使样式生效
                    "css-loader", // 将css资源编译成commonjs的模块到js中 (css打包到js中)
                ],
            },
            {
                test: /\.less$/,
                use: [
                  // compiles Less to CSS
                  'style-loader',
                  'css-loader',
                  'less-loader', // 将less编译成css
                ],
            },
        ]
    },
    // 插件
    plugins: [
        // plugin的配置
    ],
    // 模式
    mode: "development",
}