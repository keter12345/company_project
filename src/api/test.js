// 测试接口封装
import request from "../utils/request";

// 获取数据合集(分页)
export const getList = (params = {}) => request({
    method: 'GET',
    url: '/...?limit=10',
    params,
})

// 获取单个数据
export const getItem = (id) => request({
    method: 'GET',
    url: `/..?id=${id}`,

})

// 修改数据信息
export const updateItem = (id, data) => request({
    method: 'PUT',
    url: `/../${id}`,
    data

})