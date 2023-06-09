const os = require("os");
const path = require("path"); //nodejs 核心模板, 专门用来处理路径问题
const ESLintPlugin = require('eslint-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const threads = os.cpus().length;

module.exports = {
    // 入口
    entry: './src/main.js', // 相对路径
    // 输出
    output: {
        // 开发模式没有输出
        path: undefined,
        // 入口文件打包输出文件名
        filename: 'static/js/[name].js',
        // 动态导入输出资源命名方式
        chunkFilename: 'static/js/[name].chunk.js',
        // 图片、字体等资源命名方式（注意用hash）
        assetModuleFilename: 'static/media/[hash:10][ext][query]',
    },
    // 加载器
    module: {
        rules: [
            // loader 的配置
            {
                oneOf: [
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
                    {
                        test: /\.s[ac]ss$/i,
                        use: [
                            'style-loader', // 将 JS 字符串生成为 style 节点
                            'css-loader', // 将 CSS 转化成 CommonJS 模块
                            'sass-loader', // 将 Sass 编译成 CSS
                        ],
                    },
                    {
                        test: /\.styl$/,
                        use: [
                            'style-loader', // 将 JS 字符串生成为 style 节点
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
                        // generator: {
                        //     // 输出图片名称
                        //     // [hash:10] hash值取前10位
                        //     filename: 'static/images/[hash:10][ext][query]'
                        // }
                    },
                    {
                        test: /\.(ttf|woff2?|mp3|mp4|avi)/,
                        type: 'asset/resource',
                        // generator: {
                        //     // 输出名称
                        //     filename: 'static/media/[hash:10][ext][query]'
                        // }
                    },
                    {
                        test: /\.js$/,
                        // exclude: /node_modules/, //排除node_modules中的js文件
                        include: path.resolve(__dirname, "../src"),
                        use: [
                            {
                                loader: 'thread-loader', // 开启多进程
                                options: {
                                    works: threads, //进程数量
                                }
                            },
                            {
                                loader: 'babel-loader',
                                options: {
                                    cacheDirectory: true, // 开启babel编译缓存
                                    cacheCompression: false, // 缓存文件不要压缩, 主要是省时
                                    plugins: ["@babel/plugin-transform-runtime"], // 减少代码体积
                                },
                            }
                        ]
                    }
                ]
            }
        ]
    },
    // 插件
    plugins: [
        // plugin的配置
        new ESLintPlugin({
            // 检测哪些文件
            context: path.resolve(__dirname, "../src"),
            exclude: "node_modules", // 默认值
            cache: true,
            cacheLocation: path.resolve(__dirname, "../node_modules/.cache/eslintcache"),
            threads,// 开启多进程和设置进程数量
        }),
        new HtmlWebpackPlugin({
            // 模板: 以public/index.html创建新的html文件
            // 新的html文件特点: 1. 结构和原来一致, 2. 自动引入打包输出的资源
            template: path.resolve(__dirname, "../public/index.html")
        }),
    ],
    // 开发服务器: 不会输出资源, 在内存中编译打包
    devServer: {
        host: "localhost", // 启动服务器域名
        port: "3000", // 启动服务器端口号
        open: true, // 是否自动打开浏览器
        hot: true, // 开启HMR功能（只能用于开发环境，生产环境不需要）
    },
    // 模式
    mode: "development",
    devtool: "cheap-module-source-map",
}