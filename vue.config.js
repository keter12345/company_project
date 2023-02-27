const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true
})
module.exports = {

  // 关闭语法检查
  lintOnSave: false,
  // 配置跨域
  // devServer: {
  //   open: true,
  //   // 后端地址
  //   proxy: {
  //     '/api': {
  //       target: 'http://********', //请求接口域名 
  //       ws: true,
  //       secure: false,
  //       changOrigin: true, //是否允许跨越
  //       pathRewrite: {
  //         '^/api': ''
  //       }
  //     }
  //   }
  // },
  // before: app => { }
}
