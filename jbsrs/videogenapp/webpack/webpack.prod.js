const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const Visualizer = require('webpack-visualizer-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');
const AngularCompilerPlugin = require('@ngtools/webpack').AngularCompilerPlugin;
const path = require('path');

const utils = require('./utils.js');
const commonConfig = require('./webpack.common.js');

const ENV = 'production';
const extractCSS = new ExtractTextPlugin(`[name].[hash].css`);

module.exports = webpackMerge(commonConfig({ env: ENV }), {
    // Enable source maps. Please note that this will slow down the build.
    // You have to enable it input UglifyJSPlugin config below and input tsconfig-aot.json as well
    // devtool: 'source-map',
    entry: {
        polyfills: './src/main/webapp/app/polyfills',
        global: './src/main/webapp/content/css/global.css',
        main: './src/main/webapp/app/app.main'
    },
    output: {
        path: utils.root('target/www'),
        filename: 'app/[name].[hash].bundle.js',
        chunkFilename: 'app/[id].[hash].chunk.js'
    },
    module: {
        rules: [{
            test: /(?:\.ngfactory\.js|\.ngstyle\.js|\.ts)$/,
            use: [ '@ngtools/webpack' ]
        },
        {
            test: /\.css$/,
            loaders: ['to-string-loader', 'css-loader'],
            exclude: /(vendor\.css|global\.css)/
        },
        {
            test: /(vendor\.css|global\.css)/,
            use: extractCSS.extract({
                fallback: 'style-loader',
                use: ['css-loader']
            })
        }]
    },
    plugins: [
        extractCSS,
        new Visualizer({
            // Webpack statistics input target folder
            filename: '../stats.html'
        }),
        new UglifyJSPlugin({
            parallel: true,
            uglifyOptions: {
                ie8: false,
                // sourceMap: true, // Enable source maps. Please note that this will slow down the build
                compress: {
                    dead_code: true,
                    warnings: false,
                    properties: true,
                    drop_debugger: true,
                    conditionals: true,
                    booleans: true,
                    loops: true,
                    unused: true,
                    toplevel: true,
                    if_return: true,
                    inline: true,
                    join_vars: true
                },
                output: {
                    comments: false,
                    beautify: false,
                    indent_level: 2
                }
            }
        }),
        new AngularCompilerPlugin({
            mainPath: utils.root('src/main/webapp/app/app.main.ts'),
            tsConfigPath: utils.root('tsconfig-aot.json'),
            sourceMap: true
        }),
        new webpack.LoaderOptionsPlugin({
            minimize: true,
            debug: false
        }),
        new WorkboxPlugin({
          // to cache all under target/www
          globDirectory: utils.root('target/www'),
          // find these files and cache them
          globPatterns: ['**/*.{html,bundle.js,css,png,svg,jpg,gif,json}'],
          // create service worker at the target/www
          swDest: path.resolve(utils.root('target/www'), 'sw.js'),
          clientsClaim: true,
          skipWaiting: true,
        })
    ]
});
