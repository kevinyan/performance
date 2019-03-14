const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');


module.exports = {
    entry: {
        app: './src/demo.js'
    },
    devtool: 'source-map',
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            title: 'DemoTry',
            template: './index.html'
        })
    ],
    optimization: {
        minimizer: [
            new UglifyJsPlugin({
                sourceMap: true,
            })
        ]
    },
    devServer: {
        contentBase: './dist'
    },
    module: {
        rules: [{
            test: /\.js$/,
            use: [{
                loader: 'babel-loader',
                options: {
                    presets: ['es2015']
                }
            }],
            exclude: '/node_modules/'
        }]
    }
};