const path = require("path");

module.exports = {
  chainWebpack: config => {
    config
      .entry("app")
      .clear()
      .add("./example/main.ts")
      .end();
    config.resolve.alias
      .set("@", path.join(__dirname, "./example"))
  }
};