module.exports = {
  babelrc: false,
  cacheDirectory: true,
  presets: [
    ["modern-browsers", { loose: true, modules: false }],
    "@babel/preset-react"
  ],
  plugins: [
    "@babel/plugin-proposal-function-bind",
    "@babel/plugin-proposal-class-properties",
    ["@babel/plugin-proposal-decorators", { legacy: true }],
    "@babel/plugin-proposal-export-namespace-from"
  ]
};
