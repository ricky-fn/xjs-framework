const merge = require('webpack-merge');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const {config, filePaths} = require('./webpack.common.js');
const webpack = require('webpack');
const path = require('path');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const ImageminPlugin = require('imagemin-webpack-plugin').default;
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = merge(config, {
    entry: {
        lib: ['@babel/polyfill'],
        app: path.resolve(__dirname, filePaths.js + 'app.js')
    },
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: ExtractTextPlugin.extract({
                    // fallback: 'style-loader',
                    use: [
                        // 'style-loader',
                        { loader: 'css-loader', options: {minimize: true} },
                        { loader: 'postcss-loader', options: {config: {path: "./build/postcss.config.js"}} },
                        'sass-loader'
                    ]
                })
            }
        ]
    },
    plugins: [
        // 清除dist文件夹
        new CleanWebpackPlugin(["dist"], {
            root: path.resolve(__dirname, "../")
        }),
        // 压缩图片
        new ImageminPlugin({
            pngquant: {
                quality: '80-90'
            }
        }),
        new UglifyJSPlugin(),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production')
        }),
        new ExtractTextPlugin("styles.css")
    ],
    output: {
        filename: '[name].[chunkhash].js',
        path: path.resolve(__dirname, filePaths.dist)
    }
});