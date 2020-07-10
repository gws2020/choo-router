const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
module.exports = (env) => {
  const { entry } = env
  return {
    entry: {
      index: entry
    },
    output: {
      publicPath: './dist',
      path: path.resolve(__dirname, './bin'),
      filename: '[name].js',
      libraryTarget: 'umd'
    },
    module: {
      rules: [
        {
          test: /\.ts?$/,
          use: 'ts-loader',
          exclude: /node_modules/
        }
      ]
    },
    resolve: {
      extensions: ['.ts', '.js']
    },
    plugins: [
      new CleanWebpackPlugin()
    ],
    externals: [
      'vue',
      'vue-router',
      'vue-property-decorator',
      'string-random'
    ]
  }
}