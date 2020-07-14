const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
module.exports = (env) => {
  const { entry } = env
  return {
    entry: {
      index: entry
    },
    output: {
      publicPath: './lib',
      path: path.resolve(__dirname, './lib'),
      filename: '[name].js',
      libraryTarget: 'umd'
    },
    module: {
      rules: [
        {
          test: /\.ts(x)?$/,
          use: [
            'cache-loader',
            'babel-loader',
            {
              loader: 'ts-loader',
              options: {
                transpileOnly: true,
                happyPackMode: false
              }
            }
          ]
        }
      ]
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx']
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