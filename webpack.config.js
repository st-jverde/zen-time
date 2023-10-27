const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

module.exports = {
    mode: 'development',  // Setting mode to 'development'
    entry: './src/index.jsx',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/zen-time'
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
    ].filter(Boolean),
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
        }
      ]    
    },
    resolve: {
      extensions: ['.jsx', '.js'],
    }
};
