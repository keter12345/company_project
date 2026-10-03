import request from "../utils/request";

// ==================== 实时股票主营业务接口封装 ====================
// 获取所有实时股票主营业务数据
export const getAllRtStockZy = (searchParams) => request({
    method: 'GET',
    url: '/rt_stock_zy/get_all/',
    params: {
        ts_code: searchParams?.ts_code,
        ts_name: searchParams?.ts_name,
        zy: searchParams?.zy,
        start_date: searchParams?.date_range ? searchParams.date_range[0] : '',
        end_date: searchParams?.date_range ? searchParams.date_range[1] : '',
        is_new: searchParams?.is_new === 'all' ? undefined : (searchParams?.is_new || 'old')
    }
});
// 添加实时股票主营业务
export const addRtStockZy = (data) => request({
    method: 'GET',
    url: '/rt_stock_zy/add/',
    params: {
        ...data,
        is_new: data.is_new
    },
});
// 更新实时股票主营业务
export const updateRtStockZy = (id, data) => request({
    method: 'GET',
    url: '/rt_stock_zy/update/',
    params: {
        id,
        ...data,
        is_new: data.is_new || 'old'
    },
});
// 删除实时股票主营业务
export const deleteRtStockZy = (id, is_new) => request({
    method: 'GET',
    url: '/rt_stock_zy/delete/',
    params: { id, is_new },
});