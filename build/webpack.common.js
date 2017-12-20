const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const filePaths = {
    dev: "./src/",
    dist: "../dist/",
    js: "../src/js/",
    sass: "./src/sass/",
    images: "./src/images/"
};

console.log(filePaths.js);

const config = {
    entry: {
        app: path.resolve(__dirname, filePaths.js + 'app.js')
    },
    module: {
        rules: [
            {
                test: /\.html$/,
                use: ["art-template-loader"]
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: ['file-loader']
            }
        ]
    },
    devtool: 'inline-source-map',
    plugins: [
        // 清除dist文件夹
        new CleanWebpackPlugin(["dist"], {
            root: path.resolve(__dirname, "../")
        }),
        // 设置全局变量
        new webpack.ProvidePlugin({
            $: 'zepto-modules'
        }),
        // 自动生成index.html
        new HtmlWebpackPlugin({
            title: "xjs-framework",
            template: filePaths.dev + "index.html"
        })
    ]
};

module.exports = {
    config,
    filePaths
};