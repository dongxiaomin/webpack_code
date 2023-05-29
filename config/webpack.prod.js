const path = require("path"); //nodejs 核心模板, 专门用来处理路径问题
const ESLintPlugin = require('eslint-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
    // 入口
    entry: './src/main.js', // 相对路径
    // 输出
    output: {
        // __dirname nodejs的变量, 代表当前文件夹目录
        path: path.resolve(__dirname, "../dist"), // 绝对目录, 生产模式需要输出
        // 入口文件打包输出文件名
        filename: 'static/js/main.js',
        // 自动清空上次打包内容 (在开始服务器模式下, 可加可不加, 因为不会操作dist)
        clean: true
    },
    // 加载器
    module: {
        rules: [
            // loader 的配置
            {
                test: /\.css$/, // 只检测css文件
                use: [ // 执行顺序, 从右往左(从下到上)
                    MiniCssExtractPlugin.loader,
                    "css-loader", // 将css资源编译成commonjs的模块到js中 (css打包到js中)
                ],
            },
            {
                test: /\.less$/,
                use: [
                    // compiles Less to CSS
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'less-loader', // 将less编译成css
                ],
            },
            {
                test: /\.s[ac]ss$/i,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader', // 将 CSS 转化成 CommonJS 模块
                    'sass-loader', // 将 Sass 编译成 CSS
                ],
            },
            {
                test: /\.styl$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader', // 将 CSS 转化成 CommonJS 模块
                    'stylus-loader', // 将 stylus 编译成 CSS
                ],
            },
            {
                test: /\.(png|jpe?g|gif|svg|webp)/,
                type: 'asset',
                parser: {
                    dataUrlCondition: {
                        // 小于10kb的图片转base64
                        // 优点: 减少请求数量
                        // 缺点: 体积会更大
                        maxSize: 10 * 1024 // 10kb
                    }
                },
                generator: {
                    // 输出图片名称
                    // [hash:10] hash值取前10位
                    filename: 'static/images/[hash:10][ext][query]'
                }
            },
            {
                test: /\.(ttf|woff2?|mp3|mp4|avi)/,
                type: 'asset/resource',
                generator: {
                    // 输出名称
                    filename: 'static/media/[hash:10][ext][query]'
                }
            },
            {
                test: /\.js$/,
                exclude: /node_modules/, //排除node_modules中的js文件
                loader: 'babel-loader',
                //   options: {
                //     presets: ['@babel/preset-env']
                //   }
            }
        ]
    },
    // 插件
    plugins: [
        // plugin的配置
        new ESLintPlugin({
            // 检测哪些文件
            context: path.resolve(__dirname, "../src")
        }),
        new HtmlWebpackPlugin({
            // 模板: 以public/index.html创建新的html文件
            // 新的html文件特点: 1. 结构和原来一致, 2. 自动引入打包输出的资源
            template: path.resolve(__dirname, "../public/index.html")
        }),
        // 提取css成单独文件
        new MiniCssExtractPlugin({
            // 定义输出文件名和目录
            filename: "static/css/main.css",
        }),
    ],
    // 开发服务器: 不会输出资源, 在内存中编译打包
    // devServer: {
    //     host: "localhost", // 启动服务器域名
    //     port: "3000", // 启动服务器端口号
    //     open: true, // 是否自动打开浏览器
    // },
    // 模式
    mode: "production",
}