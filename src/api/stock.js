// 测试接口封装
import request from "../utils/request";
export const getFileInfo = () => request({
    method: "GET",
    url: "getSysShow/"
})

export const updateFilInfo = (ids) => request({
    method: "GET",
    url: `updateSysshow/?ids=${ids}`
})
export const getZbStockInfo = () => request({
    method: 'GET',
    url: 'stockshow_zb/'
})
export const getCkStockInfo = () => request({
    method: 'GET',
    url: 'stockshow_ck/'
})


