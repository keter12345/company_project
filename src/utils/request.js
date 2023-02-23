import axios from "axios"

// axios二次封装
const request = axios.create({
    // 基础网址，接口统一前缀
    baseURL: "/",
    // 响应超时时间 
    timeout: 10000,
    // 定义统一的请求头
    headers: {
        'Content-Type':'application/json;charset=UTF-8'
    }
})
let loading=""


// 请求拦截器

export default request 