// 测试接口封装
import request from "../utils/request";

// 获取数据合集(分页)
export const getAllBGList = () => request({
    method: 'GET',
    url: 'getallbk/',
})

export const updateBGLevel = (bk_code, val) => request({
    method: 'GET',
    url: `bkupdate/?zycd=${val}&bk_code=${bk_code}`,
})

export const updateItemStatus = (bk_code, ts_code, status) => request({
    method: '',
    url: `bkupdateHystock/?bk_code=${bk_code}&ts_code=${ts_code}&status=${status}`
})