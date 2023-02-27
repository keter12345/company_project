// 测试接口封装
import request from "../utils/request";

// 获取数据合集(分页)
export const getAllBGList = () => request({
    method: 'GET',
    url: 'getallbk/',
})

export const updateBGLevel = (id, val) => request({
    method: 'GET',
    url: `bkupdate/?zycd=${val}&id=${id}`,
})