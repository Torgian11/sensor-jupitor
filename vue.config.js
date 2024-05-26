const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  chainWebpack: (config) => {
    config.plugin("define").tap((args) => {
      args[0]["__VUE_PROD_HYDRATION_MISMATCH_DETAILS__"] = true;
      args[0]["__VUE_EXPERIMENTAL_SUSPENSE__"] = true;
      return args;
    });
  },
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
