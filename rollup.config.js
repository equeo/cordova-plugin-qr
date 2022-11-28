const { babel } = require("@rollup/plugin-babel");

module.exports = {
  input: "src/index.js",
  output: {
    file: "dist/index.js",
    format: "cjs",
  },
  plugins: [
    babel({ babelHelpers: "bundled", minified: true, comments: false }),
  ],
};
