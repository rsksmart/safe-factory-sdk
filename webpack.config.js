const webpack = require('webpack');
const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/index.ts',
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: { configFile: 'tsconfig.build.json' },
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    fallback: {
      "stream": require.resolve("stream-browserify"),
      "assert": require.resolve("assert")
    }
  },
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'lib'),
    library: {
      name: 'safeFactorySDK',
      type: "umd"
    },
    globalObject: 'this'
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_DEBUG': false
    })
  ]
};
