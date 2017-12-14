const merge = require('webpack-merge');
const {config, filePaths} = require('./webpack.common.js');
const webpack = require('webpack');

module.exports = merge(config, {
    devtool: 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: [
                    "style-loader",
                    "css-loader",
                    "sass-loader"
                ]
            }
        ]
    },
    devServer: {
        contentBase: filePaths.dev,
        hot: true
    },
    plugins: [
        // 支持热更新模块
        new webpack.NamedModulesPlugin(),
        new webpack.HotModuleReplacementPlugin()
    ]
});
