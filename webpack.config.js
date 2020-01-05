const { resolve } = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const SRC_DIR = resolve(__dirname, 'src');
const BUILD_DIR = resolve(__dirname, 'dist');

module.exports = {
    entry: resolve(SRC_DIR, 'client', 'index.ts'),
    output: {
        filename: 'index.js',
        path: resolve(BUILD_DIR, 'lib')
    },
    mode: 'production',
    resolve: {
        extensions: ['.js', '.ts', '.tsx']
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader'
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin()
    ]
};