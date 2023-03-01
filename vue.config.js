const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true
})
module.exports = {
  // publicPath: './',
  // 配置跨域
  devServer: {
    // 后端地址
    proxy: {
      '^/api': {
        target: 'http://127.0.0.1:8000', //请求接口域名 
        ws: true,
        host: '192.168.31.83',
        port: 8080,
        client: {
          webSocketURL: 'ws://192.168.31.83:8080/ws',
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
