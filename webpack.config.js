const path = require('path');
const config = require('config');
const webpack = require('webpack');

const apiHostname = config.get('http.hostname');
const apiPort = config.get('http.port');
const devHostname = config.get('devserver.hostname');
const devPort = config.get('devserver.port');

module.exports = (env) => {
  const isProduction = (env && env.production) || false;
  const isDevServer = (env && env.devServer) || false;

  const webpackConfig = {
    entry: './src/index.js',
    optimization: { minimize: false },
    devServer: {
      proxy: { '/api': `http://${apiHostname}:${apiPort}` },
      contentBase: path.join(__dirname, 'public/'),
      port: devPort,
      publicPath: `http://${devHostname}:${devPort}/dist/`,
    },
    resolve: {
      modules: ['node_modules', path.resolve(__dirname, 'src/')],
      extensions: ['.js', '.jsx', '.json', '.css'],
    },
    module: {
      rules: [
        {
          test: /\.(jsx?)$/i,
          include: [path.resolve(__dirname, 'src/')],
          loader: 'babel-loader',
          options: { presets: ['@babel/preset-env', '@babel/preset-react'] },
        },
        {
          test: /\.(jpe?g|png|gif)$/i,
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: 'assets/images/',
            // images will be emitted to dist/assets/images/ folder
          },
        },
        {
          include: [path.resolve(__dirname, 'public/')],
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: 'assets/public/',
            // public files will be emitted to dist/assets/public/ folder
          },
        },
      ],
    },
  };

  if (isProduction) {
    webpackConfig.optimization.minimize = true;
  }
  if (isDevServer) {
  }

  return webpackConfig;
};
