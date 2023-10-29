const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

const isDevelopment = process.env.NODE_ENV === 'development';

module.exports = {
    mode: isDevelopment ? 'development' : 'production',
    entry: './src/index.jsx',
    output: {
        filename: isDevelopment ? 'bundle.js' : 'bundle.[contenthash].js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: isDevelopment ? '/zen-time' : '/',
    },
    target: 'web',
    devServer: {
      static: path.join(__dirname, 'dist'),
      compress: true,
      port: 9000,
      historyApiFallback: true,
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './index.html'
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
            exclude: /node_modules/,
            use: [
                {
                    loader: 'babel-loader',
                    options: {
                        // This is required for react-refresh to function:
                        plugins: [
                            process.env.NODE_ENV === 'development' && require.resolve('react-refresh/babel')
                        ].filter(Boolean)
                    }
                }
            ]
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
      ]    
    },
    resolve: {
      extensions: ['.jsx', '.js'],
    }
};
