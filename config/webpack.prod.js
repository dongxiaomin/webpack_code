const os = require("os");
const path = require("path"); //nodejs 核心模板, 专门用来处理路径问题
const ESLintPlugin = require('eslint-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserWebpackPlugin = require('terser-webpack-plugin');
// const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");
const PreloadWebpackPlugin = require("@vue/preload-webpack-plugin");

const threads = os.cpus().length; //cpu核数

const getStyleLoader = (pre) => {
    return [
        MiniCssExtractPlugin.loader,
        "css-loader", // 将css资源编译成commonjs的模块到js中 (css打包到js中)
        {
            loader: "postcss-loader",
            options: {
                postcssOptions: {
                    plugins: [
                        "postcss-preset-env", // 能解决大多数样式兼容性问题
                    ],
                },
            },
        },
        pre
    ].filter(Boolean);
};

module.exports = {
    // 入口
    entry: './src/main.js', // 相对路径
    // 输出
    output: {
        // __dirname nodejs的变量, 代表当前文件夹目录
        path: path.resolve(__dirname, "../dist"), // 绝对目录, 生产模式需要输出
        // [contenthash:8]使用contenthash，取8位长度
        // 入口文件打包输出文件名
        filename: 'static/js/[name].[contenthash:8].js',
        // 动态导入输出资源命名方式
        chunkFilename: 'static/js/[name].[contenthash:8].chunk.js',
        // 图片、字体等资源命名方式（注意用hash）
        assetModuleFilename: 'static/media/[hash:10][ext][query]',
        // 自动清空上次打包内容 (在开始服务器模式下, 可加可不加, 因为不会操作dist)
        clean: true
    },
    // 加载器
    module: {
        rules: [
            // loader 的配置
            {
                oneOf: [
                    {
                        test: /\.css$/, // 只检测css文件
                        use: getStyleLoader()
                    },
                    {
                        test: /\.less$/,
                        use: getStyleLoader("less-loader")
                    },
                    {
                        test: /\.s[ac]ss$/i,
                        use: getStyleLoader("sass-loader")
                    },
                    {
                        test: /\.styl$/,
                        use: getStyleLoader("stylus-loader")
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
            threads, // 开启多进程和设置进程数量
        }),
        new HtmlWebpackPlugin({
            // 模板: 以public/index.html创建新的html文件
            // 新的html文件特点: 1. 结构和原来一致, 2. 自动引入打包输出的资源
            template: path.resolve(__dirname, "../public/index.html")
        }),
        // 提取css成单独文件
        new MiniCssExtractPlugin({
            // 定义输出文件名和目录
            filename: "static/css/[name].[contenthash:8].css",
            chunkFilename: "static/css/[name].[contenthash:8].chunk.css",
        }),
        new PreloadWebpackPlugin({
            // rel: "preload", // preload兼容性更好
            // as: "script",
            rel: 'prefetch' // prefetch兼容性更差
        }),
    ],
    // 开发服务器: 不会输出资源, 在内存中编译打包
    // devServer: {
    //     host: "localhost", // 启动服务器域名
    //     port: "3000", // 启动服务器端口号
    //     open: true, // 是否自动打开浏览器
    // },
    optimization: {
        //压缩的操作
        minimizer: [
            // css压缩
            new CssMinimizerPlugin(),
            // js压缩
            new TerserWebpackPlugin({
                parallel: threads // 开启多进程和设置进程数量
            }),
            // 图片压缩
            // new ImageMinimizerPlugin({
            //     minimizer: {
            //         implementation: ImageMinimizerPlugin.imageminGenerate,
            //         options: {
            //             plugins: [
            //                 ["gifsicle", { interlaced: true }],
            //                 ["jpegtran", { progressive: true }],
            //                 ["optipng", { optimizationLevel: 5 }],
            //                 [
            //                     "svgo",
            //                     {
            //                         plugins: [
            //                             "preset-default",
            //                             "prefixIds",
            //                             {
            //                                 name: "sortAttrs",
            //                                 params: {
            //                                     xmlnsOrder: "alphabetical",
            //                                 },
            //                             },
            //                         ],
            //                     },
            //                 ],
            //             ],
            //         },
            //     },
            // }),
        ],
        // 代码分割配置
        splitChunks: {
            chunks: "all",
        },
        runtimeChunk: {
            name: entrypoint => `runtime-${entrypoint.name}.js`,
        }
    },
    // 模式
    mode: "production",
    devtool: "source-map",
}