const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
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
        app: [
            '@babel/polyfill',
            path.resolve(__dirname, filePaths.js + 'app.js')
        ]
    },
    module: {
        rules: [
            {
                test: /\.html$/,
                use: "html-loader",
                exclude: /index\.html$/,
            },
            {
                test: /\.(png|svg|jpg|gif|ico)$/,
                use: ['file-loader?name=i/[hash].[ext]']
            },
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ["@babel/preset-env"],
                        plugins: ["@babel/plugin-transform-runtime"]
                        // plugins: [
                        //     ["@babel/plugin-transform-runtime", {
                        //         // "regenerator": true,
                        //         // "moduleName": "@babel/runtime",
                        //         useBuiltIns: true
                        //     }]
                        // ]
                    }
                }
            }
        ]
    },
    resolve: {
        modules: ["node_modules", "spritesmith-generated"]
    },
    plugins: [
        // 自动生成index.html
        new HtmlWebpackPlugin({
            title: "turbine mvvm js framework",
            // favicon: filePaths.images + "favicon.ico",
            template: filePaths.dev + 'index.html',
            hash: true,
            inject: true,
            minify: {
                removeComments: true,        //去注释
                collapseWhitespace: true,    //压缩空格
                removeAttributeQuotes: true  //去除属性引用
                // more options:
                // https://github.com/kangax/html-minifier#options-quick-reference
            }
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