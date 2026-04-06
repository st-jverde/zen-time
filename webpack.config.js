const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const webpack = require('webpack');
const Dotenv = require('dotenv-webpack');

const isDevelopment = process.env.NODE_ENV === 'development';

const droneWorkletPath = path.resolve(__dirname, 'src/audio/droneWorkletProcessor.js');

module.exports = {
    mode: isDevelopment ? 'development' : 'production',
    entry: './src/index.jsx',
    output: {
        filename: isDevelopment ? 'bundle.js' : 'bundle.[contenthash].js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: isDevelopment ? '' : '/',
    },
    target: 'web',
    devServer: {
      static: path.join(__dirname, 'dist'),
      compress: true,
      // Prefer 9000; if busy, webpack-dev-server picks the next free port (see WEBPACK_DEV_SERVER_BASE_PORT in npm start).
      port: process.env.PORT ? Number(process.env.PORT) : 'auto',
      historyApiFallback: true,
    },
    plugins: [
      // Cleanup dist folder
      new CleanWebpackPlugin(),
      isDevelopment
        ? new webpack.EnvironmentPlugin({
            NODE_ENV: 'development',
            EXPERIMENTAL_WASM_SAMPLES: process.env.EXPERIMENTAL_WASM_SAMPLES ?? 'false',
          })
        : new webpack.EnvironmentPlugin({
            NODE_ENV: 'production',
            REACT_APP_CLOUDINARY_CLOUD_NAME: process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || '',
            EXPERIMENTAL_WASM_SAMPLES: process.env.EXPERIMENTAL_WASM_SAMPLES ?? 'false',
          }),
      new Dotenv(),
      new HtmlWebpackPlugin({
        template: './index.html',
        minify: isDevelopment ? false : {
            removeAttributeQuotes: true,
            collapseWhitespace: true,
            removeComments: true
        }
      }),  
      isDevelopment && new ReactRefreshWebpackPlugin(),
    ].filter(Boolean),
    optimization: isDevelopment ? {} : {
        splitChunks: {
            chunks: 'all',
        },
    },
    module: {
      rules: [
        {
            test: /\.(js|jsx)$/,
            exclude: [/node_modules/, droneWorkletPath],
            use: [
                {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            '@babel/preset-env',
                            '@babel/preset-react',
                        ],
                        plugins: [
                            isDevelopment && require.resolve('react-refresh/babel'),
                        ].filter(Boolean),
                    },
                },
            ],
        },
        {
            test: /\.css$/,
            use: [
                'style-loader', 
                'css-loader', 
                {
                    loader: 'postcss-loader',
                    options: {
                        postcssOptions: {
                            plugins: [
                                require('tailwindcss'),
                                require('autoprefixer')
                            ]
                        }
                    }
                }
            ]
        },
        {
          test: /\.(mp3|wav|ogg)$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: '[name].[hash].[ext]',
                outputPath: 'samples/'
              }
            }
          ]
        },
        // zen_samples uses wasm-pack `web` target: `new URL('*.wasm', import.meta.url)` + fetch (not webpack wasm parser).
        {
          test: /\.wasm$/,
          type: 'asset/resource',
          generator: {
            filename: 'wasm/[name].[hash][ext]',
          },
        },
      ]    
    },
    resolve: {
      extensions: ['.jsx', '.js'],
    }
};
