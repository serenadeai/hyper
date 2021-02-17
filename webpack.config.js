"use strict";

const path = require("path");

const config = {
  name: "serenade-hyper",
  target: "web",
  entry: "./src/index.ts",
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "[name].js",
    // This is necessary for exports to work correctly with Hyper!
    libraryTarget: 'commonjs2',
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    symlinks: false
  },
  module: {
    rules: [
      {
        exclude: /node_modules/,
        test: /\.tsx?$/,
        use: "ts-loader"
      }
    ]
  }
}

module.exports = (env, argv) => {
  if (argv.mode === 'development') {
    config.devtool = 'cheap-module-source-map';
  }

  return config;
};
