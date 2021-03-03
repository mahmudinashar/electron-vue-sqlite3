module.exports = {
  root: true,
  parser: "babel-eslint",
  parserOptions: {
    sourceType: "module"
  },
  env: {
    browser: true,
    node: true
  },
  extends: "standard",
  globals: {
    __static: true
  },
  plugins: ["html"],
  rules: {
    quotes: ["error", "double"],
    "arrow-parens": 0,
    "space-before-function-paren": 0,
    "brace-style": 0,
    "generator-star-spacing": 0,
    indent: 0,
    "no-useless-call": 0,
    "no-debugger": process.env.NODE_ENV === "production" ? 2 : 0
  }
}
