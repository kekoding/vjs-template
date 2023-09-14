const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const Dotenv = require("dotenv-webpack");
const webpack = require("webpack");

// path is node js inbuild package which is used to work with directory in your app.
const path = require("path");

const adminPages = ["dashboard"];
const homePages = ["home", "index"];

const webPlugins = (argv) => {
  const webpackPlugins = [];
  webpackPlugins.push(
    ...adminPages.map(
      (page) =>
        new HtmlWebpackPlugin({
          // telling webpack that inject the js bundle in the body of html file
          inject: "body",
          // telling webpack where html file are located
          template: `./src/templates/admin/${page}.html`,
          // telling webpack that how and where to put html file in dist directory
          filename: `admin/${page}.html`, // admin pages will accessible using admin/{page}.html
          chunks: [page],
        })
    )
  );

  webpackPlugins.push(
    ...homePages.map(
      (page) =>
        new HtmlWebpackPlugin({
          // telling webpack that inject the js bundle in the body of html file
          inject: "body",
          // telling webpack where html file are located
          template: `./src/templates/${page}.html`,
          // telling webpack that how and where to put html file in dist directory
          filename: `${page}.html`, // pages will accessible using {page}.html
          chunks: [page],
        })
    )
  );

  webpackPlugins.push(
    new Dotenv({
      path: `./.env.${argv.mode}`,
    })
  ),
    // telling the wepack how to minified the styles files.
    webpackPlugins.push(
      new MiniCssExtractPlugin({
        filename: "src/styles/[name].bundle.css",
        ignoreOrder: false,
        chunkFilename: "[name]",
      })
    );
  // telling the webpack to copy our assets from src directory to build directory (dist)
  // if there is not assets in the below directory it will throw error.
  webpackPlugins.push(
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "src/assets/images/",
          to: "assets/images/",
        },
        {
          from: "src/assets/docs/",
          to: "assets/docs/",
        },
      ],
    })
  );
  return webpackPlugins;
};

const entryPages = [].concat(adminPages, homePages);
module.exports = (env, argv) => {
  const isProduction = argv.mode === "production";
  const plg = webPlugins(argv);

  return {
    entry: entryPages.reduce((config, page) => {
      let p = `./src/scripts/${page}.ts`;
      config[page] = p;
      console.log(`config ${config} for page ${page} = ${config[page]}`);
      return config;
    }, {}),

    output: {
      filename: "src/[name].bundle.js",
      path: path.resolve(__dirname, "dist"),
      publicPath: "/", // path on which webpack will serve the application.
      // allows one to use asset files (fonts, icons, etc) without configuring additional loaders.
      assetModuleFilename: "assets/images/[name][ext][query]",
    },

    // plugin are used to add additional configuration on top of webpack.
    // webpack itself build on the same plugin system.
    plugins: plg,
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: "ts-loader",
          exclude: /node_modules/,
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: "asset/resource",
        },
        // loader are used to load specific type of file which is not by default used by webpack.
        {
          test: /\.(sa|sc|c)ss$/,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : "style-loader",
            "css-loader",
          ],
        },
      ],
    },
    resolve: {
      extensions: [".tsx", ".ts", ".js"],
    },
    devServer: {
      client: {
        overlay: true, // Shows a full-screen overlay in the browser when there are compiler errors or warnings.
      },
      watchFiles: ["src/*", "dist/**/*"],
      port: 3000,
    },
  };
};
