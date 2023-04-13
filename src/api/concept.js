// 测试接口封装
import request from "../utils/request";


export const getAllBKGNInfo = () => request({
    method: "GET",
    url: "getallbkgn/"
})
export const updateGNLevel = (bk_code, val) => request({
    method: 'GET',
    url: `bkupdategn/?zycd=${val}&bk_code=${bk_code}`,
})
export const updateGNItemStatus = (bk_code, ts_code, status) => request({
    method: 'GET',
    url: `bkupdateGnstock/?bk_code=${bk_code}&ts_code=${ts_code}&status=${status}`
})