const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    mode: 'development',
    entry: "./src/index.jsx",
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
    },
    module: {
        rules: [
            {
                test: /\.(jsx|ts)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            '@babel/preset-env',
                            '@babel/preset-react',
                            '@babel/preset-typescript'
                        ],
                    }
                }
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif|ico)$/i,
                type: 'asset/resource',
            },
        ]
    },
    devServer: {
        port: 3000,
        static: {
            directory: path.join(__dirname, 'dist'),
        },
        historyApiFallback: {
            rewrites: [
                { from: /^\/01/, to: '/01_string_filters.html' },
                { from: /^\/02/, to: '/02_style.html' },
            ]
        },
        liveReload: true,
        hot: false,
        watchFiles: ["src/*"],
        client: {
            webSocketTransport: 'ws',
        },
        webSocketServer: 'ws',
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "./public/index.html"
        }),
        new HtmlWebpackPlugin({
            template: "./public/01_string_filters.html",
            filename: "01_string_filters.html",
        }),
        new HtmlWebpackPlugin({
            template: "./public/02_style.html",
            filename: "02_style.html",
        }),
    ]
}
