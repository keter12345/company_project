const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true
})
module.exports = {
  // publicPath: './',
  // 配置跨域
  devServer: {
    historyApiFallback: true,
    // 后端地址
    proxy: {
      '^/api': {
        target: 'http://0.0.0.0:8000', //请求接口域名 
        ws: true,
        host: '192.168.31.83',
        port: 8060,
        client: {
          webSocketURL: 'ws://192.168.31.83:8060/ws',
        },
        secure: false,
        changOrigin: true, //是否允许跨越
        pathRewrite: {
          '^/api': ''
        }
      }
    },
  },

  transpileDependencies: true

}
