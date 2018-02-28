const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const SpritesmithPlugin = require('webpack-spritesmith');
const spriteTemplate = require('./spriteTemplate');

const useRem = true; // it's a flag to mark the unit of css
const baseSize = 100; // setting base size to convert px to rem

const filePaths = {
    dev: "./src/",
    dist: "../dist/",
    js: "../src/js/",
    sass: "./src/sass/",
    images: "./src/images/"
};

const config = {
    entry: {
        app: path.resolve(__dirname, filePaths.js + 'app.js')
    },
    module: {
        rules: [
            {
                test: /\.html$/,
                use: "raw-loader"
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: ['file-loader?name=i/[hash].[ext]']
            },
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ["@babel/preset-env"]
                    }
                }
            }
        ]
    },
    resolve: {
        modules: ["node_modules", "spritesmith-generated"]
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
        }),
        new SpritesmithPlugin({
            src: {
                cwd: path.resolve(__dirname, '../src/images/icons'),
                glob: '*.png'
            },
            target: {
                image: path.resolve(__dirname, '../src/images/sprite.png'),
                css: [
                    [path.resolve(__dirname, '../src/sass/_sprite.scss'), {
                        format: 'function_based_template'
                    }]
                ]
            },
            customTemplates: {
                'function_based_template': spriteTemplate(useRem, baseSize)
            },
            apiOptions: {
                cssImageRef: "../images/sprite.png"
            },
            spritesmithOptions: {
                padding: 10
            }
        })
    ]
};

module.exports = {
    config,
    filePaths
};