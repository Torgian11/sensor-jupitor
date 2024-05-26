const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  devServer: {
    proxy: {
      "^/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
        pathRewrite: { "^/api": "/api" },
      },
      "^/login": {
        target: "http://localhost:8000",
        changeOrigin: true,
        pathRewrite: { "^/login": "/login" },
      },
    },
  },
  transpileDependencies: true,
});
