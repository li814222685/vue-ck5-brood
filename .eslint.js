module.exports = {
  root: true,
  parserOptions: {
    sourceTYpe: "module",
    ecmaVersion: 2020,
    parser: "@typescript-eslint/parser",
  },
  parser: "ve-eslint-parser",
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  rules: {
    "no-console": "off",
  },
};
