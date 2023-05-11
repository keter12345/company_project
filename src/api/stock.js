// 测试接口封装
import request from "../utils/request";

export const getZbStockInfo = (tablename) => request({
    method: 'GET',
    url: `stockshow_zb/?tablename=${tablename}`
})
export const getCkStockInfo = (tablename) => request({
    method: 'GET',
    url: `stockshow_ck/?tablename=${tablename}`
})


