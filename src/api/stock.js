// 测试接口封装
import request from "../utils/request";

export const getZbStockInfo = (tablename,is_test) => request({
    method: 'GET',
    url: `stockshow_zb/?tablename=${tablename}&is_test=${is_test}`
})
export const getCkStockInfo = (tablename,is_test) => request({
    method: 'GET',
    url: `stockshow_ck/?tablename=${tablename}&is_test=${is_test}`
})


export const getAllStockInfo = (tablename,is_test) => request({
    method: 'GET',
    url: `stockshow_all/?tablename=${tablename}&is_test=${is_test}`
})

export const getAllStockHyInfo = (ts_code,countnum,is_test) => request({
    method: 'GET',
    url: `stockshow_hy_ztstock/?ts_code=${ts_code}&is_test=${is_test}&countnum=${countnum}`
})

export const getAllStockGnInfo = (ts_code,countnum,is_test) => request({
    method: 'GET',
    url: `stockshow_gn_ztstock/?ts_code=${ts_code}&is_test=${is_test}&countnum=${countnum}`
})

